<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModulosHabilitadosController;
use App\Http\Controllers\RecuperarContrasenaController;
use App\Http\Controllers\RespaldosController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
 * API VisualGas — FASE C (autenticación) + FASE D/E (autorización).
 *
 * Autenticación por token opaco (guard propio sobre global.tokens_autenticacion).
 * No se usa Sanctum para NO duplicar el sistema de tokens ya modelado en la BD
 * (decisión documentada en database/sql/README.md FASE 5).
 *
 * Flujo: login → usuario → empresa → rol → permisos → módulos habilitado.
 * La autorización REAL vive aquí (middlewares); React sólo oculta opciones.
 */

/* Público */
Route::post('/auth/login', [AuthController::class, 'iniciarSesion']);
Route::post('/auth/2fa', [AuthController::class, 'verificar2FA']);
Route::post('/auth/recuperar/solicitar', [RecuperarContrasenaController::class, 'solicitar']);
Route::post('/auth/recuperar/restablecer', [RecuperarContrasenaController::class, 'restablecer']);

/* Autenticado (guard visualgas) */
Route::middleware('auth.visualgas')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'yo']);
    Route::post('/auth/logout', [AuthController::class, 'cerrarSesion']);

    /* Opciones de personalización de la propia cuenta (FASE F). */
    Route::post('/auth/perfil', [AuthController::class, 'actualizarPerfil']);
    Route::post('/auth/cambiar-contrasena', [AuthController::class, 'cambiarContrasena']);
    Route::post('/auth/2fa/preparar', [AuthController::class, 'preparar2FA']);
    Route::post('/auth/2fa/activar', [AuthController::class, 'activar2FA']);

    /* Consulta de catálogo y acceso efectivo propio (sólo requiere sesión) */
    Route::get('/modulos', [ModulosHabilitadosController::class, 'disponibles']);
    Route::get('/modulos/efectivos', [ModulosHabilitadosController::class, 'efectivos']);

    /*
     * FASE D/E — administración de módulos habilitados.
     * El middleware modulo.visualgas aplica el acceso (A06) en cada ruta:
     * sólo administradores (usuarios con `modulos_habilitados` habilitado).
     */
    Route::middleware('modulo.visualgas:modulos_habilitados')->group(function () {
        Route::get('/modulos/usuarios', [ModulosHabilitadosController::class, 'usuarios']);
        Route::get('/modulos/habilitados/{usuarioId}', [
            ModulosHabilitadosController::class, 'habilitadosDeUsuario',
        ]);
        Route::get('/modulos/historial/{usuarioId}', [
            ModulosHabilitadosController::class, 'historial',
        ]);
        Route::post('/modulos/habilitados', [ModulosHabilitadosController::class, 'cambiarEstado']);
    });

    /*
     * FASE F — módulo respaldos: registro informativo de backups (A06 via
     * modulo.visualgas:respaldos; la lectura es del propio modulo).
     */
    Route::middleware('modulo.visualgas:respaldos')->group(function () {
        Route::get('/respaldos', [RespaldosController::class, 'listar']);
        Route::get('/respaldos/pdf', [RespaldosController::class, 'pdf']);
    });

    /*
     * FASE F — módulo usuarios_activos: CRUD de usuarios del ámbito (A07) con
     * cuentas nuevas que arrancan con 2FA pendiente y contraseña temporal.
     */
    Route::middleware('modulo.visualgas:usuarios_activos')->group(function () {
        Route::get('/usuarios-activos', [UsuarioController::class, 'listar']);
        Route::get('/usuarios-activos/roles', [UsuarioController::class, 'roles']);
        Route::get('/usuarios-activos/pdf', [UsuarioController::class, 'pdf']);
        Route::post('/usuarios-activos', [UsuarioController::class, 'crear']);
        Route::put('/usuarios-activos/{usuarioId}', [UsuarioController::class, 'editar']);
        Route::post('/usuarios-activos/{usuarioId}/estado', [UsuarioController::class, 'cambiarEstado']);
    });
});
