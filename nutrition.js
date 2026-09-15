// Objetivos y recetario. Comida de supermercado (Mercadona), barata y sin elaborar.
//
// Las kcal y la proteína salen de tablas de composición estándar por 100 g y están
// redondeadas: son estimaciones de trabajo, no análisis de laboratorio. Sirven para
// acertar el objetivo diario con un margen del 5-10 %, que es lo que importa.
//
// Los precios son ORIENTATIVOS (verano de 2026) y cambian cada temporada. Están para
// comparar recetas entre sí, no para cuadrar la cuenta del súper.

export const TARGETS = {
  anna: {
    kcal: 2450, prot: 110, fat: 55, carb: 335,
    estrategia: 'Superávit ligero para ganar músculo',
    detalle: 'Con 52 kg y un 15 % de grasa no hay nada que definir: sin comer por encima del mantenimiento no se construye tejido nuevo. El objetivo es subir 0,2-0,4 kg al mes, no más — por encima de eso lo que se gana es grasa.',
    proteinaNota: 'Tu mínimo son 110 g. Pasarte no es problema; quedarte corta sí.',
  },
  jan: {
    kcal: 2800, prot: 115, fat: 60, carb: 450,
    estrategia: 'Superávit para crecer y ganar músculo',
    detalle: 'Con 52 kg para 177 cm estás por debajo de tu peso, y encima has puesto que estás en déficit. Eso es exactamente lo contrario de lo que necesitas: a los 15 años y con 0-6 meses de gimnasio, el músculo no aparece por entrenar más, aparece por comer más. Objetivo: subir 0,3-0,5 kg al mes. Si la báscula no se mueve en 3 semanas, no es la rutina — es que estás comiendo poco.',
    proteinaNota: 'Tus 115 g son el mínimo. Con la proteína en polvo que ya tomas llegas fácil, pero lo que de verdad te falta son las calorías: la crema de arroz y el arroz, la pasta y el pan son tus aliados aquí.',
  },
  david: {
    kcal: 2350, prot: 192, fat: 78, carb: 220,
    estrategia: 'Déficit moderado para perder grasa',
    detalle: 'Recalculado con datos reales: 87,2 kg, 180 cm, 22 años, 4 días de gimnasio. Mantenimiento ~2.900 kcal. Objetivo: bajar 0,4-0,5 kg por semana hasta los 80 kg, que es donde se marca la cintura — volver a 83 no vale, porque a 83 ya estabas tapado. Son unas 15 semanas.',
    proteinaNota: 'Los 192 g son el mínimo. En el bloque de agosto la pierna subió un 22 %: esa masa es lo que la proteína alta tiene que proteger ahora que comes por debajo.',
  },
};

// cat: desayuno | comida | cena | snack
export const MEALS = [
  // ---------------------------------------------------------------- desayunos
  {
    key: 'queso-batido-proteina', cat: 'desayuno', name: 'Queso batido con proteína, avena y plátano',
    kcal: 510, prot: 52, min: 3, price: 1.55,
    ingredients: ['250 g de queso batido 0 %', '30 g de proteína en polvo de chocolate', '50 g de copos de avena', '1 plátano'],
    steps: ['Mezcla el queso batido con la proteína hasta que no queden grumos.', 'Añade la avena y el plátano en rodajas.', 'Déjalo hecho la noche antes en un táper: la avena se ablanda y por la mañana son 30 segundos.'],
    tip: '52 g de proteína en tres minutos y por 1,55 €. Es la comida con mejor relación proteína/tiempo/precio de toda la lista, y por eso abre el día cuando solo tienes veinte minutos.',
  },
  {
    key: 'avena-yogur', cat: 'desayuno', name: 'Yogur proteico con avena, plátano y cacahuete',
    kcal: 520, prot: 32, min: 3, price: 1.4,
    ingredients: ['1 yogur proteico natural (200 g)', '60 g de copos de avena', '1 plátano', '15 g de crema de cacahuete', 'Canela'],
    steps: ['Echa la avena en un bol y cúbrela con el yogur.', 'Corta el plátano encima y añade la crema de cacahuete.', 'Si lo dejas hecho la noche antes, la avena queda blanda y se come mejor.'],
  },
  {
    key: 'tortilla-pavo', cat: 'desayuno', name: 'Tortilla de 3 huevos con pavo y pan',
    kcal: 450, prot: 36, min: 8, price: 1.3,
    ingredients: ['3 huevos', '60 g de pavo en lonchas', '2 rebanadas de pan integral', 'Sal y aceite de oliva'],
    steps: ['Bate los huevos con el pavo troceado y una pizca de sal.', 'Cuájalo en la sartén con un chorrito de aceite, 3-4 min.', 'Tuesta el pan y sirve.'],
  },
  {
    key: 'batido-avena', cat: 'desayuno', name: 'Batido de avena, leche, plátano y cacao',
    kcal: 430, prot: 22, min: 2, price: 0.8,
    ingredients: ['350 ml de leche entera', '50 g de copos de avena', '1 plátano', '1 cucharada de cacao puro desgrasado', 'Opcional: 1 medida de proteína'],
    steps: ['Todo a la batidora, 30 segundos.', 'Es la opción para las mañanas con prisa: se bebe de camino.'],
  },
  {
    key: 'tostadas-huevo', cat: 'desayuno', name: 'Tostadas con huevo y aguacate',
    kcal: 480, prot: 22, min: 8, price: 1.6,
    ingredients: ['2 rebanadas de pan integral', '2 huevos', '1/2 aguacate', 'Sal, pimienta y aceite de oliva'],
    steps: ['Tuesta el pan y machaca encima el aguacate.', 'Haz los huevos a la plancha y ponlos encima.', 'Sal, pimienta y listo.'],
  },

  // ---------------------------------------------------------------- comidas
  {
    key: 'arroz-pollo', cat: 'comida', name: 'Arroz con pollo y verduras salteadas',
    kcal: 650, prot: 48, min: 20, price: 2.2,
    ingredients: ['100 g de arroz basmati (en crudo)', '180 g de pechuga de pollo en filetes', '200 g de verdura para wok congelada', 'Salsa de soja', 'Aceite de oliva'],
    steps: ['Pon el arroz a hervir, 10-12 min.', 'Mientras, saltea el pollo troceado en la sartén con un poco de aceite.', 'Añade la verdura congelada directa del paquete y saltea 5 min más.', 'Mezcla todo con el arroz y un chorro de soja.'],
    tip: 'Cocina el arroz y el pollo para 3 días de golpe: la diferencia entre cumplir la dieta y no cumplirla suele ser tener la comida ya hecha.',
  },
  {
    key: 'pasta-atun', cat: 'comida', name: 'Pasta con atún y tomate',
    kcal: 600, prot: 38, min: 15, price: 1.5,
    ingredients: ['100 g de pasta (en crudo)', '2 latas de atún al natural', '200 g de tomate frito o triturado', 'Ajo en polvo y orégano'],
    steps: ['Hierve la pasta.', 'Calienta el tomate con el atún escurrido, ajo y orégano, 5 min.', 'Mezcla.'],
  },
  {
    key: 'lentejas-huevo', cat: 'comida', name: 'Lentejas de bote con arroz y huevo',
    kcal: 580, prot: 32, min: 10, price: 1.3,
    ingredients: ['1 bote de lentejas cocidas (400 g)', '60 g de arroz (en crudo)', '2 huevos', 'Pimentón y aceite de oliva'],
    steps: ['Enjuaga las lentejas y caliéntalas con un poco de pimentón.', 'Hierve el arroz y los huevos (10 min los huevos).', 'Todo junto en el plato.'],
    tip: 'De lo más barato que vas a comer con esta cantidad de proteína.',
  },
  {
    key: 'pollo-boniato', cat: 'comida', name: 'Pollo al horno con boniato y ensalada',
    kcal: 580, prot: 50, min: 35, price: 2.4,
    ingredients: ['200 g de pechuga de pollo', '250 g de boniato', 'Bolsa de ensalada', 'Especias, sal y aceite de oliva'],
    steps: ['Corta el boniato en gajos, aceite y sal, al horno 200 °C, 25 min.', 'A los 10 min mete el pollo especiado en la misma bandeja.', 'Sirve con la ensalada aliñada.'],
    tip: 'Haz el triple de cantidad: es la misma media hora de horno y te resuelve tres comidas.',
  },
  {
    key: 'wok-ternera', cat: 'comida', name: 'Wok de ternera con noodles y verdura',
    kcal: 680, prot: 45, min: 15, price: 3.2,
    ingredients: ['180 g de ternera en tiras', '2 nidos de noodles', '200 g de verdura para wok congelada', 'Salsa de soja y ajo'],
    steps: ['Hidrata los noodles según el paquete (3 min).', 'Saltea la ternera 3 min a fuego fuerte.', 'Añade la verdura, 4 min más, y mezcla con los noodles y la soja.'],
  },
  {
    key: 'salmon-patata', cat: 'comida', name: 'Salmón al horno con patata y brócoli',
    kcal: 620, prot: 42, min: 30, price: 3.8,
    ingredients: ['180 g de salmón', '250 g de patata', '200 g de brócoli (vale congelado)', 'Limón, sal y aceite de oliva'],
    steps: ['Patata en rodajas al horno 200 °C, 20 min.', 'Añade el salmón y el brócoli, 12 min más.', 'Limón por encima al sacarlo.'],
    tip: 'La comida más cara de la lista, pero la de mejores grasas. Una vez por semana.',
  },

  // ---------------------------------------------------------------- cenas
  {
    key: 'revuelto-gambas', cat: 'cena', name: 'Revuelto de huevos con gambas y espinacas',
    kcal: 400, prot: 34, min: 10, price: 2.0,
    ingredients: ['3 huevos', '100 g de gambas peladas congeladas', '150 g de espinacas frescas', 'Ajo y aceite de oliva'],
    steps: ['Saltea el ajo y las gambas 3 min.', 'Añade las espinacas hasta que bajen.', 'Echa los huevos batidos y remueve hasta cuajar.'],
  },
  {
    key: 'merluza-verduras', cat: 'cena', name: 'Merluza a la plancha con verduras y pan',
    kcal: 380, prot: 38, min: 12, price: 2.6,
    ingredients: ['200 g de lomos de merluza congelada', '250 g de verdura variada congelada', '1 rebanada de pan', 'Limón, ajo y aceite'],
    steps: ['Verdura al microondas, 6 min.', 'Merluza a la plancha 4 min por lado con ajo.', 'Limón y a comer.'],
  },
  {
    key: 'ensalada-completa', cat: 'cena', name: 'Ensalada completa de atún, huevo y garbanzos',
    kcal: 480, prot: 36, min: 8, price: 1.7,
    ingredients: ['Bolsa de ensalada', '1 bote pequeño de garbanzos cocidos', '2 latas de atún', '2 huevos cocidos', 'Maíz, aceite y vinagre'],
    steps: ['Enjuaga los garbanzos.', 'Mezcla todo en un bol grande.', 'Aliña con aceite, vinagre y sal.'],
    tip: 'Cero cocina y sale en 8 minutos. La cena de los días en que no te apetece nada.',
  },
  {
    key: 'pollo-hummus', cat: 'cena', name: 'Pechuga a la plancha con hummus y pan de pita',
    kcal: 520, prot: 46, min: 12, price: 2.3,
    ingredients: ['200 g de pechuga de pollo', '80 g de hummus', '1 pan de pita integral', 'Tomate y lechuga'],
    steps: ['Pollo a la plancha con sal y especias, 5 min por lado.', 'Calienta la pita 1 min.', 'Móntalo todo con el hummus y la verdura.'],
  },
  {
    key: 'tortilla-patata', cat: 'cena', name: 'Tortilla de patata rápida al microondas',
    kcal: 500, prot: 24, min: 12, price: 1.2,
    ingredients: ['300 g de patata', '3 huevos', 'Cebolla (opcional)', 'Sal y aceite de oliva'],
    steps: ['Patata en dados con un poco de aceite, al microondas 8 min tapada.', 'Mezcla con los huevos batidos y sal.', 'Al microondas 3-4 min más, o cuájala en la sartén.'],
  },

  // ---------------------------------------------------------------- snacks
  {
    key: 'yogur-almendras', cat: 'snack', name: 'Yogur proteico con almendras',
    kcal: 280, prot: 24, min: 1, price: 0.9,
    ingredients: ['1 yogur proteico (200 g)', '20 g de almendras'],
    steps: ['Nada que cocinar.'],
  },
  {
    key: 'tostada-cacahuete', cat: 'snack', name: 'Tostada con crema de cacahuete y plátano',
    kcal: 320, prot: 11, min: 3, price: 0.6,
    ingredients: ['2 rebanadas de pan integral', '20 g de crema de cacahuete', '1 plátano'],
    steps: ['Tuesta, unta, corta el plátano encima.'],
  },
  {
    key: 'batido-proteina', cat: 'snack', name: 'Batido de proteína con leche',
    kcal: 220, prot: 32, min: 1, price: 0.8,
    ingredients: ['1 medida de proteína en polvo (30 g)', '300 ml de leche'],
    steps: ['Agitar.'],
    tip: 'La forma más rápida y barata de sumar 30 g de proteína cuando el día va justo.',
  },
  {
    key: 'requeson-fruta', cat: 'snack', name: 'Requesón con fruta y miel',
    kcal: 220, prot: 22, min: 2, price: 1.0,
    ingredients: ['200 g de requesón o queso batido 0 %', '1 pieza de fruta', '1 cucharadita de miel'],
    steps: ['Mezclar.'],
  },
  {
    key: 'atun-tostadas', cat: 'snack', name: 'Tostadas con atún',
    kcal: 250, prot: 26, min: 3, price: 1.0,
    ingredients: ['2 latas de atún al natural', '2 rebanadas de pan integral', 'Tomate y aceite'],
    steps: ['Tuesta el pan, restriega tomate y pon el atún escurrido.'],
  },
];

// Día de ejemplo por usuario: la app suma sus kcal y proteína y lo compara con el objetivo.
export const SAMPLE_DAY = {
  anna: [
    { key: 'avena-yogur', slot: 'Desayuno' },
    { key: 'tostada-cacahuete', slot: 'Media mañana' },
    { key: 'arroz-pollo', slot: 'Comida' },
    { key: 'requeson-fruta', slot: 'Merienda' },
    { key: 'pasta-atun', slot: 'Cena' },
    { key: 'batido-avena', slot: 'Antes de dormir', half: true },
  ],
  jan: [
    { key: 'tortilla-pavo', slot: 'Desayuno' },
    { key: 'tostada-cacahuete', slot: 'Media mañana' },
    { key: 'arroz-pollo', slot: 'Comida' },
    { key: 'batido-avena', slot: 'Merienda' },
    { key: 'pasta-atun', slot: 'Cena' },
    { key: 'requeson-fruta', slot: 'Antes de dormir' },
    { key: 'yogur-almendras', slot: 'Post-entreno', half: true },
  ],
  // Cinco comidas, no siete: se levanta a las 7:30, sale a las 7:50, come de táper en el
  // trabajo, entrena hasta las 19:00 y llega a casa a las 20:30. Todo lo que pase de
  // 12 minutos de cocina entre semana no se hace, y una dieta que no se hace no es dieta.
  david: [
    { key: 'queso-batido-proteina', slot: 'Desayuno' },
    { key: 'yogur-almendras', slot: 'Media mañana' },
    { key: 'arroz-pollo', slot: 'Comida' },
    { key: 'batido-proteina', slot: 'Media tarde' },
    { key: 'pollo-hummus', slot: 'Cena' },
    { key: 'requeson-fruta', slot: 'Antes de dormir' },
  ],
};


// Rotación semanal. Solo David la tiene escrita: es el único que come de táper con
// horario cerrado y necesita saber qué toca el jueves sin pensarlo. Para el resto, el
// día de ejemplo repetido es exactamente lo que ya se les enseñaba, así que no se
// inventan siete días de datos que nadie ha pedido.
//
// El desayuno, la media mañana, la media tarde y la toma de antes de dormir son fijas:
// lo que rota es la comida y la cena, que es lo único que se cocina.
const D_FIJAS = [
  { key: 'queso-batido-proteina', slot: 'Desayuno' },
  { key: 'yogur-almendras', slot: 'Media mañana' },
  { key: 'batido-proteina', slot: 'Media tarde' },
  { key: 'requeson-fruta', slot: 'Antes de dormir' },
];
const diaDavid = (comida, cena) => [
  D_FIJAS[0], D_FIJAS[1],
  { key: comida, slot: 'Comida' },
  D_FIJAS[2],
  { key: cena, slot: 'Cena' },
  D_FIJAS[3],
];

export const WEEK_PLAN = {
  david: [
    { day: 1, meals: diaDavid('arroz-pollo', 'pollo-hummus') },
    { day: 2, meals: diaDavid('pollo-boniato', 'revuelto-gambas') },
    { day: 3, meals: diaDavid('pasta-atun', 'pollo-hummus') },
    { day: 4, meals: diaDavid('arroz-pollo', 'merluza-verduras') },
    { day: 5, meals: diaDavid('lentejas-huevo', 'pollo-hummus') },
    { day: 6, meals: diaDavid('wok-ternera', 'ensalada-completa') },
    { day: 0, meals: diaDavid('pollo-boniato', 'tortilla-patata') },
  ],
};

/** Los 7 días del plan, o null si ese usuario solo tiene día de ejemplo. */
export const weekPlan = (userKey) => WEEK_PLAN[userKey] || null;

export const mealByKey = (k) => MEALS.find((m) => m.key === k) || null;

export function dayTotals(userKey) {
  return (SAMPLE_DAY[userKey] || []).reduce(
    (t, it) => {
      const m = mealByKey(it.key);
      if (!m) return t;
      const f = it.half ? 0.5 : 1;
      return { kcal: t.kcal + m.kcal * f, prot: t.prot + m.prot * f, price: t.price + m.price * f };
    },
    { kcal: 0, prot: 0, price: 0 }
  );
}

/** Lista de la compra del día de ejemplo, sin repetir ingredientes. */
/**
 * Lista de la compra de la SEMANA, con cuántas veces entra cada ingrediente. Sin el
 * recuento no sirve para el súper: saber que necesitas pechuga no te dice si compras
 * una bandeja o tres. Si el usuario no tiene rotación semanal, cuenta el día de ejemplo
 * siete veces, que es lo que de verdad va a comer.
 */
export function shoppingList(userKey) {
  const plan = WEEK_PLAN[userKey];
  const dias = plan ? plan.map((d) => d.meals) : Array(7).fill(SAMPLE_DAY[userKey] || []);
  const cuenta = new Map();
  for (const meals of dias) {
    for (const it of meals) {
      for (const ing of mealByKey(it.key)?.ingredients || []) {
        cuenta.set(ing, (cuenta.get(ing) || 0) + 1);
      }
    }
  }
  return [...cuenta].map(([item, veces]) => ({ item, veces }));
}

/** kcal, proteína y precio de un día del plan. */
export function planDayTotals(meals) {
  return meals.reduce((t, it) => {
    const m = mealByKey(it.key);
    if (!m) return t;
    const f = it.half ? 0.5 : 1;
    return { kcal: t.kcal + m.kcal * f, prot: t.prot + m.prot * f, price: t.price + m.price * f };
  }, { kcal: 0, prot: 0, price: 0 });
}
