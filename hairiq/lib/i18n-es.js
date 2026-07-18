// ---------------------------------------------------------------------------
// Español dictionary (rev 8) — every user-facing string reachable in the
// demo, keyed by the EXACT English source string. Used by the demo's 🌐
// Español toggle (the artifact sandbox can't load Google Translate, so the
// demo carries its own translations); the deployed app can adopt it later
// as the native-Spanish upgrade over machine translation.
//
// Rules: brand/product names, K18, LOC/LCO stay in English (proper nouns /
// established acronyms). Voice: casual "tú", neutral Latin American Spanish.
// Product card blurbs are intentionally not translated yet (v1 limit).
// ---------------------------------------------------------------------------

export const ES = {
  // ---- landing + shared chrome ----
  "Eleven quick questions. One personalized hair routine — with picks for every budget.":
    "Once preguntas rápidas. Una rutina de cabello personalizada — con opciones para todo presupuesto.",
  "Take the Quiz": "Haz el quiz",
  "≈ 2 minutes · no account needed": "≈ 2 minutos · sin cuenta",
  "← Back": "← Atrás",
  "Next": "Siguiente",
  "See my results ✨": "Ver mis resultados ✨",
  "Your routine is ready ✨": "Tu rutina está lista ✨",
  "💡 Good to know": "💡 Bueno saberlo",
  "Tips": "Consejos",
  "Why this works": "Por qué funciona",
  "Retake Quiz": "Repetir el quiz",
  "🔒 Save My Routine": "🔒 Guardar mi rutina",
  "Unlock for $1.99": "Desbloquear por $1.99",
  "Save My Routine": "Guardar mi rutina",
  "New": "Nuevo",
  "(optional)": "(opcional)",
  "Live demo — same quiz data & recommendation engine as the How Is My Hair app (v1).":
    "Demo en vivo — los mismos datos del quiz y el mismo motor de recomendaciones que la app de How Is My Hair (v1).",
  "Affordable": "Económico",
  "Cruelty-Free": "Libre de crueldad",
  "Wash Day": "Día de lavado",
  "At Night": "De noche",
  "Also folded in:": "También incluimos:",
  "In the full app this opens a secure Stripe checkout (card, Apple Pay, Google Pay) and unlocks routine saving — payments are switched off in this shareable demo.":
    "En la app completa este botón abre un pago seguro de Stripe (tarjeta, Apple Pay, Google Pay) y desbloquea guardar tu rutina — los pagos están desactivados en esta demo compartible.",
  "This shareable demo can't take payments — on the live site this button opens a secure Stripe checkout (card, Apple Pay, Google Pay) and your routine unlocks right after.":
    "Esta demo compartible no puede cobrar pagos — en el sitio real este botón abre un pago seguro de Stripe (tarjeta, Apple Pay, Google Pay) y tu rutina se desbloquea al instante.",
  "🐰 Certified or independently tracked cruelty-free — across every price point. Certifications can change; verify via Leaping Bunny or PETA before you buy.":
    "🐰 Certificado o verificado de forma independiente como libre de crueldad — en todos los precios. Las certificaciones cambian; verifica en Leaping Bunny o PETA antes de comprar.",
  "How Is My Hair gives cosmetic styling guidance, not medical treatment. Persistent scalp issues — anything painful, spreading, or unresponsive to over-the-counter care — deserve a dermatologist visit rather than a routine change.":
    "How Is My Hair ofrece orientación cosmética de peinado, no tratamiento médico. Los problemas persistentes del cuero cabelludo — algo doloroso, que se extiende o que no mejora con productos de venta libre — merecen una visita al dermatólogo, no un cambio de rutina.",

  // ---- signup ----
  "Get new products, treatments, and deals sent to you 💌": "Recibe nuevos productos, tratamientos y ofertas 💌",
  "Free, and segmented to what you actually care about — pick one, two, or all three.":
    "Gratis, y segmentado a lo que de verdad te importa — elige uno, dos o los tres.",
  "Affordable deals": "Ofertas económicas",
  "Luxury picks": "Selección de lujo",
  "Cruelty-free finds": "Hallazgos libres de crueldad",
  "All three ✨": "Los tres ✨",
  "Sign me up": "Suscribirme",
  "ZIP (optional)": "Código postal (opcional)",
  "ZIP just helps us point you to options in your area — no location tracking.":
    "El código postal solo nos ayuda a sugerirte opciones en tu zona — sin rastreo de ubicación.",
  "You're in! 💌": "¡Ya estás dentro! 💌",
  "We'll only send what you picked — new products, treatments, and deals. Unsubscribe anytime.":
    "Solo te enviaremos lo que elegiste — nuevos productos, tratamientos y ofertas. Cancela cuando quieras.",
  "(Demo build — signups aren't stored yet.)": "(Versión demo — las suscripciones aún no se guardan.)",
  "That email doesn't look quite right.": "Ese correo no se ve del todo bien.",
  "Pick at least one topic — or grab all three.": "Elige al menos un tema — o llévate los tres.",
  "ZIP should be 5 digits (or leave it blank).": "El código postal debe tener 5 dígitos (o déjalo vacío).",

  // ---- questions ----
  "What's your hair type?": "¿Cuál es tu tipo de cabello?",
  "Go with how it dries naturally, no products.": "Guíate por cómo se seca al natural, sin productos.",
  "Straight": "Lacio",
  "Wavy": "Ondulado",
  "Curly": "Rizado",
  "Coily": "Muy rizado / afro",
  "How dense is your hair?": "¿Qué tan denso es tu cabello?",
  "Think about how much hair you have overall, not the width of each strand.":
    "Piensa en cuánto cabello tienes en total, no en el grosor de cada hebra.",
  "Fine": "Fino",
  "Medium": "Medio",
  "Thick": "Grueso",
  "Not sure": "No sé",
  "New to this — totally fine": "Nuevo en esto — no pasa nada",
  "How long is your hair?": "¿Qué tan largo es tu cabello?",
  "Some steps only earn their keep past a certain length.":
    "Algunos pasos solo valen la pena a partir de cierto largo.",
  "Short": "Corto",
  "Above the shoulders": "Por encima de los hombros",
  "Shoulder to mid-back": "De los hombros a media espalda",
  "Long": "Largo",
  "Mid-back to waist": "De media espalda a la cintura",
  "Extra long": "Extra largo",
  "Past the waist": "Más abajo de la cintura",
  "How would you describe your scalp?": "¿Cómo describirías tu cuero cabelludo?",
  "Select all that apply — scalps overlap (oily AND flaky is common).":
    "Marca todo lo que aplique — se combinan (graso Y con caspa es común).",
  "Oily": "Graso",
  "Greasy by the end of the day": "Grasoso al final del día",
  "Dry": "Seco",
  "Tight or itchy after washing": "Tirante o con picazón después de lavar",
  "Flaky": "Con caspa",
  "Visible flakes or dandruff": "Escamas visibles o caspa",
  "Sensitive or irritated": "Sensible o irritado",
  "Balanced": "Equilibrado",
  "No complaints": "Sin quejas",
  "What are your main hair concerns?": "¿Cuáles son tus principales preocupaciones?",
  "Select all that apply — your plan covers every one you pick, led by the most routine-defining.":
    "Marca todas las que apliquen — tu plan cubre cada una, empezando por la que más define la rutina.",
  "Thinning or density loss": "Pérdida de densidad o afinamiento",
  "Dryness or damage": "Resequedad o daño",
  "Frizz": "Frizz",
  "Breakage & split ends": "Quiebre y puntas abiertas",
  "Dandruff or flaking": "Caspa o descamación",
  "Slow growth": "Crecimiento lento",
  "New to curly or wavy hair": "Nueva en cabello rizado u ondulado",
  "I need a styling routine": "Necesito una rutina de peinado",
  "What are your goals?": "¿Cuáles son tus metas?",
  "Select all that apply — most people are working on more than one thing.":
    "Marca todas las que apliquen — la mayoría trabaja en más de una cosa.",
  "Grow it longer": "Dejarlo crecer",
  "Increase density": "Aumentar densidad",
  "Repair damage": "Reparar daño",
  "Reduce frizz": "Reducir el frizz",
  "Improve scalp health": "Mejorar el cuero cabelludo",
  "Just maintain": "Solo mantener",
  "Any chemical treatments?": "¿Algún tratamiento químico?",
  "Select all that apply. (Purple shampoo and other color-depositing products don't count — they only coat the outside of the hair, they don't chemically change it.)":
    "Marca todo lo que aplique. (El shampoo morado y otros productos que depositan color no cuentan — solo recubren el exterior del cabello, no lo cambian químicamente.)",
  "Salon color, no bleach": "Tinte de salón, sin decoloración",
  "Bleached": "Decolorado",
  "Box dye at home, no bleach": "Tinte de caja en casa, sin decoloración",
  "Relaxed or permed": "Alaciado (relajante) o permanente",
  "Keratin or smoothing treatment": "Keratina o alisado",
  "None": "Ninguno",
  "How often do you heat style?": "¿Con qué frecuencia usas calor?",
  "Blow dryer, flat iron, curling iron — any hot tool counts.":
    "Secadora, plancha, rizadora — cualquier herramienta caliente cuenta.",
  "Daily": "A diario",
  "A few times a week": "Varias veces por semana",
  "Rarely or never": "Rara vez o nunca",
  "How often do you wash your hair?": "¿Cada cuánto lavas tu cabello?",
  "Every other day": "Un día sí, un día no",
  "Twice a week": "Dos veces por semana",
  "Weekly or less": "Una vez por semana o menos",
  "How much time do you have for a routine?": "¿Cuánto tiempo tienes para una rutina?",
  "Be honest — a routine you'll actually do beats a perfect one you won't.":
    "Sé honesta — una rutina que sí harás le gana a una perfecta que no.",
  "5 min or less": "5 min o menos",
  "10–15 min": "10–15 min",
  "20+ min": "20+ min",
  "What matters most in product picks?": "¿Qué importa más al elegir productos?",
  "This just sets which tab you land on — you can always flip between all three.":
    "Esto solo define en qué pestaña empiezas — siempre puedes cambiar entre las tres.",
  "Budget-friendly": "Económico",
  "Affordable picks": "Opciones accesibles",
  "Luxury": "Lujo",
  "Treat-yourself picks": "Para consentirte",
  "Cruelty-free": "Libre de crueldad",
  "Certified & verified brands": "Marcas certificadas y verificadas",

  // ---- principles ----
  "Pre-wash oil treatment (“pre-poo”)": "Aceite antes del lavado (“pre-poo”)",
  "Why coconut oil specifically: its fatty-acid structure lets it actually penetrate into the hair shaft rather than just sitting on the surface — the main reason it's the most-recommended pre-poo oil in the hair-science world. Oils like argan work more on the surface (great for shine and smoothness) but don't penetrate the same way.":
    "Por qué el aceite de coco: su estructura de ácidos grasos le permite penetrar de verdad en la hebra en lugar de quedarse en la superficie — la razón principal de que sea el aceite pre-poo más recomendado por la ciencia capilar. Aceites como el de argán trabajan más en la superficie (geniales para brillo y suavidad) pero no penetran igual.",
  "Buy a hair-specific coconut oil product, not the cooking jar. Hair-formulated versions are processed to be lighter and spread more easily, so they don't leave the waxy buildup that solid, unrefined cooking-grade coconut oil can.":
    "Compra un aceite de coco formulado para el cabello, no el frasco de cocina. Las versiones capilares son más ligeras y se distribuyen mejor, así que no dejan el residuo ceroso que puede dejar el aceite de coco sólido sin refinar.",
  "Fine or low-porosity hair? Use a lighter hand — or start with the weightless mist version — so it doesn't get weighed down. Argan oil is a good lighter alternative if coconut oil ever feels too heavy.":
    "¿Cabello fino o de baja porosidad? Usa poca cantidad — o empieza con la versión en bruma ligera — para no apelmazarlo. El aceite de argán es una buena alternativa más ligera si el de coco se siente pesado.",
  "The sweat rule": "La regla del sudor",
  "If you sweat that day (workout, hot day, anything), don't just let it air dry. Sweat, sebum, and salt sitting on the scalp for hours can lead to buildup, odor, and irritation.":
    "Si sudaste ese día (ejercicio, calor, lo que sea), no dejes que solo se seque al aire. El sudor, el sebo y la sal acumulados por horas en el cuero cabelludo pueden causar residuos, mal olor e irritación.",
  "Dry shampoo is fine between washes, but it is not a substitute here — it only absorbs surface oil. And a cool-air blow-dry at the scalp is a legit touch-up (dermatologists acknowledge it), but it only evaporates moisture; it doesn't remove salt, sweat, or bacteria either. Both are stopgaps, not wash replacements.":
    "El shampoo en seco está bien entre lavados, pero aquí no sustituye nada — solo absorbe la grasa superficial. Y secar el cuero cabelludo con aire frío es un retoque válido (los dermatólogos lo reconocen), pero solo evapora la humedad; tampoco quita sal, sudor ni bacterias. Ambos son parches, no reemplazos del lavado.",
  "Sweat daily? You still don't need a deep clean every day — but don't rely on plain water either; water alone doesn't really remove sweat, salt, or oil. The daily move is a gentle sulfate-free shampoo (one wash is enough on a light-sweat day — save double-washing for heavy buildup), or a gentler natural option like a raw-sugar scalp scrub or a rosemary-vinegar rinse. Keep clarifying washes to a few times a week.":
    "¿Sudas a diario? Aun así no necesitas una limpieza profunda cada día — pero tampoco confíes solo en el agua; el agua sola no quita realmente el sudor, la sal ni la grasa. El movimiento diario es un shampoo suave sin sulfatos (un solo lavado basta en días de sudor ligero — guarda el doble lavado para cuando haya mucha acumulación), o una opción natural más suave como una exfoliación con azúcar sin refinar o un enjuague de romero y vinagre. Limita los lavados clarificantes a unas pocas veces por semana.",
  "Shampoo is for your scalp, not your ends": "El shampoo es para el cuero cabelludo, no para las puntas",
  "There are no oil glands on the hair shaft itself, so scrubbing shampoo into your ends every wash just dries them out. Wash the scalp; let the runoff handle the rest.":
    "La hebra del cabello no tiene glándulas de grasa, así que tallar shampoo en las puntas en cada lavado solo las reseca. Lava el cuero cabelludo; deja que la espuma que baja haga el resto.",
  "Exception: if the ends feel grimy or product-heavy, a roughly monthly full-length “reset” wash is fine — it's just not an every-wash need.":
    "Excepción: si las puntas se sienten sucias o cargadas de producto, un lavado completo de “reinicio” más o menos mensual está bien — solo no es necesario en cada lavado.",
  "And wash frequency follows the scalp, not the hair: wash when the scalp feels oily, sweaty, or itchy. If it feels fine, there's no rule saying you're due.":
    "Y la frecuencia de lavado la marca el cuero cabelludo, no el cabello: lava cuando se sienta graso, sudado o con picazón. Si se siente bien, no hay regla que diga que ya toca.",
  "Conditioner isn't optional (and how to apply it)": "El acondicionador no es opcional (y cómo aplicarlo)",
  "How to apply: split hair into two sections (more if it's very thick), and work conditioner from mid-lengths to ends only — never on the scalp. Needing a generous amount is normal, not overuse.":
    "Cómo aplicarlo: divide el cabello en dos secciones (más si es muy grueso) y trabaja el acondicionador solo de medios a puntas — nunca en el cuero cabelludo. Necesitar una cantidad generosa es normal, no exceso.",
  "Texture changes the dose: wavy, curly, and coily hair genuinely need more conditioner than straight hair — every bend in the strand exposes more cuticle, so it absorbs (and needs) more moisture to stay smooth. For curls and coils, a wet detangling brush is a great way to spread it evenly while detangling in the same step.":
    "La textura cambia la dosis: el cabello ondulado, rizado y afro necesita genuinamente más acondicionador que el lacio — cada curva de la hebra expone más cutícula, así que absorbe (y necesita) más hidratación para mantenerse suave. Para rizos, un cepillo desenredante en húmedo es ideal para repartirlo parejo mientras desenredas en el mismo paso.",
  "What actually happens if you skip it: hair gets progressively harder to detangle, breaks more from friction, and dulls — and curly/coily hair also loses definition and frizzes faster. That's true for every hair type; textured hair just shows it soonest.":
    "Qué pasa si lo saltas: el cabello se vuelve cada vez más difícil de desenredar, se quiebra más por fricción y pierde brillo — y el rizado además pierde definición y se esponja más rápido. Aplica a todo tipo de cabello; el texturizado solo lo muestra antes.",
  "Wet or dry? Depends on your hair type": "¿Húmedo o seco? Depende de tu tipo de cabello",
  "Curly and coily hair: wet detangling only, never dry — dry brushing breaks curls and creates serious frizz. Detangle wet, with conditioner in.":
    "Cabello rizado y afro: desenreda solo en húmedo, nunca en seco — cepillar en seco rompe los rizos y crea mucho frizz. Desenreda mojado, con el acondicionador puesto.",
  "Wavy hair: two beautiful options. Option one — right out of the shower, brush your leave-in through towel-dried damp hair to spread the product (waves don't need to brush conditioner through in the shower like curls do; waiting until damp can mean less breakage). Option two — dry brush from the ends up for fluffy, voluminous waves, or on day 2–3 to detangle mid-lengths and stretch more days between washes.":
    "Cabello ondulado: dos opciones hermosas. Opción uno — al salir de la ducha, cepilla tu leave-in en el cabello húmedo (secado con toalla) para repartir el producto (las ondas no necesitan cepillar el acondicionador dentro de la ducha como los rizos; esperar a que esté húmedo puede significar menos quiebre). Opción dos — cepilla en seco desde las puntas hacia arriba para ondas esponjadas con volumen, o en el día 2–3 para desenredar los medios y estirar más días entre lavados.",
  "Straight hair: dry brushing is often the easier call — straight hair tangles less, and wet hair is more fragile for every hair type. If you do detangle wet, use a wide-tooth comb, gently.":
    "Cabello lacio: cepillar en seco suele ser lo más práctico — el lacio se enreda menos, y el cabello mojado es más frágil en todos los tipos. Si desenredas en húmedo, usa un peine de dientes anchos, con suavidad.",
  "Double-washing, explained": "El doble lavado, explicado",
  "The first wash breaks down surface buildup. The second is the one that actually cleanses the scalp — and it's when a medicated or treatment shampoo does its real work, so always use those as the second wash.":
    "El primer lavado disuelve la acumulación superficial. El segundo es el que de verdad limpia el cuero cabelludo — y es cuando un shampoo medicado o de tratamiento hace su verdadero trabajo, así que úsalos siempre como segundo lavado.",
  "One correction people get wrong: if your first wash is a clarifying shampoo, do NOT clarify twice. That squeaky-clean, stripped feeling means it already worked — follow it with a hydrating, non-clarifying shampoo for the second wash instead, so you cleanse without over-stripping.":
    "Una corrección que muchos hacen mal: si tu primer lavado es con shampoo clarificante, NO clarifiques dos veces. Esa sensación de limpieza rechinante significa que ya funcionó — sigue con un shampoo hidratante, no clarificante, para el segundo lavado, y así limpias sin resecar de más.",
  "Why scalp massage actually works": "Por qué el masaje capilar sí funciona",
  "The science, simply: hair grows from follicles fed by tiny blood vessels. Massaging increases local blood flow and gently stretches the skin, which signals the follicle cells themselves — small studies of daily massage found measurably thicker hair after a few months. The catch: consistency is everything. Ten minutes daily beats an hour once a week.":
    "La ciencia, en simple: el cabello crece de folículos alimentados por vasos sanguíneos diminutos. Masajear aumenta el flujo de sangre local y estira suavemente la piel, lo que estimula a las propias células del folículo — pequeños estudios de masaje diario midieron cabello más grueso tras unos meses. El truco: la constancia lo es todo. Diez minutos diarios le ganan a una hora una vez por semana.",
  "Fingertips vs. a brush: fingertips (never nails — nails scratch and cause tiny tears) let you feel the pressure and hit every spot. A wood or bamboo scalp brush covers more ground with less hand fatigue, spreads oils and serums evenly, and gently exfoliates buildup while it stimulates. Both work — fingertips for precision, brush for convenience and exfoliation. Pick whichever you'll actually do every day.":
    "¿Yemas o cepillo?: las yemas (nunca las uñas — las uñas rayan y causan microlesiones) te dejan sentir la presión y llegar a cada punto. Un cepillo de madera o bambú para cuero cabelludo cubre más área con menos cansancio, reparte aceites y serums de manera pareja, y exfolia suavemente mientras estimula. Ambos funcionan — yemas para precisión, cepillo para comodidad y exfoliación. Elige el que de verdad harás todos los días.",
  "Why the bonnet (and the braid) actually matter": "Por qué el gorro (y la trenza) sí importan",
  "The pillowcase handles part of it: a smooth satin or silk surface cuts friction where your head rests. But hair still rubs against itself and drags across fabric as you turn. A bonnet (or a loose braid) contains the hair — strand-on-strand friction drops, moisture stays in, and longer hair keeps its shape. Short hair can get away with the pillowcase alone; the longer your hair, the more the bonnet earns its spot.":
    "La funda resuelve una parte: una superficie lisa de satén o seda reduce la fricción donde apoyas la cabeza. Pero el cabello igual se frota contra sí mismo y se arrastra por la tela cuando te mueves. Un gorro (o una trenza floja) contiene el cabello — baja la fricción entre hebras, la hidratación se queda dentro y el cabello largo conserva su forma. El corto se salva con la funda sola; cuanto más largo el cabello, más se gana el gorro su lugar.",
  "Fabric tiers, same physics: satin is the affordable version (around $10), mulberry silk is the luxury one — smoother and cooler, but the friction science is identical.":
    "Telas por nivel, misma física: el satén es la versión económica (unos $10), la seda de morera es la de lujo — más lisa y fresca, pero la ciencia de la fricción es idéntica.",
  "Styling for sleep: a loose braid + bonnet/pillowcase for straight and wavy hair; a loose, high “pineapple” pony for curls and coils so the pattern survives the night.":
    "Peinado para dormir: trenza floja + gorro/funda para cabello lacio y ondulado; una coleta alta y floja tipo “piña” para rizos, para que el patrón sobreviva la noche.",
  "K18 instructions — step by step": "Instrucciones de K18 — paso a paso",
  "Shampoo — and skip your regular rinse-out conditioner this wash (it can block the treatment from working).":
    "Lava con shampoo — y salta tu acondicionador de enjuague habitual en este lavado (puede bloquear el tratamiento).",
  "Towel-dry your hair until damp — and dry your HANDS too. K18 only emulsifies (turns thick, white, and creamy) in dry palms; on wet hands it just slides around and does less.":
    "Seca tu cabello con toalla hasta dejarlo húmedo — y sécate LAS MANOS también. K18 solo emulsiona (se vuelve espeso, blanco y cremoso) en palmas secas; en manos mojadas solo resbala y hace menos.",
  "Rub 1–3 pumps between your dry palms until it's creamy, so it spreads evenly before touching your hair.":
    "Frota 1–3 dosis entre tus palmas secas hasta que esté cremoso, para que se reparta parejo antes de tocar tu cabello.",
  "Apply from mid-lengths to ends, working upward — avoid the scalp — then SCRUNCH it in. Scrunching presses the product into the strands, and it works for every hair type, even straight.":
    "Aplica de medios a puntas, subiendo — evita el cuero cabelludo — y luego APRIETA (scrunch). El scrunch presiona el producto dentro de las hebras, y funciona para todo tipo de cabello, incluso lacio.",
  "Leave it for 4 minutes.": "Déjalo actuar 4 minutos.",
  "Summer sun & your hair": "El sol de verano y tu cabello",
  "The easy fix isn't another 'before going outside' product to remember — just let a UV leave-in replace your regular leave-in for the whole summer. Worn every day, it covers sun, salt, and chlorine without adding a step.":
    "La solución fácil no es otro producto que recordar “antes de salir” — simplemente deja que un leave-in con UV reemplace tu leave-in habitual todo el verano. Usado a diario, cubre sol, sal y cloro sin agregar un paso.",
  "A heads-up about box dye": "Un aviso sobre el tinte de caja",
  "Before any future bleach or salon color: use a clarifying/chelating shampoo (e.g., L'Oréal Metal Detox) for a few washes first, and always mention your box dye history to your stylist so they can strand-test.":
    "Antes de cualquier decoloración o tinte de salón futuro: usa un shampoo clarificante/quelante (p. ej., L'Oréal Metal Detox) durante algunos lavados, y siempre cuéntale a tu estilista tu historial de tinte de caja para que haga prueba de mechón.",
  "The LOC / LCO method": "El método LOC / LCO",
  "L — Liquid: water or a water-based leave-in, to actually hydrate the hair.":
    "L — Líquido: agua o un leave-in a base de agua, para hidratar de verdad el cabello.",
  "O — Oil: a lightweight oil applied next, to seal that moisture in.":
    "O — Aceite (oil): un aceite ligero después, para sellar esa hidratación.",
  "C — Cream: a heavier cream or butter on top, to lock everything in and add definition.":
    "C — Crema: una crema o manteca más pesada encima, para fijar todo y dar definición.",
  "LOC order (oil before cream) tends to work better for low-porosity hair — the cuticle lies flatter, so a lighter oil layer first prevents product from just sitting on top.":
    "El orden LOC (aceite antes que crema) suele funcionar mejor en cabello de baja porosidad — la cutícula está más cerrada, así que una capa ligera de aceite primero evita que el producto se quede encima.",
  "LCO order (cream before oil) tends to work better for high-porosity hair — bleached, damaged, or rough-feeling hair is usually higher porosity, and the heavier cream needs an oil layer on top to actually hold.":
    "El orden LCO (crema antes que aceite) suele funcionar mejor en cabello de alta porosidad — el decolorado, dañado o áspero suele ser más poroso, y la crema pesada necesita una capa de aceite encima para que de verdad se quede.",
  "If you're doing everything right and still thinning": "Si haces todo bien y aun así se afina",
  "Aim for 7+ hours of sleep, stay hydrated, and find a stress outlet that actually works for you — all three show up again and again in hair-shedding research.":
    "Apunta a 7+ horas de sueño, mantente hidratada y encuentra una salida al estrés que de verdad te funcione — las tres aparecen una y otra vez en la investigación sobre caída del cabello.",
  "If shedding is sudden, patchy, or persistent, it's worth asking a doctor about bloodwork: iron/ferritin, vitamin D, B12, zinc, and thyroid are the usual suspects. Not a diagnosis — just worth checking so you're not fighting a nutrient gap with shampoo.":
    "Si la caída es repentina, en parches o persistente, vale la pena pedirle a un médico análisis de sangre: hierro/ferritina, vitamina D, B12, zinc y tiroides son los sospechosos habituales. No es un diagnóstico — solo vale revisarlo para no pelear contra una deficiencia con shampoo.",
  "A note on scalp health": "Una nota sobre el cuero cabelludo",
  "Persistent scalp issues — anything painful, spreading, or unresponsive to over-the-counter care — deserve a dermatologist visit, not just a routine change.":
    "Los problemas persistentes del cuero cabelludo — algo doloroso, que se extiende o que no mejora con productos de venta libre — merecen una visita al dermatólogo, no solo un cambio de rutina.",

  // ---- summaries ----
  "Your plan for fuller-feeling hair": "Tu plan para un cabello con más cuerpo",
  "Scalp-first: daily massage, night serums, and growth-supporting washes — with zero tension on the hairline.":
    "Primero el cuero cabelludo: masaje diario, serums de noche y lavados que apoyan el crecimiento — con cero tensión en la línea del cabello.",
  "Your plan for softer, healthier hair": "Tu plan para un cabello más suave y sano",
  "Moisture in, moisture kept: pre-wash oil, a weekly deep mask, and a leave-in every single wash day.":
    "Hidratación que entra y se queda: aceite antes del lavado, mascarilla profunda semanal y leave-in cada día de lavado.",
  "Your plan for smooth, calm hair": "Tu plan para un cabello liso y en calma",
  "Frizz is thirst plus friction — so we hydrate in layers (LOC/LCO), dry gently, and then keep hands off.":
    "El frizz es sed más fricción — así que hidratamos en capas (LOC/LCO), secamos con cuidado y luego no lo tocamos.",
  "Your plan for stronger hair": "Tu plan para un cabello más fuerte",
  "Bond repair on wash days, silk at night, and gentle detangling — strength is built in the details.":
    "Reparación de enlaces los días de lavado, seda de noche y desenredado suave — la fuerza se construye en los detalles.",
  "Your plan for a calm, flake-free scalp": "Tu plan para un cuero cabelludo en calma y sin caspa",
  "Medicated washes done the right way (as the second wash), weekly exfoliation, and no hot water on the scalp.":
    "Lavados medicados bien hechos (como segundo lavado), exfoliación semanal y nada de agua caliente en el cuero cabelludo.",
  "Your plan for length that sticks around": "Tu plan para un largo que sí se queda",
  "Nightly scalp massage, growth serum, and monthly protein — plus trims so breakage stops erasing your progress.":
    "Masaje capilar cada noche, serum de crecimiento y proteína mensual — más despuntes para que el quiebre deje de borrar tu progreso.",
  "Your starter curl routine": "Tu rutina inicial para rizos",
  "The beginner-proof version: sulfate-free washing, styling on soaking-wet hair, plopping, and day-2 refreshes.":
    "La versión a prueba de principiantes: lavado sin sulfatos, peinado con el cabello empapado, “plopping” y refrescado en el día 2.",
  "Core routine · 5 min or less": "Rutina esencial · 5 min o menos",
  "Standard routine · 10–15 min": "Rutina estándar · 10–15 min",
  "Full routine · 20+ min": "Rutina completa · 20+ min",

  // ---- chips ----
  "Long length": "Largo: largo",
  "Short length": "Largo: corto",
  "Medium length": "Largo: medio",
  "Extra long length": "Largo: extra largo",
  "Fine density": "Densidad fina",
  "Medium density": "Densidad media",
  "Thick density": "Densidad gruesa",
  "Density TBD": "Densidad por definir",
  "Dry scalp": "Cuero cabelludo seco",
  "Balanced scalp": "Cuero cabelludo equilibrado",
  "Oily + Flaky scalp": "Cuero cabelludo graso + con caspa",
  "Dry + Sensitive or irritated scalp": "Cuero cabelludo seco + sensible",
  "Repair damage + Improve scalp health": "Reparar daño + mejorar el cuero cabelludo",
  "Increase density + Reduce frizz": "Aumentar densidad + reducir el frizz",

  // ---- wash-frequency intros ----
  "You wash daily — keep the everyday wash gentle, and save the heavier treatments for one or two designated “full” wash days a week.":
    "Lavas a diario — mantén el lavado diario suave, y guarda los tratamientos pesados para uno o dos días de lavado “completo” por semana.",
  "You wash every other day — wash days come around often, so rotate the extras across them instead of doing everything every time.":
    "Lavas un día sí y un día no — los días de lavado llegan seguido, así que rota los extras entre ellos en lugar de hacerlo todo cada vez.",
  "You wash about twice a week — treat each wash day as a mini reset and give the treatment steps room to work.":
    "Lavas unas dos veces por semana — trata cada día de lavado como un mini reinicio y dales espacio a los tratamientos para trabajar.",
  "You wash weekly (or less) — make that one wash day count, and lean on the Daily tab to keep your scalp happy in between.":
    "Lavas una vez por semana (o menos) — haz que ese día cuente, y apóyate en la pestaña Diario para mantener feliz tu cuero cabelludo entre lavados.",

  // ---- steps: titles, how, frequencies ----
  "Every wash": "En cada lavado",
  "Every wash day": "Cada día de lavado",
  "Nightly": "Cada noche",
  "1×/week": "1×/semana",
  "1×/month": "1×/mes",
  "3–4 nights/week": "3–4 noches/semana",
  "10 min daily": "10 min al día",
  "Daily-ish": "Casi a diario",
  "As needed": "Cuando haga falta",
  "As you like": "A tu gusto",
  "All day": "Todo el día",
  "All summer": "Todo el verano",
  "Your call": "Tú decides",
  "Wash day only": "Solo el día de lavado",
  "Day 2–3": "Día 2–3",
  "Dry or tangly days": "Días de pelo seco o enredado",
  "Before hot tools": "Antes de usar calor",
  "After styling": "Después de peinar",
  "10–20 min before shampoo": "10–20 min antes del shampoo",
  "In shower": "En la ducha",
  "Before shower": "Antes de la ducha",
  "After shower": "Después de la ducha",
  "Start here": "Empieza aquí",
  "Alternative": "Alternativa",

  "A light coat of oil on mid-lengths and ends before you shampoo — use a light hand (or the weightless mist) so fine hair doesn't get weighed down.":
    "Una capa ligera de aceite de medios a puntas antes del shampoo — usa poca cantidad (o la bruma ligera) para no apelmazar el cabello fino.",
  "A light coat of oil on mid-lengths and ends before you shampoo — use a light hand (or the weightless mist) so fine hair doesn't get weighed down. For breakage specifically, this is the whole point: the oil cushions strands against wash-time friction — the exact mechanical stress that snaps fragile hair.":
    "Una capa ligera de aceite de medios a puntas antes del shampoo — usa poca cantidad (o la bruma ligera) para no apelmazar el cabello fino. Para el quiebre, este es justo el punto: el aceite amortigua las hebras contra la fricción del lavado — el estrés mecánico exacto que rompe el cabello frágil.",
  "Coat mid-lengths and ends with oil 10–20+ minutes before you shampoo — it cushions hair against friction and breakage during the wash.":
    "Cubre de medios a puntas con aceite 10–20+ minutos antes del shampoo — amortigua el cabello contra la fricción y el quiebre durante el lavado.",
  "Coat mid-lengths and ends with oil 10–20+ minutes before you shampoo — it cushions hair against friction and breakage during the wash. For breakage specifically, this is the whole point: the oil cushions strands against wash-time friction — the exact mechanical stress that snaps fragile hair.":
    "Cubre de medios a puntas con aceite 10–20+ minutos antes del shampoo — amortigua el cabello contra la fricción y el quiebre durante el lavado. Para el quiebre, este es justo el punto: el aceite amortigua las hebras contra la fricción del lavado — el estrés mecánico exacto que rompe el cabello frágil.",
  "No luxury-tier pre-poo in the library yet — the OGX coconut oils (Drugstore tab) are the science-backed pick here regardless of budget.":
    "Aún no hay pre-poo de lujo en la biblioteca — los aceites de coco OGX (pestaña Económico) son la opción respaldada por la ciencia sin importar el presupuesto.",
  "Shampoo": "Shampoo",
  "Shampoo — growth support": "Shampoo — apoyo al crecimiento",
  "Shampoo — bond strengthening": "Shampoo — refuerzo de enlaces",
  "Shampoo — gentle daily, medicated 2×/week": "Shampoo — suave a diario, medicado 2×/semana",
  "Wash — sulfate-free shampoo or co-wash": "Lavado — shampoo sin sulfatos o co-wash",
  "A growth-supporting wash on wash days. Massage it into the scalp with fingertips — that's where it earns its keep.":
    "Un lavado que apoya el crecimiento en los días de lavado. Masajéalo en el cuero cabelludo con las yemas — ahí es donde vale la pena.",
  "A growth-supporting wash on wash days, massaged into the scalp with fingertips.":
    "Un lavado que apoya el crecimiento, masajeado en el cuero cabelludo con las yemas.",
  "A strengthening wash, massaged into the scalp with fingertips.":
    "Un lavado fortalecedor, masajeado en el cuero cabelludo con las yemas.",
  "A bond-strengthening wash, and be gentle: lather at the scalp, squeeze (don't scrub) the lengths.":
    "Un lavado que refuerza los enlaces, y con suavidad: haz espuma en el cuero cabelludo y aprieta (no talles) los largos.",
  "Focus shampoo on the scalp, not the lengths — and when it feels heavy with product or sweat, double-wash.":
    "Concentra el shampoo en el cuero cabelludo, no en los largos — y cuando se sienta cargado de producto o sudor, haz doble lavado.",
  "Massage into the scalp and let the runoff clean the lengths — no need to scrub dry ends.":
    "Masajea el cuero cabelludo y deja que la espuma que baja limpie los largos — no hace falta tallar las puntas secas.",
  "Alternate a gentle shampoo with a medicated one about twice a week. When your scalp feels heavy, double-wash: gentle first to break down buildup, medicated second so it can actually treat the scalp. Keep the water warm — never hot — on an irritated scalp.":
    "Alterna un shampoo suave con uno medicado unas dos veces por semana. Cuando el cuero cabelludo se sienta cargado, doble lavado: suave primero para disolver residuos, medicado después para que de verdad trate la piel. Mantén el agua tibia — nunca caliente — en un cuero cabelludo irritado.",
  "Curls dry out fast, so keep the wash gentle: a sulfate-free shampoo (or a co-wash if your scalp isn't oily), focused on the scalp.":
    "Los rizos se resecan rápido, así que lava con suavidad: un shampoo sin sulfatos (o un co-wash si tu cuero cabelludo no es graso), concentrado en la raíz.",
  "Clarifying wash (swap in)": "Lavado clarificante (en rotación)",
  "Once a week, swap your regular shampoo for a clarifying one — it resets product and hard-water buildup so everything else works better. If you double-wash that day, clarify only once: follow it with a hydrating, non-clarifying shampoo for the second wash.":
    "Una vez por semana, cambia tu shampoo habitual por uno clarificante — reinicia la acumulación de producto y de agua dura para que todo lo demás funcione mejor. Si ese día haces doble lavado, clarifica solo una vez: sigue con un shampoo hidratante, no clarificante, en el segundo lavado.",
  "Once a week, swap in a clarifying shampoo to reset buildup. With box dye in your history, make it a chelating formula (like Metal Detox) — see the note below about your next color appointment. If you double-wash that day, clarify only once: follow it with a hydrating, non-clarifying shampoo for the second wash.":
    "Una vez por semana, usa un shampoo clarificante para reiniciar la acumulación. Con tinte de caja en tu historial, que sea una fórmula quelante (como Metal Detox) — mira la nota de abajo sobre tu próxima cita de color. Si ese día haces doble lavado, clarifica solo una vez: sigue con un shampoo hidratante, no clarificante, en el segundo lavado.",
  "Bond treatment": "Tratamiento de enlaces",
  "Bond treatment — pick ONE timing": "Tratamiento de enlaces — elige UN momento",
  "Bond-repair treatment": "Tratamiento reparador de enlaces",
  "Bond-repair treatment — pick ONE timing": "Tratamiento reparador de enlaces — elige UN momento",
  "One bond builder, weekly or as needed — in the shower, right after shampoo and before conditioner. Our top pick is K18 in every tab, even Affordable: it's the one luxury splurge that's earned it (science-backed, never duped). It's pricey but a bottle lasts months — full instructions below.":
    "Un reparador de enlaces, semanal o según necesites — en la ducha, justo después del shampoo y antes del acondicionador. Nuestra elección número uno es K18 en todas las pestañas, incluso Económico: es el único lujo que se lo ha ganado (respaldado por la ciencia, sin dupe real). Es caro pero un frasco dura meses — instrucciones completas abajo.",
  "Bond repair is one step with three possible timings — not three separate steps, so don't stack all of them. In-shower is the standard starting point; before- or after-shower are alternatives if a mid-shower step doesn't fit. Our top pick is K18 in every tab — yes, even Affordable: it's the one luxury splurge that's earned it (science-backed, never duped). Full instructions below.":
    "La reparación de enlaces es UN paso con tres momentos posibles — no tres pasos separados, así que no los acumules. En la ducha es el punto de partida estándar; antes o después de la ducha son alternativas si un paso a media ducha no te acomoda. Nuestra elección número uno es K18 en todas las pestañas — sí, incluso Económico: es el único lujo que se lo ha ganado (respaldado por la ciencia, sin dupe real). Instrucciones completas abajo.",
  "Weekly · K18 every few weeks": "Semanal · K18 cada pocas semanas",
  "Right after shampoo, before conditioner — the standard starting point.":
    "Justo después del shampoo, antes del acondicionador — el punto de partida estándar.",
  "Apply at least 10 minutes before washing — same job, earlier timing (Olaplex No.3 is literally designed this way).":
    "Aplica al menos 10 minutos antes de lavar — mismo trabajo, momento más temprano (Olaplex No.3 está literalmente diseñado así).",
  "On damp hair, then wait 10 minutes before any other product.":
    "En cabello húmedo, y espera 10 minutos antes de cualquier otro producto.",
  "No pick in this tab for this timing — go with the in-shower option.":
    "No hay opción en esta pestaña para este momento — usa la opción en la ducha.",
  "Protein treatment": "Tratamiento de proteína",
  "A monthly protein treatment keeps strands strong enough to hold onto their length — growth you don't break off is growth you keep.":
    "Un tratamiento de proteína mensual mantiene las hebras lo bastante fuertes para conservar su largo — el crecimiento que no se rompe es crecimiento que te quedas.",
  "Condition": "Acondicionador",
  "Split into two sections and work it from mid-lengths to ends only — keep it off the roots. Every single wash, no skipping.":
    "Divide en dos secciones y trabájalo solo de medios a puntas — lejos de la raíz. En cada lavado, sin saltarlo.",
  "Split into two sections and work it from mid-lengths to ends — never the scalp. Every single wash; a generous amount is normal.":
    "Divide en dos secciones y trabájalo de medios a puntas — nunca en el cuero cabelludo. En cada lavado; una cantidad generosa es normal.",
  "Never skip this — unconditioned hair tangles, and tangles are how fragile hair snaps. Mid-lengths to ends, never the scalp. On K18 washes, conditioner comes back in after the treatment window — see the K18 steps — not before.":
    "Nunca lo saltes — el cabello sin acondicionador se enreda, y los enredos son la forma en que el cabello frágil se rompe. De medios a puntas, nunca en el cuero cabelludo. En lavados con K18, el acondicionador vuelve después de la ventana del tratamiento — mira los pasos de K18 — no antes.",
  "Condition generously every wash — curls genuinely need more than straight hair (that's correct dosing, not overuse). Mid-lengths to ends, never the scalp. This is also your detangling window (next step).":
    "Acondiciona generosamente en cada lavado — los rizos necesitan genuinamente más que el cabello lacio (es la dosis correcta, no exceso). De medios a puntas, nunca en el cuero cabelludo. Esta es también tu ventana para desenredar (siguiente paso).",
  "Deep conditioning mask": "Mascarilla de hidratación profunda",
  "15–20 minutes with a shower cap or warm towel over it — the warmth helps it actually absorb instead of sitting on top.":
    "15–20 minutos con gorro de ducha o toalla tibia encima — el calor ayuda a que de verdad se absorba en lugar de quedarse encima.",
  "Gloss or mask add-on": "Extra: gloss o mascarilla",
  "Pick 1–2 conditioning layers per wash — gloss + conditioner, gloss + mask, or conditioner + mask all combine fine.":
    "Elige 1–2 capas acondicionadoras por lavado — gloss + acondicionador, gloss + mascarilla, o acondicionador + mascarilla combinan bien.",
  "Detangle while the conditioner is in": "Desenreda con el acondicionador puesto",
  "Fingers or a wide-tooth comb, working from the ends up — never brush curls once they're dry. Rinse when you're through it.":
    "Dedos o peine de dientes anchos, de las puntas hacia arriba — nunca cepilles los rizos ya secos. Enjuaga al terminar.",
  "Leave-in conditioner + heat protectant": "Leave-in + protector de calor",
  "Apply liberally to damp hair, every wash day — and never let a hot tool touch bare hair.":
    "Aplica generosamente en cabello húmedo, cada día de lavado — y nunca dejes que una herramienta caliente toque el cabello sin protección.",
  "Apply liberally to damp hair, every wash day. This is the step that makes everything else look better.":
    "Aplica generosamente en cabello húmedo, cada día de lavado. Este es el paso que hace que todo lo demás se vea mejor.",
  "Everyday leave-in conditioner": "Leave-in de todos los días",
  "Since hot tools aren't your thing, skip the heat-protectant sprays entirely — a moisturizing everyday leave-in on damp hair is all this step needs.":
    "Como el calor no es lo tuyo, olvídate de los sprays protectores — un leave-in hidratante de uso diario en cabello húmedo es todo lo que este paso necesita.",
  "Apply liberally to soaking-wet hair — this is the L (liquid) of your LCO layers.":
    "Aplica generosamente con el cabello empapado — esta es la L (líquido) de tus capas LCO.",
  "Apply liberally to soaking-wet hair — this is the L (liquid) of your LOC layers.":
    "Aplica generosamente con el cabello empapado — esta es la L (líquido) de tus capas LOC.",
  "Lock in moisture — LCO layers": "Sella la hidratación — capas LCO",
  "Lock in moisture — LOC layers": "Sella la hidratación — capas LOC",
  "Frizz is hair searching the air for moisture — beat it to the punch. On damp hair, layer in LCO order (leave-in → cream → oil) — bleached or chemically treated hair is usually higher porosity, so the oil goes on top to hold everything in.":
    "El frizz es cabello buscando humedad en el aire — gánale la partida. En cabello húmedo, aplica en orden LCO (leave-in → crema → aceite) — el cabello decolorado o tratado químicamente suele ser más poroso, así que el aceite va encima para retenerlo todo.",
  "Frizz is hair searching the air for moisture — beat it to the punch. On damp hair, layer in LOC order (leave-in → oil → cream) — a light oil layer first works best unless your hair is very porous.":
    "El frizz es cabello buscando humedad en el aire — gánale la partida. En cabello húmedo, aplica en orden LOC (leave-in → aceite → crema) — una capa ligera de aceite primero funciona mejor salvo que tu cabello sea muy poroso.",
  "Style soaking wet — LCO layers": "Peina con el cabello empapado — capas LCO",
  "Style soaking wet — LOC layers": "Peina con el cabello empapado — capas LOC",
  "While hair is still soaking wet, layer in LCO order (leave-in → cream → oil) — bleached or chemically treated hair is usually higher porosity, so the oil goes on top to hold everything in. Scrunch upward to encourage the pattern.":
    "Con el cabello aún empapado, aplica en orden LCO (leave-in → crema → aceite) — el cabello decolorado o tratado suele ser más poroso, así que el aceite va encima para retenerlo todo. Haz scrunch hacia arriba para animar el patrón.",
  "While hair is still soaking wet, layer in LOC order (leave-in → oil → cream) — a light oil layer first works best unless your hair is very porous. Scrunch upward to encourage the pattern.":
    "Con el cabello aún empapado, aplica en orden LOC (leave-in → aceite → crema) — una capa ligera de aceite primero funciona mejor salvo que tu cabello sea muy poroso. Haz scrunch hacia arriba para animar el patrón.",
  "Dry gently": "Seca con cuidado",
  "Blot and scrunch with a microfiber towel or a t-shirt — rough terry towels rough up the cuticle and undo everything you just did.":
    "Seca a toques y con scrunch usando una toalla de microfibra o una camiseta — las toallas ásperas de felpa levantan la cutícula y deshacen todo lo que acabas de hacer.",
  "Plop, then air-dry or diffuse": "“Plopping”, y luego aire o difusor",
  "Wrap curls up in a microfiber towel or old t-shirt for 10–15 minutes (“plopping”), then air-dry or diffuse on low heat. No rough terry towels, no touching while it dries.":
    "Envuelve los rizos en una toalla de microfibra o camiseta vieja por 10–15 minutos (“plopping”), y luego seca al aire o con difusor a baja temperatura. Nada de toallas ásperas, ni tocar mientras seca.",
  "Hands off once it's dry": "Manos fuera cuando esté seco",
  "Every touch roughs the cuticle back up and reintroduces frizz. Style it damp, then leave it alone — seriously, this one's free and it works.":
    "Cada tocada vuelve a levantar la cutícula y trae de vuelta el frizz. Péinalo húmedo y luego déjalo en paz — en serio, este es gratis y funciona.",
  "Refresh, don't re-wash": "Refresca, no vuelvas a lavar",
  "Mist curls with water plus a small amount of your leave-in, scrunch, and go. No new products needed — it's the same leave-in from wash day.":
    "Rocía los rizos con agua más un poco de tu leave-in, haz scrunch y listo. No necesitas productos nuevos — es el mismo leave-in del día de lavado.",
  "Define your texture": "Define tu textura",
  "A curl cream or styler on damp hair, scrunched up and left alone to dry — LCO layering applies here too.":
    "Una crema para rizos o estilizador en cabello húmedo, con scrunch y sin tocarlo hasta que seque — las capas LCO también aplican aquí.",
  "Styling": "Peinado",
  "Whatever your look calls for — texture, volume, or shape. Any order, personal preference.":
    "Lo que pida tu look — textura, volumen o forma. En cualquier orden, a tu gusto.",
  "Volume styling": "Peinado con volumen",
  "Lift at the roots: mousse on damp roots before drying, or a texture spray once dry. Style away from tension on the hairline.":
    "Levanta desde la raíz: mousse en raíces húmedas antes de secar, o spray de textura ya en seco. Peina sin tensión en la línea del cabello.",
  "Scalp massage": "Masaje capilar",
  "Fingertips, never nails — small circles across the whole scalp. A cheap scalp brush makes the habit easier to keep.":
    "Yemas, nunca uñas — círculos pequeños por todo el cuero cabelludo. Un cepillo barato para cuero cabelludo hace el hábito más fácil de mantener.",
  "Scalp exfoliation": "Exfoliación del cuero cabelludo",
  "Once a week, a scalp scrub (or a scalp brush used in the shower) lifts flakes and buildup so the medicated washes can reach skin.":
    "Una vez por semana, un exfoliante capilar (o un cepillo de cuero cabelludo en la ducha) levanta escamas y residuos para que los lavados medicados lleguen a la piel.",
  "Seal it in": "Séllalo",
  "A few drops of serum or lightweight oil on the ends only — fine hair wants finish, not weight.":
    "Unas gotas de serum o aceite ligero solo en las puntas — el cabello fino quiere acabado, no peso.",
  "Mid-week moisture": "Hidratación a media semana",
  "When hair feels dry or tangly between washes, smooth a little oil or an overnight treatment through the ends.":
    "Cuando el cabello se sienta seco o enredado entre lavados, alisa un poco de aceite o un tratamiento de noche por las puntas.",
  "Dry shampoo between washes": "Shampoo en seco entre lavados",
  "Great for greasy roots between washes — but it only absorbs surface oil. If you sweat today, actually wash tonight (see the sweat rule below).":
    "Genial para raíces grasosas entre lavados — pero solo absorbe la grasa superficial. Si hoy sudaste, lava de verdad esta noche (mira la regla del sudor abajo).",
  "Make your leave-in a UV one for summer": "Haz tu leave-in uno con UV en verano",
  "Sun can visibly shift color-treated hair over one summer. No extra step needed — just let a UV leave-in replace your regular leave-in until fall, worn every day.":
    "El sol puede cambiar visiblemente el cabello teñido en un solo verano. Sin pasos extra — solo deja que un leave-in con UV reemplace tu leave-in habitual hasta el otoño, usado a diario.",
  "A summer of sun can change the color and texture of your ends. No extra step needed — just let a UV leave-in replace your regular leave-in until fall.":
    "Un verano de sol puede cambiar el color y la textura de tus puntas. Sin pasos extra — solo deja que un leave-in con UV reemplace tu leave-in habitual hasta el otoño.",
  "Heat protectant before every hot tool": "Protector de calor antes de cada herramienta caliente",
  "Every pass of a hot tool on bare hair is cumulative damage — this is the one product never to skip. Try to sneak in a couple of heat-free days a week, too.":
    "Cada pasada de calor sobre cabello sin proteger es daño acumulado — este es el único producto que nunca se salta. Intenta colar un par de días sin calor a la semana, también.",
  "Any day a hot tool comes out between washes, a heat protectant goes on first.":
    "Cualquier día que salga una herramienta caliente entre lavados, primero va el protector de calor.",
  "Brush wavy hair its way": "Cepilla las ondas a su manera",
  "Waves get both options: detangle wet with a wet brush and conditioner in (the gentle default), or brush dry if you actually want softer, less-defined waves — dry brushing breaks up wave clumps on purpose. Either way, start at the ends and work upward.":
    "Las ondas tienen ambas opciones: desenreda en húmedo con cepillo y acondicionador puesto (la opción suave por defecto), o cepilla en seco si quieres ondas más suaves y menos definidas — cepillar en seco rompe los grupos de ondas a propósito. En ambos casos, empieza por las puntas y sube.",
  "Brush with a boar + nylon blend": "Cepillo mixto de jabalí + nailon",
  "Thick straight hair wants a boar + nylon blend: the boar distributes your scalp's natural oils for shine, and the nylon pins actually get through the density. Brush dry (wet hair is fragile for everyone — wide-tooth comb, gently, if you must), starting at the ends and working up.":
    "El cabello lacio y grueso quiere un cepillo mixto de jabalí + nailon: el jabalí reparte los aceites naturales del cuero cabelludo para dar brillo, y las púas de nailon sí atraviesan la densidad. Cepilla en seco (el cabello mojado es frágil para todos — peine de dientes anchos, con suavidad, si es necesario), empezando por las puntas y subiendo.",
  "Use the right brush (a wet one)": "Usa el cepillo correcto (uno para mojado)",
  "Curls and coils get a wet detangling brush at any density — flexible bristles that work through knots without snapping strands. Use it on wet hair with conditioner in, always from the ends up, and never brush this texture dry.":
    "Rizos y afros usan cepillo desenredante en húmedo a cualquier densidad — cerdas flexibles que deshacen nudos sin romper hebras. Úsalo en cabello mojado con acondicionador, siempre de puntas hacia arriba, y nunca cepilles esta textura en seco.",
  "Trim every 8–10 weeks": "Despunta cada 8–10 semanas",
  "Split ends travel upward — a regular dusting keeps damage from climbing the strand. It feels counterproductive when you want length; it isn't.":
    "Las puntas abiertas suben — un despunte regular evita que el daño trepe por la hebra. Se siente contraproducente cuando quieres largo; no lo es.",
  "Regular trims (yes, really)": "Despuntes regulares (sí, en serio)",
  "Trims don't make hair grow faster — they stop breakage from erasing the growth you already got. Keeping ends healthy is how length actually accumulates.":
    "Los despuntes no hacen crecer el cabello más rápido — evitan que el quiebre borre el crecimiento que ya lograste. Mantener las puntas sanas es como el largo de verdad se acumula.",
  "Night serum + a light oil": "Serum de noche + un aceite ligero",
  "Two-layer night step: serum first (hydrates and repairs), then a drop of lightweight oil over it (seals it in). Your hair recovers overnight instead of rubbing itself dry.":
    "Paso nocturno de dos capas: serum primero (hidrata y repara), y una gota de aceite ligero encima (lo sella). Tu cabello se recupera de noche en lugar de frotarse hasta resecarse.",
  "Scalp serum": "Serum para el cuero cabelludo",
  "A few drops along the part lines, massaged in for a minute with fingertips. Consistency beats quantity here.":
    "Unas gotas a lo largo de las líneas de la raya, masajeadas un minuto con las yemas. Aquí la constancia le gana a la cantidad.",
  "10-min scalp massage with oil": "Masaje capilar de 10 min con aceite",
  "Fingertips (never nails) or a scalp brush, working a growth oil or serum into the scalp for about 10 minutes. This is the anchor habit of the whole routine.":
    "Yemas (nunca uñas) o un cepillo de cuero cabelludo, trabajando un aceite o serum de crecimiento por unos 10 minutos. Este es el hábito ancla de toda la rutina.",
  "Loose braid + silk or satin": "Trenza floja + seda o satén",
  "A loose braid stops overnight tangling, and a silk/satin pillowcase or bonnet cuts the friction that causes breakage and frizz.":
    "Una trenza floja evita los enredos nocturnos, y una funda o gorro de seda/satén reduce la fricción que causa quiebre y frizz.",
  "Silk or satin pillowcase": "Funda de seda o satén",
  "Short hair gets off easy here — no braiding or pineapple needed. A silk/satin pillowcase (or bonnet) alone cuts the overnight friction that causes breakage and frizz.":
    "El cabello corto la tiene fácil aquí — sin trenzas ni piña. Una funda de seda/satén (o gorro) por sí sola reduce la fricción nocturna que causa quiebre y frizz.",
  "Pineapple + silk or satin": "Piña + seda o satén",
  "Gather curls into a loose, high “pineapple” pony to protect the pattern overnight, and sleep on silk or satin (pillowcase or bonnet).":
    "Recoge los rizos en una coleta alta y floja tipo “piña” para proteger el patrón de noche, y duerme sobre seda o satén (funda o gorro).",

  // ---- notes ----
  "The sweat rule (refined)": "La regla del sudor (afinada)",
  "Wash whenever works for you — there's no “correct” schedule. But if you sweat today (workout, hot day, anything), deal with it tonight — don't just let it air dry. Sweat, sebum, and salt sitting on the scalp for hours lead to buildup, odor, and irritation.":
    "Lava cuando te acomode — no existe un horario “correcto”. Pero si hoy sudaste (ejercicio, calor, lo que sea), resuélvelo esta noche — no dejes que solo se seque al aire. El sudor, el sebo y la sal por horas en el cuero cabelludo causan residuos, mal olor e irritación.",
  "Dry shampoo and a cool-air blow-dry at the scalp are both legit touch-ups between washes — but neither removes salt, sweat, or bacteria. They're stopgaps, not wash replacements.":
    "El shampoo en seco y el aire frío de la secadora en el cuero cabelludo son retoques válidos entre lavados — pero ninguno quita sal, sudor ni bacterias. Son parches, no reemplazos del lavado.",
  "Sweat every day? You still don't need a deep clean daily — but plain water alone won't cut it either (it doesn't remove sweat, salt, or oil). Use a gentle sulfate-free shampoo — one wash is enough on light-sweat days — or a gentler natural option like a raw-sugar scalp scrub or rosemary-vinegar rinse. Keep clarifying washes to a few times a week.":
    "¿Sudas todos los días? Aun así no necesitas limpieza profunda diaria — pero el agua sola tampoco alcanza (no quita sudor, sal ni grasa). Usa un shampoo suave sin sulfatos — un solo lavado basta en días de sudor ligero — o una opción natural más suave como exfoliante de azúcar sin refinar o enjuague de romero y vinagre. Limita los lavados clarificantes a unas pocas veces por semana.",
  "Air-drying isn't automatically “healthier”": "Secar al aire no es automáticamente “más sano”",
  "Hair swells when wet and contracts as it dries — and hours of staying wet (sleeping on wet hair, air-drying that drags on all day) slowly weakens its internal structure. It's called hygral fatigue, and medium/high-porosity hair feels it most.":
    "El cabello se hincha mojado y se contrae al secarse — y horas de humedad (dormir con el pelo mojado, un secado al aire que dura todo el día) debilitan lentamente su estructura interna. Se llama fatiga higral, y el cabello de porosidad media/alta la siente más.",
  "So don't avoid the blow dryer on principle: a quick, protected blow-dry — low heat, diffuser, heat protectant on first — can genuinely be gentler than hours of wetness. The rule of thumb is simply “avoid hours of wet,” not a specific timer.":
    "Así que no evites la secadora por principio: un secado rápido y protegido — baja temperatura, difusor, protector de calor primero — puede ser genuinamente más gentil que horas de humedad. La regla es simplemente “evita horas de mojado”, no un cronómetro específico.",
  "Oily-scalp bonus move: a partial blow-dry, pointing the dryer straight down at the roots only (never the lengths or ends), speeds up root drying and can slow how fast your scalp re-oils — with zero heat on your ends.":
    "Truco extra para cuero cabelludo graso: un secado parcial, apuntando la secadora directo a las raíces (nunca a los largos ni puntas), acelera el secado de la raíz y puede retrasar lo rápido que se vuelve a engrasar — con cero calor en tus puntas.",
  "Check your water before blaming your products": "Revisa tu agua antes de culpar a tus productos",
  "Hard water (high calcium/magnesium) leaves a mineral film that makes hair dull, dry, and hard to lather — and color-treated or bleached hair absorbs that buildup fastest, dulling and fading color sooner.":
    "El agua dura (alta en calcio/magnesio) deja una película mineral que apaga el cabello, lo reseca y dificulta hacer espuma — y el cabello teñido o decolorado absorbe esa acumulación más rápido, apagando y desvaneciendo el color antes.",
  "Hard water (high calcium/magnesium) leaves a mineral film over time that makes hair feel dull, dry, and harder to lather or rinse clean.":
    "El agua dura (alta en calcio/magnesio) va dejando una película mineral que hace que el cabello se sienta apagado, seco y más difícil de enjabonar o enjuagar.",
  "If you're in a hard-water area (most people don't know — a quick search for your city's water hardness settles it), a filtered showerhead is a one-time fix rather than another ongoing product, and it's especially worth it for color-treated hair.":
    "Si vives en zona de agua dura (la mayoría no lo sabe — una búsqueda rápida de la dureza del agua de tu ciudad lo resuelve), una regadera con filtro es un arreglo de una sola vez en lugar de otro producto permanente, y vale especialmente la pena para cabello teñido.",
  "2-in-1s: fine as a shampoo, bad as your conditioner": "Los 2-en-1: bien como shampoo, mal como tu acondicionador",
  "2-in-1s are only a problem when they do BOTH jobs — using one as your conditioner replacement long-term shortchanges your hair. Used purely as a shampoo, they're fine.":
    "Los 2-en-1 solo son un problema cuando hacen AMBOS trabajos — usarlos como reemplazo del acondicionador a largo plazo le queda corto a tu cabello. Usados puramente como shampoo, están bien.",
  "Standout: Head & Shoulders Tea Tree 2-in-1 is a genuinely good medicated wash for dandruff and itchy scalps. If medicated shampoo ever feels too intense, make it just the SECOND wash of a double-wash day instead of both washes.":
    "Destacado: el 2-en-1 de árbol de té de Head & Shoulders es un lavado medicado genuinamente bueno para caspa y picazón. Si el shampoo medicado se siente muy intenso, úsalo solo como el SEGUNDO lavado de un día de doble lavado, no en ambos.",
  "Skip the tight hairstyles": "Evita los peinados apretados",
  "Slicked-back ponies and tight braids pull on exactly the hairline you're trying to protect. Keep styles loose while you rebuild density.":
    "Las coletas tirantes y las trenzas apretadas jalan exactamente la línea del cabello que intentas proteger. Mantén los peinados sueltos mientras recuperas densidad.",
  "Sometimes the cause isn't the routine at all. The unglamorous basics — 7+ hours of sleep, staying hydrated, managing stress — show up again and again in hair-shedding research.":
    "A veces la causa no es la rutina. Lo básico sin glamour — 7+ horas de sueño, hidratarte, manejar el estrés — aparece una y otra vez en la investigación sobre caída del cabello.",
  "And if shedding is sudden, patchy, or persistent, it's worth asking a doctor about bloodwork (iron/ferritin, vitamin D, B12, zinc, thyroid). Not a diagnosis — just worth checking so you're not fighting a nutrient gap with shampoo.":
    "Y si la caída es repentina, en parches o persistente, vale la pena pedir análisis de sangre (hierro/ferritina, vitamina D, B12, zinc, tiroides). No es un diagnóstico — solo vale revisarlo para no pelear contra una deficiencia con shampoo.",
  "About biotin gummies: extra biotin only meaningfully helps if you're actually deficient — which is uncommon with a reasonably varied diet. If concerns persist despite a solid routine, that bloodwork is the useful move, not guessing with supplements.":
    "Sobre las gomitas de biotina: la biotina extra solo ayuda de forma significativa si de verdad tienes deficiencia — algo poco común con una dieta razonablemente variada. Si el problema persiste pese a una buena rutina, el análisis de sangre es la jugada útil, no adivinar con suplementos.",
  "Bleached hair plays by porosity rules": "El cabello decolorado se rige por la porosidad",
  "Bleached hair is usually high-porosity — it drinks moisture in and loses it just as fast. That's why your layering order is LCO (cream before oil), and why bond treatments should be a fixture in your routine, not a treat.":
    "El cabello decolorado suele ser de alta porosidad — bebe la hidratación y la pierde igual de rápido. Por eso tu orden de capas es LCO (crema antes que aceite), y por eso los tratamientos de enlaces deben ser fijos en tu rutina, no un premio ocasional.",
  "Worth a look on the Luxury tab: Pureology Strength Cure Blonde — a violet-toning shampoo/conditioner system built for exactly this, toning brassiness while repairing lightened hair.":
    "Vale la pena mirar en la pestaña Lujo: Pureology Strength Cure Blonde — un sistema de shampoo/acondicionador con tono violeta hecho exactamente para esto, matizando el anaranjado mientras repara el cabello aclarado.",
  "About that daily heat…": "Sobre ese calor diario…",
  "Cumulative heat is the quiet killer of ends. Protectant every single time, and try to swap in air-drying or heatless styles a couple of days a week — your future ends will thank you.":
    "El calor acumulado es el asesino silencioso de las puntas. Protector todas y cada una de las veces, e intenta cambiar a secado al aire o peinados sin calor un par de días a la semana — tus puntas futuras te lo agradecerán.",
  "For the flakes you mentioned": "Para esas escamas que mencionaste",
  "Rotate a medicated shampoo (pyrithione zinc or ketoconazole — Head & Shoulders or Nizoral) into your washes about twice a week. Use it as the second wash so it reaches skin instead of sitting on buildup, and keep the water warm, never hot.":
    "Rota un shampoo medicado (zinc piritiona o ketoconazol — Head & Shoulders o Nizoral) en tus lavados unas dos veces por semana. Úsalo como segundo lavado para que llegue a la piel en lugar de quedarse sobre los residuos, y mantén el agua tibia, nunca caliente.",
  "If flakes are painful, spreading, or haven't budged after a month of medicated washes, that's a dermatologist visit — not another product.":
    "Si las escamas duelen, se extienden o no han cedido tras un mes de lavados medicados, eso es visita al dermatólogo — no otro producto.",
  "Before your next color appointment": "Antes de tu próxima cita de color",
  "At-home box dye contains metallic salts that build up in hair and can react unpredictably with future bleach or bond-repair services — sometimes causing gumminess or breakage.":
    "El tinte de caja casero contiene sales metálicas que se acumulan en el cabello y pueden reaccionar impredeciblemente con futuras decoloraciones o servicios de reparación de enlaces — a veces causando textura chiclosa o quiebre.",
  "Use a clarifying/chelating shampoo (like L'Oréal Metal Detox) for a few washes before any future bleach or salon color, and always mention the box dye history to your stylist so they can strand-test first.":
    "Usa un shampoo clarificante/quelante (como L'Oréal Metal Detox) durante algunos lavados antes de cualquier decoloración o tinte de salón, y siempre menciona el historial de tinte de caja a tu estilista para que haga prueba de mechón primero.",
  "Relaxed or permed hair needs gentle handling": "El cabello alaciado o permanentado necesita trato suave",
  "Chemically restructured hair is most fragile when wet — detangle slowly with a wide-tooth comb, keep bond care regular, and space out any further chemical services.":
    "El cabello reestructurado químicamente es más frágil mojado — desenreda despacio con peine de dientes anchos, mantén el cuidado de enlaces constante y espacia cualquier servicio químico adicional.",
  "Protect that keratin treatment": "Protege ese tratamiento de keratina",
  "Sulfates strip smoothing treatments early — stick to sulfate-free washes to get your money's worth.":
    "Los sulfatos desgastan los alisados antes de tiempo — quédate con lavados sin sulfatos para que tu inversión rinda.",
  "Sensitive-scalp ground rules": "Reglas base para cuero cabelludo sensible",
  "Favor fragrance-light formulas, patch-test anything new behind your ear for a day or two, and keep rinse water warm rather than hot.":
    "Prefiere fórmulas con poca fragancia, prueba todo lo nuevo detrás de la oreja un día o dos, y enjuaga con agua tibia en lugar de caliente.",
  "Not sure about your hair yet? Start light": "¿Aún no conoces tu cabello? Empieza ligero",
  "Use half the product you think you need — you can always add more. If hair falls flat by midday, your products are too heavy; if the ends still feel thirsty, go a step richer.":
    "Usa la mitad del producto que crees necesitar — siempre puedes agregar más. Si el cabello se aplasta a mediodía, tus productos pesan mucho; si las puntas siguen sedientas, sube un nivel de riqueza.",
  "A cream or oil over everything locks the style in — LOC order applies here too.":
    "Una crema o aceite sobre todo lo demás fija el peinado — el orden LOC también aplica aquí.",
  "A cream or oil over everything locks the style in — LCO order applies here too.":
    "Una crema o aceite sobre todo lo demás fija el peinado — el orden LCO también aplica aquí.",

  // ---- principle summaries + option blocks ----
  "Oil on your mid-lengths and ends 10–20+ minutes before shampooing cuts friction and breakage during the wash. Every hair type can benefit.":
    "Aceite de medios a puntas 10–20+ minutos antes del shampoo reduce la fricción y el quiebre durante el lavado. Todo tipo de cabello puede beneficiarse.",
  "There's no fixed wash schedule — wash whenever works for you. One firm rule: if you sweat today, deal with it tonight.":
    "No hay horario fijo de lavado — lava cuando te acomode. Una regla firme: si hoy sudaste, resuélvelo esta noche.",
  "Only the scalp actually needs washing — that's where oil, sweat, and buildup live. The lather rinsing through is enough for your lengths.":
    "Solo el cuero cabelludo necesita lavarse de verdad — ahí viven la grasa, el sudor y los residuos. La espuma que baja al enjuagar es suficiente para tus largos.",
  "Skipping conditioner doesn't prevent breakage — it causes it. Unconditioned hair tangles more, and tangles plus friction are exactly how hair snaps.":
    "Saltarte el acondicionador no evita el quiebre — lo causa. El cabello sin acondicionador se enreda más, y enredos más fricción son exactamente la forma en que el cabello se rompe.",
  "One rule for everyone: always detangle from the ends and work up toward the roots — never drag from the root down through a tangle.":
    "Una regla para todos: desenreda siempre desde las puntas y sube hacia la raíz — nunca arrastres de la raíz hacia abajo a través de un nudo.",
  "If your scalp feels heavy with product, sweat, or buildup — shampoo twice. Most people skip this without realizing.":
    "Si tu cuero cabelludo se siente cargado de producto, sudor o residuos — lava dos veces. La mayoría se lo salta sin darse cuenta.",
  "It's about blood flow: massage boosts circulation to the follicles, which carries more oxygen and nutrients to where hair is actually built.":
    "Se trata del flujo sanguíneo: el masaje aumenta la circulación hacia los folículos, llevando más oxígeno y nutrientes a donde el cabello realmente se construye.",
  "You move a lot in your sleep — hours of hair rubbing on fabric and on itself is real, cumulative breakage and frizz.":
    "Te mueves mucho al dormir — horas de cabello frotándose contra la tela y contra sí mismo son quiebre y frizz reales y acumulativos.",
  "K18 is a luxury product that's worth it even on a budget — science-backed, and nobody has successfully duped it. A little goes far, so use it right:":
    "K18 es un producto de lujo que vale la pena incluso con presupuesto ajustado — respaldado por la ciencia, y nadie ha logrado un dupe real. Rinde mucho, así que úsalo bien:",
  "After the 4 minutes you've got two good options — don't skip this part out of confusion:":
    "Después de los 4 minutos tienes dos buenas opciones — no te saltes esta parte por confusión:",
  "Leave it in": "Déjalo puesto",
  "Go straight to your leave-in conditioner and styling products. This is K18's official “leave-in treatment” use.":
    "Pasa directo a tu leave-in y productos de peinado. Este es el uso oficial de K18 como “tratamiento sin enjuague”.",
  "Rinse + condition": "Enjuaga + acondiciona",
  "Rinse the K18 out, then apply your regular conditioner, wait however long that conditioner calls for, and rinse it out too. A lot of people find this gives noticeably softer hair and get more out of the K18 than skipping conditioner entirely — which is what most people accidentally do. The “no conditioner” rule in step 1 is only about before the treatment, not after.":
    "Enjuaga el K18, aplica tu acondicionador habitual, espera lo que ese acondicionador indique y enjuágalo también. Mucha gente nota el cabello bastante más suave así y le saca más al K18 que saltándose el acondicionador por completo — que es lo que la mayoría hace sin querer. La regla de “sin acondicionador” del paso 1 es solo antes del tratamiento, no después.",
  "UV exposure can visibly change the color and texture of your ends over a single summer — especially on color-treated hair.":
    "La exposición UV puede cambiar visiblemente el color y la textura de tus puntas en un solo verano — sobre todo en cabello teñido.",
  "At-home box dye contains metallic salts that can build up in hair and react unpredictably with future bleach or bond-repair services — sometimes causing gumminess or breakage.":
    "El tinte de caja casero contiene sales metálicas que pueden acumularse en el cabello y reaccionar impredeciblemente con futuras decoloraciones o servicios de reparación de enlaces — a veces causando textura chiclosa o quiebre.",
  "A three-layer system for locking in moisture — especially useful for curly, coily, or dry hair.":
    "Un sistema de tres capas para sellar la hidratación — especialmente útil para cabello rizado, afro o seco.",
  "Sometimes the cause isn't the routine at all — the basics below matter more than any product.":
    "A veces la causa no es la rutina — lo básico de abajo importa más que cualquier producto.",
  "HairIQ gives cosmetic styling guidance, not medical treatment.":
    "How Is My Hair ofrece orientación cosmética de peinado, no tratamiento médico.",
};
