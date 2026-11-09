<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * Usuario VisualGas (global.usuarios | test.usuarios).
 *
 * - contrasena_hash: bcrypt/argon2 vía Hash::make(); nunca texto plano.
 * - Asignación masiva SEGURA: fillable explícito, nunca $guarded = [].
 * - Timestamps administrados por el propio sistema (creado_en/actualizado_en
 *   con default en BD); Eloquent no gestiona prepared' automatizados.
 */
class Usuario extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'correo',
        'nombre_completo',
        'contrasena_hash',
        'activo',
        'requiere_cambio_contrasena',
        'bloqueado_hasta',
        'ultimo_acceso_en',
    ];

    protected $hidden = ['contrasena_hash'];

    protected $casts = [
        'activo' => 'boolean',
        'requiere_cambio_contrasena' => 'boolean',
        'bloqueado_hasta' => 'datetime',
        'ultimo_acceso_en' => 'datetime',
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('usuarios'));
        parent::__construct($attributes);
    }

    public function seguridad(): HasOne
    {
        return $this->hasOne(SeguridadUsuario::class, 'usuario_id');
    }
}
