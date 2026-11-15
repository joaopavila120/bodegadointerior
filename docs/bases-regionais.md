# Bases regionais: Vila do Trapiche (ilha) e Porteira do Pampa

O começo de cada área virou uma base em paz, como o pinheiral do Garibaldi na Mata de Araucárias. Lá ficam os
personagens da região, cada um com o seu lote. O código está em `js/mechanics/bases-regionais.js`; as posições
abaixo saem de `BASE_LOTES` e `BASE_ENFEITES` (mudou lá, muda aqui).

Prompts prontos pro Codex: `docs/bases-regionais-prompts.json`.
Fotos dos lotes como estão hoje: `docs/previews/base-ilha-lotes.jpg` e `docs/previews/base-pampa-lotes.jpg`.

## Como a arte entra no jogo

1. Gerar cada imagem do `bases-regionais-prompts.json` com fundo **transparente de verdade** e salvar no `path` dela
   (`assets/images/bases/<id>.png` para as casas, `assets/images/bases/enfeites/<id>.png` para os enfeites).
2. Rodar `python scripts/trim-bases.py`. Ele corta a sobra transparente: o jogo apoia a imagem pela última linha com
   pixel, então sobra embaixo faz a casa flutuar e sobra dos lados encolhe a casa no lote.
3. Abrir o jogo. Não precisa mexer em código:
   - a casa aparece sozinha no lote, encaixada na caixa (sem distorcer) e apoiada no pé;
   - a parte de baixo da caixa (os 42% de baixo, menos 14 px de cada lado) vira chão sólido;
   - a placa de lote, as estacas e a corda somem;
   - o enfeite aparece no ponto dele com a largura indicada e o pé vira sólido (uma elipse estreita).

Câmera e estilo: vista de cima em 3/4 (fachada virada pro sul, telhado visível), não isométrica, como a
`assets/images/island/vila-pesqueira-v1.png`, a `capela-costeira-v1.png` e a ferraria do pampa
(`assets/images/pampa/pampa-props-v1.png`). Sem gente, sem placa, sem texto, sem sombra no chão: as pessoas, a
sombra e as placas o jogo desenha.

## Ilha da Fortaleza: Vila do Trapiche

Elipse em paz com centro em (2950, 4420) e raios 950 × 600 (do trapiche até a encruzilhada das trilhas). Lá dentro
bicho nenhum nasce, entra ou fere o Sadi. Os postos de guarda dentro da vila ou encostados nela (até 1,3× o raio)
não nascem mais. O mato, as árvores e as pedras não nascem nos lotes nem na frente deles.

Já estavam ali e não mudaram: o trapiche e o barco do seu Nereu (2950, ~4800), o fogo do trapiche (2790, 4700),
a placa (3230, 4660) e a oficina do John Griggs com a barraca (≈ 2400–2720, 4380–4650).

| Lote (`id`) | O que é | Caixa da arte x, y, larg × alt | Porta (frente) | Quem fica | Aparece quando |
|---|---|---|---|---|---|
| `ilha-oratorio-monge` | Oratório do monge João Maria | 2520, 3990, 260 × 230 | (2650, 4250) | monge João Maria | depois de conhecê-lo na Fogueira do monge (mata da cerração) |
| `ilha-quartel-canabarro` | Quartel farrapo do general Canabarro | 3270, 3960, 360 × 270 | (3450, 4260) | general Canabarro | depois de conhecê-lo no Acampamento do Canabarro, no alto da ilha; sai daqui quando o Sadi o encontra no pampa |
| `ilha-casa-nereu` | Casa do seu Nereu, o barqueiro | 3390, 4360, 300 × 240 | (3540, 4630) | ninguém (o Nereu segue no barco) | sempre |

O oratório fica a noroeste da vila, na trilha que vai pra capela. O quartel fica a nordeste, ao lado da trilha que
sobe pra fortaleza. A casa do Nereu fica a leste do trapiche, perto da praia.

| Enfeite (`id`) | O que é | Pé (x, y) | Largura |
|---|---|---|---|
| `ilha-varal-redes` | Varal de redes de pesca | (3870, 4560) | 200 |
| `ilha-poco` | Poço da vila | (3250, 4480) | 110 |
| `ilha-banco-cruzeiro` | Banco e cruzeiro do monge | (2920, 4150) | 160 |
| `ilha-canoa-virada` | Canoa virada no cavalete (na areia) | (3620, 4790) | 200 |

## Pampa: Porteira do Pampa (trecho 1)

O trecho 1 já não tinha bicho. A vila fica dentro das taipas (elipse com centro em ≈ (1900, 830) e raios
1050 × 400), com a estrada passando em x ≈ 1900. Capim, pedras, umbus, caveiras, lanças caídas e carretas não nascem
nos lotes nem nos enfeites.

Já estavam ali e não mudaram: a ferraria do seu Zeferino (1120, 590, 470 × 313; forja em (1355, 937)) e o
acampamento do Garibaldi com o fogo e a barraca (centro ≈ (2560, 860)).

| Lote (`id`) | O que é | Caixa da arte x, y, larg × alt | Porta (frente) | Quem fica | Aparece quando |
|---|---|---|---|---|---|
| `pampa-casa-comando` | Casa de comando farroupilha | 2040, 380, 360 × 260 | (2220, 670) | coronel Neto; o Canabarro fica à esquerda e o Bento à direita | Neto: depois de conhecê-lo; Canabarro: depois de encontrá-lo no pampa; Bento: depois de libertado |
| `pampa-casa-anita` | Rancho da Anita e do Garibaldi | 2600, 400, 300 × 240 | (2750, 670) | Anita (o Garibaldi segue no fogo) | depois de conhecer a Anita |
| `pampa-rancho-lanceiros` | Rancho dos Lanceiros Negros | 2060, 980, 340 × 175 | (2230, 1185) | o Lanceiro Negro | depois de conhecê-lo |

A casa de comando e o rancho da Anita ficam lado a lado no fundo da vila, ao norte do fogo. O rancho dos Lanceiros
fica ao sul do fogo, encostado na taipa de baixo. A casa de comando é a maior e a mais importante; o rancho dos
Lanceiros é comprido e baixo.

| Enfeite (`id`) | O que é | Pé (x, y) | Largura |
|---|---|---|---|
| `pampa-palanque` | Palanque com dois cavalos encilhados | (1620, 1080) | 260 |
| `pampa-poco` | Poço de sarilho, entre a casa de comando e o rancho da Anita | (2500, 590) | 120 |
| `pampa-carreta` | Carreta de boi descansando | (1450, 1150) | 260 |
| `pampa-lenha` | Pilha de lenha com cepo e machado | (2560, 1100) | 150 |
| `pampa-bebedouro` | Bebedouro de tronco | (1700, 640) | 180 |

## Os moradores

Cada morador aparece em pé na frente do seu lote, com "Prosear com …" (falas novas que giram a cada conversa).
Os fogos onde o Sadi conhece cada um continuam iguais. Pra mudar ou acrescentar alguém, use `BASE_LOTES`
(dono do lote) ou `BASE_VISITAS` (quem fica junto do lote de outro) e `BASE_FALAS`.
