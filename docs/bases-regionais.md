# Bases regionais: Vila do Trapiche (ilha) e Porteira do Pampa

O começo de cada área virou uma base em paz, como o pinheiral do Garibaldi na Mata de Araucárias. Lá ficam os
personagens da região, cada um com o seu lote. O código está em `js/mechanics/bases-regionais.js`; as posições
abaixo saem de `BASE_LOTES` e `BASE_ENFEITES` (mudou lá, muda aqui).

Prompts prontos pro Codex: `docs/bases-regionais-prompts.json`.
Como as bases ficaram no jogo: `docs/previews/base-ilha-proporcao.png` e `docs/previews/base-pampa-proporcao.png`
(geradas por `BODEGA_FOCUS=regionalBases node tests/smoke.cjs`).

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

Elipse em paz com centro em (3100, 4420) e raios 1300 × 680 (do trapiche até a encruzilhada das trilhas). Lá dentro
bicho nenhum nasce, entra ou fere o Sadi. Os postos de guarda dentro da vila ou encostados nela (até 1,3× o raio)
não nascem mais. O mato, as árvores e as pedras não nascem nos lotes nem na frente deles.

Já estavam ali e não mudaram: o trapiche e o barco do seu Nereu (2950, ~4800), o fogo do trapiche (2790, 4700),
a placa (3230, 4660) e a oficina do John Griggs com a barraca (≈ 2400–2720, 4380–4650).

| Lote (`id`) | O que é | Caixa da arte x, y, larg × alt | Porta (frente) | Quem fica | Aparece quando |
|---|---|---|---|---|---|
| `ilha-oratorio-monge` | Oratório do monge João Maria | 2350, 3651, 560 × 539 | (2596.4, 4245) | monge João Maria | depois de conhecê-lo na Fogueira do monge (mata da cerração) |
| `ilha-quartel-canabarro` | Quartel farrapo do general Canabarro | 3290, 3739, 660 × 461 | (3606.8, 4255) | general Canabarro | depois de conhecê-lo no Acampamento do Canabarro, no alto da ilha; sai daqui quando o Sadi o encontra no pampa |
| `ilha-casa-nereu` | Casa do seu Nereu, o barqueiro | 3450, 4276, 560 × 374 | (3662.8, 4705) | ninguém (o Nereu segue no barco) | sempre |

O oratório fica a noroeste da vila, na trilha que vai pra capela. O quartel fica a nordeste, ao lado da trilha que
sobe pra fortaleza. A casa do Nereu fica a leste do trapiche, perto da praia.

| Enfeite (`id`) | O que é | Pé (x, y) | Largura |
|---|---|---|---|
| `ilha-varal-redes` | Varal de redes de pesca | (4170, 4580) | 260 |
| `ilha-poco` | Poço da vila | (3250, 4480) | 110 |
| `ilha-banco-cruzeiro` | Banco e cruzeiro do monge | (2930, 4160) | 160 |
| `ilha-canoa-virada` | Canoa virada no cavalete (na areia) | (3660, 4850) | 290 |

## Pampa: Porteira do Pampa (trecho 1)

O trecho 1 já não tinha bicho. A vila fica dentro das taipas (elipse com centro em ≈ (2100, 1050) e raios
1500 × 850), com a estrada passando em x ≈ 1900. Capim, pedras, umbus, caveiras, lanças caídas e carretas não nascem
nos lotes nem nos enfeites.

Já estavam ali e não mudaram: a ferraria do seu Zeferino (1120, 590, 470 × 313; forja em (1355, 937)) e o
acampamento do Garibaldi com o fogo e a barraca (centro ≈ (2560, 860)).

| Lote (`id`) | O que é | Caixa da arte x, y, larg × alt | Porta (frente) | Quem fica | Aparece quando |
|---|---|---|---|---|---|
| `pampa-casa-comando` | Casa de comando farroupilha | 2070, 128, 800 × 552 | (2454, 735) | coronel Neto; o Canabarro fica à esquerda e o Bento à direita | Neto: depois de conhecê-lo; Canabarro: depois de encontrá-lo no pampa; Bento: depois de libertado |
| `pampa-casa-anita` | Rancho da Anita e do Garibaldi | 3020, 340, 560 × 441 | (3272, 836) | Anita (o Garibaldi segue no fogo) | depois de conhecer a Anita |
| `pampa-rancho-lanceiros` | Rancho dos Lanceiros Negros | 2070, 1154, 1020 × 397 | (2299.5, 1606) | o Lanceiro Negro | depois de conhecê-lo |

A casa de comando e o rancho da Anita ficam lado a lado no fundo da vila, ao norte do fogo. O rancho dos Lanceiros
fica ao sul do fogo, encostado na taipa de baixo. A casa de comando é a maior e a mais importante; o rancho dos
Lanceiros é comprido e baixo.

| Enfeite (`id`) | O que é | Pé (x, y) | Largura |
|---|---|---|---|
| `pampa-palanque` | Palanque com dois cavalos encilhados | (1460, 1260) | 380 |
| `pampa-poco` | Poço de sarilho, entre a casa de comando e o rancho da Anita | (2935, 890) | 120 |
| `pampa-carreta` | Carreta de boi descansando | (1030, 1440) | 340 |
| `pampa-lenha` | Pilha de lenha com cepo e machado | (3230, 1500) | 180 |
| `pampa-bebedouro` | Bebedouro de tronco | (1660, 1130) | 220 |

## Os moradores

Cada morador aparece em pé na frente do seu lote, com "Prosear com …" (falas novas que giram a cada conversa).
Os fogos onde o Sadi conhece cada um continuam iguais. Pra mudar ou acrescentar alguém, use `BASE_LOTES`
(dono do lote) ou `BASE_VISITAS` (quem fica junto do lote de outro) e `BASE_FALAS`.

## Proporção e implantação

As seis casas usam as portas como referência de escala (cerca de 125 pixels no mundo), mantendo a proporção original de cada PNG. O rancho dos Lanceiros é comprido, mas suas portas têm a mesma escala das outras casas. `portaX` indica a posição relativa da porta na arte; `trilha` liga a entrada ao caminho do povoado.

Os caminhos de terra são desenhados no cache do terreno. O pátio do primeiro trecho do pampa foi ampliado antes de gerar a taipa, para que cerca e circulação correspondam às casas maiores. As posições antigas de saves que caiam dentro de uma casa são levadas para um ponto livre diante da porta.
