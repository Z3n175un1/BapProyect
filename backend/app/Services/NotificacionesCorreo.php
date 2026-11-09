<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpClient\HttpClient;

/**
 * Envío de notificaciones por correo (FASE F).
 *
 * - Si VISUALGAS_MAIL_API_URL (y opcionalmente VISUALGAS_MAIL_API_TOKEN)
 *   están configurados en el .env, envía por HTTP con symfony/http-client.
 * - Si NO está configurada la API, registra el correo en el log (MAIL_MAILER
 *   = log del proyecto de pruebas) y firma false: nunca bloquea el flujo.
 *
 * Usos: credenciales de cuenta nueva, avisos de cambio de contraseña y
 * mensajes del proceso de recuperación.
 */
class NotificacionesCorreo
{
    public function enviar(string $para, string $asunto, string $cuerpoHtml): bool
    {
        $url = trim((string) env('VISUALGAS_MAIL_API_URL'));

        if ($url === '') {
            /* Sin proveedor HTTP configurado: el modo log hace de buzón visible. */
            Log::info("[MAIL_LOG] para={$para} asunto={$asunto}\n{$cuerpoHtml}");

            return false;
        }

        try {
            $cliente = HttpClient::create();
            $respuesta = $cliente->request('POST', $url, [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'to' => $para,
                    'subject' => $asunto,
                    'html' => $cuerpoHtml,
                    'from' => (string) env('VISUALGAS_MAIL_REMITENTE', 'noreply@bap.com.bo'),
                ],
            ]);

            $codigo = $respuesta->getStatusCode();

            if ($codigo >= 200 && $codigo < 300) {
                return true;
            }

            Log::warning("[MAIL_API] respuesta HTTP {$codigo} al enviar correo a {$para}.");

            return false;
        } catch (\Throwable $e) {
            Log::error('[MAIL_API] fallo de envío: '.$e->getMessage());

            return false;
        }
    }

    /** Plantilla simple para credenciales de cuenta nueva. */
    public function credencialesCuentaNueva(
        string $nombre,
        string $correo,
        string $contrasenaTemporal,
        array $codigosRespaldo,
        string $secretoBase32,
    ): void {
        $codigos = implode('<br>', array_map(static fn (string $c) => '&bull; '.e($c), $codigosRespaldo));

        $this->enviar($correo, 'VisualGas · Tu cuenta fue creada', "
            <h3>Bienvenido, ".e($nombre)."</h3>
            <p>Tu cuenta de VisualGas ya está lista. Con estos datos realizas el primer inicio de sesión:</p>
            <p><strong>Correo:</strong> ".e($correo)."<br>
            <strong>Contraseña temporal:</strong> ".e($contrasenaTemporal)."</p>
            <p>Al ingresar, la aplicación te pedirá cambiar la contraseña y configurar el
            segundo factor (2FA) de tu cuenta.</p>
            <p><strong>Códigos de respaldo 2FA (un solo uso):</strong><br>{$codigos}</p>
            <p><strong>Secreto TOTP (configuración manual en tu app de autenticación):</strong> ".e($secretoBase32)."</p>
            <p>Si no solicitaste esta cuenta, contacta al administrador.</p>
        ");
    }

    public function contrasenaActualizada(string $correo, string $nombre): void
    {
        $this->enviar($correo, 'VisualGas · Contraseña actualizada', "
            <p>Hola ".e($nombre).",</p>
            <p>Tu contraseña de VisualGas fue actualizada correctamente y las demás
            sesiones activas de tu cuenta fueron cerradas.</p>
        ");
    }
}
