# Design System: Halo

> zgym. Registro de entrenamiento, iOS-first, PWA offline.
> Sustituye a `Onyx` (negro cálido + champán) y a `stitch_iron_flow_fitness.zip` (Kinetic Noir, verde lima).

## 1. Visual Theme & Atmosphere

Dos decisiones mandan sobre todo lo demás.

**El negro es un material, no una ausencia.** Una sola fuente de luz ambiental cae desde arriba de
la pantalla y un grano finísimo cubre todo, ambos en capas fijas. El fondo tiene textura en vez de
ser un vacío plano.

**Casi nada vive dentro de una caja.** No hay tarjetas redondeadas apiladas: la estructura la hacen
hairlines de 0.5px a sangre, el aire y la tipografía. Una superficie solo se eleva cuando la
elevación significa algo, y en toda la app eso pasa en dos sitios: el lector de carga sugerida
(el dato que se mira entre series) y el cristal fijo (barra de navegación, dock, descanso, toast).

La jerarquía se construye con **luminancia**, no con color: blanco roto para lo que importa, gris
medio para lo que acompaña, gris oscuro para las etiquetas. El color aparece una sola vez, en
periwinkle frío, y solo sobre datos: la línea del gráfico, la sesión de hoy, el tick de sesión
hecha, la pestaña activa, el foco, la serie confirmada. La acción principal nunca es de color: es
una pastilla blanco roto con texto negro, que es el gesto más caro que tiene iOS.

Las **fotos** son parte del sistema, no decoración: la app ya lleva 45 pares de fotos de técnica
dentro del paquete, así que la sesión de hoy se presenta con la foto de su primer ejercicio a
sangre y cada fila de ejercicio con su miniatura. Nada de esto pide red ni rompe el modo offline.

Dials: **Variance 5** (UI de producto, la previsibilidad es una función), **Motion 4**
(fluido y callado, sin coreografía), **Density 3** (aire de galería, no cabina).

## 2. Color Palette & Roles

**Superficies**
- **Canvas** `#08080A` — fondo, negro frío casi puro. Nunca `#000000`.
- **Surface** `#0E0F12` — tarjetas, grupos, hoja de acceso.
- **Surface Low** `#15161A` — inputs, tiles internos, notas.
- **Surface High** `#1D1F24` — controles elevados, chips, tick, lozenge de la pestaña activa.
- **Glass Fill** `rgba(12,13,16,0.62)` — relleno base de cabecera, dock, barra de descanso.

**Texto**
- **Ivory** `#F4F4F6` — texto primario y relleno del CTA principal.
- **Steel** `#9A9BA3` — texto secundario, descripciones, segunda serie del gráfico.
- **Graphite** `#62636B` — etiquetas, unidades, números apagados, placeholders.

**Estructura**
- **Hairline** `rgba(255,255,255,0.09)` — bordes estructurales de 0.5px.
- **Hairline Soft** `rgba(255,255,255,0.055)` — separadores entre filas.
- **Highlight** `rgba(255,255,255,0.06)` — luz interior en el borde superior de cada superficie.

**Acento (uno solo)**
- **Periwinkle** `#7F8CF0` — hsl(232, 78%, 72%). Línea del gráfico, marcador de hoy, icono de la
  pestaña activa, anillo de foco, serie confirmada, dato crítico. Nada más.
- **Periwinkle Deep** `#5A64B8` — estado de descarga (deload) y valores pasados de largo.
- **Periwinkle Hair** `rgba(127,140,240,0.38)` — borde de tarjeta completada.
- **Periwinkle Soft** `rgba(127,140,240,0.10)` — lavado de fondo de la fila de hoy.

**Otros**
- **Coral** `#FF9E8F` — error y advertencia. Suave, nunca neón.
- **On-Ivory** `#08080A` — texto sobre relleno blanco roto.

**Fotos**
- Tratamiento único: `grayscale(0.94) contrast(1.12) brightness(0.9)`. Las fotos de gimnasio traen
  paredes rojas y camisetas de colores; casi en blanco y negro, el acento vuelve a ser el único
  color de la app. Vive en el token `--photo`, no repetido en cada regla.

**Prohibido:** verde lima (`#c3f400` y familia), champán / dorado, `#000000` puro, `#FFFFFF` puro,
glow exterior, degradados de color sobre superficies, fotos a plena saturación, más de un tono
de acento.

## 3. Typography Rules

- **Display / numerales grandes:** pila del sistema (SF Pro en iOS). Peso 500-600,
  `letter-spacing: -0.03em`, interlineado apretado. La jerarquía sale del peso y del color,
  nunca de gritar el tamaño.
- **Body:** 17px / 23px, `-0.01em`, Ivory. Es el mínimo que evita el zoom automático de Safari.
- **Mono:** `ui-monospace` / SF Mono para **todo** dato numérico, con `tabular-nums` y `-0.02em`.
  Un peso que cambia de ancho al teclearlo se lee como un formulario, no como un instrumento.
- **Etiquetas:** 11px, peso 600, mayúsculas, `letter-spacing: 0.06em`, Graphite.
- **Prohibido:** importar Google Fonts o Inter por `<link>` (rompe el modo offline), serif,
  fuentes decorativas, mayúsculas en textos largos.

## 4. Component Stylings

- **Dock inferior (glass):** flotante, ancho al contenido, centrado, despegado del borde inferior
  (12px + safe-area), radio 24px, `backdrop-filter: blur(36px) saturate(190%)`, borde
  `rgba(255,255,255,.11)`, luz interior arriba y sombra profunda debajo. **Solo iconos** (la
  etiqueta sigue en el DOM para lectores de pantalla). La pestaña activa lleva un lozenge claro y
  el icono en Periwinkle. Aproximación web de vidrio, no Liquid Glass de Apple.
- **Título de pantalla raíz:** grande, en el flujo, sin barra fija (`.lead`, 33px, `-0.035em`) con
  un subtítulo en micro-mayúsculas. La navegación es el dock, que nunca se va.
- **Barra de navegación:** solo en pantallas de segundo nivel, donde es el único camino de vuelta.
  Cristal, 17px, chevron circular a la izquierda, y una línea de contexto en mono debajo.
- **Acceso:** foto a sangre en la mitad superior, logotipo sobre su desvanecido y formulario
  anclado abajo, en la zona del pulgar. Los campos son cajas de 58px con relleno propio (blanco al
  6%), borde visible, radio 14px y un **icono a la izquierda** que hace de etiqueta permanente, de
  modo que el texto guía puede desaparecer al escribir sin perder de qué campo se trata. Al enfocar:
  borde Periwinkle, lavado Periwinkle al 7% y el icono en Periwinkle. El PIN lleva un botón de ojo
  para verlo: teclear un PIN a ciegas de pie en el gimnasio es hostil. Una hairline suelta bajo un
  input desnudo no dice "escribe aquí": el relleno y el borde sí.
- **Sesión de hoy:** foto del primer ejercicio a sangre, con la parte superior desvanecida por
  máscara y un degradado a negro debajo para proteger el texto. Titular de 34px, cifra de progreso
  en mono y pista de 2px.
- **Semana:** un círculo de 40px por sesión planificada. Hecha = relleno Periwinkle con tick.
  Pendiente = inicial del día en Graphite. Hoy = borde Periwinkle.
- **Listas:** filas a sangre separadas por hairlines, sin contenedor ni fondo. `:active` baja la
  opacidad, no escala: escalar una fila sin caja no tiene nada que escalar.
- **Ejercicio:** fila con miniatura de 46px (radio 12px) de la foto de técnica. El índice en mono
  va debajo de la imagen, así que si la foto no carga queda el número, sin JavaScript.
- **Lector de carga:** doble bisel (cáscara con padding de 5px y núcleo con radio concéntrico).
  Cifra en mono a 40px. Es la única superficie elevada del entreno.
- **Fila de datos:** cifras grandes separadas por hairlines verticales, etiqueta pequeña debajo.
  Sustituye a los tiles con borde en Progreso y Dieta.
- **Botones:** pastilla (999px). Primario = relleno Ivory + texto negro, sin glow. Secundario =
  blanco al 7% + hairline. `:active` → `scale(0.97)`.
- **Inputs:** radio 13px, relleno blanco al 5%, hairline; etiqueta encima en 11px mayúsculas,
  nunca placeholder como etiqueta. Foco = borde Periwinkle, sin anillo difuso. Altura ≥ 46px.
- **Tabla de series:** sin separadores por fila (los inputs ya estructuran), celdas de 44-46px,
  numerales centrados en mono, RIR con ancho fijo. Fila guardada: numerales en Periwinkle y tick
  relleno.
- **Avisos:** sin caja. Un filo de 2px a la izquierda y sangría, del color que corresponda.
- **Barra de descanso:** pastilla de cristal flotando sobre el dock, con una pista de 2px en el
  borde inferior que se vacía en tiempo real. Pasado el objetivo, la cuenta va en Periwinkle Deep.
- **Gráficos:** SVG, línea Periwinkle de 2px sin relleno de área, segunda serie discontinua en
  Steel, rejilla en Hairline Soft, etiquetas en mono Graphite.
- **Toast:** pastilla de cristal centrada sobre el dock. **Aviso de versión:** barra Ivory arriba.

## 5. Layout Principles

- Columna única, `max-width: 640px`, `padding: 0 20px`, colchón inferior de 132px para que el dock
  flotante nunca tape la última fila. `min-height: 100dvh`, nunca `100vh` a secas.
- Las hairlines abarcan el ancho del contenido (entran 20px por cada lado). Solo la foto de la
  sesión de hoy rompe el margen y va a sangre real.
- Las secciones se titulan con `sec-title` en micro-mayúsculas. Nunca dos secciones seguidas con
  el mismo rótulo: si el bloque de arriba ya dice "Esta semana", la lista de abajo no lo repite.
- Una pantalla, una idea principal arriba: en Entreno manda la sesión de hoy; el mesociclo baja a
  una tira fina. Nada de tres bloques compitiendo por el primer scroll.
- Sin cajas dentro de cajas dentro de cajas: máximo dos niveles de superficie, y el segundo solo
  cuando el doble bisel lo justifica.
- Todo lo tocable, ≥ 44px. Safe areas respetadas arriba y abajo.

## 6. Motion & Interaction

- Curva única: `cubic-bezier(0.32, 0.72, 0, 1)`, la de iOS. Nada de `linear` ni `ease-in-out`.
- Solo se animan `transform` y `opacity`. Nunca `top`, `left`, `width` ni `height`.
- Al cambiar de pantalla, `#app` entra una vez con un fade-up de 10px en 280ms. Sin cascada por
  tarjeta: la pantalla se re-renderiza cada vez que se guarda una serie y la cascada se vería
  como un parpadeo.
- Presión física: botones `scale(0.97)`, tarjetas tocables `scale(0.985)`, tick `scale(0.92)`.
- `backdrop-filter` solo en elementos fijos o pegajosos. Grano solo en una capa fija con
  `pointer-events: none`.
- `@media (prefers-reduced-motion: reduce)` apaga todas las transiciones y animaciones.
- Cada animación tiene un motivo: transición de pantalla, feedback de pulsación, o el descanso
  vaciándose. Nada de bucles infinitos decorativos.

## 7. Anti-Patterns (Banned)

- Nada de verde lima ni de champán: son las firmas de los dos sistemas anteriores.
- Nada de `#000000` ni `#FFFFFF` puros.
- Nada de glow, neón, degradados de color sobre tarjetas ni sombras negras duras.
- Nada de un segundo tono de acento "para variar": un acento, en toda la app.
- Nada de emojis en la interfaz, ni em-dash (`—`) en ningún texto visible: guion normal.
- Nada de etiquetas numeradas de sección, chips de versión decorativos, puntos de color
  decorativos ni pistas de progreso con fondo relleno.
- Nada de nombres genéricos, cifras de falsa precisión ni jerga de marketing
  ("eleva", "sin fricción", "next-gen").
- Nada de spinners circulares: los estados vacíos se explican con una frase y los datos que faltan
  se dicen con texto, no con un símbolo.
