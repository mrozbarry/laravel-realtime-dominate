<?php

namespace App\Listeners;

use App\Messages\Factory;
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
        $otherShips = Ship::all();
        $ship = Ship::query()->create([
            'connection_id' => $event->clientIdentifier,
        ]);

        $event->reply(json_encode([
            'type' => 'connected',
            'you' => $ship->connection_id,
            'ship' => $ship->refresh()->toMessage(),
        ]));

        $otherShips->each(function (Ship $otherShip) use ($event) {
            $event->reply(json_encode([
                'type' => 'ship',
                'id' => $otherShip->connection_id,
                'ship' => $otherShip->toMessage(),
            ]));

        });
    }

    public function message(Message $event): void
    {
        app()
            ->make(Factory::class)
            ->get($event->clientIdentifier, $event->message)
            ?->handle();
    }

    public function disconnect(Disconnect $event): void
    {
        Ship::query()->whereConnectionId($event->clientIdentifier)->delete();
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
