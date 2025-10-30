<?php

namespace App\Messages;

use App\Models\Ship;
use Illuminate\Support\Facades\RateLimiter;
use Vehikl\Realtime\Contracts\Dispatcher;

class Move extends MessageBase
{
    protected function rules(): array
    {
        return [
            'angle' => ['required', 'numeric'],
            'p' => ['required', 'array'],
            'p.x' => ['required', 'numeric'],
            'p.y' => ['required', 'numeric'],
            'v' => ['required', 'array'],
            'v.x' => ['required', 'numeric'],
            'v.y' => ['required', 'numeric'],
            'inputs' => ['array'],
            'inputs.thrust' => ['boolean'],
            'inputs.break' => ['boolean'],
        ];
    }

    public function handle(): void
    {
        $ship = Ship::query()
            ->where('connection_id', $this->clientId)
            ->first();

        $ship->update($this->attributes);

        RateLimiter:: attempt('move:' . $this->clientId, 4, function () use ($ship) {
            Ship::query()
                ->where('connection_id', '!=', $this->clientId)
                ->each(function (Ship $otherShip) use ($ship) {
                    app()->make(Dispatcher::class)
                        ->send(
                            $otherShip->connection_id,
                            json_encode([
                                'type' => 'ship',
                                'id' => $ship->connection_id,
                                'ship' => $ship->toMessage(),
                            ]),
                        );
                });
        }, 1);


    }
}
