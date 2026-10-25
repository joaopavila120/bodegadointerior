# Ipês de SC e araucárias da Serra

Os detalhes pequenos foram posteriormente substituídos pela [coleção de ambiente v3](arte-detalhes-ambiente-v3.md), que também remove a fileira fixa de canteiros de SC.

Revisão posterior à arte regional inicial. A Serra volta a usar o atlas `assets/images/world/nature.webp`, o mesmo da Fronteira, preservando as posições e a proteção das fachadas e caminhos. A araucária é o recorte 1 desse atlas; os xaxins da substituição regional anterior deixam de aparecer.

Em SC, predominam araucárias e árvores comuns do atlas original. Há no máximo cinco ipês, alternando amarelo e rosa, separados por pelo menos 600 unidades de mundo. A seleção preserva os pontos das frutíferas e usa proporções, sombras, transparência da copa sobre o jogador e cache limitado. Árvores frutíferas e colheitas mantêm suas funções e artes.

## Arquivos

- [ipes-sc-v1.png](../assets/images/environment/ipes-sc-v1.png): atlas transparente 1536 × 1024, criado com **image_gen integrado**, usando [nature.webp](../assets/images/world/nature.webp) como referência de estilo.
- [regional-identity.js](../js/render/regional-identity.js): carregamento, recortes e escolha dos sprites.
- [environment-polish.js](../js/render/environment-polish.js): jardins menores em SC, no máximo um canteiro pequeno por construção e vegetação baixa ocasional junto às árvores.
- [Captura de SC](previews/regional-sc.png) e [captura da Serra](previews/regional-serra.png).

Os canteiros floridos espalhados pelo gramado de SC foram removidos. Permanecem os detalhes das próprias fachadas e pequenos canteiros junto a algumas construções. A revisão de densidade também reduz a decoração repetida na Fronteira e Serra: até 18 grupos de jardim por região, espaçados em pelo menos 210 unidades, incluindo no máximo dois conjuntos de barril e lenha. Arbustos e pedras soltos são filtrados por posição estável, preservando aproximadamente 20% dos grupos de vegetação, 45% das pedras maiores e 12% dos detalhes miúdos. Colisões, portas, mapas, personagens e jogos permanecem iguais.

## Validação

```powershell
$env:BODEGA_FOCUS='fishingRegions'
node tests/smoke.cjs
```

Verifica carregamento dos recursos, sprites regionais, preservação das colisões e acessos, limites de cache, jardins e regressões da pesca. Gera capturas na escala do jogo e abre também o HTML via file://.

## Prompt final

```text
Use case: style-transfer. Create a transparent production sprite atlas with exactly TWO flowering Brazilian ipê trees for an existing top-down three-quarter pixel-art RPG. Input image is STYLE REFERENCE ONLY: match the tree sprites in its top row, especially the broadleaf tree and araucaria: same pixel scale, strong readable silhouette, warm brown bark, shaded clustered foliage, grounded rustic game art. Do not copy the atlas or buildings. New atlas: two equal side-by-side cells, left a mature yellow ipê, right a mature pink/mauve ipê. Full trees visible roots to crown, same size, each 500px tall, generous transparent gaps and borders, neither tree touching other. Thick natural branching trunk, rounded irregular broad crown with visible gaps and branches, coherent sunlight from upper left. Restrained yellow ochre flowers and dusty mauve flowers interspersed with olive foliage; less saturated than the reference yellow tree, no neon or bright glitter. Large clear pixel clusters and modest detail, crisp edges, no photographic grain, no smooth painting, no cartoon black outline. Designed to render around 280px tall in game and match reference tree's silhouette weight. No planted flower beds or objects at base, no flower carpet, no falling petals, no pots, no ground plane, no background, no text. TRUE transparent background. Suggested landscape canvas 1536x1024, trees spaced in left and right halves.
```

Os limites dos dois desenhos foram conferidos pelo canal alfa do arquivo. A integração recorta o atlas ao desenhar, sem modificar o PNG gerado.
