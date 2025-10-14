<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    /** @use HasFactory<\Database\Factories\ShipFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'p' => 'object',
        'v' => 'object',
    ];
}
