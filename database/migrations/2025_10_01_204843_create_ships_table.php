<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ships', function (Blueprint $table) {
            $table->id();
            $table->string('connection_id')->index()->nullable();
            $table->json('p')->default(json_encode(['x' => 0, 'y' => 0]));
            $table->json('v')->default(json_encode(['x' => 0, 'y' => 0]));
            $table->float('angle')->default(0);
            $table->json('inputs')->default('{}');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ships');
    }
};
