// Interiores do mundo aberto: as casas dos personagens, a Casona dos gêmeos, a igreja e o salão da comunidade.
// Cada interior é um mapa pequeno (cômodos, paredes, móveis e quem estiver em casa); sai-se pela porta de baixo.
// Quem não está andando pela estrada nem na bodega está em casa.
'use strict';

// Hoje, quem anda pela estrada e quem fica em casa (os gêmeos andam sempre juntos).
// De dia, metade anda pela rua e metade fica em casa; de noite, quase todos em casa.
// Raramente alguém passa o dia em outra região (e o Sadi pergunta o que ele faz por aquelas bandas).
function worldNight() { return G.phase === 'closed' || G.phase === 'open' && G.elapsed / DAY > .72; }
function dayHash(i, salt = 0) { const id = PEOPLE[i]?.id || '', key = id === 'marcelo' ? 'marcio' : id; let h = (G.day || 1) * 131 + 7 + salt * 977; for (const c of key) h = (h * 31 + c.charCodeAt(0)) % 100003; return h; }
function homeRegion(i) { const id = PEOPLE[i]?.id; return id ? QUEST_HOMES[questKey(id)] || null : null; }
const WANDER_CHANCE = 7;   // em cada 100 dias, quantos o especial passa em outra região
function wanderMap(i) {
  const home = homeRegion(i); if (!home || worldNight() || PEOPLE[i]?.removed) return null;
  // quem tem missão para dar e mora numa região ainda fechada vem até a Fronteira procurar o Sadi
  if (regionLocked(home)) return missionForGiver(PEOPLE[i].id) ? 'vila' : null;
  if (dayHash(i, 3) % 100 >= WANDER_CHANCE) return null;
  const others = ['vila', 'serra', 'sc'].filter(m => m !== home && !regionLocked(m)); if (!others.length) return null;
  return others[dayHash(i, 5) % others.length];
}
function walkingToday(i) { if (wanderMap(i)) return false; const h = dayHash(i); return worldNight() ? h % 5 === 0 : h % 2 === 0; }
function atHome(id) { const i = PEOPLE.findIndex(p => p.id === id); return i >= 0 && !PEOPLE[i].removed && !activeUniqueVisitors().has(i) && (storyNeeds(id) || !wanderMap(i) && (!walkingToday(i) || !!questMarker(id))); }

// ---------- Pisos ----------
function drawFloor(r, kind) { ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip(); floorPattern(r, kind); ctx.restore(); }
function floorPattern(r, kind) {
  const { x, y, w, h } = r;
  if (kind === 'tile') { rect(x, y, w, h, '#e8e0d0'); for (let gx = x; gx < x + w; gx += 40) rect(gx, y, 2, h, '#c8bfae'); for (let gy = y; gy < y + h; gy += 40) rect(x, gy, w, 2, '#c8bfae'); return; }
  if (kind === 'marble') { rect(x, y, w, h, '#f4f2ee'); for (let gx = x; gx < x + w; gx += 70) rect(gx, y, 2, h, '#dcd8d2'); for (let gy = y; gy < y + h; gy += 70) rect(x, gy, w, 2, '#dcd8d2'); ctx.strokeStyle = 'rgba(150,145,140,.45)'; ctx.lineWidth = 1.5; for (let k = 0; k < Math.round(w * h / 9000); k++) { const sx = x + (k * 97) % w, sy = y + (k * 53) % h; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 20, sy + 14, sx + 46, sy + 8); ctx.stroke(); } return; }
  if (kind === 'stone') { rect(x, y, w, h, '#a8a298'); for (let gy = y; gy < y + h; gy += 34) for (let gx = x + ((gy - y) / 34 % 2) * 26; gx < x + w; gx += 52) rect(gx + 2, gy + 2, 48, 30, ['#b4aea4', '#9e988e', '#aaa49a'][(gx + gy) % 3], 4); return; }
  if (kind === 'dirt') { rect(x, y, w, h, '#9a7a52'); for (let k = 0; k < w * h / 1800; k++) rect(x + (k * 131) % w, y + (k * 71) % h, 4, 3, '#85683f', 1); return; }
  if (kind === 'concrete') { rect(x, y, w, h, '#a8a49c'); for (let gx = x; gx < x + w; gx += 120) rect(gx, y, 2, h, '#94908a'); return; }
  if (kind === 'carpet') { rect(x, y, w, h, '#8a2a2a'); rect(x + 6, y, 4, h, '#c8a040'); rect(x + w - 10, y, 4, h, '#c8a040'); return; }
  rect(x, y, w, h, '#9a6a3a'); for (let gy = y; gy < y + h; gy += 28) { rect(x, gy, w, 2, '#7a4a24'); for (let gx = x + ((gy - y) / 28 % 3) * 70; gx < x + w; gx += 210) rect(gx, gy, 2, 28, '#7a4a24'); }
}

// ---------- Móveis ----------
// Cada móvel tem a base (x, y, w, h) no chão, que é o que bloqueia; o desenho pode subir acima dela.
const FURN = {
  bed(i) { rect(i.x, i.y, i.w, i.h, '#7a4a2a', 6, '#3a2414'); rect(i.x + 8, i.y + 10, i.w - 16, i.h - 18, '#f0ece0', 6); rect(i.x + 8, i.y + i.h * .38, i.w - 16, i.h * .62 - 8, i.color || '#a83a3a', 6); rect(i.x + 16, i.y + 14, i.w * .36, 24, '#fffaf0', 8); if (i.w > 150) rect(i.x + i.w * .54, i.y + 14, i.w * .36, 24, '#fffaf0', 8); },
  // Cama baú: a cama em cima de um baú com gavetões.
  bedbau(i) { FURN.bed({ ...i, h: i.h - 36 }); rect(i.x - 4, i.y + i.h - 40, i.w + 8, 40, '#5a3420', 4, '#2a1a0e'); for (const k of [.25, .75]) { rect(i.x + i.w * k - 30, i.y + i.h - 32, 60, 22, '#7a4a2a', 3, '#2a1a0e'); rect(i.x + i.w * k - 8, i.y + i.h - 24, 16, 5, '#c8a040', 2); } },
  wardrobe(i) { rect(i.x, i.y - 70, i.w, i.h + 70, '#6a4024', 4, '#2a1a0e'); rect(i.x + i.w / 2 - 1, i.y - 66, 2, i.h + 62, '#2a1a0e'); for (const dx of [-10, 6]) rect(i.x + i.w / 2 + dx, i.y - 20, 4, 14, '#c8a040'); },
  table(i) {
    rect(i.x + 8, i.y + i.h - 22, 8, 22, '#4a2e18'); rect(i.x + i.w - 16, i.y + i.h - 22, 8, 22, '#4a2e18'); rect(i.x, i.y - 18, i.w, i.h, '#8a5a32', 6, '#4a2e18');
    if (i.cards) for (let k = 0; k < 3; k++) rect(i.x + 24 + k * 26, i.y - 6, 18, 26, '#f4f0e6', 2, '#8a3a2a');
    if (i.mate) { ellipse(i.x + i.w / 2 - 10, i.y - 2, 12, 10, '#6a8a3a'); rect(i.x + i.w / 2 + 10, i.y - 26, 14, 30, '#c83a2a', 3); }
    for (const cx of [i.x - 16, i.x + i.w + 4]) rect(cx, i.y - 4, 14, 26, '#6a4024', 3);
  },
  sofa(i) { rect(i.x, i.y - 34, i.w, i.h + 34, i.color || '#7a3a2a', 12, '#3a1a10'); rect(i.x + 12, i.y - 8, i.w - 24, i.h - 6, 'rgba(255,255,255,.14)', 8); rect(i.x - 6, i.y - 20, 18, i.h + 20, i.color || '#7a3a2a', 6, '#3a1a10'); rect(i.x + i.w - 12, i.y - 20, 18, i.h + 20, i.color || '#7a3a2a', 6, '#3a1a10'); },
  tv(i) { rect(i.x, i.y, i.w, i.h, '#5a3a20', 3, '#2a1a0e'); rect(i.x + i.w / 2 - 54, i.y - 76, 108, 70, '#1a1a1a', 6, '#3a3a3a'); rect(i.x + i.w / 2 - 46, i.y - 68, 92, 54, i.on === false ? '#2a3a44' : `hsl(${120 + Math.sin(frameClock) * 30},40%,40%)`, 2); },
  rug(i) { rect(i.x, i.y, i.w, i.h, i.color || '#8a2a2a', 10); rect(i.x + 12, i.y + 12, i.w - 24, i.h - 24, 'rgba(255,230,180,.22)', 8); },
  stove(i) { rect(i.x, i.y - 34, i.w, i.h + 34, '#2a2a2a', 4, '#111'); rect(i.x + 6, i.y - 30, i.w - 12, 10, '#4a4a4a'); ellipse(i.x + 30, i.y - 26, 14, 4, '#666'); if (!i.noPipe) rect(i.x + i.w - 30, i.y - 110, 14, 80, '#3a3a3a'); rect(i.x + 12, i.y + 8, 34, 24, '#e8702a', 3); rect(i.x + 12, i.y + 8, 34, 24, `rgba(255,210,90,${.3 + .2 * Math.sin(frameClock * 6)})`, 3); },
  counter(i) { rect(i.x, i.y - 34, i.w, i.h + 34, '#e8e0d0', 3, '#8a8070'); rect(i.x, i.y - 34, i.w, 12, '#9a9488'); if (i.sink) { rect(i.x + i.w / 2 - 30, i.y - 30, 60, 18, '#b8c0c8', 4); rect(i.x + i.w / 2 - 2, i.y - 50, 4, 20, '#8a8a90'); } },
  fridge(i) { rect(i.x, i.y - 100, i.w, i.h + 100, '#e8ecef', 6, '#8a9096'); rect(i.x, i.y - 44, i.w, 3, '#8a9096'); rect(i.x + i.w - 12, i.y - 90, 4, 34, '#8a9096'); if (i.refri) for (let k = 0; k < 3; k++) rect(i.x + 10 + k * 18, i.y - 30, 12, 22, '#c83a2a', 3); },
  toilet(i) { rect(i.x + 6, i.y - 24, i.w - 12, 30, '#f4f4f4', 4, '#b8b8b8'); ellipse(i.x + i.w / 2, i.y + i.h * .55, i.w / 2, i.h * .45, '#fafafa'); ellipse(i.x + i.w / 2, i.y + i.h * .55, i.w / 3, i.h * .28, '#dcecf4'); },
  bathtub(i) { rect(i.x, i.y - 14, i.w, i.h + 14, '#f4f2ee', 22, '#c8c0b8'); rect(i.x + 14, i.y - 2, i.w - 28, i.h - 14, '#a8d4e8', 16); rect(i.x + i.w - 40, i.y - 40, 6, 30, '#c8c8d0'); },
  sinkbath(i) { rect(i.x, i.y - 34, i.w, i.h + 34, '#ece8e2', 4, '#b8b0a8'); ellipse(i.x + i.w / 2, i.y - 18, i.w * .3, 9, '#c8d8e0'); rect(i.x + i.w / 2 - 30, i.y - 120, 60, 72, '#cfe0e8', 4, '#8a8a90'); },
  shelf(i) { rect(i.x, i.y - 120, i.w, i.h + 120, '#6a4024', 3, '#2a1a0e'); const colors = ['#8a2a2a', '#2a4a8a', '#3a6a3a', '#c8a040']; for (let k = 0; k < 4; k++) { const y = i.y - 112 + k * 30; rect(i.x + 4, y + 24, i.w - 8, 4, '#4a2a14'); for (let b = 0; b < i.w - 16; b += 10) rect(i.x + 8 + b, y + 4 + (b % 3), 8, 20, colors[(b / 10 + k) % 4]); } },
  desk(i) { rect(i.x, i.y - 34, i.w, i.h + 34, '#7a4a2a', 4, '#3a2414'); if (i.papers) for (let k = 0; k < 5; k++) rect(i.x + 16 + k * 26, i.y - 40 - (k % 2) * 4, 40, 26, '#f4f0e6', 1, '#a8a090'); },
  computer(i) {
    FURN.desk(i); for (const dx of [.12, .5]) { rect(i.x + i.w * dx, i.y - 116, i.w * .34, 72, '#111', 3, '#333'); rect(i.x + i.w * dx + 4, i.y - 112, i.w * .34 - 8, 64, `hsl(${(frameClock * 40 + dx * 200) % 360},45%,40%)`); }
    rect(i.x + i.w - 34, i.y - 80, 8, 46, '#333'); ellipse(i.x + i.w - 30, i.y - 84, 10, 14, '#222'); rect(i.x + 18, i.y - 18, i.w - 36, 4, `hsl(${frameClock * 90 % 360},80%,60%)`);
  },
  printer(i) { rect(i.x, i.y - 40, i.w, i.h + 40, '#c8c8c4', 6, '#7a7a76'); rect(i.x + 10, i.y - 48, i.w - 20, 10, '#f4f0e6'); },
  trophy(i) { rect(i.x, i.y - 90, i.w, i.h + 90, '#6a4024', 3, '#2a1a0e'); for (let k = 0; k < Math.floor(i.w / 34); k++) { const x = i.x + 20 + k * 34, gold = k % 3 === 1 ? '#c8c8c8' : '#d8b040'; rect(x - 8, i.y - 30, 16, 6, '#5a3a20'); poly([[x - 12, i.y - 70], [x + 12, i.y - 70], [x + 6, i.y - 46], [x - 6, i.y - 46]], gold); rect(x - 3, i.y - 46, 6, 16, gold); } },
  barrel(i) { ellipse(i.x + i.w / 2, i.y + i.h / 2 - 10, i.w / 2, i.h / 2 + 12, '#7a4a2a'); for (const dy of [-20, 4]) rect(i.x, i.y + i.h / 2 + dy, i.w, 5, '#4a4a44'); },
  chope(i) { FURN.barrel(i); rect(i.x + i.w / 2 - 3, i.y + i.h / 2 - 36, 6, 14, '#c8c8d0'); rect(i.x + i.w / 2 - 10, i.y + i.h / 2 - 40, 20, 6, '#8a8a90'); },
  salame(i) { rect(i.x, i.y - 110, 8, i.h + 110, '#5a3a20'); rect(i.x + i.w - 8, i.y - 110, 8, i.h + 110, '#5a3a20'); rect(i.x, i.y - 110, i.w, 8, '#5a3a20'); for (let k = 0; k < Math.floor(i.w / 24); k++) { const x = i.x + 16 + k * 24; rect(x, i.y - 102, 2, 14, '#e8d8b0'); rect(x - 7, i.y - 88, 16, 46, '#8a2a2a', 8); } },
  gaita(i) { rect(i.x + i.w / 2 - 3, i.y - 30, 6, 30, '#3a2a1a'); rect(i.x, i.y - 70, i.w, 46, '#a82a2a', 6, '#4a1010'); for (let k = 0; k < 5; k++) rect(i.x + 6 + k * (i.w - 12) / 5, i.y - 66, 3, 38, '#f0e8d0'); rect(i.x + i.w - 14, i.y - 66, 10, 38, '#1a1a1a', 2); },
  viola(i) { ellipse(i.x + i.w / 2, i.y - 10, i.w / 2, 24, '#a86a2a'); ellipse(i.x + i.w / 2, i.y - 40, i.w / 2 - 6, 18, '#a86a2a'); ellipse(i.x + i.w / 2, i.y - 18, 6, 6, '#3a2010'); rect(i.x + i.w / 2 - 3, i.y - 110, 6, 72, '#5a3a20'); },
  arreio(i) { rect(i.x + 10, i.y - 10, i.w - 20, 10, '#5a3a20'); rect(i.x + 14, i.y, 6, i.h, '#5a3a20'); rect(i.x + i.w - 20, i.y, 6, i.h, '#5a3a20'); ellipse(i.x + i.w / 2, i.y - 24, i.w / 2, 18, '#6a3a1a'); ellipse(i.x + i.w / 2, i.y - 32, i.w / 3, 10, '#8a4a24'); rect(i.x + i.w / 2 - 4, i.y - 14, 8, 30, '#c8a040'); },
  wood(i) { for (let k = 0; k < 6; k++) ellipse(i.x + 10 + (k % 2) * 20, i.y + i.h - 10 - Math.floor(k / 2) * 16, 11, 8, '#8a5a32'); },
  cooler(i) { rect(i.x, i.y - 30, i.w, i.h + 30, '#3a7ac8', 6, '#1a3a6a'); rect(i.x, i.y - 30, i.w, 12, '#f4f4f4', 6); },
  plant(i) { rect(i.x + 8, i.y, i.w - 16, i.h, '#a8603a', 4); for (let k = 0; k < 6; k++) ellipse(i.x + i.w / 2 + Math.cos(k) * 16, i.y - 16 - (k % 3) * 10, 14, 8, '#3f7a36'); },
  shoes(i) { for (const dx of [0, 26]) { rect(i.x + dx, i.y, 22, i.h, '#c8964a', 8, '#6a4a24'); rect(i.x + dx + 4, i.y + 4, 14, 10, '#8a2a2a', 4); } },
  bochas(i) { for (const [dx, dy, c] of [[10, 10, '#3a6ad0'], [34, 4, '#d03a3a'], [56, 14, '#3a6ad0'], [30, 22, '#f4f0e0']]) { ellipse(i.x + dx, i.y + dy, c === '#f4f0e0' ? 5 : 11, c === '#f4f0e0' ? 5 : 10, c); } },
  // Estante com a miniatura da camionete da Brigada Militar, com o giroflex piscando.
  miniatura(i) {
    rect(i.x, i.y - 50, i.w, i.h + 50, '#6a4024', 3, '#2a1a0e'); const x = i.x + 20, y = i.y - 46, w = i.w - 40;
    rect(x, y + 10, w * .55, 22, '#f0f0ec', 3, '#5a5a5a'); rect(x + w * .1, y + 2, w * .35, 14, '#f0f0ec', 3, '#5a5a5a'); rect(x + w * .14, y + 5, w * .26, 8, '#3a4a5a', 2);
    rect(x + w * .55, y + 16, w * .45, 16, '#f0f0ec', 3, '#5a5a5a'); rect(x, y + 20, w, 4, '#2a6a3a'); rect(x + w * .2, y - 2, 18, 5, frameClock % .6 < .3 ? '#e83a3a' : '#3a6ae8', 2);
    for (const wx of [x + w * .2, x + w * .8]) ellipse(wx, y + 32, 7, 7, '#1a1a1a');
  },
  // Sonzão: duas caixas de som com os alto-falantes pulsando e as luzinhas.
  som(i) {
    const beat = 1 + .08 * Math.abs(Math.sin(frameClock * 8));
    for (const dx of [0, i.w / 2 + 2]) { const x = i.x + dx, w = i.w / 2 - 2; rect(x, i.y - 70, w, i.h + 70, '#1a1a1a', 4, '#3a3a3a'); ellipse(x + w / 2, i.y - 40, 16 * beat, 16 * beat, '#3a3a3a'); ellipse(x + w / 2, i.y - 40, 7, 7, '#5a5a5a'); ellipse(x + w / 2, i.y + 4, 9 * beat, 9 * beat, '#3a3a3a'); }
    for (let k = 0; k < 6; k++) rect(i.x + 8 + k * (i.w - 16) / 6, i.y - 80, 6, 6, `hsl(${(frameClock * 120 + k * 60) % 360},90%,60%)`, 2);
  },
  pillar(i) { rect(i.x, i.y - 200, i.w, i.h + 200, '#d8d0c0', 0, '#8a8070'); },
  grill(i) { rect(i.x, i.y - 60, i.w, i.h + 60, '#b5623a', 4, '#6a3a20'); for (let y = i.y - 54; y < i.y + i.h; y += 12) rect(i.x + 2, y, i.w - 4, 1, 'rgba(90,40,20,.4)'); rect(i.x + 16, i.y - 40, i.w - 32, 24, '#2a2a2a', 3); for (let k = 0; k < 4; k++) rect(i.x + 22 + k * (i.w - 44) / 4, i.y - 36, (i.w - 44) / 4 - 6, 16, '#8a2a1a', 4); rect(i.x + i.w / 2 - 22, i.y - 190, 44, 130, '#a85a3a', 0, '#6a3a20'); },
  stairs(i) { for (let k = 0; k < 10; k++) { const y = i.y + k * i.h / 10; rect(i.x, y, i.w, i.h / 10 - 2, k % 2 ? '#8a5a32' : '#9a6a3a', 2); } rect(i.x - 6, i.y, 6, i.h, '#5a3a20'); },
  pew(i) { rect(i.x, i.y - 30, i.w, 14, '#6a4024', 3, '#3a2414'); rect(i.x, i.y - 6, i.w, i.h, '#8a5a32', 4, '#3a2414'); },
  altarStep(i) { rect(i.x, i.y, i.w, i.h, '#c8bfae', 0, '#8a8070'); rect(i.x, i.y + i.h - 10, i.w, 10, '#a8a090'); },
  altar(i) { rect(i.x, i.y - 30, i.w, i.h + 30, '#f4f2ee', 4, '#b8b0a0'); rect(i.x + i.w / 2 - 30, i.y - 30, 60, i.h + 30, '#c8a040'); for (const dx of [16, i.w - 22]) { rect(i.x + dx, i.y - 64, 6, 34, '#f4f0e0'); ellipse(i.x + dx + 3, i.y - 70, 4, 7, '#ffcc44'); } },
  saint(i) { rect(i.x, i.y - 20, i.w, i.h + 20, '#c8bfae', 3, '#8a8070'); rect(i.x + i.w / 2 - 12, i.y - 90, 24, 70, i.color || '#4a6a9a', 8); ellipse(i.x + i.w / 2, i.y - 100, 11, 12, '#f0d8b8'); ctx.strokeStyle = '#d8b040'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(i.x + i.w / 2, i.y - 104, 15, 15, 0, 0, Math.PI * 2); ctx.stroke(); },
  stage(i) { worldTexture(3,i.x,i.y,i.w,i.h,160); for (let x = i.x + 30; x < i.x + i.w; x += 30) rect(x, i.y, 2, i.h, '#5a3420'); rect(i.x, i.y + i.h - 14, i.w, 14, '#5a3420'); },
  longtable(i) { rect(i.x, i.y - 16, i.w, i.h, '#f4f0e6', 4, '#c8bfae'); for (let x = i.x + 20; x < i.x + i.w - 10; x += 56) { rect(x, i.y - 40, 26, 22, '#6a4024', 4); rect(x, i.y + i.h - 14, 26, 22, '#6a4024', 4); ellipse(x + 13, i.y - 4, 10, 6, '#e8e4dc'); } },
  bar(i) { rect(i.x, i.y - 30, i.w, i.h + 30, '#6a4024', 4, '#2a1a0e'); rect(i.x, i.y - 30, i.w, 12, '#8a5a32'); for (let k = 0; k < Math.floor(i.h / 30); k++) { rect(i.x + 10, i.y + k * 30 - 10, 10, 22, ['#3a6a3a', '#8a2a2a', '#c8a040'][k % 3], 3); } },
  // Na parede do fundo (wall: true): bandeiras, quadros, cruz, vitrais e varas de pesca.
  flag(i) {
    rect(i.x - 4, i.y - 4, 4, i.h + 30, '#5a4a3a');
    if (i.ulster) {   // Ulster Banner: cruz vermelha, estrela de seis pontas com a mão vermelha e a coroa
      const cx = i.x + i.w / 2, cy = i.y + i.h / 2; rect(i.x, i.y, i.w, i.h, '#f4f4f0'); rect(cx - i.w * .09, i.y, i.w * .18, i.h, '#c8202a'); rect(i.x, cy - i.h * .13, i.w, i.h * .26, '#c8202a');
      const r = i.h * .26; poly([[cx, cy - r], [cx + r * .87, cy + r * .5], [cx - r * .87, cy + r * .5]], '#f4f4f0'); poly([[cx, cy + r], [cx + r * .87, cy - r * .5], [cx - r * .87, cy - r * .5]], '#f4f4f0');
      rect(cx - 5, cy - 3, 10, 10, '#c8202a', 2); for (let k = 0; k < 4; k++) rect(cx - 5 + k * 2.6, cy - 9, 2, 7, '#c8202a'); rect(cx + 5, cy, 3, 5, '#c8202a');
      rect(cx - 7, cy - r - 9, 14, 6, '#e8b020', 1); for (const dx of [-6, -1, 4]) rect(cx + dx, cy - r - 13, 3, 5, '#e8b020'); return;
    }
    if (i.rs) { const fw = i.w, fh = i.h, d = fh * .23; poly([[i.x, i.y], [i.x + fw * (1 - d / fh), i.y], [i.x, i.y + fh - d]], '#2a8a3a'); poly([[i.x, i.y + fh - d], [i.x + fw * (1 - d / fh), i.y], [i.x + fw, i.y], [i.x + fw, i.y + d], [i.x + fw * d / fh, i.y + fh], [i.x, i.y + fh]], '#d42a2a'); poly([[i.x + fw * d / fh, i.y + fh], [i.x + fw, i.y + d], [i.x + fw, i.y + fh]], '#f0d020'); return; }
    const c = i.colors, n = c.length; for (let k = 0; k < n; k++) i.vertical ? rect(i.x + k * i.w / n, i.y, i.w / n + 1, i.h, c[k]) : rect(i.x, i.y + k * i.h / n, i.w, i.h / n + 1, c[k]);
    if (i.sun) ellipse(i.x + 14, i.y + 14, 9, 9, '#f0c020');
  },
  poster(i) { rect(i.x, i.y, i.w, i.h, i.color || '#f4ecd8', 3, '#5a3a20'); txt(i.text2 || '', i.x + i.w / 2, i.y + i.h / 2, 11, '#3a2010', 'center', 'Georgia'); },
  cross(i) { rect(i.x + i.w / 2 - 5, i.y, 10, i.h, '#6a4024'); rect(i.x, i.y + i.h * .25, i.w, 10, '#6a4024'); },
  stained(i) { ctx.fillStyle = '#3a2a1a'; ctx.beginPath(); ctx.moveTo(i.x, i.y + i.h); ctx.lineTo(i.x, i.y + i.w / 2); ctx.arc(i.x + i.w / 2, i.y + i.w / 2, i.w / 2, Math.PI, 0); ctx.lineTo(i.x + i.w, i.y + i.h); ctx.closePath(); ctx.fill(); const cs = ['#c83a3a', '#3a6ac8', '#e8c040', '#3a9a5a']; for (let k = 0; k < 8; k++) rect(i.x + 4 + (k % 2) * (i.w / 2 - 4), i.y + i.w / 2 + Math.floor(k / 2) * (i.h - i.w / 2) / 4, i.w / 2 - 6, (i.h - i.w / 2) / 4 - 3, cs[k % 4]); },
  rose(i) { ellipse(i.x + i.w / 2, i.y + i.h / 2, i.w / 2, i.h / 2, '#3a2a1a'); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ellipse(i.x + i.w / 2 + Math.cos(a) * i.w * .28, i.y + i.h / 2 + Math.sin(a) * i.h * .28, 7, 7, ['#c83a3a', '#3a6ac8', '#e8c040', '#3a9a5a'][k % 4]); } ellipse(i.x + i.w / 2, i.y + i.h / 2, 8, 8, '#f0e0a0'); },
  rods(i) { ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 4; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(i.x + k * 30, i.y + i.h); ctx.lineTo(i.x + 60 + k * 30, i.y); ctx.stroke(); } ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(i.x + 60 + k * 30, i.y); ctx.lineTo(i.x + 66 + k * 30, i.y + 30); ctx.stroke(); } },
  window(i) { windowPane(i.x, i.y, i.w, i.h); }
};

// Cuia de chimarrão na mão, com a bomba.
function drawCuia(x, y) { ellipse(x, y + 4, 11, 13, '#6a8a3a'); ellipse(x, y - 2, 9, 4, '#3f5a24'); rect(x - 7, y + 10, 14, 4, '#c8a040', 2); ctx.strokeStyle = '#c8c8c8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 8, y - 18); ctx.stroke(); }

// ---------- Mapa de interior ----------
function interiorMap(def) {
  const b = def.bounds, door = def.door ?? b.x + b.w / 2, half = def.doorHalf ?? 44;
  const walls = (def.walls || []).map(([x, y, w, h]) => ({ x, y, w, h }));
  const solids = [...walls, ...(def.items || []).filter(i => !i.wall && i.solid !== false)];
  return {
    indoor: true, ...def,
    spawn() { return { x: door, y: b.y + b.h - 24 }; },
    canWalk(x, y) {
      if (x < b.x + 14 || x > b.x + b.w - 14 || y < b.y + 12) return false;
      if (y > b.y + b.h - 6 && (Math.abs(x - door) > half || y > b.y + b.h + 44)) return false;
      return !hitRect(solids, x, y);
    },
    edge(p) {
      for (const s of def.stairs || []) if (p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h) return s.to();
      if (p.y > b.y + b.h + 26) return def.exit ? def.exit() : { ...worldOut.back, title: '' };
      return null;
    },
    spots() {
      const people = (def.residents || []).filter(atHome).map((id, k) => { const i = PEOPLE.findIndex(p => p.id === id), [x, y] = def.homeSpots[k]; return { id: 'home:' + id, x, y, label: ['deliver', 'waiting'].includes(questMarker(id)) ? 'Falar com ' + PEOPLE[i].name + ' sobre o pedido' : 'Prosear com ' + PEOPLE[i].name, act: () => houseResidentTalk(i, x, y) }; });
      const things = (def.items || []).filter(i => i.text || i.act).map(i => ({ id: 'item:' + i.kind + i.x, x: i.x + i.w / 2, y: i.spotY ?? i.y + i.h + 22, label: i.label, act: i.act || (() => i.info ? showInfo(i.label, i.text) : showItem(i.label, i.text, def.residents?.[0])) }));
      return [...people, ...things];
    },
    // Ao entrar num cômodo com fala, ela dispara uma vez por visita.
    tick(p) { for (const r of def.rooms || []) if (r.enter && p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h) { worldOut.fired ??= {}; if (!worldOut.fired[r.name]) { worldOut.fired[r.name] = true; r.enter(); } } },
    draw(view, seen, layers) {
      rect(view.x, view.y, view.w, view.h, def.bg || '#1a120c');
      drawFloor(b, def.floor); for (const r of def.rooms || []) if (r.floor) drawFloor(r, r.floor);
      // parede do fundo, janelas e o que está pendurado nela
      if (def.open) { rect(b.x - 20, b.y - 120, b.w + 40, 120, '#4a3a2a'); for (let x = b.x; x < b.x + b.w; x += 90) rect(x, b.y - 120, 14, 120, '#3a2a1e'); }
      else { rect(b.x - 20, b.y - 120, b.w + 40, 120, def.wallColor || '#c8a878'); rect(b.x - 20, b.y - 18, b.w + 40, 18, '#5a3a22'); rect(b.x - 20, b.y - 124, b.w + 40, 8, '#3a2414'); }
      if (!def.open) worldWall(b.x - 20, b.y - 120, b.w + 40, 102);
      for (const x of def.windows || []) windowPane(x, b.y - 100, 70, 56);
      def.decor?.(b);
      for (const i of def.items || []) if (i.wall) FURN[i.kind](i);
      if (!def.open) { rect(b.x - 20, b.y - 124, 20, b.h + 150, '#3a2414'); rect(b.x + b.w, b.y - 124, 20, b.h + 150, '#3a2414'); }
      for (const w of walls) layers.push({ y: w.y + w.h, draw: () => { if (w.w > w.h) { worldWall(w.x, w.y - 56, w.w, 56); rect(w.x, w.y - 60, w.w, 6, '#3a2414'); rect(w.x, w.y, w.w, w.h, '#5a3a22'); } else rect(w.x, w.y - 60, w.w, w.h + 60, '#3a2414'); } });
      for (const i of def.items || []) if (!i.wall) layers.push({ y: i.layerY ?? (i.flat ? i.y - 400 : i.y + i.h), draw: () => FURN[i.kind](i) });
      if (def.keeper) drawKeeper(def, layers);
      (def.residents || []).filter(atHome).forEach((id, k) => { const i = PEOPLE.findIndex(p => p.id === id), [x, y] = def.homeSpots[k], dir = k % 2 ? -1 : 1; layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y, false, false, dir) }); });
      if (!def.open) layers.push({ y: b.y + b.h + 60, draw: () => { rect(b.x - 20, b.y + b.h, door - half - (b.x - 20), 26, '#3a2414'); rect(door + half, b.y + b.h, b.x + b.w + 20 - door - half, 26, '#3a2414'); rect(door - half, b.y + b.h + 16, half * 2, 10, '#6a4424', 3); } });
    }
  };
}

// ---------- Casas ----------
// Casa comum: quarto e cozinha nos fundos, sala na frente.
function casaPadrao(o) {
  return interiorMap({
    id: o.id, name: o.name, W: 1200, H: 900, bounds: { x: 100, y: 220, w: 1000, h: 560 }, door: 600, floor: o.floor || 'wood', wallColor: o.wallColor || '#c8a878',
    walls: [[100, 440, 200, 20], [380, 440, 440, 20], [900, 440, 200, 20], [590, 220, 20, 220]],
    rooms: [{ name: 'quarto', x: 100, y: 220, w: 490, h: 220, floor: o.floorQ || o.floor || 'wood' }, { name: 'cozinha', x: 610, y: 220, w: 490, h: 220, floor: o.floorC || 'tile' }],
    windows: o.windows || [180, 870],
    items: [
      { kind: o.bed || 'bed', x: 130, y: 250, w: 170, h: 150, color: o.bedColor },
      { kind: 'wardrobe', x: 470, y: 250, w: 100, h: 50 },
      { kind: 'stove', x: 640, y: 260, w: 110, h: 60 },
      { kind: 'counter', x: 770, y: 260, w: 190, h: 50, sink: true },
      { kind: 'fridge', x: 990, y: 260, w: 80, h: 50, refri: o.refri, label: o.refri ? 'Geladeira de refri' : undefined, text: o.refri ? 'Geladeira cheia de refri: estoque oficial da revoada dos cupinxa.' : undefined },
      { kind: 'table', x: 650, y: 360, w: 120, h: 44 },
      { kind: 'rug', x: 420, y: 540, w: 360, h: 150, solid: false, color: o.rug, flat: true },
      ...(o.items || [])
    ],
    residents: o.residents, homeSpots: o.homeSpots || [[640, 620], [740, 620]], cuia: o.cuia
  });
}
// Rancho: um cômodo só, chão batido, fogão a lenha e o catre.
function rancho(o) {
  return interiorMap({
    id: o.id, name: o.name, W: 1200, H: 860, bounds: { x: 150, y: 240, w: 900, h: 500 }, door: 600, floor: o.floor || 'dirt', wallColor: o.wallColor || '#b89868', windows: [260, 860],
    items: [{ kind: 'bed', x: 180, y: 270, w: 160, h: 140, color: o.bedColor || '#6a7a3a' }, { kind: 'stove', x: 880, y: 280, w: 110, h: 60 }, { kind: 'table', x: 520, y: 340, w: 160, h: 50, mate: true }, { kind: 'wood', x: 1000, y: 400, w: 40, h: 60 }, ...(o.items || [])],
    residents: o.residents, homeSpots: [[600, 560]], cuia: o.cuia
  });
}
const HOUSE_INTERIORS = [
  // Fronteira
  casaPadrao({ id: 'casa:valter', name: 'Casa de Valter', residents: ['valter'], cuia: true, rug: '#7a3a2a', items: [
    { kind: 'sofa', x: 140, y: 660, w: 220, h: 60, color: '#6a3a2a' }, { kind: 'tv', x: 860, y: 520, w: 200, h: 40, label: 'TV de tubo', text: 'A TV de tubo do Valter: só pega o canal do Inter e a previsão do tempo.' },
    { kind: 'flag', wall: true, x: 400, y: 130, w: 90, h: 58, colors: ['#d42a2a', '#f4f4f4', '#d42a2a'] }, { kind: 'plant', x: 1040, y: 700, w: 44, h: 40 }] }),
  casaPadrao({ id: 'casa:manolima', name: 'Casa de Mano Lima', residents: ['manolima'], cuia: true, items: [
    { kind: 'table', x: 830, y: 560, w: 170, h: 60, cards: true, label: 'Mesa de truco', text: 'A mesa de truco do Mano Lima: baralho espanhol gasto de tanta partida.' },
    { kind: 'gaita', x: 170, y: 540, w: 70, h: 30, label: 'Gaita', text: 'A gaita do Mano Lima: oito baixos, afinada pra vanera e pra milonga.' },
    { kind: 'sofa', x: 160, y: 680, w: 220, h: 60, color: '#4a5a3a' }, { kind: 'flag', wall: true, x: 400, y: 128, w: 96, h: 62, rs: true }] }),
  rancho({ id: 'casa:baitaca', name: 'Rancho de Baitaca', residents: ['baitaca'], cuia: true, items: [
    { kind: 'viola', x: 290, y: 560, w: 50, h: 30, label: 'Viola', text: 'A viola do Baitaca: companheira dos bailes e das madrugadas de rancho.' },
    { kind: 'arreio', x: 860, y: 560, w: 100, h: 50 }, { kind: 'flag', wall: true, x: 540, y: 140, w: 96, h: 62, rs: true }] }),
  casaPadrao({ id: 'casa:guri', name: 'Casa de Guri', residents: ['guri'], cuia: true, rug: '#3a5a7a', items: [
    { kind: 'table', x: 840, y: 560, w: 150, h: 60, mate: true, label: 'Mate de fronteira', text: 'Erva comprada do lado de lá da fronteira: mais forte e mais barata, jura o Guri.' },
    { kind: 'sofa', x: 150, y: 660, w: 220, h: 60, color: '#3a5a7a' },
    { kind: 'flag', wall: true, x: 340, y: 128, w: 96, h: 62, colors: ['#f4f4f4', '#3a6ac8', '#f4f4f4', '#3a6ac8', '#f4f4f4'], sun: true }, { kind: 'flag', wall: true, x: 460, y: 128, w: 96, h: 62, rs: true }] }),
  // Serra
  casaPadrao({ id: 'casa:badin', name: 'Casa de pedra de Badin', residents: ['badin'], floor: 'stone', wallColor: '#a8a298', items: [
    { kind: 'salame', x: 830, y: 540, w: 190, h: 40, label: 'Despensa da colônia · salame e muda de uva', act: () => G.badinShop ? storeShop('badin') : showItem('Salames da colônia', 'Salame colonial pendurado pra curar: receita do nono, com pimenta e alho. A nona só vende pra quem é de confiança: faça as missões do Badin.', 'badin') },
    { kind: 'barrel', x: 160, y: 560, w: 60, h: 60 }, { kind: 'barrel', x: 230, y: 560, w: 60, h: 60 }, { kind: 'table', x: 200, y: 690, w: 160, h: 50 },
    { kind: 'flag', wall: true, x: 400, y: 128, w: 96, h: 62, colors: ['#2a8a3a', '#f4f4f4', '#d42a2a'], vertical: true }] }),
  casaPadrao({ id: 'casa:mitodosul', name: 'Casa de Mito do Sul', residents: ['mitodosul'], rug: '#2a4a8a', items: [
    { kind: 'computer', x: 810, y: 540, w: 250, h: 50, label: 'Setup de live', text: 'O setup do Mito do Sul: dois monitores, microfone e Farming Simulator aberto.' },
    { kind: 'sofa', x: 150, y: 660, w: 220, h: 60, color: '#2a4a8a' }, { kind: 'flag', wall: true, x: 400, y: 128, w: 96, h: 62, colors: ['#2a6ac8', '#1a1a1a', '#f4f4f4', '#2a6ac8'], vertical: true }] }),
  casaPadrao({ id: 'casa:dianho', name: 'Casa de Dianho', residents: ['dianho'], refri: true, items: [
    { kind: 'sofa', x: 150, y: 660, w: 220, h: 60, color: '#2a2a2a' }, { kind: 'table', x: 840, y: 580, w: 150, h: 50 },
    { kind: 'poster', wall: true, x: 268, y: 124, w: 118, h: 70, text2: 'GÂNGSTER DE GALPÃO', color: '#e8d8b0' },
    { kind: 'flag', wall: true, x: 400, y: 122, w: 104, h: 66, ulster: true, spotY: 330, label: 'Bandeira da Irlanda do Norte', text: 'A bandeira da Irlanda do Norte: o Dianho jura que é ídolo por lá. Lá eles não sabem quem ele é, mas ele sabe que é ídolo, hehehe.' }] }),
  // Santa Catarina
  casaPadrao({ id: 'casa:lauro', name: 'Casa de Lauro', residents: ['lauro'], items: [
    { kind: 'trophy', x: 830, y: 540, w: 220, h: 40, label: 'Troféus de bocha', text: 'Os troféus do Lauro Bolador: campeão de Indaial, vice de Pomerode e “melhor mira” da festa da igreja.' },
    { kind: 'bochas', x: 200, y: 560, w: 70, h: 30, solid: false, flat: true }, { kind: 'sofa', x: 150, y: 670, w: 220, h: 60, color: '#6a5a3a' }] }),
  casaPadrao({ id: 'casa:indavirus', name: 'Casa de Indavírus', residents: ['indavirus'], items: [
    { kind: 'desk', x: 800, y: 540, w: 220, h: 50, papers: true, label: 'Redação do Jornal Indavírus', text: 'A redação do Jornal Indavírus: pilhas de manchete, café frio e muita fofoca de Indaial.' },
    { kind: 'printer', x: 1040, y: 560, w: 50, h: 40 }, { kind: 'sofa', x: 150, y: 660, w: 220, h: 60, color: '#5a4a6a' }] }),
  casaPadrao({ id: 'casa:peixinhonabrasa', name: 'Casa de Peixinho na Brasa', residents: ['peixinhonabrasa'], items: [
    { kind: 'rods', wall: true, x: 380, y: 112, w: 150, h: 90 }, { kind: 'cooler', x: 870, y: 580, w: 90, h: 50, label: 'Caixa térmica', text: 'Caixa térmica do Peixinho: gelo, Kaiser e a isca do dia.' },
    { kind: 'sofa', x: 150, y: 660, w: 220, h: 60, color: '#3a6a6a' }] }),
  casaPadrao({ id: 'casa:loligebien', name: 'Casa de Loli Gebien', residents: ['loligebien'], wallColor: '#f4f0e6', items: [
    { kind: 'chope', x: 870, y: 560, w: 80, h: 60, label: 'Barril de chope', text: 'O barril do Loli: chope gelado é coisa séria em Pomerode.' },
    { kind: 'shoes', x: 180, y: 700, w: 50, h: 30, solid: false, flat: true }, { kind: 'table', x: 180, y: 560, w: 150, h: 50 },
    { kind: 'flag', wall: true, x: 400, y: 128, w: 96, h: 62, colors: ['#1a1a1a', '#d42a2a', '#f0c020'] }] }),
  // Fronteira: o pajador
  casaPadrao({ id: 'casa:jayme', name: 'Casa de Jayme Caetano Braun', residents: ['jayme'], cuia: true, items: [
    { kind: 'shelf', x: 840, y: 540, w: 200, h: 40, label: 'Livros', text: 'A estante do Jayme: livros de payada, história do Rio Grande e cadernos de verso.' },
    { kind: 'desk', x: 160, y: 560, w: 200, h: 50, papers: true, label: 'Versos do pajador', text: 'Folhas e mais folhas de versos: o Jayme escreve sobre o pampa, o cavalo e o chimarrão.' },
    { kind: 'viola', x: 420, y: 700, w: 50, h: 30 }] })
];
for (const M of HOUSE_INTERIORS) WORLD_MAPS[M.id] = M;

// ---------- Casona dos gêmeos ----------
// Embaixo é vazio, só a churrasqueira; sobe-se pela escada lateral e entra-se pela sala.
const CASONA_LINES = {
  porta: 'Portonzon top, né? Show de bola!',
  banheiro: 'Olha aí o banheirão podre de chique do Márcio e Marcelo, e o quê? Show de bola, marmorezão top!',
  cama: 'Cama bauzona top, né? E o quê? Duvido acharem em Erechim uma cama bauzona top dessas, show de bola!'
};
// Objeto da casa: aparece na caixa de diálogo com o retrato do dono.
function showItem(label, text, owner) { const i = PEOPLE.findIndex(p => p.id === owner); if (i < 0) { showInfo(label, text); return; } worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: label, reply: text }); AudioEngine.tick(); }
function twinSay(id, text) { const i = PEOPLE.findIndex(p => p.id === id); if (i < 0) return; worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: PEOPLE[i].name, reply: text }); AudioEngine.tick(); }
function anyTwin() { return pick(['marcio', 'marcelo']); }
WORLD_MAPS.casonaTerreo = interiorMap({
  id: 'casonaTerreo', name: 'Casona · embaixo', W: 1400, H: 820, bounds: { x: 150, y: 270, w: 1100, h: 460 }, door: 600, doorHalf: 520, floor: 'concrete', bg: '#6f9a45', open: true,
  items: [
    { kind: 'pillar', x: 170, y: 300, w: 28, h: 26 }, { kind: 'pillar', x: 660, y: 300, w: 28, h: 26 }, { kind: 'pillar', x: 170, y: 690, w: 28, h: 26 }, { kind: 'pillar', x: 660, y: 690, w: 28, h: 26 },
    { kind: 'grill', x: 240, y: 300, w: 170, h: 50, label: 'Churrasqueira', text: 'A churrasqueira da Casona: domingo é dia de assado antes do racha.' },
    { kind: 'table', x: 430, y: 480, w: 170, h: 60 }, { kind: 'cooler', x: 820, y: 520, w: 90, h: 50 },
    { kind: 'stairs', x: 1100, y: 290, w: 120, h: 400, solid: false, flat: true }
  ],
  // Subindo a escada até o topo, entra na sala da Casona.
  stairs: [{ x: 1100, y: 270, w: 120, h: 60, to: () => ({ map: 'casona', x: 700, y: 836, title: 'Casona de Márcio e Marcelo' }) }]
});
// Em cima: três portas no corredor de cima (quarto, banheiro, quarto) e, embaixo, sala e cozinha juntas.
// Entra-se pela porta do meio, vindo da escada lateral.
WORLD_MAPS.casona = interiorMap({
  id: 'casa:marcio', name: 'Casona de Márcio e Marcelo', W: 1400, H: 1000, bounds: { x: 100, y: 240, w: 1200, h: 620 }, door: 700, floor: 'wood', wallColor: '#e8d8b0', windows: [160, 760, 1170],
  walls: [[100, 520, 160, 20], [340, 520, 320, 20], [740, 520, 320, 20], [1140, 520, 160, 20], [500, 240, 20, 280], [880, 240, 20, 280]],
  rooms: [
    { name: 'quarto1', x: 100, y: 240, w: 400, h: 280, floor: 'wood', enter: () => { if (atHome('marcio')) twinSay(anyTwin(), CASONA_LINES.cama); } },
    { name: 'banheiro', x: 520, y: 240, w: 360, h: 280, floor: 'marble', enter: () => { if (atHome('marcio')) twinSay('marcio', CASONA_LINES.banheiro); } },
    { name: 'quarto2', x: 900, y: 240, w: 400, h: 280, floor: 'wood', enter: () => { if (atHome('marcio')) twinSay(anyTwin(), CASONA_LINES.cama); } },
    { name: 'cozinha', x: 100, y: 540, w: 420, h: 320, floor: 'tile' }
  ],
  items: [
    { kind: 'bedbau', x: 115, y: 270, w: 140, h: 200, color: '#2a6a3a', label: 'Cama baú do Márcio', text: 'Cama baú de casal, com gavetão embaixo: o orgulho do quarto.' },
    { kind: 'wardrobe', x: 410, y: 280, w: 70, h: 44 },
    { kind: 'bathtub', x: 540, y: 280, w: 200, h: 90 }, { kind: 'toilet', x: 800, y: 300, w: 50, h: 50 }, { kind: 'sinkbath', x: 790, y: 440, w: 70, h: 40 },
    { kind: 'bedbau', x: 1145, y: 270, w: 140, h: 200, color: '#2a4a8a', label: 'Cama baú do Marcelo', text: 'A outra cama baú: igualzinha, porque gêmeo não aceita cama menor que a do irmão.' },
    { kind: 'wardrobe', x: 920, y: 280, w: 70, h: 44 },
    { kind: 'stove', x: 120, y: 590, w: 110, h: 50, noPipe: true }, { kind: 'counter', x: 240, y: 590, w: 170, h: 50, sink: true }, { kind: 'fridge', x: 425, y: 590, w: 70, h: 50, refri: true },
    { kind: 'table', x: 190, y: 740, w: 170, h: 60 },
    { kind: 'tv', x: 900, y: 590, w: 200, h: 40 }, { kind: 'rug', x: 860, y: 650, w: 300, h: 120, flat: true, color: '#2a6a3a' }, { kind: 'sofa', x: 880, y: 790, w: 260, h: 50, color: '#2a6a3a' },
    { kind: 'miniatura', x: 1150, y: 590, w: 140, h: 40, label: 'Miniatura da camionete da Brigada', text: 'Miniatura da camionete da Brigada: réplica caprichada, com giroflex e tudo.' },
    { kind: 'som', x: 1180, y: 770, w: 100, h: 60, label: 'Sonzão da Casona', text: 'Sonzão da Casona.' }
  ],
  residents: ['marcio', 'marcelo'], homeSpots: [[960, 680], [1060, 680]],
  // Na primeira vez que entra, um dos gêmeos mostra a porta.
  onEnter() { if (atHome('marcio') && !G.casonaSeen) { G.casonaSeen = true; twinSay(anyTwin(), CASONA_LINES.porta); save(); } }
});

// A Casona agora é só o andar de cima: a porta da rua entra direto na sala.
WORLD_MAPS['casa:marcio'] = WORLD_MAPS.casona; delete WORLD_MAPS.casonaTerreo;

// ---------- Igreja e salão da comunidade ----------
// Igreja: nave comprida com o corredor ao meio, bancos dos dois lados e o altar no fundo.
WORLD_MAPS.igreja = interiorMap({
  id: 'igreja', name: 'Igreja da comunidade', W: 1200, H: 1260, bounds: { x: 300, y: 320, w: 600, h: 860 }, door: 600, floor: 'stone', wallColor: '#f2ede0', bg: '#2a2018',
  rooms: [{ name: 'corredor', x: 555, y: 470, w: 90, h: 710, floor: 'carpet' }],
  decor(b) { ctx.fillStyle = '#f2ede0'; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2, b.y - 120, b.w / 2 + 20, 70, 0, Math.PI, 0); ctx.fill(); },
  items: [
    { kind: 'altarStep', x: 300, y: 320, w: 600, h: 120, solid: false, flat: true },
    { kind: 'altar', x: 520, y: 340, w: 160, h: 50, label: 'Altar', info: true, text: 'Igrejas das colônias: as próprias famílias erguiam a igreja, e em volta dela nasciam a escola, o salão e o cemitério da comunidade.' },
    { kind: 'saint', x: 360, y: 350, w: 50, h: 40, color: '#4a6a9a' }, { kind: 'saint', x: 790, y: 350, w: 50, h: 40, color: '#8a3a3a' },
    { kind: 'cross', wall: true, x: 575, y: 214, w: 50, h: 90 }, { kind: 'rose', wall: true, x: 570, y: 140, w: 60, h: 60 },
    { kind: 'stained', wall: true, x: 360, y: 214, w: 50, h: 90 }, { kind: 'stained', wall: true, x: 790, y: 214, w: 50, h: 90 },
    ...[520, 615, 710, 805, 900, 995].flatMap(y => [{ kind: 'pew', x: 330, y, w: 210, h: 36 }, { kind: 'pew', x: 660, y, w: 210, h: 36 }])
  ]
});
// Placa de salão: desenhada aqui mesmo (a placa do mapa só aparece como dica de proximidade).
function hallSign(x, y, w, text, bg = '#3a2414', fg = '#ffe9b0') { rect(x - w / 2, y, w, 30, bg, 6, '#e8cc8a'); txt(text, x, y + 15, 14, fg, 'center', 'Georgia', false); }
// Parreira na parede: ramo de folhas com cachos de uva.
function vineGarland(x0, x1, y) { ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = x0; x <= x1; x += 20) ctx.lineTo(x, y + Math.sin(x / 40) * 6); ctx.stroke(); for (let x = x0 + 10; x < x1; x += 46) { ellipse(x, y + Math.sin(x / 40) * 6 - 6, 9, 6, '#4a8a3a'); if (x % 92 < 46) for (const [dx, dy] of [[-4, 6], [4, 6], [0, 12], [-4, 18], [4, 18], [0, 24]]) ellipse(x + dx + 10, y + dy + 4, 3.5, 3.5, '#6a2a7a'); } }
// Salão: o maior de todos, com palco do baile, mesas compridas e o bar. Na Serra, com jeito de festa italiana da colônia.
const SALAO_ITEMS = [
    { kind: 'stage', x: 650, y: 300, w: 600, h: 130, label: 'Palco do baile', info: true, text: 'Salão de comunidade: no interior gaúcho é o coração da vila. Ali acontecem os bailes, as quermesses, os casamentos e o jantar de galeto com cuca.' },
    { kind: 'gaita', x: 760, y: 360, w: 70, h: 30, solid: false, layerY: 431 }, { kind: 'viola', x: 1080, y: 380, w: 50, h: 30, solid: false, layerY: 431 },
    ...[520, 680, 840].flatMap(y => [{ kind: 'longtable', x: 260, y, w: 360, h: 46 }, { kind: 'longtable', x: 1260, y, w: 340, h: 46 }]),
    { kind: 'bar', x: 1640, y: 460, w: 90, h: 240, label: 'Copa do salão', text: 'A copa do salão: refri, cerveja e a cuca que as senhoras da comunidade assam de madrugada.' },
    { kind: 'barrel', x: 1660, y: 760, w: 60, h: 60 }
];
WORLD_MAPS.salao = interiorMap({
  id: 'salao', name: 'Salão da comunidade', W: 1900, H: 1160, bounds: { x: 150, y: 300, w: 1600, h: 760 }, door: 950, floor: 'wood', wallColor: '#e8d8b8', windows: [260, 460, 1370, 1570],
  decor(b) {
    pennants(b.x + 20, b.x + b.w - 20, b.y - 112, ['#2a8a3a', '#f4f2ea', '#d42a2a']); vineGarland(b.x + 20, b.x + b.w - 20, b.y - 82);
    hallSign(b.x + b.w / 2, b.y - 60, 440, 'FESTA DELLA COMUNITÀ · VINO, POLENTA E BALLO', '#2a4a2a');
  },
  items: [...SALAO_ITEMS,
    { kind: 'barrel', x: 175, y: 330, w: 60, h: 60, label: 'Pipas de vinho', text: 'Vinho colonial da Serra, feito na cantina da família: uva isabel e bordô, pisada e guardada na pipa de madeira.' },
    { kind: 'barrel', x: 245, y: 345, w: 60, h: 60 }, { kind: 'stove', x: 1430, y: 340, w: 110, h: 40, label: 'Tacho de polenta', text: 'Polenta mexida no tacho de cobre com a pá de madeira, como fazia a nona: cortada com linha e servida com galeto e queijo.' }
  ]
});

// ---------- Lojas da Fronteira ----------
// Armazém Querência (produtos para agricultura) e Casa do Campeiro (produtos para pecuária): prateleiras e o caixa.
// No balcão, a compra sai na hora (sem esperar a entrega) e um pouco mais barata que pelo celular.
const STORE_DISCOUNT = .9;
Object.assign(FURN, {
  // Prateleira de loja, com a mercadoria de cada uma.
  storeShelf(i) {
    rect(i.x, i.y - 130, i.w, i.h + 130, '#7a4a2a', 3, '#2a1a0e');
    for (let k = 0; k < 4; k++) {
      const y = i.y - 122 + k * 34; rect(i.x + 4, y + 28, i.w - 8, 5, '#4a2a14');
      for (let x = i.x + 10; x < i.x + i.w - 18; x += 22) {
        const n = (x / 22 + k) % 4 | 0;
        if (i.goods === 'agro') { if (n === 0) rect(x, y + 8, 14, 20, ['#e8c040', '#5aa040', '#c85a3a', '#7a9ad8'][k], 2, '#5a4a2a'); else if (n === 1) { rect(x, y + 4, 16, 24, '#c8a870', 4, '#8a6a3a'); rect(x + 3, y + 12, 10, 4, '#5a8a3a'); } else if (n === 2) { ellipse(x + 8, y + 20, 8, 8, '#5a8ac0'); rect(x + 12, y + 12, 8, 3, '#5a8ac0'); } else rect(x + 2, y + 10, 12, 18, '#e8e0c8', 2, '#8a7a5a'); }
        else if (i.goods === 'atacado') { if (n === 0) { rect(x + 3, y + 6, 10, 22, ['#3a7a3a', '#8a4a1a', '#c8a030', '#3a5a9a'][k], 3); rect(x + 6, y, 4, 8, '#2a2a2a'); } else if (n === 1) rect(x, y + 10, 18, 18, '#d8b878', 2, '#8a6a3a'); else if (n === 2) rect(x, y + 8, 16, 20, ['#e83a2a', '#f0d040', '#3a8ad0', '#f4ecd8'][k], 2, '#5a4a3a'); else rect(x + 2, y + 14, 14, 14, '#f0e0a0', 2, '#a8883a'); }
        else if (i.goods === 'acougue') { if (n === 0 || n === 2) { rect(x + 8, y - 4, 2, 10, '#9a9aa0'); ellipse(x + 9, y + 16, 8, 11, n ? '#b83a3a' : '#d86a5a'); ellipse(x + 9, y + 14, 4, 6, '#f0d0c0'); } else if (n === 1) { ellipse(x + 9, y + 20, 9, 7, '#c86a3a'); ellipse(x + 9, y + 18, 5, 4, '#e8a07a'); } else rect(x + 2, y + 12, 14, 16, '#8a3a2a', 7, '#5a2014'); }
        else { if (n === 0) rect(x, y + 12, 18, 16, '#f0ece0', 3, '#a8a090'); else if (n === 1) { ctx.strokeStyle = '#c8a050'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x + 9, y + 18, 9, 8, 0, 0, Math.PI * 2); ctx.stroke(); } else if (n === 2) rect(x, y + 4, 16, 24, '#c8a060', 4, '#8a6a3a'); else { rect(x + 2, y + 6, 8, 22, '#6a3a1a', 2); rect(x + 2, y + 24, 14, 5, '#6a3a1a', 2); } }
      }
    }
  },
  // Pilha de sacos (adubo, ração).
  sacks(i) { for (let k = 0; k < 5; k++) { const x = i.x + (k % 3) * (i.w / 3) + (k > 2 ? i.w / 6 : 0), y = i.y + i.h - 30 - (k > 2 ? 26 : 0); rect(x, y - 10, i.w / 3 - 6, 40, i.color || '#c8a870', 10, '#8a6a3a'); } txt(i.tag || '', i.x + i.w / 2, i.y + i.h - 8, 10, '#5a3a1a', 'center', 'Arial'); },
  // Ferramentas da horta penduradas: enxada, rastelo e pá.
  tools(i) { rect(i.x, i.y - 110, i.w, 12, '#6a4024'); for (let k = 0; k < 3; k++) { const x = i.x + 20 + k * (i.w - 40) / 2; rect(x - 2, i.y - 100, 4, 100, '#8a5a32'); if (k === 0) rect(x - 12, i.y - 4, 24, 8, '#7a7a80'); else if (k === 1) { rect(x - 14, i.y - 4, 28, 4, '#7a7a80'); for (let t = 0; t < 5; t++) rect(x - 13 + t * 6, i.y, 2, 8, '#7a7a80'); } else ellipse(x, i.y + 2, 10, 12, '#7a7a80'); } },
  hay(i) { rect(i.x, i.y - 30, i.w, i.h + 30, '#d8b860', 6, '#a88a3a'); for (let y = i.y - 24; y < i.y + i.h; y += 10) rect(i.x + 4, y, i.w - 8, 2, '#c0a048'); rect(i.x + i.w * .3, i.y - 30, 3, i.h + 30, '#8a6a2a'); rect(i.x + i.w * .7, i.y - 30, 3, i.h + 30, '#8a6a2a'); },
  // Caixa: balcão de madeira com a registradora.
  caixa(i) { rect(i.x, i.y - 40, i.w, i.h + 40, '#8a5a32', 4, '#3a2414'); rect(i.x, i.y - 40, i.w, 12, '#a8744a'); rect(i.x + 20, i.y - 76, 70, 40, '#3a3a3a', 4, '#1a1a1a'); rect(i.x + 28, i.y - 70, 54, 14, '#9ac87a', 2); for (let k = 0; k < 6; k++) rect(i.x + 26 + (k % 3) * 20, i.y - 52 + Math.floor(k / 3) * 8, 14, 5, '#c8c8c8', 1); rect(i.x + i.w - 70, i.y - 50, 50, 10, '#f4ecd8', 2); }
});
function storeMap(o) {
  return interiorMap({
    id: o.id, name: o.name, W: 1400, H: 900, bounds: { x: 150, y: 250, w: 1100, h: 550 }, door: 700, floor: o.floor, wallColor: o.wallColor, windows: [200, 1130],
    decor(b) { signBoard(b.x + b.w / 2, b.y - 104, 320, o.name.toUpperCase(), 14); },
    onEnter() { teach('loja'); },
    items: [
      { kind: 'storeShelf', x: 300, y: 270, w: 300, h: 40, goods: o.goods }, { kind: 'storeShelf', x: 800, y: 270, w: 300, h: 40, goods: o.goods },
      { kind: 'storeShelf', x: 220, y: 500, w: 240, h: 40, goods: o.goods }, { kind: 'storeShelf', x: 520, y: 500, w: 240, h: 40, goods: o.goods },
      ...o.items,
      { kind: 'caixa', x: 940, y: 640, w: 260, h: 60, label: 'Caixa · comprar', act: o.shop }
    ],
    keeper: o.keeper, keeperSpot: [1070, 610]
  });
}
// Vendedor atrás do balcão (um morador comum da vila).
function drawKeeper(def, layers) { const i = PEOPLE.findIndex(p => p.id === def.keeper); if (i < 0) return; const [x, y] = def.keeperSpot; layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y, false, false, -1) }); }

WORLD_MAPS.agro = storeMap({ id: 'agro', name: 'Armazém Querência', goods: 'agro', floor: 'wood', wallColor: '#d8c89a', keeper: 'anselmo', shop: () => storeShop('agro'), items: [
  { kind: 'sacks', x: 220, y: 700, w: 200, h: 60, color: '#c8a870', tag: 'ADUBO' }, { kind: 'tools', x: 860, y: 520, w: 150, h: 20 }, { kind: 'plant', x: 1180, y: 520, w: 44, h: 40 }, { kind: 'plant', x: 1120, y: 520, w: 44, h: 40 }] });
WORLD_MAPS.gado = storeMap({ id: 'gado', name: 'Casa do Campeiro', goods: 'gado', floor: 'stone', wallColor: '#c8a878', keeper: 'arlindo', shop: () => storeShop('gado'), items: [
  { kind: 'sacks', x: 220, y: 700, w: 200, h: 60, color: '#c89a60', tag: 'RAÇÃO' }, { kind: 'hay', x: 760, y: 520, w: 110, h: 50 }, { kind: 'arreio', x: 900, y: 540, w: 100, h: 50, label: 'Arreio de exposição', text: 'Arreio novo, com prata lavrada: não está à venda, é o orgulho da loja.' }] });
// Atacado da Fronteira (bebidas e balcão) e Açougue (carnes): o resto do que a bodega vende.
WORLD_MAPS.atacado = storeMap({ id: 'atacado', name: 'Atacado da Fronteira', goods: 'atacado', floor: 'stone', wallColor: '#d8d0b8', keeper: 'lucia', shop: () => storeShop('atacado'), items: [
  { kind: 'sacks', x: 220, y: 700, w: 200, h: 60, color: '#e8d8a8', tag: 'FARINHA' }, { kind: 'hay', x: 760, y: 520, w: 110, h: 50, label: 'Engradados de cerveja', text: 'Engradados de casco retornável empilhados até o teto: sábado de bocha esvazia tudo.' }] });
WORLD_MAPS.ferragem = storeMap({ id: 'ferragem', name: 'Ferragem da Fronteira', goods: 'gado', floor: 'wood', wallColor: '#d8c8a8', keeper: 'nair', shop: () => storeShop('ferragem'), items: [
  { kind: 'tools', x: 860, y: 520, w: 150, h: 20, label: 'Ferramentas', text: 'Martelo, serrote, plaina e prego de todo tamanho: tudo para ajeitar a bodega.' }, { kind: 'barrel', x: 220, y: 690, w: 60, h: 60 }, { kind: 'sacks', x: 300, y: 700, w: 200, h: 60, color: '#b8a888', tag: 'CIMENTO' }] });
WORLD_MAPS.acougue = storeMap({ id: 'acougue', name: 'Açougue da Fronteira', goods: 'acougue', floor: 'stone', wallColor: '#e8e4dc', keeper: 'rosa', shop: () => storeShop('acougue'), items: [
  { kind: 'plant', x: 1180, y: 520, w: 44, h: 40 }, { kind: 'sacks', x: 220, y: 700, w: 200, h: 60, color: '#f0ece0', tag: 'SAL GROSSO' }] });
