<?php

namespace App\Http\Controllers;

use App\Services\AutorizacionService;
use App\Support\Schema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * FASE D/E — Catálogo y administración de módulos habilitados.
 *
 * Consulta:
 *   GET  /api/modulos                        → catálogo + acceso propio
 *   GET  /api/modulos/efectivos              → módulos efectivos del propio usuario
 *   GET  /api/modulos/habilitados/{usuario}  → vista admin de un usuario del ámbito
 *
 * Administración (requiere módulo `modulos_habilitados` habilitado):
 *   POST /api/modulos/habilitados            → upsert habilitado=true/false
 *   GET  /api/modulos/historial/{usuario}    → bitácora inmutable (append-only)
 *   GET  /api/modulos/usuarios               → usuarios del ámbito administrable
 *
 * Reglas aplicadas EN LARAVEL (no sólo en React):
 *  R2  Un módulo habilitado NO concede permisos internos (ésto lo gana el
 *      middleware permiso.visualgas; aquí sólo se gestiona el módulo).
 *  R5  Nada de auto-habilitación: el objetivo nunca puede ser el propio
 *      operación (coherente con CHECK chk_mh_no_autohabilitacion).
 *  R7  Ámbito: sólo usuarios que compartan al menos UNA EMPRESA activa con
 *      el administrador (empresas_comunes); evita cruces entre empresas.
 *  R3  Trazabilidad: cambiado_por + motivo; la bitácora la escribe el trigger
 *      BD fn_mh_bitacora (el backend NO duplica el insert del historial).
 *      Consultable vía GET /api/modulos/historial/{usuarioId}.
 */
class ModulosHabilitadosController extends Controller
{
    public function __construct(private AutorizacionService $autorizacion) {}

    /* ===================================================================== */
    /* GET /api/modulos — catálogo + acceso del usuario autenticado          */
    /* ===================================================================== */
    public function disponibles(Request $request): JsonResponse
    {
        if ($this->autorizacion->catalogoVacio()) {
            return $this->bloqueoSql();
        }

        $usuario = $request->attributes->get('visualgas_usuario');
        $modulos = $this->autorizacion->modulosEfectivos((int) $usuario->id);

        return response()->json([
            'modulos' => $modulos,
        ]);
    }

    /* ===================================================================== */
    /* GET /api/modulos/efectivos — acceso inmediato (self)                  */
    /* ===================================================================== */
    public function efectivos(Request $request): JsonResponse
    {
        if ($this->autorizacion->catalogoVacio()) {
            return $this->bloqueoSql();
        }

        $usuario = $request->attributes->get('visualgas_usuario');
        $efectivos = array_values(array_filter(
            $this->autorizacion->modulosEfectivos((int) $usuario->id),
            static fn (object $modulo) => $modulo->habilitado,
        ));

        return response()->json([
            'usuario_id' => (int) $usuario->id,
            'modulos' => $efectivos,
        ]);
    }

    /* ===================================================================== */
    /* GET /api/modulos/usuarios — usuarios del ámbito administrable         */
    /* ===================================================================== */
    public function usuarios(Request $request): JsonResponse
    {
        $usuario = $request->attributes->get('visualgas_usuario');
        $proteccion = $this->validarPermisosAdministrador($usuario);

        if ($proteccion !== null) {
            return $proteccion;
        }

        $busqueda = trim((string) $request->query('busqueda', ''));

        $empresas = $this->autorizacion->empresas((int) $usuario->id);
        if ($empresas === []) {
            return response()->json([
                'message' => 'No administras ninguna empresa.',
                'usuarios' => [],
            ]);
        }

        $idsEmpresas = array_map(static fn (object $e) => (int) $e->id, $empresas);

        $consulta = DB::table(Schema::t('usuario_empresa').' as ue')
            ->join(Schema::t('usuarios').' as u', 'u.id', '=', 'ue.usuario_id')
            ->whereIn('ue.empresa_id', $idsEmpresas)
            ->where('ue.activo', true)
            ->where('u.id', '!=', (int) $usuario->id)
            ->groupBy('u.id', 'u.nombre_completo', 'u.correo', 'u.activo')
            ->orderBy('u.nombre_completo')
            ->select(
                'u.id',
                'u.nombre_completo',
                'u.correo',
                'u.activo',
                DB::raw('count(distinct ue.empresa_id) as empresas_comunes'),
            );

        if ($busqueda !== '') {
            $consulta->where(function ($filtro) use ($busqueda) {
                $filtro->where('u.nombre_completo', 'ilike', "%{$busqueda}%")
                    ->orWhere('u.correo', 'ilike', "%{$busqueda}%");
            });
        }

        $usuarios = $consulta->limit(100)->get()->all();

        return response()->json([
            'ambito' => array_map(static fn (object $e) => [
                'id' => (int) $e->id,
                'razon_social' => $e->razon_social,
            ], $empresas),
            'usuarios' => array_map(static fn (object $u) => [
                'id' => (int) $u->id,
                'nombre_completo' => $u->nombre_completo,
                'correo' => $u->correo,
                'activo' => (bool) $u->activo,
                'empresas_comunes' => (int) $u->empresas_comunes,
            ], $usuarios),
        ]);
    }

    /* ===================================================================== */
    /* GET /api/modulos/habilitados/{usuarioId} — vista admin detallada      */
    /* ===================================================================== */
    public function habilitadosDeUsuario(Request $request, int $usuarioId): JsonResponse
    {
        $administrador = $request->attributes->get('visualgas_usuario');

        if ($error = $this->validarAdministrador($administrador, $usuarioId)) {
            return $error;
        }

        $modulos = $this->autorizacion->modulosEfectivos($usuarioId);

        /* Estado individual (veto/habilitación explícita) con fechas */
        $individuales = DB::table(Schema::t('modulos_habilitados').' as mh')
            ->join(Schema::t('modulos').' as m', 'm.id', '=', 'mh.modulo_id')
            ->where('mh.usuario_id', $usuarioId)
            ->get(['m.codigo', 'mh.habilitado', 'mh.habilitado_en', 'mh.deshabilitado_en', 'mh.motivo', 'mh.cambiado_por']);

        $porCodigo = [];
        foreach ($individuales as $fila) {
            $porCodigo[(string) $fila->codigo] = $fila;
        }

        $detalle = array_map(static function (object $modulo) use ($porCodigo) {
            $individual = $porCodigo[$modulo->codigo] ?? null;

            return [
                'id' => $modulo->id,
                'codigo' => $modulo->codigo,
                'slug' => $modulo->slug,
                'nombre' => $modulo->nombre,
                'descripcion' => $modulo->descripcion,
                'estado' => $modulo->estado,
                'habilitado' => $modulo->habilitado,
                'origen' => $modulo->origen,
                'individual' => $individual ? [
                    'habilitado' => (bool) $individual->habilitado,
                    'habilitado_en' => $individual->habilitado_en,
                    'deshabilitado_en' => $individual->deshabilitado_en,
                    'motivo' => $individual->motivo,
                    'cambiado_por' => $individual->cambiado_por !== null ? (int) $individual->cambiado_por : null,
                ] : null,
            ];
        }, $modulos);

        return response()->json([
            'usuario_id' => $usuarioId,
            'modulos' => $detalle,
        ]);
    }

    /* ===================================================================== */
    /* POST /api/modulos/habilitados — upsert con bitácora por trigger       */
    /* ===================================================================== */
    public function cambiarEstado(Request $request): JsonResponse
    {
        $validado = Validator::make($request->all(), [
            'usuario_id' => ['required', 'integer', 'min:1'],
            'modulo_codigo' => ['required', 'string', 'max:40'],
            'habilitado' => ['required', 'boolean'],
            'motivo' => ['nullable', 'string', 'max:255'],
        ])->validated();

        $administrador = $request->attributes->get('visualgas_usuario');
        $usuarioId = (int) $validado['usuario_id'];
        $moduloCodigo = (string) $validado['modulo_codigo'];
        $habilitado = (bool) $validado['habilitado'];

        if ($this->autorizacion->catalogoVacio()) {
            return $this->bloqueoSql();
        }

        /* R5: nunca puede modificarse a sí mismo */
        if ($usuarioId === (int) $administrador->id) {
            return response()->json([
                'message' => 'No puedes modificar tu propia habilitación de módulos.',
            ], 403);
        }

        if ($error = $this->validarAdministrador($administrador, $usuarioId)) {
            return $error;
        }

        $modulo = DB::table(Schema::t('modulos'))
            ->where('codigo', $moduloCodigo)
            ->first(['id', 'codigo', 'estado']);

        if (! $modulo || $modulo->estado === 'INACTIVO') {
            return response()->json([
                'message' => 'Módulo inexistente o inactivo.',
            ], 404);
        }

        /* No se habilitan módulos EN_DESARROLLO; sí pueden deshabilitarse */
        $puedeDeshabilitarEnDesarrollo = ! $habilitado && $modulo->estado === 'EN_DESARROLLO';
        if (! $puedeDeshabilitarEnDesarrollo && $modulo->estado !== 'ACTIVO') {
            return response()->json([
                'message' => "El módulo {$modulo->estado} no puede habilitarse.",
            ], 409);
        }

        $anterior = DB::table(Schema::t('modulos_habilitados'))
            ->where('usuario_id', $usuarioId)
            ->where('modulo_id', (int) $modulo->id)
            ->first(['id', 'habilitado']);

        try {
            DB::transaction(function () use ($anterior, $usuarioId, $modulo, $habilitado, $administrador, $validado) {
                $valores = [
                    'usuario_id' => $usuarioId,
                    'modulo_id' => (int) $modulo->id,
                    'habilitado' => $habilitado,
                    'cambiado_por' => (int) $administrador->id,
                    'motivo' => $validado['motivo'] ?? null,
                    'actualizado_en' => now(),
                ];

                if ($habilitado) {
                    $valores['habilitado_en'] = now();
                    $valores['deshabilitado_en'] = null;
                } else {
                    $valores['deshabilitado_en'] = now();
                    $valores['habilitado_en'] = $anterior->habilitado_en ?? null;
                }

                if ($anterior === null) {
                    $valores['creado_en'] = now();

                    DB::table(Schema::t('modulos_habilitados'))->insert($valores);
                    return;
                }

                DB::table(Schema::t('modulos_habilitados'))
                    ->where('id', $anterior->id)
                    ->update($valores);
            });
        } catch (\Illuminate\Database\QueryException $excepcion) {
            /* CHECK chk_mh_no_autohabilitacion u otras restricciones de BD */
            report($excepcion);

            return response()->json([
                'message' => 'La base de datos rechazó el cambio (auto-habilitación o incoherencia).',
            ], 409);
        }

        # Trazabilidad R3: el trigger DB fn_mh_bitacora registra el historial
        # append-only (estado anterior/nuevo, admin, motivo); eventos_seguridad
        # no contempla tipos de cambios administrativos (CHECK de FASE 1).

        return response()->json([
            'message' => $habilitado
                ? "Módulo {$moduloCodigo} habilitado."
                : "Módulo {$moduloCodigo} deshabilitado.",
            'usuario_id' => $usuarioId,
            'modulo_codigo' => $moduloCodigo,
            'habilitado' => $habilitado,
        ], 200);
    }

    /* ===================================================================== */
    /* GET /api/modulos/historial/{usuarioId} — bitácora (append-only)       */
    /* ===================================================================== */
    public function historial(Request $request, int $usuarioId): JsonResponse
    {
        $administrador = $request->attributes->get('visualgas_usuario');

        if ($error = $this->validarAdministrador($administrador, $usuarioId)) {
            return $error;
        }

        $filas = DB::table(Schema::t('modulos_habilitados_historial').' as h')
            ->join(Schema::t('modulos').' as m', 'm.id', '=', 'h.modulo_id')
            ->leftJoin(Schema::t('usuarios').' as a', 'a.id', '=', 'h.cambiado_por')
            ->where('h.usuario_id', $usuarioId)
            ->orderByDesc('h.registrado_en')
            ->limit(50)
            ->get([
                'm.codigo AS modulo_codigo',
                'h.estado_anterior',
                'h.estado_nuevo',
                'h.motivo',
                'h.registrado_en',
                'a.nombre_completo AS administrador',
            ]);

        return response()->json([
            'usuario_id' => $usuarioId,
            'historial' => array_map(static fn (object $fila) => [
                'modulo_codigo' => $fila->modulo_codigo,
                'estado_anterior' => $fila->estado_anterior !== null ? (bool) $fila->estado_anterior : null,
                'estado_nuevo' => (bool) $fila->estado_nuevo,
                'motivo' => $fila->motivo,
                'registrado_en' => $fila->registrado_en,
                'administrador' => $fila->administrador,
            ], $filas->all()),
        ]);
    }

    /* ===================================================================== */
    /* Validaciones de administrador (ámbito empresarial, A07)               */
    /* ===================================================================== */

    /**
     * El administrador debe:
     *  R7 Tener el módulo `modulos_habilitados` habilitado A06.
     *  R8 Casualmente estar en al menos una empresa con el usuario objetivo.
     */
    private function validarAdministrador(
        object|null $administrador,
        int $usuarioObjetivo,
    ): JsonResponse|null {
        if ($this->autorizacion->catalogoVacio()) {
            return $this->bloqueoSql();
        }

        if (! $this->autorizacion->accesoModulo(
            (int) $administrador->id,
            AutorizacionService::MODULO_ADMIN_MODULOS,
        )) {
            return response()->json([
                'message' => 'No administras módulos habilitados (módulo no habilitado para ti).',
            ], 403);
        }

        $comunes = $this->autorizacion->empresasComunes((int) $administrador->id, $usuarioObjetivo);
        if ($comunes === []) {
            return response()->json([
                'message' => 'El usuario objetivo no pertenece a ninguna de las empresas que administras.',
            ], 403);
        }

        $objetivo = DB::table(Schema::t('usuarios'))->where('id', $usuarioObjetivo)->first(['id']);
        if (! $objetivo) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        return null;
    }

    private function validarPermisosAdministrador(object|null $usuario): JsonResponse|null
    {
        if ($this->autorizacion->catalogoVacio()) {
            return $this->bloqueoSql();
        }

        $modulo = $this->autorizacion->accesoModulo((int) $usuario->id, AutorizacionService::MODULO_ADMIN_MODULOS)
            || $this->autorizacion->accesoModulo((int) $usuario->id, AutorizacionService::MODULO_ADMIN_USUARIOS);

        if (! $modulo) {
            return response()->json([
                'message' => 'No administras usuarios (módulo no habilitado para ti).',
            ], 403);
        }

        return null;
    }

    private function bloqueoSql(): JsonResponse
    {
        return response()->json([
            'message' => 'Catálogo de módulos no disponible todavía (SQL FASE 1/2 sin aplicar en PostgreSQL).',
            'bloqueo' => 'SQL_NO_APLICADO',
        ], 503);
    }
}
