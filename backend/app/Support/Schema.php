<?php

namespace App\Support;

/**
 * Resuelve el esquema activo de VisualGas (global | test) desde una sola
 * fuente de verdad: la variable DB_SCHEMA del .env (global = oficial,
 * test = datos de prueba, decisión D01 del SQL).
 *
 * - Modelos y consultas usan Schema::t(...) en lugar de hardcodear tablas;
 *   los seeders también (quedan independientes del search_path de Laravel).
 * - Coherente con la ejecución del DDL (README de database/sql):
 *     PGOPTIONS="--search_path=test,public" psql ...   para el esquema test.
 */
class Schema
{
    public static function activo(): string
    {
        return trim((string) env('DB_SCHEMA', 'global')) ?: 'global';
    }

    public static function t(string $tabla): string
    {
        return self::activo().'.'.$tabla;
    }
}
