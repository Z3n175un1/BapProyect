<?php

namespace App\Http\Middleware;

use App\Services\AutorizacionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Alias: permiso.visualgas:modulos_habilitados,habilitar
 *
 * TODO permiso pertenece a un módulo (A05). Denegación por defecto (deny by
 * default). El usuario además debe tener el módulo habilitado (A06).
 *
 * BLOQUEO DOCUMENTADO: el catálogo `permisos`/`rol_permisos` no tiene seed
 * todavía (queda pendiente la definición de acciones por módulo). Mientras
 * esté vacío, el middleware responde 503 CON MENSAJE EXPLICITO — no 403 —
 * para distinguir "no implementado aún" de "sin autorización".
 */
class EnsurePermiso
{
    private const BLOQUEO_SEED = 'El catálogo de permisos aún no está definido (seed pendiente tras aplicar el SQL de FASE 1/2 en PostgreSQL).';

    public function __construct(private AutorizacionService $autorizacion) {}

    public function handle(Request $request, Closure $next, string $parametros): Response
    {
        $usuario = $request->attributes->get('visualgas_usuario');

        if (! $usuario) {
            return response()->json(['message' => 'Sesión no autenticada.'], 401);
        }

        [$moduloCodigo, $accion] = array_pad(array_map('trim', explode(',', $parametros, 2)), 2, null);

        if (! $moduloCodigo || ! $accion) {
            return response()->json([
                'message' => 'Configuración de ruta inválida (se espera modulo,accion).',
            ], 500);
        }

        $resolucion = $this->autorizacion->tienePermiso((int) $usuario->id, $moduloCodigo, $accion);

        if ($resolucion === null) {
            return response()->json([
                'message' => self::BLOQUEO_SEED,
                'bloqueo' => 'PERMISOS_SIN_SEED',
                'modulo' => $moduloCodigo,
                'accion' => $accion,
            ], 503);
        }

        if (! $resolucion) {
            return response()->json([
                'message' => 'No cuentas con el permiso requerido para esta operación.',
                'modulo' => $moduloCodigo,
                'accion' => $accion,
            ], 403);
        }

        return $next($request);
    }
}
