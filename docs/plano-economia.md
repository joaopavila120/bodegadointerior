# Plano de rebalanceamento da economia

O plano está **aplicado no jogo**. A seção 1 mostra os números de antes, e a seção 5 os medidos depois das mudanças.

## 1. Como estava antes

### Um dia de bodega

Simulei dias normais de expediente com os ajudantes atendendo sozinhos: "rápido" é um atendimento quase perfeito, e "normal" é a velocidade padrão dos ajudantes, perto do que um jogador sozinho consegue. O lucro está **sem salários**, que é o caso de quem joga sem ajudante.

| Fase (dia · nível) | Receita | Gorjeta | Custo da mercadoria | Despesas | Lucro rápido | Lucro normal | XP do dia |
|---|---|---|---|---|---|---|---|
| Começo (dia 4 · N1) | 213–254 | 18–22 | 127–140 | ~20 | ~115 | ~82 | 0–9 |
| Meio (dia 14 · N3–4) | 310–467 | 29–50 | 152–236 | ~29 | ~230 | ~158 | 19–43 |
| Fim (dia 34 · N6) | 480–602 | 45–68 | 237–295 | ~38 | ~313 | ~250 | 42–64 |

- Com três ajudantes, os salários somam R$ 81 por dia. No começo isso come quase todo o lucro: o lucro "normal" cai para R$ 1.
- O XP do dia é o lucro dividido por 4 (`finishDay` em `js/core/game.js`).

### A caverna, por andar

Este é o valor de limpar um andar inteiro (bichos, pedras e baú), na média de 6 sorteios, vendendo todo o minério ao São Dunstano.

| Andar | Bichos | Moedas | Minério e gemas | Baú (média) | Total |
|---|---|---|---|---|---|
| 2 | 5 | 20 | 89 | 9 | **R$ 118** |
| 5 | 8 | 53 | 77 | 30 | **R$ 160** |
| 10 | 10 | 96 | 115 | 0 | **R$ 211** |
| 14 | 10 | 108 | 253 | 15 | **R$ 376** |
| 20 | 10 | 127 | 266 | 69 | **R$ 462** |

### Recompensas e preços

- **Capítulos:** pagam de R$ 0 a R$ 200 (a bodega lendária, R$ 500). A gaita, o baú e a carta não pagam nada, e a gaita ainda custa R$ 300 de conserto.
- **Pedidos das casas:** R$ 20 a R$ 70 cada.
- **Eventos do mapa:** R$ 60 a R$ 120.
- **Melhorias da Ferragem:** R$ 4.450 no total. Decoração: R$ 1.335. Equipamento da caverna: R$ 2.060.
- **Armas da forja:** R$ 1.220, mais o minério. Cavalo: R$ 900.

## 2. O que estava desbalanceado

1. **A caverna não tem fim.** Cada vez que o Sadi entra, o andar volta inteiro: os bichos, as pedras e o baú. Isso acontece porque `enterCave` zera `caveRun`, e o andar é sorteado só pelo número dele e pelo dia. Além disso, depois de fechar a bodega o relógio para em 23h30, então de noite dá para repetir o andar 2 quantas vezes quiser. Cada volta paga uns R$ 118, mais que um dia inteiro de bodega no começo. Com isso, dá para comprar tudo em poucas noites e a progressão some.
2. **A caverna paga mais que a bodega.** Um andar fundo vale quase dois dias de expediente no fim do jogo. O minério vendido é a maior parte disso: ouro sai a R$ 60 e opala a R$ 35.
3. **As missões pagam pouco.** Um capítulo inteiro paga menos que um andar da caverna, e três capítulos do fim não pagam nada.
4. **Os ajudantes custam caro no começo.** Agora o Valter oferece ajudante já na primeira noite do capítulo 2, mas um ajudante a R$ 24–30 por dia leva de 25% a 35% do lucro dessa fase.
5. **O XP da bodega é pequeno.** São de 0 a 64 XP por dia contra degraus de 300 → 800 → 1.600 → 2.800 → 4.500 → 7.000. Até o nível 5 as conquistas e missões compensam (estimativa: N4 perto do dia 14, N5 perto do dia 21). Depois disso as conquistas acabam e os níveis 6 e 7 viram repetição: a lendária só chegaria perto do dia 65.
6. **O desejo do Saci podia valer demais.** A "melhoria de graça" sorteava uma de até R$ 650.

## 3. Metas

- **De onde vem o dinheiro:** cerca de 60% da bodega, 25% da caverna (aventura com risco, não emprego) e 15% de missões, eventos e pedidos. Essas três fontes também dão a maior parte do XP.
- **Capítulos:** cada um paga de 1 a 2 dias de lucro daquele momento do jogo.
- **Ritmo de nível:** N2 no dia 3–4, N3 no 8, N4 no 14 (libera a gaita), N5 no 22 (o baú), N6 no 32 e N7 no 45.
- **Compras grandes:** o cavalo custa de 4 a 6 dias de lucro de quando o jogador costuma comprar. A melhor espada pede cerca de uma semana de caverna mais bodega.

## 4. Mudanças (aplicadas)

### 4.1 Caverna (a mais importante)

| O quê | Hoje | Proposto |
|---|---|---|
| Andar já limpo | volta inteiro a cada entrada | **fica como o Sadi deixou até o dia seguinte**: bichos mortos, pedras quebradas, baú aberto. Estado salvo em `G.cave.today` |
| Moedas dos bichos | javali 3–6, sanguanel 2–5, teiniaguá 4–8, onça 6–10, boitatá 5–9, mula 7–12, lobisomem 8–14, anhangá 8–13; + andar/3 | javali 2–4, sanguanel 1–3, teiniaguá 3–5, onça 4–7, boitatá 3–6, mula 5–8, lobisomem 5–9, anhangá 5–9; + andar/4 |
| Venda de minério (São Dunstano) | cobre 6, ferro 9, ametista 18, ágata 28, opala 35, ouro 60 | cobre 4, ferro 6, ametista 12, ágata 18, opala 25, ouro 40 |
| Baú comum | 15 a 40 + 2×andar | 10 a 30 + 1,5×andar |

O que a forja pede de minério não muda: vender vira o destino do que sobra. Resultado esperado por andar: andar 2 ≈ R$ 80, andar 10 ≈ R$ 140, andar 20 ≈ R$ 310. Uma descida de 4 a 6 andares rende de 1 a 1,5 dia de bodega e não se repete no mesmo dia.

### 4.2 Bodega

| O quê | Hoje | Proposto |
|---|---|---|
| Preço de venda | fixo | **+4% por nível da bodega** (N7 = +24%). A fama aparece no caixa |
| XP do dia | lucro ÷ 4 | lucro ÷ 4 **+ 1 por freguês atendido** (+20 a 55 XP por dia) |
| Degraus de nível | 300 · 800 · 1.600 · 2.800 · 4.500 · 7.000 | 300 · 800 · 1.600 · 2.700 · 4.000 · 5.600 |
| Salário dos ajudantes | fixo (R$ 15 a 30) | **60% no N1, subindo 10% por nível até 100% no N5**. O Valter cobra metade na primeira semana ("ele é de casa") |
| Despesas do dia | luz + manutenção | sem mudança |

### 4.3 Recompensas da história

| Capítulo | Hoje | Proposto |
|---|---|---|
| 1 · Trago de pura | 20 XP | R$ 30 + 20 XP |
| 2 · Três noites seguidas | R$ 60 | R$ 100 |
| 3 · A Cadela Baia sumiu | R$ 80 | R$ 150 |
| 4 · O colono de Erechim | R$ 0 | R$ 50 |
| 5 · Campeonato de bocha | R$ 70 | R$ 120 |
| 6 · Queijo pra nona | R$ 50 | R$ 120 |
| 7 · Baile da comunidade | R$ 150 (doa R$ 100) | R$ 220 |
| 8 · Convite de Indaial | R$ 60 | R$ 150 |
| 9 · A gaita do vô | R$ 0 (conserto R$ 300) | R$ 250 |
| 10 · O baú do vô | R$ 0 | R$ 200 |
| 11 · A carta para a vó | R$ 0 | R$ 250 |
| 12 · Oktoberfest | R$ 200 | R$ 300 |
| 13 · Bodega lendária | R$ 500 | R$ 1.000 |

- **Secundárias:**
  - pomar: 40 → 60
  - costelão: 80 → 100
  - caderno do vô: 150 → 200
  - horta nível 5: 120 → 150
  - relíquias: 250 → 400
  - peixinho na brasa: 120 → 150
- **Pedidos das casas:** dinheiro ×1,5, ficando entre R$ 35 e R$ 105, o que paga bem acima do que os itens valeriam vendidos.
- **Eventos do mapa:** a recompensa sobe 10% por nível da bodega.

### 4.4 Preços

- **Melhorias da Ferragem:** quase todas ficam iguais. Só as do fim sobem: Mate Lendário 650 → 800, Quarta mesa 420 → 480, Xis coração 260 → 300.
- **Cavalo crioulo:** fica em R$ 900, porque agora está na Ferragem e o jogador costuma comprar no meio do jogo.
- **Equipamento da caverna e bolicho:** ficam iguais. Com menos moeda lá embaixo, o bolicho passa a pesar na decisão.
- **Desejo do Saci:** a melhoria de graça só sorteia uma de até R$ 120 + R$ 40 por nível. O dinheiro continua R$ 100 + R$ 40 por nível acima do 1.

## 5. Como ficou (medido depois das mudanças)

Mesma simulação da seção 1. O lucro está sem salários, e o XP do dia já soma o freguês atendido.

| Fase (dia · nível) | Lucro rápido | Lucro normal | XP do dia | Salário de 3 ajudantes |
|---|---|---|---|---|
| Começo (dia 4 · N2) | R$ 87–99 | R$ 96 | 28–32 | R$ 57 (era 81) |
| Meio (dia 14 · N4) | R$ 218 | R$ 213 | 68–75 | R$ 73 (era 81) |
| Fim (dia 34 · N7) | R$ 369–415 | R$ 282 | 87–131 | R$ 81 |

| Andar da caverna | 2 | 3 | 5 | 8 | 10 | 14 | 20 |
|---|---|---|---|---|---|---|---|
| Antes | 118 | 158 | 160 | 227 | 211 | 376 | 462 |
| Depois | 79 | 108 | 110 | 160 | 151 | 263 | 331 |

O andar não se repete no mesmo dia. Uma descida de 4 a 6 andares rende mais ou menos o lucro de 1 a 1,5 dia de bodega da mesma fase.

## 6. Onde está cada mudança

- **Caverna:**
  - o andar guarda o dia em `caveDayFloor` e `caveApplyDay` (`js/mechanics/caverna.js`);
  - moedas dos bichos e do baú no mesmo arquivo;
  - venda de minério em `CAVE_ORES` (`js/mechanics/forja.js`), no `BAG_RAW` de `caverna.js` e em `cave-life.js`.
- **Fama da bodega:** `fameBonus` e `price` (`js/core/helpers.js`), com o aviso no caixa (`js/mechanics/service.js`).
- **XP do dia:** `finishDay` (`js/core/game.js`). Degraus de nível: `LEVELS` (`js/mechanics/progression.js`).
- **Salários:** `staffWage` (`js/mechanics/staff.js`).
- **Recompensas:** cada missão no seu arquivo; pedidos das casas em `HOUSE_QUESTS` (`js/mechanics/missions.js`); eventos do mapa em `js/mechanics/economia.js`.
- **Preços do fim do jogo:** `UPGRADES` (`js/config/items.js`). Teto do desejo do Saci: `saciWishOptions` (`js/mechanics/saci.js`).
