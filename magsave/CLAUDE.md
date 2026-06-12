@AGENTS.md

# Magsave

App de finanzas personales en React Native/Expo (regalo personalizado para Magda). 100% local: SQLite + drizzle-orm, sin cuenta ni nube. El spec original completo está en `../prompt_claudecode.md`.

## Comandos

- `npm install` y `npx expo start` — desarrollo
- `npx tsc --noEmit` — typecheck (debe quedar limpio antes de commitear)
- `npx drizzle-kit generate` — regenerar migraciones tras cambiar `db/schema.ts`
- `eas build --platform android --profile preview` — APK (requiere `eas login`)

## Decisiones que no hay que romper

- **Tema oscuro** (rediseño pedido por el usuario sobre una referencia visual): fondo `#0E0E10`, cards `#1A1A1E`, acentos violeta `#7C6FF7` + cyan `#8AD8EA`. La paleta vive en `constants/colors.ts` y DEBE mantenerse en sincronía con `tailwind.config.js` (mismos valores). Los tintes para fondos de chips/cards son `primaryDim`/`successDim`/`dangerDim` — no volver a hardcodear hexes claros en las pantallas.

- **victory-native fijado en v36** (legacy, API `VictoryPie`/`VictoryBar`). Las versiones XL (≥40) cambiaron la API completa; no actualizar sin reescribir `components/charts/`.
- **Íconos: phosphor-react-native** (se migró desde lucide). Los componentes usan props `size`, `color` (string, no `ColorValue`) y `weight` (`regular`/`fill`/`duotone`/`bold`); no existe `strokeWidth`. El registro de íconos de categorías vive en `components/CategoryIcon.tsx` y debe estar en sincronía con los nombres guardados por `db/seed.ts` (`Pizza`, `Bus`, `House`, `Pill`, `FilmSlate`, `TShirt`, `PawPrint`, `BookOpen`, `Briefcase`, `Gift`).
- **Zustand solo guarda estado de UI.** La data vive en SQLite; las pantallas se refrescan con el contador `dataVersion` (`stores/ui.store.ts`) que se incrementa tras cada escritura (ver `notifyDataChanged()`).
- Migraciones drizzle embebidas vía `babel-plugin-inline-import` (`.sql` en `metro.config.js` y `babel.config.js`); se aplican con `useMigrations` en `app/_layout.tsx`.

## Bugs conocidos

- [ ] **CRASH: el tab Reportes se cae en el APK** (reportado por el usuario en un Galaxy S25, build `a784d6e3`). Sospechosos principales: `components/charts/MonthlyBars.tsx` / `CategoryPie.tsx` (victory-native v36 con React 19 / datos vacíos en `VictoryGroup`). Reproducir con datos vacíos y con datos; revisar logcat o `adb logcat` si hay dispositivo. Prioridad alta — investigar antes del rediseño o como parte de él (el rediseño cambia la librería de charts, ver abajo).

## Pendientes

- [ ] **Rediseño del front** según la guía del usuario (sección siguiente). Incluye reemplazar victory-native por `react-native-gifted-charts` o SVG propio — eso probablemente resuelve también el crash de Reportes.
- [ ] **Capturas de pantalla** para las tablas de placeholders del README (requiere emulador o dispositivo; no hay ninguno configurado en esta máquina).
- [ ] **Probar en dispositivo real**: notificaciones de gastos fijos (recordatorio día anterior 9am), haptics, confetti al completar meta, swipe-para-eliminar.
- [x] **Generar el APK**: hecho — proyecto EAS `@nyokan/magsave`, build preview `a784d6e3` (12-jun-2026). Para nuevos builds: `npx eas-cli build --platform android --profile preview --non-interactive --no-wait` (la sesión de `eas login` ya quedó iniciada en esta máquina).
- [x] **Ícono y splash personalizados**: generados con `scripts/generate-icons.js` (chanchito de Phosphor sobre violeta `#7C6FF7`). Para regenerarlos: `npm i --no-save sharp && node scripts/generate-icons.js`.

El nombre del saludo del Home es la constante `USER_NAME` en `app/(tabs)/index.tsx` (hoy: "Magda").

Optimización opcional: importar los íconos de phosphor de forma individual (`phosphor-react-native/src/icons/House`) en vez del barrel reduce ~4.5MB del bundle (hoy 13MB en hbc).

## Backend

No hay backend y es **a propósito** (spec original: "Sin cuenta, sin nube"). Toda la data vive en SQLite en el teléfono. NO crear Supabase/Firebase salvo que el usuario pida explícitamente sincronización multi-dispositivo o respaldo en la nube; en ese caso, discutir primero el alcance (auth, migración de datos locales, conflictos).

## Rediseño front pendiente — guía paso a paso (del usuario, 12-jun-2026)

> Nota: la primera versión de la guía mencionaba lucide, pero el usuario confirmó después (su ejemplo del navbar usa Phosphor con `weight`) — **se mantiene phosphor-react-native**.

### 1. Librerías a instalar/usar
- `expo-linear-gradient` — tarjetas con gradientes de color.
- `expo-blur` — Glassmorphism en fondos, modales y la tab bar flotante.
- `react-native-gifted-charts` (o `react-native-svg` a mano) — gráfico de dona de gastos. **Reemplaza a victory-native** (esto debería eliminar el crash de Reportes; al quitar victory, borrar el pin de v36 de las decisiones).
- Tipografía: sans-serif geométrica — **Poppins** o **Inter** (vía `expo-font` / `@expo-google-fonts`). Ojo: el spec original decía "sin fuentes externas"; la guía nueva lo supersede.

### 2. Paleta nueva (actualizar `constants/colors.ts` + `tailwind.config.js` en sincronía)
- Fondo principal: `#121212` o `#161618` (negro/gris muy oscuro, no negro puro)
- Cards secundarias: `#1E1E24` (gris con toque frío)
- Acentos (gradientes): morado neón `#7F56D9 → #9D71FD`, azul claro `#47B0FF`, verde brillante (ingresos/positivos) `#22C55E` o `#10B981`
- Texto: blanco para títulos, `#A0A0A0` para subtítulos y fechas

### 3. Componentes nuevos a construir (atómicos)
- **`FloatingTabBar`**: ocultar la tab bar por defecto del navigator y crear una custom, `position: 'absolute', bottom: 20`, fondo semitransparente con `BlurView`, `borderRadius: 40`, indicador circular morado en la pestaña activa.
- **`GlassCard`**: base de las tarjetas tipo "Housing/Food/Saving" del mockup. Acepta `children`; `LinearGradient` como fondo + borde fino `borderWidth: 1` color `rgba(255,255,255,0.1)`.
- **`TransactionRow`**: fila de transacción — `flexDirection: 'row'`, `alignItems: 'center'`; círculo gris oscuro con el ícono, centro con título + fecha (subtítulo), monto a la derecha. (Hoy existe `components/TransactionItem.tsx` — refactorizarlo a esta estructura.)
- **`SummaryHeader`**: cabecera de balance ("Planned Expenses" / "My Balance") — textos grandes + badge dinámico (el "+" o el porcentaje en verde).

### 4. Refactor de pantallas
**Home (Dashboard)** — `app/(tabs)/index.tsx`:
- Cabecera con avatar, saludo ("Hi, Magda") y selector de mes o cuenta.
- `SummaryHeader` con el monto principal grande; a su derecha el gráfico de dona (pie con un círculo del color del fondo superpuesto al centro para el hueco).
- Carrusel horizontal (`ScrollView`/`FlatList` `horizontal` sin indicador) de `GlassCard`s.
- Debajo del carrusel: dos bloques de ingresos/gastos rápidos con íconos y montos, fondo ligeramente más claro que el negro base.

**Gastos/Transacciones** — `app/(tabs)/gastos.tsx`:
- Usar `SectionList` (no FlatList/map) para los encabezados de grupo tipo "This Month" / "Last Month" de forma nativa.
- En `renderItem`, instanciar `TransactionRow`.

### 5. Detalle adicional del usuario (segunda entrega de la guía)

**Navbar flotante (tab bar)** — en `app/(tabs)/_layout.tsx`, vía `screenOptions`:
- `tabBarShowLabel: false` (solo íconos).
- `tabBarStyle`: `position: 'absolute'`, `bottom: 25`, `left: 20`, `right: 20`, `height: 70`, `borderRadius: 40`, `backgroundColor: '#1E1E24'` (o BlurView), `borderTopWidth: 0`, `elevation: 0`, sombra iOS suave (`shadowOpacity: 0.2`, `shadowRadius: 10`).
- `tabBarIcon`: envolver el ícono Phosphor en un `<View>` que, si está `focused`, tiene `backgroundColor: '#7F56D9'`, `padding: 12`, `borderRadius: 24` (la "pastilla" circular activa); ícono blanco + `weight="fill"` activo, gris `#8E8E93` + `regular` inactivo.

**`<GlassMetricCard />`** (tarjetas Housing/Food/Saving):
- `<View>` con `borderRadius: 24`, padding ~16, `overflow: 'hidden'`.
- Fondo `LinearGradient` (la morada: morado medio → azul oscuro/negro en diagonal).
- Borde glass: `borderWidth: 1`, `borderColor: 'rgba(255,255,255,0.1)'`.
- Contenido: ícono Phosphor pequeño arriba-izquierda, título en `#A0A0A0`, monto blanco bold, badge/píldora con porcentaje abajo-derecha.

**`<TransactionItem />`** (refactor del actual):
- Fila `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `marginBottom: 16`.
- Izquierda: círculo 48×48 (`borderRadius: 24`) fondo `#2A2A30` con el ícono Phosphor al centro; al lado columna con título blanco + subtítulo (fecha/hora) gris.
- Derecha: monto en blanco alineado a la derecha.

**`<BalanceHeader />`**:
- Recibe el monto total; `fontSize: 48`, `fontWeight: 'bold'`, blanco. Botón pequeño de filtro al lado (3 puntos o sliders).

**Home (`index.tsx`) — orden de secciones:**
1. Saludo: fila con foto de perfil circular + "Hi, Magda"; botón de notificaciones al extremo derecho.
2. Resumen: `<BalanceHeader />` ("Planned Expenses" + monto); a la derecha, gráfico de dona (react-native-svg con `strokeDasharray` o librería).
3. Scroll horizontal de `<GlassMetricCard />`.
4. Dos bloques lado a lado (`flex: 1` + gap) "Salary"/"Interest" con íconos tenues de fondo.
- Todo envuelto en `SafeAreaView` con `backgroundColor: '#121212'`.

**Gastos (`gastos.tsx`):**
- Arriba: botón atrás (`CaretLeft`) + título centrado; debajo `<BalanceHeader />` con el balance.
- `<SectionList />` con secciones por período ("This Month"/"Last Month"); `renderSectionHeader` con título del mes (+ línea separadora opcional); `renderItem` → `<TransactionItem />`. Reemplaza el empty state actual.
- **Espaciado clave:** `contentContainerStyle={{ paddingBottom: 100 }}` en todas las listas para que el navbar flotante no tape el último ítem.
