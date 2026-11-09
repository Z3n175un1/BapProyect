<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Usuarios BAP</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
        .cabecera { background: #0f172a; color: #fff; padding: 14px 18px; }
        .cabecera h1 { font-size: 18px; margin: 0; }
        .cabecera p { font-size: 10px; margin: 4px 0 0; color: #fae77a; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #eab308; color: #0f172a; text-align: left; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
        td { border-bottom: 1px solid #e2e8f0; padding: 6px 8px; }
        .inactivo { color: #b91c1c; font-weight: bold; }
        .pie { margin-top: 14px; font-size: 9px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="cabecera">
        <h1>VisualGas · Reporte de usuarios</h1>
        <p>BAP SRL · generado por {{ $nombre_admin }} · {{ $generado }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Roles</th>
                <th>Empresas</th>
                <th>Último acceso</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($filas as $fila)
                <tr>
                    <td>{{ $fila['id'] }}</td>
                    <td>{{ $fila['nombre'] }}</td>
                    <td>{{ $fila['correo'] }}</td>
                    <td>{{ $fila['roles'] }}</td>
                    <td>{{ $fila['empresas'] }}</td>
                    <td>
                        @if ($fila['ultimo'])
                            {{ \Carbon\Carbon::parse($fila['ultimo'])->format('d/m/Y H:i') }}
                        @else
                            Sin acceso
                        @endif
                    </td>
                    <td @class(['inactivo' => $fila['estado'] === 'De baja'])>{{ $fila['estado'] }}</td>
                </tr>
            @empty
                <tr><td colspan="7">Sin usuarios en tu ámbito de gestión.</td></tr>
            @endforelse
        </tbody>
    </table>
    <p class="pie">Documento generado por VisualGas · uso interno. No compartir fuera de la empresa.</p>
</body>
</html>
