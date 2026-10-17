# Caverna, encontros e peixes

Implementação na branch `mundo-aberto`. README preservado.

- São Dunstano compra ametista (R$ 18) e ágata (R$ 28), por unidade ou lote. O Armazém não compra minérios.
- Refúgio sem pedras/inimigos; andares 2–10 têm ametista. A partir do 11, ágata, pedras mais resistentes, +30% de vida sobre a curva anterior dos inimigos e +25% de dano.
- Passo de esquiva: R$ 160 na ferraria. Shift e botão ficam indisponíveis antes da compra.
- Derrota: queda, escurecimento e frase por uma sequência de 4,5 s; simulação e controles ficam bloqueados. A perda de dinheiro acontece uma única vez; minérios são preservados.
- Sons de morte: ganho de reprodução reduzido de 0,42 para 0,14, ataque de 35 ms e filtro passa-baixas em 2.200 Hz; mortes simultâneas recebem atenuação adicional.
- Hans e Helga circulam em SC, visitam a bodega após desbloquear SC e só pedem chopp (`cerveja`).
- Estela, Ramiro e Arami são moradores fictícios a cavalo; distribuição diária por personagem: 70% Fronteira, 15% Serra, 15% SC. Não entram na bodega.
- Saci: chance de 35% por mapa/noite nas três regiões, sorteio determinístico para evitar rerrolar a cada quadro. Alterna salto e redemoinho a cada seis segundos. Conversar entrega a carta.
- Cartas novas: Teiniaguá e onça-parda (primeira vitória), Saci (encontro), São Dunstano (conversa). A coleção Gente da bodega usa as fotos originais de `assets/images/portraits`; Valter mantém o retrato do jogo por não haver foto dele nessa pasta.
- Jundiá, piava, grumatã e traíra têm sprites, estoque e valores próprios. As missões antigas que pedem peixe aceitam qualquer espécie, incluindo peixes de saves anteriores.
- Falas dos seis novos encontros também estão em `dialogos.txt` e podem ser editadas manualmente.

Referência das espécies: [Rio Uruguai — Unipampa](https://sites.unipampa.edu.br/nupilabru/files/2023/04/livro-rio-uruguai-2a--edicao.pdf), com apoio do [Plano de Manejo do Parque Estadual do Turvo — SEMA/RS](https://www.sema.rs.gov.br/upload/arquivos/201610/24172430-plano-manejo-peturvo.pdf). Valores, chances e comportamentos são escolhas de gameplay.

## Verificação

`node tests/smoke.cjs` passou com as duas entradas HTML via HTTP e `file://`, incluindo persistência, controles móveis e regressões da bodega e do mundo aberto. A cobertura nova tem 84 verificações de encontros, venda, dash, derrota, cartas e peixes; os 314 cenários de missões também passaram. Conferência visual no navegador: atlas de personagens, caverna vermelha, ferraria, derrota e cartas. Os retratos de atlas têm recorte explícito para impedir que sprites vizinhos apareçam nas margens.

## Arte

Modo usado: ferramenta integrada `image_gen`, geração com referências locais e edição de transparência do Saci. PNGs preservados como gerados; recortes calculados sem editar as imagens. Prévia: [personagens e peixes](cave-life-art-preview.png).

### oktober-hans-v1

Arquivo: [oktober-hans-v1.png](../assets/images/expansion/oktober-hans-v1.png)

Referência visual: `secondary-common-v4.png`.

```text
Pixel art production sprite atlas for a warm detailed southern Brazilian RPG. Match the reference's adult proportions, small normal head, long adult torso and limbs, pixel outlines, colors and elevated orthographic camera. Genuine transparent background, no scenery, no text, no lines, no shadows. EXACT four evenly spaced columns by three rows, twelve complete full body poses, generous transparent gutters. Row1 walking FRONT: left contact, passing, right contact, passing. Row2 walking RIGHT PROFILE same four phases with visibly alternating legs and different silhouettes. Row3 BACK walking same four phases. Consistent body size and baseline across frames. One new original ADULT male NPC Hans, about40, short brown hair, friendly moustache, Bavarian Oktoberfest green felt hat with small feather, white shirt, dark green vest, traditional brown leather knee breeches with embroidered suspenders, long cream socks and brown shoes. Reference is STYLE ONLY, do not copy existing person identities. Outfit natural and plausible for Oktoberfest in Blumenau. Mature adult anatomy, not cute oversized-head.
```

### oktober-helga-v1

Arquivo: [oktober-helga-v1.png](../assets/images/expansion/oktober-helga-v1.png)

Referência visual: `secondary-common-v4.png`.

```text
Pixel art production sprite atlas for a warm detailed southern Brazilian RPG. Match the reference's adult proportions, small normal head, long adult torso and limbs, pixel outlines, colors and elevated orthographic camera. Genuine transparent background, no scenery, no text, no lines, no shadows. EXACT four evenly spaced columns by three rows, twelve complete full body poses, generous transparent gutters. Row1 walking FRONT: left contact, passing, right contact, passing. Row2 walking RIGHT PROFILE same four phases with visibly alternating legs and different silhouettes. Row3 BACK walking same four phases. Consistent body size and baseline across frames. One new original ADULT female NPC Helga about35, chestnut braided hair, traditional Oktoberfest dirndl: cream blouse, deep blue fitted bodice, long dark green skirt, burgundy apron, modest brown shoes. Reference is STYLE and adult anatomy only. Natural full-grown adult proportions. Her legs and feet visibly alternate while skirt folds sway subtly.
```

### estela-mounted-v1

Arquivo: [estela-mounted-v1.png](../assets/images/expansion/estela-mounted-v1.png)

Referência visual: `olmiro-mounted-v1.png`.

```text
Pixel art production sprite atlas for a warm detailed southern Brazilian RPG. Match the reference's adult proportions, small normal head, long adult torso and limbs, pixel outlines, colors and elevated orthographic camera. Genuine transparent background, no scenery, no text, no lines, no shadows. EXACT four evenly spaced columns by three rows, twelve complete full body poses, generous transparent gutters. Row1 walking FRONT: left contact, passing, right contact, passing. Row2 walking RIGHT PROFILE same four phases with visibly alternating legs and different silhouettes. Row3 BACK walking same four phases. Consistent body size and baseline across frames. Replace reference rider identity with: An adult gaucha horsewoman Estela, long dark braid, cream shirt, wine-red neckerchief, brown leather vest, dark bombacha trousers and riding boots, modest brown gaucho hat. Riding a palomino Crioulo horse. Horse and rider fully visible together in each cell, matching reference horse-to-human scale. All four horse legs anatomically correct, articulate actual alternating walking gait with clear contacts/passing. Rein hands connected naturally. Only this one horse and rider in all twelve cells.
```

### ramiro-mounted-v1

Arquivo: [ramiro-mounted-v1.png](../assets/images/expansion/ramiro-mounted-v1.png)

Referência visual: `olmiro-mounted-v1.png`.

```text
Pixel art production sprite atlas for a warm detailed southern Brazilian RPG. Match the reference's adult proportions, small normal head, long adult torso and limbs, pixel outlines, colors and elevated orthographic camera. Genuine transparent background, no scenery, no text, no lines, no shadows. EXACT four evenly spaced columns by three rows, twelve complete full body poses, generous transparent gutters. Row1 walking FRONT: left contact, passing, right contact, passing. Row2 walking RIGHT PROFILE same four phases with visibly alternating legs and different silhouettes. Row3 BACK walking same four phases. Consistent body size and baseline across frames. Replace reference rider identity with: An adult gauchao Ramiro, long shoulder-length dark hair, very thick moustache, notably wide-brim black gaucho hat and dark red woven poncho, loose brown bombachas. Riding a dark bay Crioulo horse. Hat wide but anatomically plausible, head normal sized. Horse and rider fully visible together in each cell, matching reference horse-to-human scale. All four horse legs anatomically correct, articulate actual alternating walking gait with clear contacts/passing. Rein hands connected naturally. Only this one horse and rider in all twelve cells.
```

### charrua-mounted-v1

Arquivo: [charrua-mounted-v1.png](../assets/images/expansion/charrua-mounted-v1.png)

Referência visual: `olmiro-mounted-v1.png`.

```text
Pixel art production sprite atlas for a warm detailed southern Brazilian RPG. Match the reference's adult proportions, small normal head, long adult torso and limbs, pixel outlines, colors and elevated orthographic camera. Genuine transparent background, no scenery, no text, no lines, no shadows. EXACT four evenly spaced columns by three rows, twelve complete full body poses, generous transparent gutters. Row1 walking FRONT: left contact, passing, right contact, passing. Row2 walking RIGHT PROFILE same four phases with visibly alternating legs and different silhouettes. Row3 BACK walking same four phases. Consistent body size and baseline across frames. Replace reference rider identity with: An original adult Charrua Indigenous horseman named Arami, brown skin, long straight black hair tied back, simple woven headband, practical earth-brown wrapped wool/hide poncho with understated geometric border, plain trousers and leather footwear. Dignified natural adult anatomy, no caricature or fantasy headdress. Mounted on a grey Crioulo horse. Horse and rider fully visible together in each cell, matching reference horse-to-human scale. All four horse legs anatomically correct, articulate actual alternating walking gait with clear contacts/passing. Rein hands connected naturally. Only this one horse and rider in all twelve cells.
```

### saci-walk-v1

Arquivo: [saci-walk-v1.png](../assets/images/expansion/saci-walk-v1.png) — intermediário; o jogo usa `saci-walk-v2.png`.

Sem referência de imagem.

```text
Pixel art sprite atlas for a detailed warm southern Brazilian RPG. EXACT four columns and two rows, 8 isolated full-body figures, transparent alpha, no floor, no text, no borders. Folklore Saci, mischievous Black young man wearing red cap and red shorts, normal lean human proportions, EXACTLY ONE LEG and one bare foot, no second leg, holding a small traditional pipe. Row1 four phases of hopping to the RIGHT: grounded foot, crouch, airborne extension, landing, arms balancing. Keep same character size across frames. Row2 four evolving animation phases of Saci transformed into a spinning dusty brown whirlwind with leaves, visible red cap peeking at top. Thin directional spirals, readable pixel outlines, warm natural colors matching 2D RPG sprites. Full figure entirely inside each equally sized cell; generous gutters.
```

### uruguai-fish-v1

Arquivo: [uruguai-fish-v1.png](../assets/images/expansion/uruguai-fish-v1.png)

Sem referência de imagem.

```text
Detailed crisp pixel art inventory sprites, four typical Rio Uruguai fish in EXACT 2x2 grid, transparent alpha background, generous gutters, each fish fully visible side-on facing LEFT. Top-left JUNDIA (Rhamdia quelen), grey brown catfish, smooth scaleless long body, whisker barbels, rounded head, no scales. Top-right PIAVA (Megaleporinus obtusidens), elongated silver-gold scaled body, small mouth, three subtle dark side blotches and warm fins. Bottom-left GRUMATA (Prochilodus lineatus), deeper silvery scaled body, small downturned thick-lipped mouth, dark striped caudal fin. Bottom-right TRAIRA (Hoplias malabaricus), elongated olive mottled predatory fish, broad blunt head, large mouth, rounded tail. Natural fish anatomy, no cartoon faces, no labels, no background or shadows. Warm earthy game item style with readable silhouettes at 64 pixels, each icon centered in its cell.
```

### Saci: versão final com transparência

Arquivo: [saci-walk-v2.png](../assets/images/expansion/saci-walk-v2.png). Referência/edição: `saci-walk-v1.png`.

```text
Edit target: attached Saci sprite atlas. Remove ALL colored background between and around the eight sprites, output genuinely transparent alpha (not a painted checkerboard). Preserve exactly the eight characters, cap, pipe smoke, whirlwind leaves and dust strokes. Same positions, 4 columns 2 rows, all artwork unchanged except background removal. Transparent pixels must separate every sprite cell. No new background.
```
