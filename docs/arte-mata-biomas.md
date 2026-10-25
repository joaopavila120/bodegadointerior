# Arte da Mata de Araucárias

Artes geradas com `imagegen`, modo `stylized-concept`. Arquivos originais PNG preservados em `assets/images/mata/`. Recortes e escalas são aplicados pelo Canvas/SVG, sem alterar os originais. O cenário usa blocos de terreno de 512 px com cache limitado, não uma imagem gigante por trecho.

## Regiões

- 1: o pinheiral do Garibaldi (mapa desenhado à mão), sempre manso, com o refúgio.
- 2–11: Pinheiral. Araucárias, erva-mate nativa e pinhão; chefe no 11, o Javali Cachaço.
- 12–21: Encosta da Serra. Árvores de folha larga, xaxim e jerivá (`tree-varieties-v1`, `regional-flora-v1`), ponte de corda (`mata-cliffs-v1`); chefe no 21, o Lagarto do papo-amarelo.
- 22–31: Restinga. Picadas de areia, butiazais e jerivás, sanga com ponte de tábua (`pier-v1`); do 28 em diante, a praia e o mar.
- Depois do 31: a Barra de Laguna e o navio imperial (convés e lanchão desenhados no Canvas, barco de `pier-v1`, bois de `campo/bois.png`).

Mata adentro é sempre noite: o escuro não muda com a hora do jogo. Acampamentos nos trechos 6, 11, 16, 21, 26 e 31. Não há placa de número de trecho no caminho.

## Referências visuais

- [Retrato de Garibaldi — Museo Fattori](https://www.museofattori.livorno.it/le-opere/catalogo/ritratto-di-giuseppe-garibaldi/)
- [Garibaldi de camisa vermelha — Musei di Genova](https://catalogo.museidigenova.it/oggetti/230300-ritratto-di-giuseppe-garibaldi-in-camicia-rossa?i=55)
- [Cânions — Cambará do Sul](https://www.cambaradosul.rs.gov.br/turismo_int.php?id=14&tipo=3)
- [Parque da Guarita — Torres](https://torres.rs.gov.br/viva/parque-estadual-da-guarita/)

As imagens são interpretações para o jogo, não reconstruções históricas ou mapas geográficos.

## Prompts utilizados

As peças adicionais de paredões, ponte e fauna estão documentadas em [arte-mata-complementos.md](arte-mata-complementos.md). Prévias capturadas no jogo ficam em `docs/previews/mata-*.png`.

### garibaldi-ghost-v1.png

Use case: stylized-concept. Game sprite sheet, detailed hand-crafted pixel art for a Brazilian gaucho RPG, elevated front-facing 3/4 camera. TRUE TRANSPARENT background. Exactly 4 columns by 2 rows equally sized cells, 1536x1024 canvas. Same full-body Giuseppe Garibaldi ghost in all 8 cells, consistent height and anatomy, no labels. Russet wavy hair and full beard, dark cap, faded red shirt, striped brown gaucho poncho over shoulder, leather belt; softly luminous pale cyan edges and lower legs dissolving into ghostly mist, expressive friendly face. Row1: front idle then three front walking poses. Row2: right-facing profile idle then three rightward walking poses. Body occupies about 80% of each cell's height with generous transparent gutters. Coherent anatomy, hands and swinging legs or boot outlines visible through ghostly mist; restrained glow, crisp pixel clusters, warm-red clothing still legible. No weapons raised, no text, no contact sheet lines, no scenery.

### garibaldi-refuge-exterior-v1.png

Use case: stylized-concept. Single exterior building sprite for a top-down 3/4 Brazilian gaucho RPG, true TRANSPARENT background, 1536x1024. Giuseppe Garibaldi's secluded Farrapo refuge in an araucaria forest. Handmade nineteenth-century refuge with irregular basalt-stone base, weathered dark timber walls, modest terracotta tiled gabled roof with patches of wooden shingles and moss, short stone chimney, warm lantern and open central entrance under a small porch. A red wool poncho, coiled ship rope, an oar and old trunk on porch suggest an Italian revolutionary sailor living in nature. Small green shutters, fern pots, modest climbing ivy. Distinct silhouette, snug rustic cabin, NOT a modern mansion, NOT a shop, NOT military barracks. Whole building visible, straight front facade with roof visible from above at about 35 degrees, center doorway at bottom middle. Detailed premium pixel art with clear chunky pixel clusters, warm earth palette, same scale as other gaucho RPG buildings. No people, no trees occluding, no signs, no letters, no background ground rectangle.

### garibaldi-refuge-interior-v1.png

Use case: stylized-concept. New unique hand-crafted detailed pixel-art interior game background, 1536x1024, elevated top-down 3/4 orthographic camera, cutaway front wall. A secluded forest refuge of Giuseppe Garibaldi, Italian hero of the Farrapos. A single cozy rustic room with compacted earth floor, dark timber rafters, pale irregular basalt stone back wall, warm amber lanterns, muted burgundy and olive fabrics. Layout MUST preserve generous walkable empty center: rear-left a narrow campaign cot with rolled red blanket at x150..390,y240..490; rear-middle a desk bearing an old nautical map, quill, compass and rolled papers at x570..900,y230..360; rear-right rustic open equipment shelves with ropes, lantern, leather bag at x1050..1350,y190..360. Left wall antique oar, leather saddlebag and a hanging red poncho. Right-middle a small stone fireplace at x1220..1430,y400..590 with a kettle; lower-left a closed trunk x130..330,y620..730. Small framed monochrome portrait, no readable text. Bottom wall at y790..925, centered OPEN doorway x660..875 leading down to y985, walls left/right. Center floor x420..1180,y400..760 entirely empty for character and movement. Outside room dark brown near black. Full room visible without cropping. Beautiful coherent material scale, no people, no UI, no large flags, no modern objects. Distinct from Sadi house, historical explorer's refuge not a duplicate home.

### mata-nature-v1.png

Use case: stylized-concept. Production pixel-art asset atlas for a Brazilian gaucho forest RPG, TRUE TRANSPARENT background, 1536x1536, exactly 4 columns x4 rows, each isolated object centered in its equal 384x384 cell, generous gutters, NO labels, NO borders. Elevated 3/4 top-down game camera, detailed crisp pixel clusters, consistent earthy palette and warm light upper left. Read left to right: row1 (1) mature realistic umbrella araucaria tree with high tiered spreading crown and long russet trunk (2) broad lush fern and leaf litter clump (3) irregular mossy basalt boulder cluster (4) fallen decaying log with moss and small fungi. Row2 (5) large green-brown round araucaria cone fallen beside loose glossy brown pinhao seeds (6) native yerba-mate bush with oval shiny leaves (7) hollow tree stump with tiny jatai honey entrance tube (8) tangled vines hanging between two wooden stumps as a trail obstacle. Row3 (9) paper wasp nest attached to a crooked dead branch (10) reed sedge clump with muddy roots (11) small rustic canvas lean-to shelter on sticks with rolled blanket (12) traditional wood-fired barbaqua yerba drying rack with green branches on poles and ember pit below. Row4 (13) tall layered basalt canyon wall segment with grassy mossy top, vertical columns, dark lower cracks, no floating island (14) curved wind-blown dune grass and white sand at roots (15) dark coastal basalt rock cluster with lichen (16) old rope ladder tied to two posts. All items individually fully visible and separate. No scenes, no people, no monsters, no floor panels. Tree and cliff largest within their cells.

### mata-gear-v1.png

Use case: stylized-concept. Inventory pixel-art sprites, TRUE TRANSPARENT background, 1536x1536, precisely 4 columns x4 rows of isolated icons with equal 384x384 cells. Crisp premium pixel-art clusters, warm wood, leather, copper and olive palette, coherent readable silhouettes, generous transparent gutters, NO words or numbers or gridlines. Row1 left to right: rustic machete with wooden grip; pair rawhide boots; leather shoulder satchel picua; coiled hemp rope. Row2: beekeeper tin smoke bellows fumaceiro; pair leather shin gaiters; woven straw hat; brass kerosene lantern. Row3: rolled rope ladder; small brass dog whistle; cup of marcela herbal tea with yellow flowers; tied carqueja herb sprigs. Row4: dark brown roll of tobacco tied with twine; glowing pinewood ember torch; freshly cut leafy yerba-mate branches tied together; glass jar of golden jatai honey with cloth lid. Slight 3/4 view, no backgrounds or shadows outside each icon, not photorealistic, no emoji.

### mata-terrain-v1.png

Use case: stylized-concept. Terrain texture atlas for a top-down pixel-art RPG in southern Brazil. Exactly 3 columns x2 rows filling 1536x1024, six equal seamless 512x512 square material swatches. NO gutters, NO labels, NO objects, NO perspective, directly overhead texture only, restrained contrast, detailed pixel clusters (roughly 3px blocks). Top row left to right: dark olive mossy forest floor with brown araucaria needle litter; warm compacted brown forest trail with small stones; cool grey-purple volcanic basalt and scree floor. Bottom row left to right: muted grassy green highland meadow with short tufts; pale warm ivory beach sand with delicate wind ripples; deep muted teal coastal water texture with sparse foam freckles. Each square tiles on its own, consistent soft light and game art style, avoid noise overload and photographic texture. Used under game sprites and masked to procedural paths. No giant rocks, no shorelines, no roads, no illustrations.

