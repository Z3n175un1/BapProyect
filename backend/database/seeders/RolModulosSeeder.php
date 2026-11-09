<?php

namespace Database\Seeders;

use App\Support\Schema;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FASE 2 · Módulos por defecto de cada rol (idempotente, tipo syncWithoutDetach).
 *
 * - SOLO agrega pares rol→módulo faltantes; nunca elimina asignaciones
 *   existentes (no destructivo, e independiente de la matriz de permisos).
 * - Requiere RolesSeeder y ModulosSeeder ejecutados previamente.
 * - La habilitación individual por usuario sigue siendo independiente
 *   (modulos_habilitados; prioridad sobre el rol, A06).
 * - Tablas CALIFICADAS vía App\Support\Schema (global | test según .env).
 *
 * Propuesta aprobada (§4 + ajustes del dueño) — pendiente de revisar tras
 * la puesta en producción de la matriz de permisos.
 */
class RolModulosSeeder extends Seeder
{
    public function run(): void
    {
        $rolId = DB::table(Schema::t('roles'))->pluck('id', 'codigo');
        $moduloId = DB::table(Schema::t('modulos'))->pluck('id', 'codigo');

        $matriz = [
            'ADMINISTRADOR' => [
                'administracion_usuarios', 'empresas_sucursales', 'usuarios_activos',
                'ganancias_del_dia', 'modulos_habilitados', 'respaldos', 'auditoria',
                'inventario', 'reportes', 'estadisticas', 'asistente',
            ],
            'OPERADOR' => [
                // Mínimos: el administrador puede habilitar módulos individualmente.
                'ganancias_del_dia', 'inventario', 'asistente',
            ],
            'CONTADOR' => [
                'contabilidad', 'comprobantes', 'ganancias_del_dia', 'estadisticas', 'reportes', 'asistente',
            ],
            'GERENTE' => [
                'ganancias_del_dia', 'usuarios_activos', 'auditoria', 'estadisticas', 'reportes', 'asistente',
            ],
        ];

        $now = now();

        foreach ($matriz as $rolCodigo => $modulos) {
            if (! isset($rolId[$rolCodigo])) {
                continue; // rol no sembrado: no rompe el seeder
            }

            $existentes = DB::table(Schema::t('rol_modulos').' as rm')
                ->join(Schema::t('roles').' as r', 'r.id', '=', 'rm.rol_id')
                ->where('r.codigo', $rolCodigo)
                ->pluck('rm.modulo_id');

            $filas = [];
            foreach ($modulos as $moduloCodigo) {
                if (! isset($moduloId[$moduloCodigo]) || $existentes->contains($moduloId[$moduloCodigo])) {
                    continue;
                }

                $filas[] = [
                    'rol_id' => $rolId[$rolCodigo],
                    'modulo_id' => $moduloId[$moduloCodigo],
                    'creado_en' => $now,
                ];
            }

            if ($filas !== []) {
                DB::table(Schema::t('rol_modulos'))->insert($filas);
            }
        }
    }
}
