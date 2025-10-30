<?php

namespace App\Messages;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;
use Vehikl\Realtime\Events\Client\Message;

class MessageBase
{
    protected array $attributes;

    public static function fromMessage(Message $message): self
    {
        return new self($message->clientIdentifier, json_decode($message->message, true));
    }

    public function __construct(protected string $clientId, protected array $json)
    {
        $this->attributes = Validator::make($json, $this->rules())->validate();
    }

    protected function rules(): array
    {
        return [];
    }

    public function get(?string $key = null, $default = null): mixed
    {
        if (is_null($key)) {
            return $this->attributes;
        }

        return Arr::get($this->attributes, $key, $default);
    }

    public function handle()
    {
    }
}
