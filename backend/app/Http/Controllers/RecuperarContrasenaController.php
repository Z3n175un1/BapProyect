<?php

namespace App\Http\Controllers;

use App\Models\EventoSeguridad;
use App\Models\SeguridadUsuario;
use App\Models\TokenRecuperacion;
use App\Models\Usuario;
use App\Services\SecretoService;
use App\Support\Schema;
use App\Services\TokenAccesoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

/**
 * Recuperación de contraseña (FASE C) — coherente con 01_seguridad.sql:
 *
 * - Tokens de un solo uso (hash sha256, expiración corta, consumo UPDATE).
 * - SIN enumeración de cuentas: la respuesta de "solicitar" es idéntica
 *   exista o no el correo; el correo real solo se envía si existe.
 * - Verificación ADICIONAL: respuesta secreta (HMAC-SHA256, S04).
 * - Tras cambiar contraseña se revocan TODAS las sesiones del usuario.
 */
class RecuperarContrasenaController extends Controller
{
    /** Token reutilizable durante: 15 minutos (política conservadora documentada). */
    private const TTL_TOKEN = 15;

    public function __construct(
        private SecretoService $secretos,
        private TokenAccesoService $tokens,
    ) {}

    /* ===================================================================== */
    /* POST /api/auth/recuperar/solicitar                                    */
    /* ===================================================================== */
    public function solicitar(Request $request): JsonResponse
    {
        $validado = Validator::make($request->all(), [
            'correo' => ['required', 'email', 'max:120'],
        ])->validated();

        $correo = strtolower(trim($validado['correo']));
        $usuario = Usuario::query()->where('correo', $correo)->first();

        if ($usuario && $usuario->activo) {
            $this->emitirTokenRecuperacion($usuario, $request->ip());
        }

        /* Respuesta idéntica exista o no el correo (sin enumeración) */
        return response()->json([
            'message' => 'Si el correo existe, enviamos las instrucciones para restablecer la contraseña.',
        ], 200);
    }

    /* ===================================================================== */
    /* POST /api/auth/recuperar/restablecer                                  */
    /* ===================================================================== */
    public function restablecer(Request $request): JsonResponse
    {
        $validado = Validator::make($request->all(), [
            'correo' => ['required', 'email', 'max:120'],
            'token' => ['required', 'string', 'regex:/^[0-9a-f]{64}$/'],
            'respuesta_secreta' => ['required', 'string', 'max:255'],
            'contrasena' => ['required', 'string', 'min:8', 'max:64', 'confirmed'],
        ])->validated();

        $usuario = Usuario::query()
            ->where('correo', strtolower(trim($validado['correo'])))
            ->where('activo', true)
            ->first();

        $tokenFila = $usuario ? $this->tokenVigente($usuario, $validado['token']) : null;

        if (! $usuario || ! $tokenFila) {
            EventoSeguridad::create([
                'usuario_id' => $usuario?->id,
                'tipo_evento' => 'ACCESO_DENEGADO',
                'descripcion' => 'Restablecimiento con token inválido, vencido o usado.',
                'severidad' => 'ADVERTENCIA',
                'direccion_ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'Token inválido o vencido. Solicite uno nuevo.',
            ], 422);
        }

        /* Verificación adicional: respuesta secreta (1:1 en seguridad_usuarios) */
        $seguridad = SeguridadUsuario::query()->where('usuario_id', $usuario->id)->first();
        $hashGuardado = (string) ($seguridad?->respuesta_secreta_hash ?? '');

        if ($hashGuardado === '' || ! $this->secretos->verificarRespuesta($validado['respuesta_secreta'], $hashGuardado)) {
            EventoSeguridad::create([
                'usuario_id' => $usuario->id,
                'tipo_evento' => 'ACCESO_DENEGADO',
                'descripcion' => 'Restablecimiento denegado: respuesta secreta incorrecta.',
                'severidad' => 'ADVERTENCIA',
                'direccion_ip' => $request->ip(),
            ]);

            return response()->json([
                'message' => 'La respuesta secreta no coincide.',
            ], 422);
        }

        /* Cambio de contraseña + invalidación de todas las sesiones activas */
        DB::transaction(function () use ($usuario, $tokenFila, $validado, $request) {
            Usuario::query()
                ->where('id', $usuario->id)
                ->update([
                    'contrasena_hash' => Hash::make($validado['contrasena']),
                    'requiere_cambio_contrasena' => false,
                    'bloqueado_hasta' => null,
                    'actualizado_en' => now(),
                ]);

            DB::table(Schema::t('tokens_recuperacion'))
                ->where('id', $tokenFila->id)
                ->update(['usado_en' => now(), 'usado_desde' => $request->ip()]);
        });

        $this->tokens->revocarTodos($usuario->id, 'Contraseña restablecida');

        EventoSeguridad::create([
            'usuario_id' => $usuario->id,
            'tipo_evento' => 'CONTRASENA_ACTUALIZADA',
            'descripcion' => 'Contraseña restablecida mediante token de recuperación.',
            'severidad' => 'ADVERTENCIA',
            'direccion_ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada. Inicie sesión con su nueva contraseña.',
        ], 200);
    }

    /* ===================================================================== */
    /* Internos                                                              */
    /* ===================================================================== */
    private function emitirTokenRecuperacion(Usuario $usuario, ?string $ip): void
    {
        $tokenClaro = bin2hex(random_bytes(32));

        TokenRecuperacion::create([
            'usuario_id' => $usuario->id,
            'proposito' => 'RECUPERACION_CONTRASENA',
            'token_hash' => hash('sha256', $tokenClaro),
            'expiracion' => now()->addMinutes(self::TTL_TOKEN),
            'usado_en' => null,
            'usado_desde' => null,
        ]);

        $enlace = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/')
            .'/#/recuperar-contrasena?token='.$tokenClaro.'&correo='.urlencode($usuario->correo);

        /* MAIL_MAILER=log en desarrollo: el mensaje queda en storage/logs */
        Mail::raw(
            "VisualGas — restablecimiento de contraseña\n\n"
            ."Abra este enlace (vence en ".self::TTL_TOKEN." minutos):\n{$enlace}\n\n"
            .'Si no solicitó el cambio, ignore este mensaje.',
            function ($mensaje) use ($usuario) {
                $mensaje->to($usuario->correo)->subject('VisualGas — restablecer contraseña');
            },
        );

        EventoSeguridad::create([
            'usuario_id' => $usuario->id,
            'tipo_evento' => 'RECUPERACION_SOLICITADA',
            'descripcion' => 'Solicitud de restablecimiento; token enviado por correo.',
            'severidad' => 'INFO',
            'direccion_ip' => $ip,
        ]);
    }

    private function tokenVigente(Usuario $usuario, string $tokenClaro): ?object
    {
        return DB::table(Schema::t('tokens_recuperacion'))
            ->where('usuario_id', $usuario->id)
            ->where('token_hash', hash('sha256', $tokenClaro))
            ->where('proposito', 'RECUPERACION_CONTRASENA')
            ->whereNull('usado_en')
            ->where('expiracion', '>', now())
            ->first();
    }
}
