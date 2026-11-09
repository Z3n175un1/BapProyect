<?php

namespace App\Services;

/**
 * Verificación TOTP (RFC 6238) sin dependencias externas.
 *
 * - SHA-HMAC según totp_algoritmo de seguridad_usuarios (SHA1 por defecto).
 * - Ventana de tolerancia ±1 paso (30 s por defecto) para relojes desincronizados.
 * - El secreto se recibe descifrado (el Crypt del backend) y NUNCA se registra.
 */
class TotpService
{
    private const BASE32_ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public function generarSecretoBase32(int $bytes = 20): string
    {
        return $this->aBase32(random_bytes($bytes));
    }

    public function verificar(string $secretoBase32, string $codigo, string $algoritmo = 'SHA1', int $periodo = 30, int $digitos = 6, int $ventana = 1): bool
    {
        $secreto = $this->deBase32($secretoBase32);
        if ($secreto === '') return false;

        $codigo = trim($codigo);
        if (! preg_match('/^\d{6,8}$/', $codigo)) return false;

        $algoritmo = 'sha'.substr(strtolower($algoritmo), 3, 3);
        $pasoActual = (int) floor(time() / $periodo);

        for ($i = -$ventana; $i <= $ventana; $i++) {
            $esperado = $this->codigoTotp($secreto, $pasoActual + $i, $algoritmo, $digitos);
            if (hash_equals($esperado, $codigo)) {
                return true;
            }
        }

        return false;
    }

    private function codigoTotp(string $secreto, int $paso, string $algoritmo, int $digitos): string
    {
        $binarioPaso = pack('N', 0).pack('N', $paso);
        $hmac = hash_hmac($algoritmo, $binarioPaso, $secreto, true);
        $offset = ord(substr($hmac, -1)) & 0x0F;
        $valor = unpack('N', substr($hmac, $offset, 4))[1] & 0x7FFFFFFF;
        return str_pad((string) ($valor % (10 ** $digitos)), $digitos, '0', STR_PAD_LEFT);
    }

    private function aBase32(string $binario): string
    {
        $salida = '';
        $bits = 0;
        $acumulado = 0;

        foreach (str_split($binario) as $byte) {
            $acumulado = ($acumulado << 8) | ord($byte);
            $bits += 8;

            while ($bits >= 5) {
                $bits -= 5;
                $salida .= self::BASE32_ALFABETO[($acumulado >> $bits) & 0x1F];
            }
        }

        return $salida;
    }

    private function deBase32(string $valor): string
    {
        $valor = strtoupper(preg_replace('/[^A-Z2-7]/i', '', $valor) ?? '');
        $salida = '';
        $bits = 0;
        $acumulado = 0;

        for ($i = 0; $i < strlen($valor); $i++) {
            $indice = strpos(self::BASE32_ALFABETO, $valor[$i]);
            if ($indice === false) return '';

            $acumulado = ($acumulado << 5) | $indice;
            $bits += 5;

            if ($bits >= 8) {
                $bits -= 8;
                $salida .= chr(($acumulado >> $bits) & 0xFF);
            }
        }

        return $salida;
    }
}
