# Arte do interior da bodega

Gerada com a ferramenta integrada `image_gen` (skill imagegen), sem CLI. O fundo e os móveis são exclusivamente visuais; estações, estoque, colisões, proporções dos personagens e propriedade das melhorias continuam nos sistemas existentes.

## Arquivos finais

- `assets/images/bodega/room-v1.png`: fundo vazio; paredes de reboco e madeira, terra batida e assoalho. Mantém os espaços destinados às decorações opcionais.
- `assets/images/bodega/furniture-v1.png`: atlas transparente com bancada, chapa, prensa, geladeira, mesa, mesa de truco, cadeira e expositor de ingredientes.
- `js/render/bodega-interior.js`: recortes e cache dos desenhos; usa as artes anteriores se o carregamento falhar.

## Prompts

### Fundo — referências room2.webp (geometria) e home-interior-v3.png (estilo)

Edit image 1, an EMPTY videogame bodega room background. Image 2 is STYLE ONLY: match its beautiful carefully painted pixel-art rustic southern Brazilian interior materials and cohesive warm colors. Retain image 1's EXACT straight-on top-down oblique game camera, geometry, aspect ratio and placement: back wall spans top 37% of frame, left 52.5% floor is packed earth, right 47.5% floor is horizontal wood planks, seam stays vertical. Keep the single back-wall countryside window exactly in its original position, size and shape. Keep all wall mounting spaces EMPTY for separately drawn purchased decorations. Make aged dark timber framing, subtle honey timber walls, quiet warm terracotta earth floor with delicate worn patches, hand-hewn wide dining floorboards and believable subtle contact shading. Rich but restrained painterly pixel art like image 2, clean readable surfaces, no harsh orange noisy gravel texture. CRITICAL: keep room EMPTY, NO furniture, NO stove, NO lamps, NO rugs, NO flags, NO plants, NO signs, NO characters or items, NO new doors or windows. The game overlays all furnishings and optional decor. Preserve flat walkable floor, no raised platforms. Full-frame production game background, widescreen same framing as image 1.

### Refinamento do piso e da iluminação

Polish this game background with ONE targeted material change: the packed-earth floor on the left should be much smoother and quieter, matte warm brown compacted clay like a well kept old gaucho home. Remove the large bright angular gravel-like pixels and orange patches. Keep only subtle very fine earthy grain and restrained worn variation; slightly desaturate the left floor. Also remove the hard direct yellow sunlight rectangle on the right wooden floor, replace it with soft ambient natural brightness, because the game supports day/night lighting. Preserve ALL other geometry, wall plaster and wooden beams, window exact position, empty floor, exact perspective and dimensions, horizontal floorboards, vertical seam, wall height and every structural feature. Empty room only. Same beautiful painterly pixel-art style.

### Móveis — referência home-interior-v3.png

Create a production TRANSPARENT sprite atlas of 8 separate furniture pieces for a cozy rustic southern Brazilian bodega game, matching the careful painted pixel-art wood and iron craftsmanship of reference image 1. NOT a room illustration. 4 equal columns x 2 equal rows, one isolated object fully inside each cell with ample transparent gutters. Same camera for ALL: game top-down oblique, see tops and front faces, front edges horizontal, NO isometric diagonal rotation. Row 1 left to right: (1) compact wooden kitchen cabinet with aged pale brushed metal worktop and small wooden chopping board, empty surface; (2) compact cast-iron cooking griddle on a short dark timber cabinet, empty hotplate, two round knobs; (3) open hinged sandwich press with visible bottom grill, atop a short timber stand; (4) narrow vintage olive-green glass-door soda refrigerator with tiny soda bottles. Row 2 left to right: (5) rustic rectangular dining table with EMPTY light walnut plank top and four short sturdy legs; (6) same-sized rectangular card table with EMPTY subdued green felt inset and dark walnut edge; (7) ONE simple rustic wooden chair seen from above and front, clear square wooden seat and low back; (8) small square ingredient stand with empty shallow enamel tray, short wooden cabinet base. Sprite silhouettes compact, readable at 80–160 pixels in the game; rich warm timber, restrained highlights, no heavy black borders, materials like reference. Perspective consistent with 2D topdown Stardew-type game but finely rendered painted pixel clusters. No food on tables, no cards, no plates, no people, no floor, no labels, no letters, no drop shadows outside sprites. Exact 8 objects in 4x2 grid, true transparent alpha background, no background color/checker pattern.

