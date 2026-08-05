# Entreno

Web app de registro de entrenamiento. Se abre desde el móvil como una app, funciona **sin cobertura
en el gimnasio**, y calcula sola qué peso toca hoy en cada ejercicio aplicando doble progresión.
Las rutinas originales salen de `Anna.pdf` y `David.pdf`; cualquier persona nueva puede **crearse
una cuenta** y la app le genera rutina y dieta a partir de un cuestionario.

Sitio estático: **sin framework, sin build, sin npm**. GitHub Pages lo sirve tal cual.

## Cómo funciona

- **Login con usuario y PIN.** Cada persona tiene su cuenta. El primer login necesita conexión;
  a partir de ahí la sesión y la rutina quedan cacheadas y todo funciona offline.
- **Alta con cuestionario.** Edad, sexo, peso, altura, experiencia, días por semana, duración de
  la sesión, otro deporte y sus días, objetivo y molestias. Con eso la app elige una plantilla del
  catálogo y le aplica cuatro reglas independientes (ver abajo), y calcula las calorías con
  Mifflin-St Jeor. Se entrena desde el minuto uno, sin que nadie toque el código.
- **Superadmin.** David (`is_admin` en su fila de `users`) ve un panel de administración en
  Ajustes: entrar en la cuenta de cualquiera (ver su rutina, progreso y registros), editar su
  rutina (series, reps, RIR, descansos, cargas, añadir o quitar ejercicios del catálogo),
  cambiar PINs y borrar cuentas.

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
| `styles.css` | Sistema de diseño **Halo** (ver abajo) |
| `routines.js` | Solo datos: rutinas de anna/david/jan + catálogo `EXERCISES`/`DAYS` derivado |
| `accounts.js` | Login con PIN, alta con cuestionario, generación de rutina/dieta, resolver de rutinas JSON |
| `photos/` | 45 pares de fotos de técnica (inicio y final), 1,7 MB |
| `make-icon.mjs` | Genera `icon-180.png` e `icon-512.png` (mancuerna en blanco roto sobre grafito). `node make-icon.mjs` |
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

## Cómo se adapta la rutina al cuestionario

Sobre la plantilla del número de días se aplican cuatro reglas **independientes** en
`accounts.js`. Ninguna sabe de las otras, así que se pueden combinar sin que nada se rompa:

| Respuesta | Qué cambia |
|---|---|
| **Molestia** (hombro / rodilla / lumbar) | Se quitan los patrones que la cargan (`EVITAR`). Si un día se quedara con menos de 3 ejercicios, se deja entero: media sesión no ayuda a nadie |
| **Duración de la sesión** (30-75 min) | Tope de ejercicios por día (`MAX_EJERCICIOS`). Se recorta por los accesorios y se conserva el core, que es el finalizador |
| **Otro deporte** (correr o bici, ≥ 2 días) | Menos series en los patrones de pierna y un punto más de RIR: la pierna ya la entrena fuera del gimnasio. Con 4 días o más, el recorte es doble |
| **Objetivo** | Multiplicador de calorías, gramos de proteína y grasa, y los textos de estrategia de la pestaña Dieta |

Y una corrección que arrastraba: **el factor de actividad va por los días TOTALES de entreno**,
gimnasio más deporte. Antes solo contaba los del gimnasio, así que a alguien que corría tres días
más se le calculaba el gasto de un sedentario y comía de menos sin saber por qué. En el caso de
prueba del `progression.test.mjs` la diferencia son 600 kcal.

Lo que **no** pregunta todavía y se nota: el material disponible (todo asume gimnasio con
máquinas) y la fecha de la prueba. Añadir material significa etiquetar los 101 ejercicios del
catálogo con lo que necesitan; la fecha solo vale la pena con periodización de verdad detrás.

## Diseño

Sigue `DESIGN.md` (**Halo**, que sustituye a Onyx y a `stitch_iron_flow_fitness.zip`): negro frío
`#08080a` tratado como material, con una luz ambiental fija arriba y una capa de grano finísimo
para que el fondo tenga textura en vez de ser un vacío plano.

La jerarquía se construye con **luminancia**, no con color: blanco roto `#f4f4f6` para lo que
importa, gris medio para lo que acompaña. El color aparece una sola vez, periwinkle `#7f8cf0`, y
solo sobre datos: la línea del gráfico, la sesión de hoy, la pestaña activa, el foco y la serie
confirmada. **La acción principal nunca es de color:** es una pastilla blanco roto con texto negro.

**Casi nada vive dentro de una caja.** No hay tarjetas redondeadas apiladas: la estructura la hacen
hairlines de 0,5 px a sangre, el aire y la tipografía. Solo se eleva una superficie cuando la
elevación significa algo, y eso pasa en dos sitios: el lector de carga sugerida y el cristal fijo.

El **cristal** (`backdrop-filter`) se reserva a los elementos fijos —barra de navegación, dock
inferior flotante (solo iconos), barra de descanso y toast—, que es donde iOS lo compone sin
repintar en cada scroll. Escala de formas única: píldora en controles, 13 px en inputs y
miniaturas, 20 px en las superficies elevadas, 24 px en el dock. Monoespaciada tabular para todo
dato numérico. Tema único oscuro.

Las **fotos** son parte del sistema: los 45 pares de `photos/` se reutilizan como imagen de la
sesión de hoy (a sangre, con la parte de arriba desvanecida por máscara) y como miniatura de cada
ejercicio, siempre con el mismo tratamiento casi monocromo del token `--photo`. Al ir dentro del
paquete no cuestan ni una petición de red ni rompen el modo offline.

**Tipografía:** pila del sistema — **en iPhone salen SF Pro y SF Mono**. Un `@import` de Google
Fonts rompería el modo offline, y SF Pro es lo que el diseño pide.

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
paquete cacheado. Si no coinciden, ese móvil tiene una copia vieja y sale una barra blanca arriba con
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

-- El login es un PIN comprobado en el cliente, así que el rol anónimo necesita
-- insertar, leer y actualizar. UPDATE es imprescindible: el upsert por client_id
-- hace UPDATE al reeditar una serie.
create policy "anon rw sets" on sets_log for select to anon using (true);
create policy "anon ins sets" on sets_log for insert to anon with check (true);
create policy "anon upd sets" on sets_log for update to anon using (true) with check (true);

create policy "anon rw body" on body_log for select to anon using (true);
create policy "anon ins body" on body_log for insert to anon with check (true);
create policy "anon upd body" on body_log for update to anon using (true) with check (true);

grant select, insert, update on sets_log, body_log to anon;
grant usage, select on all sequences in schema public to anon;
```

3. La tabla de **cuentas** (v1.4.0). Guarda login, perfil del cuestionario, objetivos de dieta
   y la rutina como JSON — las de anna/david/jan siguen viviendo en `routines.js` y su fila
   solo dice `{"builtin":"anna"}`:

```sql
create table users (
  username   text primary key,            -- minúsculas, único
  name       text not null,
  pin_hash   text not null,               -- hex sha256('username:PIN')
  is_admin   boolean not null default false,
  remote_key text unique not null,        -- enlaza con sets_log/body_log.user_key
  profile    jsonb,                       -- respuestas del cuestionario
  routine    jsonb not null,              -- {"builtin":"anna"} o JSON con refs al catálogo
  targets    jsonb,                       -- null => usa TARGETS[username] de nutrition.js
  created_at timestamptz not null default now()
);
alter table users enable row level security;
create policy "anon all users" on users for all to anon using (true) with check (true);
grant select, insert, update, delete on users to anon;

-- Semilla: los 3 usuarios originales. Los hashes se calculan en la consola del
-- navegador (F12) con:
--   const h = async (u,p) => [...new Uint8Array(await crypto.subtle.digest('SHA-256',
--     new TextEncoder().encode(u+':'+p)))].map(b=>b.toString(16).padStart(2,'0')).join('');
--   await h('anna', '1234')
insert into users (username, name, pin_hash, is_admin, remote_key, routine) values
  ('anna',  'Anna',  '<hash de anna:PIN>',  false, 'anna_7f3c91',  '{"builtin":"anna"}'),
  ('david', 'David', '<hash de david:PIN>', true,  'david_2b8e46', '{"builtin":"david"}'),
  ('jan',   'Jan',   '<hash de jan:PIN>',   false, 'jan_5d1a83',   '{"builtin":"jan"}');
```

Al publicar la v1.4.0, en los móviles que ya tenían la app sale la pantalla de login **una sola
vez** con su usuario precargado: el username coincide con la clave local de siempre
(`anna`/`david`/`jan`), así que todo el historial del móvil y de la nube cuadra sin migrar nada.

3. En **Project Settings → API**, copia la *Project URL* y la clave `anon public`.
4. Pégalas al principio de `store.js`:
   ```js
   export const SUPABASE_URL = 'https://xxxx.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJ...';
   ```
5. `git commit` y `git push`. En **Ajustes** de la app aparecerá el estado de sincronización.

## El modelo de cuentas (v1.4.0) y cómo endurecerlo

El login actual es **usuario + PIN comprobado en el cliente** contra la tabla `users` (el hash
del PIN viaja con la clave `anon`, que es pública). Para un grupo de amigos de gimnasio es
suficiente y no pide emails ni contraseñas; como seguridad real, es teatro — igual que antes.

Si el grupo crece o alguien quiere privacidad de verdad, el upgrade es **Supabase Auth con
email + contraseña (o magic link)**, y la migración es aditiva:

1. Authentication → Providers → Email → *Enable*.
2. `alter table users add column auth_uid uuid references auth.users(id);` y rellenarla al
   registrar cada email. Ídem `owner uuid` en `sets_log`/`body_log` con backfill por `user_key`.
3. Cambiar las políticas de `anon` a `authenticated using (owner = auth.uid())`, con una
   política extra para el uid de David (admin).
4. En la app: la pantalla de login pasa a pedir email y el token de sesión sustituye a la clave
   `anon` en la cabecera `Authorization`. El resto no cambia: la rutina ya viene de la fila de
   `users` y `remote_key` ya aísla los registros.

**Acceso de administrador:** David es el dueño del proyecto de Supabase, así que ya tiene acceso
total a la base de datos desde el panel — eso no depende de las políticas RLS. Dentro de la app,
el panel de administración se enseña a quien tiene `is_admin` en su fila.

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
estático. Con estas políticas, quien encuentre el repo **puede leer y escribir la tabla de
cuentas y los registros de entrenamiento**. Lo que se expone en el peor caso: nombres, respuestas
del cuestionario (edad, peso, altura, objetivo), kilos levantados y hashes de PIN. Ningún dato de
contacto ni credencial reutilizable — no uses como PIN nada que uses en otro sitio. El login por
PIN es una puerta de jardín, no una caja fuerte; si hace falta más, el camino es Supabase Auth
(sección anterior).

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
