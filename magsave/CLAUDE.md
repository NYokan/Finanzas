@AGENTS.md

# Magsave

App de finanzas personales en React Native/Expo (regalo personalizado para Magda). 100% local: SQLite + drizzle-orm, sin cuenta ni nube. El spec original completo está en `../prompt_claudecode.md`.

## Comandos

- `npm install` y `npx expo start` — desarrollo
- `npx tsc --noEmit` — typecheck (debe quedar limpio antes de commitear)
- `npx drizzle-kit generate` — regenerar migraciones tras cambiar `db/schema.ts`
- `eas build --platform android --profile preview` — APK (requiere `eas login`)

## Decisiones que no hay que romper

- **victory-native fijado en v36** (legacy, API `VictoryPie`/`VictoryBar`). Las versiones XL (≥40) cambiaron la API completa; no actualizar sin reescribir `components/charts/`.
- **lucide-react-native ≥1.x renombró íconos**: `House` (no `Home`), `ChartColumn` (no `BarChart2`), `TriangleAlert`, `CircleCheck`. Ya no exporta el mapa `icons`; el registro de íconos de categorías vive en `components/CategoryIcon.tsx` y debe estar en sincronía con `db/seed.ts`.
- **Zustand solo guarda estado de UI.** La data vive en SQLite; las pantallas se refrescan con el contador `dataVersion` (`stores/ui.store.ts`) que se incrementa tras cada escritura (ver `notifyDataChanged()`).
- Migraciones drizzle embebidas vía `babel-plugin-inline-import` (`.sql` en `metro.config.js` y `babel.config.js`); se aplican con `useMigrations` en `app/_layout.tsx`.

## Pendientes

- [ ] **Generar el APK**: requiere iniciar sesión con la cuenta de Expo (`npx eas login`, es interactivo) y luego `eas build --platform android --profile preview`. Compartir el link de descarga (el README ya tiene la guía de instalación para usuario no técnico).
- [ ] **Capturas de pantalla** para las tablas de placeholders del README (requiere emulador o dispositivo; no hay ninguno configurado en esta máquina).
- [ ] **Probar en dispositivo real**: notificaciones de gastos fijos (recordatorio día anterior 9am), haptics, confetti al completar meta, swipe-para-eliminar.
- [x] **Ícono y splash personalizados**: generados con `scripts/generate-icons.js` (chanchito de lucide sobre violeta `#7C6FF7`). Para regenerarlos: `npm i --no-save sharp && node scripts/generate-icons.js`.

El nombre del saludo del Home es la constante `USER_NAME` en `app/(tabs)/index.tsx` (hoy: "Magda").
