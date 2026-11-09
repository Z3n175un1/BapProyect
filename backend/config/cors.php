<?php

return [
    /*
     * CORS para la SPA React de VisualGas.
     * Autenticación por Bearer token (no cookies) → credentials => false.
     */
    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        env('FRONTEND_URL_BACKUP', 'http://127.0.0.1:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Content-Type', 'Authorization', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => false,
];
