<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;

/**
 * Utilidades de secretos del módulo de seguridad.
 *
 * - Respuesta secreta: nunca se guarda texto plano; se compara contra un hash
 *   HMAC-SHA256 normalizado, con clave dedicada (no reutiliza APP_KEY para
 *   esto). Compatible con la columna respuesta_secreta_hash (59..255 chars).
 * - Secreto TOTP: se guarda cifrado (Crypt, AES-256-GCM) y aquí se descifra.
 */
class SecretoService
{
    public const RESPUESTA_KEY = 'VISUALGAS_CLAVE_RESPUESTA';

    public function hashRespuesta(string $respuesta): string
    {
        return hash_hmac('sha256', $this->normalizar($respuesta), $this->claveRespuesta());
    }

    public function verificarRespuesta(string $respuestaPlano, string $hash): bool
    {
        return hash_equals($hash, $this->hashRespuesta($respuestaPlano));
    }

    public function cifrarSecretoTotp(string $secretoBase32): string
    {
        return Crypt::encryptString($secretoBase32);
    }

    public function descifrarSecretoTotp(string $cifrado): string|null
    {
        try {
            return Crypt::decryptString($cifrado);
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizar(string $respuesta): string
    {
        $limpio = trim($respuesta);
        $limpio = mb_strtolower($limpio);

        return (string) preg_replace('/\s+/', ' ', $limpio);
    }

    private function claveRespuesta(): string
    {
        return (string) env(self::RESPUESTA_KEY, config('app.key'));
    }
}
