// O pampa: a última região do jogo, ao sul da Serra Gaúcha, e a mais difícil. A porteira fica no fim da estrada da Serra e
// só abre depois que o almirante Grenfell cai, na Ilha da Fortaleza. É uma estrada só, de norte a sul, entre duas taipas de
// pedra: o campo aparece por cima da cerca, mas ninguém sai do caminho. O Sadi anda a pé, como na mata e na ilha.
// Quinze trechos em três regiões, cada trecho com bicho mais forte que o anterior (pampa-bichos.js):
//   · O Banhado: graxaim e teiú (2 e 3), depois o afogado na água da beira da estrada e os primeiros batedores (4 e 5).
//     Fim: o Sargento Recolhedor (6), que dá a Lança do Lanceiro Negro.
//   · As Coxilhas: os homens do Moringue: batedor, oficial de adaga e carabineiro (7 e 8). Fim: o Boi Barroso (9).
//   · Os Campos e o Cerro: a cavalaria (10 e 11), o capitão (12), o caminho do cerro (13 e 14) e o coronel Moringue (15).
// Cinco fogos, cada um com um farrapo pra prosear (pampa-progresso.js): descansar enche a vida, salva o jogo e deixa o fogo
// aceso, e de um fogo aceso dá pra ir direto pra outro. Nos ramais, bolsões com baú e chá pro bornal (voltam no dia seguinte).
// Os inimigos deixam material pras melhorias da lança na ferraria do seu Zeferino. Cada chefe tranca a cancela do trecho dele.
'use strict';

const PAMPA = { W: 3800, H: 2700, last: 15, meia: 185, ramal: 100, portas: [1900, 1500, 2300, 1650, 2150, 1500, 2250, 1700, 2100, 1600, 2200, 1800, 2050, 1700, 2100, 1900] };
// O trecho de cada acontecimento.
const PAMPA_N = { lanceiros: 5, sargento: 6, seival: 8, boi: 9, carretas: 11, capitao: 12, cerro: 14, moringue: 15 };
const PAMPA_AREAS = {
  1: { nome: 'Porteira do Pampa', regiao: 'A Porteira', aviso: 'Daqui pra frente, é seguir as taipas. A ferraria e o primeiro fogo ficam aqui.', chao: 'campo', tinta: 'rgba(196,178,74,.16)', veu: null, capim: 70, umbus: 4, pedras: 6, ramais: 0 },
  2: { nome: 'Corredor das Taipas', regiao: 'O Banhado', aviso: 'Taipa dos dois lados: foi assim que os antigos tocaram o gado até o sul. O graxaim anda em bando, e o teiú não avisa.', chao: 'campo', tinta: 'rgba(202,176,66,.18)', veu: 'rgba(150,84,24,.03)', capim: 90, umbus: 6, pedras: 8, ramais: 3 },
  3: { nome: 'Cerca Velha', regiao: 'O Banhado', aviso: 'A taipa aqui é mais velha que a guerra. Tem bicho morando em cada buraco dela.', chao: 'campo', tinta: 'rgba(190,172,74,.2)', veu: 'rgba(120,84,40,.06)', capim: 90, umbus: 5, pedras: 8, ramais: 3 },
  4: { nome: 'Beira do Banhado', regiao: 'O Banhado', aviso: 'A água chega na estrada. Cuidado com o que mexe embaixo dela.', chao: 'banhado', tinta: 'rgba(84,104,60,.24)', veu: 'rgba(34,40,78,.1)', capim: 40, umbus: 0, pedras: 3, ramais: 2 },
  5: { nome: 'Banhado das Almas', regiao: 'O Banhado', aviso: 'O chão afunda dos dois lados. Dizem que quem se afogou aqui ainda procura companhia.', chao: 'banhado', tinta: 'rgba(84,104,60,.26)', veu: 'rgba(34,40,78,.14)', capim: 34, umbus: 0, pedras: 3, ramais: 2 },
  6: { nome: 'Passo do Banhado', regiao: 'O Banhado', aviso: 'Lá na frente, alguma coisa pesada vem sendo arrastada pelo barro.', chao: 'banhado', tinta: 'rgba(84,104,60,.28)', veu: 'rgba(34,40,78,.18)', capim: 30, umbus: 0, pedras: 3, ramais: 1 },
  7: { nome: 'Coxilhas do Seival', regiao: 'As Coxilhas', aviso: 'Foi por estes campos que os farrapos venceram o Seival, em 1836. Agora é gente do Moringue atrás de cada coxilha.', chao: 'campo', coxilha: true, tinta: 'rgba(202,176,66,.2)', veu: 'rgba(150,84,24,.08)', capim: 110, umbus: 8, pedras: 10, ramais: 3 },
  8: { nome: 'Marco do Seival', regiao: 'As Coxilhas', aviso: 'Um marco de pedra e um fogo aceso: alguém ainda monta guarda neste campo.', chao: 'campo', coxilha: true, tinta: 'rgba(204,176,66,.2)', veu: 'rgba(150,80,24,.1)', capim: 100, umbus: 6, pedras: 10, ramais: 2 },
  9: { nome: 'Mangueira de Pedra', regiao: 'As Coxilhas', aviso: 'Uma mangueira de pedra atravessa o caminho. Lá de dentro vem um bufo.', chao: 'campo', coxilha: true, tinta: 'rgba(206,178,68,.2)', veu: 'rgba(150,80,24,.13)', capim: 90, umbus: 5, pedras: 8, ramais: 1 },
  10: { nome: 'Estrada das Carretas', regiao: 'Os Campos', aviso: 'Carretas largadas na beira da estrada. Quem as deixou aqui saiu com pressa, e a cavalaria imperial não anda longe.', chao: 'raso', tinta: 'rgba(214,180,70,.2)', veu: 'rgba(150,72,22,.15)', capim: 50, umbus: 1, pedras: 6, ramais: 3 },
  11: { nome: 'Pouso das Carretas', regiao: 'Os Campos', aviso: 'Um pouso de carreteiros, com o fogo ainda aceso. Em volta dele, ninguém ataca.', chao: 'raso', tinta: 'rgba(214,176,70,.22)', veu: 'rgba(150,66,22,.19)', capim: 46, umbus: 1, pedras: 6, ramais: 2 },
  12: { nome: 'Campo dos Menezes', regiao: 'Os Campos', aviso: 'Um campo raso, sem coxilha nem mato: aqui ninguém se esconde.', chao: 'raso', tinta: 'rgba(214,170,70,.22)', veu: 'rgba(140,60,26,.22)', capim: 40, umbus: 0, pedras: 5, ramais: 1 },
  13: { nome: 'Caminho do Cerro', regiao: 'O Cerro', aviso: 'As primeiras lanças fincadas na beira da estrada. O sol já baixou, e o minuano não sopra tanto.', chao: 'cerro', tinta: 'rgba(130,104,62,.26)', veu: 'rgba(40,28,58,.28)', capim: 50, umbus: 0, pedras: 24, ramais: 3 },
  14: { nome: 'Pé do Cerro', regiao: 'O Cerro', aviso: 'O último fogo antes do fim. Depois daqui, ninguém volta igual.', chao: 'cerro', tinta: 'rgba(124,100,60,.28)', veu: 'rgba(22,22,56,.36)', capim: 46, umbus: 0, pedras: 28, ramais: 2 },
  15: { nome: 'Cerro de Porongos', regiao: 'O Cerro', aviso: 'Lá no fundo, o cerro. Perto dele, o minuano para de soprar.', chao: 'cerro', tinta: 'rgba(120,96,58,.3)', veu: 'rgba(14,18,48,.42)', capim: 44, umbus: 0, pedras: 34, ramais: 0 }
};
const PAMPA_FOGOS = [
  { id: 'porteira', n: 1, nome: 'Fogo da Porteira', folk: 'garibaldi' }, { id: 'lanceiros', n: PAMPA_N.lanceiros, nome: 'Acampamento dos Lanceiros', folk: 'lanceiro' }, { id: 'seival', n: PAMPA_N.seival, nome: 'Fogo do Seival', folk: 'neto' },
  { id: 'carretas', n: PAMPA_N.carretas, nome: 'Fogo das Carretas', folk: 'anita' }, { id: 'porongos', n: PAMPA_N.cerro, nome: 'Último fogo, ao pé do cerro', folk: 'canabarro' }
];
function pampaState() { return G.pampa ??= {}; }
function pampaAberto() { return !!G.ilha?.grenfell; }
function pampaArea() { return pampaState().area || 1; }
function pampaAqui() { return worldOut?.map === 'pampa'; }
// Cada trecho de chefe só abre pro seguinte depois que ele cai.
const PAMPA_CHEFES = { [PAMPA_N.sargento]: 'sargento', [PAMPA_N.boi]: 'boi', [PAMPA_N.capitao]: 'capitao' };
function pampaSaidaAberta(n) { const c = PAMPA_CHEFES[n]; return !c || !!pampaState()[c]; }
function pampaEntrada(n, fim = false) {
  const L = pampaLayout(n), A = PAMPA_AREAS[n];
  return { map: 'pampa', n, x: fim ? L.xOut : L.xIn, y: fim ? L.H - 210 : 130, title: A.nome, text: A.aviso };
}
// O que já foi aberto ou colhido hoje em cada trecho: amanhã tem de novo.
function pampaHoje(n = pampaArea()) { const st = pampaState(); if (st.hoje?.day !== G.day) st.hoje = { day: G.day, got: {} }; return st.hoje.got[n] ??= []; }

// ---------- O caminho ----------
const pampaCache = new Map();
function pampaEstradaX(L, y) { const P = L.pts; for (let i = 1; i < P.length; i++) if (y <= P[i][1]) { const [ax, ay] = P[i - 1], [bx, by] = P[i]; return ax + (bx - ax) * (y - ay) / (by - ay || 1); } return P[P.length - 1][0]; }
function pampaLinhaDist(P, x, y) { let best = Infinity; for (let i = 1; i < P.length; i++) best = Math.min(best, ilhaSegDist(x, y, ...P[i - 1], ...P[i])); return best; }
function pampaEstradaDist(L, x, y) { return pampaLinhaDist(L.pts, x, y); }
// Canto arredondado: cada volta troca os cantos por dois pontos mais perto do meio.
function pampaSuaviza(ctrl, voltas = 3) {
  let p = ctrl;
  for (let v = 0; v < voltas; v++) { const q = [p[0]]; for (let i = 0; i < p.length - 1; i++) { const [ax, ay] = p[i], [bx, by] = p[i + 1]; q.push([ax * .75 + bx * .25, ay * .75 + by * .25], [ax * .25 + bx * .75, ay * .25 + by * .75]); } q.push(p[p.length - 1]); p = q; }
  return p;
}
// O quanto um ponto está pra dentro do caminho (negativo: pra fora dele, além da taipa).
function pampaFolga(L, x, y) {
  let best = PAMPA.meia - pampaEstradaDist(L, x, y);
  for (const r of L.ramais) best = Math.max(best, r.meia - pampaLinhaDist(r.pts, x, y));
  for (const b of L.bays) best = Math.max(best, (1 - Math.hypot((x - b.x) / b.rx, (y - b.y) / b.ry)) * Math.min(b.rx, b.ry));
  return best;
}
function pampaAberta(L, x, y) {
  for (const b of L.bays) if (Math.hypot((x - b.x) / b.rx, (y - b.y) / b.ry) < 1 - 8 / Math.min(b.rx, b.ry)) return true;
  if (pampaEstradaDist(L, x, y) < PAMPA.meia - 8) return true;
  for (const r of L.ramais) if (pampaLinhaDist(r.pts, x, y) < r.meia - 8) return true;
  return false;
}
// As pedras da taipa, em pedaços curtos: cada pedaço entra na ordem de desenho pela sua altura no mapa.
function pampaPedacoDe(pontos, R) {
  const cores = ['#8d8675', '#7a7464', '#9a937f', '#6d6858'], pedras = [];
  for (const [x, y] of pontos) {
    pedras.push({ x: x + (R() - .5) * 4, y: y + (R() - .5) * 3, rx: 13 + R() * 6, ry: 9 + R() * 3, c: cores[Math.floor(R() * 4)] });
    if (R() < .86) pedras.push({ x: x + (R() - .5) * 10, y: y - 13 - R() * 3, rx: 11 + R() * 5, ry: 8 + R() * 2, c: cores[Math.floor(R() * 4)] });
    if (R() < .46) pedras.push({ x: x + (R() - .5) * 10, y: y - 25 - R() * 3, rx: 9 + R() * 5, ry: 7 + R() * 2, c: cores[Math.floor(R() * 4)] });
  }
  const m = pontos[Math.floor(pontos.length / 2)]; return { x: m[0], y: pontos.reduce((s, p) => Math.max(s, p[1]), -Infinity), pedras, pontos };
}
// A taipa contorna tudo o que é caminho (estrada, ramais e bolsões juntos), um pouco pra fora da beira: a cerca sai contínua,
// e a boca de um ramal fica aberta sozinha. Primeiro olha o mapa numa grade larga e só refina perto da beira.
function pampaContorno(L, R) {
  const nivel = -16, largo = 56, fino = 14, f = (x, y) => pampaFolga(L, x, y) - nivel, pontos = [], segmentos = [], ocupado = new Map();
  const perto = (x, y) => { const k = Math.floor(x / 22) + ':' + Math.floor(y / 22), cx = Math.floor(x / 22), cy = Math.floor(y / 22); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const q of ocupado.get((cx + a) + ':' + (cy + b)) || []) if (Math.hypot(q[0] - x, q[1] - y) < 21) return true; (ocupado.get(k) || ocupado.set(k, []).get(k)).push([x, y]); return false; };
  const guarda = (x, y) => { if (y > 34 && y < L.H - 34 && x > 20 && x < L.W - 20 && !perto(x, y)) pontos.push([x, y]); };
  for (let gy = 0; gy < L.H; gy += largo) for (let gx = 0; gx < L.W; gx += largo) {
    if (Math.abs(f(gx + largo / 2, gy + largo / 2)) > largo * 1.5) continue;
    for (let y = gy; y < gy + largo; y += fino) for (let x = gx; x < gx + largo; x += fino) {
      const a = f(x, y), b = f(x + fino, y), c = f(x, y + fino), d = f(x + fino, y + fino);
      if ((a >= 0) !== (b >= 0)) guarda(x + fino * a / (a - b), y);
      if ((a >= 0) !== (c >= 0)) guarda(x, y + fino * a / (a - c));
      // Connected contour edges, not independent piles at each sample point.
      const e = [
        (a>=0)!==(b>=0)?[x+fino*a/(a-b),y]:null,
        (b>=0)!==(d>=0)?[x+fino,y+fino*b/(b-d)]:null,
        (c>=0)!==(d>=0)?[x+fino*c/(c-d),y+fino]:null,
        (a>=0)!==(c>=0)?[x,y+fino*a/(a-c)]:null
      ], hits=e.filter(Boolean), add=(u,v)=>{if((u[1]+v[1])/2>34&&(u[1]+v[1])/2<L.H-34&&(u[0]+v[0])/2>20&&(u[0]+v[0])/2<L.W-20)segmentos.push([u,v]);};
      if(hits.length===2)add(hits[0],hits[1]);
      else if(hits.length===4){if((f(x+fino/2,y+fino/2)>=0)===(a>=0)){add(e[0],e[1]);add(e[2],e[3]);}else{add(e[0],e[3]);add(e[1],e[2]);}}
    }
  }
  const baldes = new Map();
  const bucket=(x,y)=>{const k=Math.floor(x/96)+':'+Math.floor(y/24);if(!baldes.has(k))baldes.set(k,{pontos:[],segments:[]});return baldes.get(k);};
  for(const q of pontos)bucket(q[0],q[1]).pontos.push(q);
  for(const s of segmentos)bucket((s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2).segments.push(s);
  for(const b of baldes.values()){
    const p=b.pontos.length?pampaPedacoDe(b.pontos,R):{x:b.segments[0][0][0],y:Math.max(...b.segments.flat().map(q=>q[1])),pedras:[],pontos:b.segments.flat()};
    p.wallSegments=b.segments;L.pedacos.push(p);
  }
}
function pampaLayout(n = pampaArea()) {
  if (pampaCache.has(n)) return pampaCache.get(n);
  const R = caveRand(7300 + n * 113), { W, H, portas, last, meia } = PAMPA, A = PAMPA_AREAS[n], xIn = portas[n - 1], xOut = portas[n], foraBorda = (x, r) => clamp(x, r + 200, W - r - 200);
  const L = { n, W, H, xIn, xOut, nome: A.nome, pts: [], ramais: [], bays: [], bolsoes: [], pocas: [], palco: null, arena: null, baus: [], achados: [], pedacos: [], portas: [], solidos: [], rects: [], pools: [], capim: [], taboas: [], umbus: [], pedras: [], caveiras: [], lancas: [], carretas: [], cerro: [], coxilhas: [], cerroY: n === last ? 2170 : Infinity };
  // Onde o chefe do trecho fica: bem no meio do caminho, num campo cercado que a estrada atravessa.
  const mx = (xIn + xOut) / 2;
  if (n === PAMPA_N.sargento) L.palco = L.duelo = { x: foraBorda(mx, 640), y: 1500, rx: 640, ry: 400 };
  else if (n === PAMPA_N.boi) { L.palco = { x: foraBorda(mx, 600), y: 1400, rx: 600, ry: 432 }; L.mangueira = { x: L.palco.x, y: L.palco.y, r: 600 }; }
  else if (n === PAMPA_N.capitao) L.palco = L.campo = { x: foraBorda(mx, 900), y: 1400, rx: 900, ry: 600 };
  else if (n === PAMPA_N.moringue) L.palco = L.arena = { x: 1900, y: 1560, rx: 820, ry: 540 };
  // A estrada: desce sempre pro sul, em zigue-zague, e passa pelo meio do campo do chefe.
  const ctrl = [[xIn, -60], [xIn, 190]];
  const desce = (x0, y0, x1, y1) => { const k = Math.max(1, Math.round((y1 - y0) / 480)); let lado = R() < .5 ? -1 : 1; for (let i = 1; i < k; i++) { const t = i / k; ctrl.push([clamp(x0 + (x1 - x0) * t + lado * (240 + R() * 220), 450, W - 450), y0 + (y1 - y0) * t]); lado = -lado; } ctrl.push([x1, y1]); };
  if (n === 1) { L.bays.push({ id: 'vila', x: 1900, y: 830, rx: 1050, ry: 400 }); desce(xIn, 190, 1900, 430); ctrl.push([1900, 830], [1900, 1230]); desce(1900, 1230, xOut, H - 190); ctrl.push([xOut, H + 60]); }
  else if (L.palco) {
    const q = L.palco; L.bays.push({ id: 'palco', ...q }); desce(xIn, 190, q.x, q.y - q.ry); ctrl.push([q.x, q.y]);
    if (n !== last) { ctrl.push([q.x, q.y + q.ry]); desce(q.x, q.y + q.ry, xOut, H - 190); ctrl.push([xOut, H + 60]); }
  } else { desce(xIn, 190, xOut, H - 190); ctrl.push([xOut, H + 60]); }
  L.pts = pampaSuaviza(ctrl); const pts = L.pts;
  // O fogo fica na beira da estrada, num alargado da taipa.
  if (n === 1) { L.camp = { x: 2560, y: 860, rx: 330, ry: 230 }; L.bays.push({ id: 'camp', ...L.camp }); }
  else if (PAMPA_FOGOS.some(f => f.n === n)) { const y = 1250, x0 = pampaEstradaX(L, y), lado = x0 > W / 2 ? -1 : 1; L.camp = { x: x0 + lado * (meia + 170), y, rx: 350, ry: 250 }; L.bays.push({ id: 'camp', ...L.camp }); }
  // Os ramais: cada um termina num bolsão cercado, com o que tiver pra achar.
  for (let k = 0, feitos = 0; k < 80 && feitos < A.ramais; k++) {
    const i = Math.floor(pts.length * (.14 + R() * .72)), [px, py] = pts[i], lado = R() < .5 ? -1 : 1, tapera = n === 7 && feitos === 0, ex = px + lado * (560 + R() * 240), ey = py + (R() - .5) * 180, rx = tapera ? 350 : 210 + R() * 50, ry = tapera ? 280 : 160 + R() * 30;
    if (ex < rx + 120 || ex > W - rx - 120 || ey < 430 || ey > H - 400 || pampaFolga(L, ex, ey) > -(ry + 70)) continue;
    let livre = true; for (const t of [.45, .6, .75, .9]) if (pampaFolga(L, px + (ex - px) * t, py + (ey - py) * t) > -(PAMPA.ramal + 30)) livre = false;
    if (!livre) continue;
    L.ramais.push({ meia: PAMPA.ramal, pts: pampaSuaviza([[px, py], [(px + ex) / 2, (py + ey) / 2 + (R() - .5) * 70], [ex, ey]], 2) });
    const b = { id: 'bolsao' + feitos, x: ex, y: ey, rx, ry }; L.bays.push(b); L.bolsoes.push(b);
    const bauX = ex + lado * rx * .42, bauY = ey + ry * .05;
    if (tapera) { L.tapera = { x: ex - 220, y: ey - 300, w: 440, h: 280 }; L.rects.push({ x: L.tapera.x + 10, y: L.tapera.y + 165, w: L.tapera.w - 20, h: 105 }); L.baus.push({ id: 'bau' + feitos, x: ex + lado * 210, y: ey + 130 }); }
    else if (!feitos || R() < .8) L.baus.push({ id: 'bau' + feitos, x: bauX, y: bauY });
    if (A.chao === 'raso' && !L.palco) { L.carretas.push({ x: ex - lado * 80, y: ey - 50, f: lado }); L.solidos.push({ x: ex - lado * 80, y: ey - 50, r: 90 }); }
    if (n === 13 || n === 14) for (const o of [-1, 1]) L.lancas.push({ x: ex + o * rx * .5, y: ey - ry * .45 });
    for (let j = 0; j < 2; j++) if (R() < .72) L.achados.push({ id: 'erva' + feitos + j, k: R() < .6 ? 'marcela' : 'carqueja', x: ex + (j ? 1 : -1) * rx * (.2 + R() * .2), y: ey + ry * (.45 + R() * .2) });
    feitos++;
  }
  // O que é próprio de cada trecho.
  if (n === 1) {
    L.ferraria = { x: 1120, y: 590, w: 470, h: 313 }; L.rects.push({ x: L.ferraria.x + 28, y: L.ferraria.y + 126, w: L.ferraria.w - 56, h: L.ferraria.h - 143 });
    L.zeferino = { x: L.ferraria.x + L.ferraria.w / 2 + 170, y: L.ferraria.y + L.ferraria.h + 42 };
  }
  if (n === PAMPA_N.lanceiros) for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + .3; L.lancas.push({ x: L.camp.x + Math.cos(a) * (L.camp.rx - 30), y: L.camp.y + Math.sin(a) * (L.camp.ry - 18) }); }
  if (A.chao === 'banhado') for (let y = 340; y < H - 320; y += 340) for (const s of [-1, 1]) {
    const rx = 200 + R() * 150, ry = 90 + R() * 60, x = pampaEstradaX(L, y) + s * (meia + rx + 90 + R() * 200);
    if (x < rx + 80 || x > W - rx - 80 || pampaFolga(L, x, y) > -(ry + 40)) continue;
    L.pools.push({ x, y, rx, ry }); for (let k = 0; k < 7; k++) { const a = R() * Math.PI * 2; L.taboas.push({ x: x + Math.cos(a) * (rx + 12), y: y + Math.sin(a) * (ry + 8), w: 96 + R() * 50, i: 2 }); }
  }
  // A água que chega na estrada: poças na beira do caminho, sempre deixando passagem. É dela que saem os afogados.
  if (A.chao === 'banhado') { let lado = R() < .5 ? -1 : 1; for (let i = 8; i < pts.length - 8; i += Math.max(10, Math.floor(pts.length / 7))) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i + 1], q = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / q, ny = (bx - ax) / q, rx = 130 + R() * 40, ry = 80 + R() * 18, x = pts[i][0] + nx * lado * (meia + 10), y = pts[i][1] + ny * lado * (meia + 10); lado = -lado;
    if (y < 420 || y > H - 380 || L.bays.some(b => Math.hypot((x - b.x) / (b.rx + rx), (y - b.y) / (b.ry + ry)) < 1) || L.ramais.some(r => pampaLinhaDist(r.pts, x, y) < r.meia + rx)) continue;
    const c = { x, y, rx, ry }; L.pocas.push(c); L.pools.push(c); for (let k = 0; k < 4; k++) { const a = R() * Math.PI * 2; L.taboas.push({ x: x + Math.cos(a) * (rx + 8), y: y + Math.sin(a) * (ry + 6) - 4, w: 70 + R() * 30, i: 2 }); }
  } }
  if (A.coxilha) for (const [x, y, rx, ry] of [[800, 620, 760, 330], [2500, 1500, 900, 380], [1200, 1760, 840, 300], [3100, 2240, 700, 280], [1900, 480, 640, 220]]) L.coxilhas.push({ x, y, rx, ry });
  if (L.campo) {
    const C = L.campo, s = C.x > W / 2 ? -1 : 1; L.palanque = { x: C.x + s * 340 - 255, y: C.y - 430, w: 510, h: 255 }; L.rects.push({ x: L.palanque.x + 12, y: L.palanque.y + 95, w: 486, h: 150 });
    for (const [dx, dy, f] of [[-s * 470, -200, 1], [-s * 330, 330, -1], [s * 480, 300, 1]]) { const x = C.x + dx, y = C.y + dy; L.carretas.push({ x, y, f }); L.solidos.push({ x, y, r: 90 }); }
  }
  if (L.arena) {
    const a = L.arena; L.bento = { x: a.x + 420, y: a.y - 250 }; L.solidos.push({ x: L.bento.x, y: L.bento.y, r: 30 });
    for (let k = 0; k < 18; k++) { const t = k / 18 * Math.PI * 2, x = a.x + Math.cos(t) * a.rx * (.72 + R() * .2), y = a.y + Math.sin(t) * a.ry * (.72 + R() * .2); if (pampaEstradaDist(L, x, y) > 110 && Math.hypot(x - L.bento.x, y - L.bento.y) > 190) L.lancas.push({ x, y }); }
    // O cerro: pedra por trás e pelos lados do campo da batalha.
    for (let x = 240; x < W - 150; x += 250) { const y = 2500 + Math.sin(x / 420) * 70 + (R() - .5) * 40; L.cerro.push({ x, y, w: 300 + R() * 60, h: 350 + R() * 80 }, { x: x + 120, y: y + 210, w: 320 + R() * 60, h: 370 + R() * 80 }); }
    for (const [x, y] of [[420, 2120], [640, 1860], [3380, 2110], [3190, 1830], [760, 2240], [3020, 2230], [1120, 2300], [2700, 2300]]) L.cerro.push({ x, y, w: 260 + R() * 40, h: 300 + R() * 40 });
  }
  // As lanças já fincadas na beira da estrada, nos trechos que chegam no cerro.
  if (n >= 13) for (let y = 420; y < (L.arena ? L.arena.y - L.arena.ry - 60 : H - 300); y += 240) { const s = y % 480 ? 1 : -1, x = pampaEstradaX(L, y) + s * (meia - 28); L.lancas.push({ x, y }); }
  pampaContorno(L, R);
  // Dois moirões em cada porteira: na chegada, e na cancela da saída.
  L.portas.push({ x: pampaEstradaX(L, 100) - meia - 16, y: 100 }, { x: pampaEstradaX(L, 100) + meia + 16, y: 100 });
  if (n !== last) { const y = H - 170, x = pampaEstradaX(L, y); L.cancela = { x, y }; L.portas.push({ x: x - meia - 16, y }, { x: x + meia + 16, y }); }
  // O campo além da cerca: umbus, pedras, caveiras e capim, longe do caminho.
  const ocupados = [], longe = (x, y, r) => {
    if (pampaFolga(L, x, y) > -(r + 34) || ocupados.some(o => Math.hypot(x - o.x, y - o.y) < o.r + r)) return false;
    if (L.pools.some(q => Math.hypot((x - q.x) / (q.rx + r), (y - q.y) / (q.ry + r)) < 1)) return false;
    return ![L.ferraria, L.tapera, L.palanque].some(q => q && x > q.x - r && x < q.x + q.w + r && y > q.y - r && y < q.y + q.h + r);
  };
  const lugar = (r, alto = 0) => { for (let k = 0; k < 60; k++) { const x = 140 + R() * (W - 280), y = 160 + R() * (Math.min(H, L.cerroY - 180) - 300); if (!longe(x, y, r)) continue; if (alto && [.3, .6, 1].some(t => pampaFolga(L, x, y - alto * t) > -40)) continue; return [x, y]; } return null; };
  for (let k = 0; k < A.umbus; k++) { const p = lugar(70, 400); if (!p) continue; L.umbus.push({ x: p[0], y: p[1], w: 250 + R() * 80, h: 320 + R() * 90 }); ocupados.push({ x: p[0], y: p[1], r: 70 }); }
  for (let k = 0; k < A.pedras; k++) { const p = lugar(50, 120); if (!p) continue; const w = 110 + R() * 90; L.pedras.push({ x: p[0], y: p[1], w }); ocupados.push({ x: p[0], y: p[1], r: 50 }); }
  for (let k = 0; k < 6; k++) { const p = lugar(30); if (p) L.caveiras.push({ x: p[0], y: p[1], f: R() < .5 ? -1 : 1 }); }
  for (let k = 0; k < 8; k++) { const q = pts[Math.floor(pts.length * (.1 + R() * .8))]; if (R() < .4) L.caveiras.push({ x: q[0] + (R() < .5 ? -1 : 1) * (meia - 36), y: q[1], f: R() < .5 ? -1 : 1 }); }
  for (let k = 0; k < A.capim; k++) { const p = lugar(30, 110); if (p) L.capim.push({ x: p[0], y: p[1], w: 110 + R() * 60, i: R() < .16 ? 4 : 1 }); }
  for (const b of L.bolsoes) for (let k = 0; k < 5; k++) { const t = R() * Math.PI * 2; L.capim.push({ x: b.x + Math.cos(t) * b.rx * .78, y: b.y + Math.abs(Math.sin(t)) * b.ry * -.7, w: 66 + R() * 30, i: R() < .3 ? 4 : 1 }); }
  const linha = P => { const c = new Path2D(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); return c; };
  L.path = linha(pts); L.pathRamais = new Path2D(); for (const r of L.ramais) L.pathRamais.addPath(linha(r.pts));
  // A placa, na beira da chegada.
  L.placa = { x: pampaEstradaX(L, 250) + meia + 46, y: 250 };
  pampaCache.set(n, L); return L;
}
function pampaFogoAqui(n = pampaArea()) { return PAMPA_FOGOS.find(f => f.n === n) || null; }
function pampaFogoAceso(id) { return !!pampaState().fogos?.[id]; }
function pampaFogoSolido(L, x, y) {
  if (!L.camp) return false; const P = ilhaFogoPartes(L.camp);
  return Math.hypot(x - P.fogo.x, (y - P.fogo.y) * 1.6) < 42 || x > P.barraca.x - 72 && x < P.barraca.x + 72 && y > P.barraca.y - 34 && y < P.barraca.y + 4;
}

// ---------- O seu Zeferino, ferreiro da tropa ----------
const ZEFERINO_LOOK = { skin: '#c89468', hair: '#8a8478', style: 'short', mustache: true, hat: 'brim', hatColor: '#3a2a1a', shirt: '#d8cfb8', pants: '#4a4038', boots: '#2a1a10', lenco: '#c8302a' };
let zeferinoCanvas = null, zeferinoURL = null;
function zeferinoArte() {
  if (zeferinoCanvas) return zeferinoCanvas;
  const c = document.createElement('canvas'); c.width = 240; c.height = 460; const main = ctx; ctx = c.getContext('2d');
  try {
    ctx.translate(120, 440); ctx.scale(2, 2); paintFolk(ZEFERINO_LOOK);
    // O avental de couro e o martelo.
    ctx.fillStyle = '#6a4426'; ctx.strokeStyle = '#1c130c'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-14, -92); ctx.lineTo(14, -92); ctx.lineTo(16, -30); ctx.lineTo(-16, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#7a5230'; ctx.fillRect(25, -72, 4, 34); ctx.strokeRect(25, -72, 4, 34); ctx.fillStyle = '#5c5f66'; ctx.fillRect(19, -78, 16, 9); ctx.strokeRect(19, -78, 16, 9);
  } finally { ctx = main; }
  return zeferinoCanvas = c;
}
function drawZeferino(x, y, dx = 1) { ellipse(x, y + 3, 24, 7, 'rgba(10,14,8,.3)'); ctx.save(); ctx.translate(x, y); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(zeferinoArte(), -60, -220, 120, 230); ctx.restore(); }
function zeferinoPortrait(size = 72) {
  if (!zeferinoURL) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#5a4634'; g.fillRect(0, 0, 96, 96); g.drawImage(zeferinoArte(), 60, 126, 120, 120, 0, 0, 96, 96); try { zeferinoURL = c.toDataURL(); } catch (_) { return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">🔨</span>`; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${zeferinoURL}" width="${size}" height="${size}" alt=""></span>`;
}
function zeferinoSpeaker() { return { name: 'Seu Zeferino', portrait: zeferinoPortrait(72) }; }
const ZEFERINO_FALAS = ['Lâmina boa não ganha guerra sozinha, mas ajuda bastante.', 'Traz o minério da Serra, que aqui no pampa só tem pedra e vento.', 'Afia antes de seguir: lá adiante, o campo não perdoa.', 'Ferrei cavalo de farrapo e de imperial. Bala não pergunta de que lado o cavalo tá.', 'Cavalo fica aqui na porteira: com taipa dos dois lados, cavalo só atrapalha.'];
function pampaForjaIntro() {
  const st = pampaState(); if (st.zeferino) { pampaForja(); return; } st.zeferino = G.day; keys.clear(); save();
  talk([[zeferinoSpeaker(), 'Buenas, vivente. Zeferino, ferreiro da tropa. Se chegou até esta porteira, é porque o almirante caiu.'], ['sadi', 'Caiu. E levaram o Bento pro Cerro de Porongos.'], [zeferinoSpeaker(), 'Porongos fica lá no fundo. O caminho é um só: as taipas levam até lá, pelo banhado e pelas coxilhas. E o cavalo fica aqui, que naquele corredor ele só atrapalha.'], [zeferinoSpeaker(), 'Quem manda no caminho é a gente do Moringue. Traz couro de bicho e ferro de imperial: com isso eu melhoro arma aqui na forja. E descansa nos fogos: em cada um que tu acender, dá pra voltar e seguir de onde parou.']], pampaForja, 'Ver a forja');
}
function pampaForja() {
  if (!pampaAqui()) return; skipWorldTalk();
  const box = $('dialogContent').closest('.dialog'), keep = modal === 'dunstanShop' ? box.scrollTop : 0;
  const sec = (title, note, html) => `<h3 class="forja-sec">${title} <small>${note}</small></h3><div class="store-list">${html}</div>`;
  const equipamento = CAVE_UPGRADES.filter(u => !['afiado', 'aco'].includes(u.id)).map(upgradeCardHTML).join('');
  openDialog('Ferraria do seu Zeferino', `<div class="rpg-speaker">${zeferinoPortrait(72)}<div><p><b>Seu Zeferino</b></p><p>${pick(ZEFERINO_FALAS)}</p></div></div>${dunstanStatusHTML()}${typeof pampaBolichoSecao === 'function' ? pampaBolichoSecao(sec) : ''}${sec('⚔️ Armas', 'minério + dinheiro · a nova já vai pra mão', dunstanWeaponsHTML())}${sec('✨ Afiar', 'a arma que está na mão', dunstanAfiarHTML() + pampaFioHTML())}${typeof pampaLancaSecao === 'function' ? pampaLancaSecao(sec) : ''}${sec('🧥 Equipamento', 'fica contigo pra sempre', equipamento)}<div class="actions"><button data-act="close">Até mais</button></div>`, 'dunstanShop');
  box.scrollTop = keep;
}

// ---------- Descansar e seguir a trilha ----------
function pampaDescansa(f) {
  const st = pampaState(), novo = !pampaFogoAceso(f.id); st.fogos ??= {}; st.fogos[f.id] = G.day; st.ultimoFogo = f.id;
  caveState().hp = caveMaxHp(); if (typeof mataBuffs === 'object') mataBuffs.veneno = 0; AudioEngine.ready?.(); effect('Vida cheia · jogo salvo', worldOut.x, worldOut.y - 130, '#d8ffac', 18); save();
  if (novo) talk([['card', `<b>🔥 ${f.nome}</b><br>Fogo aceso, um mate e a vida cheia. O jogo está salvo, e este fogo fica aceso: de qualquer acampamento aceso do pampa, dá pra vir direto pra cá.`, 'Pampa']], null, 'Bah, que beleza');
}
function pampaFogoVai(f) {
  const P = ilhaFogoPartes(pampaLayout(f.n).camp);
  mataNight = null; switchMap({ map: 'pampa', n: f.n, x: P.fogo.x + 90, y: P.fogo.y + 60, title: f.nome, text: 'Pela trilha dos farrapos, de fogo em fogo.' });
}
function pampaTrilha(atual) {
  const outros = PAMPA_FOGOS.filter(f => f !== atual && pampaFogoAceso(f.id));
  if (!outros.length) { worldSay('Ainda não tem outro fogo aceso no pampa. Descansa no próximo acampamento que achar.'); return; }
  talkChoose([['sadi', 'A trilha dos farrapos passa por todos os fogos acesos. Pra qual eu vou?']], [...outros.map(f => [f.nome + ' · ' + PAMPA_AREAS[f.n].nome, () => pampaFogoVai(f)]), ['Agora não']], outros.length);
}

// ---------- O que dá pra achar nos bolsões ----------
function pampaAbreBau(L, c) {
  const got = pampaHoje(L.n); if (got.includes(c.id)) return; got.push(c.id);
  // É o fim do jogo: o baú rende como os mais fundos da mata, e ainda traz ferro imperial.
  const loot = trechoChestLoot(22 + L.n), bag = mataBag(), extra = [], ferro = 1 + Math.floor(Math.random() * 3);
  G.cash = round(G.cash + loot.cash); for (const k of CAVE_MINERALS) if (loot[k]) bagAdd(k, loot[k]);
  for (const [id, q] of Object.entries(loot.items)) { const room = Math.max(0, mataBagMax(id) - (bag[id] || 0)), n = Math.min(q, room); if (!n) continue; bag[id] = (bag[id] || 0) + n; const it = MATA_ITEMS.find(i => i.id === id); extra.push([mataGearHTML(id, 34), n, it.name.toLowerCase()]); }
  if (loot.butia) { bagAdd('butia', loot.butia); extra.push([itemIconHTML('butia'), loot.butia, loot.butia > 1 ? 'butiás (curam)' : 'butiá (cura)']); }
  bagAdd('ferro_imperial', ferro); extra.push([bagIcon('ferro_imperial'), ferro, 'ferro imperial']);
  loot.cards = loot.cards.filter(id => giveCard(id, 'baú do pampa'));
  AudioEngine.caveChestOpen?.(); fxStars(c.x, c.y - 50, 6); mataXP(4); mataBeltRefresh(); save(); refreshHUD();
  const tiles = [...caveLootTiles(loot), ...extra];
  talk([['card', `<b>🧰 Baú de tropeiro</b><br>Escondido atrás da taipa, um baú largado por quem passou com pressa. Dentro tinha:<div class="bag-grid cave-loot">${tiles.map(([icon, big, small]) => `<div class="bag-item">${icon}<b>${big}</b><small>${small}</small></div>`).join('')}</div>`, L.nome]], null, 'Guardar');
}
const PAMPA_ERVAS = { marcela: 'marcela', carqueja: 'carqueja' };
function pampaColhe(L, a) {
  const got = pampaHoje(L.n), bag = mataBag(); if (got.includes(a.id)) return;
  if ((bag[a.k] || 0) >= mataBagMax()) { floatNote('O bornal já está cheio disso.'); return; }
  got.push(a.id); bag[a.k] = (bag[a.k] || 0) + 1; mataXP(2); AudioEngine.pop?.(1400, .04, .04); effect('+1 ' + MATA_ITEMS.find(i => i.id === a.k).name.toLowerCase(), a.x, a.y - 80, '#e8f0c8', 16); mataBeltRefresh(); save();
}
function drawPampaErva(a) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(a.x, a.y - 16, 26, .26 + .16 * Math.sin(frameClock * 4 + a.x), '255,250,210'); ctx.restore();
  ellipse(a.x, a.y + 2, 20, 6, 'rgba(14,16,8,.28)'); ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = a.k === 'marcela' ? '#7c8a48' : '#4e7a3a';
  for (const [dx, h] of [[-12, 22], [-5, 30], [3, 34], [11, 24]]) { ctx.beginPath(); ctx.moveTo(a.x + dx * .4, a.y); ctx.lineTo(a.x + dx, a.y - h); ctx.stroke(); if (a.k === 'marcela') ellipse(a.x + dx, a.y - h - 2, 4.5, 4, '#e8c838'); else ellipse(a.x + dx, a.y - h - 1, 3, 6, '#6a9a4a'); }
  ctx.restore();
}

// ---------- O chão ----------
function pampaManchas(view, cor, step, salt, forca) {
  for (let gy = Math.floor(view.y / step) * step - step; gy < view.y + view.h + step; gy += step) for (let gx = Math.floor(view.x / step) * step - step; gx < view.x + view.w + step; gx += step) {
    const k = ilhaNoise(gx + salt, gy - salt); if (k < .45) continue;
    const cx = gx + ilhaNoise(gy, gx + 3) * step, cy = gy + ilhaNoise(gx + 9, gy) * step, r = step * (.45 + k * .55);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(1, .55 + ilhaNoise(cx, cy) * .3); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(${cor},${forca})`); g.addColorStop(1, `rgba(${cor},0)`); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore();
  }
}
function paintPampaGround(L, view) {
  const { x, y, w, h } = view, A = PAMPA_AREAS[L.n];
  if (!mataTexture(3, x, y, w, h)) rect(x, y, w, h, '#7c8a48');
  rect(x, y, w, h, A.tinta); pampaManchas(view, '84,96,44', 380, 41 + L.n * 9, .2); if (A.chao === 'raso' || A.chao === 'cerro') pampaManchas(view, '226,198,124', 420, 97 + L.n, .2); else pampaManchas(view, '214,196,110', 460, 67 + L.n, .12);
  for (const c of L.coxilhas) {
    if (c.x + c.rx < x || c.x - c.rx > x + w || c.y + c.ry * 1.4 < y || c.y - c.ry > y + h) continue;
    ctx.save(); ctx.translate(c.x, c.y); ctx.scale(1, c.ry / c.rx);
    const luz = ctx.createRadialGradient(0, 0, 0, 0, 0, c.rx); luz.addColorStop(0, 'rgba(255,238,160,.26)'); luz.addColorStop(.7, 'rgba(255,238,160,.09)'); luz.addColorStop(1, 'rgba(255,238,160,0)'); ctx.fillStyle = luz; ctx.fillRect(-c.rx, -c.rx, c.rx * 2, c.rx * 2);
    ctx.translate(0, c.rx * .8); const sombra = ctx.createRadialGradient(0, 0, 0, 0, 0, c.rx); sombra.addColorStop(0, 'rgba(36,44,14,.2)'); sombra.addColorStop(1, 'rgba(36,44,14,0)'); ctx.fillStyle = sombra; ctx.fillRect(-c.rx, -c.rx, c.rx * 2, c.rx * 2); ctx.restore();
  }
  // O capim baixo, pintado direto no chão.
  const cores = A.chao === 'banhado' ? ['#4e6a38', '#5e7a42', '#3e5a30'] : A.chao === 'cerro' ? ['#7a6e44', '#8a7c4c', '#63583a'] : ['#b6a858', '#a39a4c', '#8e9446', '#c8b868'];
  ctx.lineCap = 'round'; ctx.lineWidth = 1.6;
  for (let gy = Math.floor(y / 24) * 24; gy < y + h; gy += 24) for (let gx = Math.floor(x / 24) * 24; gx < x + w; gx += 24) {
    const k = ilhaNoise(gx + L.n * 37, gy); if (k < .42) continue;
    const px = gx + ilhaNoise(gy, gx) * 24, py = gy + ilhaNoise(gx + 5, gy) * 24, alt = 6 + k * 11; ctx.strokeStyle = cores[Math.floor(k * 97) % cores.length]; ctx.globalAlpha = .34 + k * .3;
    for (const d of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(px + d, py); ctx.lineTo(px + d * 1.8 + 1.5, py - alt); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
  // A estrada de chão, com o capim no meio das duas marcas das rodas, e a trilha fina dos ramais.
  const terra = ilhaPattern(1); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(36,26,12,.2)'; ctx.lineWidth = 66; ctx.stroke(L.pathRamais); ctx.strokeStyle = terra || '#8e704b'; ctx.lineWidth = 54; ctx.stroke(L.pathRamais);
  ctx.strokeStyle = 'rgba(36,26,12,.26)'; ctx.lineWidth = 128; ctx.stroke(L.path); ctx.strokeStyle = terra || '#8e704b'; ctx.lineWidth = 108; ctx.stroke(L.path); ctx.strokeStyle = 'rgba(112,118,58,.42)'; ctx.lineWidth = 16; ctx.stroke(L.path); ctx.restore();
  if (L.palco && !L.mangueira) {
    const a = L.palco, chao = ilhaPattern(1), forca = L.arena ? 1 : .55;
    // Em vez de um disco, várias camadas de terra, cada uma com a beira ondulada e mais fraca que a de dentro.
    for (const [k, alfa] of [[1.0, .12], [.96, .16], [.92, .2], [.86, .26], [.8, .34], [.72, .42]]) {
      const c = new Path2D(); for (let i = 0; i <= 72; i++) { const t = i / 72 * Math.PI * 2, o = 1 + .05 * Math.sin(t * 5 + k * 9) + .035 * Math.sin(t * 11 + k * 5), px = a.x + Math.cos(t) * a.rx * k * o, py = a.y + Math.sin(t) * a.ry * k * o; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      ctx.save(); ctx.globalAlpha = alfa * forca; ctx.fillStyle = chao || '#6a5238'; ctx.fill(c); ctx.restore();
    }
    if (L.arena) pampaManchas(view, '30,22,12', 200, 311, .24);
  }
  for (const q of L.pools) {
    if (q.x + q.rx + 40 < x || q.x - q.rx - 40 > x + w || q.y + q.ry + 40 < y || q.y - q.ry - 40 > y + h) continue;
    ctx.save(); ctx.fillStyle = 'rgba(38,48,24,.46)'; ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx + 30, q.ry + 22, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(q.x, q.y, q.rx, q.ry, 0, 0, Math.PI * 2); ctx.clip(); if (!mataTexture(5, x, y, w, h)) rect(x, y, w, h, '#245158'); ctx.fillStyle = 'rgba(40,52,30,.52)'; ctx.fillRect(x, y, w, h); ctx.restore();
  }
}

// ---------- As coisas do campo ----------
function pampaPedaco(p) { for (const s of p.pedras) ellipse(s.x + 2, s.y + s.ry * .9, s.rx * 1.06, s.ry * .5, 'rgba(14,16,8,.2)'); for (const s of p.pedras) { ctx.fillStyle = s.c; ctx.strokeStyle = '#3a352a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); } }
function pampaMoirao(x, y) { ellipse(x, y + 3, 16, 5, 'rgba(14,16,8,.3)'); rect(x - 9, y - 66, 18, 68, '#6a4a2a', 3, '#2e1e10'); rect(x - 11, y - 72, 22, 9, '#7c5a34', 2, '#2e1e10'); }
// A cancela da saída: fechada, três tábuas de um moirão ao outro; aberta, encostada no moirão.
function drawPampaCancela(L) {
  const c = L.cancela, m = PAMPA.meia + 8;
  if (pampaSaidaAberta(L.n)) { for (const y of [50, 32, 14]) rect(c.x + m - 8, c.y - y, 8, 16, '#8a6a42', 2, '#2e1e10'); return; }
  for (const y of [52, 34, 16]) rect(c.x - m, c.y - y, m * 2, 9, '#8a6a42', 2, '#2e1e10');
  ctx.strokeStyle = '#3a3a3e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(c.x - 10, c.y - 56); ctx.lineTo(c.x + 10, c.y - 8); ctx.moveTo(c.x + 10, c.y - 56); ctx.lineTo(c.x - 10, c.y - 8); ctx.stroke();
}
function pampaSway(x, y, t, draw) { ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, t, 1, 0, 0); ctx.translate(-x, -y); draw(); ctx.restore(); }
function pampaCapim(c) { const t = (Math.sin(frameClock * 1.7 + c.x * .013) + .6) * .06; pampaSway(c.x, c.y, t, () => worldSprite('frontier-flora', c.i, c.x - c.w / 2, c.y - c.w * .85, c.w, c.w * .85)); }
function pampaUmbu(u) { worldTreeSprite(0, u.x, u.y, u.w, u.h); }
function drawPampaCaveira(c) {
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.f, 1); ellipse(0, 3, 20, 5, 'rgba(14,16,8,.3)'); ctx.fillStyle = '#e4dcc4'; ctx.strokeStyle = '#4a4232'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-14, -6); ctx.quadraticCurveTo(-16, -18, -2, -18); ctx.quadraticCurveTo(14, -18, 12, -6); ctx.lineTo(4, 2); ctx.lineTo(-6, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 3.4; ctx.strokeStyle = '#d4ccb2'; ctx.beginPath(); ctx.moveTo(-12, -16); ctx.quadraticCurveTo(-26, -22, -24, -34); ctx.moveTo(10, -16); ctx.quadraticCurveTo(24, -22, 22, -34); ctx.stroke(); ellipse(-6, -11, 2.6, 2.2, '#3a3226'); ellipse(5, -11, 2.6, 2.2, '#3a3226'); ctx.restore();
}
function drawPampaLanca(l) {
  const t = Math.sin(frameClock * 2.2 + l.x) * 4; ctx.save(); ellipse(l.x, l.y + 2, 10, 3, 'rgba(10,12,8,.34)'); ctx.strokeStyle = '#5a3e22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + 5, l.y - 148); ctx.stroke();
  ctx.fillStyle = '#b8bcc2'; ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(l.x + 5, l.y - 176); ctx.lineTo(l.x + 11, l.y - 148); ctx.lineTo(l.x - 1, l.y - 148); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b8302a'; ctx.beginPath(); ctx.moveTo(l.x + 5, l.y - 146); ctx.lineTo(l.x + 36 + t, l.y - 136 + t * .3); ctx.lineTo(l.x + 4, l.y - 124); ctx.closePath(); ctx.fill(); ctx.restore();
}
function drawPampaCarreta(c) {
  ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.f, 1); ellipse(0, 6, 92, 14, 'rgba(14,16,8,.3)');
  ctx.fillStyle = '#c4b48c'; ctx.strokeStyle = '#4a3c24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-64, -48); ctx.quadraticCurveTo(-58, -104, 0, -106); ctx.quadraticCurveTo(58, -104, 64, -48); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(74,60,36,.5)'; for (const x of [-30, 0, 30]) { ctx.beginPath(); ctx.moveTo(x, -102); ctx.lineTo(x, -50); ctx.stroke(); }
  rect(-72, -50, 144, 22, '#6a4a2a', 3, '#2e1e10'); ctx.strokeStyle = '#5a3e22'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(70, -36); ctx.lineTo(118, -10); ctx.stroke();
  for (const x of [-42, 42]) { ctx.strokeStyle = '#3a2614'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, -22, 26, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 26, -22 - Math.sin(a) * 26); ctx.lineTo(x + Math.cos(a) * 26, -22 + Math.sin(a) * 26); ctx.stroke(); } }
  ctx.restore();
}
function drawPampaPalanque(r) {
  const cx = r.x + r.w / 2; ellipse(cx, r.y + r.h, r.w * .56, 14, 'rgba(14,16,8,.3)');
  if (typeof pampaObject !== 'function' || !pampaObject('pampa-props', 11, cx, r.y + r.h, r.w)) {
  rect(r.x, r.y + 70, r.w, 26, '#8a6a42', 3, '#2e1e10'); for (let k = 0; k < 8; k++) rect(r.x + 4 + k * (r.w - 8) / 8, r.y + 72, 2, 22, 'rgba(46,30,16,.5)');
  for (const x of [r.x + 14, r.x + r.w - 30, cx - 8]) rect(x, r.y + 94, 16, r.h - 94, '#5a3e22', 2, '#2e1e10'); for (let k = 0; k < 3; k++) rect(cx - 64 + k * 8, r.y + r.h - 12 - k * 22, 128 - k * 16, 12, '#7a5a34', 2, '#2e1e10');
  }
  // O mastro e, depois da proclamação, a bandeira. Na cena final ela sobe devagar (scene.bandeiraK vai de 0 a 1).
  const m = pampaMastro(r); rect(m.x - 5, m.topo, 10, m.pe - m.topo, '#6a4a2a', 3, '#2e1e10'); ellipse(m.x, m.topo - 3, 8, 8, '#d8b858');
  if (pampaState().bandeira) { const k = scene?.bandeiraK ?? 1, h = r.h * .62; drawBandeiraFarrapa(m.x + 5, m.topo + 12 + (1 - k) * (m.pe - m.topo - h - 40), h * 1.56, h); }
}
function pampaMastro(r) { return { x: r.x + r.w * .9, topo: r.y - r.h * 1.15, pe: r.y + r.h * .42 }; }
function pampaPalanqueDeck(r) { return r.y + r.h * .54; }
// A bandeira do Rio Grande: as três faixas em diagonal (verde, vermelho, amarelo), um pano só que ondula, com luz e sombra
// nas dobras e o brasão no meio.
function drawBandeiraFarrapa(x, y, w, h) {
  const N = 26, onda = t => (Math.sin(frameClock * 3.2 - t * 6.5) * 7 + Math.sin(frameClock * 1.7 - t * 3) * 3) * Math.min(1, t * 2.2), topo = t => y + onda(t), lin = (a, t) => clamp(a - t * .9, 0, 1);
  const faixa = (s0, s1, cor) => { ctx.beginPath(); for (let i = 0; i <= N; i++) { const t = i / N; ctx.lineTo(x + w * t, topo(t) + h * lin(s0, t)); } for (let i = N; i >= 0; i--) { const t = i / N; ctx.lineTo(x + w * t, topo(t) + h * lin(s1, t)); } ctx.closePath(); ctx.fillStyle = cor; ctx.fill(); };
  ctx.save(); ctx.lineJoin = 'round';
  ctx.beginPath(); for (let i = 0; i <= N; i++) { const t = i / N; ctx.lineTo(x + 8 + w * t, topo(t) + 10); } for (let i = N; i >= 0; i--) { const t = i / N; ctx.lineTo(x + 8 + w * t, topo(t) + h + 10); } ctx.closePath(); ctx.fillStyle = 'rgba(10,12,8,.2)'; ctx.fill();
  faixa(0, .62, '#1c7a3e'); faixa(.62, 1.2, '#c4242c'); faixa(1.2, 1.9, '#f0c420');
  // As dobras do pano: tiras claras e escuras que acompanham a onda.
  for (let i = 0; i < N; i++) { const t = i / N, t2 = (i + 1) / N, d = onda(t2) - onda(t); ctx.fillStyle = d > 0 ? `rgba(0,0,0,${Math.min(.22, d * .07)})` : `rgba(255,255,255,${Math.min(.2, -d * .06)})`; ctx.beginPath(); ctx.moveTo(x + w * t, topo(t)); ctx.lineTo(x + w * t2, topo(t2)); ctx.lineTo(x + w * t2, topo(t2) + h); ctx.lineTo(x + w * t, topo(t) + h); ctx.closePath(); ctx.fill(); }
  const mx = x + w * .5, my = topo(.5) + h * .5; ctx.fillStyle = '#f4efe0'; ctx.strokeStyle = '#8a6a22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(mx, my, h * .19, h * .24, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1c7a3e'; ctx.beginPath(); ctx.moveTo(mx, my - h * .13); ctx.lineTo(mx + h * .09, my + h * .03); ctx.lineTo(mx, my + h * .15); ctx.lineTo(mx - h * .09, my + h * .03); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,10,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i <= N; i++) { const t = i / N; ctx.lineTo(x + w * t, topo(t)); } for (let i = N; i >= 0; i--) { const t = i / N; ctx.lineTo(x + w * t, topo(t) + h); } ctx.closePath(); ctx.stroke();
  ctx.restore();
}
function drawPampaTapera(r) {
  ellipse(r.x + r.w / 2, r.y + r.h + 2, r.w * .55, 12, 'rgba(14,16,8,.3)');
  const parede = (pts, cor) => {
    ctx.save(); const c = new Path2D(); pts.forEach(([x, y], i) => i ? c.lineTo(r.x + x, r.y + y) : c.moveTo(r.x + x, r.y + y)); c.closePath(); ctx.fillStyle = cor; ctx.fill(c); ctx.clip(c);
    // As fiadas de adobe, cada bloco com um tom.
    for (let f = 0; f < 11; f++) for (let b = 0; b < 16; b++) { const bx = r.x + b * 24 - (f % 2) * 12, by = r.y + 20 + f * 17, k = ilhaNoise(b * 7 + r.x, f * 3); ctx.fillStyle = k < .34 ? 'rgba(60,40,20,.2)' : k > .72 ? 'rgba(255,230,180,.12)' : 'rgba(0,0,0,0)'; ctx.fillRect(bx, by, 23, 16); }
    ctx.strokeStyle = 'rgba(70,50,28,.42)'; ctx.lineWidth = 1; for (let f = 0; f < 12; f++) { ctx.beginPath(); ctx.moveTo(r.x, r.y + 20 + f * 17); ctx.lineTo(r.x + r.w, r.y + 20 + f * 17); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = '#3a2c1a'; ctx.lineWidth = 2.4; ctx.stroke(c);
  };
  parede([[186, 190], [186, 96], [240, 70], [300, 118], [300, 190]], '#94795a');
  ctx.strokeStyle = '#4e3620'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(r.x + 6, r.y + 58); ctx.lineTo(r.x + 172, r.y + 18); ctx.moveTo(r.x + 150, r.y + 34); ctx.lineTo(r.x + 268, r.y + 88); ctx.moveTo(r.x + 96, r.y + 40); ctx.lineTo(r.x + 138, r.y + 112); ctx.stroke();
  parede([[0, 190], [0, 60], [54, 40], [96, 92], [130, 74], [150, 190]], '#b89a70');
  rect(r.x + 44, r.y + 108, 48, 48, '#241a10', 2, '#3a2c1a'); ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(r.x + 68, r.y + 108); ctx.lineTo(r.x + 68, r.y + 156); ctx.stroke();
  for (const [x, w] of [[-14, 90], [128, 76], [270, 84]]) worldSprite('frontier-flora', 1, r.x + x - w * .2, r.y + r.h - w * .78, w, w * .85);
}
function drawPampaCerro(c) { mataNature(12, c.x, c.y + 30, c.w, c.h); }
function drawPampa(view, seen, layers) {
  const L = pampaLayout(), A = PAMPA_AREAS[L.n], got = pampaHoje(L.n);
  ilhaTilesDraw('p' + L.n, L.W, L.H, view, v => paintPampaGround(L, v));
  for (const p of L.pedacos) if (seen(p.x, p.y, 220)) layers.push({ y: p.y + 8, draw: () => pampaPedaco(p) });
  for (const q of L.portas) if (seen(q.x, q.y, 120)) layers.push({ y: q.y + 8, draw: () => pampaMoirao(q.x, q.y) });
  if (L.cancela && seen(L.cancela.x, L.cancela.y, 300)) layers.push({ y: L.cancela.y + 6, draw: () => drawPampaCancela(L) });
  for (const c of L.capim) if (seen(c.x, c.y, 180)) layers.push({ y: c.y, draw: () => pampaCapim(c) });
  for (const c of L.taboas) if (seen(c.x, c.y, 180)) layers.push({ y: c.y, draw: () => pampaCapim(c) });
  for (const u of L.umbus) if (seen(u.x, u.y, 460)) layers.push({ y: u.y, draw: () => pampaUmbu(u) });
  for (const o of L.pedras) if (seen(o.x, o.y, 180)) layers.push({ y: o.y, draw: () => { if (!(typeof pampaStoneSprite === 'function' && pampaStoneSprite(o))) worldSprite('frontier-flora', 3, o.x - o.w / 2, o.y - o.w * .7, o.w, o.w * .75); } });
  for (const c of L.caveiras) if (seen(c.x, c.y, 60)) layers.push({ y: c.y - 8, draw: () => drawPampaCaveira(c) });
  for (const l of L.lancas) if (seen(l.x, l.y, 200)) layers.push({ y: l.y, draw: () => drawPampaLanca(l) });
  for (const c of L.carretas) if (seen(c.x, c.y, 180)) layers.push({ y: c.y + 4, draw: () => drawPampaCarreta(c) });
  for (const c of L.cerro) if (seen(c.x, c.y, 500)) layers.push({ y: c.y, draw: () => drawPampaCerro(c) });
  for (const c of L.baus) if (seen(c.x, c.y, 120)) layers.push({ y: c.y, draw: () => drawCaveChest({ x: c.x, y: c.y, open: got.includes(c.id) }) });
  for (const a of L.achados) if (!got.includes(a.id) && seen(a.x, a.y, 80)) layers.push({ y: a.y, draw: () => drawPampaErva(a) });
  if (L.palanque && seen(L.palanque.x, L.palanque.y, 500)) layers.push({ y: L.palanque.y + L.palanque.h, draw: () => drawPampaPalanque(L.palanque) });
  if (L.tapera && seen(L.tapera.x, L.tapera.y, 400)) layers.push({ y: L.tapera.y + L.tapera.h, draw: () => drawPampaTapera(L.tapera) });
  if (L.ferraria && seen(L.ferraria.x, L.ferraria.y, 600)) {
    const F = L.ferraria; layers.push({ y: F.y + F.h, draw: () => { ellipse(F.x + F.w / 2, F.y + F.h - 6, F.w * .5, 16, 'rgba(14,16,8,.3)'); if (!(typeof pampaBuildingSprite === 'function' && pampaBuildingSprite(F)) && !worldSprite('architecture-shop-melhorias', 0, F.x, F.y, F.w, F.h)) drawStoneHouse(F, 'FERRARIA'); } });
    layers.push({ y: L.zeferino.y, draw: () => drawZeferino(L.zeferino.x, L.zeferino.y, worldOut.x < L.zeferino.x ? -1 : 1) });
  }
  layers.push({ y: L.placa.y, draw: () => mataPlaca(L.placa.x, L.placa.y, A.nome.toUpperCase(), 230) });
  if (L.camp && seen(L.camp.x, L.camp.y, 600)) layers.push({ y: L.camp.y + 20, draw: () => drawTrechoCamp({ camp: L.camp }) });
  // O minuano: riscos de vento correndo pelo campo e a luz, cada trecho mais perto da noite.
  layers.push({ y: 8e9, draw: () => {
    if (A.veu) rect(view.x, view.y, view.w, view.h, A.veu);
    if (L.camp && !scene) { const P = ilhaFogoPartes(L.camp); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(P.fogo.x, P.fogo.y - 20, 320, .13 + L.n * .012 + .03 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore(); }
    if (L.arena && seen(L.arena.x, L.arena.y, 800)) return;
    ctx.save(); ctx.strokeStyle = 'rgba(244,240,214,.16)'; ctx.lineCap = 'round'; ctx.lineWidth = 2;
    for (let k = 0; k < 16; k++) { const v = 360 + k * 26, fx = view.x + ((k * 433 + frameClock * v) % (view.w + 400)) - 200, fy = view.y + (k * 271) % view.h, c = 60 + (k % 3) * 40; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + c * .5, fy - 4, fx + c, fy + 1); ctx.stroke(); }
    ctx.restore();
  } });
}

// ---------- O mapa ----------
WORLD_MAPS.pampa = {
  id: 'pampa', name: 'Pampa', W: PAMPA.W, H: PAMPA.H,
  spawn() { return { x: pampaLayout().xIn, y: 130 }; },
  canWalk(x, y) {
    const L = pampaLayout();
    if (L.cancela && y > L.cancela.y - 12 && !pampaSaidaAberta(L.n)) return false;
    if (!pampaAberta(L, x, y)) return false;
    if (L.pocas.some(q => Math.hypot((x - q.x) / q.rx, (y - q.y) / q.ry) < .92)) return false;
    if (L.solidos.some(o => Math.hypot(x - o.x, (y - o.y) * 1.3) < o.r)) return false;
    return !hitRect(L.rects, x, y) && !pampaFogoSolido(L, x, y);
  },
  edge(p) {
    const L = pampaLayout();
    if (p.y < 6) return L.n === 1 ? { map: 'serra', x: SERRA.roadX + SERRA.roadW / 2, y: SERRA.H - 120, title: 'Serra Gaúcha', text: 'De volta pela estrada da Serra.' } : pampaEntrada(L.n - 1, true);
    if (p.y > L.H - 6 && L.n < PAMPA.last && pampaSaidaAberta(L.n)) return pampaEntrada(L.n + 1);
    return null;
  },
  spots() {
    const L = pampaLayout(), A = PAMPA_AREAS[L.n], got = pampaHoje(L.n), list = [{ id: 'pampa:placa', x: L.placa.x - 70, y: L.placa.y + 30, radius: 110, info: true, label: 'Placa · ' + A.nome, text: A.aviso }], f = pampaFogoAqui(L.n);
    if (L.ferraria) { const F = L.ferraria; list.push({ id: 'pampa:ferraria', x: F.x + F.w / 2, y: F.y + F.h + 34, radius: 150, label: 'Ferraria do seu Zeferino · melhorar armas', act: pampaForjaIntro }); }
    if (L.camp && f) {
      const P = ilhaFogoPartes(L.camp); list.push({ id: 'pampa:fogo:' + f.id, x: P.fogo.x, y: P.fogo.y + 70, radius: 110, label: 'Descansar e salvar · ' + f.nome, act: () => pampaDescansa(f) });
      if (pampaFogoAceso(f.id)) list.push({ id: 'pampa:trilha:' + f.id, x: P.barraca.x, y: P.barraca.y + 40, radius: 100, label: 'Seguir a trilha dos farrapos', act: () => pampaTrilha(f) });
    }
    for (const c of L.baus) if (!got.includes(c.id)) list.push({ id: 'pampa:bau:' + c.id, x: c.x, y: c.y + 10, radius: 95, label: 'Abrir o baú', act: () => pampaAbreBau(L, c) });
    for (const a of L.achados) if (!got.includes(a.id)) list.push({ id: 'pampa:erva:' + a.id, x: a.x, y: a.y + 10, radius: 80, label: 'Colher ' + PAMPA_ERVAS[a.k], act: () => pampaColhe(L, a) });
    if (L.cancela && !pampaSaidaAberta(L.n)) list.push({ id: 'pampa:trancada', x: L.cancela.x, y: L.cancela.y - 40, radius: 130, label: 'Cancela trancada', text: { [PAMPA_N.sargento]: 'A cancela do sul tá presa com lanças amarradas. Quem amarrou foi o Sargento Recolhedor.', [PAMPA_N.boi]: 'Corrente na cancela. Um peão largou um aviso: enquanto o Boi Barroso andar solto na mangueira de pedra, ninguém passa.', [PAMPA_N.capitao]: 'Dois imperiais fecharam a cancela. Quem manda aqui é o capitão de cavalaria, lá perto do palanque.' }[L.n] });
    if (L.n === PAMPA_N.seival) list.push({ id: 'pampa:seival', x: L.placa.x - 70, y: L.placa.y + 150, radius: 90, info: true, label: 'Marco do Seival', text: 'Em 10 de setembro de 1836, no Seival, os farrapos do coronel Antônio de Sousa Neto venceram as tropas imperiais de João da Silva Tavares.' });
    if (L.palanque) list.push({ id: 'pampa:palanque', x: L.palanque.x + L.palanque.w / 2, y: L.palanque.y + L.palanque.h + 30, radius: 130, label: 'Palanque vazio', text: 'Um palanque de tábuas e um mastro sem bandeira. Parece que tá esperando alguém.' });
    if (L.mangueira) list.push({ id: 'pampa:mangueira', x: L.mangueira.x, y: L.mangueira.y - L.mangueira.r * .72 + 50, radius: 120, info: true, label: 'Mangueira de pedra', text: 'Mangueira é o curral dos campos do Sul. As de pedra, levantadas à mão, sem argamassa, estão de pé há mais de duzentos anos.' });
    if (L.tapera) list.push({ id: 'pampa:tapera', x: L.tapera.x + L.tapera.w / 2, y: L.tapera.y + L.tapera.h + 28, radius: 120, label: 'Tapera', text: 'Tapera é o que sobra de um rancho abandonado. Daqui, alguém saiu pra guerra e não voltou.' });
    if (L.n === PAMPA_N.lanceiros && L.camp) list.push({ id: 'pampa:lancas', x: L.camp.x + 40, y: L.camp.y + L.camp.ry - 60, radius: 120, label: 'Lanças fincadas', text: 'Lanças dos lanceiros, fincadas em roda. Ninguém mexe nelas sem pedir licença.' });
    if (L.arena) list.push({ id: 'pampa:porongos', x: L.arena.x - 300, y: L.arena.y - L.arena.ry + 70, radius: 130, info: true, label: 'Cerro de Porongos', text: 'Na madrugada de 14 de novembro de 1844, os Lanceiros Negros, acampados sob o comando de David Canabarro e, segundo muitos relatos, desarmados, foram atacados pelas tropas imperiais do Moringue. Mais de cem morreram. Até hoje se discute se houve traição.' });
    return list;
  },
  draw(view, seen, layers) { drawPampa(view, seen, layers); },
  onEnter() { mataNight = null; }
};
REGION_NAMES.pampa = 'Pampa';
if (typeof SONS_FORA !== 'undefined') SONS_FORA.add('pampa');

// ---------- Ligações ----------
{
  // O trecho em que o Sadi está viaja junto com a troca de mapa.
  const swap = switchMap; switchMap = function (to) { if (to.map === 'pampa' && to.n) pampaState().area = to.n; return swap(to); };
  // A forja do seu Zeferino usa as mesmas compras da forja de São Dunstano.
  const aberta = dunstanShopOpen; dunstanShopOpen = function () { return aberta() || pampaAqui() && pampaArea() === 1; };
  const loja = dunstanShop; dunstanShop = function () { if (pampaAqui()) { pampaForja(); return; } return loja(); };
  // A porteira, no fim da estrada da Serra: fechada até o Grenfell cair.
  const S = SERRA, M = WORLD_MAPS.serra, cx = S.roadX + S.roadW / 2, GY = S.H - 74, blocked = M.blocked, edge = M.edge, spots = M.spots, draw = M.draw;
  const R = caveRand(7700), pontos = (x0, x1) => { const out = []; for (let x = x0; x < x1; x += 24) out.push([x, GY]); return out; }, cerca = []; for (const [a, b] of [[-20, cx - 72], [cx + 72, S.W + 20]]) { const q = pontos(a, b); for (let i = 0; i < q.length; i += 8) cerca.push(pampaPedacoDe(q.slice(i, i + 8), R)); }
  M.blocked = function (x, y) { if (y > GY - 8 && !(pampaAberto() && Math.abs(x - cx) < 56)) return true; return blocked.call(this, x, y); };
  M.edge = function (p) { if (p.y > S.H - 14 && pampaAberto()) return pampaEntrada(1); return edge.call(this, p); };
  M.spots = function () { const list = spots.call(this); list.push({ id: 'pampa:porteira', x: cx, y: GY - 40, radius: 120, label: pampaAberto() ? 'Porteira do Pampa' : 'Porteira do Pampa · trancada', text: pampaAberto() ? 'A porteira do pampa está aberta. Daqui pra baixo é campo, vento e o Cerro de Porongos.' : 'Porteira trancada a corrente, com o selo do Império. Enquanto o almirante mandar na ilha, ninguém passa pro pampa.' }); return list; };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); if (!seen(cx, GY, 900)) return;
    road(S.roadX, S.roadSouth, S.roadW, S.H - S.roadSouth);
    for (const p of cerca) if (seen(p.x, p.y, 220)) layers.push({ y: p.y + 8, draw: () => pampaPedaco(p) });
    layers.push({ y: GY + 6, draw: () => {
      pampaMoirao(cx - 66, GY); pampaMoirao(cx + 66, GY);
      if (pampaAberto()) { for (const [s, h] of [[-1, 20], [1, 20]]) for (const y of [38, 22, 6]) rect(cx + s * 66 - (s > 0 ? 0 : 8), GY - y - h + 6, 8, h, '#8a6a42', 2, '#2e1e10'); }
      else { for (const y of [50, 32, 14]) rect(cx - 62, GY - y, 124, 8, '#8a6a42', 2, '#2e1e10'); ctx.strokeStyle = '#3a3a3e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 8, GY - 54); ctx.lineTo(cx + 8, GY - 8); ctx.moveTo(cx + 8, GY - 54); ctx.lineTo(cx - 8, GY - 8); ctx.stroke(); }
    } });
    layers.push({ y: GY - 30, draw: () => signBoard(cx + 190, GY - 110, 150, 'PAMPA ↓', 13) });
  };
}
