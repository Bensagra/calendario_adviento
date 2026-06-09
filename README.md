# Calendario de adviento romántico

Una web mobile-first con 20 sorpresas que se desbloquean por fecha. Está hecha con Next.js, TypeScript, App Router y Tailwind CSS, sin backend ni base de datos.

## Empezar

Necesitás Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Personalizar fechas y modo de prueba

Editá `src/data/config.ts`:

```ts
export const TEST_MODE = true;
export const REUNION_DATE = "2026-06-30";
```

- `TEST_MODE = true`: todos los días se pueden abrir.
- `TEST_MODE = false`: cada sorpresa respeta su `unlockDate`.
- `REUNION_DATE`: fecha usada por el contador superior.

Antes de compartir la web, acordate de pasar `TEST_MODE` a `false`.

## Cambiar días, textos y tipos

Toda la configuración está en `src/data/days.ts`. Cada día acepta:

- `video`: requiere un archivo `.mp4`.
- `image`: requiere un archivo `.jpg`.
- `audio`: requiere un archivo `.mp3`.
- `text`: usa el campo `text` y no necesita archivo.
- `coupon`: usa el campo `text` y no necesita archivo.

Podés cambiar títulos, subtítulos, textos, tipos, rutas y fechas directamente en ese archivo.

## Agregar URLs de YouTube e imágenes hosteadas

Editá `public/content/urls.json`. El archivo tiene una entrada para cada día:

```json
{
  "1": "https://www.youtube.com/watch?v=ID_DEL_VIDEO",
  "4": "https://mis-imagenes.com/dia-4.jpg",
  "6": "https://youtu.be/ID_DEL_VIDEO"
}
```

- Para videos acepta URLs normales de YouTube, `youtu.be`, Shorts, Live o Embed.
- Para imágenes usá la URL pública directa de la imagen.
- Dejando el valor como `""`, la web intenta usar el archivo local configurado en `src/data/days.ts`.
- Las URLs del JSON tienen prioridad sobre los archivos locales.

Los días de texto y cupón no necesitan URL.

## Usar archivos locales

Guardá los archivos dentro de `public/content/` usando el nombre configurado en `src/data/days.ts`.

Ejemplos:

```text
public/content/1.mp4
public/content/3.mp3
public/content/4.jpg
public/content/6.mp4
```

Si un archivo todavía no existe, la sorpresa muestra un mensaje amigable y la app sigue funcionando.

También podés usar una URL externa directa para un audio o un archivo MP4.

## Scripts

```bash
npm run dev     # desarrollo local
npm run lint    # análisis de código
npm run build   # build de producción
npm run start   # servir el build
```

## Deploy en Vercel

1. Subí este proyecto a un repositorio de GitHub, GitLab o Bitbucket.
2. Entrá a [vercel.com/new](https://vercel.com/new).
3. Importá el repositorio.
4. Vercel detecta Next.js automáticamente; no hace falta configurar variables de entorno.
5. Hacé deploy.

También podés instalar Vercel CLI y ejecutar:

```bash
npx vercel
```

Los días vistos se guardan en `localStorage` del navegador de cada persona.
