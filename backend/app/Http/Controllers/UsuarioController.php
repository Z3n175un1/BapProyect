<?php

namespace App\Http\Controllers;

use App\Models\SeguridadUsuario;
use App\Models\Usuario;
use App\Services\AutorizacionService;
use App\Services\NotificacionesCorreo;
use App\Services\SecretoService;
use App\Services\TotpService;
use App\Support\Schema;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * CRUD de usuarios del módulo `usuarios_activos` (FASE F).
 *
 * - Alcance (A07): el administrador gestiona usuarios de SUS empresas
 *   (usuario_empresa común) — no ve ni toca usuarios de otras.
 * - El propio administrador queda excluido del listado y NO puede darse
 *   de baja a sí mismo (A04 extendido al flujo de usuarios).
 * - Cuenta nueva: contraseña temporal generada por el backend (nunca elegida
 *   por el admin) + 2FA PENDIENTE (secreto TOTP generado, por activar) +
 *   requiere_cambio_contrasena=true → el usuario completa la seguridad en
 *   su primer inicio de sesión.
 * - "Dar de baja" = activo=false (pensado: sin DELETE de usuarios).
 */
class UsuarioController extends Controller
{
    private const LIMITE_LISTA = 200;

    public function __construct(
        private TotpService $totp,
        private SecretoService $secretos,
        private AutorizacionService $autorizacion,
        private NotificacionesCorreo $correos,
    ) {}

    private const LONGITUD_CLAVE_TEMPORAL = 16;

    /* ===================================================================== */
    /* GET /api/usuarios-activos                                             */
    /* ===================================================================== */
    public function listar(Request $request): JsonResponse
    {
        $proteccion = $this->guardaAdmin($request);
        if ($proteccion !== null) {
            return $proteccion;
        }
        $admin = $request->attributes->get('visualgas_usuario');

        $validado = Validator::make($request->query(), [
            'busqueda' => ['nullable', 'string', 'max:80'],
        ])->validated() + ['busqueda' => trim((string) $request->query('busqueda', ''))];

        $idsEmpresas = $this->idsEmpresasAdmin($admin);

        if ($idsEmpresas === []) {
            return response()->json(['message' => 'No administras ninguna empresa.', 'usuarios' => []]);
        }

        $consulta = DB::table(Schema::t('usuario_empresa').' as ue')
            ->join(Schema::t('usuarios').' as u', 'u.id', '=', 'ue.usuario_id')
            ->leftJoin(Schema::t('usuario_roles').' as ur', 'ur.usuario_id', '=', 'u.id')
            ->leftJoin(Schema::t('roles').' as r', 'r.id', '=', 'ur.rol_id')
            ->leftJoin(Schema::t('empresas').' as e', 'e.id', '=', 'ue.empresa_id')
            ->whereIn('ue.empresa_id', $idsEmpresas)
            ->where('ue.activo', true)
            ->where('u.id', '!=', (int) $admin->id)
            ->groupBy('u.id', 'u.nombre_completo', 'u.correo', 'u.activo', 'u.requiere_cambio_contrasena', 'u.ultimo_acceso_en', 'u.creado_en')
            ->orderBy('u.nombre_completo')
            ->select(
                'u.id',
                'u.nombre_completo',
                'u.correo',
                'u.activo',
                'u.requiere_cambio_contrasena',
                'u.ultimo_acceso_en',
                'u.creado_en',
                DB::raw("string_agg(DISTINCT coalesce(r.codigo, ''), ',') AS roles"),
                DB::raw('array_agg(DISTINCT e.razon_social) as empresas'),
                DB::raw('count(DISTINCT ue.empresa_id) as empresas_comunes'),
            );

        if ($validado['busqueda'] !== '') {
            $consulta->where(function ($filtro) use ($validado) {
                $filtro->where('u.nombre_completo', 'ilike', '%'.$validado['busqueda'].'%')
                    ->orWhere('u.correo', 'ilike', '%'.$validado['busqueda'].'%');
            });
        }

        $usuarios = $consulta->limit(self::LIMITE_LISTA)->get()->all();

        return response()->json([
            'ambito' => $this->autorizacion->empresas((int) $admin->id),
            'total' => count($usuarios),
            'usuarios' => array_map(static fn (object $u): array => [
                'id' => (int) $u->id,
                'nombre_completo' => (string) $u->nombre_completo,
                'correo' => (string) $u->correo,
                'activo' => (bool) $u->activo,
                'requiere_cambio_contrasena' => (bool) $u->requiere_cambio_contrasena,
                'roles' => array_values(array_filter(explode(',', (string) $u->roles))),
                'empresas' => array_values((array) $u->empresas),
                'ultimo_acceso_en' => $u->ultimo_acceso_en,
                'creado_en' => (string) $u->creado_en,
            ], $usuarios),
        ]);
    }

    /* ===================================================================== */
    /* GET /api/usuarios-activos/roles (catálogo para el selector)           */
    /* ===================================================================== */
    public function roles(Request $request): JsonResponse
    {
        $proteccion = $this->guardaAdmin($request);
        if ($proteccion !== null) {
            return $proteccion;
        }

        $roles = DB::table(Schema::t('roles'))
            ->orderBy('id')
            ->get(['codigo', 'nombre', 'descripcion'])
            ->all();

        return response()->json(['roles' => array_map(static fn (object $r) => [
            'codigo' => (string) $r->codigo,
            'nombre' => (string) $r->nombre,
            'descripcion' => $r->descripcion,
        ], $roles)]);
    }

    /* ===================================================================== */
    /* POST /api/usuarios-activos (crear cuenta nueva con 2FA pendiente)     */
    /* ===================================================================== */
    public function crear(Request $request): JsonResponse
    {
        $proteccion = $this->guardaAdmin($request);
        if ($proteccion !== null) {
            return $proteccion;
        }
        $admin = $request->attributes->get('visualgas_usuario');

        $validado = Validator::make($request->all(), [
            'nombre_completo' => ['required', 'string', 'min:3', 'max:160'],
            'correo' => ['required', 'email:rfc', 'max:120'],
            'rol_codigo' => ['required', 'string', 'max:32'],
        ])->validated();

        $correo = strtolower(trim((string) $validado['correo']));
        $idsEmpresasAdmin = $this->idsEmpresasAdmin($admin);

        if ($idsEmpresasAdmin === []) {
            return response()->json(['message' => 'No administras ninguna empresa.'], 403);
        }

        $existe = DB::table(Schema::t('usuarios'))->where('correo', $correo)->exists();
        if ($existe) {
            return response()->json(['message' => 'Ya existe un usuario con ese correo.'], 409);
        }

        $rol = DB::table(Schema::t('roles'))->where('codigo', $validado['rol_codigo'])->first();
        if (! $rol) {
            return response()->json(['message' => 'El rol indicado no existe.'], 422);
        }

        $contrasenaTemporal = $this->contrasenaAleatoria();

        $usuario = null;
        $secretoBase32 = '';
        $codigosRespaldo = [];

        DB::transaction(function () use ($validado, $correo, $rol, $contrasenaTemporal, $idsEmpresasAdmin, $admin, &$usuario, &$secretoBase32, &$codigosRespaldo) {
            $usuarioId = (int) DB::table(Schema::t('usuarios'))->insertGetId([
                'correo' => $correo,
                'nombre_completo' => trim((string) $validado['nombre_completo']),
                'contrasena_hash' => Hash::make($contrasenaTemporal, ['rounds' => 12]),
                'activo' => true,
                'requiere_cambio_contrasena' => true,
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]);

            /* Seguridad: TOTP GENERADO pero PENDIENTE de activación por el usuario. */
            $secretoBase32 = $this->totp->generarSecretoBase32();

            DB::table(Schema::t('seguridad_usuarios'))->insert([
                'usuario_id' => $usuarioId,
                'totp_habilitado' => false,
                'totp_secreto_cifrado' => $this->secretos->cifrarSecretoTotp($secretoBase32),
                'creado_en' => now(),
                'actualizado_en' => now(),
            ]);

            /* Códigos de respaldo de un solo uso (2FA_BACKUP). */
            for ($i = 0; $i < 8; $i++) {
                $codigo = strtoupper(str_replace('-', '', $this->contrasenaAleatoria(10)));
                $codigosRespaldo[] = $codigo;

                DB::table(Schema::t('codigos_temporales'))->insert([
                    'usuario_id' => $usuarioId,
                    'proposito' => '2FA_BACKUP',
                    'codigo_hash' => hash('sha256', $codigo),
                    'expiracion' => now()->addDays(90),
                    'uso_maximo' => 1,
                ]);
            }

            DB::table(Schema::t('usuario_roles'))->insert([
                'usuario_id' => $usuarioId,
                'rol_id' => (int) $rol->id,
                'asignado_por' => (int) $admin->id,
            ]);

            foreach ($idsEmpresasAdmin as $empresaId) {
                DB::table(Schema::t('usuario_empresa'))->insert([
                    'usuario_id' => $usuarioId,
                    'empresa_id' => $empresaId,
                    'principal' => true,
                    'activo' => true,
                ]);
            }

            $usuario = Usuario::query()->findOrFail($usuarioId);
        });

        /* Correo de bienvenida (HTTP si está VISUALGAS_MAIL_API_URL; log si no). */
        $this->correos->credencialesCuentaNueva(
            (string) $validado['nombre_completo'],
            $correo,
            $contrasenaTemporal,
            $codigosRespaldo,
            $secretoBase32,
        );

        return response()->json([
            'message' => 'Usuario creado con 2FA pendiente: comparte la contraseña temporal.',
            'usuario' => [
                'id' => (int) $usuario->id,
                'nombre_completo' => (string) $usuario->nombre_completo,
                'correo' => (string) $usuario->correo,
                'rol' => (string) $rol->codigo,
            ],
            /* Única vez: el administrador entrega la contraseña y los códigos. */
            'contrasena_temporal' => $contrasenaTemporal,
            'codigos_respaldo' => $codigosRespaldo,
            'secreto_totp' => $secretoBase32,
        ], 201);
    }

    /* ===================================================================== */
    /* PUT /api/usuarios-activos/{usuarioId} (editar)                        */
    /* ===================================================================== */
    public function editar(Request $request, int $usuarioId): JsonResponse
    {
        $proteccion = $this->guardaAdmin($request);
        if ($proteccion !== null) {
            return $proteccion;
        }
        $admin = $request->attributes->get('visualgas_usuario');

        $objetivo = $this->objetivoEnAlcance($admin, $usuarioId);
        if (! $objetivo) {
            return response()->json(['message' => 'Usuario fuera de tu ámbito de gestión.'], 403);
        }

        $validado = Validator::make($request->all(), [
            'nombre_completo' => ['nullable', 'string', 'min:3', 'max:160'],
            'correo' => ['nullable', 'email:rfc', 'max:120'],
            'rol_codigo' => ['nullable', 'string', 'max:32'],
        ])->validated();

        if ($validado['nombre_completo'] === null && $validado['correo'] === null && $validado['rol_codigo'] === null) {
            return response()->json(['message' => 'Nada que actualizar.'], 422);
        }

        if ($validado['correo'] !== null) {
            $correo = strtolower(trim((string) $validado['correo']));
            $titular = DB::table(Schema::t('usuarios'))->where('correo', $correo)->first();
            if ($titular && (int) $titular->id !== $usuarioId) {
                return response()->json(['message' => 'Otro usuario ya usa ese correo.'], 409);
            }
        }

        DB::transaction(function () use ($validado, $usuarioId) {
            $campos = [];
            if ($validado['nombre_completo'] !== null) $campos['nombre_completo'] = trim((string) $validado['nombre_completo']);
            if ($validado['correo'] !== null) $campos['correo'] = strtolower(trim((string) $validado['correo']));
            if ($campos !== []) {
                $campos['actualizado_en'] = now();
                DB::table(Schema::t('usuarios'))->where('id', $usuarioId)->update($campos);
            }

            if ($validado['rol_codigo'] !== null) {
                $rol = DB::table(Schema::t('roles'))->where('codigo', $validado['rol_codigo'])->first();
                if (! $rol) {
                    throw new \DomainException('El rol indicado no existe.');
                }
                DB::table(Schema::t('usuario_roles'))
                    ->where('usuario_id', $usuarioId)
                    ->update(['rol_id' => (int) $rol->id, 'actualizado_en' => now()]);
            }
        });

        return response()->json(['message' => 'Usuario actualizado correctamente.'], 200);
    }

    /* ===================================================================== */
    /* POST /api/usuarios-activos/{usuarioId}/estado (dar de baja/reactivar) */
    /* ===================================================================== */
    public function cambiarEstado(Request $request, int $usuarioId): JsonResponse
    {
        $proteccion = $this->guardaAdmin($request);
        if ($proteccion !== null) {
            return $proteccion;
        }
        $admin = $request->attributes->get('visualgas_usuario');

        $objetivo = $this->objetivoEnAlcance($admin, $usuarioId);
        if (! $objetivo) {
            return response()->json(['message' => 'Usuario fuera de tu ámbito de gestión.'], 403);
        }

        if ($usuarioId === (int) $admin->id) {
            return response()->json(['message' => 'No puedes cambiar tu propio estado de cuenta.'], 409);
        }

        $validado = Validator::make($request->all(), [
            'activo' => ['required', 'boolean'],
        ])->validated();

        DB::table(Schema::t('usuarios'))
            ->where('id', $usuarioId)
            ->update([
                'activo' => (bool) $validado['activo'],
                'actualizado_en' => now(),
            ]);

        if (! (bool) $validado['activo']) {
            /* Dar de baja: cierra también las sesiones activas del usuario. */
            DB::table(Schema::t('tokens_autenticacion'))
                ->where('usuario_id', $usuarioId)
                ->whereNull('revocado_en')
                ->update(['revocado_en' => now()]);
        }

        return response()->json([
            'message' => $validado['activo'] ? 'Usuario reactivado.' : 'Usuario dado de baja (sesiones cerradas).',
        ], 200);
    }

    /* ===================================================================== */
    /* GET /api/usuarios-activos/pdf (barryvdh/laravel-dompdf)               */
    /* ===================================================================== */
    public function pdf(Request $request): mixed
    {
        $proteccion = $this->guardaAdmin($request);
        if ($proteccion !== null) {
            return $proteccion;
        }
        $admin = $request->attributes->get('visualgas_usuario');

        $idsEmpresas = $this->idsEmpresasAdmin($admin);

        $filas = DB::table(Schema::t('usuario_empresa').' as ue')
            ->join(Schema::t('usuarios').' as u', 'u.id', '=', 'ue.usuario_id')
            ->leftJoin(Schema::t('usuario_roles').' as ur', 'ur.usuario_id', '=', 'u.id')
            ->leftJoin(Schema::t('roles').' as r', 'r.id', '=', 'ur.rol_id')
            ->leftJoin(Schema::t('empresas').' as e', 'e.id', '=', 'ue.empresa_id')
            ->whereIn('ue.empresa_id', $idsEmpresas)
            ->where('ue.activo', true)
            ->where('u.id', '!=', (int) $admin->id)
            ->groupBy('u.id', 'u.nombre_completo', 'u.correo', 'u.activo', 'u.ultimo_acceso_en')
            ->orderBy('u.nombre_completo')
            ->select(
                'u.id', 'u.nombre_completo', 'u.correo', 'u.activo', 'u.ultimo_acceso_en',
                DB::raw("string_agg(DISTINCT coalesce(r.codigo, ''), ',') AS roles"),
                DB::raw('array_agg(DISTINCT e.razon_social) as empresas'),
            )
            ->get()
            ->all();

        $datos = array_map(static fn (object $u): array => [
            'id' => (int) $u->id,
            'nombre' => (string) $u->nombre_completo,
            'correo' => (string) $u->correo,
            'roles' => implode(', ', array_filter(explode(',', (string) $u->roles))) ?: '—',
            'empresas' => implode(', ', array_values((array) $u->empresas)),
            'estado' => ((bool) $u->activo) ? 'Activo' : 'De baja',
            'ultimo' => $u->ultimo_acceso_en,
        ], $filas);

        $pdf = Pdf::loadView('pdf.usuarios', [
            'filas' => $datos,
            'generado' => now()->format('d/m/Y H:i'),
            'nombre_admin' => (string) $admin->nombre_completo,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('usuarios_bap.pdf');
    }

    /* ===================================================================== */
    /* Internos                                                              */
    /* ===================================================================== */

    /** Bloqueo común: A06 con usuarios_activos + ámbito de empresa. */
    private function guardaAdmin(Request $request): ?JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        if (! $usuario instanceof Usuario) {
            return response()->json(['message' => 'Sesión inválida.'], 401);
        }

        if ($this->autorizacion->catalogoVacio()) {
            return response()->json([
                'message' => 'Catálogo de módulos no disponible (SQL no aplicado).',
                'bloqueo' => 'SQL_NO_APLICADO',
            ], 503);
        }

        if (! $this->autorizacion->accesoModulo((int) $usuario->id, 'usuarios_activos')) {
            return response()->json([
                'message' => 'No administras usuarios (módulo no habilitado para ti).',
            ], 403);
        }

        return null;
    }

    /** @return int[] empresas del administrador (A07). */
    private function idsEmpresasAdmin(object $admin): array
    {
        return array_map(static fn (object $e) => (int) $e->id, $this->autorizacion->empresas((int) $admin->id));
    }

    /** Usuario objetivo con AL MENOS una empresa común con el admin (A07). */
    private function objetivoEnAlcance(object $admin, int $objetivoId): ?object
    {
        $idsEmpresas = $this->idsEmpresasAdmin($admin);
        if ($idsEmpresas === []) return null;

        return DB::table(Schema::t('usuario_empresa'))
            ->where('usuario_id', $objetivoId)
            ->whereIn('empresa_id', $idsEmpresas)
            ->where('activo', true)
            ->first();
    }

    private function contrasenaAleatoria(int $largo = self::LONGITUD_CLAVE_TEMPORAL): string
    {
        $alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%*+-';
        $salida = '';

        for ($i = 0; $i < $largo; $i++) {
            $salida .= $alfabeto[random_int(0, strlen($alfabeto) - 1)];
        }

        return $salida;
    }
}
