// O começo de cada área é uma base em paz, como o pinheiral do Garibaldi na Mata de Araucárias:
//   · Ilha da Fortaleza: a Vila do Trapiche. Do trapiche até a encruzilhada das trilhas, bicho nenhum nasce nem
//     ataca. Ali já estavam o seu Nereu (no barco), o fogo e a oficina do John Griggs; agora, depois de conhecidos, o
//     monge João Maria e o general Canabarro descem e ficam na vila, cada um no seu lote.
//   · Pampa: a Porteira do Pampa (trecho 1), que já não tinha bicho. Ficavam o seu Zeferino e o fogo do Garibaldi; agora,
//     depois de conhecidos, o coronel Neto, o Lanceiro Negro, a Anita e o Canabarro vêm morar na porteira, e o Bento,
//     depois de livre.
// Cada morador tem um lote marcado (estacas, corda e placa). Quando a arte da casa existir em
// assets/images/bases/<id do lote>.png, o lote vira a casa sozinho, com chão sólido. Ver docs/bases-regionais.md.
// Nos fogos de cada um, nada muda: é lá que o Sadi conhece cada personagem.
'use strict';

const BASE_ZONAS = { ilha: { nome: 'Vila do Trapiche', x: 3100, y: 4420, rx: 1300, ry: 680 } };
// Cada lote: a caixa da arte (x, y, w, h: o pé da casa fica em y + h), a frente (onde fica a porta) e o morador.
const BASE_LOTES = [
  // Doorways are about 125 world pixels tall, matching an adult; roofs do not set the scale.
  { id: 'ilha-oratorio-monge', mapa: 'ilha', nome: 'Oratório do monge João Maria', dono: 'joaomaria', x: 2350, y: 3651, w: 560, h: 539, portaX: .44, trilha: [2630, 4275], quando: () => !!ilhaState().folks?.joaomaria },
  { id: 'ilha-quartel-canabarro', mapa: 'ilha', nome: 'Quartel farrapo do general Canabarro', dono: 'canabarro', x: 3290, y: 3739, w: 660, h: 461, portaX: .48, trilha: [3080, 4250], quando: () => !!ilhaState().folks?.canabarro && !G.pampa?.folk?.canabarro },
  { id: 'ilha-casa-nereu', mapa: 'ilha', nome: 'Casa do seu Nereu, o barqueiro', dono: null, x: 3450, y: 4276, w: 560, h: 374, portaX: .38, trilha: [3015, 4580] },
  { id: 'pampa-casa-comando', mapa: 'pampa', n: 1, nome: 'Casa de comando farroupilha', dono: 'neto', x: 2070, y: 128, w: 800, h: 552, portaX: .48, trilha: [1900, 780], quando: () => !!G.pampa?.folk?.neto },
  { id: 'pampa-casa-anita', mapa: 'pampa', n: 1, nome: 'Rancho da Anita e do Garibaldi', dono: 'anita', x: 3020, y: 340, w: 560, h: 441, portaX: .45, trilha: [2820, 1010], quando: () => !!G.pampa?.folk?.anita },
  { id: 'pampa-rancho-lanceiros', mapa: 'pampa', n: 1, nome: 'Rancho dos Lanceiros Negros', dono: 'lanceiro', x: 2070, y: 1154, w: 1020, h: 397, portaX: .225, trilha: [1900, 1620], quando: () => !!G.pampa?.folk?.lanceiro }
];
// Quem mais fica na base, sem lote próprio: em pé perto de um lote dos generais.
const BASE_VISITAS = [
  { id: 'canabarro', mapa: 'pampa', n: 1, junto: 'pampa-casa-comando', dx: -120, quando: () => !!G.pampa?.folk?.canabarro },
  { id: 'bento', mapa: 'pampa', n: 1, junto: 'pampa-casa-comando', dx: 175, quando: () => !!G.pampa?.republica }
];
// Os enfeites de cada base (só aparecem quando a arte existir em assets/images/bases/enfeites/<id>.png):
// x, y é o pé do objeto (centro de baixo) e w a largura dele no mundo; a altura sai da proporção da imagem.
const BASE_ENFEITES = [
  { id: 'ilha-varal-redes', mapa: 'ilha', nome: 'Varal de redes de pesca', x: 4170, y: 4580, w: 260 },
  { id: 'ilha-poco', mapa: 'ilha', nome: 'Poço da vila', x: 3250, y: 4480, w: 110 },
  { id: 'ilha-banco-cruzeiro', mapa: 'ilha', nome: 'Banco e cruzeiro do monge', x: 2930, y: 4160, w: 160 },
  { id: 'ilha-canoa-virada', mapa: 'ilha', nome: 'Canoa virada no cavalete', x: 3660, y: 4850, w: 290 },
  { id: 'pampa-palanque', mapa: 'pampa', n: 1, nome: 'Palanque com dois cavalos encilhados', x: 1460, y: 1260, w: 380 },
  { id: 'pampa-poco', mapa: 'pampa', n: 1, nome: 'Poço de sarilho', x: 2935, y: 890, w: 120 },
  { id: 'pampa-carreta', mapa: 'pampa', n: 1, nome: 'Carreta de boi descansando', x: 1030, y: 1440, w: 340 },
  { id: 'pampa-lenha', mapa: 'pampa', n: 1, nome: 'Pilha de lenha com cepo e machado', x: 3230, y: 1500, w: 180 },
  { id: 'pampa-bebedouro', mapa: 'pampa', n: 1, nome: 'Bebedouro de tronco', x: 1660, y: 1130, w: 220 }
];
function basePe(l) { return { x: l.x + 14, y: l.y + l.h * .58, w: l.w - 28, h: l.h * .42 }; }
function baseFrente(l) { return { x: l.x + l.w * (l.portaX ?? .5), y: l.y + l.h + 55 }; }
function baseLotesAqui() { const m = worldOut?.map, n = m === 'pampa' ? pampaLayout().n : null; return BASE_LOTES.filter(l => l.mapa === m && (l.n == null || l.n === n)); }
function baseNaZona(mapa, x, y) { const z = BASE_ZONAS[mapa]; return !!z && ((x - z.x) / z.rx) ** 2 + ((y - z.y) / z.ry) ** 2 < 1; }

// ---------- A arte das casas (quando existir) ----------
const BASE_ARTE = {};
function baseImagem(src) {
  let a = BASE_ARTE[src];
  if (!a) { a = BASE_ARTE[src] = { im: new Image(), ok: false }; a.im.onload = () => { a.ok = true; }; a.im.onerror = () => { a.ok = false; }; a.im.src = src; }
  return a.ok ? a.im : null;
}
function baseArte(l) { return baseImagem('assets/images/bases/' + l.id + '.png'); }
function baseArteEnfeite(e) { return baseImagem('assets/images/bases/enfeites/' + e.id + '.png'); }
function baseEnfeitesAqui() { const m = worldOut?.map, n = m === 'pampa' ? pampaLayout().n : null; return BASE_ENFEITES.filter(e => e.mapa === m && (e.n == null || e.n === n)); }
function baseSolido(mapa, x, y, n = null) {
  for (const l of BASE_LOTES) if (l.mapa === mapa && (l.n == null || l.n === n) && baseArte(l)) { const p = basePe(l); if (x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h) return true; }
  for (const e of BASE_ENFEITES) if (e.mapa === mapa && (e.n == null || e.n === n) && baseArteEnfeite(e) && ((x - e.x) / (e.w * .42)) ** 2 + ((y - e.y + 12) / 20) ** 2 < 1) return true;
  return false;
}
// Onde nada nasce (mato, pedra, árvore): o lote, a frente dele e o lugar de cada enfeite.
function baseReservado(mapa, x, y, pad = 0, n = null) {
  if (BASE_LOTES.some(l => l.mapa === mapa && (l.n == null || l.n === n) && x > l.x - 90 - pad && x < l.x + l.w + 90 + pad && y > l.y - 40 - pad && y < l.y + l.h + 230 + pad)) return true;
  return BASE_ENFEITES.some(e => e.mapa === mapa && (e.n == null || e.n === n) && Math.abs(x - e.x) < e.w / 2 + 70 + pad && y > e.y - 60 - pad && y < e.y + 200 + pad);
}
function drawBaseEnfeite(e) {
  const im = baseArteEnfeite(e); if (!im) return;
  const h = im.naturalHeight * e.w / im.naturalWidth;
  ellipse(e.x, e.y - 4, e.w * .46, 12, 'rgba(14,12,8,.3)'); ctx.drawImage(im, e.x - e.w / 2, e.y - h, e.w, h);
}
// Quiet worn-earth approaches connect each doorway to its village path.
// These are baked into the existing terrain tiles, not repainted each frame.
function drawBasePatios(mapa, n = null) {
  const soil = ilhaPattern(1);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(const l of BASE_LOTES){
    if(l.mapa!==mapa||(l.n!=null&&l.n!==n)||!l.trilha)continue;
    const f=baseFrente(l),bottom=l.y+l.h;
    ctx.beginPath();ctx.moveTo(...l.trilha);ctx.lineTo(f.x,f.y+8);ctx.lineTo(f.x,bottom-4);
    ctx.strokeStyle=soil||'#967c53';
    for(const [width,alpha] of [[88,.12],[70,.16],[52,.35]]){ctx.lineWidth=width;ctx.globalAlpha=alpha;ctx.stroke();}
    ctx.globalAlpha=.25;ctx.fillStyle=soil||'#967c53';
    ctx.beginPath();ctx.ellipse(f.x,bottom+18,95,36,0,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

// ---------- O lote marcado (enquanto a casa não vem) ----------
function drawBaseLote(l) {
  const im = baseArte(l);
  if (im) { const k = Math.min(l.w / im.naturalWidth, l.h / im.naturalHeight), w = im.naturalWidth * k, h = im.naturalHeight * k; ellipse(l.x + l.w / 2, l.y + l.h - 4, w * .48, 14, 'rgba(14,12,8,.3)'); ctx.drawImage(im, l.x + (l.w - w) / 2, l.y + l.h - h, w, h); return; }
  const p = basePe(l);
  ctx.save(); ctx.fillStyle = 'rgba(120,92,56,.32)'; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.restore();
  const cantos = [[p.x, p.y], [p.x + p.w, p.y], [p.x + p.w, p.y + p.h], [p.x, p.y + p.h]];
  ctx.save(); ctx.strokeStyle = 'rgba(220,200,150,.85)'; ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.beginPath(); cantos.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y - 14)); ctx.closePath(); ctx.stroke(); ctx.restore();
  for (const [x, y] of cantos) { ellipse(x + 3, y + 2, 6, 3, 'rgba(10,8,6,.3)'); rect(x - 3, y - 26, 6, 28, '#7a5a34', 2, '#3a2412'); }
  mataPlaca(l.x + l.w / 2, p.y - 8, 'LOTE · ' + l.nome.toUpperCase(), Math.min(320, Math.max(180, l.nome.length * 7.5)));
}

// ---------- Quem mora na base ----------
const BASE_FALAS = {
  joaomaria: [
    [['joaomaria', 'Desci da cerração, filho. Lá em cima o fogo é meu, mas aqui embaixo o povo precisa mais de reza.'], ['joaomaria', 'Vou fazer o meu oratório ali: uma cruz de cedro e um olho d\'água benzido pros pescadores.']],
    [['joaomaria', 'O seu Nereu me contou que a cerração já nem chega na praia. É a fé de quem fica, filho.'], ['sadi', 'E a de quem volta, seu João Maria.']],
    [['joaomaria', 'Quando subir, leva o sal e a arruda. Quando descer, senta aqui, que eu benzo a tua volta.']]
  ],
  canabarro: [
    [['canabarro', 'Montei o quartel aqui embaixo, gaúcho. Ninguém planeja guerra na boca do canhão.'], ['canabarro', 'Daqui a gente vê o barco do Nereu chegar e a fortaleza lá em cima.']],
    [['canabarro', 'Os meus homens trazem cartucho de carabina pra quem descansa nos fogos da ilha. Não esquece.']],
    [['canabarro', 'Se o Grenfell subir na muralha, tu sabe: arpão do Griggs, puxa e briga no chão.'], ['sadi', 'Que nem peixe, general.']]
  ],
  neto: [
    [['neto', 'Comando se faz perto da porteira, bodegueiro: quem chega e quem sai passa por mim.'], ['neto', 'Vou erguer a casa de comando ali, com mastro pra bandeira.']],
    [['neto', 'No Seival, a cavalaria fez o serviço. Aqui, quem faz é o teu facão.']],
    [['neto', 'Passa na forja do Zeferino antes de descer. Lá embaixo, o campo não perdoa.']]
  ],
  lanceiro: [
    [['lanceiro', 'A gente vai levantar o rancho aqui, perto da porteira. Junto da tropa, não separado.'], ['sadi', 'Desta vez, junto.'], ['lanceiro', 'Desta vez, junto.']],
    [['lanceiro', 'Lança se cuida que nem cavalo: com respeito e todo dia.']],
    [['lanceiro', 'Quando a guerra acabar de verdade, quero ver um baile na tua bodega. E a gente entra pela porta da frente.']]
  ],
  anita: [
    [['anita', 'O Giuseppe acende o fogo; eu cuido do resto. Vou fazer um rancho ali, com rede e janela pro campo.']],
    [['anita', 'Senta, bodegueiro. Tu come em pé desde Laguna.']],
    [['anita', 'Se o Giuseppe disser que é "só mais uma batalha", não acredita. Nunca é.']]
  ],
  canabarro_pampa: [
    [['canabarro', 'Fico na porteira com o Neto. Lá embaixo eu já disse o que tinha pra dizer.']],
    [['canabarro', 'Ponche Verde vai chegar, gaúcho. Mas antes tem Porongos.']]
  ],
  bento: [
    [['bento', 'Livre, bodegueiro. E a primeira coisa que eu quis foi sentar na porteira, olhando o campo.'], ['bento', 'A República não é bandeira no mastro: é gente que não abaixa a cabeça.']],
    [['bento', 'O Neto manda na porteira, o Canabarro faz conta e eu escuto os dois. Assim a gente chegou até aqui.']]
  ]
};
function baseFala(id, pampa) {
  const chave = pampa && id === 'canabarro' ? 'canabarro_pampa' : id, sets = BASE_FALAS[chave]; if (!sets) return;
  const st = G.bases ??= {}; st.prosa ??= {}; const k = (st.prosa[chave] || 0) % sets.length; st.prosa[chave] = (st.prosa[chave] || 0) + 1; save();
  if (pampa) pampaTalk(sets[k], null, 'Valeu'); else talk(ilhaFolkFala(sets[k]), null, 'Valeu');
}
function baseMorador(m, pampa) {
  const dx = m.walk ? m.dx : worldOut && worldOut.x < m.x ? -1 : 1;
  if (m.walk) {
    if (pampa && m.id === 'neto') { pampaFigura('neto', m.x, m.y, dx, 1, 1, 1 + frameClock * 7); return; }
    if (FOLK_ART_SIZE[m.id] && historyFigure(m.id, m.x, m.y, 1, dx, true, m.dy)) { if (m.id === 'joaomaria') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(m.x, m.y - 90, 80, .1, '255,230,170'); ctx.restore(); } return; }
  }
  if (!pampa && ILHA_FOLKS[m.id]) ILHA_FOLKS[m.id].draw(m.x, m.y, dx);
  else drawPampaFolk(m.id, m.x, m.y);
}
function baseMoradores() {
  const out = [], pampa = worldOut?.map === 'pampa';
  for (const l of baseLotesAqui()) if (l.dono && (!l.quando || l.quando())) { const f = baseFrente(l); out.push({ id: l.dono, x: f.x + 70, y: f.y - 14 }); }
  if (pampa) for (const v of BASE_VISITAS) if (v.n === pampaLayout().n && v.quando()) { const l = BASE_LOTES.find(x => x.id === v.junto), f = baseFrente(l); out.push({ id: v.id, x: f.x + v.dx, y: f.y + 6 }); }
  return out;
}
// ---------- Uma volta perto de casa ----------
// De vez em quando cada morador sai do lugar, anda um pedaço curto perto de casa (ou volta pra porta) e para de novo.
// Só vai aonde dá pra chegar em linha reta sem atravessar casa, enfeite ou taipa. Se o Sadi chega perto ou a prosa
// abre, para onde está e fica de frente pra ele.
const BASE_PASSEIO = { raio: 160, vel: 50, perto: 170 };
const baseAndar = {};
function baseAndarDe(m) {
  const key = worldOut.map + ':' + m.id; let a = baseAndar[key];
  if (!a || a.hx !== m.x || a.hy !== m.y) a = baseAndar[key] = { id: m.id, hx: m.x, hy: m.y, x: m.x, y: m.y, tx: m.x, ty: m.y, t: 3 + Math.random() * 6, walk: false, dx: 1, dy: 0 };
  return a;
}
function baseLinhaLivre(M, x0, y0, x1, y1) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 16);
  for (let i = 1; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; if (!M.canWalk(x, y) || !M.canWalk(x - 14, y) || !M.canWalk(x + 14, y)) return false; }
  return true;
}
function baseMoradoresAgora() { return worldOut ? baseMoradores().map(baseAndarDe) : []; }
function baseAndarTick(dt) {
  const M = WORLD_MAPS[worldOut.map], todos = baseMoradoresAgora();
  for (const a of todos) {
    if (talkState || Math.hypot(worldOut.x - a.x, worldOut.y - a.y) < BASE_PASSEIO.perto) { a.walk = false; a.t = Math.max(a.t, 2.5); continue; }
    if (a.walk) {
      const vx = a.tx - a.x, vy = a.ty - a.y, d = Math.hypot(vx, vy), passo = BASE_PASSEIO.vel * dt;
      if (d <= passo) { a.x = a.tx; a.y = a.ty; a.walk = false; a.t = 4 + Math.random() * 8; continue; }
      a.x += vx / d * passo; a.y += vy / d * passo;
      if (Math.abs(vx) > Math.abs(vy) * .8) { a.dx = Math.sign(vx); a.dy = 0; } else { a.dx = 0; a.dy = Math.sign(vy); }
      continue;
    }
    if ((a.t -= dt) > 0) continue;
    a.t = 2 + Math.random() * 3;
    const longe = Math.hypot(a.x - a.hx, a.y - a.hy) > 40;
    for (let k = 0; k < 10; k++) {
      const volta = longe && (k === 0 ? Math.random() < .5 : k > 6), ang = Math.random() * Math.PI * 2, r = 50 + Math.random() * (BASE_PASSEIO.raio - 50);
      const tx = volta ? a.hx : a.hx + Math.cos(ang) * r, ty = volta ? a.hy : a.hy + Math.sin(ang) * r * .45;
      if (Math.hypot(tx - a.x, ty - a.y) < 30 || todos.some(o => o !== a && Math.hypot(o.x - tx, o.y - ty) < 60)) continue;
      if (!baseLinhaLivre(M, a.x, a.y, tx, ty)) continue;
      Object.assign(a, { tx, ty, walk: true }); break;
    }
  }
}
function baseNome(id) { return id === 'neto' ? 'o coronel Neto' : id === 'lanceiro' ? 'o Lanceiro Negro' : id === 'joaomaria' ? 'o monge João Maria' : id === 'canabarro' ? 'o general Canabarro' : id === 'anita' ? 'a Anita' : id === 'bento' ? 'o Bento' : id; }

// ---------- Ligações ----------
{
  const islandGround=paintIlhaGround;
  paintIlhaGround=function(view){islandGround(view);drawBasePatios('ilha');};
  const pampaGround=paintPampaGround;
  paintPampaGround=function(L,view){pampaGround(L,view);drawBasePatios('pampa',L.n);};
  // Older saves may place Sadi inside an enlarged house. Move only such arrivals to its porch.
  const checked=new WeakMap(),outside=outsideTick;
  outsideTick=function(dt){
    if(worldOut&&!scene&&['ilha','pampa'].includes(worldOut.map)){
      const key=worldOut.map+':'+(worldOut.map==='pampa'?pampaArea():0),lotes=baseLotesAqui();
      if(checked.get(worldOut)!==key&&lotes.every(l=>baseArte(l))){
        checked.set(worldOut,key);
        const l=lotes.find(l=>{const p=basePe(l);return worldOut.x>p.x&&worldOut.x<p.x+p.w&&worldOut.y>p.y&&worldOut.y<p.y+p.h;});
        if(l){const f=baseFrente(l),M=WORLD_MAPS[worldOut.map];
          for(const [dx,dy] of [[0,30],[-70,30],[70,30],[0,100]])if(M.canWalk(f.x+dx,f.y+dy)){worldOut.x=f.x+dx;worldOut.y=f.y+dy;break;}
        }
      }
    }
    if (worldOut && !scene && !paused && !modal && ['ilha', 'pampa'].includes(worldOut.map)) baseAndarTick(dt);
    return outside(dt);
  };
  // Ilha: a vila do trapiche não tem bicho (nem nasce, nem persegue, nem fere) e o mato abre nos lotes.
  // Árvore tem copa alta: a que nasce logo na frente do lote tapava a casa inteira, então a frente fica mais limpa.
  const reserva = ilhaReserved; ilhaReserved = function (x, y, pad = 0) { return baseReservado('ilha', x, y, pad) || reserva(x, y, pad); };
  ilhaProps = null;
  const safe = ilhaSafe; ilhaSafe = function (x, y) { return safe(x, y) || baseNaZona('ilha', x, y); };
  // O posto de guarda que caía na vila é empurrado pra beira dela (ilhaSpotNear foge do chão seguro) e o bicho
  // voltava patrulhando pra dentro: quem tem casa perto da vila não nasce, e ninguém pisa nela.
  const perto = (x, y) => { const z = BASE_ZONAS.ilha; return ((x - z.x) / (z.rx * 1.3)) ** 2 + ((y - z.y) / (z.ry * 1.3)) ** 2 < 1; };
  const start = ilhaBeastsStart; ilhaBeastsStart = function () {
    start(); if (worldOut?.map !== 'ilha' || !mataNight?.beasts) return;
    mataNight.beasts = mataNight.beasts.filter(b => b.boss || !perto(b.home?.x ?? b.x, b.home?.y ?? b.y));
  };
  const tick = mataBeastTick; mataBeastTick = function (b, dt, p) {
    if (worldOut?.map !== 'ilha' || b.boss) return tick(b, dt, p);
    const x0 = b.x, y0 = b.y; tick(b, dt, p);
    if (baseNaZona('ilha', b.x, b.y) && !baseNaZona('ilha', x0, y0)) { b.x = x0; b.y = y0; if (b.home) { b.tx = b.home.x; b.ty = b.home.y; } }
  };
  const hurt = mataHurt; mataHurt = function (dmg, from) { if (worldOut?.map === 'ilha' && baseNaZona('ilha', worldOut.x, worldOut.y)) return; return hurt(dmg, from); };
  if (typeof ILHA_REGIAO_AVISO === 'object') ILHA_REGIAO_AVISO['Praia do Trapiche'] = 'A Vila do Trapiche: aqui ninguém briga. O seu Nereu, o Griggs e os amigos que tu fizer na ilha moram aqui.';
  // Pampa: a porteira abre espaço nos lotes.
  const lay = pampaLayout; pampaLayout = function (n = pampaArea()) {
    const L = lay(n); if (L._bases) return L; L._bases = true;
    const lotes = BASE_LOTES.filter(l => l.mapa === 'pampa' && l.n === L.n), enfeites = BASE_ENFEITES.filter(e => e.mapa === 'pampa' && e.n === L.n);
    const livre = o => !lotes.some(l => o.x > l.x - 40 && o.x < l.x + l.w + 40 && o.y > l.y - 20 && o.y < l.y + l.h + 80) && !enfeites.some(e => Math.abs(o.x - e.x) < e.w / 2 + 40 && o.y > e.y - 50 && o.y < e.y + 60);
    // The enlarged courtyard generates its complete perimeter; do not cut isolated wall fragments.
    for (const k of ['capim', 'pedras', 'umbus', 'caveiras', 'lancas', 'carretas', 'solidos']) if (Array.isArray(L[k])) L[k] = L[k].filter(livre);
    return L;
  };
  // Chão sólido onde a casa já tem arte.
  const iw = WORLD_MAPS.ilha.canWalk; WORLD_MAPS.ilha.canWalk = function (x, y) { if (baseSolido('ilha', x, y)) return false; return iw.call(this, x, y); };
  const pw = WORLD_MAPS.pampa.canWalk; WORLD_MAPS.pampa.canWalk = function (x, y) { if (baseSolido('pampa', x, y, pampaLayout().n)) return false; return pw.call(this, x, y); };
  // Desenho: os lotes (ou as casas) e os moradores.
  for (const id of ['ilha', 'pampa']) {
    const M = WORLD_MAPS[id], draw = M.draw, spots = M.spots;
    M.draw = function (view, seen, layers) {
      draw.call(this, view, seen, layers);
      // As casas e os enfeites aparecem também nas cenas; os moradores, não (a cena põe os atores dela).
      for (const l of baseLotesAqui()) if ((!scene || baseArte(l)) && seen(l.x + l.w / 2, l.y + l.h / 2, Math.max(l.w, l.h))) layers.push({ y: l.y + l.h, draw: () => drawBaseLote(l) });
      for (const e of baseEnfeitesAqui()) if (baseArteEnfeite(e) && seen(e.x, e.y - e.w / 2, e.w)) layers.push({ y: e.y, draw: () => drawBaseEnfeite(e) });
      if (scene) return;
      for (const m of baseMoradoresAgora()) if (seen(m.x, m.y, 200)) layers.push({ y: m.y, draw: () => baseMorador(m, id === 'pampa') });
    };
    M.spots = function () {
      const list = spots.call(this);
      for (const m of baseMoradoresAgora()) list.push({ id: 'base:' + m.id, x: m.x, y: m.y + 10, radius: 100, label: 'Prosear com ' + baseNome(m.id), act: () => baseFala(m.id, id === 'pampa') });
      for (const l of baseLotesAqui()) if (!baseArte(l)) { const f = baseFrente(l); list.push({ id: 'lote:' + l.id, x: f.x - 40, y: f.y, radius: 80, info: true, label: 'Lote · ' + l.nome, text: 'Lote reservado: aqui vai ficar ' + l.nome.charAt(0).toLowerCase() + l.nome.slice(1) + '.' }); }
      return list;
    };
  }
}
