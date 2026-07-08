---
name: verify
description: Cómo buildear, correr y verificar visualmente esta app (calendario de adviento Next.js) en mobile y desktop.
---

# Verificar calendario_adviento

App Next.js 16 (App Router, Tailwind v4) estática. `TEST_MODE = true` en `src/data/config.ts` deja todos los días desbloqueados (dejarlo así para probar).

## Build + run

```bash
npm run build
npm run start -- -p 3123   # producción; o npm run dev
```

## Drive headless (sin instalar browsers)

No hay Playwright en el proyecto, pero hay un Chromium cacheado de Playwright en
`~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell`.

En un directorio temporal: `npm i playwright-core` y lanzar con
`chromium.launch({ executablePath })`. Viewport mobile: 390×844, `isMobile: true`, `hasTouch: true`.

Flujo clave: abrir `http://localhost:3123/`, click en la card del día (por título), el modal
(`[role="dialog"]`) es el contenedor de scroll (`el.scrollTo(...)` para probar sticky).

## Gotchas

- La grilla mobile necesita `grid-cols-1` explícito: con `display:grid` sin template, una fila
  con `overflow-x-auto` (max-content ancho) infla la columna implícita más allá del viewport.
- Descargas: escuchar el evento `download` de Playwright (el builder del día 12 exporta PNG vía canvas).
- El preview del día 12 es `position: sticky` dentro del modal: ningún ancestro intermedio
  puede tener `overflow` distinto de `visible`.
