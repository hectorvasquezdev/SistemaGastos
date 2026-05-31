# 💰 GASTOS — Guía para pasar el prototipo a producción

Esta carpeta contiene todo lo necesario para convertir el prototipo HTML en una
**app real con Next.js + Tailwind + Supabase + Recharts**, desplegable en Vercel.

> El prototipo (archivo `GASTOS.html`) ya tiene **todo el diseño, los flujos y
> la lógica de cálculo terminados**. Aquí solo cambias *de dónde vienen los datos*:
> en vez del navegador (localStorage), de una base de datos real (Supabase).

---

## 📦 Qué hay en esta carpeta

```
handoff/
├── README.md                ← esta guía
├── package.json             ← dependencias del proyecto
├── .env.example             ← plantilla de variables (renómbrala a .env.local)
├── supabase/
│   ├── schema.sql           ← crea TODAS las tablas + seguridad (RLS)
│   └── seed.sql             ← datos de ejemplo (opcional)
├── lib/
│   ├── supabaseClient.js    ← conexión a Supabase
│   └── store.js             ← todas las operaciones (login, gastos, presupuesto…)
└── prototipo/               ← EL PROTOTIPO COMPLETO (diseño + pantallas)
    ├── GASTOS.html          ← ábrelo en el navegador para ver la app funcionando
    └── app/                 ← código de cada pantalla
        ├── data.jsx         ← lógica de cálculos (stats, alertas, recomendaciones)
        ├── auth.jsx         ← login / registro / recuperar contraseña
        ├── screen_*.jsx     ← cada pantalla (dashboard, registrar, historial…)
        ├── ui.jsx, icons.jsx, styles.css
        └── app.jsx          ← navegación y tema
```

> 💡 La carpeta `prototipo/` es la app que ya construimos, tal cual. Para verla:
> abre `prototipo/GASTOS.html` en cualquier navegador. De ahí se copian las
> pantallas y los cálculos hacia el proyecto Next.js (ver paso 7).

---

## 🧰 1. Instalar las herramientas (una sola vez)

Descarga e instala en tu computadora:

1. **Node.js** (versión 18 o superior) → https://nodejs.org
2. **Visual Studio Code** → https://code.visualstudio.com
3. **Git** (opcional, para Vercel) → https://git-scm.com

---

## 🚀 2. Crear el proyecto Next.js

Abre **VS Code** → menú **Terminal → New Terminal** y escribe:

```bash
npx create-next-app@latest gastos
```

Responde a las preguntas así:

| Pregunta                         | Respuesta |
|----------------------------------|-----------|
| TypeScript?                      | **No** (o Sí, si lo dominas) |
| ESLint?                          | **Yes** |
| Tailwind CSS?                    | **Yes** |
| `src/` directory?                | **No** |
| App Router?                      | **Yes** |
| import alias?                    | **No** (Enter) |

Luego entra a la carpeta:

```bash
cd gastos
```

---

## 🔌 3. Instalar Supabase y Recharts

```bash
npm install @supabase/supabase-js recharts
```

---

## 📁 4. Copiar los archivos de esta carpeta

Copia dentro de tu proyecto `gastos/`:

- `lib/supabaseClient.js`  →  `gastos/lib/supabaseClient.js`
- `lib/store.js`           →  `gastos/lib/store.js`
- `.env.example`           →  renómbralo a **`.env.local`** en la raíz

---

## 🗄️ 5. Crear la base de datos en Supabase

1. Entra a https://supabase.com → **New project** (anota la contraseña que pongas).
2. Cuando termine de crearse, ve a **SQL Editor → New query**.
3. Abre `supabase/schema.sql`, copia **todo** y pégalo. Pulsa **Run**.
   - Esto crea las tablas: `profiles`, `categories`, `budgets`, `incomes`,
     `expenses`, `user_achievements`, con seguridad por usuario.
4. (Opcional) Para datos de ejemplo: regístrate una vez en la app, copia tu
   **User UID** desde **Authentication → Users**, reemplázalo en `seed.sql`
   donde dice `TU-USER-ID`, y ejecútalo en el SQL Editor.

---

## 🔑 6. Conectar tus llaves

En Supabase ve a **Project Settings → API** y copia:

- **Project URL**
- **anon public** key

Pégalas en tu archivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ Nunca subas `.env.local` a internet. Ya está protegido por `.gitignore`.

---

## 🎨 7. Pasar las pantallas del prototipo a React

El prototipo está dividido en pantallas (en la carpeta `app/` del proyecto original):

| Prototipo (`app/…`)        | Página Next.js sugerida      |
|----------------------------|------------------------------|
| `auth.jsx`                 | `app/login/page.jsx`         |
| `screen_dashboard.jsx`     | `app/page.jsx` (inicio)      |
| `screen_register.jsx`      | `app/registrar/page.jsx`     |
| `screen_history.jsx`       | `app/historial/page.jsx`     |
| `screen_budget.jsx`        | `app/presupuesto/page.jsx`   |
| `screen_cash.jsx`          | `app/efectivo/page.jsx`      |
| `screen_yape.jsx`          | `app/importar/page.jsx`      |
| `screen_reports.jsx`       | `app/reporte/page.jsx`       |
| `screen_gamification.jsx`  | `app/logros/page.jsx`        |

En cada página:
1. Copia el JSX de la pantalla.
2. Cambia las llamadas a `window.Store.xxx()` por las funciones de `lib/store.js`
   (ej: `window.Store.addExpense(e)` → `await addGasto(e)`).
3. Los **cálculos** (`stats`, `alerts`, `recommendations` de `data.jsx`) son
   JavaScript puro: cópialos a `lib/calculos.js` sin cambios y aliméntalos con
   los datos que devuelve Supabase.

> Los **gráficos** del prototipo (dona, barras, evolutivo) se reemplazan por
> componentes de **Recharts** (`PieChart`, `BarChart`, `LineChart`).

---

## ▶️ 8. Probar en tu computadora

```bash
npm run dev
```

Abre http://localhost:3000 en el navegador.

---

## ☁️ 9. Publicar en internet (Vercel)

1. Sube tu proyecto a **GitHub** (botón *Publish* en VS Code, o `git push`).
2. Entra a https://vercel.com → **Add New Project** → elige tu repo.
3. En **Environment Variables** pega las mismas dos llaves de `.env.local`.
4. **Deploy**. En un par de minutos tendrás tu app en línea con un enlace público. 🎉

---

## 🆘 Errores comunes

| Síntoma | Solución |
|---------|----------|
| `Falta NEXT_PUBLIC_SUPABASE_URL…` en consola | Revisa que `.env.local` exista y reinicia `npm run dev` |
| Login no guarda sesión | Verifica que ejecutaste `schema.sql` completo (incluye el trigger de perfil) |
| "row violates row-level security" | Estás insertando sin `user_id` o sin sesión iniciada |
| No aparecen categorías | Ejecuta `seed.sql` con tu User UID real |

---

## 📚 Stack final

- **Next.js** — framework de la app (páginas + React)
- **Tailwind CSS** — estilos (ya viene con el prototipo)
- **Supabase** — base de datos (PostgreSQL) + autenticación
- **Recharts** — gráficos
- **Vercel** — hosting / publicación

¡Listo! Cualquier desarrollador con este paquete puede levantar la versión real. 🚀
