<?php

namespace App\Listeners;

use App\Messages\Move;
use App\Messages\MoveAttributes;
use App\Models\Ship;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Support\Str;
use Vehikl\Realtime\Events\Client\Connect;
use Vehikl\Realtime\Events\Client\Disconnect;
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
        app()->make(Move::class)->handle(MoveAttributes::fromMessage($event));
        // 'move' => I'm Bob, and I just updated my p, v, a ==>> broadcast to other players
    }

    public function disconnect(Disconnect $event): void
    {

    }

    public function subscribe(Dispatcher $event)
    {
        return [
            Connect::class => 'connect',
            Message::class => 'message',
            Disconnect::class => 'disconnect',
        ];
    }

}
