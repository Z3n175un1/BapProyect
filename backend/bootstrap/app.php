<?php

use App\Http\Middleware\AuthVisualGasToken;
use App\Http\Middleware\EnsureModuloHabilitado;
use App\Http\Middleware\EnsurePermiso;
use App\Http\Middleware\EnsureRol;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth.visualgas' => AuthVisualGasToken::class,
            'modulo.visualgas' => EnsureModuloHabilitado::class,
            'permiso.visualgas' => EnsurePermiso::class,
            'rol.visualgas' => EnsureRol::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
