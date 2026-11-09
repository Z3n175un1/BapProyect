<?php

namespace Database\Seeders;

use App\Support\Schema;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FASE 2 · Roles del sistema (idempotente).
 *
 * - Identificadores estables mediante `codigo` UNIQUE (A08) y upsert sobre la
 *   clave de negocio: puedes ejecutarlo N veces sin duplicar registros.
 * - `es_administrador` solo para ADMINISTRADOR (permiso de gestión global).
 * - Tablas CALIFICADAS vía App\Support\Schema (global | test según .env),
 *   así el seeder funciona sin depender del search_path de la conexión.
 */
class RolesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table(Schema::t('roles'))->upsert(
            [
                [
                    'codigo' => 'ADMINISTRADOR',
                    'nombre' => 'Administrador',
                    'descripcion' => 'Administra usuarios, empresas, módulos habilitados y la configuración general del sistema.',
                    'es_administrador' => true,
                ],
                [
                    'codigo' => 'OPERADOR',
                    'nombre' => 'Operador',
                    'descripcion' => 'Ejecuta operaciones del día a día (módulos operativos habilitados por el administrador).',
                    'es_administrador' => false,
                ],
                [
                    'codigo' => 'CONTADOR',
                    'nombre' => 'Contador',
                    'descripcion' => 'Gestiona contabilidad, comprobantes y consultas financieras de la empresa.',
                    'es_administrador' => false,
                ],
                [
                    'codigo' => 'GERENTE',
                    'nombre' => 'Gerente',
                    'descripcion' => 'Supervisa resultados, revisa reportes, estadísticas y auditoría.',
                    'es_administrador' => false,
                ],
            ],
            uniqueBy: ['codigo'],
            update: ['nombre', 'descripcion', 'es_administrador'],
        );
    }
}
