# Magsave 👛

**Magsave** es una app de finanzas personales hecha a medida, con cariño, para una sola persona: Magda. No es una app bancaria — es una compañera de bolsillo para llevar las cuentas sin drama.

- 🏠 **Inicio** — saldo disponible del mes, presupuesto y últimos movimientos de un vistazo
- 🧾 **Gastos** — registra gastos e ingresos con un teclado gigante y categorías con colores
- 🔁 **Fijos** — arriendo, internet, suscripciones... con recordatorio el día antes de cada vencimiento
- 🐷 **Ahorro** — metas con emoji, barra de progreso y confetti cuando lo logras 🎉
- 📊 **Reportes** — gráficos de ingresos vs gastos, insights y presupuestos por categoría

Todo queda guardado **solo en el teléfono** (SQLite). Sin cuenta, sin nube, sin publicidad.

---

## Capturas de pantalla

| Inicio | Gastos | Ahorro |
|--------|--------|--------|
| _(captura pendiente)_ | _(captura pendiente)_ | _(captura pendiente)_ |

| Fijos | Reportes | Onboarding |
|-------|----------|------------|
| _(captura pendiente)_ | _(captura pendiente)_ | _(captura pendiente)_ |

---

## Setup para desarrolladores

Requisitos: Node 18+, npm y la app **Expo Go** en el teléfono (o un emulador Android).

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go (Android) o la cámara (iOS) y listo.

### Stack

| Cosa | Herramienta |
|------|-------------|
| Framework | Expo SDK 56 + Expo Router (TypeScript) |
| Base de datos | expo-sqlite + drizzle-orm (migraciones en `db/migrations/`) |
| Estilos | NativeWind v4 (Tailwind), tema oscuro, fuente Inter |
| Gráficos | react-native-gifted-charts |
| Estado UI | Zustand (la data vive siempre en SQLite) |
| Notificaciones | expo-notifications (locales, sin servidor) |

### Generar el APK con EAS

```bash
npm install -g eas-cli
eas login          # cuenta gratuita de expo.dev
eas build --platform android --profile preview
```

Al terminar, EAS te da un **link de descarga del APK** — ese es el link que se comparte para instalar la app (sección siguiente).

---

## 📱 Cómo instalarla en tu celular

*(Esta sección es para ti, que no necesitas saber nada de programación 💜)*

La app no está en Play Store (es solo tuya 😎), así que Android te va a pedir permiso para instalarla. Es seguro — solo sigue estos pasos:

### Paso 1: Permitir la instalación

Cuando abras el archivo en el Paso 2, tu teléfono probablemente te muestre un aviso tipo *"Por seguridad, tu teléfono no puede instalar apps de fuentes desconocidas"*. Tranquila, se arregla en un toque:

**Samsung**
1. Toca **Ajustes** en el aviso (o ve a Ajustes → Seguridad y privacidad → Instalar apps desconocidas)
2. Elige el navegador (Chrome o Internet) y activa **"Permitir desde esta fuente"**

**Xiaomi / Redmi / POCO**
1. Ajustes → Protección de privacidad → Permisos especiales → **Instalar apps desconocidas**
2. Elige tu navegador y activa el permiso

**Motorola, Pixel y la mayoría de los demás**
1. Cuando aparezca el aviso, toca **Ajustes**
2. Activa **"Permitir desde esta fuente"** y vuelve atrás

### Paso 2: Descargar la app

1. Abre el **link que te mandaron** (es un link de expo.dev)
2. Toca el botón **Install** / **Download**
3. Se descarga un archivo que termina en `.apk` — si pregunta, toca **"Descargar de todos modos"**

### Paso 3: Instalar y abrir

1. Abre el archivo descargado (aparece en las notificaciones, o en la app **Archivos** → Descargas)
2. Toca **Instalar** y espera unos segundos
3. Toca **Abrir** — y listo, ya tienes Magsave 💜

> La primera vez te va a preguntar si permites notificaciones: dile que **sí** para que te avise un día antes de cada gasto fijo.

---

## Cómo actualizar la app

Si se hacen cambios o mejoras:

1. El desarrollador corre de nuevo `eas build --platform android --profile preview` y comparte el **nuevo link**
2. En el teléfono: abrir el link, descargar el nuevo APK e instalarlo **encima** de la app actual (mismos pasos de arriba)
3. **No hay que borrar la app anterior** — al instalar encima, todos los datos (gastos, metas, ahorros) se conservan ✨

> ⚠️ Si en algún momento desinstalas la app, sus datos se pierden (viven solo en el teléfono). Para actualizar nunca hace falta desinstalar.
