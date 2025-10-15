<?php

return [
    'server' => env('REALTIME_SERVER', 'websocket'),
    'queue' => 'redis',
    'client' => [
        'timeout' => env('REALTIME_CLIENT_TIMEOUT', 180),
    ],

    'servers' => [
        'websocket' => [
            'class' => \Vehikl\Realtime\Services\Server\WebsocketServer::class,
            'port' => env('REALTIME_WEBSOCKET_PORT', env('REALTIME_SERVE_PORT', 8081)),
            'ssl' => env('REALTIME_WEBSOCKET_SSL', false),
            'uri-format' => '/identifier/:identifier',/**/
            'ping-interval' => env('REALTIME_WEBSOCKET_PING_INTERVAL', 30),
            'client-list-class' => \Vehikl\Realtime\Services\ClientList\InMemoryClients::class,
        ],
        'tcp' => [
            'class' => \Vehikl\Realtime\Services\Server\TcpServer::class,
            'port' => env('REALTIME_TCP_PORT', env('REALTIME_SERVE_PORT', 8081)),
            'addr' => env('REALTIME_TCP_ADDR', 'localhost'),
            'max-connections' => env('REALTIME_TCP_MAX_CONNECTIONS', 100),
            'server' => [
                'options' => [
                    SO_REUSEADDR => [1],
                    SO_REUSEPORT => [1],
                    SO_LINGER => ['l_onoff' => 1, 'l_linger' => 0],
                ],
            ],
            'client-list-class' => \Vehikl\Realtime\Services\ClientList\InMemoryClients::class,
        ],
        'long-poll' => [
            'class' => null,
            'timeout' => env('REALTIME_LONG_POLL_TIMEOUT', 60),
            'requests-per-second' => env('REALTIME_LONG_POLL_REQUESTS_PER_SECOND', 20),
            'routes' => [
                'prefix' => '/realtime/long-poll',
                'as' => 'realtime.long-poll.',
            ],
            'client-list-class' => \Vehikl\Realtime\Services\ClientList\RedisClients::class,
        ],
    ],

    'events' => [
        'default' => [
            'boot' => \Vehikl\Realtime\Events\Client\Boot::class,
            'tick' => \Vehikl\Realtime\Events\Client\Tick::class,

            'connect' => \Vehikl\Realtime\Events\Client\Connect::class,
            'disconnect' => \Vehikl\Realtime\Events\Client\Disconnect::class,
            'message' => \Vehikl\Realtime\Events\Client\Message::class,
        ]
    ],

    'queues' => [
        'redis' => [
            'prefix' => env('REALTIME_QUEUE_REDIS_PREFIX', 'realtime:messages'),
            'broadcast-key' => env('REALTIME_QUEUE_REDIS_BROADCAST_KEY', 'realtime:broadcasts'),
            'client-list' => env('REALTIME_QUEUE_REDIS_LIST_CLIENT', 'realtime:client-list'),
        ]
    ]
];
