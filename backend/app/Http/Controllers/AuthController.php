<?php

namespace App\Http\Controllers;

use App\Models\EventoSeguridad;
use App\Models\IntentoAutenticacion;
use App\Models\SeguridadUsuario;
use App\Models\Usuario;
use App\Services\AutorizacionService;
use App\Services\NotificacionesCorreo;
use App\Services\SecretoService;
use App\Services\TokenAccesoService;
use App\Services\TotpService;
use App\Support\Schema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Autenticación VisualGas (FASE C) — coherente con 01_seguridad.sql:
 *
 * - Login: correo+contraseña → bloqueo 423 / desafío 2FA / token definitivo.
 * - El TRIGGER nativo de la BD (fn_intentos_bloqueo) gestiona contadores y
 *   bloqueo; el backend SÓLO ESCRIBE BITÁCORA (no duplica la regla S03).
 * - 2FA: TOTP (secret cifrado) o código BACKUP de codigos_temporales (un uso).
 * - Pregunta secreta: NO sustituye el 2FA; se utiliza en la recuperación.
 */
class AuthController extends Controller
{
    private const DESAFIO_TTL_SEGUNDOS = 300;

    public function __construct(
        private TotpService $totp,
        private SecretoService $secretos,
        private TokenAccesoService $tokens,
        private AutorizacionService $autorizacion,
        private NotificacionesCorreo $correos,
    ) {}

    /* ===================================================================== */
    /* POST /api/auth/login                                                  */
    /* ===================================================================== */
    public function iniciarSesion(Request $request): JsonResponse
    {
        $validado = Validator::make($request->all(), [
            'correo' => ['required', 'email', 'max:120'],
            'contrasena' => ['required', 'string', 'max:255'],
        ])->validated();

        $correo = strtolower(trim($validado['correo']));
        $ip = $request->ip();
        $agente = (string) $request->userAgent();

        /* 1. Bloqueo temporal vigente (antes de verificar credenciales) */
        $usuario = Usuario::query()->where('correo', $correo)->first();

        if ($usuario && $usuario->bloqueado_hasta && $usuario->bloqueado_hasta->isFuture()) {
            $this->registrarIntento($usuario->id, $correo, 'BLOQUEADO', $ip, $agente);

            return response()->json([
                'message' => 'Cuenta bloqueada temporalmente por intentos fallidos.',
                'bloqueado_hasta' => $usuario->bloqueado_hasta->toISOString(),
            ], 423);
        }

        /* 2. Verificación de credenciales (hash; nunca comparación en claro) */
        if (! $usuario || ! $usuario->activo || ! Hash::check($validado['contrasena'], $usuario->contrasena_hash)) {
            $this->registrarIntento($usuario?->id, $correo, 'FALLIDO', $ip, $agente);

            $mensaje = $usuario && ! $usuario->activo
                ? 'Cuenta deshabilitada. Contacte al administrador.'
                : 'Credenciales incorrectas.';

            return response()->json(['message' => $mensaje], 401);
        }

        /* 3. Segundo factor (TOTP habilitado por usuario) */
        $seguridad = SeguridadUsuario::query()->where('usuario_id', $usuario->id)->first();

        if ($seguridad && $seguridad->totp_habilitado && $seguridad->totp_secreto_cifrado) {
            $desafio = bin2hex(random_bytes(32));

            Cache::store('file')->put(
                $this->claveDesafio($desafio),
                $usuario->id,
                self::DESAFIO_TTL_SEGUNDOS,
            );

            $this->registrarIntento($usuario->id, $correo, 'TOTP_PENDIENTE', $ip, $agente);

            return response()->json([
                'status' => 'TOTP_REQUERIDO',
                'desafio' => $desafio,
                'expiracion_minutos' => (int) ceil(self::DESAFIO_TTL_SEGUNDOS / 60),
            ], 200);
        }

        /* 4. Token definitivo (sin 2FA) */
        return response()->json($this->emitirSesion($usuario, $ip, $agente), 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/2fa                                                    */
    /* ===================================================================== */
    public function verificar2FA(Request $request): JsonResponse
    {
        $validado = Validator::make($request->all(), [
            'desafio' => ['required', 'string', 'regex:/^[0-9a-f]{64}$/'],
            'codigo' => ['required', 'string', 'max:12'],
        ])->validated();

        $usuarioId = Cache::store('file')->pull($this->claveDesafio($validado['desafio']));

        if (! $usuarioId) {
            return response()->json([
                'message' => 'Desafío inválido o expirado. Inicie sesión nuevamente.',
            ], 401);
        }

        $usuario = Usuario::query()->findOrFail((int) $usuarioId);
        $seguridad = SeguridadUsuario::query()->where('usuario_id', $usuario->id)->first();

        if (! $seguridad || ! $seguridad->totp_habilitado || ! $seguridad->totp_secreto_cifrado) {
            return response()->json(['message' => 'El segundo factor no está activo para este usuario.'], 409);
        }

        $verificado = false;

        /* 1. TOTP determinístico */
        $secreto = $this->secretos->descifrarSecretoTotp((string) $seguridad->totp_secreto_cifrado);
        if ($secreto) {
            $verificado = $this->totp->verificar(
                $secreto,
                (string) $validado['codigo'],
                (string) $seguridad->totp_algoritmo,
                (int) $seguridad->totp_periodo_segundos,
                (int) $seguridad->totp_digitos,
            );
        }

        /* 2. Código de respaldo de única táctica (uso máximo 1, registrado) */
        if (! $verificado) {
            $verificado = $this->consumirCodigoRespaldo($usuario->id, (string) $validado['codigo']);
        }

        if (! $verificado) {
            $this->registrarIntento($usuario->id, $usuario->correo, 'TOTP_FALLIDO', $request->ip(), (string) $request->userAgent());

            EventoSeguridad::create([
                'usuario_id' => $usuario->id,
                'tipo_evento' => 'ACCESO_DENEGADO',
                'descripcion' => 'Código de segundo factor inválido.',
                'severidad' => 'ADVERTENCIA',
                'direccion_ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Código inválido o vencido.'], 422);
        }

        /* El desafío fue consumido (pull) → no reutilizable */
        $this->registrarIntento($usuario->id, $usuario->correo, 'EXITOSO', $request->ip(), (string) $request->userAgent());

        return response()->json($this->emitirSesion($usuario, $request->ip(), (string) $request->userAgent()), 200);
    }

    /* ===================================================================== */
    /* GET /api/auth/me                                                      */
    /* ===================================================================== */
    public function yo(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        if (! $usuario instanceof Usuario) {
            return response()->json(['message' => 'Sesión inválida.'], 401);
        }

        return response()->json($this->contextoSesion($usuario), 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/logout (revoca el token actual)                        */
    /* ===================================================================== */
    public function cerrarSesion(Request $request): JsonResponse
    {
        $tokenRow = $request->attributes->get('visualgas_token');
        $usuario = $request->attributes->get('visualgas_usuario');

        if ($tokenRow && $usuario instanceof Usuario) {
            DB::table(Schema::t('tokens_autenticacion'))
                ->where('id', $tokenRow->id)
                ->whereNull('revocado_en')
                ->update(['revocado_en' => now()]);

            EventoSeguridad::create([
                'usuario_id' => $usuario->id,
                'tipo_evento' => 'CIERRE_SESION',
                'descripcion' => 'Cierre de sesión (token revocado).',
                'severidad' => 'INFO',
                'direccion_ip' => $request->ip(),
            ]);
        }

        return response()->json(['message' => 'Sesión cerrada correctamente.'], 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/perfil (personalización de cuenta)                     */
    /* ===================================================================== */
    public function actualizarPerfil(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        if (! $usuario instanceof Usuario) {
            return response()->json(['message' => 'Sesión inválida.'], 401);
        }

        $validado = Validator::make($request->all(), [
            'nombre_completo' => ['nullable', 'string', 'min:3', 'max:160'],
            'correo' => ['nullable', 'email:rfc', 'max:120'],
        ])->validated();

        if ($validado['nombre_completo'] === null && $validado['correo'] === null) {
            return response()->json(['message' => 'Nada que actualizar.'], 422);
        }

        if ($validado['correo'] !== null) {
            $correo = strtolower(trim((string) $validado['correo']));
            $titular = Usuario::query()->where('correo', $correo)->first();

            if ($titular && (int) $titular->id !== (int) $usuario->id) {
                return response()->json(['message' => 'Otro usuario ya usa ese correo.'], 409);
            }
        }

        $campos = [];
        if ($validado['nombre_completo'] !== null) {
            $campos['nombre_completo'] = trim((string) $validado['nombre_completo']);
        }
        if ($validado['correo'] !== null) {
            $campos['correo'] = strtolower(trim((string) $validado['correo']));
        }

        DB::table(Schema::t('usuarios'))
            ->where('id', $usuario->id)
            ->where('activo', true)
            ->update($campos + ['actualizado_en' => now()]);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'usuario' => $this->contextoSesion($usuario)['usuario'],
        ], 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/cambiar-contrasena (sesión vigente)                    */
    /* ===================================================================== */
    public function cambiarContrasena(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        $tokenRow = $request->attributes->get('visualgas_token');

        if (! $usuario instanceof Usuario) {
            return response()->json(['message' => 'Sesión inválida.'], 401);
        }

        $validado = Validator::make($request->all(), [
            'actual' => ['required', 'string', 'max:255'],
            'nueva' => ['required', 'string', 'min:8', 'max:255', 'different:actual'],
            'confirmacion' => ['nullable', 'string', 'same:nueva'],
        ])->validated();

        if (! Hash::check((string) $validado['actual'], $usuario->contrasena_hash)) {
            return response()->json(['message' => 'La contraseña actual no coincide.'], 422);
        }

        /* Comprueba también que la nueva no viole el CHECK nativo de la tabla. */
        if (strlen((string) $validado['nueva']) < 8) {
            return response()->json(['message' => 'La nueva contraseña es demasiado corta.'], 422);
        }

        DB::transaction(function () use ($usuario, $tokenRow, $validado) {
            DB::table(Schema::t('usuarios'))
                ->where('id', $usuario->id)
                ->update([
                    'contrasena_hash' => Hash::make((string) $validado['nueva']),
                    /* Password temporal de cuentas nuevas liquidada (FASE F). */
                    'requiere_cambio_contrasena' => false,
                    'actualizado_en' => now(),
                ]);

            /* Revoca el resto de sesiones; la vigente se conserva. */
            DB::table(Schema::t('tokens_autenticacion'))
                ->where('usuario_id', $usuario->id)
                ->whereNull('revocado_en')
                ->when($tokenRow, fn ($q) => $q->where('id', '!=', $tokenRow->id))
                ->update(['revocado_en' => now()]);

            EventoSeguridad::create([
                'usuario_id' => $usuario->id,
                'tipo_evento' => 'CONTRASENA_ACTUALIZADA',
                'descripcion' => 'Contraseña actualizada desde la sesión; otras sesiones revocadas.',
                'severidad' => 'ADVERTENCIA',
                'direccion_ip' => null,
            ]);
        });

        /* Aviso por correo (HTTP si VISUALGAS_MAIL_API_URL; log si no). */
        $this->correos->contrasenaActualizada($usuario->correo, $usuario->nombre_completo);

        return response()->json([
            'message' => 'Contraseña actualizada. Las demás sesiones fueron cerradas.',
        ], 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/2fa/preparar — activa el setup del segundo factor      */
    /* (cuentas nuevas y usuarios voluntarios que aún no lo tienen)          */
    /* ===================================================================== */
    public function preparar2FA(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        if (! $usuario instanceof Usuario) {
            return response()->json(['message' => 'Sesión inválida.'], 401);
        }

        if ($usuario->requiere_cambio_contrasena) {
            return response()->json([
                'message' => 'Cambia primero tu contraseña temporal antes de activar el segundo factor.',
            ], 409);
        }

        $seguridad = SeguridadUsuario::query()->where('usuario_id', $usuario->id)->first();

        if ($seguridad && $seguridad->totp_habilitado) {
            return response()->json(['message' => 'El segundo factor ya está activo.'], 409);
        }

        if (! $seguridad) {
            /* Usuario sin fila de seguridad: se crea con secreto pendiente. */
            $seguridad = SeguridadUsuario::query()->create([
                'usuario_id' => $usuario->id,
                'totp_habilitado' => false,
                'totp_secreto_cifrado' => $this->secretos->cifrarSecretoTotp($this->totp->generarSecretoBase32()),
            ]);
        }

        if (! $seguridad->totp_secreto_cifrado) {
            $seguridad->totp_secreto_cifrado = $this->secretos->cifrarSecretoTotp($this->totp->generarSecretoBase32());
            $seguridad->actualizado_en = now();
            $seguridad->save();
        }

        $secreto = $this->secretos->descifrarSecretoTotp((string) $seguridad->totp_secreto_cifrado);
        $etiqueta = rawurlencode('VisualGas: '.$usuario->correo);
        $parametros = http_build_query([
            'secret' => $secreto,
            'issuer' => 'VisualGas',
            'algorithm' => 'SHA1',
            'digits' => (int) $seguridad->totp_digitos,
            'period' => (int) $seguridad->totp_periodo_segundos,
        ]);

        return response()->json([
            'secreto' => $secreto,
            'otpauth_uri' => "otpauth://totp/{$etiqueta}?{$parametros}",
            'app_referencias' => ['Google Authenticator', 'Microsoft Authenticator', 'Authy'],
        ], 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/2fa/activar — confirma el código TOTP y habilita        */
    /* ===================================================================== */
    public function activar2FA(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        if (! $usuario instanceof Usuario) {
            return response()->json(['message' => 'Sesión inválida.'], 401);
        }

        $validado = Validator::make($request->all(), [
            'codigo' => ['required', 'string', 'max:12'],
        ])->validated();

        $seguridad = SeguridadUsuario::query()->where('usuario_id', $usuario->id)->first();

        if (! $seguridad || ! $seguridad->totp_secreto_cifrado) {
            return response()->json(['message' => 'Primero prepara el segundo factor (/auth/2fa/preparar).'], 409);
        }

        if ($seguridad->totp_habilitado) {
            return response()->json(['message' => 'El segundo factor ya está activo.'], 409);
        }

        $secreto = $this->secretos->descifrarSecretoTotp((string) $seguridad->totp_secreto_cifrado);

        if (! $secreto || ! $this->totp->verificar($secreto, (string) $validado['codigo'], (string) $seguridad->totp_algoritmo, (int) $seguridad->totp_periodo_segundos, (int) $seguridad->totp_digitos)) {
            $this->registrarIntento($usuario->id, $usuario->correo, 'TOTP_FALLIDO', $request->ip(), (string) $request->userAgent());

            return response()->json(['message' => 'Código inválido. Verifica en tu app e intenta otra vez.'], 422);
        }

        $seguridad->totp_habilitado = true;
        $seguridad->actualizado_en = now();
        $seguridad->save();

        EventoSeguridad::create([
            'usuario_id' => $usuario->id,
            'tipo_evento' => 'TOTP_CONFIGURADO',
            'descripcion' => 'Segundo factor (TOTP) activado desde la configuración de cuenta.',
            'severidad' => 'INFO',
            'direccion_ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'El segundo factor quedó activado.',
            'totp_configurado' => true,
        ], 200);
    }

    /* ===================================================================== */
    /* Internos                                                              */
    /* ===================================================================== */
    private function emitirSesion(Usuario $usuario, ?string $ip, string $agente): array
    {
        $tokenClaro = $this->tokens->emitir($usuario, $ip, $agente);

        $this->registrarIntento($usuario->id, $usuario->correo, 'EXITOSO', $ip, $agente);
        $this->tokens->evento($usuario->id, 'INICIO_SESION', 'Inicio de sesión exitoso.', $ip, $agente);

        return $this->contextoSesion($usuario, $tokenClaro);
    }

    /** Formato único de sesión (login, 2FA y /auth/me). */
    public function contextoSesion(Usuario $usuario, ?string $tokenClaro = null): array
    {
        $seguridad = SeguridadUsuario::query()->where('usuario_id', $usuario->id)->first();

        return [
            'status' => 'OK',
            'token' => $tokenClaro,
            'inactividad_minutos' => $this->inactividadMaxima($usuario->id),
            'usuario' => [
                'id' => $usuario->id,
                'name' => $usuario->nombre_completo,
                'email' => $usuario->correo,
                'roles' => $this->autorizacion->roles((int) $usuario->id),
                'empresas' => $this->autorizacion->empresas((int) $usuario->id),
                /* Seguridad de cuentas nuevas (FASE F): forzar password + 2FA. */
                'requiere_cambio_contrasena' => (bool) $usuario->requiere_cambio_contrasena,
                /* 2FA pendiente = fila de seguridad con TOTP sin activar
                   (sólo cuentan cuentas nuevas; usuarios previos sin fila no). */
                'totp_pendiente' => $seguridad !== null && ! $seguridad->totp_habilitado,
                'totp_configurado' => $seguridad !== null && $seguridad->totp_habilitado,
            ],
            'modulos' => $this->modulosEfectivos($usuario->id),
        ];
    }

    /** @return string[] slugs (dash) de módulos con acceso efectivo (A06). */
    public function modulosEfectivos(int $usuarioId): array
    {
        return array_map(
            static fn (object $modulo) => $modulo->slug,
            array_values(array_filter(
                $this->autorizacion->modulosEfectivos($usuarioId),
                static fn (object $modulo) => $modulo->habilitado,
            )),
        );
    }

    /** Límite de inactividad configurado por usuario (S05: 5–480 min). */
    private function inactividadMaxima(int $usuarioId): int
    {
        $minutos = SeguridadUsuario::query()
            ->where('usuario_id', $usuarioId)
            ->value('inactividad_max_minutos');

        return (int) ($minutos ?? 30);
    }

    private function registrarIntento(?int $usuarioId, string $correo, string $resultado, ?string $ip, ?string $agente): void
    {
        IntentoAutenticacion::create([
            'usuario_id' => $usuarioId,
            'correo_intentado' => $correo,
            'resultado' => $resultado,
            'direccion_ip' => $ip,
            'agente_usuario' => $agente,
        ]);
    }

    private function consumirCodigoRespaldo(int $usuarioId, string $codigo): bool
    {
        $hash = hash('sha256', strtoupper(trim($codigo)));

        $filas = DB::table(Schema::t('codigos_temporales'))
            ->where('usuario_id', $usuarioId)
            ->where('proposito', '2FA_BACKUP')
            ->whereNull('usado_en')
            ->get();

        foreach ($filas as $fila) {
            $vigente = strtotime((string) $fila->expiracion) > time();
            $usoDisponible = (int) $fila->usos_realizados < (int) $fila->uso_maximo;

            if ($vigente && $usoDisponible && hash_equals((string) $fila->codigo_hash, $hash)) {
                DB::table(Schema::t('codigos_temporales'))
                    ->where('id', $fila->id)
                    ->update([
                        'usado_en' => now(),
                        'usos_realizados' => DB::raw('usos_realizados + 1'),
                    ]);

                return true;
            }
        }

        return false;
    }

    private function claveDesafio(string $desafio): string
    {
        return 'vg:desafio:'.hash('sha1', (string) $desafio);
    }
}
