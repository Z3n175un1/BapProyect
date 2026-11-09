<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Sesión por token opaco (hash SHA-256 hex). Revocación por UPDATE revocado_en.
 */
class TokenAutenticacion extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id',
        'token_hash',
        'nombre_dispositivo',
        'direccion_ip',
        'agente_usuario',
        'ultimo_uso_en',
        'expiracion',
        'revocado_en',
    ];

    protected $casts = [
        'ultimo_uso_en' => 'datetime',
        'expiracion' => 'datetime',
        'revocado_en' => 'datetime',
        'creado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('tokens_autenticacion'));
        parent::__construct($attributes);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function estaVigente(): bool
    {
        return $this->revocado_en === null;
    }
}
