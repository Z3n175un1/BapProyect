<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Respaldos VisualGas</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
        .cabecera { background: #0f172a; color: #fff; padding: 14px 18px; }
        .cabecera h1 { font-size: 18px; margin: 0; }
        .cabecera p { font-size: 10px; margin: 4px 0 0; color: #fae77a; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #eab308; color: #0f172a; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
        td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; }
        .fallido { color: #b91c1c; font-weight: bold; }
        .enproceso { color: #a16207; font-weight: bold; }
        .pie { margin-top: 14px; font-size: 9px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="cabecera">
        <h1>VisualGas · Registro de respaldos</h1>
        <p>BAP SRL · generado el {{ $generado }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Archivo</th>
                <th>Descripción</th>
                <th>Tamaño</th>
                <th>Fecha de respaldo</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($filas as $fila)
                <tr>
                    <td>{{ $fila['id'] }}</td>
                    <td>{{ $fila['nombre'] }}</td>
                    <td>{{ $fila['descripcion'] ?? '—' }}</td>
                    <td>{{ $fila['tamano'] }}</td>
                    <td>{{ $fila['fecha'] }}</td>
                    <td @class(['fallido' => $fila['estado'] === 'FALLIDO', 'enproceso' => $fila['estado'] === 'EN_PROCESO'])>{{ $fila['estado'] }}</td>
                </tr>
            @empty
                <tr><td colspan="6">Sin respaldos registrados.</td></tr>
            @endforelse
        </tbody>
    </table>
    <p class="pie">Documento generado por VisualGas · uso interno. No compartir fuera de la empresa.</p>
</body>
</html>
