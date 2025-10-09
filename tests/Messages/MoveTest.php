<?php

namespace Tests\Messages;

use App\Messages\Move;
use App\Models\Ship;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MoveTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function itHasJsonWithAKeyOfTypeAndValueOfMove(): void
    {
        $ship = Ship::factory()->create(['angle' => 69]);

        $json = [
            'angle' => 45,
        ];

        $move = new Move();
        $move->handle($json);

        $ship->refresh();
        // assert that the ship in the DB has an updated angle
        $this->assertEquals(45, $ship->angle);
        // assert that the ship in the DB has an updated position
        // assert that the ship in the DB has an updated velocity
    }
}
