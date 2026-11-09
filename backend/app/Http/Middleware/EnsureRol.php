<?php

namespace App\Http\Middleware;

use App\Services\AutorizacionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Alias: rol.visualgas:ADMINISTRADOR,GERENTE
 *
 * Verifica que el usuario autenticado (inyectado por auth.visualgas)
 * tenga AL MENOS uno de los roles indicados. Los roles se resuelven
 * SIEMPRE desde la BD (usuario_roles) en el momento de la solicitud.
 */
class EnsureRol
{
    public function __construct(private AutorizacionService $autorizacion) {}

    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $usuario = $request->attributes->get('visualgas_usuario');

        if (! $usuario) {
            return response()->json(['message' => 'Sesión no autenticada.'], 401);
        }

        $requeridos = array_values(array_filter(array_map('trim', explode(',', $roles))));

        if ($requeridos === []) {
            return response()->json([
                'message' => 'Configuración de ruta inválida (sin roles).',
            ], 500);
        }

        if (! array_intersect($requeridos, $this->autorizacion->roles((int) $usuario->id))) {
            return response()->json([
                'message' => 'No cuentas con el rol requerido para esta operación.',
                'roles_requeridos' => $requeridos,
            ], 403);
        }

        return $next($request);
    }
}
