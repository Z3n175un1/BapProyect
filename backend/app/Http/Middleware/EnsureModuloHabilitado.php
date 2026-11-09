<?php

namespace App\Http\Middleware;

use App\Services\AutorizacionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Alias: modulo.visualgas:modulos_habilitados
 *
 * Autorización efectiva por módulo (A06), espejando fn_modulo_acceso:
 * veto individual > habilitación individual > default del rol.
 *
 * - El módulo NO concede permisos internos: para acciones concretas
 *   combínalo con permiso.visualgas:módulo,acción.
 * - Si el catálogo `modulos` está vacío (SQL sin aplicar), responde 503
 *   con marca SQL_NO_APLICADO: bloqueo de despliegue, no de seguridad.
 */
class EnsureModuloHabilitado
{
    public function __construct(private AutorizacionService $autorizacion) {}

    public function handle(Request $request, Closure $next, string $moduloCodigo): Response
    {
        $usuario = $request->attributes->get('visualgas_usuario');

        if (! $usuario) {
            return response()->json(['message' => 'Sesión no autenticada.'], 401);
        }

        if (trim($moduloCodigo) === '') {
            return response()->json([
                'message' => 'Configuración de ruta inválida (sin módulo).',
            ], 500);
        }

        try {
            $catalogoVacio = $this->autorizacion->catalogoVacio();
            if ($catalogoVacio) {
                return response()->json([
                    'message' => 'Catálogo de módulos no disponible todavía (SQL FASE 1/2 sin aplicar en PostgreSQL).',
                    'bloqueo' => 'SQL_NO_APLICADO',
                ], 503);
            }

            $autorizado = $this->autorizacion->accesoModulo((int) $usuario->id, trim($moduloCodigo));
        } catch (\Illuminate\Database\QueryException $excepcion) {
            report($excepcion);

            return response()->json([
                'message' => 'Esquema de seguridad/administración no aplicado todavía (SQL FASE 1/2).',
                'bloqueo' => 'SQL_NO_APLICADO',
            ], 503);
        }

        if (! $autorizado) {
            return response()->json([
                'message' => 'No tienes este módulo habilitado.',
                'modulo' => trim($moduloCodigo),
            ], 403);
        }

        return $next($request);
    }
}
