<?php

namespace Database\Seeders;

use App\Support\Schema;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * FASE 2 · Catálogo inicial de módulos (idempotente, A01).
 *
 * - `codigo` es el contrato estable con SQL y backend; nunca se reutiliza el
 *   código de un módulo retirado.
 * - upsert sobre `codigo`: puede ejecutarse repetidamente sin fallas.
 * - Ampliación futura: agregar filas aquí (o por SQL) sin alterar la estructura.
 * - Estados APROBADOS por el dueño (P-02 + ampliación): ACTIVO para los
 *   módulos ya implementados (usuarios_activos, ganancias_del_dia,
 *   modulos_habilitados, contabilidad, respaldos); el resto EN_DESARROLLO. A06 no filtra por estado, así que
 *   la autorización no se ve afectada; el estado regula la habilitación
 *   individual (solo módulos ACTIVO pueden habilitarse a un usuario) y
 *   describe en qué fase está la interfaz.
 * - Tablas CALIFICADAS vía App\Support\Schema (global | test según .env).
 */
class ModulosSeeder extends Seeder
{
    public function run(): void
    {
        DB::table(Schema::t('modulos'))->upsert(
            [
                ['codigo' => 'administracion_usuarios', 'nombre' => 'Administración de usuarios', 'descripcion' => 'Registro, edición y estado de usuarios por empresa.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'empresas_sucursales', 'nombre' => 'Empresas y sucursales', 'descripcion' => 'Gestión de empresas y sus sucursales.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'usuarios_activos', 'nombre' => 'Usuarios activos', 'descripcion' => 'Consulta de usuarios con indicadores de actividad.', 'estado' => 'ACTIVO'],
                ['codigo' => 'ganancias_del_dia', 'nombre' => 'Ganancias del día', 'descripcion' => 'Resumen de ingresos, egresos y ganancia neta.', 'estado' => 'ACTIVO'],
                ['codigo' => 'modulos_habilitados', 'nombre' => 'Módulos habilitados', 'descripcion' => 'Habilitación y deshabilitación de módulos por usuario.', 'estado' => 'ACTIVO'],
                ['codigo' => 'contabilidad', 'nombre' => 'Contabilidad', 'descripcion' => 'Plan de cuentas, asientos, libros y conciliación (FASE 3).', 'estado' => 'ACTIVO'],
                ['codigo' => 'comprobantes', 'nombre' => 'Comprobantes', 'descripcion' => 'Emisión y control de comprobantes por tipo.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'reportes', 'nombre' => 'Reportes', 'descripcion' => 'Reportes administrativos, contables y fiscales.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'inventario', 'nombre' => 'Inventario', 'descripcion' => 'Productos, categorías y movimientos de stock.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'auditoria', 'nombre' => 'Auditoría', 'descripcion' => 'Bitácoras de usuarios, empresas y actividades.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'respaldos', 'nombre' => 'Respaldos', 'descripcion' => 'Fechas y estados de backups del sistema.', 'estado' => 'ACTIVO'],
                ['codigo' => 'estadisticas', 'nombre' => 'Estadísticas', 'descripcion' => 'Indicadores y utilización del sistema.', 'estado' => 'EN_DESARROLLO'],
                ['codigo' => 'asistente', 'nombre' => 'Asistente inteligente', 'descripcion' => 'Chatbot para consultas contables (integración futura).', 'estado' => 'EN_DESARROLLO'],
            ],
            uniqueBy: ['codigo'],
            update: ['nombre', 'descripcion', 'estado'],
        );
    }
}
