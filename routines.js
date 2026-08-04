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

export const USERS = {
  anna: {
    name: 'Anna',
    // user_key no adivinable para Supabase (el repo es público)
    remoteKey: 'anna_7f3c91',
    subtitle: 'Torso–pierna · 4 días · ganar masa muscular',
    // Etiquetas de RIR por semana según la sección 06 de Anna.pdf
    weekLabels: ['3', '2-3', '2', '1-2', '4'],
    days: [
      {
        key: 'a-torso-a',
        name: 'Torso A',
        subtitle: 'Espalda vertical, hombro y brazos',
        weekday: 'Lunes',
        warmup: '5 min de remo o elíptica suave · movilidad de columna torácica (gato-camello, rotaciones) · 20 rotaciones externas de hombro con banda · dislocaciones con palo. En el jalón: 2 series de aproximación con el 50 % y el 75 % del peso de trabajo, 5 reps cada una.',
        exercises: [
          { key: 'a-jalon-prono', pattern: 'jalon', photo: 'wide-grip-lat-pulldown', name: 'Jalón al pecho, agarre prono ancho', cue: 'Pecho alto, tira con los codos hacia las costillas. Sin balanceo.', video: 'jalon+al+pecho+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 28, unit: 'kg', increment: 2.5 },
          { key: 'a-press-banca-mancuernas', pattern: 'press-banca', photo: 'dumbbell-bench-press', name: 'Press banca plano con mancuernas', cue: 'Mantenimiento de pectoral. Recorrido completo, sin buscar récords.', video: 'press+banca+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 9, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-remo-mancuerna', pattern: 'remo-mancuerna', photo: 'one-arm-dumbbell-row', name: 'Remo con mancuerna a una mano', cue: 'Una mano y una rodilla en el banco. 10-12 por brazo. Hazlo con mancuerna aunque tengas la máquina al lado: el remo sentado ya lo tienes el jueves, y a una mano trabajas cada lado por separado y el core aguantando la rotación.', video: 'remo+con+mancuerna+a+una+mano+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 12, unit: 'kg', increment: 2 },
          { key: 'a-press-militar-mancuernas', pattern: 'press-vertical', photo: 'dumbbell-shoulder-press', name: 'Press militar sentada con mancuernas', cue: 'Respaldo a 80-85°, costillas abajo para no arquear lumbar.', video: 'press+militar+con+mancuernas+sentado+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 7, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-laterales', pattern: 'elevacion-lateral', photo: 'side-lateral-raise', name: 'Elevaciones laterales con mancuernas', cue: 'Sube hasta la horizontal, baja en 2-3 s. Cero impulso de cadera. Con mancuerna lo más duro es arriba; en la polea del jueves es abajo. Por eso están los dos: el hombro necesita dos estímulos por semana y así no se repite la sensación.', video: 'elevaciones+laterales+con+mancuernas+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 3, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-face-pull', pattern: 'face-pull', photo: 'face-pull', name: 'Face pull en polea alta', cue: 'Superserie con el anterior. Codos altos y rotación externa al final: esto es hombro posterior más rotadores, no la apertura pura del jueves. Es lo que compensa las horas de hombro adelantado.', video: 'face+pull+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 12, unit: 'kg', increment: 2.5 },
          { key: 'a-curl-inclinado', pattern: 'curl-biceps', photo: 'incline-dumbbell-curl', name: 'Curl bíceps en banco inclinado', cue: 'Brazo por detrás del tronco, estiramiento completo abajo.', video: 'curl+biceps+banco+inclinado+tecnica', sets: 2, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 5, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-press-frances', pattern: 'press-frances', photo: 'lying-triceps-press', name: 'Press francés con mancuernas', cue: 'Superserie con el curl. Tumbada en el banco, bajas las mancuernas hacia la frente con los codos quietos. Es un patrón distinto al de la polea del jueves: aquí el tríceps trabaja estirado, que es donde más crece.', video: 'press+frances+con+mancuernas+tecnica', sets: 2, repMin: 10, repMax: 12, rir: 1, restSec: 60, startLoad: 5, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-plancha', pattern: 'plancha', photo: 'plank', name: 'Plancha frontal', cue: 'Glúteo apretado, pelvis en retroversión. Calidad sobre duración.', video: 'plancha+abdominal+tecnica+correcta', sets: 3, repMin: 30, repMax: 45, rir: 1, restSec: 60, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
      {
        key: 'a-pierna-a',
        name: 'Pierna A',
        subtitle: 'Dominante de rodilla',
        weekday: 'Martes',
        warmup: '5 min de bicicleta · movilidad de tobillo contra la pared (10 por lado) · 90/90 de cadera · 15 puentes de glúteo y 15 pasos laterales con banda. En la sentadilla: barra vacía × 10, luego 50 % × 5, 70 % × 3 y 85 % × 1.',
        exercises: [
          { key: 'a-sentadilla', pattern: 'sentadilla', photo: 'barbell-squat', name: 'Sentadilla trasera con barra', cue: 'Semana 1: barra vacía (20 kg) hasta que el patrón salga solo. Profundidad hasta paralelo o algo más.', video: 'sentadilla+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 2, restSec: 180, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'a-rdl', pattern: 'bisagra', photo: 'romanian-deadlift', name: 'Peso muerto rumano con barra', cue: 'Cadera atrás, barra rozando el muslo. Para cuando pierdas la curvatura lumbar.', video: 'peso+muerto+rumano+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'a-prensa', pattern: 'prensa', photo: 'leg-press', name: 'Prensa 45°, pies a media altura', cue: 'No bloquees rodillas arriba. Bajada controlada de 2 s.', video: 'prensa+de+piernas+45+grados+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 55, unit: 'kg', increment: 5 },
          { key: 'a-femoral-tumbada', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbada', cue: 'Cadera pegada al banco; excéntrica lenta de 3 s.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 90, startLoad: 23, unit: 'kg', increment: 2.5 },
          { key: 'a-extension-cuadriceps', pattern: 'extension-cuadriceps', photo: 'leg-extensions', name: 'Extensión de cuádriceps', cue: 'Pausa de 1 s arriba. Última serie con 2-3 reps parciales.', video: 'extension+de+cuadriceps+maquina+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'a-gemelo-pie', pattern: 'gemelo', photo: 'standing-calf-raises', name: 'Elevación de talones de pie', cue: 'Rango completo: estira 2 s abajo, aprieta 1 s arriba.', video: 'elevacion+de+talones+de+pie+gemelos+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 35, unit: 'kg', increment: 2.5 },
          { key: 'a-plancha-lateral', pattern: 'plancha-lateral', photo: 'side-bridge', name: 'Plancha lateral', cue: 'Apoyo en antebrazo, cadera bien alta y alineada. Alternando lados.', video: 'plancha+lateral+tecnica+correcta', sets: 3, repMin: 20, repMax: 30, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
      {
        key: 'a-torso-b',
        name: 'Torso B',
        subtitle: 'Espalda horizontal, hombro y brazos',
        weekday: 'Jueves',
        warmup: '5 min de remo · movilidad torácica en rodillas · 20 face pull ligeros · 10 colgadas pasivas de la barra (5-10 s cada una). En el remo con mancuerna: 1 serie de aproximación al 60 % × 8 por brazo.',
        exercises: [
          { key: 'a-remo-maquina', pattern: 'remo-horizontal', photo: 'seated-cable-rows', name: 'Remo sentado en máquina', cue: 'Pecho apoyado en el respaldo si la máquina lo tiene. Tira con los codos, pausa de 1 s con las escápulas juntas y suelta despacio.', video: 'remo+sentado+en+maquina+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'a-dominada-asistida', pattern: 'dominada', photo: 'band-assisted-pull-up', name: 'Dominada asistida en máquina', cue: 'A más kilos de asistencia, más fácil. Objetivo del bloque: bajar la asistencia.', video: 'dominadas+en+maquina+asistida+tecnica', sets: 3, repMin: 6, repMax: 10, rir: 2, restSec: 150, startLoad: 31, unit: 'kg', increment: -2.5, assist: true },
          { key: 'a-press-inclinado-mancuernas', pattern: 'press-inclinado', photo: 'incline-dumbbell-press', name: 'Press inclinado con mancuernas (30°)', cue: 'Mantenimiento de pectoral. 2 series efectivas bastan si vas justa de tiempo.', video: 'press+inclinado+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 8, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-pullover', pattern: 'pullover', photo: 'straight-arm-pulldown', name: 'Pull-over en polea alta', cue: 'Brazos casi rectos, aísla el dorsal sin implicar bíceps.', video: 'pull+over+en+polea+alta+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 18, unit: 'kg', increment: 2.5 },
          { key: 'a-lateral-polea', pattern: 'elevacion-lateral', photo: 'cable-seated-lateral-raise', name: 'Elevación lateral unilateral en polea', cue: 'Un brazo cada vez, polea baja cruzada por detrás del cuerpo. Tensión constante también en la parte baja del recorrido, que es lo que no te da la mancuerna.', video: 'elevacion+lateral+unilateral+en+polea+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 3, unit: 'kg', increment: 1 },
          { key: 'a-deltoide-polea', pattern: 'pajaros', photo: 'cable-rear-delt-fly', name: 'Deltoides posterior en polea unilateral', cue: 'Polea a la altura del hombro, agarras el asa con el brazo cruzado por delante del cuerpo y abres hacia fuera y atrás. Codo casi recto. Sustituye al pec-deck invertido, que en tu gimnasio no hay.', video: 'deltoides+posterior+en+polea+unilateral+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 4, unit: 'kg', increment: 1 },
          { key: 'a-curl-martillo', pattern: 'curl-biceps', photo: 'alternate-hammer-curl', name: 'Curl martillo con mancuernas', cue: 'Palmas enfrentadas. Trabaja el braquial: engrosa el brazo.', video: 'curl+martillo+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-triceps-barra', pattern: 'extension-triceps', photo: 'triceps-pushdown', name: 'Extensión de tríceps en polea alta, barra recta', cue: 'Superserie con el curl. Polea de arriba, codos pegados al costado y quietos. Agarre en barra en vez de cuerda para cambiar el estímulo respecto al lunes.', video: 'extension+de+triceps+en+polea+alta+con+barra+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 60, startLoad: 14, unit: 'kg', increment: 2.5 },
          { key: 'a-crunch-piernas', pattern: 'crunch', photo: 'flat-bench-lying-leg-raise', name: 'Elevación de piernas tumbada en el suelo', cue: 'Manos bajo los glúteos, lumbar pegada al suelo. Baja las piernas solo hasta donde puedas mantenerla pegada.', video: 'elevacion+de+piernas+tumbado+en+el+suelo+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
      {
        key: 'a-pierna-b',
        name: 'Pierna B',
        subtitle: 'Dominante de cadera y glúteo',
        weekday: 'Viernes',
        warmup: '5 min de bicicleta · 90/90 de cadera y estiramiento del psoas · 20 puentes de glúteo con banda · 15 abducciones de pie con banda. En el hip thrust: barra vacía × 12 y otra al 60 % × 8.',
        exercises: [
          { key: 'a-hip-thrust', pattern: 'hip-thrust', photo: 'barbell-hip-thrust', name: 'Hip thrust en máquina (carga con discos)', cue: 'Espalda apoyada en el respaldo, almohadilla sobre la cadera. Barbilla al pecho y pausa de 1 s arriba sin hiperextender lumbar. Los kilos son los discos que pones: cada disco de 2,5 por lado son +5 kg.', video: 'hip+thrust+en+maquina+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 40, unit: 'kg', increment: 5 },
          { key: 'a-bulgara', pattern: 'zancada', photo: 'split-squat-with-dumbbells', name: 'Sentadilla búlgara con mancuernas', cue: 'Empieza sin peso hasta dominar el equilibrio. 8-10 por pierna.', video: 'sentadilla+bulgara+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
          { key: 'a-femoral-sentada', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbada', cue: 'Mismo ejercicio que el martes pero con más repeticiones. Cadera pegada al banco y excéntrica lenta de 3 s.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 22, unit: 'kg', increment: 2.5 },
          { key: 'a-prensa-alta', pattern: 'prensa', photo: 'leg-press', name: 'Prensa con pies altos y anchos', cue: 'Enfatiza glúteo e isquio. Rango profundo sin despegar la lumbar.', video: 'prensa+de+piernas+pies+altos+gluteo+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 50, unit: 'kg', increment: 5 },
          { key: 'a-abduccion', pattern: 'abduccion', photo: 'thigh-abductor', name: 'Abducción de cadera en máquina', cue: 'Tronco ligeramente adelantado. Pausa de 1 s en apertura máxima.', video: 'abductores+en+maquina+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'a-gemelo-sentada', pattern: 'gemelo', photo: 'seated-calf-raise', name: 'Elevación de talones sentada', cue: 'Trabaja el sóleo. Reps altas, tempo lento.', video: 'elevacion+de+talones+sentado+soleo+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 20, unit: 'kg', increment: 2.5 },
          { key: 'a-granjero', pattern: 'caminata-granjero', photo: 'farmer-s-walk', name: 'Caminata del granjero con mancuernas', cue: 'Hombros atrás, abdomen apretado y pasos cortos. No dejes que el peso te incline hacia un lado: eso es justo lo que estás entrenando. Empezasteis con 10 kg por mano; sube cuando aguantes los 45 s enteros sin perder la postura.', video: 'caminata+del+granjero+farmer+walk+tecnica', sets: 3, repMin: 30, repMax: 45, rir: 1, restSec: 90, startLoad: 10, unit: 'kg-por-mano', increment: 2, timed: true },
          { key: 'a-dead-bug', pattern: 'dead-bug', photo: 'dead-bug', name: 'Dead bug ("bicho muerto")', cue: 'Bajas brazo y pierna contrarios sin que la lumbar se despegue del suelo. 10 por lado.', video: 'dead+bug+ejercicio+tecnica', sets: 3, repMin: 10, repMax: 10, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
    ],
  },

  david: {
    name: 'David',
    remoteKey: 'david_2b8e46',
    subtitle: 'Recomposición · 4 días · prioridad tronco superior',
    // Etiquetas de RIR por semana según la sección 06 de David.pdf
    weekLabels: ['2-3', '2', '2', '1-2', '4'],
    days: [
      {
        key: 'd-empuje',
        name: 'Torso A · Empuje',
        subtitle: 'Pecho, hombro y tríceps',
        weekday: 'Lunes',
        warmup: '5 min de remo o elíptica · movilidad de columna torácica sobre foam roller · 20 rotaciones externas de hombro con banda · 15 face pull ligeros. En el press banca: barra vacía × 12, luego 50 % × 8, 70 % × 5 y 85 % × 2.',
        exercises: [
          { key: 'd-press-banca', pattern: 'press-banca', photo: 'barbell-bench-press-medium-grip', name: 'Press banca con barra', cue: 'Escápulas retraídas, codos a 45-60°. Baja en 2 s y toca el pecho sin rebotar.', video: 'press+banca+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 2, restSec: 180, startLoad: 77.5, unit: 'kg', increment: 2.5 },
          { key: 'd-press-militar', pattern: 'press-vertical', photo: 'standing-military-press', name: 'Press militar con barra, de pie', cue: 'Glúteo y abdomen apretados para no arquear lumbar. Cabeza atrás al pasar la barra.', video: 'press+militar+con+barra+de+pie+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 45, unit: 'kg', increment: 2.5 },
          { key: 'd-press-inclinado-mancuernas', pattern: 'press-inclinado', photo: 'incline-dumbbell-press', name: 'Press inclinado con mancuernas (30°)', cue: 'Pecho superior: la zona que más define el aspecto del torso vestido.', video: 'press+inclinado+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 120, startLoad: 30, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-fondos', pattern: 'fondos', photo: 'dips-chest-version', name: 'Fondos en paralelas', cue: 'Tronco algo inclinado hacia delante para cargar pecho. Si no llegas a 8, usa la máquina asistida.', video: 'fondos+en+paralelas+tecnica+pecho', sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 120, startLoad: 0, unit: 'peso-corporal', increment: null },
          { key: 'd-laterales-polea', pattern: 'elevacion-lateral', photo: 'cable-seated-lateral-raise', name: 'Elevaciones laterales en polea', cue: 'Sube a la horizontal, baja en 3 s. Un brazo cada vez o los dos en polea baja cruzada.', video: 'elevaciones+laterales+en+polea+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 10, unit: 'kg', increment: 2.5 },
          { key: 'd-triceps-cuerda', pattern: 'extension-triceps', photo: 'triceps-pushdown-rope-attachment', name: 'Extensión de tríceps en polea con cuerda', cue: 'Superserie con el siguiente. Codos pegados al costado, abre la cuerda al final.', video: 'extension+de+triceps+en+polea+con+cuerda+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 32.5, unit: 'kg', increment: 2.5 },
          { key: 'd-press-frances', pattern: 'press-frances', photo: 'ez-bar-skullcrusher', name: 'Press francés con barra Z', cue: 'Superserie con el anterior. Trabaja la porción larga del tríceps.', video: 'press+frances+con+barra+z+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 75, startLoad: 27.5, unit: 'kg', increment: 2.5 },
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
          { key: 'd-dominadas', pattern: 'dominada', photo: 'weighted-pull-ups', name: 'Dominadas (agarre prono)', cue: 'Sin asistencia: ya haces 4 × 5. Excéntrica de 3 s. Al llegar a 4 × 8 limpias, añade 2,5 kg de lastre.', video: 'dominadas+tecnica+correcta+progresion', sets: 4, repMin: 5, repMax: 8, rir: 1, restSec: 150, startLoad: 0, unit: 'peso-corporal', increment: null },
          { key: 'd-remo-barra', pattern: 'remo-barra', photo: 'bent-over-barbell-row', name: 'Remo con barra a 45°', cue: 'Tronco firme, tira hacia el ombligo. Si la lumbar se redondea, baja peso: no negocies esto.', video: 'remo+con+barra+tecnica+correcta', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 65, unit: 'kg', increment: 2.5 },
          { key: 'd-jalon', pattern: 'jalon', photo: 'v-bar-pulldown', name: 'Jalón al pecho, agarre neutro', cue: 'Pecho alto, codos hacia las costillas. Pausa de 1 s abajo.', video: 'jalon+al+pecho+agarre+neutro+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 72.5, unit: 'kg', increment: 2.5 },
          { key: 'd-remo-supino', pattern: 'remo-horizontal', photo: 'seated-cable-rows', name: 'Remo sentado en polea, agarre supino', cue: 'El agarre supino carga más el dorsal bajo. Pausa de 1 s, sin echar el tronco atrás.', video: 'remo+sentado+en+polea+agarre+supino+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 65, unit: 'kg', increment: 2.5 },
          { key: 'd-face-pull', pattern: 'face-pull', photo: 'face-pull', name: 'Face pull en polea alta', cue: 'Codos altos, rotación externa al final. El mejor antídoto contra el hombro adelantado.', video: 'face+pull+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 32.5, unit: 'kg', increment: 2.5 },
          { key: 'd-encogimientos', pattern: 'encogimiento', photo: 'dumbbell-shrug', name: 'Encogimientos de hombro con mancuernas', cue: 'Sube recto, sin rotar. Pausa de 1 s arriba.', video: 'encogimientos+de+hombro+trapecio+tecnica', sets: 2, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 40, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-curl-barra-z', pattern: 'curl-biceps', photo: 'ez-bar-curl', name: 'Curl de bíceps con barra Z', cue: 'Superserie con el siguiente. Codos quietos junto al tronco, sin balanceo de cadera.', video: 'curl+de+biceps+con+barra+z+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 1, restSec: 90, startLoad: 32.5, unit: 'kg', increment: 2.5 },
          { key: 'd-curl-martillo', pattern: 'curl-biceps', photo: 'alternate-hammer-curl', name: 'Curl martillo con mancuernas', cue: 'Superserie con el anterior. Palmas enfrentadas: trabaja el braquial.', video: 'curl+martillo+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 16, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-plancha-lateral', pattern: 'plancha-lateral', photo: 'side-bridge', name: 'Plancha lateral', cue: 'Apoyo en el antebrazo, cadera bien alta y alineada. 20-30 s por lado, alternando.', video: 'plancha+lateral+tecnica+correcta', sets: 3, repMin: 20, repMax: 30, rir: 1, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
      {
        key: 'd-pierna',
        name: 'Pierna + core',
        subtitle: 'Mantenimiento eficiente',
        weekday: 'Jueves',
        warmup: '5 min de bicicleta · movilidad de tobillo contra la pared (10 por lado) · 90/90 de cadera y estiramiento de psoas · 15 puentes de glúteo. En la sentadilla: barra vacía × 10, 50 % × 5, 70 % × 3, 85 % × 1.',
        exercises: [
          { key: 'd-sentadilla', pattern: 'sentadilla', photo: 'barbell-squat', name: 'Sentadilla trasera con barra', cue: 'Sin datos previos de pierna: la semana 1 es de calibración pura. Sube sin miedo si el RIR real sale en 4.', video: 'sentadilla+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 2, restSec: 180, startLoad: 75, unit: 'kg', increment: 2.5 },
          { key: 'd-rdl', pattern: 'bisagra', photo: 'romanian-deadlift', name: 'Peso muerto rumano con barra', cue: 'Cadera atrás, barra rozando el muslo. Para cuando pierdas la curvatura lumbar.', video: 'peso+muerto+rumano+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 75, unit: 'kg', increment: 2.5 },
          { key: 'd-prensa', pattern: 'prensa', photo: 'leg-press', name: 'Prensa 45°', cue: 'Pies a media altura. No bloquees rodillas arriba; bajada controlada de 2 s.', video: 'prensa+de+piernas+45+grados+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 130, unit: 'kg', increment: 5 },
          { key: 'd-femoral-sentado', pattern: 'curl-femoral', photo: 'lying-leg-curls', name: 'Curl femoral tumbado', cue: 'Cadera pegada al banco, excéntrica lenta de 3 s. Compensa las horas de isquio acortado en la silla.', video: 'curl+femoral+tumbado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 1, restSec: 90, startLoad: 45, unit: 'kg', increment: 2.5 },
          { key: 'd-gemelo-pie', pattern: 'gemelo', photo: 'standing-calf-raises', name: 'Elevación de talones de pie', cue: 'Rango completo: estira 2 s abajo, aprieta 1 s arriba.', video: 'elevacion+de+talones+de+pie+gemelos+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 1, restSec: 60, startLoad: 65, unit: 'kg', increment: 2.5 },
          { key: 'd-granjero', pattern: 'caminata-granjero', photo: 'farmer-s-walk', name: 'Caminata del granjero con mancuernas', cue: 'Hombros atrás, abdomen apretado y pasos cortos. No dejes que el peso te incline hacia un lado. Probasteis con 10 kg por mano: para tu peso corporal te vas a quedar corto enseguida, sube en cuanto aguantes los 45 s sin despeinarte.', video: 'caminata+del+granjero+farmer+walk+tecnica', sets: 3, repMin: 30, repMax: 45, rir: 1, restSec: 90, startLoad: 16, unit: 'kg-por-mano', increment: 2, timed: true },
          { key: 'd-rueda-abdominal', pattern: 'rueda-abdominal', photo: 'ab-roller', name: 'Rueda abdominal o plancha frontal', cue: 'Pelvis en retroversión, sin dejar caer la cadera. Esto no quema la barriga: eso lo hace el déficit.', video: 'rueda+abdominal+tecnica+correcta', sets: 3, repMin: 8, repMax: 12, rir: 1, restSec: 60, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
      {
        key: 'd-completo',
        name: 'Torso C · Completo',
        subtitle: 'Pecho superior, espalda y hombros',
        weekday: 'Viernes',
        warmup: '5 min de remo · movilidad torácica sobre foam roller · 20 rotaciones externas con banda · 15 face pull ligeros. En el press inclinado: barra vacía × 12, 55 % × 8 y 75 % × 4.',
        exercises: [
          { key: 'd-press-inclinado-barra', pattern: 'press-inclinado', photo: 'barbell-incline-bench-press-medium-grip', name: 'Press inclinado con barra (30°)', cue: 'El ejercicio con mejor relación esfuerzo/resultado visible en tu caso. Aquí es el principal.', video: 'press+inclinado+con+barra+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 2, restSec: 150, startLoad: 62.5, unit: 'kg', increment: 2.5 },
          { key: 'd-remo-mancuerna', pattern: 'remo-mancuerna', photo: 'one-arm-dumbbell-row', name: 'Remo con mancuerna a una mano', cue: 'Rodilla y mano en el banco. Rango largo y estiramiento completo abajo. 10-12 por brazo.', video: 'remo+con+mancuerna+a+una+mano+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 34, unit: 'kg', increment: 2 },
          { key: 'd-press-hombro-mancuernas', pattern: 'press-vertical', photo: 'dumbbell-shoulder-press', name: 'Press de hombro sentado con mancuernas', cue: 'Respaldo a 85°. Reps más altas que el lunes para acumular volumen sin repetir fatiga.', video: 'press+de+hombro+sentado+con+mancuernas+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 22, unit: 'kg-por-mano', increment: 2 },
          { key: 'd-pullover', pattern: 'pullover', photo: 'straight-arm-pulldown', name: 'Pull-over en polea alta', cue: 'Brazos casi rectos: aísla el dorsal sin implicar bíceps. Es lo que ensancha la espalda de frente.', video: 'pull+over+en+polea+alta+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 90, startLoad: 37.5, unit: 'kg', increment: 2.5 },
          { key: 'd-aperturas-polea', pattern: 'apertura', photo: 'cable-crossover', name: 'Aperturas en polea (cruce de pecho)', cue: 'Superserie con el siguiente. Poleas a la altura del hombro, junta las manos y aprieta 1 s.', video: 'aperturas+en+polea+cruce+de+pecho+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 17.5, unit: 'kg', increment: 2.5 },
          { key: 'd-laterales-mancuernas', pattern: 'elevacion-lateral', photo: 'side-lateral-raise', name: 'Elevaciones laterales con mancuernas', cue: 'Superserie con el anterior. Última serie: 3 repeticiones parciales al acabar.', video: 'elevaciones+laterales+con+mancuernas+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 1, restSec: 75, startLoad: 12, unit: 'kg-por-mano', increment: 1 },
          { key: 'd-pajaros', pattern: 'pajaros', photo: 'seated-bent-over-rear-delt-raise', name: 'Pájaros con mancuernas (tronco inclinado)', cue: 'Sentado en el borde del banco, pecho hacia los muslos. Abre los brazos hacia atrás con los codos casi rectos. Peso ligero: aquí manda la sensación, no los kilos.', video: 'pajaros+con+mancuernas+deltoides+posterior+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 1, restSec: 60, startLoad: 10, unit: 'kg-por-mano', increment: 2 },
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
    weekLabels: ['4', '3', '3', '2', '4'],
    days: [
      {
        key: 'j-pecho-a',
        name: 'Pecho, hombro y tríceps',
        subtitle: 'Empuje · sesión A',
        weekday: 'Lunes',
        warmup: '5 min de bici o elíptica · movilidad de hombro con banda (20 rotaciones externas) · 15 face pull muy ligeros. En el press banca: barra vacía × 15 y luego 60 % × 6. Tienes 15 años y llevas poco entrenando: la técnica va primero que los kilos, siempre.',
        exercises: [
          { key: 'j-press-banca', pattern: 'press-banca', photo: 'barbell-bench-press-medium-grip', name: 'Press banca con barra', cue: 'Escápulas atrás y abajo, codos a 45°. Baja controlado hasta tocar el pecho, sin rebotar. Si dudas, la primera semana solo con la barra vacía: 20 kg ya es peso suficiente para aprender el patrón.', video: 'press+banca+con+barra+tecnica+correcta', sets: 4, repMin: 6, repMax: 8, rir: 3, restSec: 180, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'j-press-inclinado-mancuernas', pattern: 'press-inclinado', photo: 'incline-dumbbell-press', name: 'Press inclinado con mancuernas (30°)', cue: 'Pecho superior. Baja hasta notar estiramiento sin forzar el hombro.', video: 'press+inclinado+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 3, restSec: 120, startLoad: 8, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-press-hombro-mancuernas', pattern: 'press-vertical', photo: 'dumbbell-shoulder-press', name: 'Press de hombro sentado con mancuernas', cue: 'Respaldo a 85°, costillas abajo para no arquear la lumbar.', video: 'press+de+hombro+sentado+con+mancuernas+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 3, restSec: 120, startLoad: 7, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-aperturas-polea', pattern: 'apertura', photo: 'cable-crossover', name: 'Aperturas en polea (cruce de pecho)', cue: 'Poleas a la altura del hombro, codos casi rectos. Junta las manos por delante y aprieta 1 s.', video: 'aperturas+en+polea+cruce+de+pecho+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 75, startLoad: 7, unit: 'kg', increment: 2.5 },
          { key: 'j-laterales', pattern: 'elevacion-lateral', photo: 'side-lateral-raise', name: 'Elevaciones laterales con mancuernas', cue: 'Sube a la horizontal y baja en 3 s. Peso ligero: si tienes que balancearte, sobra.', video: 'elevaciones+laterales+con+mancuernas+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 75, startLoad: 4, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-triceps-cuerda', pattern: 'extension-triceps', photo: 'triceps-pushdown-rope-attachment', name: 'Extensión de tríceps en polea con cuerda', cue: 'Superserie con el siguiente. Codos pegados al costado y quietos.', video: 'extension+de+triceps+en+polea+con+cuerda+tecnica', sets: 3, repMin: 12, repMax: 15, rir: 2, restSec: 60, startLoad: 12, unit: 'kg', increment: 2.5 },
          { key: 'j-press-frances', pattern: 'press-frances', photo: 'ez-bar-skullcrusher', name: 'Press francés con barra Z', cue: 'Superserie con el anterior. Tumbado, bajas hacia la frente con los codos quietos.', video: 'press+frances+con+barra+z+tecnica', sets: 2, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 12, unit: 'kg', increment: 2.5 },
          { key: 'j-plancha', pattern: 'plancha', photo: 'plank', name: 'Plancha frontal', cue: 'Glúteo apretado y pelvis en retroversión. Mejor 30 s bien que 60 s con la cadera caída.', video: 'plancha+abdominal+tecnica+correcta', sets: 3, repMin: 30, repMax: 45, rir: 2, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null, timed: true },
        ],
      },
      {
        key: 'j-espalda-a',
        name: 'Espalda y bíceps',
        subtitle: 'Tirón · sesión A',
        weekday: 'Martes',
        warmup: '5 min de remo · 10 colgadas pasivas de la barra de 10 s · 20 remos con banda. En el remo con barra: 2 series de aproximación al 50 % y al 70 %.',
        exercises: [
          { key: 'j-dominada-asistida', pattern: 'dominada', photo: 'band-assisted-pull-up', name: 'Dominada asistida', cue: 'Con máquina o con goma. A más asistencia, más fácil. El objetivo del bloque es bajar la asistencia, no subir repeticiones sin más.', video: 'dominadas+en+maquina+asistida+tecnica', sets: 4, repMin: 6, repMax: 10, rir: 2, restSec: 150, startLoad: 25, unit: 'kg', increment: -2.5, assist: true },
          { key: 'j-remo-barra', pattern: 'remo-barra', photo: 'bent-over-barbell-row', name: 'Remo con barra a 45°', cue: 'Tronco firme y tira hacia el ombligo. Si la lumbar se redondea, baja peso: con 15 años esto no se negocia.', video: 'remo+con+barra+tecnica+correcta', sets: 4, repMin: 8, repMax: 10, rir: 3, restSec: 150, startLoad: 25, unit: 'kg', increment: 2.5 },
          { key: 'j-jalon-neutro', pattern: 'jalon', photo: 'v-bar-pulldown', name: 'Jalón al pecho, agarre neutro', cue: 'Pecho alto, codos hacia las costillas. Pausa de 1 s abajo.', video: 'jalon+al+pecho+agarre+neutro+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 30, unit: 'kg', increment: 2.5 },
          { key: 'j-face-pull', pattern: 'face-pull', photo: 'face-pull', name: 'Face pull en polea alta', cue: 'Codos altos y rotación externa al final. Es lo que mantiene el hombro sano cuando haces mucho pecho.', video: 'face+pull+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 2, restSec: 60, startLoad: 12, unit: 'kg', increment: 2.5 },
          { key: 'j-curl-barra-z', pattern: 'curl-biceps', photo: 'ez-bar-curl', name: 'Curl de bíceps con barra Z', cue: 'Superserie con el siguiente. Codos quietos junto al tronco, sin balancear la cadera.', video: 'curl+de+biceps+con+barra+z+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 2, restSec: 90, startLoad: 15, unit: 'kg', increment: 2.5 },
          { key: 'j-curl-martillo', pattern: 'curl-biceps', photo: 'alternate-hammer-curl', name: 'Curl martillo con mancuernas', cue: 'Superserie con el anterior. Palmas enfrentadas: trabaja el braquial y engrosa el brazo.', video: 'curl+martillo+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
          { key: 'j-dead-bug', pattern: 'dead-bug', photo: 'dead-bug', name: 'Dead bug ("bicho muerto")', cue: 'Boca arriba, bajas brazo y pierna contrarios sin que la lumbar se despegue del suelo. 10 por lado, lento.', video: 'dead+bug+ejercicio+tecnica', sets: 3, repMin: 10, repMax: 10, rir: 2, restSec: 45, startLoad: 0, unit: 'peso-corporal', increment: null },
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
          { key: 'j-rueda-abdominal', pattern: 'rueda-abdominal', photo: 'ab-roller', name: 'Rueda abdominal o plancha frontal', cue: 'Si la rueda te tira de la lumbar, hazlo de rodillas con recorrido corto o cambia a plancha.', video: 'rueda+abdominal+tecnica+correcta', sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 60, startLoad: 0, unit: 'peso-corporal', increment: null },
        ],
      },
      {
        key: 'j-pecho-b',
        name: 'Pecho, hombro y tríceps',
        subtitle: 'Empuje · sesión B',
        weekday: 'Jueves',
        warmup: '5 min de remo · movilidad torácica · 20 rotaciones externas con banda · 15 face pull ligeros. En el press inclinado: barra vacía × 12 y 60 % × 6.',
        exercises: [
          { key: 'j-press-inclinado-barra', pattern: 'press-inclinado', photo: 'barbell-incline-bench-press-medium-grip', name: 'Press inclinado con barra (30°)', cue: 'El pecho superior es lo que más cambia la forma del torso. Aquí es el principal.', video: 'press+inclinado+con+barra+tecnica', sets: 3, repMin: 8, repMax: 10, rir: 3, restSec: 150, startLoad: 22.5, unit: 'kg', increment: 2.5 },
          { key: 'j-press-militar', pattern: 'press-vertical', photo: 'standing-military-press', name: 'Press militar con barra, de pie', cue: 'Glúteo y abdomen apretados para no arquear la lumbar. Cabeza atrás al pasar la barra.', video: 'press+militar+con+barra+de+pie+tecnica', sets: 4, repMin: 8, repMax: 10, rir: 3, restSec: 150, startLoad: 20, unit: 'kg', increment: 2.5 },
          { key: 'j-fondos', pattern: 'fondos', photo: 'dips-chest-version', name: 'Fondos en paralelas asistidos', cue: 'Tronco algo inclinado hacia delante para cargar pecho. Usa la máquina de asistencia hasta llegar a 8 limpios.', video: 'fondos+en+paralelas+tecnica+pecho', sets: 3, repMin: 8, repMax: 12, rir: 2, restSec: 120, startLoad: 0, unit: 'peso-corporal', increment: null },
          { key: 'j-laterales-polea', pattern: 'elevacion-lateral', photo: 'cable-seated-lateral-raise', name: 'Elevaciones laterales en polea', cue: 'En polea la tensión también está abajo, al revés que con mancuerna el lunes. Por eso están los dos días.', video: 'elevaciones+laterales+en+polea+tecnica', sets: 4, repMin: 12, repMax: 15, rir: 2, restSec: 75, startLoad: 5, unit: 'kg', increment: 2.5 },
          { key: 'j-deltoide-polea', pattern: 'pajaros', photo: 'cable-rear-delt-fly', name: 'Deltoides posterior en polea', cue: 'Brazo cruzado por delante del cuerpo, abres hacia fuera y atrás con el codo casi recto.', video: 'deltoides+posterior+en+polea+unilateral+tecnica', sets: 3, repMin: 15, repMax: 20, rir: 2, restSec: 60, startLoad: 5, unit: 'kg', increment: 2.5 },
          { key: 'j-triceps-barra', pattern: 'extension-triceps', photo: 'triceps-pushdown', name: 'Extensión de tríceps en polea, barra recta', cue: 'Mismo movimiento que el lunes pero con barra en vez de cuerda: cambia el agarre y el estímulo.', video: 'extension+de+triceps+en+polea+alta+con+barra+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 60, startLoad: 14, unit: 'kg', increment: 2.5 },
          { key: 'j-encogimientos', pattern: 'encogimiento', photo: 'dumbbell-shrug', name: 'Encogimientos de hombro con mancuernas', cue: 'Sube recto hacia las orejas, sin rotar. Pausa de 1 s arriba.', video: 'encogimientos+de+hombro+trapecio+tecnica', sets: 2, repMin: 12, repMax: 15, rir: 2, restSec: 60, startLoad: 12, unit: 'kg-por-mano', increment: 2 },
        ],
      },
      {
        key: 'j-espalda-b',
        name: 'Espalda, brazo y abdomen',
        subtitle: 'Tirón · sesión B, con gemelo y antebrazo',
        weekday: 'Viernes',
        warmup: '5 min de bici · 10 colgadas pasivas de la barra · 20 remos con banda · movilidad de muñeca antes del trabajo de antebrazo.',
        exercises: [
          { key: 'j-remo-mancuerna', pattern: 'remo-mancuerna', photo: 'one-arm-dumbbell-row', name: 'Remo con mancuerna a una mano', cue: 'Rodilla y mano en el banco. 10-12 por brazo, recorrido largo y estiramiento completo abajo.', video: 'remo+con+mancuerna+a+una+mano+tecnica', sets: 4, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 12, unit: 'kg', increment: 2 },
          { key: 'j-jalon-prono', pattern: 'jalon', photo: 'wide-grip-lat-pulldown', name: 'Jalón al pecho, agarre prono ancho', cue: 'Agarre ancho: es lo que ensancha la espalda vista de frente. Distinto del agarre neutro del martes.', video: 'jalon+al+pecho+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 28, unit: 'kg', increment: 2.5 },
          { key: 'j-rdl-mancuernas', pattern: 'bisagra', photo: 'romanian-deadlift', name: 'Peso muerto rumano con mancuernas', cue: 'Complementa la pierna del miércoles sin cargar la lumbar como la barra. Cadera atrás, espalda recta.', video: 'peso+muerto+rumano+con+mancuernas+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 120, startLoad: 10, unit: 'kg-por-mano', increment: 2 },
          { key: 'j-curl-inclinado', pattern: 'curl-biceps', photo: 'incline-dumbbell-curl', name: 'Curl de bíceps en banco inclinado', cue: 'Brazo por detrás del tronco: es la posición donde más se estira el bíceps.', video: 'curl+biceps+banco+inclinado+tecnica', sets: 3, repMin: 10, repMax: 12, rir: 2, restSec: 75, startLoad: 6, unit: 'kg-por-mano', increment: 1 },
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
