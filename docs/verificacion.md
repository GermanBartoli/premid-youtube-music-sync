# Verificaciones

## v0.0.2

- Actividad `3.4.6` en `metadata.json`; ZIP `YouTube-Music-PreMiD-sincronizacion-v0.0.2.zip` generado con la CLI oficial para el release v0.0.2.
- `npx vitest run tests`: **8 pruebas correctas**, incluida la secuencia de cuatro cambios rápidos que conserva la última pista sin enviar cada estado intermedio.
- `node cli/dist/index.js build "YouTube Music" --zip`: compilación y verificación de tipos correctas. El ZIP contiene `metadata.json`, `presence.js` y `YouTube Music.json`.
- Navegador: en la playlist **Funk 2**, cinco pistas consecutivas mostraron título y duración nuevos; el tiempo volvió al comienzo de cada pista.
- Discord web mostró durante la prueba una canción anterior. Esto confirma un retraso visible, pero por sí solo no identifica en qué parte del recorrido PreMiD → Discord ocurrió.
- Falta cargar este ZIP nuevo en PreMiD y observar su estado final en Discord. Al cambiar varias canciones en menos de 4,1 segundos, es esperado que algunas no aparezcan: se publica la más reciente.

La [referencia de Discord para `UpdateActivity`](https://github.com/discord/discord-api-docs/blob/main/developers/developer-tools/game-sdk.mdx) indica **5 actualizaciones en 20 segundos**. La [referencia de `SET_ACTIVITY`](https://github.com/discord/discord-api-docs/blob/main/developers/topics/rpc.mdx) no da una cifra específica para PreMiD; el intervalo de 4,1 segundos es una elección conservadora de esta actividad.

## Ensayos previos con la actividad 3.4.5

### Comprobaciones realizadas

- Compilación y verificación de tipos: `node cli/dist/index.js build "YouTube Music" --zip` completó correctamente en una copia de `PreMiD/Activities`.
- Pruebas de regresión: `npx vitest run tests`, con casos para cambio automático, duración anterior, respaldo con el contador visible, miniaturas de video y reemplazo tardío del reproductor.
- Estructura del ZIP: `metadata.json`, `presence.js` y `YouTube Music.json` en la raíz.
- Navegador: YouTube Music mostró título, artista, carátula y duración con los selectores usados por el código.
- Navegador: al elegir **Siguiente** en el reproductor, cambió el título y el contador volvió a cero; luego se dejó en pausa.
- Git: `git diff --check` sin errores; archivos de texto conservados en CRLF para Windows.

### Comprobación manual pendiente

No se cargó este ZIP en la extensión de PreMiD durante la preparación. Para cerrar la verificación funcional, cargá la actividad como compilada, mantené desactivada la versión oficial si ambas coinciden y comprobá en Discord estos casos:

1. Inicio de canción: título, artista, carátula y tiempo.
2. Cambio automático de canción en una playlist: el tiempo vuelve al inicio del tema nuevo y se actualiza al empezar el siguiente video.
3. Elegir **Play** en una pista de la playlist: Discord muestra el nuevo título, artista y portada sin esperar el próximo ciclo periódico.
4. Video musical: aparece la miniatura real, no la imagen transparente del reproductor.
5. Búsqueda dentro de una canción: el tiempo se ajusta a la nueva posición.
6. Pausa y reanudación: estado e intervalo coherentes.
7. Cambio de canción y recarga de YouTube Music: datos actualizados sin dejar el tema anterior.

Si falla algún caso, abrí una incidencia con navegador, versión de PreMiD, ajuste afectado y pasos para reproducirlo. Evitá publicar datos personales o de tu cuenta.
