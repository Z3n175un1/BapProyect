<?php

namespace App\Services;

use App\Models\EventoSeguridad;
use App\Models\TokenAutenticacion;
use App\Models\Usuario;

/**
 * Emisión y revocación de tokens opacos (guard visualgas).
 *
 * - Token claro: 64 hex aleatorios; SOLO el hash sha256 se persiste.
 * - expiracion NULL → vigencia por inactividad según seguridad_usuarios.
 * - Revocación: UPDATE revocado_en (trazable, no DELETE).
 */
class TokenAccesoService
{
    public function emitir(Usuario $usuario, ?string $ip, ?string $agente): string
    {
        $tokenClaro = bin2hex(random_bytes(32));

        TokenAutenticacion::create([
            'usuario_id' => $usuario->id,
            'token_hash' => hash('sha256', $tokenClaro),
            'nombre_dispositivo' => $this->nombreDispositivo($agente),
            'direccion_ip' => $ip,
            'agente_usuario' => $agente,
            'ultimo_uso_en' => now(),
            'expiracion' => null,
            'revocado_en' => null,
        ]);

        return $tokenClaro;
    }

    public function revocar(TokenAutenticacion $token): void
    {
        if ($token->revocado_en === null) {
            $token->revocado_en = now();
            $token->save();
        }
    }

    public function revocarTodos(int $usuarioId, string $motivoEvento): void
    {
        TokenAutenticacion::query()
            ->where('usuario_id', $usuarioId)
            ->whereNull('revocado_en')
            ->update(['revocado_en' => now()]);

        EventoSeguridad::create([
            'usuario_id' => $usuarioId,
            'tipo_evento' => 'TOKEN_INVALIDADO',
            'descripcion' => "Tokens revocados: {$motivoEvento}",
            'severidad' => 'INFO',
        ]);
    }

    /** Shorthand para registrar eventos del flujo de sesión. */
    public function evento(int|null $usuarioId, string $tipo, string $descripcion, ?string $ip, ?string $agente, string $severidad = 'INFO'): void
    {
        EventoSeguridad::create([
            'usuario_id' => $usuarioId,
            'tipo_evento' => $tipo,
            'descripcion' => $descripcion,
            'severidad' => $severidad,
            'direccion_ip' => $ip,
            'agente_usuario' => $agente,
        ]);
    }

    private function nombreDispositivo(?string $agente): ?string
    {
        if (! $agente) return null;

        if (str_contains($agente, 'Edg/')) return 'Edge';
        if (str_contains($agente, 'OPR/') || str_contains($agente, 'Opera')) return 'Opera';
        if (str_contains($agente, 'Firefox/')) return 'Firefox';
        if (str_contains($agente, 'Chrome/')) return 'Chrome';
        if (str_contains($agente, 'Safari/')) return 'Safari';

        return 'Otro';
    }
}
