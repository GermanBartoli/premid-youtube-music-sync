# YouTube Music Sync para PreMiD

Actividad comunitaria para mostrar en Discord la canción que estás escuchando en [YouTube Music](https://music.youtube.com/) mediante [PreMiD](https://premid.app/). Este repositorio adapta la actividad oficial **YouTube Music** de PreMiD para corregir problemas de sincronización observados en la versión 3.4.1.

> Proyecto independiente. No es una publicación oficial de PreMiD, YouTube, Google ni Discord.

## Vista de la actividad

Las siguientes capturas muestran la interfaz de configuración de PreMiD usada como referencia. Fueron tomadas antes de cargar esta versión; el resultado en Discord depende de tu sesión y de tus ajustes.

| Actividad | Ajustes |
| --- | --- |
| ![Actividad YouTube Music en PreMiD](docs/media/premid-actividad.png) | ![Ajustes de YouTube Music en PreMiD](docs/media/premid-ajustes.png) |

## Qué corrige

- Identifica la canción por su título, artista e ID, sin confundir cada avance del contador con un cambio de tema.
- Calcula los tiempos desde el reproductor de video y los actualiza al reproducir o saltar dentro de la canción.
- Reconoce la pausa a partir del reproductor y vuelve a asociar los eventos si YouTube Music lo reemplaza.
- Lee título, artista y carátula de la interfaz actual de YouTube Music, con compatibilidad con selectores anteriores.
- Limpia la actividad cuando no hay reproducción y el ajuste **Show Browsing** está desactivado.

Se conservan los ajustes de PreMiD para privacidad, carátula, botones, navegación, pausa y enlaces.

## Descarga e instalación

Descargá [`YouTube-Music-PreMiD-sincronizacion.zip` desde la versión v0.0.1](https://github.com/GermanBartoli/premid-youtube-music-sync/releases/tag/v0.0.1). El ZIP contiene la actividad **compilada**; no hay que descomprimirlo.

1. Abrí la extensión de PreMiD y activá **Activity Developer Mode** en **Settings → Developer**.
2. En **Developer**, elegí **Load Compiled Activity** y seleccioná el ZIP.
3. Desactivá la actividad oficial de YouTube Music si ambas aparecen activas para el mismo sitio.
4. Abrí o recargá [music.youtube.com](https://music.youtube.com/), reproducí una canción y comprobá el estado en Discord.

La [guía de carga de PreMiD](https://docs.premid.app/v1/guide/loading-activities.html) explica este flujo. Necesitás la extensión de PreMiD y Discord de escritorio. La versión del repositorio es **v0.0.1**; el `metadata.json` conserva la numeración **3.4.2** de la actividad derivada para diferenciarla de la 3.4.1 original.

## Estructura

```text
activity/          Código TypeScript, metadatos y traducciones de la actividad
dist/              Archivos compilados que usa PreMiD
docs/media/        Capturas de la interfaz de referencia
docs/              Arquitectura y verificaciones
.github/workflows/ Validación con la herramienta oficial de PreMiD
LICENSE            Mozilla Public License 2.0
```

## Desarrollo

El código se compila con la [CLI oficial de PreMiD](https://docs.premid.app/v1/guide/installation.html) dentro del repositorio [PreMiD/Activities](https://github.com/PreMiD/Activities):

1. Copiá el contenido de `activity/` a `websites/Y/YouTube Music/` de una copia de `PreMiD/Activities`.
2. Instalá las dependencias de desarrollo siguiendo las instrucciones del proyecto oficial.
3. Ejecutá `node cli/dist/index.js build "YouTube Music" --zip` desde la raíz de esa copia.
4. El resultado aparece en `websites/Y/YouTube Music/dist/`.

El flujo automatizado en [`.github/workflows/validar.yml`](.github/workflows/validar.yml) repite la compilación y comprueba que el ZIP contenga los tres archivos requeridos. Ver [arquitectura](docs/arquitectura.md) y [verificaciones](docs/verificacion.md).

## Límites y privacidad

La actividad depende del DOM y del reproductor de YouTube Music; un cambio de su interfaz puede requerir otra actualización. Esta versión se compiló y se comprobaron los selectores y estados de reproducción/pausa en el navegador. **Todavía no se verificó el estado final en Discord con este ZIP cargado en PreMiD.**

El código de la actividad lee información de la pestaña de YouTube Music para que PreMiD muestre el estado en Discord. No incluye servidor propio, telemetría ni credenciales. Los botones y enlaces llevan a YouTube Music cuando están habilitados.

## Licencia y créditos

Basado en la [actividad YouTube Music de PreMiD](https://github.com/PreMiD/Activities/tree/main/websites/Y/YouTube%20Music), cuyo autor original figura en `activity/metadata.json`. Se conserva la licencia [Mozilla Public License 2.0](LICENSE) y se detallan los cambios y créditos en [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
