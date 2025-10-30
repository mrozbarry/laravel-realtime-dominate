<?php

namespace Tests\Messages;

use App\Messages\Move;
use App\Messages\MoveAttributes;
use App\Models\Ship;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Vehikl\Realtime\Events\Client\Message;

class MoveTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function itHasJsonWithAKeyOfTypeAndValueOfMove(): void
    {
        $ship = Ship::factory()->create(['angle' => 69]);

        $message = new Message($ship->connection_id, json_encode([
            'angle' => 45.69,
            'p' => ['x' => 0, 'y' => 0],
            'v' => ['x' => 69, 'y' => 420]
        ]));

        $move = Move::fromMessage($message);
        $move->handle();

        $this->assertDatabaseHas(Ship::class, [
            'connection_id' => $ship->connection_id,
            'angle' => 45.69,
            'p' => '{"x":0,"y":0}',
            'v' => '{"x":69,"y":420}',
        ]);
    }
}
