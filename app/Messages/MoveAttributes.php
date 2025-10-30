<?php

namespace App\Messages;

use Illuminate\Support\Facades\Validator;
use Vehikl\Realtime\Events\Client\Message;

class MoveAttributes
{
    public array $attributes;

    public function __construct(protected string $clientId, protected array $json)
    {
        $this->attributes = Validator::make($json, $this->rules())->validate();
    }

    public static function fromMessage(Message $message): self
    {
        return new self($message->clientIdentifier, json_decode($message->message, true));
    }

    protected function rules(): array
    {
        return [

        ];
    }
}
