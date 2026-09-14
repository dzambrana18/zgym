// Datos de rutina extraídos de Anna.pdf y David.pdf. Solo datos, sin lógica.
//
// unit:      'kg'            → carga total en la barra / placa de la máquina
//            'kg-por-mano'   → peso de CADA mancuerna
//            'peso-corporal' → sin carga externa
// increment: kilos que se suben al completar el tope del rango de repeticiones.
//            null = progresa en repeticiones (y luego con lastre).
//            negativo = menos es mejor (máquina de asistencia).
// photo:     carpeta de photos/ con las dos fotos (inicio y final) del ejercicio.
//            Vienen de free-exercise-db (dominio público). Si falla la carga, la app
//            cae al dibujo SVG de moves.js.
// timed:     true → las "repeticiones" son segundos.
// rir:       objetivo de la semana 3 (semana normal). Las demás semanas lo modula
//            progression.js con el offset del mesociclo.

// Jan hace la misma sesión de empuje el lunes y el jueves, así que las dos apuntan a
// este mismo array en vez de copiarlo: si mañana se cambia un peso, cambia en los dos
// días a la vez y no pueden desincronizarse. Compartir los objetos es seguro porque
// nadie los muta (progression.js y el editor trabajan sobre copias).
const JAN_EMPUJE = [
  { key: 'j-press-banca-mancuernas', pattern: 'press-banca', photo: 'dumbbell-bench-press', name: 'Press banca con mancuernas', cue: 'Escápulas atrás y abajo, codos a 45°. Con mancuernas cada brazo trabaja por su cuenta, así que empieza ligero: baja hasta que las mancuernas queden a la altura del pecho, sin forzar el hombro.', video: 'press+banca+con+mancuernas+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 3, restSec: 180, startLoad: 10, unit: 'kg-por-mano', increment: 1 },
  { key: 'j-press-inclinado-barra', pattern: 'press-inclinado', photo: 'barbell-incline-bench-press-medium-grip', name: 'Press inclinado con barra (30°)', cue: 'El pecho superior es lo que más cambia la forma del torso. Banco a 30°, ni más: por encima se convierte en un press de hombro.', video: 'press+inclinado+con+barra+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 3, restSec: 150, startLoad: 22.5, unit: 'kg', increment: 2.5 },
  { key: 'j-peck-deck', pattern: 'apertura', name: 'Contractora (peck deck)', cue: 'La máquina te lleva el recorrido, así que es la forma más fácil de aprender a apretar el pecho. Espalda pegada al respaldo y junta despacio, apretando 1 s en el centro.', video: 'contractora+peck+deck+tecnica+correcta', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 90, startLoad: 20, unit: 'kg', increment: 2.5 },
  { key: 'j-fondos', pattern: 'fondos', photo: 'dips-chest-version', name: 'Fondos en paralelas asistidos', cue: 'Tronco algo inclinado hacia delante para cargar pecho. Usa la máquina de asistencia hasta llegar a 8 limpios.', video: 'fondos+en+paralelas+tecnica+pecho', sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 120, startLoad: 0, unit: 'peso-corporal', increment: null },
  { key: 'j-laterales-polea', pattern: 'elevacion-lateral', photo: 'cable-seated-lateral-raise', name: 'Elevaciones laterales en polea', cue: 'En polea la tensión no se pierde abajo, que es donde la mancuerna deja de pesar. Sube a la horizontal y baja en 3 s: si tienes que balancearte, sobra peso.', video: 'elevaciones+laterales+en+polea+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 2, restSec: 75, startLoad: 5, unit: 'kg', increment: 2.5 },
  { key: 'j-triceps-cuerda', pattern: 'extension-triceps', photo: 'triceps-pushdown-rope-attachment', name: 'Extensión de tríceps en polea con cuerda', cue: 'Codos pegados al costado y quietos. Abre la cuerda al final del recorrido.', video: 'extension+de+triceps+en+polea+con+cuerda+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 75, startLoad: 12, unit: 'kg', increment: 2.5 },
];

export const USERS = {
  // v1.6.0 — reordenada con los datos del bloque de agosto. El viernes era el día que
  // se caía (2 de 5 semanas) y justo ahí vivía todo el glúteo: el hip thrust se entrenó
  // UNA vez en cinco semanas. Ahora el día de glúteo es el lunes y el hip thrust sale
  // dos veces por semana. Las claves de ejercicio no se tocan, para no perder histórico.
  anna: {
    name: 'Anna',
    // user_key no adivinable para Supabase (el repo es público)
    remoteKey: 'anna_7f3c91',
    subtitle: 'Torso–pierna · 4 días · prioridad glúteo y pierna',
    // Bloque de 4 semanas sin descarga: la semana 1 es la suave (RIR alto).
    weekLabels: ['3', '2-3', '2', '1-2'],
    // El plan cambió hoy: el bloque nuevo empieza con el primer entreno que se registre
    // a partir de esta fecha, no en el calendario. Lo anterior se conserva entero.
    blockFrom: '2026-09-14',
    days: [
      {
        key: 'a-pierna-b',
        name: 'Glúteo y cadera',
        subtitle: 'El día importante del bloque: por eso va primero',
        weekday: 'Lunes',
        warmup: '5 min de bicicleta · 90/90 de cadera y estiramiento del psoas · 20 puentes de glúteo con banda · 15 abducciones de pie con banda. En el hip thrust: barra vacía × 12 y otra al 60 % × 8.',
        exercises: [
          { key: 'a-hip-thrust', pattern: 'hip-thrust', photo: 'barbell-hip-thrust', name: 'Hip thrust en máquina (carga con discos)', cue: 'Espalda apoyada en el respaldo, almohadilla sobre la cadera. Barbilla al pecho y pausa de 1 s arriba sin hiperextender lumbar. En el bloque pasado solo lo hiciste una vez: ahora abre el lunes y se repite el jueves con más repeticiones.', video: 'hip+thrust+en+maquina+tecnica', sets: 4, repMin: 6, repMax: 10, rir: 2, restSec: 150, startLoad: 35, unit: 'kg', increment: 5 },
          { key: 'a-rdl', pattern: 'bisagra', photo: 'romanian-deadlift', name: 'Peso muerto rumano con barra', cue: 'Cadera atrás, barra rozando el muslo. Para cuando pierdas la curvatura lumbar. Cerraste en 60 × 10 con RIR 2: sigue desde ahí.', video: 'peso+muerto+rumano+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 60, unit: 'kg', increment: 2.5 },
          { key: 'a-zancada-caminando', pattern: 'zancada', photo: 'split-squat-with-dumbbells', name: 'Zancada caminando con mancuernas', cue: 'Paso largo, la rodilla de atrás baja hacia el suelo y empujas con el talón de delante. 10-12 pasos por pierna. Solo necesita dos mancuernas y un pasillo: es el glúteo que siempre puedes hacer aunque el gimnasio esté lleno.', video: 'zancada+caminando+con+mancuernas+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 8, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-prensa-alta', pattern: 'prensa', photo: 'leg-press', name: 'Prensa con pies altos y anchos', cue: 'Enfatiza glúteo e isquio. Rango profundo sin despegar la lumbar. Si la prensa está ocupada, haz una serie más de zancada y sigue.', video: 'prensa+de+piernas+pies+altos+gluteo+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 70, unit: 'kg', increment: 5 },
          { key: 'a-abduccion', pattern: 'abduccion', photo: 'thigh-abductor', name: 'Abducción de cadera en máquina', cue: 'Tronco ligeramente adelantado. Pausa de 1 s en apertura máxima. Ibas a 45 × 15 con RIR 2: empieza en 55.', video: 'abductores+en+maquina+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 55, unit: 'kg', increment: 2.5 },
          { key: 'a-femoral-tumbada', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbada', cue: 'Cadera pegada al banco; excéntrica lenta de 3 s.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 90, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'a-plancha-lateral', pattern: 'plancha-lateral', photo: 'side-bridge', name: 'Plancha lateral', cue: 'Apoyo en antebrazo, cadera bien alta y alineada. Alternando lados.', video: 'plancha+lateral+tecnica+correcta', sets: 3, repMin: 20, repMax: 30, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
      {
        key: 'a-torso-a',
        name: 'Torso A',
        subtitle: 'Espalda vertical, hombro y brazos',
        weekday: 'Martes',
        warmup: '5 min de remo o elíptica suave · movilidad de columna torácica (gato-camello, rotaciones) · 20 rotaciones externas de hombro con banda · dislocaciones con palo. En el jalón: 2 series de aproximación con el 50 % y el 75 % del peso de trabajo, 5 reps cada una.',
        exercises: [
          { key: 'a-jalon-prono', pattern: 'jalon', photo: 'wide-grip-lat-pulldown', name: 'Jalón al pecho, agarre prono ancho', cue: 'Pecho alto, tira con los codos hacia las costillas. Sin balanceo.', video: 'jalon+al+pecho+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 35, unit: 'kg', increment: 2.5 },
          { key: 'a-press-militar-mancuernas', pattern: 'press-vertical', photo: 'dumbbell-shoulder-press', name: 'Press militar sentada con mancuernas', cue: 'Respaldo a 80-85°, costillas abajo para no arquear lumbar. Cerraste el bloque en 10 kg por mano tocando el tope del rango.', video: 'press+militar+con+mancuernas+sentado+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 10, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-remo-mancuerna', pattern: 'remo-mancuerna', photo: 'one-arm-dumbbell-row', name: 'Remo con mancuerna a una mano', cue: 'Una mano y una rodilla en el banco. 10-12 por brazo. A una mano trabajas cada lado por separado y el core aguantando la rotación.', video: 'remo+con+mancuerna+a+una+mano+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 16, unit: 'kg', increment: 2 },
          { key: 'a-press-banca-mancuernas', pattern: 'press-banca', photo: 'dumbbell-bench-press', name: 'Press banca plano con mancuernas', cue: 'Cinco sesiones clavada en 12 kg anotando RIR 4: te sobraba margen, no peso. Empiezas en 13 y buscas el RIR 2 de verdad.', video: 'press+banca+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 13, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-laterales', pattern: 'elevacion-lateral', photo: 'side-lateral-raise', name: 'Elevaciones laterales con mancuernas', cue: 'Sube hasta la horizontal, baja en 2-3 s. Cero impulso de cadera. Bajaste de 7 a 5 kg durante el bloque: quédate en 5 y sube solo cuando salgan 15 limpias.', video: 'elevaciones+laterales+con+mancuernas+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 5, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-face-pull', pattern: 'face-pull', photo: 'face-pull', name: 'Face pull en polea alta', cue: 'Codos altos y rotación externa al final: hombro posterior más rotadores. Es lo que compensa las horas de hombro adelantado. Serie normal con su descanso, ya no va encadenado a nada.', video: 'face+pull+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 10, unit: 'kg', increment: 2.5 },
          { key: 'a-curl-inclinado', pattern: 'curl-biceps', photo: 'incline-dumbbell-curl', name: 'Curl bíceps en banco inclinado', cue: 'Brazo por detrás del tronco, estiramiento completo abajo.', video: 'curl+biceps+banco+inclinado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 7, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-press-frances', pattern: 'press-frances', photo: 'lying-triceps-press', name: 'Press francés con mancuernas', cue: 'Tumbada en el banco, bajas las mancuernas hacia la frente con los codos quietos. El tríceps trabaja estirado, que es donde más crece.', video: 'press+frances+con+mancuernas+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 12, unit: 'kg-por-mano', increment: 1 },
        ],
      },
      {
        key: 'a-pierna-a',
        name: 'Cuádriceps y glúteo',
        subtitle: 'Dominante de rodilla',
        weekday: 'Jueves',
        warmup: '5 min de bicicleta · movilidad de tobillo contra la pared (10 por lado) · 90/90 de cadera · 15 puentes de glúteo y 15 pasos laterales con banda. En la sentadilla: barra vacía × 10, luego 50 % × 5, 70 % × 3 y 85 % × 1.',
        exercises: [
          { key: 'a-sentadilla', pattern: 'sentadilla', photo: 'barbell-squat', name: 'Sentadilla trasera con barra', cue: 'De 60 a 80 kg en cinco semanas, el mejor progreso de todo tu bloque. Las 4 series al MISMO peso: escalonar dentro de la sesión infla el número pero no el volumen.', video: 'sentadilla+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 2, restSec: 180, startLoad: 82.5, unit: 'kg', increment: 2.5 },
          { key: 'a-hip-thrust-alto', pattern: 'hip-thrust', photo: 'barbell-hip-thrust', name: 'Hip thrust en máquina (repeticiones altas)', cue: 'Segunda dosis de glúteo de la semana. Mismo movimiento que el lunes pero más ligero y con más repeticiones: aprieta 2 s arriba en cada una.', video: 'hip+thrust+en+maquina+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 35, unit: 'kg', increment: 5 },
          { key: 'a-prensa', pattern: 'prensa', photo: 'leg-press', name: 'Prensa 45°, pies a media altura', cue: 'No bloquees rodillas arriba. Bajada controlada de 2 s.', video: 'prensa+de+piernas+45+grados+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 70, unit: 'kg', increment: 5 },
          { key: 'a-bulgara', pattern: 'zancada', photo: 'split-squat-with-dumbbells', name: 'Sentadilla búlgara con mancuernas', cue: 'Solo la hiciste una vez en todo el bloque y ya tocaste el tope del rango: empiezas en 8 kg por mano. 8-10 por pierna.', video: 'sentadilla+bulgara+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 8, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-extension-cuadriceps', pattern: 'extension-cuadriceps', photo: 'leg-extensions', name: 'Extensión de cuádriceps', cue: 'Pausa de 1 s arriba. Anotaste tres series seguidas con RIR 5: eso es peso de calentamiento. Con 35 kg tienes que llegar justa a 15.', video: 'extension+de+cuadriceps+maquina+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 35, unit: 'kg', increment: 2.5 },
          { key: 'a-gemelo-pie', pattern: 'gemelo', photo: 'standing-calf-raises', name: 'Elevación de talones de pie', cue: 'Rango completo: estira 2 s abajo, aprieta 1 s arriba.', video: 'elevacion+de+talones+de+pie+gemelos+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 40, unit: 'kg', increment: 2.5 },
          { key: 'a-crunch-piernas', pattern: 'crunch', photo: 'flat-bench-lying-leg-raise', name: 'Elevación de piernas tumbada en el suelo', cue: 'Manos bajo los glúteos, lumbar pegada al suelo. Baja las piernas solo hasta donde puedas mantenerla pegada. En el bloque pasado no llegaste a hacerla ni una vez: ahora está en un día que sí terminas.', video: 'elevacion+de+piernas+tumbado+en+el+suelo+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
      {
        key: 'a-torso-b',
        name: 'Torso B',
        subtitle: 'Espalda horizontal, hombro y brazos · sesión corta',
        weekday: 'Viernes',
        warmup: '5 min de remo · movilidad torácica en rodillas · 20 face pull ligeros · 10 colgadas pasivas de la barra (5-10 s cada una). En el remo: 1 serie de aproximación al 60 % × 8.',
        exercises: [
          { key: 'a-remo-maquina', pattern: 'remo-horizontal', photo: 'seated-cable-rows', name: 'Remo sentado en máquina', cue: 'Pecho apoyado en el respaldo si la máquina lo tiene. Tira con los codos, pausa de 1 s con las escápulas juntas y suelta despacio.', video: 'remo+sentado+en+maquina+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 27.5, unit: 'kg', increment: 2.5 },
          { key: 'a-dominada-asistida', pattern: 'dominada', photo: 'band-assisted-pull-up', name: 'Dominada asistida en máquina', cue: 'A más kilos de asistencia, más fácil. Tres sesiones clavada en 35 kg de asistencia: el objetivo del bloque es bajar de 30.', video: 'dominadas+en+maquina+asistida+tecnica', sets: 3, repMin: 6, repMax: 10, rir: 2, restSec: 150, startLoad: 35, unit: 'kg', increment: -2.5, assist: true },
          { key: 'a-press-inclinado-mancuernas', pattern: 'press-inclinado', photo: 'incline-dumbbell-press', name: 'Press inclinado con mancuernas (30°)', cue: 'De 8 a 12 kg por mano en el bloque, +50 % de e1RM: es tu mejor ejercicio de empuje. Sigue desde 12.', video: 'press+inclinado+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 12, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-lateral-polea', pattern: 'elevacion-lateral', photo: 'cable-seated-lateral-raise', name: 'Elevación lateral unilateral en polea', cue: 'Un brazo cada vez, polea baja cruzada por detrás del cuerpo. Tensión constante también abajo, que es lo que no te da la mancuerna del martes.', video: 'elevacion+lateral+unilateral+en+polea+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 2.5, unit: 'kg', increment: 1 },
          { key: 'a-deltoide-polea', pattern: 'pajaros', photo: 'cable-rear-delt-fly', name: 'Deltoides posterior en polea unilateral', cue: 'Polea a la altura del hombro, agarras el asa con el brazo cruzado por delante y abres hacia fuera y atrás. Codo casi recto. Es el ejercicio que más subió de todo tu bloque (+56 %).', video: 'deltoides+posterior+en+polea+unilateral+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 5, unit: 'kg', increment: 1 },
          { key: 'a-curl-martillo', pattern: 'curl-biceps', photo: 'alternate-hammer-curl', name: 'Curl martillo con mancuernas', cue: 'Palmas enfrentadas. Trabaja el braquial: engrosa el brazo.', video: 'curl+martillo+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 8, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-triceps-barra', pattern: 'extension-triceps', photo: 'triceps-pushdown', name: 'Extensión de tríceps en polea alta, barra recta', cue: 'Codos pegados al costado y quietos. Agarre en barra en vez de cuerda para cambiar el estímulo respecto al martes. Con su descanso completo, ya no va encadenado al curl.', video: 'extension+de+triceps+en+polea+alta+con+barra+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 60, startLoad: 10, unit: 'kg', increment: 2.5 },
        ],
      },
    ],
  },

  // v1.6.0 — ajustada con los datos del bloque de agosto. El diagnóstico: la pierna subió
  // un 40 % y el tronco se quedó plano (banca clavada en 80 kg con las reps bajando,
  // militar en 40, inclinado en 28). Se resetean los press estancados para poder hacer
  // series rectas, sube el volumen de brazo y deltoides lateral —lo que se ve en camiseta—
  // y la pierna baja de intensidad sin perder series. Fuera todas las superseries.
  david: {
    name: 'David',
    remoteKey: 'david_2b8e46',
    subtitle: 'Recomposición · 4 días · prioridad tronco superior',
    // Bloque de 4 semanas sin descarga: la semana 1 es la suave (RIR alto).
    weekLabels: ['2-3', '2', '2', '1-2'],
    // El plan cambió hoy: el bloque nuevo empieza con el primer entreno que se registre
    // a partir de esta fecha, no en el calendario. Lo anterior se conserva entero.
    blockFrom: '2026-09-14',
    days: [
      {
        key: 'd-empuje',
        name: 'Torso A · Empuje',
        subtitle: 'Pecho, hombro y tríceps',
        weekday: 'Lunes',
        warmup: '5 min de remo o elíptica · movilidad de columna torácica sobre foam roller · 20 rotaciones externas de hombro con banda · 15 face pull ligeros. En el press banca: barra vacía × 12, luego 50 % × 8, 70 % × 5 y 85 % × 2.',
        exercises: [
          { key: 'd-press-banca', pattern: 'press-banca', photo: 'barbell-bench-press-medium-grip', name: 'Press banca con barra', cue: 'Cuatro sesiones clavado en 80 kg y las reps bajando de 6 a 5: eso no es una meseta, es demasiado peso. Bajas a 72,5 y haces las 4 series al mismo peso hasta llegar a 4 × 8. Volverás a los 80 con más volumen detrás.', video: 'press+banca+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 2, restSec: 180, startLoad: 72.5, unit: 'kg', increment: 2.5, reset: '2026-09-14' },
          { key: 'd-press-inclinado-mancuernas', pattern: 'press-inclinado', photo: 'incline-dumbbell-press', name: 'Press inclinado con mancuernas (30°)', cue: 'Pecho superior: la zona que más define el torso vestido. Cuatro sesiones en 28 kg sin moverse, así que empiezas en 26 y buscas cerrar las 4 series en el rango. Una serie más que el bloque pasado.', video: 'press+inclinado+con+mancuernas+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 26, unit: 'kg-por-mano', increment: 2, reset: '2026-09-14' },
          { key: 'd-press-militar', pattern: 'press-vertical', photo: 'standing-military-press', name: 'Press militar con barra, de pie', cue: 'Glúteo y abdomen apretados para no arquear lumbar. Con 40 kg te quedabas siempre en 8 reps y nunca llegabas al tope del rango: desde 37,5 sí llegas a 10 y la progresión se desbloquea.', video: 'press+militar+con+barra+de+pie+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 37.5, unit: 'kg', increment: 2.5, reset: '2026-09-14' },
          { key: 'd-fondos', pattern: 'fondos', photo: 'dips-chest-version', name: 'Fondos en paralelas', cue: 'Tronco algo inclinado hacia delante para cargar pecho. Van después de los press porque con el banco lleno son el empuje que siempre está libre. Si no llegas a 8, usa la máquina asistida.', video: 'fondos+en+paralelas+tecnica+pecho', sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 120, startLoad: 0, unit: 'peso-corporal', increment: null },
          { key: 'd-laterales-polea', pattern: 'elevacion-lateral', photo: 'cable-seated-lateral-raise', name: 'Elevaciones laterales en polea', cue: 'Sube a la horizontal, baja en 3 s. De 5 a 7,5 kg en el bloque, +50 %: es de lo poco del tronco que sí progresó. Un brazo cada vez o los dos en polea baja cruzada.', video: 'elevaciones+laterales+en+polea+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 7.5, unit: 'kg', increment: 2.5 },
          { key: 'd-triceps-cuerda', pattern: 'extension-triceps', photo: 'triceps-pushdown-rope-attachment', name: 'Extensión de tríceps en polea con cuerda', cue: 'Codos pegados al costado, abre la cuerda al final. Serie normal con su minuto de descanso: ya no va encadenada al press francés.', video: 'extension+de+triceps+en+polea+con+cuerda+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 22.5, unit: 'kg', increment: 2.5 },
          { key: 'd-press-frances', pattern: 'press-frances', photo: 'ez-bar-skullcrusher', name: 'Press francés con barra Z', cue: 'Trabaja la porción larga del tríceps, la que engorda el brazo por detrás. Cerraste en 25 × 12.', video: 'press+frances+con+barra+z+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'd-plancha', pattern: 'plancha', photo: 'plank', name: 'Plancha frontal', cue: 'Glúteo apretado y pelvis en retroversión. Mejor 30 s bien que 60 s con la cadera caída.', video: 'plancha+abdominal+tecnica+correcta', sets: 3, repMin: 30, repMax: 45, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
      {
        key: 'd-tiron',
        name: 'Torso B · Tirón',
        subtitle: 'Espalda, bíceps y trapecio',
        weekday: 'Martes',
        warmup: '5 min de bicicleta · 10 colgadas pasivas de la barra de 10 s · 20 dislocaciones con palo · 15 remos con banda. En el remo con barra: 2 series de aproximación al 50 % y al 75 %, 6 reps cada una.',
        exercises: [
          { key: 'd-dominadas', pattern: 'dominada', photo: 'weighted-pull-ups', name: 'Dominadas (agarre prono)', cue: 'Las reps cayeron de 7 a 5 durante el bloque: eran demasiadas series a RIR 1. Bajas a 3 series y las haces frescas. Excéntrica de 3 s. Al llegar a 3 × 8 limpias, añade 2,5 kg de lastre.', video: 'dominadas+tecnica+correcta+progresion', sets: 3, repMin: 5, repMax: 8, rir: 1, restSec: 150, startLoad: 0, unit: 'peso-corporal', increment: null },
          { key: 'd-remo-barra', pattern: 'remo-barra', photo: 'bent-over-barbell-row', name: 'Remo con barra a 45°', cue: 'Tronco firme, tira hacia el ombligo. Si la lumbar se redondea, baja peso: no negocies esto. Cerraste en 70 × 10.', video: 'remo+con+barra+tecnica+correcta', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 70, unit: 'kg', increment: 2.5 },
          { key: 'd-jalon', pattern: 'jalon', photo: 'v-bar-pulldown', name: 'Jalón al pecho, agarre neutro', cue: 'Pecho alto, codos hacia las costillas. Pausa de 1 s abajo.', video: 'jalon+al+pecho+agarre+neutro+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 75, unit: 'kg', increment: 2.5 },
          { key: 'd-remo-supino', pattern: 'remo-horizontal', photo: 'seated-cable-rows', name: 'Remo sentado en polea, agarre supino', cue: 'El agarre supino carga más el dorsal bajo. Pausa de 1 s, sin echar el tronco atrás. Llegaste a 50 × 12 tocando el tope: empiezas ahí.', video: 'remo+sentado+en+polea+agarre+supino+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 50, unit: 'kg', increment: 2.5 },
          { key: 'd-face-pull', pattern: 'face-pull', photo: 'face-pull', name: 'Face pull en polea alta', cue: 'Codos altos, rotación externa al final. El mejor antídoto contra el hombro adelantado. Cuatro sesiones en 25 × 15 sin moverse: toca cerrar las 20 reps y subir.', video: 'face+pull+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'd-encogimientos', pattern: 'encogimiento', photo: 'dumbbell-shrug', name: 'Encogimientos de hombro con mancuernas', cue: 'Sube recto, sin rotar. Pausa de 1 s arriba. De 40 a 50 kg por mano en cuatro sesiones: se gana una serie por lo bien que responde.', video: 'encogimientos+de+hombro+trapecio+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 54, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-curl-barra-z', pattern: 'curl-biceps', photo: 'ez-bar-curl', name: 'Curl de bíceps con barra Z', cue: 'Codos quietos junto al tronco, sin balanceo de cadera. Con 30 kg solo te salían 7 reps y acabaste bajando a 25: te quedas en 25 y ganas una serie. El bíceps era de lo más flojo del bloque.', video: 'curl+de+biceps+con+barra+z+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 1, restSec: 90, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'd-curl-martillo', pattern: 'curl-biceps', photo: 'alternate-hammer-curl', name: 'Curl martillo con mancuernas', cue: 'Palmas enfrentadas: trabaja el braquial, que es lo que ensancha el brazo de perfil. Cuatro series ahora, y con su descanso: ya no va encadenado al curl Z.', video: 'curl+martillo+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 16, unit: 'kg-por-mano', increment: 2 },
        ],
      },
      {
        key: 'd-pierna',
        name: 'Pierna + core',
        subtitle: 'Mantenimiento eficiente',
        weekday: 'Jueves',
        warmup: '5 min de bicicleta · movilidad de tobillo contra la pared (10 por lado) · 90/90 de cadera y estiramiento de psoas · 15 puentes de glúteo. En la sentadilla: barra vacía × 10, 50 % × 5, 70 % × 3, 85 % × 1.',
        exercises: [
          { key: 'd-sentadilla', pattern: 'sentadilla', photo: 'barbell-squat', name: 'Sentadilla trasera con barra', cue: 'De 90 a 120 kg en cinco semanas, pero llegando ahí escalonando dentro de la sesión y a RIR 1: eso es un máximo diario, no volumen. 4 series rectas a 105 y subir entre sesiones, no dentro de ellas. La pierna es mantenimiento; la recuperación la quieres para el tronco.', video: 'sentadilla+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 2, restSec: 180, startLoad: 105, unit: 'kg', increment: 2.5, reset: '2026-09-14' },
          { key: 'd-rdl', pattern: 'bisagra', photo: 'romanian-deadlift', name: 'Peso muerto rumano con barra', cue: 'Cadera atrás, barra rozando el muslo. Para cuando pierdas la curvatura lumbar. Cerraste en 80 × 8.', video: 'peso+muerto+rumano+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 90, unit: 'kg', increment: 5 },
          { key: 'd-prensa', pattern: 'prensa', photo: 'leg-press', name: 'Prensa 45°', cue: 'Pies a media altura, bajada controlada de 2 s. Acabaste en 240 × 10 con RIR 0-1, que es más de lo que necesita un día de mantenimiento: 220 a RIR 2 y las 3 series al mismo peso.', video: 'prensa+de+piernas+45+grados+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 220, unit: 'kg', increment: 10, reset: '2026-09-14' },
          { key: 'd-femoral-sentado', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbado', cue: 'Cadera pegada al banco, excéntrica lenta de 3 s. Compensa las horas de isquio acortado en la silla. Cerraste en 50 × 12.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 90, startLoad: 50, unit: 'kg', increment: 2.5 },
          { key: 'd-gemelo-pie', pattern: 'gemelo', photo: 'standing-calf-raises', name: 'Elevación de talones de pie', cue: 'Rango completo: estira 2 s abajo, aprieta 1 s arriba. Cuatro sesiones en 120 × 15 tocando el tope: ya toca subir.', video: 'elevacion+de+talones+de+pie+gemelos+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 122.5, unit: 'kg', increment: 2.5 },
          { key: 'd-granjero', pattern: 'caminata-granjero', photo: 'farmer-s-walk', name: 'Caminata del granjero con mancuernas', cue: 'Hombros atrás, abdomen apretado y pasos cortos. Es el remate del día, con 2 series basta. Sube cuando aguantes los 45 s sin despeinarte.', video: 'caminata+del+granjero+farmer+walk+tecnica', sets: 2, repMin: 30, repMax: 45, rir: 1, restSec: 90, startLoad: 18, unit: 'kg-por-mano', increment: 2, timed: true },
          { key: 'd-rueda-abdominal', pattern: 'rueda-abdominal', photo: 'ab-roller', name: 'Rueda abdominal o plancha frontal', cue: 'Pelvis en retroversión, sin dejar caer la cadera. Esto no quema la barriga: eso lo hace el déficit, y el déficit solo se sabe si te pesas.', video: 'rueda+abdominal+tecnica+correcta', sets: 3, repMin: 8, repMax: 12, rir: 1, restSec: 60, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
      {
        key: 'd-completo',
        name: 'Torso C · Completo',
        subtitle: 'Pecho superior, espalda y hombros',
        weekday: 'Viernes',
        warmup: '5 min de remo · movilidad torácica sobre foam roller · 20 rotaciones externas con banda · 15 face pull ligeros. En el press inclinado: barra vacía × 12, 55 % × 8 y 75 % × 4.',
        exercises: [
          { key: 'd-press-inclinado-barra', pattern: 'press-inclinado', photo: 'barbell-incline-bench-press-medium-grip', name: 'Press inclinado con barra (30°)', cue: 'El ejercicio con mejor relación esfuerzo/resultado visible en tu caso. Solo lo hiciste dos veces en todo el bloque porque el viernes se caía: este bloque no se salta.', video: 'press+inclinado+con+barra+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 65, unit: 'kg', increment: 2.5 },
          { key: 'd-remo-mancuerna', pattern: 'remo-mancuerna', photo: 'one-arm-dumbbell-row', name: 'Remo con mancuerna a una mano', cue: 'Rodilla y mano en el banco. Rango largo y estiramiento completo abajo. 10-12 por brazo. Solo necesitas una mancuerna y un banco: perfecto para septiembre.', video: 'remo+con+mancuerna+a+una+mano+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 32, unit: 'kg', increment: 2 },
          { key: 'd-press-hombro-mancuernas', pattern: 'press-vertical', photo: 'dumbbell-shoulder-press', name: 'Press de hombro sentado con mancuernas', cue: 'Respaldo a 85°. Anotaste RIR 0 dos veces aquí: eso es fallo, no RIR 2. Quédate en 22 y deja una o dos reps en el depósito.', video: 'press+de+hombro+sentado+con+mancuernas+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 22, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-aperturas-polea', pattern: 'apertura', photo: 'cable-crossover', name: 'Aperturas en polea (cruce de pecho)', cue: 'Poleas a la altura del hombro, junta las manos y aprieta 1 s. Con su descanso completo: ya no va encadenada a los laterales.', video: 'aperturas+en+polea+cruce+de+pecho+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 15, unit: 'kg', increment: 2.5 },
          { key: 'd-laterales-mancuernas', pattern: 'elevacion-lateral', photo: 'side-lateral-raise', name: 'Elevaciones laterales con mancuernas', cue: 'Con 12 kg te quedabas en 10 reps y RIR 0: por debajo del rango y pasado de peso. Bajas a 10 kg, haces 4 series de 12-15 limpias y ahí sí crece el hombro.', video: 'elevaciones+laterales+con+mancuernas+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 10, unit: 'kg-por-mano', increment: 1, reset: '2026-09-14' },
          { key: 'd-pajaros', pattern: 'pajaros', photo: 'seated-bent-over-rear-delt-raise', name: 'Pájaros con mancuernas (tronco inclinado)', cue: 'Sentado en el borde del banco, pecho hacia los muslos. Abre los brazos hacia atrás con los codos casi rectos. Peso ligero: aquí manda la sensación, no los kilos.', video: 'pajaros+con+mancuernas+deltoides+posterior+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 10, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-pullover', pattern: 'pullover', photo: 'straight-arm-pulldown', name: 'Pull-over en polea alta', cue: 'Brazos casi rectos: aísla el dorsal sin implicar bíceps. Es lo que ensancha la espalda de frente. Cerraste en 25 × 15 tocando el tope.', video: 'pull+over+en+polea+alta+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 27.5, unit: 'kg', increment: 2.5 },
          { key: 'd-dead-bug', pattern: 'dead-bug', photo: 'dead-bug', name: 'Dead bug ("bicho muerto")', cue: 'Boca arriba, bajas brazo y pierna contrarios sin que la lumbar se despegue del suelo. 10 por lado, lento.', video: 'dead+bug+ejercicio+tecnica', sets: 3, repMin: 10, repMax: 10, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
    ],
  },

  // Jan · 15 años, 52 kg, 177 cm, 13 % de grasa. Principiante (0-6 meses).
  // Split de 5 días con la estructura que pidió él, con una corrección: su versión
  // dejaba la espalda a la mitad de volumen que el pecho, y en un principiante eso
  // acaba en hombros adelantados. El día 5 pasa a ser un segundo día de tirón que
  // además lleva los gemelos, el antebrazo y el abdomen que sí quería.
  jan: {
    name: 'Jan',
    remoteKey: 'jan_5d1a83',
    subtitle: 'Cinco días · principiante · ganar masa muscular',
    // Principiante: se entrena más lejos del fallo que Anna y David.
    weekLabels: ['4', '3', '3', '2'],
    days: [
      {
        key: 'j-pecho-a',
        name: 'Pecho, hombro y tríceps',
        subtitle: 'Empuje · sesión A',
        weekday: 'Lunes',
        warmup: '5 min de bici o elíptica · movilidad de hombro con banda (20 rotaciones externas) · 15 face pull muy ligeros. En el press banca con mancuernas: una serie de 12 con un peso muy ligero antes de la primera serie real. Tienes 15 años y llevas poco entrenando: la técnica va primero que los kilos, siempre.',
        exercises: JAN_EMPUJE,
      },
      {
        key: 'j-espalda-a',
        name: 'Espalda y bíceps',
        subtitle: 'Tirón · sesión A',
        weekday: 'Martes',
        warmup: '5 min de remo · 10 colgadas pasivas de la barra de 10 s · 20 remos con banda. En el remo en máquina: 2 series de aproximación, una al 50 % y otra al 70 %.',
        exercises: [
          { key: 'j-dominada-asistida', pattern: 'dominada', photo: 'band-assisted-pull-up', name: 'Dominada asistida', cue: 'Con máquina o con goma. A más asistencia, más fácil. El objetivo del bloque es bajar la asistencia, no subir repeticiones sin más.', video: 'dominadas+en+maquina+asistida+tecnica', sets: 4, repMin: 6, repMax: 10, rir: 2, restSec: 150, startLoad: 25, unit: 'kg', increment: -2.5, assist: true },
          { key: 'j-remo-maquina', pattern: 'remo-horizontal', photo: 'seated-cable-rows', name: 'Remo sentado en máquina', cue: 'El pecho apoyado o la espalda firme hacen el trabajo que en el remo con barra hacía la lumbar: por eso aquí puedes ir más pesado sin riesgo. Tira hacia el ombligo y junta las escápulas.', video: 'remo+sentado+en+maquina+tecnica+correcta', sets: 4, repMin: 8, repMax: 10, rir: 3, restSec: 150, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'j-jalon-prono', pattern: 'jalon', photo: 'wide-grip-lat-pulldown', name: 'Jalón al pecho, agarre prono ancho', cue: 'El primero de los tres agarres. Ancho y con las palmas hacia delante: es el que ensancha la espalda vista de frente.', video: 'jalon+al+pecho+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 28, unit: 'kg', increment: 2.5 },
          { key: 'j-jalon-neutro', pattern: 'jalon', photo: 'v-bar-pulldown', name: 'Jalón al pecho, agarre neutro', cue: 'El segundo agarre, con el triángulo y las palmas enfrentadas. Pecho alto, codos hacia las costillas y pausa de 1 s abajo.', video: 'jalon+al+pecho+agarre+neutro+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'j-jalon-supino', pattern: 'jalon', name: 'Jalón al pecho, agarre supino', cue: 'El tercer agarre, estrecho y con las palmas hacia ti. Es el que más bíceps mete, así que notarás que puedes con más peso.', video: 'jalon+al+pecho+agarre+supino+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 28, unit: 'kg', increment: 2.5 },
          { key: 'j-face-pull', pattern: 'face-pull', photo: 'face-pull', name: 'Face pull en polea alta', cue: 'Codos altos y rotación externa al final. Es lo que mantiene el hombro sano cuando haces mucho pecho.', video: 'face+pull+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 2, restSec: 60, startLoad: 12, unit: 'kg', increment: 2.5 },
          { key: 'j-curl-inclinado', pattern: 'curl-biceps', photo: 'incline-dumbbell-curl', name: 'Curl de bíceps en banco inclinado', cue: 'Brazo por detrás del tronco: es la posición donde más se estira el bíceps.', video: 'curl+biceps+banco+inclinado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-curl-martillo', pattern: 'curl-biceps', photo: 'alternate-hammer-curl', name: 'Curl martillo con mancuernas', cue: 'Palmas enfrentadas: trabaja el braquial y engrosa el brazo. Codos quietos junto al tronco.', video: 'curl+martillo+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-curl-sentado', pattern: 'curl-biceps', name: 'Curl de bíceps sentado con mancuernas', cue: 'Sentado en un banco recto no puedes ayudarte con la cadera, así que el bíceps trabaja solo. Por eso va el último y con poco peso.', video: 'curl+de+biceps+sentado+con+mancuernas+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
        ],
      },
      {
        key: 'j-pierna',
        name: 'Pierna',
        subtitle: 'Tren inferior completo',
        weekday: 'Miércoles',
        warmup: '5 min de bici · movilidad de tobillo contra la pared (10 por lado) · 90/90 de cadera · 15 puentes de glúteo. En la sentadilla: barra vacía × 10, 50 % × 5 y 70 % × 3.',
        exercises: [
          { key: 'j-sentadilla', pattern: 'sentadilla', photo: 'barbell-squat', name: 'Sentadilla trasera con barra', cue: 'Semanas 1 y 2 con barra vacía hasta que el patrón salga solo. Profundidad hasta paralelo, rodillas siguiendo la punta del pie.', video: 'sentadilla+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 3, restSec: 180, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'j-rdl', pattern: 'bisagra', photo: 'romanian-deadlift', name: 'Peso muerto rumano con barra', cue: 'Cadera atrás, barra rozando el muslo. Para cuando pierdas la curvatura lumbar, no cuando se acaben las reps.', video: 'peso+muerto+rumano+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 3, restSec: 150, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'j-prensa', pattern: 'prensa', photo: 'leg-press', name: 'Prensa 45°', cue: 'Pies a media altura. No bloquees las rodillas arriba; bajada controlada de 2 s.', video: 'prensa+de+piernas+45+grados+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 60, unit: 'kg', increment: 5 },
          { key: 'j-femoral-tumbado', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbado', cue: 'Cadera pegada al banco, excéntrica lenta de 3 s.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 90, startLoad: 20, unit: 'kg', increment: 2.5 },
          { key: 'j-extension-cuadriceps', pattern: 'extension-cuadriceps', photo: 'leg-extensions', name: 'Extensión de cuádriceps', cue: 'Pausa de 1 s arriba. Sin dar tirones al empezar.', video: 'extension+de+cuadriceps+maquina+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 90, startLoad: 20, unit: 'kg', increment: 2.5 },
          { key: 'j-gemelo-pie', pattern: 'gemelo', photo: 'standing-calf-raises', name: 'Elevación de talones de pie', cue: 'Rango completo: estira 2 s abajo y aprieta 1 s arriba. Los gemelos crecen con recorrido, no con peso.', video: 'elevacion+de+talones+de+pie+gemelos+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 2, restSec: 60, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'j-gemelo-mancuerna', pattern: 'gemelo', name: 'Elevación de talones a una pierna con mancuerna', cue: 'Sin máquina: una mancuerna en la mano del lado que trabaja, la punta del pie en un escalón o un disco y la otra pierna recogida. Baja el talón todo lo que puedas y sube hasta arriba del todo. Agárrate a algo para no perder el equilibrio.', video: 'elevacion+de+talones+a+una+pierna+con+mancuerna+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 60, startLoad: 8, unit: 'kg', increment: 2 },
          { key: 'j-rueda-abdominal', pattern: 'rueda-abdominal', photo: 'ab-roller', name: 'Rueda abdominal o plancha frontal', cue: 'Si la rueda te tira de la lumbar, hazlo de rodillas con recorrido corto o cambia a plancha.', video: 'rueda+abdominal+tecnica+correcta', sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 60, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
      {
        key: 'j-pecho-b',
        name: 'Pecho, hombro y tríceps',
        subtitle: 'Empuje · sesión B',
        weekday: 'Jueves',
        warmup: '5 min de remo · movilidad torácica · 20 rotaciones externas con banda · 15 face pull ligeros. Es la misma sesión del lunes: los pesos que anotaste entonces son el punto de partida de hoy.',
        // Misma sesión que el lunes, por eso es el mismo array (ver JAN_EMPUJE arriba).
        exercises: JAN_EMPUJE,
      },
      {
        key: 'j-espalda-b',
        name: 'Brazo, antebrazo y abdomen',
        subtitle: 'Accesorios · con gemelo y core',
        weekday: 'Viernes',
        warmup: '5 min de bici · movilidad de codo y de muñeca (10 círculos en cada sentido) · 15 curls de muñeca sin peso. La espalda ya la has entrenado el martes: hoy toca lo que se queda corto en las sesiones grandes.',
        exercises: [
          { key: 'j-femoral-tumbado', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbado', cue: 'Cadera pegada al banco, excéntrica lenta de 3 s.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 90, startLoad: 20, unit: 'kg', increment: 2.5 },
          { key: 'j-curl-inclinado', pattern: 'curl-biceps', photo: 'incline-dumbbell-curl', name: 'Curl de bíceps en banco inclinado', cue: 'Brazo por detrás del tronco: es la posición donde más se estira el bíceps.', video: 'curl+biceps+banco+inclinado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-curl-muneca', pattern: 'curl-muneca', name: 'Curl de muñeca con barra', cue: 'Sentado, antebrazos apoyados en los muslos y las manos por fuera de la rodilla, palmas hacia arriba. Deja bajar la barra hasta los dedos y ciérrala subiendo. Poco peso y muchas repeticiones: el antebrazo aguanta mucho.', video: 'curl+de+muneca+con+barra+antebrazo+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 2, restSec: 60, startLoad: 10, unit: 'kg', increment: 2.5 },
          { key: 'j-gemelo-sentado', pattern: 'gemelo', photo: 'seated-calf-raise', name: 'Elevación de talones sentado', cue: 'Sentado trabajas el sóleo, que es el músculo de debajo del gemelo. Reps altas y tempo lento.', video: 'elevacion+de+talones+sentado+soleo+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 2, restSec: 60, startLoad: 15, unit: 'kg', increment: 2.5 },
          { key: 'j-granjero', pattern: 'caminata-granjero', photo: 'farmer-s-walk', name: 'Caminata del granjero con mancuernas', cue: 'Tu trabajo de antebrazo. Hombros atrás, abdomen apretado y pasos cortos. El agarre es lo que limita el remo y las dominadas, así que esto te hace más fuerte en todo lo demás.', video: 'caminata+del+granjero+farmer+walk+tecnica', sets: 3, repMin: 30, repMax: 45, rir: 2, restSec: 90, startLoad: 14, unit: 'kg-por-mano', increment: 2, timed: true },
          { key: 'j-elevacion-piernas', pattern: 'crunch', photo: 'flat-bench-lying-leg-raise', name: 'Elevación de piernas tumbado', cue: 'Manos bajo los glúteos, lumbar pegada al suelo. Baja las piernas solo hasta donde puedas mantenerla pegada.', video: 'elevacion+de+piernas+tumbado+en+el+suelo+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null },
          { key: 'j-plancha-lateral', pattern: 'plancha-lateral', photo: 'side-bridge', name: 'Plancha lateral', cue: 'Apoyo en el antebrazo, cadera bien alta y alineada. 20-30 s por lado.', video: 'plancha+lateral+tecnica+correcta', sets: 3, repMin: 20, repMax: 30, rir: 2, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
    ],
  },
};

const WEEKDAYS = { Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3, Jueves: 4, Viernes: 5, Sábado: 6 };

// ---------------------------------------------------------------------------
// Catálogo derivado. Las rutinas generadas para usuarios nuevos no copian los
// ejercicios: los REFERENCIAN por clave. Así fotos, dibujos SVG y las
// traducciones (indexadas por esta misma clave) funcionan sin tocar nada.
// ---------------------------------------------------------------------------
export const EXERCISES = Object.fromEntries(
  Object.values(USERS).flatMap((u) => u.days.flatMap((d) => d.exercises)).map((e) => [e.key, e])
);
export const DAYS = Object.fromEntries(
  Object.values(USERS).flatMap((u) => u.days).map((d) => [d.key, d])
);

// Los helpers aceptan la clave de un usuario builtin ('anna') o directamente el
// objeto de rutina ya resuelto (usuarios creados desde la app).
const daysOf = (u) => (typeof u === 'string' ? USERS[u] : u)?.days || [];

export function findDay(user, dayKey) {
  return daysOf(user).find((d) => d.key === dayKey) || null;
}

export const weekdayIndex = (day) => WEEKDAYS[day.weekday] ?? -1;

/** La sesión que toca hoy según el calendario del plan, o null si hoy es descanso. */
export function todaysDay(user, date = new Date()) {
  return daysOf(user).find((d) => weekdayIndex(d) === date.getDay()) || null;
}

/** La siguiente sesión a partir de hoy, con cuántos días faltan. */
export function nextDay(user, date = new Date()) {
  const days = daysOf(user);
  for (let i = 1; i <= 7; i++) {
    const wd = (date.getDay() + i) % 7;
    const d = days.find((x) => weekdayIndex(x) === wd);
    if (d) return { day: d, enDias: i };
  }
  return null;
}

export function allExercises(user) {
  return daysOf(user).flatMap((d) =>
    d.exercises.map((e) => ({ ...e, dayKey: d.key, dayName: d.name }))
  );
}

export function videoUrl(exercise) {
  return `https://www.youtube.com/results?search_query=${exercise.video}&sp=EgIYAQ%3D%3D`;
}
