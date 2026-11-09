<?php

namespace App\Services;

use App\Support\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Autorización efectiva del backend (FASE D/E) — FLUJO DE AUTORIZACIÓN:
 *
 *   autenticación → usuario → empresa → rol → permisos → módulo habilitado
 *
 * - accesoModulo() ESPEJA fn_modulo_acceso (A06):
 *       veto individual > habilitación individual > default del rol.
 *   La BD y el backend aplican la MISMA regla; el frontend sólo oculta.
 * - Nada aquí confía en lo que el cliente envíe: todo se resuelve en BD.
 * - Tablas aún no aplicadas (SQL sin ejecutar en PostgreSQL) se reportan
 *   como bloqueo (HTTP 503) desde los controladores, no como "sin acceso".
 */
class AutorizacionService
{
    /** Códigos de módulos administrativos (A01; contrato con ModulosSeeder). */
    public const MODULO_ADMIN_MODULOS = 'modulos_habilitados';
    public const MODULO_ADMIN_USUARIOS = 'administracion_usuarios';

    /* ------------------------------------------------------------------ */
    /* Roles                                                               */
    /* ------------------------------------------------------------------ */

    /** @return string[] códigos de roles del usuario */
    public function roles(int $usuarioId): array
    {
        return DB::table(Schema::t('usuario_roles').' as ur')
            ->join(Schema::t('roles').' as r', 'r.id', '=', 'ur.rol_id')
            ->where('ur.usuario_id', $usuarioId)
            ->orderBy('r.id')
            ->pluck('r.codigo')
            ->all();
    }

    /* ------------------------------------------------------------------ */
    /* Empresas (A07: alcance de gestión)                                  */
    /* ------------------------------------------------------------------ */

    /** @return array<int, object> {id, razon_social, nit, principal} */
    public function empresas(int $usuarioId): array
    {
        return DB::table(Schema::t('usuario_empresa').' as ue')
            ->join(Schema::t('empresas').' as e', 'e.id', '=', 'ue.empresa_id')
            ->where('ue.usuario_id', $usuarioId)
            ->where('ue.activo', true)
            ->orderByDesc('ue.principal')
            ->orderBy('e.id')
            ->get(['e.id', 'e.razon_social', 'e.nit', 'ue.principal'])
            ->all();
    }

    public function perteneceAEmpresa(int $usuarioId, int $empresaId): bool
    {
        return DB::table(Schema::t('usuario_empresa'))
            ->where('usuario_id', $usuarioId)
            ->where('empresa_id', $empresaId)
            ->where('activo', true)
            ->exists();
    }

    /** Empresas compartidas entre dos usuarios (delimita el ámbito admin). */
    public function empresasComunes(int $usuarioOrigenId, int $usuarioDestinoId): array
    {
        $origen = $this->empresas($usuarioOrigenId);
        $destino = DB::table(Schema::t('usuario_empresa'))
            ->where('usuario_id', $usuarioDestinoId)
            ->where('activo', true)
            ->pluck('empresa_id')
            ->flip();

        $comunes = [];
        foreach ($origen as $empresa) {
            if (isset($destino[(int) $empresa->id])) {
                $comunes[] = $empresa;
            }
        }

        return $comunes;
    }

    /* ------------------------------------------------------------------ */
    /* Módulos (A06)                                                       */
    /* ------------------------------------------------------------------ */

    /** Espejo de fn_modulo_acceso (A06). */
    public function accesoModulo(int $usuarioId, string $moduloCodigo): bool
    {
        $veto = $this->filaIndividual($usuarioId, $moduloCodigo, false);
        if ($veto !== null) {
            return false;
        }

        return $this->filaIndividual($usuarioId, $moduloCodigo, true) !== null
            || $this->existePorRol($usuarioId, $moduloCodigo);
    }

    /**
     * Módulos efectivos de un usuario con su origen.
     *
     * @return array listado {id, codigo, slug, nombre, descripcion, estado,
     *                        habilitado, origen: individual|rol|sin_acceso}
     */
    public function modulosEfectivos(int $usuarioId): array
    {
        $veto = $this->codigosIndividuales($usuarioId, false);
        $individual = $this->codigosIndividuales($usuarioId, true);

        /** @var array<int, true> $idsPorRol módulos default del rol del usuario */
        $idsPorRol = DB::table(Schema::t('rol_modulos').' as rm')
            ->join(Schema::t('usuario_roles').' as ur', 'ur.rol_id', '=', 'rm.rol_id')
            ->where('ur.usuario_id', $usuarioId)
            ->pluck('rm.modulo_id')
            ->flip()
            ->all();

        $catalogo = DB::table(Schema::t('modulos'))
            ->orderBy('id')
            ->get(['id', 'codigo', 'nombre', 'descripcion', 'estado']);

        $salida = [];
        foreach ($catalogo as $modulo) {
            $codigo = (string) $modulo->codigo;

            if (array_key_exists($codigo, $veto)) {
                $salida[] = $this->filaEstado($modulo, false, 'sin_acceso');
                continue;
            }

            if (array_key_exists($codigo, $individual)) {
                $salida[] = $this->filaEstado($modulo, true, 'individual');
                continue;
            }

            if (array_key_exists((int) $modulo->id, $idsPorRol)) {
                $salida[] = $this->filaEstado($modulo, true, 'rol');
                continue;
            }

            $salida[] = $this->filaEstado($modulo, false, 'sin_acceso');
        }

        return $salida;
    }

    /* ------------------------------------------------------------------ */
    /* Permisos (A05): el seed del catálogo todavía NO está definido       */
    /* ------------------------------------------------------------------ */

    /**
     * Códigos de permisos efectivos (rol_permisos, módulo habilitado).
     * NULL cuando el catálogo permisos no tiene seed: bloqueo documentado
     * (no se inventan permisos; A05 exige definir acciones por módulo).
     *
     * @return string[]|null
     */
    public function permisosResueltos(int $usuarioId): array|null
    {
        $total = DB::table(Schema::t('permisos'))->count();
        if ($total === 0) {
            return null;
        }

        return DB::table(Schema::t('permisos').' as p')
            ->join(Schema::t('rol_permisos').' as rp', 'rp.permiso_id', '=', 'p.id')
            ->join(Schema::t('usuario_roles').' as ur', 'ur.rol_id', '=', 'rp.rol_id')
            ->leftJoin(Schema::t('modulos_habilitados').' as mh', function ($join) {
                $join->on('mh.modulo_id', '=', 'p.modulo_id')
                    ->on('mh.usuario_id', '=', 'ur.usuario_id');
            })
            ->where('ur.usuario_id', $usuarioId)
            ->where(function ($consulta) {
                $consulta->whereNull('mh.habilitado')
                    ->orWhere('mh.habilitado', true);
            })
            ->pluck('p.codigo')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * ¿El usuario tiene el permiso modulo.accion?
     * Devuelve null (bloqueo: catálogo sin seed) o boolean (A06 con módulo).
     */
    public function tienePermiso(int $usuarioId, string $moduloCodigo, string $accion): bool|null
    {
        $permisos = $this->permisosResueltos($usuarioId);
        if ($permisos === null) {
            return null;
        }

        return in_array("{$moduloCodigo}.{$accion}", $permisos, true);
    }

    /* ------------------------------------------------------------------ */
    /* Internos                                                            */
    /* ------------------------------------------------------------------ */

    /** Indica si el catálogo `modulos` aún no existe o está vacío. */
    public function catalogoVacio(): bool
    {
        try {
            return DB::table(Schema::t('modulos'))->count() === 0;
        } catch (\Illuminate\Database\QueryException) {
            return true;
        }
    }

    /** @return array<string, true> codigos del módulo con veto/habilitación individual */
    private function codigosIndividuales(int $usuarioId, bool $habilitado): array
    {
        return DB::table(Schema::t('modulos_habilitados').' as mh')
            ->join(Schema::t('modulos').' as m', 'm.id', '=', 'mh.modulo_id')
            ->where('mh.usuario_id', $usuarioId)
            ->where('mh.habilitado', $habilitado)
            ->pluck('m.codigo')
            ->flip()
            ->all();
    }

    private function filaIndividual(int $usuarioId, string $moduloCodigo, bool $habilitado): ?object
    {
        return DB::table(Schema::t('modulos_habilitados').' as mh')
            ->join(Schema::t('modulos').' as m', 'm.id', '=', 'mh.modulo_id')
            ->where('m.codigo', $moduloCodigo)
            ->where('mh.usuario_id', $usuarioId)
            ->where('mh.habilitado', $habilitado)
            ->first(['mh.id']);
    }

    private function existePorRol(int $usuarioId, string $moduloCodigo): bool
    {
        return DB::table(Schema::t('rol_modulos').' as rm')
            ->join(Schema::t('modulos').' as m', 'm.id', '=', 'rm.modulo_id')
            ->join(Schema::t('usuario_roles').' as ur', 'ur.rol_id', '=', 'rm.rol_id')
            ->where('m.codigo', $moduloCodigo)
            ->where('ur.usuario_id', $usuarioId)
            ->exists();
    }

    private function filaEstado(object $modulo, bool $habilitado, string $origen): object
    {
        return (object) [
            'id' => (int) $modulo->id,
            'codigo' => (string) $modulo->codigo,
            'slug' => str_replace('_', '-', (string) $modulo->codigo),
            'nombre' => (string) $modulo->nombre,
            'descripcion' => $modulo->descripcion,
            'estado' => (string) $modulo->estado,
            'habilitado' => $habilitado,
            'origen' => $origen,
        ];
    }
}
