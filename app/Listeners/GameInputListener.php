<?php

namespace App\Listeners;

use App\Models\Ship;
use Illuminate\Support\Str;
use Vehikl\Realtime\Events\Client\Connect;
use Vehikl\Realtime\Events\Client\Message;

class GameInputListener
{
    public function connect(Connect $event): void
    {
        $ship = Ship::query()->create([
            'uuid' => Str::uuid()->toString(),
            'connection_id' => $event->clientIdentifier,
        ]);

        $event->reply(json_encode([
            'type' => 'connected',
            'you' => $ship->uuid,
            'ship' => $ship->toArray(),
        ]));
    }

    public function message(Message $event): void
    {

    }

    public function disconnect(Message $event): void
    {

    }

}
