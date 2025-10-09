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
            $table->string('uuid')->index();
            $table->string('connection_id')->index()->nullable();
            $table->string('sector')->index()->default('0,0');
            $table->string('p')->default('0,0');
            $table->string('v')->default('0,0');
            $table->float('angle')->default(0);
            $table->boolean('trust')->default(false);
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
