# Variações de detalhes do ambiente

Doze peças novas criadas com **image_gen integrado**, usando o atlas original de árvores e objetos como referência de pixel art, perspectiva e materiais.

## Recurso e integração

[environment-props-v3.png](../assets/images/environment/environment-props-v3.png), 1448 × 1086, com transparência:

1. Tufo de capim.
2. Arbusto baixo.
3. Samambaias.
4. Juncos de margem.
5. Pedra arredondada com seixo.
6. Basalto baixo.
7. Galho/tronco caído.
8. Toco de árvore.
9. Lenha avulsa.
10. Caixote de colheita com uvas.
11. Vaso de ervas.
12. Tina de madeira com folhas.

Os recortes reais foram conferidos pelo canal alfa e registrados em [environment-polish.js](../js/render/environment-polish.js). A seleção por posição é estável e usa conjuntos diferentes para fachadas, bosques, gramado, margens e pedras. Detalhes vizinhos dos jardins procuram uma silhueta diferente. Os objetos usam as dimensões do jogo e o cache de sprites existente; não criam colisões.

A decoração compartilhada usa a coleção na Fronteira, Serra, SC, horta, curral/campo e trechos da mata. No litoral são usados capim e pedra arredondada. Recursos próprios de gameplay e biomas (árvores, colheitas, obstáculos de desafios, caverna) continuam com seus desenhos específicos.

Removida a fileira fixa de dez canteiros de SC em [open-world-regions.js](../js/mechanics/open-world-regions.js). Os canteiros de cerquinha e os conjuntos repetidos de pedra com vegetação não são usados como decoração genérica quando o novo atlas está disponível. Os detalhes já desenhados nas imagens das fachadas permanecem.

A inicialização aguarda o carregamento da arte de ambiente. Em falha de carregamento, os desenhos anteriores continuam disponíveis. As densidades reduzidas, os poucos ipês e as árvores frutíferas foram preservados.

## Capturas e validação

[SC](previews/regional-sc.png), [Serra](previews/regional-serra.png), [Fronteira](previews/tree-varieties-vila.png).

```powershell
$env:BODEGA_FOCUS='fishingRegions'
node tests/smoke.cjs
$env:BODEGA_FOCUS='forest'
node tests/smoke.cjs
```

## Prompt final

```text
Use case: style-transfer. Create a new transparent sprite atlas of TWELVE separate small environmental props for a rustic Brazilian countryside pixel-art RPG. Input image is STYLE REFERENCE ONLY: match its warm hand-crafted pixel-art game materials, high-oblique top-down camera, readable silhouettes, coherent upper-left light, palette and pixel grain. Do NOT reproduce any of the existing objects. Layout: strict 4 columns x 3 rows, 1536x1152 canvas, each384x384 cell, each sprite entirely within its cell with at least35px transparent margin. Uniform scale language, designed for game rendering at50-110px wide. Draw only one modest grouping per cell, not a decorated diorama. TRUE TRANSPARENT BACKGROUND.
ROW1 left to right: (1) low irregular tuft of olive field grasses, no stones; (2) low broadleaf green shrub with five clear leafy stems, no blossoms; (3) two compact fern rosettes with softly arching fronds, no stones; (4) clump of short riverbank sedges/reeds in sage green, no water or soil base.
ROW2: (5) one modest partly buried smooth grey river stone and one tiny pebble, no foliage; (6) two flat dark basalt rocks of different sizes with very subtle moss, no grass; (7) short weathered fallen branch/log, unobtrusive, no mushrooms or leaves; (8) old broad low tree stump with visible growth rings and one simple root, no flowers or grass.
ROW3: (9) four split firewood pieces stacked loosely, NO barrel, NO pot; (10) small weathered wooden harvest crate with a few dark grapes and folded burlap, NO barrel or surrounding plants; (11) one humble terracotta pot with green culinary herbs, NO flowers, NO other objects; (12) low timber wash tub with a few muted green leaves growing in it, no flowers, no ornamental edging.
Harmony: muted olive and sage greens, desaturated warm grey stones, warm umber wood, restrained terracotta. Avoid high contrast yellow highlights, neon greens, fancy sparkle details, realistic photo textures or smooth 3D. Crisp confident pixel clusters, simple small scale. No miniature picket-fence flowerbeds, no identical stone+plant combinations, NO FLOWERS ANYWHERE. No oval grass discs or bases, no drop shadows on background, no labels, no text. Do not touch or overlap adjacent cells.
```

O arquivo retornado tem dimensões diferentes das sugeridas; a integração usa os recortes efetivos sem editar o PNG gerado.
