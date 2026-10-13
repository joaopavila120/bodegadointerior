# Sadi com bandeja e fachada da bodega

Gerados com a ferramenta imagegen integrada. PNGs originais preservados; recortes e pontos de apoio são metadados lidos offline.

- [Sadi caminhando com bandeja](../assets/images/sadi-tray-walk-v1.png)
- [Sadi em repouso, com e sem bandeja](../assets/images/sadi-idle-v1.png)
- [Galpão da bodega](../assets/images/world/architecture-bodega-galpao-v1.png)

Os produtos são desenhados separadamente sobre a bandeja, com posições próprias para cada direção. A vista de costas esconde os produtos atrás do corpo. O mesmo modelo vale para um ou dois itens, parado e em movimento. Os atlas de caminhada sem bandeja existentes continuam em uso.

A fachada fica ancorada no centro da entrada; o retângulo compartilhado do mapa mantém colisões, caminhos e interações alinhados. As luzes noturnas acompanham os lampiões e as janelas da nova arte.

## Prompts

### sadi-tray-walk-v1

Referência: `assets/images/walk/sadi.png`.

Use case identity-preserve, production pixel art animation sprite atlas. The reference sheet is the NEW Sadi identity and proportions: preserve his face, curly dark hair, beard, red neckerchief, cream shirt and apron, dark bombacha trousers and brown boots EXACTLY. Make a matching sheet with Sadi WALKING WHILE HOLDING AN EMPTY SERVING TRAY IN BOTH HANDS at waist / lower chest height. Hands are drawn naturally gripping the left and right edges from underneath. Tray is shallow oval warm wood, visible top surface, EMPTY so game draws food later. Twelve full-body sprites in FOUR columns THREE rows, landscape1536x1024 transparent background. Row1 four frames facing DOWN towards viewer: left foot forward, feet passing close together, right foot forward, opposite passing. Row2 same four gait frames facing RIGHT true profile, tray extends forward from bent elbows. Row3 same four gait frames facing UP away, back of head and apron straps, tray ahead of torso mostly occluded but its outer edges can be visible. Every gait has distinct leg positions, keep steps small and calm, feet passing frames essential. Do not swing arms: keep both hands fixed to tray. Same head size and head-to-boot height approx285px across ALL poses, natural adult5.5head proportions NOTchibi. Same center spine and foot baseline within each cell, wide transparent gutters. Camera elevated30degrees like reference RPG. Crisp colored pixel outlines, earthy subdued colors. Do not draw food, floor, text, labels, background, shadow halo or extra hands. Full figure in every cell.

### sadi-idle-v1

Referência: `assets/images/walk/sadi.png`.

Use case identity-preserve. Production pixel art idle sprite atlas matching the attached NEW Sadi walk sheet EXACTLY: same face, curly dark hair, beard, cream shirt and apron, red scarf, charcoal bombacha pants, brown boots, same adult proportions, NOTchibi. Create SIX FULL BODY IDLE poses in THREE columns TWO rows on1536x1024 transparent canvas. All have BOTH feet planted side by side, relaxed standing with no step, consistent scale and head height. TOP ROW: empty hands facing DOWN toward viewer, empty hands facing RIGHT true profile, empty hands facing UP back to viewer. BOTTOM ROW: same three directions but BOTH HANDS support a shallow EMPTY oval wooden serving tray at waist/lower chest height, fingers gripping under its outer edges. Right view tray projects forward from bent elbows, up view tray lies ahead of torso and is mostly occluded by body with outer edges visible. NO food in tray: game overlays items later. Hands natural and exactly two. Match reference identity outfit pixel texture, light and detail. Camera elevated30degrees, crisp pixel clusters and dark colored outlines. Figures isolated with generous transparent margins. No labels, numbers, floor, backgrounds, shadows outside silhouette, or checkerboard.

### architecture-bodega-galpao-v1

Referência: `assets/images/world/architecture-shop-melhorias.png`.

Production pixel-art building asset for a Brazilian gaucho rural RPG. Use attached hardware galpao ONLY as reference for pixel art treatment, elevated camera and rustic material palette. Create a DIFFERENT, larger landmark main tavern: BODEGA DO SADI, an authentic proud rural Rio Grande do Sul timber GALPAO, single storey with high roof and broad welcoming covered front veranda, characterful old dark honey-brown vertical timber boards and substantial exposed wood beams, warm terracotta gable roof with aged dark patches, one stone chimney to left, subtle warm light in two large green framed multipane windows. Facade faces directly toward bottom of image, visible roof plane and veranda floor from elevated35degree topdown RPG camera, horizontal frontedges, NOT isometric, no side-facing facade. Strong memorable silhouette and craftsmanship, clear dominant main building, warm amber lanterns either side of a tall WIDE open CENTRAL door, brass horseshoe above door. Exact carved sign BODEGA DO SADI integrated in the front gable under roof, large readable cream capitals. Central entrance aligned precisely on horizontal image midpoint and opens onto ONE wide shallow central doorstep at bottom; leave doorway and path fully unobstructed. Bench and barrel grouped left side of veranda, stack of firewood and clay plant pot to right, small Rio Grande do Sul cloth flag hanging from one veranda beam. Restrained cohesive details, no excessive ornaments, no second floor, no European chalet, no tower, no sprawling yard or detached props. Full building centered and uncropped on TRANSPARENT background, tightly fill wide landscape1536x1024 with clear margins, overall silhouette width-to-height about1.5. Detailed clean pixel clusters and dark brown outlines, grounded weathered gaucho materials, readable small. No people, trees, grass islands, floating location plates or environment.
