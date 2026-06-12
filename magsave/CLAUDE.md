@AGENTS.md

# Magsave

App de finanzas personales en React Native/Expo (regalo personalizado para Magda). 100% local: SQLite + drizzle-orm, sin cuenta ni nube. El spec original completo está en `../prompt_claudecode.md`.

## Comandos

- `npm install` y `npx expo start` — desarrollo
- `npx tsc --noEmit` — typecheck (debe quedar limpio antes de commitear)
- `npx drizzle-kit generate` — regenerar migraciones tras cambiar `db/schema.ts`
- `eas build --platform android --profile preview` — APK (requiere `eas login`)

## Decisiones que no hay que romper

- **Tema oscuro** (guía del usuario): fondo `#121212`, cards `#1E1E24`, morado neón `#7F56D9`/`#9D71FD`, azul `#47B0FF`, verde `#22C55E`. La paleta vive en `constants/colors.ts` y DEBE mantenerse en sincronía con `tailwind.config.js` (mismos valores). Los tintes para fondos de chips/cards son `primaryDim`/`successDim`/`dangerDim` — no hardcodear hexes claros en las pantallas.
- **Navbar flotante**: tab bar absoluta (bottom 25, radius 40, solo íconos, pastilla morada activa) en `app/(tabs)/_layout.tsx`. TODA lista/scroll de pantalla necesita `paddingBottom: ~130-140` para que el navbar no tape contenido; los FABs van en `bottom: 110, right: 20`.
- **Scrollables dentro de bottom sheets**: usar `ScrollView` de `react-native-gesture-handler` (los de react-native no responden al gesto dentro de @gorhom/bottom-sheet).

- **Gráficos: react-native-gifted-charts** (`DonutChart` y `MonthlyBars` en `components/charts/`). victory-native fue eliminado (causaba el crash de Reportes en el APK). gifted-charts usa `expo-linear-gradient` como fallback de gradiente — no instalar `react-native-linear-gradient`.
- **Fuente Inter** embebida nativamente vía config plugin de `expo-font` en `app.json` (familia "Inter" con pesos 400-700, así `fontWeight` funciona en Android). Se aplica con la clase `font-sans` en cada `<Text>` — al crear Texts nuevos, incluir `font-sans` en el className. En Expo Go la fuente no carga (requiere build nativo); en el APK sí.
- **Íconos: phosphor-react-native** (se migró desde lucide). Los componentes usan props `size`, `color` (string, no `ColorValue`) y `weight` (`regular`/`fill`/`duotone`/`bold`); no existe `strokeWidth`. El registro de íconos de categorías vive en `components/CategoryIcon.tsx` y debe estar en sincronía con los nombres guardados por `db/seed.ts` (`Pizza`, `Bus`, `House`, `Pill`, `FilmSlate`, `TShirt`, `PawPrint`, `BookOpen`, `Briefcase`, `Gift`).
- **Zustand solo guarda estado de UI.** La data vive en SQLite; las pantallas se refrescan con el contador `dataVersion` (`stores/ui.store.ts`) que se incrementa tras cada escritura (ver `notifyDataChanged()`).
- Migraciones drizzle embebidas vía `babel-plugin-inline-import` (`.sql` en `metro.config.js` y `babel.config.js`); se aplican con `useMigrations` en `app/_layout.tsx`.

## Bugs conocidos

(Feedback de la primera prueba en dispositivo real — Galaxy S25, build `a784d6e3`, 12-jun-2026; todos atendidos en el rediseño del mismo día, **pendiente confirmar en el nuevo APK**)

- [x] **CRASH del tab Reportes en el APK** — se eliminó victory-native y los gráficos ahora son react-native-gifted-charts. Verificar en dispositivo.
- [x] **Scroll horizontal muerto en los sheets** — los ScrollView ahora vienen de react-native-gesture-handler.
- [x] **Filtro por categoría en Gastos** — la lista, el total y las categorías ahora respetan el filtro (y se filtra en SQL por `category_id`).
- [x] **Ingresos mezclados en la lista de Gastos** — el tab ahora tiene toggle Gastos/Ingresos y muestra solo el tipo elegido; el sheet además muestra un badge de tipo.

## Mejoras pedidas por el usuario (primera prueba, 12-jun-2026) — hechas, pendiente validar en dispositivo

- [x] **Home centrado en "Presupuesto"** con `BalanceHeader` + dona.
- [x] **TransactionSheet sugiere nombres según categoría** (diccionario en el propio sheet).
- [x] **Fijos con calendario** para elegir el día (datetimepicker; se usa el día de la fecha elegida).
- [x] **Fijos en grid por monto**: los que superan el 60% del monto máximo ocupan fila completa.
- [x] **Pagados atenuados** (opacity 0.45 + tachado + check) con confirmación al marcar. Editar/eliminar ahora es con long-press (el swipe no convive con el grid).
- [x] **Metas con 6 presets + emojis sugeridos por nombre** (diccionario palabra→emoji en `GoalSheet`, ej. "viaje a españa" → ✈️ 🇪🇸).

## Pendientes

- [ ] **Validar el rediseño completo en dispositivo** (nuevo APK): Reportes sin crash, scrolls de sheets, fuente Inter, navbar flotante sin tapar contenido.
- [ ] **Decisión Tamagui**: descartado por ahora (reemplazaría NativeWind; el rediseño se logró sin él). Retomar solo si el usuario insiste.

---

# PRÓXIMA VERSIÓN (v3) — feedback de la 2ª prueba en dispositivo (12-jun-2026, build `caf74475`)

## Bugs reportados y diagnosticados

- [ ] **El gráfico de barras de Reportes se ve mal (overflow)**. Diagnóstico hecho: en `components/charts/MonthlyBars.tsx` el ancho del plot es `Dimensions.width − 88`, pero gifted-charts le SUMA el `yAxisLabelWidth` (42px); la Card dispone solo de `pantalla − 72` (padding 20×2 de pantalla + 16×2 de card) → el chart desborda ~26px a la derecha y corta barras/labels. **Fix**: `width = Dimensions.width − 72 − 42 − 16` (≈ `−130`) y recalcular `barWidth` con ese ancho. Verificar también con 12 meses (24 barras).
- [ ] **Grid de Fijos: `minHeight` invertido** (encontrado en revisión de código, `app/(tabs)/fijos.tsx`): las cards grandes tienen `minHeight: 104` y las chicas `128` — debería ser al revés (grande ≥ chica).

## Cambios pedidos

- [ ] **Quitar los emojis de la página de metas de ahorro**: eliminar el grid de emojis y la fila de "sugeridos" del `GoalSheet`; donde estaban, dejar las opciones de TEXTO (Viaje, Emergencias, Regalo, Casa, Auto, Tecnología...). El campo `emoji` de la tabla puede seguir guardando un valor por defecto (p.ej. derivado del preset) pero la UI no muestra picker de emojis. Revisar también el protagonismo del emoji en las cards de meta del tab Ahorro.

## Recomendaciones económicas (sin servicios de pago)

Pedido del usuario: dar recomendaciones económicas gratis. **Enfoque elegido: motor de reglas 100% local** (calza con "sin nube, sin cuenta" y cuesta $0) — NO usar APIs de LLM (ni siquiera free tier: requieren key, internet y enviar datos financieros afuera). Ideas de reglas sobre los datos de SQLite, mostrables como cards de "Consejos" en Reportes o Home:

- Comparación mes a mes por categoría: "En Comida llevas un 30% más que el mes pasado".
- Ritmo de gasto vs presupuesto: "A este ritmo te pasas del presupuesto el día 24".
- Proyección de metas: "Guardando $5.000 a la semana, completas 'Viaje' en marzo".
- Peso de los fijos: "Tus gastos fijos son el 45% de tus ingresos del mes" (regla 50/30/20 como referencia).
- Racha y refuerzo positivo: "Llevas 12 días registrando — los que registran gastan menos 😉".
- Detección de hormiga: top 3 de gastos chicos repetidos del mes (misma nota/categoría, monto < umbral).

Implementación: módulo `utils/advisor.ts` con funciones puras que reciben los agregados existentes (`getMonthlySeries`, `getExpensesByCategory`, `getBudgetSummary`, metas) y devuelven una lista de `{ icon, title, body, tone }`; UI como carrusel de cards.

## Rediseño v3 — MODO CLARO + ROSA (guía del usuario, para la próxima versión)

### Paleta nueva (reemplaza el tema oscuro; actualizar `constants/colors.ts` + `tailwind.config.js` en sincronía)
- Fondo app: `#F7F7F9` o `#F2F2F6` (gris muy claro, NO blanco puro).
- Cards: blanco puro `#FFFFFF`.
- Tarjeta principal (gradiente rosa): `#FF9A9E` (rosa melocotón) → `#FECFEF` (rosa suave), o `#FF6A88` como final si falta contraste.
- Textos: `#1C1C1E` (casi negro) títulos/montos; `#8E8E93` (gris medio) subtítulos/fechas.

### Por componente
- **Tarjeta de balance principal**: `LinearGradient` rosa + borde glass `borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)'`. **Glow rosa** en vez de sombra negra: `shadowColor: '#FF9A9E', shadowOpacity: 0.3, shadowRadius: 15`. Texto del balance en blanco puro.
- **Navbar**: fondo blanco `#FFFFFF` flotante sobre el gris claro, sombra muy difusa. Íconos inactivos gris claro; el activo SOLO cambia a rosa con `weight="fill"` — **sin círculo/pastilla de fondo** (barra más limpia).
- **Transacciones y categorías**: filas con fondo blanco, sin bordes oscuros; separación por padding generoso + sombras minúsculas (`shadowOpacity: 0.03, shadowRadius: 8` / `elevation: 1`). Círculos de íconos de categoría: fondo `#F0F0F0` con ícono oscuro o rosa.
- **Gráficos**: track de la dona en gris tenue `#E8E8E8`; el progreso en el rosa principal. Barras de ahorro: fondo gris tenue + relleno con gradiente rosa.

### Tipografía y espaciado (whitespace)
- Margen lateral mínimo **24px** en toda pantalla.
- Más aire vertical entre secciones: p.ej. `marginBottom: 32` bajo la tarjeta principal rosa antes de "Últimas transacciones".

> Nota: este rediseño revierte el tema oscuro actual. Al implementarlo, actualizar también `app.json` (`userInterfaceStyle: "light"`, splash claro, status bar dark) y regenerar íconos/splash con el rosa si se quiere coherencia.

### Segunda referencia visual (12-jun-2026, tarde)

El usuario compartió un mockup fintech de **modo claro** que aporta el LAYOUT (el gradiente azul marino del mockup se reemplaza por el ROSA de la guía):
- **Hero card** del Home: monto grande blanco arriba + **panel interior translúcido** (`rgba(255,255,255,0.25)`, radius ~16) con la meta/progreso (estilo "Your Saving Goals": barra fina con avance y montos a los extremos) + **dos botones blancos redondeados** al pie de la card (estilo "Send / Receive").
- **Navbar minimal**: blanco, íconos + label pequeño, el activo en color de acento con `weight="fill"` y una **línea subrayada** bajo el tab activo — sin pastilla de fondo.
- **Teclado numérico limpio**: números grandes oscuros sobre blanco, SIN fondos por tecla; solo el backspace como ícono.
- **Chips de monto rápido** sobre el teclado (en el mockup "$5 $10 $20...") → adaptar a CLP: $1.000 / $5.000 / $10.000 / $20.000.
- Botón de acción principal full-width al fondo (estilo "Send $12.00").

---

## PLAN DE EJECUCIÓN v3 (detallado — para la próxima sesión)

Orden diseñado para commitear por fase y poder cortar en cualquier punto con la app sana. Después de CADA fase: `npx tsc --noEmit` limpio.

### Fase 0 — Bugfixes (15 min, commit propio)
1. `components/charts/MonthlyBars.tsx`: `width = Dimensions.get('window').width - 130` (72 de layout + 42 de eje Y + margen) y recalcular `barWidth` con ese ancho. Probar mentalmente con 3/6/12 meses (6/12/24 barras).
2. `app/(tabs)/fijos.tsx`: invertir `minHeight` del grid → `isBig ? 128 : 104`.

### Fase 1 — Paleta modo claro + assets (commit propio)
1. `constants/colors.ts` + `tailwind.config.js` (mismos valores, como siempre):
   - `bg: '#F7F7F9'`, `surface: '#FFFFFF'`, `surfaceAlt: '#F0F0F0'`, `textPrimary: '#1C1C1E'`, `textSecondary: '#8E8E93'`, `border: '#ECECF0'`
   - `primary: '#FF6A88'` (rosa de acento/interactivo), `primaryLight: '#FF9A9E'`, `primaryDim: '#FFE9EE'`
   - gradiente hero: `['#FF9A9E', '#FECFEF']` (exportar como `HERO_GRADIENT` en colors.ts)
   - `success: '#16A34A'`, `successDim: '#E8F6EE'`, `danger: '#E25C3D'`, `dangerDim: '#FDEDE6'`, `warning: '#D99A1B'` (versiones legibles sobre claro)
   - `shadow`: bajar a `shadowOpacity: 0.05, shadowRadius: 8, elevation: 1`; agregar `glowPink = { shadowColor: '#FF9A9E', shadowOpacity: 0.3, shadowRadius: 15, elevation: 6 }`
2. `app.json`: `backgroundColor: '#F7F7F9'`, splash `backgroundColor: '#F7F7F9'`, `userInterfaceStyle: 'light'`, adaptiveIcon background `#FF6A88`.
3. `app/_layout.tsx`: `<StatusBar style="dark" />`.
4. `scripts/generate-icons.js`: color del chanchito → `#FF6A88` (ícono blanco sobre rosa; splash chanchito rosa sobre claro) y regenerar (`npm i --no-save sharp && node scripts/generate-icons.js`).
5. `components/ui/Skeleton.tsx` ya usa `colors.border` (queda gris claro solo con el cambio de token) — verificar contraste.

### Fase 2 — Componentes base (commit propio)
1. `Card`: padding más generoso (`p-5`), sombra suave nueva (viene del token), sin cambios de API.
2. `ProgressBar`: track por defecto `#E8E8E8`; nueva variante `gradient` que rellena con `LinearGradient` rosa (para metas).
3. `Button`: primary rosa; variante `ghost` rosa.
4. `CategoryIcon`: default `bgColor: '#F0F0F0'` con el ícono en el color de la categoría (mantener prop para overrides).
5. `NumericKeyboard`: estilo mockup — sin fondo por tecla, números `fontSize ~26` en `textPrimary`, backspace como ícono; agregar prop opcional `quickAmounts?: number[]` que renderiza chips de monto rápido arriba ($1.000/$5.000/$10.000/$20.000) y hace `onChange(String(monto))`.
6. `GlassMetricCard`: rediseñar a **card blanca minimal** (ícono en círculo `#F0F0F0`, título gris, monto oscuro, badge rosa suave) — renombrar mentalmente a "MetricCard"; mantener el archivo/exports para no romper imports.
7. `AppSheet`: fondo blanco, handle `#D8D8DC`; inputs internos pasan a `#F2F2F6` (los sheets usan `colors.bg`, revisar que quede bien).

### Fase 3 — Hero card + Home (commit propio)
1. Nuevo `components/ui/HeroBalanceCard.tsx`: `LinearGradient` HERO_GRADIENT, `borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)'`, radius 24, **glow rosa** (token `glowPink`), padding 20.
   - Arriba: label blanco translúcido ("Presupuesto de junio") + monto grande blanco puro.
   - Panel interior translúcido con la barra de progreso del presupuesto (gastado a la izq., total a la der., barra blanca fina).
   - Pie: dos botones blancos redondeados **"+ Gasto"** y **"+ Ingreso"** (reemplazan el FAB del Home; abren TransactionSheet con el tipo).
2. `app/(tabs)/index.tsx`: hero card reemplaza al BalanceHeader+dona del bloque presupuesto; `marginBottom: 32` bajo la hero; márgenes laterales 24px (`px-6`); la dona se mueve junto a los bloques Ingresos/Gastos o dentro de Reportes; carrusel con las MetricCards blancas; quitar el FAB (las acciones viven en la hero). Mantener "Próximos fijos" y "Últimas transacciones" (filas blancas).
3. Whitespace general: revisar `gap`/`mt` entre secciones (mínimo 24-32).

### Fase 4 — Navbar claro (commit propio)
`app/(tabs)/_layout.tsx`: fondo blanco, sombra difusa; `TabIcon` sin View-pastilla → ícono rosa + `weight="fill"` activo, gris `#B0B0B5` inactivo; mostrar labels pequeños (como el mockup) con `tabBarShowLabel: true` y `tabBarLabelStyle` Inter 10px; **indicador subrayado**: línea de 16×3 rosa bajo el ícono activo (View dentro de TabIcon).

### Fase 5 — Metas sin emojis (commit propio)
1. `GoalSheet`: eliminar grid de EMOJIS, fila de sugeridos y diccionario `EMOJI_KEYWORDS`; quedan los 6 presets de TEXTO como chips. `emoji` se guarda igual en DB (not null): derivarlo del preset elegido o default `'🎯'`, sin UI.
2. Tab Ahorro: cards de meta sin emoji protagonista — nombre + barra con gradiente rosa + montos; `GoalDetailSheet` sin el emoji gigante (título de texto).
3. Quitar también el emoji del `EmptyState` de Ahorro si desentona (revisar en conjunto).

### Fase 6 — Motor de consejos económicos local (commit propio)
1. `utils/advisor.ts`: funciones puras `buildAdvice(inputs) => Advice[]` con `Advice = { id, icon, title, body, tone: 'info' | 'warn' | 'win' }`. Reglas (cada una con guard de datos suficientes):
   - delta mes a mes por categoría (>20% → warn)
   - ritmo vs presupuesto (proyección lineal del día del mes → "te pasas el día N")
   - proyección de meta (promedio de aportes/semana → fecha estimada; comparar con deadline)
   - peso de fijos sobre ingresos (>50% → warn, referencia 50/30/20)
   - racha de registro (≥7 días → win)
   - gastos hormiga (≥3 gastos < $5.000 misma categoría en la semana)
2. `hooks/useAdvice.ts`: `useDbQuery` que junta `getMonthlySeries(2)`, `getExpensesByCategory`, `getBudgetSummary`, `getActiveFixedTotal`, `getMonthTotals`, metas con progreso, `getRegisteredDates` y llama `buildAdvice`.
3. UI: sección "Consejos para ti" en **Reportes** (cards blancas con ícono por tone); si hay ≥1 consejo, mostrar el primero también como banner discreto en Home.
4. Edge: con DB vacía debe devolver `[]` sin crash (probar).

### Fase 7 — Verificación y entrega
1. `npx tsc --noEmit` + `npx expo export --platform android --output-dir dist-check` (borrar después).
2. Commit + push de lo restante.
3. `npx eas-cli build --platform android --profile preview --non-interactive --no-wait` + monitorear con `eas build:view <id> --json` y entregar el link del APK.
4. Actualizar este archivo: marcar v3 hecha, mover lo no hecho a pendientes.

### Notas para quien implemente
- El usuario quiere el ROSA como identidad (el azul del mockup es solo referencia de layout/limpieza).
- Los `font-sans` en cada Text son obligatorios (fuente Inter).
- No tocar la capa de datos: todo esto es UI + `utils/advisor.ts` nuevo.
- Scrollables dentro de sheets: siempre de `react-native-gesture-handler`.
- Listas de pantalla: `paddingBottom` ≥130 por el navbar flotante.
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
