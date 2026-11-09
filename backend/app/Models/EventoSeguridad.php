<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;

/** Eventos de seguridad (bloqueos, inicios de sesión, cambios, recuperaciones). */
class EventoSeguridad extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id',
        'tipo_evento',
        'descripcion',
        'severidad',
        'direccion_ip',
        'agente_usuario',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('eventos_seguridad'));
        parent::__construct($attributes);
    }
}
