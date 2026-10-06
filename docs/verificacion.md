# Verificación de v0.0.1

## Comprobaciones realizadas

- Compilación y verificación de tipos: `node cli/dist/index.js build "YouTube Music" --zip` completó correctamente en una copia de `PreMiD/Activities`.
- Estructura del ZIP: `metadata.json`, `presence.js` y `YouTube Music.json` en la raíz.
- Navegador: YouTube Music mostró título, artista, carátula y duración con los selectores usados por el código.
- Navegador: al reproducir, `video.video-stream.paused` pasó a `false`; al pausar, volvió a `true`.
- Git: `git diff --check` sin errores; archivos de texto conservados en CRLF para Windows.

## Comprobación manual pendiente

No se cargó este ZIP en la extensión de PreMiD durante la preparación. Para cerrar la verificación funcional, cargá la actividad como compilada, mantené desactivada la versión oficial si ambas coinciden y comprobá en Discord estos casos:

1. Inicio de canción: título, artista, carátula y tiempo.
2. Avance del contador: el tiempo continúa sin reiniciarse cada segundo.
3. Búsqueda dentro de una canción: el tiempo se ajusta a la nueva posición.
4. Pausa y reanudación: estado e intervalo coherentes.
5. Cambio de canción y recarga de YouTube Music: datos actualizados sin dejar el tema anterior.

Si falla algún caso, abrí una incidencia con navegador, versión de PreMiD, ajuste afectado y pasos para reproducirlo. Evitá publicar datos personales o de tu cuenta.
