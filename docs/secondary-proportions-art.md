# Proporções dos personagens secundários

Correção das cabeças grandes e pernas curtas dos visitantes comuns e torcedores. As novas folhas usam seis poses por personagem: duas de frente, duas de perfil e duas de costas. A pose parada mantém o retrato frontal original. Altura de desenho: 124 unidades, com escala constante por personagem.

Modo: ferramenta integrada `image_gen`, geração com referência visual e fundo transparente. Os PNGs gerados foram copiados sem alterações; `tools/expansion-bounds.py` calcula apenas os recortes. As versões v3 foram descartadas na revisão visual.

Validação visual: [comparação na escala do jogo](secondary-proportions-preview.png), com Sadi e um personagem especial ao lado das poses novas.

## secondary-common-v4

Arquivo: [secondary-common-v4.png](../assets/images/expansion/secondary-common-v4.png)

Referência: `people.webp`.

Prompt final:

```text
Create a pixel-art animation atlas directly based on the attached original adult people. Treat the original as strict anatomy and costume reference. COPY THEIR BODY PROPORTIONS EXACTLY: relatively small heads, long torso and legs, full-grown adults, fine pixel outlines and detailed textured fabric. All characters are adults, use equally tall mature anatomy in the last row too. Hats remain modest sized. Preserve original faces and outfits.
Square canvas 2048x2048. EXACTLY SIX COLUMNS AND FOUR ROWS, 24 isolated full-body figures total. Row1 Lucia (top middle of reference), row2 Anselmo (top right), row3 Rosa (bottom left), row4 Nair (bottom middle). Omit other reference people. Each cell is a tall standing adult with generous transparent gutters; row height and baseline consistent. No background, genuine transparent alpha.
Column1 front walk left foot forward/right arm forward.
Column2 front walk right foot forward/left arm forward.
Column3 facing right profile stride with legs APART.
Column4 facing right profile PASSING pose with feet CLOSE TOGETHER under hips and one heel lifted.
Column5 back walk left foot forward.
Column6 back walk right foot forward.
Profile anatomy must be equally tall and thin as front. Preserve hair/hat/body proportions across poses. Keep the tall mature adult silhouettes of the original. Do not redesign into cute characters. No UI, text, lines, floor, ground shadows.
```

## secondary-gremio2-v4

Arquivo: [secondary-gremio2-v4.png](../assets/images/expansion/secondary-gremio2-v4.png)

Referência: `gremio2.webp`.

Prompt final:

```text
Create a pixel-art animation atlas directly based on the attached original adult people. Treat the original as strict anatomy and costume reference. COPY THEIR BODY PROPORTIONS EXACTLY: relatively small heads, long torso and legs, full-grown adults, fine pixel outlines and detailed textured fabric. Last row is an adult woman with braid, hat and skirt, preserve her identity and equal adult height. Hats remain modest sized. Preserve original faces and outfits.
Square canvas 2048x2048. EXACTLY SIX COLUMNS AND SIX ROWS, 36 isolated full-body figures total. One original person per row in reading order of the reference (top-left, top-middle, top-right, bottom-left, bottom-middle, bottom-right). Each cell is a tall standing adult with generous transparent gutters; row height and baseline consistent. No background, genuine transparent alpha.
Column1 front walk left foot forward/right arm forward.
Column2 front walk right foot forward/left arm forward.
Column3 facing right profile stride with legs APART.
Column4 facing right profile PASSING pose with feet CLOSE TOGETHER under hips and one heel lifted.
Column5 back walk left foot forward.
Column6 back walk right foot forward.
Profile anatomy must be equally tall and thin as front. Preserve hair/hat/body proportions across poses. Keep the tall mature adult silhouettes of the original. Do not redesign into cute characters. No UI, text, lines, floor, ground shadows.
```

## secondary-inter-v4

Arquivo: [secondary-inter-v4.png](../assets/images/expansion/secondary-inter-v4.png)

Referência: `inter.webp`.

Prompt final:

```text
Create a pixel-art animation atlas directly based on the attached original adult people. Treat the original as strict anatomy and costume reference. COPY THEIR BODY PROPORTIONS EXACTLY: relatively small heads, long torso and legs, full-grown adults, fine pixel outlines and detailed textured fabric. All characters are adults, use equally tall mature anatomy in the last row too. Hats remain modest sized. Preserve original faces and outfits.
Square canvas 2048x2048. EXACTLY SIX COLUMNS AND SIX ROWS, 36 isolated full-body figures total. One original person per row in reading order of the reference (top-left, top-middle, top-right, bottom-left, bottom-middle, bottom-right). Each cell is a tall standing adult with generous transparent gutters; row height and baseline consistent. No background, genuine transparent alpha.
Column1 front walk left foot forward/right arm forward.
Column2 front walk right foot forward/left arm forward.
Column3 facing right profile stride with legs APART.
Column4 facing right profile PASSING pose with feet CLOSE TOGETHER under hips and one heel lifted.
Column5 back walk left foot forward.
Column6 back walk right foot forward.
Profile anatomy must be equally tall and thin as front. Preserve hair/hat/body proportions across poses. Keep the tall mature adult silhouettes of the original. Do not redesign into cute characters. No UI, text, lines, floor, ground shadows.
```

## secondary-gremio-v4

Arquivo: [secondary-gremio-v4.png](../assets/images/expansion/secondary-gremio-v4.png)

Referência: `gremio.webp`.

Prompt final:

```text
Create a pixel-art animation atlas directly based on the attached original six adult people. Treat the original as strict anatomy and costume reference. COPY THEIR BODY PROPORTIONS EXACTLY: relatively small heads, long torso and legs, full-grown adults, fine pixel outlines and detailed textured fabric. The young man in blue beret must have the same adult height and adult anatomy as the bearded men. Hats remain modest sized. Preserve original faces and outfits.
Square canvas 2048x2048. EXACTLY SIX COLUMNS AND SIX ROWS, 36 isolated full-body figures total. One original person per row in reading order of the reference (top-left, top-middle, top-right, bottom-left, bottom-middle, bottom-right). Each cell is a tall standing adult with generous transparent gutters; row height and baseline consistent. No background, genuine transparent alpha.
Column1 front walk left foot forward/right arm forward.
Column2 front walk right foot forward/left arm forward.
Column3 facing right profile stride with legs APART.
Column4 facing right profile PASSING pose with feet CLOSE TOGETHER under hips and one heel lifted.
Column5 back walk left foot forward.
Column6 back walk right foot forward.
Profile anatomy must be equally tall and thin as front. Preserve hair/hat/body proportions across poses. Keep the tall mature adult silhouettes of the original. Do not redesign into cute characters. No UI, text, lines, floor, ground shadows.
```
