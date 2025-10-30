<?php

namespace App\Messages;

class Factory
{
    const array MAPPING = [
        'move' => Move::class,
    ];

    public function get(string $clientId, string $message): ?MessageBase
    {
        $json = json_decode($message, true);
        $class = self::MAPPING[$json['type']] ?? null;
        if (!$class) {
            return null;
        }
        return new $class($clientId, $json);
    }

}
