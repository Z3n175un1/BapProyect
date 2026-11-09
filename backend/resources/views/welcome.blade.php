<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Acceso denegado</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
                height: 100%;
                background: #000;
                color: #fff;
                font-family: "Impact", "Arial Black", sans-serif;
            }
            body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 2rem;
                text-align: center;
                gap: 2rem;
            }
            img {
                max-width: 100%;
                max-height: 70vh;
                height: auto;
                border-radius: 4px;
            }
            p {
                font-size: clamp(1.5rem, 4vw, 2.5rem);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                line-height: 1.2;
            }
        </style>
    </head>
    <body>
        <img src="{{ asset('images/meme.png') }}" alt="Meme">
        <p>No tienes acceso aquí, así que sal de aquí, engendro del mal.</p>
    </body>
</html>