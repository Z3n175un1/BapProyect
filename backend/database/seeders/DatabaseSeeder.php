<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database (VisualGas FASE 2).
     *
     * Los seeders del sistema se ejecutan MANUALMENTE y en este ORDEN una vez
     * aplicado el SQL de database/sql/ (00_dominios → 01_seguridad → 02_administracion):
     *
     *   php artisan db:seed --class=RolesSeeder
     *   php artisan db:seed --class=ModulosSeeder
     *   php artisan db:seed --class=RolModulosSeeder
     *
     * NO se registran llamadas automáticas para que `db:seed` general no los
     * ejecute por sorpresa. El `User::factory()` del esqueleto quedó OMITIDO:
     * dependía de las migraciones default (`users`), que NO forman parte de
     * VisualGas; el bootstrap del primer usuario se decidirá aparte (P-04).
     */
    public function run(): void
    {
        //
    }
}
