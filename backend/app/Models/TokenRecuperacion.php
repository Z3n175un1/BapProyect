<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tokens de un solo uso para recuperación de contraseña (hash SHA-256). */
class TokenRecuperacion extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id',
        'proposito',
        'token_hash',
        'expiracion',
        'usado_en',
        'usado_desde',
    ];

    protected $casts = [
        'expiracion' => 'datetime',
        'usado_en' => 'datetime',
        'creado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('tokens_recuperacion'));
        parent::__construct($attributes);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function estaVigente(): bool
    {
        return $this->usado_en === null && $this->expiracion->isFuture();
    }
}
