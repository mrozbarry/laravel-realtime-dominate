<?php

namespace App\Messages;

use Illuminate\Support\Facades\Validator;
use Vehikl\Realtime\Events\Client\Message;

class MoveAttributes
{
    public array $attributes;

    public function __construct(protected(set) string $clientId, protected(set) array $json)
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
            'angle' => ['required', 'numeric', 'min:0', 'max:360'],
            'p' => ['required', 'array'],
            'p.x' => ['required', 'numeric'],
            'p.y' => ['required', 'numeric'],
            'v' => ['required', 'array'],
            'v.x' => ['required',  'numeric'],
            'v.y' => ['required', 'numeric'],
        ];
    }
}
