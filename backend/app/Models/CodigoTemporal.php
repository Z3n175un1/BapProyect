<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Códigos temporales con hash y vencimiento (2FA_BACKUP, verificación de correo).
 */
class CodigoTemporal extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = null;

    protected $fillable = [
        'usuario_id',
        'proposito',
        'codigo_hash',
        'expiracion',
        'uso_maximo',
        'usos_realizados',
        'validaciones_fallidas',
        'usado_en',
    ];

    protected $casts = [
        'expiracion' => 'datetime',
        'usado_en' => 'datetime',
        'creado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('codigos_temporales'));
        parent::__construct($attributes);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function estaDisponible(): bool
    {
        return $this->usado_en === null
            && $this->usos_realizados < $this->uso_maximo
            && $this->expiracion->isFuture();
    }
}
