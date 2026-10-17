# Revisão da caverna e caminhada

Branch: `mundo-aberto`.

## Alterações

- Entrada externa em pixel art: basalto irregular, musgo, samambaias, portal escuro e lanterna.
- São Dunstano é um personagem exclusivo do primeiro andar. Caminha entre a ferraria e a área de prática, para durante conversas e usa a barra de diálogo com retrato. A introdução explica a gruta; interações posteriores variam os conselhos.
- Secundários: folhas v2 com contato, passagem da perna e contato oposto, em três direções. O ciclo de quatro tempos repete a passagem entre os contatos e acompanha a distância percorrida. Parados, os personagens deixam de alternar passos.
- Mortes: oito efeitos próprios, com voz sintetizada, respiração/ruído, impacto e reflexões curtas. Variação discreta de altura por reprodução; máximo de quatro sons simultâneos. Respeitam o volume de efeitos.
- Os sons são sintetizados uma vez por criatura e ficam em cache, inclusive ao abrir o HTML diretamente. Os [WAVs exportados](../assets/audio/cave/) correspondem à mesma síntese, para audição e reutilização. Regenerar com `node tools/export-cave-deaths.cjs`.
- Validação: `node tests/smoke.cjs`; prévias focadas com a variável de ambiente `BODEGA_FOCUS=mountain`.

## Artes finais e prompts

Modo: ferramenta integrada `image_gen`. Geração da entrada e de Dunstano; edição das folhas de secundários preservando as identidades das referências locais. PNG com alfa, salvos em [assets/images/expansion](../assets/images/expansion/). Os originais de geração foram preservados. O código faz recortes e animação sem modificar os pixels dos arquivos.

### cave-mouth-v2.png

[PNG final](../assets/images/expansion/cave-mouth-v2.png)

```text
Use case: stylized-concept. Production pixel art game sprite, true transparent background. ONE natural cave entrance in the basalt cliffs of Serra Gaucha Brazil, viewed in the same slightly overhead three-quarter top-down perspective as a rustic 2D RPG. Broad irregular dark charcoal and warm gray layered basalt rock outcrop with a deep black arched cave opening in the lower center, opening large enough for two adult people to walk through. Moss, ferns, a few small hanging vines on edges, rough stones and worn earth path at the threshold. One modest old wooden support beam within the opening, a lantern mounted beside entrance with subtle warm light. Rock should feel embedded in landscape, broad low silhouette, NO perfect circle, NO floating island, NO text, NO signs, NO characters, NO mountains in background. Crisp pixel clusters with dark brown outlines, restrained warm natural palette, detailed but clearly legible at 450 pixels wide. Complete isolated asset with transparent margins on all sides, no cut-off rock or plants.
```

### dunstan-walk-v2.png

[PNG final](../assets/images/expansion/dunstan-walk-v2.png)

```text
Use case: stylized-concept. Production sprite animation sheet on TRUE transparent background. Exactly 4 columns and 3 rows of the SAME character, no labels, no scenery, no cast shadow. Saint Dunstan as a friendly elderly ghost blacksmith monk: white beard and tonsure, muted pale gray-blue monk habit with brown leather smith apron, small belt hammer, sturdy visible boots, translucent-looking cool pale colors but opaque readable sprite silhouette, kind face. Rustic detailed pixel art for slightly overhead 3/4 top-down RPG. Row 1 walking toward camera. Row 2 walking to the RIGHT side profile. Row 3 walking AWAY back view. Each row FOUR clearly different gait phases: column1 LEFT foot extended forward RIGHT foot behind; column2 left planted right knee bent passing underneath body; column3 RIGHT foot extended forward LEFT foot behind; column4 right planted left knee bent passing. Arms swing opposite legs. Robe hem lifts enough to clearly reveal BOTH booted legs and alternating feet. Same identity size proportions outfit across all 12 poses. Exact grid with generous empty gutters between sprites. NO duplicates, NO standing still poses, NO glowing circular aura. Feet at common baseline per row.
```

### secondary-common-v2.png

[PNG final](../assets/images/expansion/secondary-common-v2.png)

Referência: [secondary-common-v1.png](../assets/images/expansion/secondary-common-v1.png)

```text
Use case: precise-object-edit. The reference is a sprite sheet of 4 different rural Brazilian RPG characters, one identity per row. Preserve EACH row's identity, clothing colors, hats, hairstyle and pixel-art style. REBUILD the sheet as EXACTLY NINE columns and 4 rows, TRUE transparent background, no labels, generous gutters. Critical requested fix: legs must visibly move; old sheet repeats nearly identical poses and is NOT a usable walk cycle. New columns 1,2,3: character walking toward camera. Columns 4,5,6: walking RIGHT in side profile. Columns 7,8,9: walking AWAY, back view. Within each triplet use CLEARLY DIFFERENT SILHOUETTES: A CONTACT POSE with left boot reaching far forward and right boot trailing; B PASSING POSE with feet close together under hips, one knee lifted and bent at 80 degrees; C OPPOSITE CONTACT POSE with right boot reaching forward and left boot trailing. Arms counter-swing opposite leading leg. Side view especially: first pose wide stride, second pose very narrow stride with bent lifted knee, third wide stride opposite leg. Front/back alternating boots must change vertical position visibly. For skirts show shoes, sway the hem and swing legs under it. Each identity stays same scale, body proportions, head height, consistent feet baseline. Render all 36 complete figures with clean separated transparent gutters, no cutoffs, no scenery. This is an animation production asset, not a lineup of static duplicate portraits.
```

### secondary-inter-v2.png

[PNG final](../assets/images/expansion/secondary-inter-v2.png)

Referência: [secondary-inter-v1.png](../assets/images/expansion/secondary-inter-v1.png)

```text
Use case: precise-object-edit. The reference is a sprite sheet of 6 different rural Brazilian RPG characters, one identity per row. Preserve EACH row's identity, clothing colors, hats, hairstyle and pixel-art style. REBUILD the sheet as EXACTLY NINE columns and 6 rows, TRUE transparent background, no labels, generous gutters. Critical requested fix: legs must visibly move; old sheet repeats nearly identical poses and is NOT a usable walk cycle. New columns 1,2,3: character walking toward camera. Columns 4,5,6: walking RIGHT in side profile. Columns 7,8,9: walking AWAY, back view. Within each triplet use CLEARLY DIFFERENT SILHOUETTES: A CONTACT POSE with left boot reaching far forward and right boot trailing; B PASSING POSE with feet close together under hips, one knee lifted and bent at 80 degrees; C OPPOSITE CONTACT POSE with right boot reaching forward and left boot trailing. Arms counter-swing opposite leading leg. Side view especially: first pose wide stride, second pose very narrow stride with bent lifted knee, third wide stride opposite leg. Front/back alternating boots must change vertical position visibly. For skirts show shoes, sway the hem and swing legs under it. Each identity stays same scale, body proportions, head height, consistent feet baseline. Render all 54 complete figures with clean separated transparent gutters, no cutoffs, no scenery. This is an animation production asset, not a lineup of static duplicate portraits.
```

### secondary-gremio-v2.png

[PNG final](../assets/images/expansion/secondary-gremio-v2.png)

Referência: [secondary-gremio-v1.png](../assets/images/expansion/secondary-gremio-v1.png)

```text
Use case: precise-object-edit. The reference is a sprite sheet of 6 different rural Brazilian RPG characters, one identity per row. Preserve EACH row's identity, clothing colors, hats, hairstyle and pixel-art style. REBUILD the sheet as EXACTLY NINE columns and 6 rows, TRUE transparent background, no labels, generous gutters. Critical requested fix: legs must visibly move; old sheet repeats nearly identical poses and is NOT a usable walk cycle. New columns 1,2,3: character walking toward camera. Columns 4,5,6: walking RIGHT in side profile. Columns 7,8,9: walking AWAY, back view. Within each triplet use CLEARLY DIFFERENT SILHOUETTES: A CONTACT POSE with left boot reaching far forward and right boot trailing; B PASSING POSE with feet close together under hips, one knee lifted and bent at 80 degrees; C OPPOSITE CONTACT POSE with right boot reaching forward and left boot trailing. Arms counter-swing opposite leading leg. Side view especially: first pose wide stride, second pose very narrow stride with bent lifted knee, third wide stride opposite leg. Front/back alternating boots must change vertical position visibly. For skirts show shoes, sway the hem and swing legs under it. Each identity stays same scale, body proportions, head height, consistent feet baseline. Render all 54 complete figures with clean separated transparent gutters, no cutoffs, no scenery. This is an animation production asset, not a lineup of static duplicate portraits.
```

### secondary-gremio2-v2.png

[PNG final](../assets/images/expansion/secondary-gremio2-v2.png)

Referência: [secondary-gremio2-v1.png](../assets/images/expansion/secondary-gremio2-v1.png)

```text
Use case: precise-object-edit. The reference is a sprite sheet of 6 different rural Brazilian RPG characters, one identity per row. Preserve EACH row's identity, clothing colors, hats, hairstyle and pixel-art style. REBUILD the sheet as EXACTLY NINE columns and 6 rows, TRUE transparent background, no labels, generous gutters. Critical requested fix: legs must visibly move; old sheet repeats nearly identical poses and is NOT a usable walk cycle. New columns 1,2,3: character walking toward camera. Columns 4,5,6: walking RIGHT in side profile. Columns 7,8,9: walking AWAY, back view. Within each triplet use CLEARLY DIFFERENT SILHOUETTES: A CONTACT POSE with left boot reaching far forward and right boot trailing; B PASSING POSE with feet close together under hips, one knee lifted and bent at 80 degrees; C OPPOSITE CONTACT POSE with right boot reaching forward and left boot trailing. Arms counter-swing opposite leading leg. Side view especially: first pose wide stride, second pose very narrow stride with bent lifted knee, third wide stride opposite leg. Front/back alternating boots must change vertical position visibly. For skirts show shoes, sway the hem and swing legs under it. Each identity stays same scale, body proportions, head height, consistent feet baseline. Render all 54 complete figures with clean separated transparent gutters, no cutoffs, no scenery. This is an animation production asset, not a lineup of static duplicate portraits.
```
