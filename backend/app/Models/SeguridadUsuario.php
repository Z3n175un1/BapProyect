<?php

namespace App\Models;

use App\Support\Schema;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Configuración de seguridad por usuario (1:1).
 * totp_secreto_cifrado: cifrado AES-256-GCM del backend (Crypt).
 */
class SeguridadUsuario extends Model
{
    public const CREATED_AT = 'creado_en';
    public const UPDATED_AT = 'actualizado_en';

    /* La tabla no tiene id: su llave primaria es usuario_id (1:1). */
    protected $primaryKey = 'usuario_id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'usuario_id',
        'pregunta_secreta',
        'respuesta_secreta_hash',
        'totp_habilitado',
        'totp_secreto_cifrado',
        'totp_algoritmo',
        'totp_periodo_segundos',
        'totp_digitos',
        'inactividad_max_minutos',
    ];

    protected $casts = [
        'totp_habilitado' => 'boolean',
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime',
    ];

    public function __construct(array $attributes = [])
    {
        $this->setTable(Schema::t('seguridad_usuarios'));
        parent::__construct($attributes);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
