<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ship extends Model
{
    /** @use HasFactory<\Database\Factories\ShipFactory> */
    use HasFactory;

    protected $guarded = [];

    protected function coordsToXy(string $coordinates): array
    {
        list($x, $y) = explode(',', $coordinates);
        return [
            'x' => floatval($x),
            'y' => floatval($y),
        ];
    }

    public function toArray(): array
    {
        return [
            ...parent::toArray(),
            'p' => $this->coordsToXy($this->p),
            'v' => $this->coordsToXy($this->v),
            'updated_at' => $this->updated_at->timestamp,
        ];
    }
}
