# Pescaria e identidade regional

Revisão posterior das árvores e jardins: [ipês de SC e araucárias da Serra](arte-ipes-sc.md). A descrição abaixo registra a primeira versão da arte regional; a Serra agora usa as árvores originais da Fronteira e SC usa ipês.

Artes geradas com a ferramenta integrada `image_gen` (skill imagegen), sem CLI. Os prompts finais estão abaixo.

## Arquivos

- `assets/images/fishing/uruguai-v1.png`: fundo do Rio Uruguai com trapiche. Usado em `js/render/fishing-art.js`, com versões diurna/noturna em cache.
- `assets/images/environment/regional-flora-v1.png`: oito peças transparentes: araucária, xaxim, canela-preta, juçara, hortênsias com basalto, caixote de uvas com barril, samambaias/bromélias e jardim de colônia. Recortes em `js/render/regional-identity.js`.
- `docs/previews/pescaria-renovada.png`, `pescaria-noite.png`, `regional-serra.png`, `regional-serra-vila.png`, `regional-sc.png`: capturas do jogo.

## Direção visual e referências

A Serra usa araucárias e xaxins, jardins ornamentais com hortênsias, pedra escura e detalhes da viticultura. SC representa especificamente Blumenau/Pomerode e o Vale do Itajaí, com árvores de copa fechada, juçaras, sub-bosque e canteiros junto às casas enxaimel. São paletas distintas para o jogo, não uma afirmação de que essas espécies existem exclusivamente nessas regiões.

- [ICMBio — Plano de manejo de Aparados da Serra / Serra Geral](https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/unidade-de-conservacao/unidades-de-biomas/mata-atlantica/lista-de-ucs/parna-da-serra-geral/arquivos/dcom_pm_parna_de_aparados_da_serra_encarte_3.pdf): araucária, floresta de altitude e xaxim.
- [Epagri — Boletim técnico sobre vegetação catarinense](https://publicacoes.epagri.sc.gov.br/BT/article/download/1903/1705): canela-preta e palmeira-juçara no baixo Vale do Itajaí.
- [Rota do Enxaimel / Iphan — mapa do patrimônio de Pomerode](https://rotadoenxaimel.com.br/wp-content/uploads/2022/02/MAPA-ROTA-DO-ENXAIMEL-2022-Iphan.pdf): referência cultural para os jardins das casas existentes.

## Integração

A pesca mantém um único requestAnimationFrame por sessão, recusa callbacks antigos, apresenta o quadro completo de uma vez e mantém o mapa atrás da janela parado. O personagem da pescaria usa uma pose local, sem alterar a animação do jogador no mundo. A mensagem só atualiza quando muda. Ponteiro capturado permite soltar fora do botão; desfocar solta o molinete. O fundo antigo continua disponível como fallback.

As árvores regionais substituem as artes em posições existentes, com coroas respeitando fachadas, estradas e pontos de interesse. Sprites e terreno continuam em caches limitados. Nenhuma loja, passagem, interação, região desbloqueada ou item salvo foi alterado. A suíte ampla também revelou que seguidores dos quatis podiam nascer fora da trilha; os deslocamentos agora são validados antes do nascimento.

## Prompts

### Vegetação e jardins

Production game pixel-art transparent sprite sheet: EIGHT individual decorative assets in 4 columns x 2 rows, wide transparent gutters, each fully inside its own cell, no clipping, no touching, no labels. Match reference's warm painterly detailed pixel-art materials, gentle muted natural greens, crisp pixel clusters. Top-down oblique RPG camera, front horizontal, same as existing Brazilian countryside game. TOP ROW four TREES, fully visible roots to canopy: 1 southern Brazilian araucaria angustifolia with umbrella crown and layered horizontal branches, 2 xaxim tree fern with dark short fibrous trunk and wide spreading fine fronds, 3 canela-preta Atlantic forest tree with broad rounded dense dark glossy green canopy and branching brown trunk, 4 slender single-trunk juçara palm (Euterpe edulis), no coconut, fine drooping feathery crown, natural not beach palm. BOTTOM ROW four low decorative groupings: 5 quiet blue-lavender hydrangea shrubs next to a short low weathered dark basalt stone border for Serra Gaúcha gardens, 6 low grape grower detail: small weathered wooden grape crate and small barrel with sparse grapevine on a low basalt ledge, 7 Atlantic rainforest undergrowth clump with ferns and subtle bromeliads rooted around one mossy stone, 8 low tidy cottage garden bed with restrained red pink white flowers, short pale timber edging and small terracotta pot for Pomerode houses. Trees NOT planted in pots. Rich cohesive style, no bright neon, no outline stickers, no background or scenery, real transparent alpha, no text.

### Ajuste do atlas

Keep exactly these eight pixel-art assets and their appearance, but FIX THE ATLAS PACKING for use in a game. 4 equal columns by 2 equal rows in a 1536x1024 transparent image, each object STRICTLY inside its 384x512 cell, with AT LEAST 26 pixels transparent gutter on all four sides of EACH cell. Scale each tree down uniformly to fit entirely within 332x460 pixels. No tree branches can extend into neighboring cells. The bottom four decorative groups must also stay within their cells. Preserve all individual forms, colors and details, no new objects, no labels, no background. True transparent alpha.

### Paleta final

Edit ONLY the color palette of this transparent sprite sheet. Preserve every object's exact silhouette, position, size, alpha, layout and detail. All greens are currently overly yellow, lime and saturated. Harmonize foliage into soft natural olive, sage, deep forest green and restrained highlights as in a grounded rustic pixel-art game. Reduce saturated yellow highlights considerably, especially leaf edges and grass at tree bases. Warm bark should become muted umber, not orange. Keep flowers colored but understated. Preserve pixel texture, species shape, all 8 assets and transparency. No structural or layout edits, no new background.

### Cenário da pesca

A finished painted PIXEL ART background for a southern Brazilian Rio Uruguai fishing minigame, 1520 by 840 widescreen. View from the near river bank toward distant Argentina, beautiful relaxed countryside game aesthetic, subtle pixel clusters and crisp detail, muted olive riverside woodland, soft blue-green water, warm timber. Exact production layout: horizon/far bank at 40% image height; quiet pale blue sky and distant gently rolling hills above, layered low riparian tree silhouettes along far bank. Bottom 58% is broad open calm blue-green river, MOST water remains uncluttered and quiet for a fishing line and bobber added by code. On extreme LEFT ONLY a rustic wooden pier enters from left edge, extends to 25% width, walking deck lies at 71% image height, slim timber posts descend below to bottom edge. Keep surface near x12% width y71% height free for a character added later. Small near-bank sedges only at bottom-left corner, one rope coil on far left of pier, gentle reflected light and restrained ripples, fine smooth water textures. No character, no fishing rod, no fish, no bobber, no text, no UI. Do not put objects in open water. No huge white glare, no cartoon flat shapes, no photorealism, no perspective distortion. Full-frame elegant cohesive production videogame art, charming gaucho riverbank afternoon.

