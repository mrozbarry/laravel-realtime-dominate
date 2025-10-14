<?php

namespace App\Messages;

use App\Models\Ship;

class Move
{
    public function handle(MoveAttributes $attributes): void
    {
        Ship::query()
            ->where('connection_id', $attributes->clientId)
            ->limit(1)
            ->update($attributes->attributes);
    }
}
