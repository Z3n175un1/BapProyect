<?php

namespace App\Http\Middleware;

use App\Models\EventoSeguridad;
use App\Models\SeguridadUsuario;
use App\Models\Usuario;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\Schema;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guard `auth.visualgas`: valida el Bearer contra tokens_autenticacion.
 *
 * - Autenticación: existe token, hash coincide y sin revocar.
 * - Expiración por inactividad: ahora - ultimo_uso_en > inactividad_max_minutos
 *   (por usuario, DEFAULT 30) → 401 (config/utilización por usuario S-Level).
 * - Revoca en el punto: token inválido por inactividad se marca revocado.
 *
 * Los VERIFICACIONES DEFINITIVAS de autorización por módulo viven en Laravel
 * (FASE D/E); el frontend solo oculta opciones (nunca es medida de seguridad).
 */
class AuthVisualGasToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $tokenClaro = $request->bearerToken();

        if (! $tokenClaro || ! preg_match('/^[0-9a-f]{64}$/', $tokenClaro)) {
            return $this->noAutorizado('Token no proporcionado o inválido.');
        }

        $tokenHash = hash('sha256', $tokenClaro);

        $token = DB::table(Schema::t('tokens_autenticacion'))
            ->where('token_hash', $tokenHash)
            ->whereNull('revocado_en')
            ->first();

        if (! $token) {
            return $this->noAutorizado('Sesión inexistente o revocada.', true);
        }

        if ($token->expiracion !== null && strtotime($token->expiracion) < time()) {
            DB::table(Schema::t('tokens_autenticacion'))
                ->where('id', $token->id)
                ->update(['revocado_en' => now()]);

            return $this->noAutorizado('Sesión expirada.', true);
        }

        $usuario = Usuario::query()->find($token->usuario_id);

        if (! $usuario || ! $usuario->activo) {
            return $this->noAutorizado('Cuenta deshabilitada.', true);
        }

        /* Expiración por inactividad (por usuario) */
        $inactividadMinutos = SeguridadUsuario::query()
            ->where('usuario_id', $usuario->id)
            ->value('inactividad_max_minutos') ?? 30;

        $ultimoUso = $token->ultimo_uso_en ? strtotime((string) $token->ultimo_uso_en) : 0;

        if (time() - $ultimoUso > $inactividadMinutos * 60) {
            DB::table(Schema::t('tokens_autenticacion'))
                ->where('id', $token->id)
                ->update(['revocado_en' => now()]);

            EventoSeguridad::create([
                'usuario_id' => $usuario->id,
                'tipo_evento' => 'TOKEN_INVALIDADO',
                'descripcion' => "Sesión expirada por inactividad ({$inactividadMinutos} minutos).",
                'severidad' => 'INFO',
            ]);

            return $this->noAutorizado('Sesión expirada por inactividad.', true);
        }

        /* Registro de uso (sin penalizar performance: dos UPDATE puntuales) */
        DB::table(Schema::t('tokens_autenticacion'))
            ->where('id', $token->id)
            ->update(['ultimo_uso_en' => now()]);

        DB::table(Schema::t('usuarios'))
            ->where('id', $usuario->id)
            ->update(['ultimo_acceso_en' => now()]);

        $request->attributes->set('visualgas_usuario', $usuario);
        $request->attributes->set('visualgas_token', $token);

        return $next($request);
    }

    private function noAutorizado(string $mensaje, bool $expirada = false): Response
    {
        return response()->json([
            'message' => $mensaje,
            'sesion_expirada' => $expirada,
        ], 401);
    }
}
