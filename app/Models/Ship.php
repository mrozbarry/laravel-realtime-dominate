<?php

namespace App\Models;

use Database\Factories\ShipFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    /** @use HasFactory<ShipFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'p' => 'object',
        'v' => 'object',
        'inputs' => 'object',
    ];

    public function toMessage(): array
    {
        $data = $this->toArray();
        unset($data['connection_id']);

        return $data;
    }
}
