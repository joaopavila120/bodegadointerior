# Árvores frutíferas e variações do mundo aberto

Atlas criado com **image_gen integrado** usando os ipês de SC como referência de estilo e o butiazeiro existente como referência de forma.

- [tree-varieties-v1.png](../assets/images/environment/tree-varieties-v1.png), 1254 × 1254, com transparência: bergamoteira, butiazeiro e duas variações verdes sem flores.
- Integração em [regional-identity.js](../js/render/regional-identity.js).
- Capturas: [Fronteira](previews/tree-varieties-vila.png), [Serra](previews/tree-varieties-serra.png), [SC](previews/tree-varieties-sc.png).

Cada região principal recebe até 12 exemplares das novas variedades, conforme o espaço disponível. Primeiro são reaproveitados até oito pontos de árvores comuns; depois são buscadas clareiras livres para novas unidades. Na composição atual são cinco exemplares na Fronteira, oito na Serra e oito em SC, com as quatro variedades presentes em cada região. Araucárias e árvores comuns predominam; os ipês de SC ficam restritos a até cinco pontos espaçados, conforme a revisão registrada em arte-ipes-sc.md.

A distribuição usa uma semente própria por mapa: parece aleatória, mas permanece igual ao voltar ou recarregar o jogo e não consome a aleatoriedade da gameplay.

A escolha das posições exclui estradas, fachadas e acessos, marcos, pontos de interação, plantações e áreas de atividades. As copas usam a ordenação de profundidade e ficam transparentes ao encobrir o jogador. As novas árvores são decorativas; os pontos de colheita existentes continuam funcionando como antes. Não são adicionadas flores ao chão.

O resultado do sorteio é guardado em cache por mapa. As imagens usam o cache de sprites existente, limitado a 96 entradas. Nenhum sorteio ou teste de posição é feito a cada quadro.

Validação: `BODEGA_FOCUS=fishingRegions node tests/smoke.cjs`, com verificações das quatro variedades nas três regiões, estabilidade das posições após reconstruir o cache, acesso às estradas/construções e preservação das colisões; inclui os cenários existentes de pesca, ambiente, novidades e layout.

## Prompt final

```text
Use case: style-transfer. Production transparent pixel-art sprite atlas for a rustic top-down 3/4 view Brazilian countryside RPG. Image 1 is STYLE REFERENCE (existing yellow/pink ipes): match its pixel clusters, readable shaded crowns, warm thick brown bark, perspective and upper-left sunlight. Image 2 is BOTANICAL SHAPE REFERENCE ONLY for butia palm, simplify it into the exact pixel-art style of image 1, not photographic.
Create FOUR separate entire trees in a 2 columns x 2 rows atlas, 1536x1536 square, equal 768px cells, generous transparent gutters at least50px, no tree may cross cell boundaries. Top left BERGAMOTEIRA (mandarin citrus tree): slightly compact rounded dense olive-green crown, forked brown trunk, a dozen clearly visible orange mandarin fruits, only two or three tiny white blossoms. Top right BUTIAZEIRO: stout rough diamond-textured short trunk, long arching curved feathery silver-green fronds, two small orange-yellow fruit bunches near crown; NOT a tall coconut palm. Bottom left broadleaf tree variation: wide asymmetric olive-green leafy crown, sturdy forked trunk leaning gently left, no fruit and NO FLOWERS. Bottom right broadleaf tree variation: slightly taller oval darker green crown, straight warm brown trunk, exposed branches, no fruit and NO FLOWERS.
All trees match the same game art family, similar natural proportions to the reference ipes, each tree fully visible and centered in its own cell. Clear strong silhouette, detailed but restrained crisp pixel art, large separated pixel clusters legible when reduced to250px, medium-muted greens, no bright neon leaf tips. No shrubs, no flower beds, no grass carpets, no ground discs, no scenery, no cast background shadows, no labels or text. Actual transparent background. Preserve transparency, no baked checkerboard.
```

O gerador retornou 1254 × 1254 em vez das dimensões sugeridas. Os quatro recortes foram ajustados aos contornos efetivos do canal alfa, sem editar o PNG.
