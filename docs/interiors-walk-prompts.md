# Interiores e caminhadas

Artes geradas com a ferramenta imagegen integrada (modo built-in). Originais copiados sem alterar os pixels; recortes e pontos de apoio são metadados. O README não foi alterado.

Caminhadas: `assets/images/walk/` (Sadi e 14 especiais, 12 poses por folha; esquerda por espelhamento). Sadi conserva o ciclo lateral externo de oito quadros já existente. Carregamento em segundo plano e cache limitado; falha de imagem usa os sprites anteriores.

Interiores: `assets/images/world/interior-*-v2.png`. Pisos e paredes com texturas discretas; ferragem, cozinha, camas, objetos pessoais, igrejas e salão. Recortes em `js/render/world-art-crops.js`.

## Prompts de caminhada

Create a production pixel-art WALK ANIMATION SPRITE SHEET on transparent alpha background. Reference is only character identity/style, not a sheet to copy. EXACTLY 12 full body sprites in a strict grid of FOUR equal columns and THREE equal rows, 1536x1024 landscape. Row 1: walking toward viewer/down screen. Row 2: walking horizontally RIGHT, true profile. Row 3: walking away/up screen, back of head and back of clothes, NO face visible. In EACH row the four consecutive poses form a calm complete gait: left foot contact, passing feet close, right foot contact, passing feet close. Alternate bent knees/ankles and opposite arm swing naturally, no running, no wide splits. Constant body/head size, same spine center x within every cell, common foot baseline within each row, consistent head-to-foot height about 285 pixels, 5.5 head adult proportions NOT CHIBI. Subtle one-pixel head bob only. Clear separate feet in every pose. Generous transparent gutters on all four sides of each cell, all hats/boots/hands INSIDE own cell. Camera elevated about 30 degrees like a rural top-down RPG. Retain exact original face, hairstyle, outfit, accessories, body build and colors. Crisp warm 32-bit pixel art, colored outlines and coherent upper-left lighting. NO text, labels, borders, checkerboard or floor.

Create a production pixel-art WALK ANIMATION SPRITE SHEET on transparent alpha background. Use the provided original sprite as character identity reference. EXACTLY 12 full body sprites in a strict FOUR columns x THREE rows grid, landscape 1536x1024. Row1 walking toward viewer/DOWN. Row2 walking RIGHT true profile. Row3 walking UP away from viewer, back of head/clothes, NO visible face. Each row is four consecutive natural gait frames: left foot contact, passing feet close, right foot contact, passing feet close. Modest steps, alternate bent knees/ankles, opposite arm swing, no running. Identical head/body proportions and scale in EVERY cell, centered spine, same foot baseline, head-to-foot height about 285px, natural adult 5.5 head proportions, NOT chibi. Preserve original recognizable face, hair, clothing colors and body build. All sprites fully contained inside their own cells with wide transparent gutters. Elevated 30 degree RPG camera, crisp warm detailed pixel art and colored outlines, upper left lighting. NO labels, text outside clothing, grid lines, backgrounds, shadows beyond feet, checkerboard.

### sadi

Referência de identidade: `assets/images/people.webp`. Saída: `assets/images/walk/sadi.png`.

Use ONLY the TOP LEFT man: Sadi with dark wavy hair and beard, cream rolled-sleeve shirt, red neckerchief, off-white apron over dark charcoal bombacha trousers and brown boots. Empty hands, naturally relaxed arms. Ignore other people in reference.

### valter

Referência de identidade: `assets/images/people.webp`. Saída: `assets/images/walk/valter.png`.

Use ONLY the BOTTOM RIGHT man: Valter with black moustache and short side-parted black hair, olive green shirt, dark brown trousers and brown boots. Ignore every other person.

### badin

Referência de identidade: `assets/images/badin.webp`. Saída: `assets/images/walk/badin.png`.

Badin, straw hat, dark beard, gray plaid shirt, dark brown baggy bombachas, BLUE rubber boots with yellow cuffs and yellow soles. Keep his exact build.

### guri

Referência de identidade: `assets/images/guri.webp`. Saída: `assets/images/walk/guri.png`.

Guri, black beret, curly brown hair and large moustache, black shirt, vivid red scarf, decorated leather belt, tricolor sash, black bombachas and brown boots. Keep his ornate long mate gourd in one hand while that arm stays steady; free arm swings naturally.

### marcio

Referência de identidade: `assets/images/marciomarcelo.webp`. Saída: `assets/images/walk/marcio.png`.

Use ONLY the LEFT twin wearing RED polo shirt, blue jeans, brown shoes, black short upright hair. Hands relaxed and swinging, not thumbs-up pose. Do not draw yellow-shirt brother.

### marcelo

Referência de identidade: `assets/images/marciomarcelo.webp`. Saída: `assets/images/walk/marcelo.png`.

Use ONLY the RIGHT twin wearing YELLOW polo shirt, blue jeans, brown shoes, black short upright hair. Hands relaxed and swinging, not thumbs-up pose. Do not draw red-shirt brother.

### indavirus

Referência de identidade: `assets/images/indavirus`. Saída: `assets/images/walk/indavirus.png`.

Black blazer, black tie, white shirt with blue spots, black shorts with tiny white dots, bare lower legs, black shoes, black rectangular glasses, brown swept up hair. Hold microphone steady in one hand; other arm swings.

### lauro

Referência de identidade: `assets/images/lauro`. Saída: `assets/images/walk/lauro.png`.

Stocky heavy build, brown brimmed hat, black sunglasses, cream short sleeved button shirt worn untucked, dark gray trousers and brown shoes. Arms relaxed walking, not thumbs-up.

### peixinhonabrasa

Referência de identidade: `assets/images/peixinhonabrasa`. Saída: `assets/images/walk/peixinhonabrasa.png`.

Black baseball cap with tiny fish emblem, black sunglasses, gray printed T-shirt, blue jeans, dark sneakers with white soles. Arms relaxed walking, not thumbs-up.

### manolima

Referência de identidade: `assets/images/manolima`. Saída: `assets/images/walk/manolima.png`.

Older gaucho with white swept back hair and full white beard, sky blue shirt, red neckerchief over shoulders, dark brown bombachas, tall brown boots. Keep mate gourd in one hand steady.

### dianho

Referência de identidade: `assets/images/dianho`. Saída: `assets/images/walk/dianho.png`.

Light brown tousled medium hair, navy T-shirt with pale thin horizontal stripes on bottom half, tattooed forearms, silver pendant, dark trousers and navy sneakers. BOTH hands lowered naturally for walking, not chin touching.

### mitodosul

Referência de identidade: `assets/images/mito`. Saída: `assets/images/walk/mitodosul.png`.

Short blond hair, large dark headphones, Grêmio blue black white vertically striped football jersey, blue jeans and black sneakers.

### loligebien

Referência de identidade: `assets/images/loligarbien`. Saída: `assets/images/walk/loligebien.png`.

Red and green German festive hat with black feather, light gray T-shirt, sunglasses hanging from collar, dark trousers, brown shoes. Keep beer mug upright in one hand, other arm swings.

### jayme

Referência de identidade: `assets/images/jayme`. Saída: `assets/images/walk/jayme.png`.

Older man with gray mustache, black wide brimmed gaucho hat with chin strap, dark navy shirt, red neckerchief, tan brown baggy bombachas, tall dark brown boots.

### baitaca

Referência de identidade: `assets/images/baitaca`. Saída: `assets/images/walk/baitaca.png`.

Large brown wide brim hat, long curly black hair, dark full beard streaked gray at chin, blue gray plaid shirt, red scarf, wooden cross pendant, dark brown bombachas and brown boots.

## Prompts dos interiores

### interior-details-v2

Create a transparent pixel art SPRITE ATLAS for a rural Brazilian top-down RPG interior, landscape 1536x1024, exactly 12 isolated props in a strict FOUR columns x THREE rows grid, generous gutters, no touching neighboring cells. Consistent 40 degree elevated camera, front edges horizontal, NOT isometric, readable broad top surfaces. Detailed crisp warm pixel clusters, muted earthy wood and natural fabric, dark brown outlines, upper left light, same style throughout. Row1: three burlap grain sacks stacked on a small wooden pallet; two golden straw hay bales tied with rope; stack of wooden beverage crates filled with small green glass bottles; wall rack of hoe, spade and rake with wooden handles. Row2: carpenter tool board with hammer hand saw and plane; LONG NARROW BAR counter with its long axis pointing NORTH SOUTH in topdown view, polished wood top and bottle rack, seen from above so we see top and short south front, no chairs; small blue-robed saint statue on stone pedestal; small red-robed saint statue on stone pedestal. Row3: tall pointed arch stained glass church window in old stone frame; circular stained glass rose window in stone frame; carved wooden wall crucifix; antique wood framed cream wall poster with exact text 'GÂNGSTER DE GALPÃO'. Each fully contained in own cell, transparent outside objects. No cast shadow backgrounds, no labels besides poster.

### interior-materials-v2

Production 2D pixel-art MATERIAL ATLAS for cozy rural Brazilian topdown RPG interiors. Landscape image 1536x1024, EXACT 3 columns x 2 rows of square 512x512 tiles, no margins or gutters, tiles fill every pixel and share strict boundaries. Each tile is a seamless repeating surface texture, NO objects, NO perspective vanishing point, uniform orthographic surface. Low visual noise and subtle contrast, crisp detailed pixel clusters, restrained warm earthy colors. Top row from left: aged honey brown narrow wooden floorboards with subtle varied grain and staggered seams; small cream and muted sage ceramic kitchen floor tiles with worn grout, understated checker pattern; pale warm gray rectangular irregular flagstone flooring, stones flat and lightly worn, not giant rough outdoor cobblestones. Bottom row from left: warm neutral matte old concrete floor with very subtle speckles and seams; off-white aged lime plaster wall with very subtle mottling, no bricks; dark walnut wooden wainscot wall paneling with narrow vertical boards. Surface only, no text, no decorative borders, no lighting gradients, no shadows, no image background. All 6 tiles same readable pixel density, subdued enough for characters and furniture to stand out.

### interior-flags-v2

Transparent pixel art atlas, landscape1536x1024, strict FOUR columns THREE rows with twelve separate wall decorations centered each cell, generous gutters. Detailed handcrafted pixel art aged fabric flags and wooden frames for cozy rural southern Brazil homes, restrained colors and tiny cloth folds, straight-on wall view. Row1: rectangular Rio Grande do Sul flag with green upper-left red diagonal gold lower-right and small central oval emblem; Uruguay flag white and blue horizontal stripes sun canton; Italian flag vertical green white red; German flag horizontal black red gold. Row2: red white red horizontal football supporter pennant; blue black white vertically striped football supporter banner; Northern Ireland Ulster Banner white with red cross central white sixpoint star red hand tiny crown; rustic framed landscape of gaucho rolling green hills with araucaria. Row3: framed small sepia family photograph; framed tiny still life of grapes and bread; wall-mounted fishing rod rack with three slim rods reels and fine lines; small warm brass kerosene wall lantern. No text, no scenery behind decorations, no pole or floor, each object completely isolated. Every frame/flag fully visible, no overlap. Transparent alpha exterior.

### interior-fittings-v2

Create a production sprite atlas for a cozy southern Brazilian rural RPG, transparent background, 1536x1024 canvas, THREE columns TWO rows, exactly SIX fully isolated objects with wide transparent gutters. Consistent detailed pixel art, warm restrained wood/cream/green palette, view looking down about 40 degrees, front edges horizontal (NOT isometric). Top row left: tall broad old wooden hardware store shelving stocked with small cast iron sandwich press, stainless coffee maker, cookware, brass taps, boxes and hand tools, recognizable upgrades for a bodega. Top middle: a cream enamel kitchen sink cabinet with wooden countertop, steel sink and gooseneck faucet, dish rack and earthenware jars. Top right: double wooden rustic bed, headboard toward top of image, quilt folded down, two white pillows, blue green quilt, seen clearly from ABOVE with short footboard. Bottom left: antique wooden wardrobe with two doors and lower drawers, seen slightly from above. Bottom middle: wooden wall window with open shutters, countryside glimpse, lace curtains and small windowbox. Bottom right: comfortable green fabric armchair with wood frame, seen from above 40 degrees. No text, labels, floors, walls, people, shadows outside silhouettes, or environment. Pixel clusters and crisp readable silhouettes. Objects drawn complete, separate, not overlapping, adult human scale visual relationships.
