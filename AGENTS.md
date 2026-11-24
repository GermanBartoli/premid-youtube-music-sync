# Guía de premid-youtube-music-sync

La actividad está en `activity`. Revisá `dataGetter.ts` para la lectura de la pista y `listeningPresence.ts` para el estado enviado a Discord. Las pruebas de `tests` cubren carátula, sincronización y marcas de tiempo.

Seguí el flujo de CI para preparar el proyecto oficial de PreMiD, ejecutar Vitest y compilar el ZIP con su CLI. Para validar el resultado visible, cargá el ZIP en PreMiD, cambiá de pista en YouTube Music y comprobá título, carátula y tiempo en Discord.

Consultá los pasos de validación en [el flujo de GitHub Actions](.github/workflows/validar.yml).
