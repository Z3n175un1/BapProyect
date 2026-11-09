<?php
/* Temporal: descifra el secreto TOTP del usuario 5 para el smoke E2E. */
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$cifrado = Illuminate\Support\Facades\DB::table('test.seguridad_usuarios')
    ->where('usuario_id', 5)
    ->value('totp_secreto_cifrado');

$secreto = (new App\Services\SecretoService())->descifrarSecretoTotp((string) $cifrado);
echo $secreto === null ? 'DESGLOBE_FALLA' : $secreto, PHP_EOL;
