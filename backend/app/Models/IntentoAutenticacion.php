<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;

/** Bitácora de intentos de autenticación (alimenta el bloqueo S03 de la BD). */
class IntentoAutenticacion extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id',
        'correo_intentado',
        'resultado',
        'direccion_ip',
        'agente_usuario',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('intentos_autenticacion'));
        parent::__construct($attributes);
    }
}
