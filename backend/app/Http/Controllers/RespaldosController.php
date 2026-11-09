<?php

namespace App\Http\Controllers;

use App\Support\Schema;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Módulo `respaldos` (FASE F 03) — registro informativo de backups (R01).
 *
 * - Lectura por API del registro del sistema (tabla test.respaldos).
 * - No lanza (ni restaura) backups desde la API: la UI es observación
 *   (fechas/estados); el ciclo de backup real queda fuera de esta FASE.
 * - El middleware modulo.visualgas:respaldos valida el A06 antes de llegar.
 */
class RespaldosController extends Controller
{
    private const LIMITE_LISTA = 200;

    /* ===================================================================== */
    /* GET /api/respaldos                                                    */
    /* ===================================================================== */
    public function listar(Request $request): JsonResponse
    {
        $validado = Validator::make($request->query(), [
            'busqueda' => ['nullable', 'string', 'max:80'],
        ])->validated() + ['busqueda' => trim((string) $request->query('busqueda', ''))];

        $consulta = DB::table(Schema::t('respaldos'))
            ->orderByDesc('respaldado_en')
            ->orderByDesc('id')
            ->limit(self::LIMITE_LISTA);

        if ($validado['busqueda'] !== '') {
            $consulta->where(function ($filtro) use ($validado) {
                $filtro->where('nombre', 'ilike', '%'.$validado['busqueda'].'%')
                    ->orWhere('descripcion', 'ilike', '%'.$validado['busqueda'].'%');
            });
        }

        $respaldos = $consulta->get([
            'id', 'nombre', 'descripcion', 'tamano_bytes', 'estado', 'respaldado_en',
        ])->all();

        return response()->json([
            'total' => count($respaldos),
            'respaldos' => array_map(static fn (object $r) => [
                'id' => (int) $r->id,
                'nombre' => (string) $r->nombre,
                'descripcion' => $r->descripcion,
                'tamano_bytes' => (int) $r->tamano_bytes,
                'estado' => (string) $r->estado,
                'respaldado_en' => (string) $r->respaldado_en,
            ], $respaldos),
        ]);
    }

    /* ===================================================================== */
    /* GET /api/respaldos/pdf (barryvdh/laravel-dompdf)                      */
    /* ===================================================================== */
    public function pdf(Request $request): mixed
    {
        $validado = Validator::make($request->query(), [
            'busqueda' => ['nullable', 'string', 'max:80'],
        ])->validated() + ['busqueda' => trim((string) $request->query('busqueda', ''))];

        $consulta = DB::table(Schema::t('respaldos'))
            ->orderByDesc('respaldado_en')
            ->orderByDesc('id')
            ->limit(500);

        if ($validado['busqueda'] !== '') {
            $consulta->where(function ($filtro) use ($validado) {
                $filtro->where('nombre', 'ilike', '%'.$validado['busqueda'].'%')
                    ->orWhere('descripcion', 'ilike', '%'.$validado['busqueda'].'%');
            });
        }

        $filas = $consulta->get([
            'id', 'nombre', 'descripcion', 'tamano_bytes', 'estado', 'respaldado_en',
        ])->all();

        $datos = array_map(static function (object $r): array {
            $bytes = (int) $r->tamano_bytes;
            $gb = $bytes / 1024 ** 3;
            $tamano = $bytes <= 0 ? 'N/A' : ($gb >= 1 ? round($gb, 1).' GB' : round($bytes / 1024 ** 2, 1).' MB');

            return [
                'id' => (int) $r->id,
                'nombre' => (string) $r->nombre,
                'descripcion' => $r->descripcion,
                'tamano' => $tamano,
                'fecha' => \Carbon\Carbon::parse((string) $r->respaldado_en)->format('d/m/Y H:i'),
                'estado' => (string) $r->estado,
            ];
        }, $filas);

        $pdf = Pdf::loadView('pdf.respaldos', [
            'filas' => $datos,
            'generado' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('respaldos_visualgas.pdf');
    }
}
