# Arte e integração: caverna, moradores e montaria

Implementado na branch `mundo-aberto`. As 17 imagens finais ficam em [assets/images/expansion](../assets/images/expansion/).

## Como encontrar as novidades

- A entrada da caverna leva ao refúgio seguro de São Dunstano. Ele explica o combate, a mineração, as escadas e as melhorias. A ferraria substitui a bancada de Mano Lima; melhorias existentes são preservadas.
- Combate começa no segundo andar. Teiniaguá, onça-parda e Anhangá entram progressivamente, além das criaturas anteriores com novas animações.
- Cavalo crioulo: Casa do Campeiro, R$ 900. Aumenta a velocidade externa em 65%, monta automaticamente ao sair e fica fora dos interiores. No campo/curral, aproxime-se do palanque e use E para guardar ou buscar. Compra e estado são salvos.
- Padre Romio celebra as missas, visita a bodega e alterna entre capela e passeio pela Serra.
- Olmiro Mimoso percorre as estradas montado, alternando Vila, Serra e Santa Catarina conforme o dia. Conversa sobre tropeirismo.
- As 44 cartas existentes têm retratos. Os cavalos selvagens têm sprites preparados, sem surgimento no mapa por enquanto.

## Organização técnica

- `js/render/expansion-art.js`: atlas, quadros, minerais, animações, cartas e textura de chão em cache.
- `js/render/expansion-art-crops.js`: recortes e pontos de apoio.
- `tools/expansion-bounds.py`: lê alfa e atualiza os recortes, sem modificar imagens.
- `js/mechanics/mountain-expansion.js`: São Dunstano, ferraria, cavalo, Romio e Olmiro.
- `dialogos.txt`: novas seções `[padre_romio]` e `[olmiro]`.
- `tests/mountain-scenarios.js`: regressões de combate, segurança, compra, persistência, moradores e recortes.
- Validação: `node tests/smoke.cjs`. Prévia focada em PowerShell: `$env:BODEGA_FOCUS='mountain'; node tests/smoke.cjs`.

As folhas de criaturas usam três passos e um ataque por linha. Sadi usa preparação, golpe, conclusão e dano em três direções. Cavalos e Romio usam quatro passos em três direções; a direção esquerda espelha a direita. Secundários usam dois passos em três direções. Os recortes conservam escala por personagem e alinham os pés.

## Referências consultadas

Os retratos são interpretações em pixel art, não reproduções das fotografias. Os personagens já presentes usam também os sprites locais como referência de identidade.

- [Teiniaguá e Salamanca — UFRGS](https://lume.ufrgs.br/bitstream/10183/25130/1/000752303.pdf)
- [Dunstano e a ferraria](https://stdunstan.net/rectors-update-tue-5-19/)
- [São Dunstano — Canterbury Historical and Archaeological Society](https://www.canterbury-archaeology.org.uk/dunstan-biog)
- [Anhangá — MultiRio](https://multirio.rj.gov.br/index.php/multiclube/3a5/diz-a-lenda/13059-anhang%C3%A1)
- [Retrato de Anita Garibaldi — Museu Histórico Nacional](https://mhn.acervos.museus.gov.br/acervo-museologico/retrato-pintura-113/)
- [Antonieta de Barros — ALESC](https://gerenciacultural.alesc.sc.gov.br/antonieta-retratos-de-uma-heroina-da-patria/)
- [Quatro Troncos Missioneiros — Unipampa](https://unipampa.edu.br/portal/unipampa-aprova-concessao-do-titulo-de-doutor-honoris-causa-aos-quatro-troncos-missioneiros)
- [Teixeirinha — Jornal do Comércio](https://www.jornaldocomercio.com/_conteudo/cultura/2020/08/751170-album-lancado-on-line-traz-teixeirinha-em-gravacoes-ineditas.html)
- [Bento Gonçalves — Portal das Missões](https://portaldasmissoes.com.br/outros/noticias/unica-imagem-de-bento-goncalves-encontrada-em-museu-897)
- [Erico Verissimo — Academia Brasileira de Letras](https://www.academia.org.br/artigos/erico-ou-arte-de-contar-historias)
- [Cruz e Sousa — Fundação Catarinense de Cultura](https://cultura.sc.gov.br/noticias/23727-24-de-novembro-aniversario-de-cruz-e-sousa-tera-atividades-dedicadas-ao-poeta)

## Geração e prompts finais

Modo: ferramenta integrada `image_gen`, geração de PNG. Transparência verdadeira nas folhas de sprites; terreno e retratos opacos. Arquivos gerados foram copiados para o projeto. A integração faz recorte e escala em canvas, sem alterar os originais.

### cave-beasts-a-v1.png

[Imagem final](../assets/images/expansion/cave-beasts-a-v1.png)

```text
Use case: stylized-concept. Production pixel-art game sprite atlas, transparent background, NO text labels, NO grid lines. Exactly 4 columns x 4 rows equal cells, generous transparent margins, each complete creature centered in its own cell, no overlaps. Warm detailed 2D pixel art with dark brown outlines, 3/4 overhead RPG perspective, readable silhouettes. Row 1: wild boar dark brown tusks. Row 2: Sanguanel small red woodland goblin, red pointed cap, mischievous face. Row 3: Boitata living fiery serpent with bright eyes, coiled low body. Row 4: gray werewolf upright with long claws. Columns for EVERY row: walk contact A, walk passing, walk contact B, single dramatic attack pose. All face right; body size stays consistent between frames. No ground, no scenery, no glows filling the background; transparent alpha.
```

### cave-beasts-b-v1.png

[Imagem final](../assets/images/expansion/cave-beasts-b-v1.png)

```text
Use case: stylized-concept. Pixel art production sprite atlas for Bodega do Sadi, detailed rustic warm palette dark outlines matching hand-drawn 2D RPG characters, transparent alpha background. NO labels, NO grid lines. Equal cells with 8% empty margins, absolutely no touching adjacent cells. Exactly 4 columns x 4 rows. Row 1 Mula sem Cabeca: dark brown HEADLESS mule, a flame coming out of neck stump, no head. Row 2 Teiniagua: small emerald green gecko with wide toe pads and a glowing ruby on its forehead, long curly tail, NOT a dragon. Row 3 onca-parda: tawny cougar/puma, NO spots, long tail, white muzzle. Row 4 Anhanga: spectral white deer with red eyes and antlers, folkloric forest apparition. Columns each row: walking contact A, walking passing, walking contact B, one attacking pose. All facing right. Consistent sizes in each row.
```

### cave-props-v1.png

[Imagem final](../assets/images/expansion/cave-props-v1.png)

```text
Use case: stylized-concept. Pixel art production sprite atlas for Bodega do Sadi, detailed rustic warm palette dark outlines matching hand-drawn 2D RPG characters, transparent alpha background. NO labels, NO grid lines. Equal cells with 8% empty margins, absolutely no touching adjacent cells. Exactly 4 columns x 3 rows equal cells isolated objects. Row1: a rough basalt boulder; a boulder cracked through middle; an amethyst ore boulder with purple crystal cluster; agate ore boulder with orange banded geode. Row2: loose purple amethyst crystal cluster; loose orange banded agate; an old iron-banded wooden treasure chest closed; same chest open. Row3: wooden ladder descending into square stone hole; blacksmith workbench with anvil bellows tools and glowing stone forge; glowing blue translucent ghost of Saint Dunstan old bearded monk in robes with hammer and smith tongs, benevolent; rustic torch on iron stand. Three-quarter overhead RPG view, no background, no floor under sprites.
```

### sadi-combat-v1.png

[Imagem final](../assets/images/expansion/sadi-combat-v1.png)

```text
Use case: stylized-concept. Pixel art production sprite atlas for Bodega do Sadi, detailed rustic warm palette dark outlines matching hand-drawn 2D RPG characters, transparent alpha background. NO labels, NO grid lines. Equal cells with 8% empty margins, absolutely no touching adjacent cells. Exactly 4 columns x 3 rows equal cells. Same Sadi in every cell: young adult gaucho brown wavy hair, short beard and thick mustache, cream rolled sleeve shirt and cream apron, red neckerchief, charcoal baggy bombacha trousers, brown tall boots. Row1 facing down/front; row2 facing right; row3 facing UP/back with back of head visible. Columns: 1 draws back machete in right hand preparing strike, 2 swings machete extended in attack, 3 follows through after swing, 4 recoils from damage with empty left hand raised and machete lowered. FULL BODY. Same grounded scale, generous room for weapon, no cropping, no trails beyond cell. All 12 poses.
```

### sadi-mounted-v1.png

[Imagem final](../assets/images/expansion/sadi-mounted-v1.png)

```text
Use case: stylized-concept. Production detailed pixel-art sprites for rustic 2D overhead RPG Bodega do Sadi. Warm earthy palette dark brown outlines. Transparent alpha background. Strict equally spaced grid, 8% empty padding EACH cell. No text, no labels, no background, no shadows connecting cells. 4 columns x 3 rows sprite sheet. Sadi riding a chestnut Crioulo horse with black mane, leather gaucho saddle and sheepskin seat, reins held in hands. Sadi has wavy brown hair beard mustache, cream shirt and apron, red neckerchief, dark bombacha trousers brown boots. Row1 riding toward camera/front; row2 riding right side; row3 riding AWAY/back. Four distinct walking horse steps across columns, no galloping. Same character, same horse, same size throughout. Full animal and rider visible in every cell, all ears and hooves intact.
```

### olmiro-mounted-v1.png

[Imagem final](../assets/images/expansion/olmiro-mounted-v1.png)

```text
Use case: stylized-concept. Production detailed pixel-art sprites for rustic 2D overhead RPG Bodega do Sadi. Warm earthy palette dark brown outlines. Transparent alpha background. Strict equally spaced grid, 8% empty padding EACH cell. No text, no labels, no background, no shadows connecting cells. 4 columns x 3 rows sprite sheet. Olmiro Mimoso, old gaucho cattle drover, very THICK gray-black moustache, weathered face, wide dark gaucho hat, brown waistcoat cream shirt red scarf, exceptionally wide baggy bombachas and leather boots, ALWAYS RIDING a dark bay Crioulo horse with leather saddle sheepskin pack blanket. Row1 riding toward camera/front; row2 riding right side; row3 riding AWAY/back. Four distinct slow walking horse steps per row, reins in hand, same size, full body horse rider hooves ears visible, room between cells.
```

### wild-horses-v1.png

[Imagem final](../assets/images/expansion/wild-horses-v1.png)

```text
Use case: stylized-concept. Production detailed pixel-art sprites for rustic 2D overhead RPG Bodega do Sadi. Warm earthy palette dark brown outlines. Transparent alpha background. Strict equally spaced grid, 8% empty padding EACH cell. No text, no labels, no background, no shadows connecting cells. 4 columns x 3 rows sprite sheet. Three WILD unsaddled Crioulo horses: row1 buckskin horse black mane; row2 chestnut horse flaxen mane; row3 gray dapple horse. All facing right. Columns: standing idle; walking step A; walking step B; walking step C. NO human, NO saddle, NO tack, complete anatomy, full tails and hooves in each cell.
```

### padre-romio-v1.png

[Imagem final](../assets/images/expansion/padre-romio-v1.png)

```text
Use case: stylized-concept. Production detailed pixel-art sprites for rustic 2D overhead RPG Bodega do Sadi. Warm earthy palette dark brown outlines. Transparent alpha background. Strict equally spaced grid, 8% empty padding EACH cell. No text, no labels, no background, no shadows connecting cells. 4 columns x 3 rows sprite sheet. Padre Romio a kind middle-aged southern Brazilian gaucho Catholic priest: short graying dark hair, modest moustache, black cassock with white clerical collar, wooden crucifix on neck, dark leather boots, small brown gaucho leather belt. Row1 walking toward camera front; row2 walking right side; row3 walking away back. Four distinct walk frames per row, arms swing gently, identical face and clothes, full body, entire feet inside cells.
```

### secondary-common-v1.png

[Imagem final](../assets/images/expansion/secondary-common-v1.png)

```text
Use case: stylized-concept. Pixel art RPG walking sprite atlas. Transparent alpha. Warm rustic detailed pixels dark brown outlines, slight overhead camera. STRICT evenly spaced equal grid, each figure fully inside own cell with padding. No text no lines no background. Exactly 6 columns x 4 rows equal cells. Each row is ONE person, columns 1-2 walking toward viewer two alternate steps, columns 3-4 walking RIGHT two alternate steps, columns 5-6 walking AWAY/back two alternate steps. Row1 Lucia: brown hair in bun, blue plaid shirt, blue jeans, boots. Row2 Anselmo/Arlindo: gray bearded elderly gaucho in brown hat vest cream shirt dark gray bombacha boots. Row3 Rosa: brown curly hair, terracotta blouse green long skirt brown shoes. Row4 Nair: elderly woman white bun mustard cardigan floral blouse navy skirt. Same person appearance across row.
```

### secondary-inter-v1.png

[Imagem final](../assets/images/expansion/secondary-inter-v1.png)

```text
Use case: stylized-concept. Pixel art RPG walking sprite atlas. Transparent alpha. Warm rustic detailed pixels dark brown outlines, slight overhead camera. STRICT evenly spaced equal grid, each figure fully inside own cell with padding. No text no lines no background. Exactly 6 columns x 6 rows equal cells. Each row ONE person; columns1-2 front walking alternate steps, cols3-4 RIGHT walking alternate steps, cols5-6 BACK walking alternate steps. Six Internacional fans in red/white rustic gaucho clothes: row1 brown bearded young man red shirt white apron gray bombacha; row2 brown bun young woman red white-trim full dress; row3 white beard old man brown hat red poncho gray bombacha; row4 curly brown hair woman white blouse red skirt; row5 black beard man brown hat white shirt red striped poncho gray bombacha; row6 clean shaven young man red beret red thin white striped shirt white bombacha. Full bodies. Keep identities same across row.
```

### secondary-gremio-v1.png

[Imagem final](../assets/images/expansion/secondary-gremio-v1.png)

```text
Use case: stylized-concept. Pixel art RPG walking sprite atlas. Transparent alpha. Warm rustic detailed pixels dark brown outlines, slight overhead camera. STRICT evenly spaced equal grid, each figure fully inside own cell with padding. No text no lines no background. Exactly 6 columns x 6 rows equal cells. Each row ONE person; columns1-2 front walking alternate steps, cols3-4 RIGHT walking alternate steps, cols5-6 BACK walking alternate steps. Six Gremio fans in BLUE BLACK WHITE rustic gaucho clothes: row1 brown bearded man blue black striped football shirt brown bombacha boots; row2 brown bun woman blue plaid shirt jeans; row3 white beard older man brown hat blue poncho gray bombacha; row4 curly brunette woman blue blouse black full skirt; row5 black moustache man black hat blue black striped shirt gray bombacha; row6 young clean shaven man blue beret white shirt blue scarf dark bombacha. No lettering. Full bodies.
```

### secondary-gremio2-v1.png

[Imagem final](../assets/images/expansion/secondary-gremio2-v1.png)

```text
Use case: stylized-concept. Pixel art RPG walking sprite atlas. Transparent alpha. Warm rustic detailed pixels dark brown outlines, slight overhead camera. STRICT evenly spaced equal grid, each figure fully inside own cell with padding. No text no lines no background. Exactly 6 columns x 6 rows equal cells. Each row ONE person; columns1-2 front walking alternate steps, cols3-4 RIGHT walking alternate steps, cols5-6 BACK walking alternate steps. Six additional Gremio football fans dressed traditional blue black white: row1 older black mustache man black hat blue black striped jersey dark bombacha; row2 middle aged woman brown bun blue dress white apron; row3 old white beard man blue hat black waistcoat blue shirt gray bombacha; row4 young curly black hair woman white blouse blue long skirt; row5 stubbled man brown hat blue black striped poncho dark trousers; row6 boy brown hair blue beret striped blue black football shirt white bombacha. Full bodies.
```

### cards-bodega-v1.png

[Imagem final](../assets/images/expansion/cards-bodega-v1.png)

```text
Use case: stylized-concept. A collectible card ART atlas, exactly 4 columns x 4 rows, equal rectangular portrait panels, each panel portrait ratio 2:3. Entire atlas aspect 8:12. Original simplified pixel-art bust portraits with rustic warm brown outlines, muted painted backdrop behind each, readable distinctive faces, consistent game style. No lettering, no card numbers, no captions, no borders or gutters, NO text. Each cell fills exactly its quadrant and shows ONE listed subject. Preserve recognisable features of historical people, artistic interpretation. In strict row-major order left-to-right then next row: 1. Valter, middle aged black moustache dark hair olive green shirt brown trousers in rustic shop; 2. Badin o Colono, comic Italian Brazilian farmer, brown bowl haircut small moustache plaid shirt straw hat vineyard; 3. Guri de Uruguaiana, black long hair thick black moustache red scarf gaucho hat; 4. Marcio da Casona, young Brazilian smiling man brown hair yellow t-shirt rooftop barbecue; 5. Marcelo da Casona, twin Brazilian man dark hair beard blue plaid shirt rooftop; 6. Indavirus Gustavo Porco, sturdy jovial Brazilian bearded reporter brown hat with microphone; 7. Lauro Bolador, older stocky gray haired German Brazilian man blue shirt holding bocce ball; 8. Peixinho na Brasa, Brazilian fisherman smiling dark moustache cap red shirt grilled fish; 9. Mano Lima, aged brown weathered gaucho face long thick black moustache beret red scarf accordion; 10. Dianho Fernando Schmidt, short dark beard black cap and black t-shirt stern comic pose; 11. Mito do Sul Almir, Brazilian dark beard gamer cap blue black Gremio jersey; 12. Loli Gebien, young blond German Brazilian man feather hat lederhosen holding beer mug; 13. Jayme Caetano Braun, old gaucho black wide hat grey thick moustache poncho holding book; 14. Baitaca singer, middle aged thick black moustache brown gaucho hat dark hair red scarf guitar; 15. Negrinho do Pastoreio, young Black child in humble gaucho clothes carrying a candle by horses, respectful hopeful; 16. Lobisomem, gray werewolf under moonlit araucaria
```

### cards-history-v1.png

[Imagem final](../assets/images/expansion/cards-history-v1.png)

```text
Use case: stylized-concept. A collectible card ART atlas, exactly 4 columns x 4 rows, equal rectangular portrait panels, each panel portrait ratio 2:3. Entire atlas aspect 8:12. Original simplified pixel-art bust portraits with rustic warm brown outlines, muted painted backdrop behind each, readable distinctive faces, consistent game style. No lettering, no card numbers, no captions, no borders or gutters, NO text. Each cell fills exactly its quadrant and shows ONE listed subject. Preserve recognisable features of historical people, artistic interpretation. In strict row-major order left-to-right then next row: 1. Bento Goncalves, historical Brazilian revolutionary leader dark swept hair long sideburns military dark coat gold epaulets; 2. Giuseppe Garibaldi, historical older man reddish gray full beard red shirt dark cap; 3. Anita Garibaldi, historical young Brazilian woman dark center parted hair red scarf cream riding blouse courageous; 4. David Canabarro, elderly Brazilian commander receding gray hair moustache dark uniform gold epaulets; 5. Antonio de Souza Netto, historical Brazilian officer short dark curled hair sideburns dark military uniform; 6. Lanceiros Negros, dignified Black Farroupilha cavalry soldier red scarf dark coat holding spear; 7. Sepe Tiaraju, Guarani leader tan skin long straight black hair simple mission-era clothes holding spear mission ruins; 8. Roque Gonzalez, 17th century Jesuit priest dark hair short beard black robe white collar wooden cross; 9. Cruz e Sousa, Black Brazilian poet short curly hair small moustache formal black suit white high collar; 10. Hermann Blumenau, 19th century older German man gray beard balding high forehead dark frock coat; 11. Victor Meirelles, Brazilian 19th century painter full dark beard receding hair black suit with brush; 12. Antonieta de Barros, Black Brazilian teacher short waved hair round spectacles dark 1930s dress with white collar and book; 13. Monge Joao Maria, old pilgrim long white beard long hair rustic dark robe wooden staff; 14. Hercilio Luz, older Brazilian politician bushy gray moustache receding hair formal dark suit spectacles; 15. Teixeirinha, smiling Brazilian singer wavy dark hair small moustache white shirt red scarf acoustic guitar; 16. Gildo de Freitas, jovial heavyset aged gaucho singer dark hair and moustache black hat vest guitar
```

### cards-voices-v1.png

[Imagem final](../assets/images/expansion/cards-voices-v1.png)

```text
Use case: stylized-concept. A collectible card ART atlas, exactly 4 columns x 3 rows, equal rectangular portrait panels, each panel portrait ratio 2:3. Entire atlas aspect 8:9. Original simplified pixel-art bust portraits with rustic warm brown outlines, muted painted backdrop behind each, readable distinctive faces, consistent game style. No lettering, no card numbers, no captions, no borders or gutters, NO text. Each cell fills exactly its quadrant and shows ONE listed subject. Preserve recognisable features of historical people, artistic interpretation. In strict row-major order left-to-right then next row: 1. Elis Regina, Brazilian singer short dark pixie hair wide smile holding vintage microphone; 2. Lupicinio Rodrigues, Black Brazilian composer receding dark hair thin moustache suit bowtie guitar; 3. Pedro Raymundo, smiling dark haired Brazilian singer gaucho broad hat scarf accordion; 4. Noel Guarany, Brazilian missioneiro singer thick dark beard shoulder length hair gaucho beret acoustic guitar; 5. Paixao Cortes, elderly gaucho traditionalist thick gray moustache broad hat red scarf bombacha; 6. Barbosa Lessa, older Brazilian writer wavy gray hair round glasses brown blazer holding book; 7. Simoes Lopes Neto, historical middle aged writer dark combed hair thick moustache suit bowtie; 8. Erico Verissimo, older Brazilian writer round glasses neatly parted gray hair gray moustache suit and book; 9. Mario Quintana, frail old Brazilian poet bald forehead wispy white side hair light suit gentle smile; 10. Sanguanel, red capped tiny woodland goblin among ferns; 11. Boitata, glowing fiery serpent in wetlands at night; 12. Mula sem Cabeca, headless brown mule flames coming out of neck under moonlight
```

### horse-tether-v1.png

[Imagem final](../assets/images/expansion/horse-tether-v1.png)

```text
Use case: stylized-concept. One production pixel art RPG sprite on true transparent alpha background, NO labels, no scenery. A chestnut Crioulo horse with BLACK mane and BLACK tail, small white forehead marking, brown leather gaucho saddle with off-white sheepskin seat, reins loosely laid over neck, stirrups visible. Standing calmly facing right, full body all ears tail hooves visible, slightly overhead 3/4 RPG view. Rustic warm detailed pixel art dark brown outlines, same proportions as mounted Sadi horse. NO rider, no person, NO rope attached outside canvas, generous transparent margins.
```

### cave-terrain-v1.png

[Imagem final](../assets/images/expansion/cave-terrain-v1.png)

```text
Use case: stylized-concept. A pixel art cave tileset atlas with EXACTLY 2 columns and 2 rows, four equal square textures filling each quadrant edge to edge. NO margins, no grid lines, no labels, no transparency. Muted warm charcoal basalt and earthy brown palette for top-down RPG. TOP LEFT: seamless natural rough cave floor, small low contrast gravel, mostly walkable bare soil and flat stones, no large objects. TOP RIGHT: seamless flat cave floor with subtle mineral flecks and muted damp patches, similar brightness. BOTTOM LEFT: overhead chunky layered basalt wall rocks, irregular dark fissures, light catching top edges, very clear height and rough rock grain. BOTTOM RIGHT: another variation of basalt wall with small moss in cracks. Restrained pixel clusters, no photorealistic lighting, no neon minerals. Tileable within each square, no large centerpiece.
```
