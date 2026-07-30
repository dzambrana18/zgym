# Entreno — Anna y David

Web app de registro de entrenamiento. Se abre desde el móvil como una app, funciona **sin cobertura
en el gimnasio**, y calcula sola qué peso toca hoy en cada ejercicio aplicando la doble progresión de
`Anna.pdf` y `David.pdf`.

Sitio estático: **sin framework, sin build, sin npm**. GitHub Pages lo sirve tal cual.

## Cómo funciona

- **Sabe qué día es.** Al abrirla te dice qué sesión toca hoy según el calendario del plan, y marca
  esa tarjeta. Puedes entrar en cualquier otra y registrarla con normalidad, pero avisa de que te
  estás saliendo de la rutina.
- **Registro de series** con peso, repeticiones y RIR. Al marcar una serie arranca el temporizador de descanso.
- **Sugerencia de carga** por doble progresión: cuando completas el tope del rango de repeticiones en
  todas las series y con margen, sube el peso el incremento del ejercicio. Si no, repite y suma una repetición.
  Siempre dice *por qué* y muestra qué hiciste la última vez.
- **Demostración de técnica** en cada ejercicio: dos fotos reales (posición inicial y final) que se
  alternan como un GIF, más el enlace a vídeos de YouTube.
- **Mesociclo de 5 semanas**: la semana 3 añade una serie al primer ejercicio de cada sesión y la
  semana 5 es descarga (mitad de series, RIR 4, mismo peso).
- **Progreso** con un resumen en lenguaje llano (qué sube, qué está parado, cuánto entrenas), 1RM
  estimado (Epley), tonelaje por sesión y seguimiento de peso corporal y cintura.
- **Dieta** con objetivo calórico por persona, día de ejemplo que cuadra con ese objetivo, y 20
  recetas de supermercado baratas y sin elaborar, con kcal, proteína, tiempo y precio aproximado.
- **Local-first**: todo se guarda en el móvil al instante y se sincroniza a Supabase cuando hay señal.

## Estructura

| Archivo | Qué hace |
|---|---|
| `index.html` | Shell y metadatos de PWA/iOS |
| `styles.css` | Sistema de diseño **Kinetic Noir** (ver abajo) |
| `routines.js` | Solo datos: 2 usuarios × 4 días × 63 ejercicios |
| `photos/` | 45 pares de fotos de técnica (inicio y final), 1,7 MB |
| `moves.js` | Dibujos SVG de respaldo, por si una foto no carga sin conexión |
| `i18n.js`, `lang-ca.js`, `lang-en.js` | Español (base), catalán e inglés |
| `nutrition.js` | Objetivos calóricos y las 20 recetas |
| `progression.js` | Doble progresión, mesociclo, e1RM. Funciones puras |
| `store.js` | localStorage + cola de sincronización |
| `app.js` | Pantallas y eventos |
| `sw.js` | Service worker para el modo offline |
| `progression.test.mjs` | Comprobaciones de la lógica y de los datos |

### Material del gimnasio

Las rutinas están ajustadas a lo que hay en su VivaGym (máquinas Technogym). Si falta algo más,
se cambia en `routines.js`: cada ejercicio es un objeto con su carga inicial, incremento y el
`pattern` de la animación. Ya se han quitado por no estar disponibles o no dominarse: pec-deck
invertido, elevación de piernas colgado, curl femoral sentado y tríceps en polea desde abajo.

```bash
node progression.test.mjs     # o: npm test
python -m http.server 8000    # servir en local
```

## Diseño

Sigue `stitch_iron_flow_fitness.zip` (**Kinetic Noir**): negro puro, acento lima `#c3f400` usado con
moderación, glassmorfismo con blur de 20-28 px, hairlines de 0,5 px, squircles de 24 px en tarjetas y
8 px en controles, y monoespaciada tabular para todo dato numérico. Tema único oscuro.

**Tipografía:** el diseño pide Inter y JetBrains Mono, pero un `@import` de Google Fonts rompería el
modo offline y añadiría una dependencia externa. Se usa la pila del sistema, así que **en iPhone salen
SF Pro y SF Mono** — que es exactamente lo que Inter emula según el propio `DESIGN.md`.

## Publicar en GitHub Pages

En esta máquina hay `git` pero no `gh` CLI ni credenciales de GitHub, así que el repo se crea a mano.

Repositorio: **https://github.com/dzambrana18/zgym** · App publicada: **https://dzambrana18.github.io/zgym/**

Para publicar cambios:

1. **Sube la versión** en los dos sitios (`npm test` falla si se desincronizan):
   - `app.js` → `export const VERSION = '1.0.1';`
   - `version.json` → `{ "version": "1.0.1", "date": "2026-08-05" }`
2. ```bash
   npm test
   git add -A && git commit -m "Qué has cambiado" && git push
   ```

GitHub Pages reconstruye solo en 1-2 minutos.

### Cómo saben los móviles que hay versión nueva

`version.json` es el único archivo que el service worker **nunca** cachea: se pide siempre a la
red. Al abrir la app compara esa versión con la constante de `app.js`, que sí viaja dentro del
paquete cacheado. Si no coinciden, ese móvil tiene una copia vieja y sale una barra lima arriba con
un botón **Actualizar** que borra las cachés, desregistra el service worker y recarga.

En **Ajustes**, al pie, cada uno ve su versión instalada y si está al día. Si te dicen que algo no
les funciona, eso es lo primero que hay que mirar.

Si hubiera que configurarlo de cero otra vez: **Settings → Pages → Source: Deploy from a branch →
`main` / `/ (root)`**. El repo debe ser **público**: Pages no funciona en repos privados con cuenta gratuita.

> **Rutas relativas, siempre.** Al ser un *project site* la app vive en un subdirectorio. Todas las
> rutas usan `./archivo`, nunca `/archivo`, incluidas las de `manifest.webmanifest` y `sw.js`. Si
> alguna se pone absoluta, en el móvil no carga nada.

### Instalar en el iPhone

Abrir la URL **en Safari** (no en Chrome) → botón Compartir → *Añadir a pantalla de inicio*. Queda un
icono que arranca a pantalla completa, sin barra de navegador. No hace falta App Store, cuenta de
desarrollador ni pagar nada.

## Configurar Supabase (opcional pero recomendado)

Sin esto la app funciona igual, pero los datos viven solo en el móvil y **Safari puede borrarlos si no
abres la app en unos 7 días**.

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta:

```sql
create table sets_log (
  id bigserial primary key,
  user_key text not null,
  logged_at date not null,
  day_key text not null,
  exercise_key text not null,
  set_index int not null,
  weight numeric,
  reps int,
  rir numeric,
  client_id text unique not null
);

create table body_log (
  id bigserial primary key,
  user_key text not null,
  logged_at date not null,
  weight_kg numeric,
  waist_cm numeric,
  client_id text unique not null
);

alter table sets_log enable row level security;
alter table body_log enable row level security;

-- La app no tiene login, así que el rol anónimo necesita insertar, leer y actualizar.
-- UPDATE es imprescindible: el upsert por client_id hace UPDATE al reeditar una serie.
create policy "anon rw sets" on sets_log for select to anon using (true);
create policy "anon ins sets" on sets_log for insert to anon with check (true);
create policy "anon upd sets" on sets_log for update to anon using (true) with check (true);

create policy "anon rw body" on body_log for select to anon using (true);
create policy "anon ins body" on body_log for insert to anon with check (true);
create policy "anon upd body" on body_log for update to anon using (true) with check (true);

grant select, insert, update on sets_log, body_log to anon;
grant usage, select on all sequences in schema public to anon;
```

3. En **Project Settings → API**, copia la *Project URL* y la clave `anon public`.
4. Pégalas al principio de `store.js`:
   ```js
   export const SUPABASE_URL = 'https://xxxx.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJ...';
   ```
5. `git commit` y `git push`. En **Ajustes** de la app aparecerá el estado de sincronización.

## Crecer a 3-4 personas: añadir login

El modelo actual (clave `anon`, `user_key` no adivinable) vale para dos personas que se conocen.
Con más gente cada uno querrá que sus datos sean suyos, y eso exige autenticación real.
La migración es **aditiva**: no se pierde ni un registro.

1. **Activar Supabase Auth** con *magic link* por email (sin contraseñas que recordar).
   Authentication → Providers → Email → *Enable*.
2. **Añadir la columna de propietario** y rellenarla con los usuarios actuales:
   ```sql
   alter table sets_log add column owner uuid references auth.users(id);
   alter table body_log add column owner uuid references auth.users(id);
   -- backfill: mapear cada user_key al uid del usuario ya registrado
   update sets_log set owner = 'UID-DE-ANNA'  where user_key = 'anna_7f3c91';
   update sets_log set owner = 'UID-DE-DAVID' where user_key = 'david_2b8e46';
   ```
3. **Cambiar las políticas** para que cada uno vea solo lo suyo:
   ```sql
   drop policy "anon sel sets" on sets_log;   -- y las demás de anon
   create policy "propios sets" on sets_log
     for all to authenticated
     using (owner = auth.uid()) with check (owner = auth.uid());
   ```
4. **En la app**: una pantalla de login que pide el email y llama a
   `POST /auth/v1/otp`. El token de sesión sustituye a la clave `anon` en la cabecera
   `Authorization`. El selector Anna/David desaparece: el usuario sale de la sesión.

Trabajo estimado: una pantalla nueva y unas 80-100 líneas en `store.js`. El resto de la app
no se entera, porque `user_key` ya está aislado en `routines.js`.

**Acceso de administrador:** David es el dueño del proyecto de Supabase, así que ya tiene acceso
total a la base de datos desde el panel — eso no depende de las políticas RLS, que solo gobiernan
lo que la app puede leer y escribir. Si además quiere ver los datos de todos *dentro de la app*,
se añade una política extra con su uid.

## Límites del plan gratuito

- **Espacio: 500 MB.** Una serie registrada ocupa unos 220 bytes con índices. Cuatro personas
  entrenando 4 días por semana generan ~5 MB al año: el espacio no será nunca el problema.
- **Pausa por inactividad:** un proyecto gratuito se pausa tras **7 días sin actividad**. Con
  entrenamientos regulares no ocurre; tras unas vacaciones largas hay que reactivarlo con un clic
  desde el panel. No se pierden datos.
- GitHub Pages solo sirve archivos estáticos: **no tiene base de datos**. Aloja la app; los datos
  viven en Supabase.

## Lo que hay que saber

**El repo es público y la clave `anon` va en el cliente.** No hay forma de esconderla en un sitio
estático. Con estas políticas, quien encuentre el repo **puede leer y escribir los registros de
entrenamiento**. Lo que se expone en el peor caso: dos nombres de pila, kilos levantados, peso
corporal y cintura. Ningún dato de contacto ni credencial reutilizable. Por eso `user_key` no es
`anna` sino un valor no adivinable (`anna_7f3c91`), definido en `routines.js`.

Si eso no basta, el upgrade es **Supabase Auth con magic link**: añade una pantalla de login y unas 60
líneas, y aísla los datos de verdad. El modelo de datos no cambia, así que se puede hacer después.

**El temporizador de descanso no suena solo.** Se calcula por diferencia de timestamp, así que la
cuenta es correcta aunque bloquees el móvil, pero iOS no permite alarmas fiables en segundo plano sin
notificaciones push. Hay que tener la app delante.

**El gráfico de peso y cintura comparte un eje Y.** Con kg y cm en el mismo rango se lee bien y lo que
importa es la tendencia; si algún día los valores se separan mucho, habría que meter un segundo eje.

**Las fotos de técnica** vienen de [free-exercise-db](https://github.com/yuhonas/free-exercise-db),
que está bajo **Unlicense (dominio público)**. Cada ejercicio tiene dos fotogramas que se alternan
en bucle. Están redimensionadas a 440 px y recomprimidas: 1,7 MB en total, unos 20 KB por imagen.

**No se precargan.** El service worker no las mete en el shell de instalación: se cachean solas la
primera vez que se abre cada ejercicio. Así la instalación sigue siendo ligera y, en una semana de
uso normal, quedan todas guardadas. Si una foto no ha llegado a cachearse y estás sin cobertura,
la app cae al dibujo SVG de `moves.js`, que sí viaja siempre con el código.

**El emparejamiento foto ↔ ejercicio se hizo a mano.** El automático por nombre fallaba en 15 de 65
y algunos errores eran peligrosos: mapeaba el press militar a "press tras nuca", el remo con barra
a "remo al mentón" y el pull-over a un curl de bíceps. Una foto equivocada enseña mal con toda la
confianza del mundo. Si algún día se añade un ejercicio, hay que elegir su foto mirándola.

**Las calorías y los precios de la dieta son estimaciones.** Las kcal salen de tablas de composición
estándar y sirven para acertar el objetivo con un margen del 5-10 %. Los precios son de referencia
para comparar recetas entre sí, no para cuadrar el ticket del súper.

**Copia de seguridad.** En Ajustes hay *Descargar copia* y *Restaurar copia* (JSON). Útil al cambiar
de móvil, y obligatorio si no configuras Supabase.
