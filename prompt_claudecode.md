# Prompt para Claude Code — App "MagdaSave"

Crea una app móvil de finanzas personales en React Native con Expo llamada **MagdaSave**. La app es un regalo hecho a medida para una persona específica, así que el tono debe ser cálido, personal y libre de jerga financiera técnica. No es una app bancaria — es una compañera de bolsillo.

---

## Stack tecnológico (exacto, sin variantes)

- **Framework:** Expo SDK 51+ con `npx create-expo-app` (TypeScript template)
- **Navegación:** Expo Router v3 con tab navigator de 5 tabs
- **Base de datos:** `expo-sqlite` con `drizzle-orm` para queries tipadas
- **Estado global:** Zustand (solo para estado UI; la data viene siempre de SQLite)
- **Estilos:** NativeWind v4 (Tailwind para React Native)
- **Gráficos:** `victory-native` (barras y torta)
- **Íconos:** `lucide-react-native`
- **Notificaciones:** `expo-notifications`
- **Animaciones:** `react-native-reanimated` (ya incluida en Expo)
- **Confetti:** `react-native-confetti-cannon`
- **Splash / assets:** `expo-splash-screen`
- **Build:** EAS Build configurado para generar APK de Android (eas.json incluido)

---

## Base de datos — esquema SQLite completo

Crea un archivo `db/schema.ts` con drizzle-orm y las siguientes tablas. Genera también `db/migrations` y un archivo `db/seed.ts` que inserte categorías por defecto al primer inicio.

```ts
// Categorías (precargadas)
categories: {
  id: integer primary key autoincrement,
  name: text not null,          // "Comida", "Transporte", etc.
  icon: text not null,          // nombre del ícono lucide
  color: text not null,         // hex color
  type: text not null,          // "expense" | "income" | "both"
  is_default: integer default 1 // 1 = no borrable
}

// Transacciones (gastos e ingresos variables)
transactions: {
  id: integer primary key autoincrement,
  amount: real not null,
  type: text not null,          // "expense" | "income"
  category_id: integer references categories(id),
  note: text,
  date: text not null,          // ISO 8601: "2024-03-15"
  created_at: text default current_timestamp
}

// Gastos fijos mensuales
fixed_expenses: {
  id: integer primary key autoincrement,
  name: text not null,
  amount: real not null,
  day_of_month: integer not null,  // 1-31
  category_id: integer references categories(id),
  is_active: integer default 1,
  created_at: text default current_timestamp
}

// Control mensual de gastos fijos (qué meses fueron pagados)
fixed_expense_payments: {
  id: integer primary key autoincrement,
  fixed_expense_id: integer references fixed_expenses(id),
  month_year: text not null,       // "2024-03"
  paid_at: text                    // null = pendiente
}

// Metas de ahorro
savings_goals: {
  id: integer primary key autoincrement,
  name: text not null,
  emoji: text not null,
  target_amount: real not null,
  deadline: text,                  // ISO date, nullable
  is_completed: integer default 0,
  created_at: text default current_timestamp
}

// Aportes a metas de ahorro
savings_contributions: {
  id: integer primary key autoincrement,
  goal_id: integer references savings_goals(id),
  amount: real not null,
  note: text,
  date: text not null
}

// Presupuesto mensual por categoría
budgets: {
  id: integer primary key autoincrement,
  category_id: integer references categories(id),
  amount: real not null,
  month_year: text not null        // "2024-03"
}
```

Categorías por defecto a insertar en seed:
- 🍕 Comida (#E8593C), 🚌 Transporte (#378ADD), 🏠 Hogar (#1D9E75),
- 💊 Salud (#9B59B6), 🎬 Ocio (#F39C12), 👗 Ropa (#E91E63),
- 🐾 Mascotas (#8D6E63), 📚 Educación (#3F51B5), 💼 Trabajo (income, #1D9E75),
- 🎁 Otro (#888780)

---

## Diseño visual — especificaciones exactas

### Paleta de colores
```
Primary:     #7C6FF7  (violeta suave — acento principal)
Primary dim: #EEEDFE  (fondo de cards violeta)
Success:     #1D9E75  (verde — ingresos, metas cumplidas)
Danger:      #D85A30  (coral — gastos, alertas)
Warning:     #EF9F27  (ámbar — advertencias, cerca del límite)
BG:          #F7F6F3  (fondo general, crema muy suave)
Surface:     #FFFFFF  (cards)
Text primary:#1A1A18
Text second: #6B6B67
Border:      #E8E6E0
```

### Tipografía
- Usar la fuente del sistema (`System` / `San Francisco` en iOS, `Roboto` en Android)
- Tamaños: headline 28px/bold, title 20px/600, body 16px/400, caption 13px/400
- Sin fuentes externas (no Google Fonts) para mantener el bundle pequeño

### Componentes de diseño
- Border radius: 20px para cards principales, 12px para pills/badges, 8px para botones pequeños
- Sombras: `shadowColor: #000, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3`
- Teclado numérico propio (no el del sistema) con botón de borrar y punto decimal
- Bottom sheet para formularios (usando `@gorhom/bottom-sheet`)
- Haptic feedback en acciones importantes (`expo-haptics`)
- Skeleton loaders mientras carga data de SQLite

---

## Pantallas — detalle completo

### Tab 1: Home (ícono: Home)
**Header:**
- Saludo dinámico según hora: "Buenos días Magda ☀️" / "Buenas tardes Magda 🌤" / "Buenas noches Magda 🌙"
- Fecha actual en formato "Viernes 15 de marzo"

**Card principal (saldo del mes):**
- Texto pequeño: "Disponible este mes"
- Número grande: ingresos del mes − gastos del mes − total gastos fijos activos
- Si es negativo: mostrar en rojo con ícono de alerta
- Subtext: "Llevas gastado $X de $Y presupuestados"

**Barra de progreso de presupuesto:**
- Barra horizontal con porcentaje gastado del total presupuestado
- Colores: verde (<60%), ámbar (60-85%), rojo (>85%)
- Texto: "Quedan $X para el resto del mes"

**Sección "Próximos gastos fijos" (scroll horizontal):**
- Cards pequeñas por cada gasto fijo pendiente en los próximos 7 días
- Mostrar nombre, monto y "en N días"
- Si es hoy: "¡Hoy!" en rojo

**Últimas transacciones (lista, máx 5):**
- Ícono de categoría, nombre, nota (si hay), fecha relativa ("Ayer", "Hace 3 días"), monto
- "Ver todo" que navega a tab Gastos

**FAB (botón flotante):**
- Botón "+" centrado abajo, color primary
- Al presionar: bottom sheet con dos opciones grandes: "Agregar gasto" / "Agregar ingreso"

---

### Tab 2: Gastos (ícono: Receipt)
**Header con filtros:**
- Selector de mes (← marzo 2024 →)
- Filtro por categoría (chips horizontales scrolleables)

**Resumen del mes:**
- Total gastado del mes seleccionado
- Gráfico de torta de gastos por categoría (Victory Pie)

**Lista de transacciones:**
- Agrupadas por fecha ("Hoy", "Ayer", "Lunes 11 de marzo")
- Cada item: ícono categoría, nombre categoría, nota, monto, hora
- Swipe left → botón eliminar (con confirmación)
- Tap → bottom sheet para editar

**Formulario agregar/editar gasto (bottom sheet):**
- Teclado numérico custom (números 0-9, punto, borrar) — grande y fácil de tocar
- Campo monto en el centro, grande (48px font size)
- Selector de categoría (grid de íconos)
- Campo nota (teclado del sistema, opcional)
- Date picker (por defecto hoy)
- Botón guardar

---

### Tab 3: Fijos (ícono: Repeat)
**Resumen:**
- "Total fijos del mes: $X"
- Barra: X pagados de Y

**Lista de gastos fijos:**
- Ordenados por día del mes
- Cada item: nombre, monto, "Día N de cada mes", estado (pagado / pendiente)
- Si está pendiente y ya pasó el día: mostrar "Vencido" en rojo
- Tap en pendiente → marcar como pagado (con haptic feedback)
- Swipe left → editar / eliminar

**Botón agregar gasto fijo:**
- Formulario: nombre, monto, día del mes (picker 1-31), categoría

**Notificaciones:**
- Al guardar un gasto fijo, programar notificación push para el día anterior a las 9am
- Mensaje: "Mañana vence [nombre] por $[monto] 💸"

---

### Tab 4: Ahorro (ícono: PiggyBank)
**Header:**
- Total ahorrado (suma de aportes de todas las metas activas)

**Grid de metas (2 columnas):**
- Card por meta: emoji grande, nombre, barra de progreso, "$X de $Y", porcentaje
- Color de la barra: violeta
- Si está completa: card con fondo verde y "¡Lo lograste! 🎉"

**Al presionar una meta:**
- Bottom sheet con:
  - Progreso detallado
  - Historial de aportes (lista)
  - Botón "Agregar aporte" → formulario simple (monto + nota)
  - Si el aporte completa la meta → lanzar confetti + animación de celebración + notificación local

**Botón crear nueva meta:**
- Formulario: nombre, emoji picker (grid de emojis), monto objetivo, fecha límite (opcional)

---

### Tab 5: Reportes (ícono: BarChart2)
**Selector de período:** últimos 3 / 6 / 12 meses

**Gráfico de barras (Victory Bar):**
- Un bar por mes
- Dos series: ingresos (verde) y gastos (coral)
- Labels con monto abreviado ($1.2K)

**Cards de insights:**
- "Mes con más gasto: Febrero ($X)"
- "Categoría líder: Comida ($X este mes)"
- "Promedio mensual de gastos: $X"
- "Llevas X días seguidos registrando gastos 🔥" (streak)

**Sección presupuesto:**
- Lista de categorías con presupuesto asignado
- Barra de uso + "gastado / límite"
- Botón editar presupuesto de cada categoría

---

## Onboarding (primera vez)

3 slides con animaciones suaves de entrada:

1. **"Hola, soy MagdaSave 👋"**
   Subtítulo: "Tu compañera para llevar las finanzas sin drama"
   Ilustración: emoji grande de billetera / monedas

2. **"Tú mandas aquí"**
   Subtítulo: "Registra gastos, controla lo fijo y guarda para lo que importa"
   Ilustración: íconos de las 3 funciones

3. **"Todo queda aquí, solo tuyo"**
   Subtítulo: "Sin cuenta, sin nube, sin publicidad. Solo tú y tu plata."
   Ilustración: candado / corazón

Botón final: "¡Empezar!" → navega al Home y marca onboarding como completado en AsyncStorage.

---

## Configuración EAS Build

Crear `eas.json`:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": { "buildType": "apk" }
    }
  }
}
```

---

## README.md que debe generar

El README debe incluir:
1. Descripción breve de la app
2. Capturas de pantalla (placeholders con texto)
3. Setup para desarrolladores: `npm install`, `npx expo start`
4. **Sección especial "Cómo instalarla en tu celular"** (para usuario no técnico):
   - Paso 1: Activar "Fuentes desconocidas" en Android (con instrucciones por marca: Samsung, Xiaomi, etc.)
   - Paso 2: Descargar el APK desde el link de EAS
   - Paso 3: Instalar y abrir
5. Cómo actualizar la app si se hacen cambios

---

## Archivos y estructura de carpetas

```
magdasave/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home
│   │   ├── gastos.tsx         # Gastos
│   │   ├── fijos.tsx          # Gastos fijos
│   │   ├── ahorro.tsx         # Ahorro
│   │   └── reportes.tsx       # Reportes
│   ├── onboarding.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                    # Botones, cards, badges reutilizables
│   ├── sheets/                # Bottom sheets por función
│   ├── charts/                # Wrappers de Victory Native
│   └── NumericKeyboard.tsx    # Teclado numérico custom
├── db/
│   ├── schema.ts
│   ├── migrations/
│   ├── seed.ts
│   └── queries/               # Una función por entidad
├── stores/
│   └── ui.store.ts            # Estado UI (sheet abierto, tab activo, etc.)
├── hooks/
│   ├── useTransactions.ts
│   ├── useFixedExpenses.ts
│   ├── useSavingsGoals.ts
│   └── useBudgets.ts
├── utils/
│   ├── currency.ts            # formatCLP, formatUSD, etc.
│   ├── dates.ts               # helpers de fecha
│   └── notifications.ts      # scheduling de push notifications
├── constants/
│   └── colors.ts
├── assets/
├── eas.json
└── README.md
```

---

## Orden de implementación

Construye en este orden exacto, verificando que cada paso funciona antes de pasar al siguiente:

1. Setup Expo + dependencias + estructura de carpetas
2. Esquema SQLite + seed de categorías + queries básicos
3. Navegación con tabs (pantallas vacías con título)
4. Componente NumericKeyboard
5. Home screen completa
6. Tab Gastos + formulario agregar/editar
7. Tab Fijos + notificaciones
8. Tab Ahorro + confetti
9. Tab Reportes + gráficos
10. Onboarding
11. Pulido: haptics, skeletons, manejo de errores
12. eas.json + README con instrucciones APK

Empieza generando el README.md completo, luego el package.json, luego el esquema de base de datos.
