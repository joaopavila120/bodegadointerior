// Regiões em volta da Fronteira, todas ligadas andando:
//   mapa 2 · Serra Gaúcha (seguindo a estrada para a direita): vinhedos, Maria Fumaça, a igreja, a praça e o salão
//   da comunidade; moram o Badin, os gêmeos Márcio e Marcelo (na Casona), o Gaudêncio, o Mito do Sul e, mais abaixo, o Dianho.
//   mapa 3 · Santa Catarina (subindo no mapa 2): o Vale Europeu em enxaimel; moram o Lauro, o Indavírus, o Peixinho na
//   Brasa, o Loli Gebien e o Jayme Caetano Braun.
// E a cancha de bocha, por dentro: anda-se pela cancha e a bocha no meio abre as opções.
'use strict';

// ---------- Peças comuns ----------
function drawRail(x0, x1, y) { for (let x = x0; x < x1; x += 22) rect(x, y - 6, 12, 26, '#6a4a2a', 1); rect(x0, y, x1 - x0, 4, '#8a8a90'); rect(x0, y + 12, x1 - x0, 4, '#8a8a90'); }
// Maria Fumaça: passa de tempos em tempos pelo trilho, soltando fumaça.
function trainX(x0, x1, speed, phase) { const margin = 1800, span = x1 - x0 + margin * 2; return x0 - margin + ((frameClock * speed + phase) % span); }
function drawTrain(x, y) {
  for (let k = 0; k < 2; k++) { const cx = x - 210 - k * 190; rect(cx, y - 70, 170, 62, k ? '#7a2a1a' : '#8a3a24', 4, '#3a1a10'); for (let w = 0; w < 4; w++) windowPane(cx + 14 + w * 38, y - 60, 26, 22, '#3a1a10'); for (const wx of [cx + 30, cx + 140]) ellipse(wx, y - 4, 13, 13, '#2a2a2a'); }
  rect(x - 150, y - 76, 120, 70, '#1e1e22', 6); rect(x - 40, y - 100, 50, 94, '#2a2a30', 4); rect(x - 46, y - 108, 62, 10, '#7a2a1a'); rect(x - 140, y - 110, 18, 36, '#1e1e22'); rect(x - 146, y - 116, 30, 8, '#3a3a40');
  rect(x - 154, y - 30, 160, 8, '#c8a040'); for (const wx of [x - 128, x - 92, x - 56]) { ellipse(wx, y - 4, 16, 16, '#a82a1a'); ellipse(wx, y - 4, 6, 6, '#2a2a2a'); }
  for (let k = 0; k < 5; k++) { const a = (frameClock * 1.2 + k * .2) % 1; ellipse(x - 131 + a * 70, y - 120 - a * 90, 10 + a * 26, 8 + a * 18, `rgba(235,235,230,${.6 * (1 - a)})`); }
}
function drawVineyard(p) {
  const rows = Math.max(2, Math.round(p.h / 60)); rect(p.x, p.y, p.w, p.h, '#8a6a3a', 4); const gap = p.h / rows;
  for (let r = 0; r < rows; r++) { const y = p.y + gap * r + gap * .62; for (let x = p.x + 16; x < p.x + p.w - 10; x += 46) rect(x, y - 30, 5, 34, '#5a3a20'); rect(p.x + 10, y - 30, p.w - 20, 3, '#6a5a4a');
    for (let x = p.x + 18; x < p.x + p.w - 14; x += 22) { ellipse(x, y - 34, 13, 9, '#3f7a2a'); if ((x + r) % 3 === 0) { ellipse(x - 2, y - 24, 4, 5, '#5a2a6a'); ellipse(x + 3, y - 22, 4, 5, '#6a3a7a'); } } }
}
// Capitel: capelinha de beira de estrada, erguida por promessa.
function drawCapitel(c) {
  const mid = c.x + c.w / 2; rect(c.x + 8, c.y + 30, c.w - 16, c.h - 30, '#f2ede0', 2, '#8a8070'); gable(c.x + 4, c.y + 6, c.w - 8, 30, '#a8442a', 6);
  rect(mid - 3, c.y - 16, 6, 22, '#5a4a3a'); rect(mid - 9, c.y - 10, 18, 4, '#5a4a3a');
  ctx.fillStyle = '#4a6a9a'; ctx.beginPath(); ctx.moveTo(mid - 14, c.y + c.h - 10); ctx.lineTo(mid - 14, c.y + 52); ctx.arc(mid, c.y + 52, 14, Math.PI, 0); ctx.lineTo(mid + 14, c.y + c.h - 10); ctx.closePath(); ctx.fill();
  ellipse(mid, c.y + 60, 5, 8, '#f0e0b0'); for (const dx of [-26, 22]) { ellipse(mid + dx, c.y + c.h - 4, 6, 6, '#e85a7a'); ellipse(mid + dx + 6, c.y + c.h - 2, 5, 5, '#f0d040'); }
}
function drawStoneHouse(h, name) {
  gable(h.x, h.y - 10, h.w, 80, '#8a4a32', 18);
  rect(h.x, h.y + 66, h.w, h.h - 66, '#9a948a', 0, '#5a5248');
  for (let y = h.y + 70; y < h.y + h.h - 4; y += 16) for (let x = h.x + ((y / 16) % 2 ? 0 : 14); x < h.x + h.w - 8; x += 28) rect(x + 2, y + 2, 24, 12, ['#a8a298', '#8e887e', '#b4aea4'][(x + y) % 3], 3);
  rect(h.x + h.w / 2 - 24, h.y + h.h - 76, 48, 76, '#5a3a20', 2, '#2a1a0e'); for (const x of [h.x + 28, h.x + h.w - 78]) { windowPane(x, h.y + 100, 50, 44, '#5a3a20'); rect(x - 8, h.y + 100, 8, 44, '#3a6a3a'); rect(x + 50, h.y + 100, 8, 44, '#3a6a3a'); }
  if (name) signBoard(h.x + h.w / 2, h.y + h.h + 6, h.w - 30, name, 13);
}
function wineBarrels(x, y) { for (let k = 0; k < 3; k++) { ellipse(x + k * 44, y, 24, 30, '#7a4a2a'); for (const dy of [-12, 12]) rect(x + k * 44 - 24, y + dy, 48, 4, '#4a4a44'); } }
// Enxaimel: paredes claras com a estrutura de madeira escura aparente e floreiras nas janelas.
function drawEnxaimel(h, name) {
  gable(h.x, h.y - 30, h.w, 100, '#8a3a24', 16);
  rect(h.x, h.y + 64, h.w, h.h - 64, '#f4f0e6', 0, '#3a2414');
  const beam = '#3a2414', midY = h.y + 64 + (h.h - 64) / 2; rect(h.x, h.y + 64, h.w, 6, beam); rect(h.x, h.y + h.h - 6, h.w, 6, beam); rect(h.x, midY - 3, h.w, 6, beam);
  for (let x = h.x; x <= h.x + h.w - 6; x += h.w / 5) rect(x, h.y + 64, 6, h.h - 64, beam);
  ctx.strokeStyle = beam; ctx.lineWidth = 5; for (let k = 0; k < 5; k += 2) { const x = h.x + k * h.w / 5; ctx.beginPath(); ctx.moveTo(x + 4, midY); ctx.lineTo(x + h.w / 5, h.y + 66); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 4, h.y + h.h - 4); ctx.lineTo(x + h.w / 5, midY); ctx.stroke(); }
  rect(h.x + h.w / 2 - 20, h.y + h.h - 64, 40, 64, '#6a3a20', 2, beam);
  for (const x of [h.x + 22, h.x + h.w - 66]) { windowPane(x, h.y + 84, 44, 34, beam); rect(x - 2, h.y + 118, 48, 8, '#7a4a2a'); for (let k = 0; k < 5; k++) ellipse(x + 4 + k * 10, h.y + 116, 5, 5, ['#e8304a', '#f8f0f0', '#e8304a', '#f0c040', '#e8304a'][k]); }
  if (name) signBoard(h.x + h.w / 2, h.y + h.h + 6, h.w - 30, name, 13);
}
// Casona: casa de dois pisos; o de baixo é vazio, só os pilares (a casa dos gêmeos é em cima).
function drawCasona(h, name) {
  const upper = h.y + 60, floor = h.y + h.h * .55;
  gable(h.x, h.y - 20, h.w, 90, '#7a3a24', 18);
  rect(h.x, upper, h.w, floor - upper, '#e8d8b0', 0, '#5a4a32'); for (const x of [h.x + 24, h.x + h.w / 2 - 30, h.x + h.w - 84]) windowPane(x, upper + 24, 60, 50);
  rect(h.x - 10, floor - 6, h.w + 20, 12, '#8a5a32'); for (let x = h.x - 6; x < h.x + h.w + 10; x += 18) rect(x, floor - 26, 4, 20, '#8a5a32');
  rect(h.x, floor + 6, h.w, h.y + h.h - floor - 6, 'rgba(30,22,14,.55)'); for (const x of [h.x, h.x + h.w / 2 - 8, h.x + h.w - 16]) rect(x, floor + 6, 16, h.y + h.h - floor - 6, '#c8b890', 0, '#6a5a3a');
  rect(h.x + h.w - 70, floor + 6, 50, 10, '#8a5a32'); for (let k = 0; k < 6; k++) rect(h.x + h.w - 60 + k * 6, floor + 16 + k * ((h.y + h.h - floor - 22) / 6), 40, 5, '#8a5a32');
  if (name) signBoard(h.x + h.w / 2, h.y + h.h + 6, h.w - 20, name, 13);
}
function drawIgreja(m) {
  const mid = m.x + m.w * .4;
  rect(m.x + m.w - 70, m.y - 90, 70, m.h + 90, '#e8e0cc', 0, '#8a8070'); gable(m.x + m.w - 74, m.y - 140, 78, 50, '#a8442a', 4); ellipse(m.x + m.w - 35, m.y - 50, 14, 16, '#3a2a1a'); ellipse(m.x + m.w - 35, m.y - 44, 8, 10, '#c8a040'); rect(m.x + m.w - 38, m.y - 186, 6, 46, '#5a4a3a'); rect(m.x + m.w - 48, m.y - 172, 26, 5, '#5a4a3a');
  gable(m.x, m.y + 40, m.w - 80, 90, '#a8442a', 14); rect(m.x, m.y + 120, m.w - 80, m.h - 120, '#f2ede0', 0, '#8a8070');
  ctx.fillStyle = '#6a4424'; ctx.beginPath(); ctx.moveTo(mid - 30, m.y + m.h); ctx.lineTo(mid - 30, m.y + m.h - 70); ctx.arc(mid, m.y + m.h - 70, 30, Math.PI, 0); ctx.lineTo(mid + 30, m.y + m.h); ctx.closePath(); ctx.fill();
  ellipse(mid, m.y + 100, 18, 18, '#7a5ab0'); ellipse(mid, m.y + 100, 11, 11, '#e8c8f0');
  for (const x of [m.x + 20, m.x + m.w - 130]) poly([[x, m.y + 250], [x, m.y + 200], [x + 15, m.y + 186], [x + 30, m.y + 200], [x + 30, m.y + 250]], '#6a8ab0');
}
function drawSalao(s) {
  gable(s.x, s.y, s.w, 80, '#7a7a72', 18);
  rect(s.x, s.y + 70, s.w, s.h - 70, '#b5623a', 0, '#6a3a20'); for (let y = s.y + 82; y < s.y + s.h; y += 14) rect(s.x + 2, y, s.w - 4, 1, 'rgba(90,40,20,.35)');
  for (const x of [s.x + 50, s.x + 150, s.x + s.w - 230, s.x + s.w - 130]) windowPane(x, s.y + 120, 80, 56);
  rect(s.x + s.w / 2 - 50, s.y + s.h - 90, 100, 90, '#4a2e18', 3, '#2a1a0e'); rect(s.x + s.w / 2 - 2, s.y + s.h - 90, 4, 90, '#2a1a0e');
  signBoard(s.x + s.w / 2, s.y + 78, 280, 'SALÃO DA COMUNIDADE', 14);
  rect(s.x + 40, s.y - 26, s.w - 80, 26, '#f0e0a0', 2, '#a87a2a'); txt('FESTA DO PADROEIRO · GALETO, CUCA E BAILE', s.x + s.w / 2, s.y - 13, 13, '#7a2a14', 'center', 'Georgia');
  pennants(s.x + 40, s.x + s.w - 40, s.y - 46, ['#d42a2a', '#2a7a3a', '#f0d020']);
}
function drawPraca(p) {
  rect(p.x, p.y, p.w, p.h, '#7fae52', 8, '#c9b58a'); rect(p.x + p.w / 2 - 22, p.y, 44, p.h, '#d9c49a'); rect(p.x, p.y + p.h / 2 - 22, p.w, 44, '#d9c49a');
  for (const [x, y] of [[p.x + 120, p.y + 90], [p.x + p.w - 120, p.y + 90], [p.x + 120, p.y + p.h - 90], [p.x + p.w - 120, p.y + p.h - 90]]) { ellipse(x, y, 56, 24, '#5e8a3a'); for (let k = 0; k < 8; k++) ellipse(x - 38 + k * 11, y - 4 + (k % 2) * 6, 4, 4, ['#e85a7a', '#f0d040', '#ffffff'][k % 3]); }
  flagRS(p.x + 60, p.y + p.h / 2 - 30);
  signBoard(p.x + p.w / 2, p.y - 46, 220, 'PRAÇA DA COMUNIDADE', 14);
}
function drawCoreto(c) {
  const mid = c.x + c.w / 2; ellipse(mid, c.y + c.h - 20, c.w / 2 + 10, 34, '#b8a888');
  for (const x of [c.x + 14, c.x + 58, c.x + c.w - 72, c.x + c.w - 26]) rect(x, c.y + 50, 10, c.h - 70, '#f0ece0');
  rect(c.x + 10, c.y + c.h - 50, c.w - 20, 8, '#f0ece0'); poly([[c.x - 16, c.y + 56], [mid, c.y - 10], [c.x + c.w + 16, c.y + 56]], '#3a6a5a'); rect(mid - 3, c.y - 30, 6, 22, '#c8a040');
}
function drawLuterana(l) {
  const mid = l.x + l.w / 2;
  gable(l.x, l.y + 50, l.w, 80, '#4a4a4a', 12); rect(l.x, l.y + 120, l.w, l.h - 120, '#f4f2ec', 0, '#8a8a80');
  rect(mid - 28, l.y - 40, 56, 160, '#f4f2ec', 0, '#8a8a80'); poly([[mid - 32, l.y - 40], [mid, l.y - 170], [mid + 32, l.y - 40]], '#3a4a5a');
  rect(mid - 2, l.y - 200, 4, 34, '#c8a040'); ellipse(mid, l.y - 10, 12, 14, '#3a2a1a');
  rect(mid - 24, l.y + l.h - 70, 48, 70, '#5a3a20', 2); for (const x of [l.x + 24, l.x + l.w - 54]) poly([[x, l.y + 250], [x, l.y + 190], [x + 15, l.y + 172], [x + 30, l.y + 190], [x + 30, l.y + 250]], '#7a9ac8');
}
function drawBolao(b) {
  rect(b.x, b.y + 40, b.w, b.h - 40, '#c8a870', 2, '#5a3a20'); rect(b.x + 20, b.y + 70, b.w - 60, 30, '#e8d8b0', 2, '#a88a50');
  for (let k = 0; k < 9; k++) ellipse(b.x + b.w - 30 + (k % 3) * 8 - 8, b.y + 76 + Math.floor(k / 3) * 9, 3, 5, '#f8f4ec'); ellipse(b.x + 60, b.y + 85, 9, 9, '#3a2a1a');
  rect(b.x - 10, b.y, b.w + 20, 44, '#6a3a24', 3); for (const x of [b.x, b.x + b.w / 2, b.x + b.w - 8]) rect(x, b.y + 40, 8, b.h - 40, '#4a2e18');
  signBoard(b.x + b.w / 2, b.y + 8, 220, 'CANCHA DE BOLÃO', 13);
}
function drawPavilion(k, text, colors) {
  for (let x = k.x; x < k.x + k.w; x += 38) poly([[x, k.y + 60], [x + 19, k.y], [x + 38, k.y + 60]], (x / 38) % 2 ? '#f4f0e6' : '#c83a2a');
  for (const x of [k.x + 6, k.x + k.w - 12]) rect(x, k.y + 56, 8, k.h - 56, '#5a3a20');
  rect(k.x + 30, k.y + k.h - 60, k.w - 60, 12, '#8a5a32'); rect(k.x + 30, k.y + k.h - 30, k.w - 60, 10, '#7a4a2a');
  ellipse(k.x + k.w - 40, k.y + k.h - 40, 20, 26, '#8a5a32'); rect(k.x + k.w - 60, k.y + k.h - 52, 40, 4, '#4a4a44');
  rect(k.x + 30, k.y + 66, k.w - 60, 26, '#f4ecd8', 3, '#5a3a20'); txt(text, k.x + k.w / 2, k.y + 79, 12, '#7a1a1a', 'center', 'Georgia');
  pennants(k.x, k.x + k.w, k.y + 58, colors);
}
function drawPortal(cx, y, text, colors, wall, enx = false) {
  rect(cx - 150, y - 150, 28, 150, wall, 2, '#5a4a3a'); rect(cx + 122, y - 150, 28, 150, wall, 2, '#5a4a3a');
  rect(cx - 170, y - 190, 340, 46, wall, 4, '#5a4a3a'); if (enx) for (let k = 0; k < 6; k++) { rect(cx - 160 + k * 58, y - 188, 6, 42, '#4a2e18'); ctx.strokeStyle = '#4a2e18'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - 154 + k * 58, y - 186); ctx.lineTo(cx - 106 + k * 58, y - 148); ctx.stroke(); }
  rect(cx - 140, y - 182, 280, 30, '#f4ecd8', 3); txt(text, cx, y - 167, 14, '#5a2a14', 'center', 'Georgia');
  gable(cx - 170, y - 236, 340, 46, enx ? '#8a3a24' : '#a8442a', 10); pennants(cx - 150, cx + 150, y - 140, colors);
}
function drawArroio(M, y, bridgeX) {
  const g = ctx.createLinearGradient(0, y, 0, y + 60); g.addColorStop(0, '#5a8aa0'); g.addColorStop(1, '#3a6a84'); ctx.fillStyle = g; ctx.fillRect(0, y, M.W, 60); worldTexture(6, 0, y, M.W, 60, 256);
  for (let i = 0; i < 24; i++) { const x = (i * 131 + frameClock * 30) % M.W; rect(x, y + 14 + (i * 13) % 34, 28, 3, 'rgba(220,240,245,.4)', 2); }
  rect(bridgeX - 70, y - 8, 140, 76, '#8a5f36', 2, '#5a3a1e'); for (let x = bridgeX - 64; x < bridgeX + 70; x += 18) rect(x, y - 8, 2, 76, '#5a3a1e'); rect(bridgeX - 74, y - 14, 6, 88, '#4a3018'); rect(bridgeX + 68, y - 14, 6, 88, '#4a3018');
}
function drawCampinho(c) {
  if(!regionalEnvironmentReady(worldOut?.map))worldTexture(0,c.x,c.y,c.w,c.h,512); ctx.strokeStyle = '#f4f4f4'; ctx.lineWidth = 4; ctx.strokeRect(c.x + 10, c.y + 10, c.w - 20, c.h - 20); ctx.beginPath(); ctx.moveTo(c.x + c.w / 2, c.y + 10); ctx.lineTo(c.x + c.w / 2, c.y + c.h - 10); ctx.stroke(); ctx.beginPath(); ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 50, 0, Math.PI * 2); ctx.stroke();
  for (const gx of [c.x + 4, c.x + c.w - 16]) rect(gx, c.y + c.h / 2 - 50, 12, 100, 'rgba(255,255,255,.5)', 2, '#f4f4f4'); signBoard(c.x + c.w / 2, c.y - 50, 220, 'SHOW DE BOLA', 13);
}
// Monumento: pedestal de pedra, figuras de bronze e a placa com a data.
function drawMonument(m, plaque, stone, figures) {
  const cx = m.x + m.w / 2, base = m.y + m.h, b = '#6a5a3a';
  ellipse(cx, base - 4, m.w / 2 + 16, 14, 'rgba(40,30,20,.3)'); rect(m.x, base - 50, m.w, 50, stone, 3, '#4a4038'); rect(m.x + 10, base - 70, m.w - 20, 24, stone, 2, '#4a4038');
  for (let k = 0; k < figures; k++) { const x = cx + (k - (figures - 1) / 2) * 26, h = k === 2 ? 34 : 54; rect(x - 8, base - 70 - h, 16, h, b); ellipse(x, base - 78 - h, 8, 9, b); }
  rect(m.x + 14, base - 40, m.w - 28, 18, '#c8a860', 2); txt(plaque, cx, base + 14, 11, '#3a2a1a', 'center', 'Georgia');
}
function forestEdge(M, roadX, roadW) { rect(0, 0, M.W, 110, '#2f5a2a'); for (let x = 0; x < M.W; x += 70) ellipse(x + 35, 110, 50, 30, '#3a6a32'); poly([[roadX - 10, 110], [roadX + roadW + 10, 110], [roadX + roadW / 2 + 16, 0], [roadX + roadW / 2 - 16, 0]], '#b08a58'); }
// Mapa de região: tamanho, obstáculos, lugares para o E, desenho e as saídas.
function regionMap(def) { return { ...def, canWalk(x, y) { if (x < -30 || y < -30 || x > this.W + 30 || y > this.H + 30) return false; if (this.blocked?.(x, y)) return false; return !hitRect(this.obstacles, x, y); } }; }
const addLayer = (layers, seen) => (r, fn) => { if (seen(r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h))) layers.push({ y: r.y + r.h, draw: fn }); };

// =================== MAPA 2 · SERRA GAÚCHA ===================
const SERRA = { W: 3600, H: 2600, roadY: 940, roadH: 90, roadX: 1760, roadW: 80, rail: 1072, arroio: 1980,
  badin: { x: 520, y: 560, w: 290, h: 210 }, casona: { x: 2200, y: 420, w: 320, h: 360 }, gaudencio: { x: 2900, y: 580, w: 260, h: 190, wall: '#efe6d2', roof: '#b89a58' },
  mito: { x: 3050, y: 1250, w: 260, h: 190, wall: '#d8d8d0', roof: '#2a6ac8' }, dianho: { x: 1900, y: 2160, w: 280, h: 200 },
  vines: [{ x: 120, y: 500, w: 340, h: 340 }, { x: 900, y: 520, w: 440, h: 300 }, { x: 160, y: 2100, w: 600, h: 320 }, { x: 2500, y: 2150, w: 520, h: 300 }],
  estacao: { x: 120, y: 1140, w: 260, h: 150 }, igreja: { x: 440, y: 1320, w: 300, h: 330 }, salao: { x: 750, y: 1320, w: 950, h: 330 }, praca: { x: 1910, y: 1250, w: 380, h: 400 },
  roadEnd: 3300, roadSouth: 2400, tunnel: { x: 3300, y: 900, w: 300, h: 280 },
  campinho: { x: 2560, y: 1180, w: 400, h: 260 }, vinicola: { x: 2500, y: 1640, w: 380, h: 220 }, galeteria: { x: 3080, y: 1660, w: 340, h: 210 },
  capiteis: [{ x: 1420, y: 600, w: 70, h: 90 }, { x: 3080, y: 940 - 120, w: 70, h: 90 }],
  italianos: { x: 2620, y: 640, w: 110, h: 130 }, alemaes: { x: 1420, y: 2160, w: 110, h: 130 }
};
[SERRA.badin, SERRA.mito, SERRA.dianho].forEach(r => sizeWorldHome(r));
sizeWorldHome(SERRA.casona, 450, 365);
SERRA.coreto = { x: SERRA.praca.x + SERRA.praca.w / 2 - 80, y: SERRA.praca.y + SERRA.praca.h / 2 - 80, w: 160, h: 140 };
SERRA.obstacles = [SERRA.badin, SERRA.casona, SERRA.mito, SERRA.dianho, ...SERRA.vines, SERRA.estacao, SERRA.igreja, SERRA.coreto, SERRA.salao, SERRA.vinicola, SERRA.galeteria, ...SERRA.capiteis, SERRA.italianos, SERRA.alemaes];
WORLD_MAPS.serra = regionMap({
  id: 'serra', name: 'Serra Gaúcha', W: SERRA.W, H: SERRA.H, obstacles: SERRA.obstacles,
  residents: ['badin', 'marcio', 'marcelo', 'mitodosul', 'dianho'],
  walkLines: [[[80, 985], [900, 985], [1800, 985], [2700, 985], [3240, 985]], [[1800, 150], [1800, 985], [1800, 1700], [1800, 2360]]],
  blocked(x, y) { const S = SERRA, cx = S.roadX + S.roadW / 2; if (y < 110 && Math.abs(x - cx) > 36) return true; if (x < 40 && (y < S.roadY || y > S.roadY + S.roadH)) return true; return y > S.arroio - 10 && y < S.arroio + 64 && Math.abs(x - cx) > 60; },
  // Pela esquerda volta à Fronteira; subindo pela estrada, Santa Catarina.
  edge(p) {
    if (p.x < 10) return { map: 'vila', x: VILA.W - 70, y: VILA.roadY + VILA.roadH / 2, title: 'Fronteira', text: 'De volta à bodega, na beira do rio Uruguai.' };
    if (p.y < 20) return { map: 'sc', x: SC.roadX + SC.roadW / 2, y: SC.H - 140, title: 'Santa Catarina · Vale Europeu', text: 'Pomerode e Indaial: casas em enxaimel, cuca e chope.' };
    return null;
  },
  spots() { const S = SERRA; return [
    { id: 'house:badin', ...front(S.badin), label: 'Casa de pedra de Badin', house: 'badin' },
    { id: 'italianos', ...front(S.italianos, 24), label: 'Monumento ao imigrante italiano', info: true, text: 'Imigração italiana: a partir de 1875, famílias vindas principalmente do Vêneto subiram a Serra Gaúcha. Abriram picadas no mato, plantaram parreirais e fundaram as colônias que viraram Caxias do Sul, Bento Gonçalves e Garibaldi.' },
    { id: 'alemaes', ...front(S.alemaes, 24), label: 'Monumento ao imigrante alemão', info: true, text: 'Imigração alemã: em 25 de julho de 1824, as primeiras famílias alemãs chegaram às margens do rio dos Sinos e fundaram São Leopoldo. Depois vieram outras colônias de pequenas propriedades, como Santa Cruz do Sul.' },
    { id: 'farroupilha', x: S.praca.x + 66, y: S.praca.y + S.praca.h / 2 + 10, label: 'Bandeira do Rio Grande', info: true, text: 'Revolução Farroupilha (1835–1845): os farrapos enfrentaram o Império por dez anos, e a bandeira tricolor do Rio Grande nasceu nessa luta. Todo 20 de setembro o gaúcho comemora a data.' },
    { id: 'house:marcio', ...front(S.casona), label: 'Casona de Márcio e Marcelo', house: 'marcio' },
    { id: 'house:mitodosul', ...front(S.mito), label: 'Casa de Mito do Sul', house: 'mitodosul' },
    { id: 'house:dianho', ...front(S.dianho), label: 'Casa de Dianho', house: 'dianho' },
    { id: 'campinho', x: S.campinho.x + S.campinho.w / 2, y: S.campinho.y + S.campinho.h + 24, label: 'Bater pênaltis no campinho', act: () => penaltyMenu() },
    { id: 'estacao', ...front(S.estacao), label: 'Estação da Maria Fumaça', info: true, text: 'Maria Fumaça: na Serra, o trem a vapor ainda corre entre Bento Gonçalves, Garibaldi e Carlos Barbosa, no meio dos parreirais, com apito, vinho e música italiana.' },
    { id: 'igreja', x: S.igreja.x + S.igreja.w * .4, y: S.igreja.y + S.igreja.h + 30, label: 'Entrar na igreja', act: () => enterInterior('igreja') },
    { id: 'coreto', ...front(S.coreto, 26), label: 'Coreto da praça', text: 'Praça da comunidade: em breve, feirinha de domingo e roda de chimarrão.' },
    { id: 'salao', ...front(S.salao), label: 'Entrar no salão da comunidade', act: () => enterInterior('salao') },
    { id: 'vinicola', ...front(S.vinicola), label: 'Vinícola da família', text: 'Vinícola da família: vinho colonial e suco de uva. Em breve dá para comprar vinho para a bodega.' },
    { id: 'galeteria', ...front(S.galeteria), label: 'Galeteria', text: 'Galeteria: galeto al primo canto, polenta frita, radicci e massa.' },
    ...S.capiteis.map((c, i) => ({ id: 'capitel' + i, ...front(c, 24), label: 'Capitel', info: true, text: 'Capitel de beira de estrada: capelinha erguida por promessa, onde as famílias rezam o terço e pedem chuva para a lavoura.' }))
  ]; },
  lights() { const S = SERRA; return [[S.badin.x + 50, S.badin.y + 120], [S.casona.x + 60, S.casona.y + 100], [S.mito.x + 50, S.mito.y + 116], [S.dianho.x + 44, S.dianho.y + 100], [S.salao.x + 90, S.salao.y + 150], [S.igreja.x + 120, S.igreja.y + 100], [S.galeteria.x + 60, S.galeteria.y + 120]]; },
  draw(view, seen, layers) {
    const S = SERRA, cx = S.roadX + S.roadW / 2, add = addLayer(layers, seen);
    grassField(this, view, seen, '#76984a', ['#668a3e', '#8aac58']);
    if(!regionalEnvironmentReady(this.id))for (const [x, y, rx] of [[600, 300, 600], [2000, 300, 700], [3200, 360, 500], [1800, 2400, 700]]) if (seen(x, y, rx)) ellipse(x, y, rx, rx * .3, 'rgba(110,140,70,.4)');
    if(!regionalEnvironmentReady(this.id))forestEdge(this, S.roadX, S.roadW);
    road(0, S.roadY, S.roadEnd, S.roadH); road(S.roadX, 110, S.roadW, S.roadSouth - 110); if(!regionalEnvironmentReady(this.id))ellipse(cx, S.roadSouth, 90, 40, '#b08a58'); drawRail(0, S.W, S.rail);
    drawArroio(this, S.arroio, cx);
    for (const v of S.vines) add(v, () => drawVineyard(v));
    for (const c of S.capiteis) add(c, () => drawCapitel(c));
    add(S.badin, () => drawStoneHouse(S.badin, null));
    add(S.casona, () => drawCasona(S.casona, 'CASONA'));
    add(S.mito, () => worldHouse(S.mito, null, S.mito));
    add(S.dianho, () => drawEnxaimel(S.dianho, null));
    add(S.italianos, () => drawMonument(S.italianos, 'IMIGRANTE ITALIANO · 1875', '#8a7a5a', 2));
    add(S.alemaes, () => drawMonument(S.alemaes, 'IMIGRANTE ALEMÃO · 1824', '#7a7a70', 3));
    layers.push({ y: S.campinho.y, draw: () => drawCampinho(S.campinho) });
    add(S.estacao, () => { const s = S.estacao; if (worldBuilding(9, s, "ESTAÇÃO DA SERRA")) return; gable(s.x, s.y + 10, s.w, 50, '#7a3a24', 16); rect(s.x, s.y + 56, s.w, s.h - 56, '#f0d8a8', 0, '#6a5a3a'); for (const x of [s.x + 20, s.x + s.w - 70]) windowPane(x, s.y + 74, 50, 40); rect(s.x + s.w / 2 - 20, s.y + s.h - 60, 40, 60, '#6a4424'); signBoard(s.x + s.w / 2, s.y + 20, 220, 'ESTAÇÃO · MARIA FUMAÇA', 12); });
    add(S.igreja, () => drawIgreja(S.igreja));
    layers.push({ y: S.praca.y, draw: () => drawPraca(S.praca) }); add(S.coreto, () => drawCoreto(S.coreto));
    add(S.salao, () => drawSalao(S.salao));
    add(S.vinicola, () => { if(worldBuilding(14,S.vinicola)) return; drawStoneHouse(S.vinicola, null); rect(S.vinicola.x + 30, S.vinicola.y + 72, S.vinicola.w - 60, 26, '#f4ecd8', 3, '#5a3a20'); txt('VINÍCOLA DA FAMÍLIA · VINHO COLONIAL', S.vinicola.x + S.vinicola.w / 2, S.vinicola.y + 85, 12, '#6a1a2a', 'center', 'Georgia'); wineBarrels(S.vinicola.x - 150, S.vinicola.y + S.vinicola.h - 20); });
    add(S.galeteria, () => { if(worldBuilding(15,S.galeteria)) return; drawStoneHouse(S.galeteria, null); rect(S.galeteria.x + 20, S.galeteria.y + 70, S.galeteria.w - 40, 26, '#f4ecd8', 3, '#5a3a20'); txt('GALETERIA · GALETO E POLENTA', S.galeteria.x + S.galeteria.w / 2, S.galeteria.y + 83, 12, '#6a1a2a', 'center', 'Georgia'); pennants(S.galeteria.x + 10, S.galeteria.x + S.galeteria.w - 10, S.galeteria.y + 50, ['#2a8a3a', '#f4f4f4', '#d42a2a']); });
    layers.push({ y: S.rail + 20, draw: () => drawTrain(trainX(0, S.W, 120, 900), S.rail + 10) });
    layers.push({ y: 240, draw: () => { signBoard(cx + 170, 150, 200, 'SANTA CATARINA ↑', 13); } });
  }
});

// =================== MAPA 3 · SANTA CATARINA (Vale Europeu) ===================
const SC = { W: 3000, H: 2000, roadX: 1460, roadW: 80, streetY: 960, streetH: 80,
  houses: [{ id: 'lauro', x: 300, y: 1150, w: 280, h: 200, label: 'Casa de Lauro' }, { id: 'indavirus', x: 700, y: 640, w: 280, h: 210, label: 'Casa de Indavírus' },
    { id: 'peixinhonabrasa', x: 1700, y: 1180, w: 270, h: 200, label: 'Casa de Peixinho na Brasa' }, { id: 'loligebien', x: 2100, y: 1160, w: 280, h: 210, label: 'Casa de Loli Gebien' }],
  cafe: { x: 2420, y: 640, w: 320, h: 220 }, bolao: { x: 2450, y: 1220, w: 420, h: 150 },
  festa: { x: 660, y: 1200, w: 380, h: 170 }, ostern: { x: 1100, y: 1160, w: 260, h: 260 }, canchaLauro: { x: 300, y: 1450, w: 280, h: 110 }, grelha: { x: 1910, y: 1510, w: 70, h: 60 }, marco: { x: 1600, y: 1600, w: 110, h: 130 }
};
SC.houses.forEach(r => sizeWorldHome(r, 330, 260));
SC.obstacles = [...SC.houses, SC.cafe, SC.bolao, SC.festa, { x: SC.ostern.x + 100, y: SC.ostern.y + 100, w: 60, h: 60 }, SC.canchaLauro, SC.grelha, SC.marco];
WORLD_MAPS.sc = regionMap({
  id: 'sc', name: 'Santa Catarina · Vale Europeu', W: SC.W, H: SC.H, obstacles: SC.obstacles,
  residents: ['lauro', 'indavirus', 'peixinhonabrasa', 'loligebien'],
  walkLines: [[[240, 1000], [900, 1000], [1500, 1000], [2100, 1000], [2760, 1000]], [[1500, 1060], [1500, 1500], [1500, 1880]]],
  blocked(x, y) { return y > SC.H - 40 && Math.abs(x - (SC.roadX + SC.roadW / 2)) > 50; },
  edge(p) { if (p.y > SC.H - 10) return { map: 'serra', x: SERRA.roadX + SERRA.roadW / 2, y: 70, title: 'Serra Gaúcha', text: 'De volta ao Rio Grande.' }; return null; },
  spots() { const P = SC; return [
    ...P.houses.map(h => ({ id: 'house:' + h.id, ...front(h), label: h.label, house: h.id })),
    { id: 'cafe', ...front(P.cafe), label: 'Café colonial', text: 'Café colonial: cuca, chimia, schmier, linguiça e pão caseiro. Em breve, encomendas para a bodega.' },
    { id: 'bolao', ...front(P.bolao), label: 'Cancha de bolão', text: 'Cancha de bolão: o boliche dos colonos alemães. Em breve, partidas valendo chope.' },
    { id: 'festa', ...front(P.festa), label: 'Festa Pomerana', text: 'Festa Pomerana: chope, bandinha, marreco recheado e baile, como na Kerb dos colonos.' },
    { id: 'ostern', ...front(P.ostern, 0), label: 'Osterbaum', info: true, text: 'Osterbaum: a árvore de Páscoa enfeitada com casquinhas de ovo pintadas, orgulho de Pomerode.' },
    { id: 'canchaLauro', ...front(P.canchaLauro, 20), label: 'Cancha do Lauro', text: 'A canchinha do Lauro Bolador: é aqui que ele treina o jogo de bocha que te ensinou.' },
    { id: 'marco', ...front(P.marco, 24), label: 'Marco do Vale Europeu', info: true, text: 'Vale Europeu: Blumenau foi fundada em 1850 por Hermann Blumenau, e dela nasceram cidades como Pomerode e Indaial. Muitos colonos vieram da Pomerânia, que deu nome a Pomerode.' },
    { id: 'grelha', ...front(P.grelha, 20), label: 'Brasa do Peixinho', text: 'A brasa do Peixinho: peixe na grelha e uma Kaiser gelada na mão.' }
  ]; },
  lights() { return [...SC.houses.map(h => [h.x + 44, h.y + 100]), [SC.cafe.x + 60, SC.cafe.y + 100], [SC.festa.x + SC.festa.w / 2, SC.festa.y + 90]]; },
  draw(view, seen, layers) {
    const P = SC, add = addLayer(layers, seen);
    grassField(this, view, seen, '#5f8a3e', ['#4f7a32', '#76a050']);
    if(!regionalEnvironmentReady(this.id)){rect(0, 0, P.W, 200, '#2f5a2a'); for (let x = 0; x < P.W; x += 80) { ellipse(x + 40, 200, 56, 34, '#3a6a32'); ellipse(x + 10, 150, 40, 70, '#2a5028'); }}
    road(P.roadX, P.streetY, P.roadW, P.H - P.streetY, '#a8a49a', '#8a8680'); road(200, P.streetY, P.W - 400, P.streetH, '#a8a49a', '#8a8680');
    if(!regionalEnvironmentReady(this.id))for (let x = 210; x < P.W - 200; x += 30) rect(x, P.streetY + P.streetH / 2 - 2, 16, 4, '#d8d4c8');
    for (const h of P.houses) add(h, () => h.rancho ? worldHouse(h, null, { wall: '#efe6d2', roof: '#b89a58' }) : drawEnxaimel(h, null));
    add(P.marco, () => drawMonument(P.marco, 'VALE EUROPEU · 1850', '#7a7a70', 1));
    add(P.cafe, () => { if(worldBuilding(4,P.cafe)) return; drawEnxaimel(P.cafe); rect(P.cafe.x + 30, P.cafe.y + 20, P.cafe.w - 60, 28, '#f4ecd8', 3, '#3a2414'); txt('CAFÉ COLONIAL · CUCA E CHIMIA', P.cafe.x + P.cafe.w / 2, P.cafe.y + 34, 12, '#5a2a14', 'center', 'Georgia'); });
    add(P.bolao, () => drawBolao(P.bolao));
    add(P.festa, () => drawPavilion(P.festa, 'FESTA POMERANA · CHOPE E BANDINHA', ['#e8304a', '#f0c040', '#2a7a3a', '#3a6ac8']));
    add({ ...P.ostern, h: P.ostern.h - 100 }, () => { const o = P.ostern, x = o.x + o.w / 2, y = o.y + 160; if (worldSprite("rural", 7, o.x, o.y - 90, o.w, o.h - 10)) return; rect(o.x, o.y + 40, o.w, o.h - 60, '#7fae52', 8, '#c9b58a'); rect(x - 8, y - 140, 16, 150, '#5a3a20'); ellipse(x, y - 170, 90, 70, '#3f7a36'); for (let k = 0; k < 26; k++) ellipse(x - 70 + (k * 37) % 140, y - 220 + (k * 23) % 100, 6, 8, ['#e8304a', '#f0c040', '#3a6ac8', '#e87ad0', '#5ac87a'][k % 5]); });
    add(P.canchaLauro, () => { const c = P.canchaLauro; worldTexture(1,c.x,c.y,c.w,c.h,160);rect(c.x,c.y+c.h-8,c.w,8,'#6a4424'); rect(c.x, c.y, c.w, 10, '#8a5a32'); for (const [x, col] of [[c.x + 60, '#3a6ad0'], [c.x + 150, '#d03a3a'], [c.x + 110, '#f0e8c0']]) ellipse(x, c.y + 60, 7, 6, col); });
    add(P.grelha, () => { const g = P.grelha; if(worldSprite('furniture',31,g.x-8,g.y-85,g.w+16,g.h+85))return; rect(g.x, g.y + 20, g.w, 30, '#3a3a3a', 3); for (let k = 0; k < 3; k++) ellipse(g.x + 14 + k * 20, g.y + 24, 8, 4, '#c8a050'); for (let k = 0; k < 3; k++) { const a = (frameClock + k * .3) % 1; ellipse(g.x + 20 + k * 15, g.y + 10 - a * 40, 6 + a * 8, 5 + a * 6, `rgba(220,220,215,${.5 * (1 - a)})`); } rect(g.x + 6, g.y + 50, 6, 10, '#3a3a3a'); rect(g.x + g.w - 12, g.y + 50, 6, 10, '#3a3a3a'); });
    for (let k = 0; k < 10; k++) { const x = 260 + k * 250, y = 900; if (seen(x, y)) layers.push({ y, draw: () => { worldSprite("nature", 5, x - 10, y - 22, 70, 30); } }); }   // hortênsias
    layers.push({ y: P.H - 120, draw: () => drawPortal(P.roadX + P.roadW / 2, P.H - 120, 'SANTA CATARINA · VALE EUROPEU', ['#1a1a1a', '#d42a2a', '#f0c020'], '#f4f0e6', true) });
  }
});

// =================== CANCHA DE BOCHA (por dentro) ===================
// Anda-se pela cancha; a bocha no meio abre as opções. Descendo até a parte de baixo, sai para o pátio.
const CANCHA_IN = { W: 1600, H: 900, bocha: { x: 790, y: 610, w: 90, h: 34 }, spawn: { x: 800, y: 830 } };
WORLD_MAPS.cancha = {
  id: 'cancha', name: 'Cancha de bocha', W: CANCHA_IN.W, H: CANCHA_IN.H, indoor: true,
  canWalk(x, y) {
    if (y < 520 || y > CANCHA_IN.H + 20) return false;
    const left = 628 - (y - 428) * (400 / 557) + 40, right = 1043 + (y - 428) * (385 / 557) - 40;
    if (x < left || x > right) return false;
    return !hitRect([CANCHA_IN.bocha], x, y);
  },
  edge(p) { if (p.y > CANCHA_IN.H - 25) return { map: 'vila', ...front(VILA.cancha, 40), title: 'Pátio da bodega', text: '' }; return null; },
  spots() { const b = CANCHA_IN.bocha, w = waitingSpot(); return [...(w ? [w] : []), { id: 'bocha', x: b.x + b.w / 2, y: b.y + b.h + 20, label: 'Bocha · jogar, campeonato ou aprender', act: canchaOptions }]; },
  draw(view, seen, layers) {
    rect(view.x, view.y, view.w, view.h, '#20180f');
    if (bocceArt.complete && bocceArt.naturalWidth) { ctx.imageSmoothingEnabled = false; ctx.drawImage(bocceArt, 0, 0, this.W, this.H); ctx.imageSmoothingEnabled = true; }
    const b = CANCHA_IN.bocha, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    drawWaitingPlayer(layers);
    layers.push({ y: b.y + b.h, draw: () => { ellipse(cx, cy + 8, 60, 14, 'rgba(40,20,10,.35)'); ellipse(cx, cy, 6, 6, '#f4f0e0'); for (const [dx, dy, col] of [[-34, 4, '#3a6ad0'], [-14, -6, '#d03a3a'], [22, 6, '#3a6ad0'], [36, -4, '#d03a3a']]) { ellipse(cx + dx, cy + dy, 13, 12, col); ellipse(cx + dx - 4, cy + dy - 4, 4, 3, 'rgba(255,255,255,.5)'); } } });
  }
};
function canchaOptions() {
  openDialog('Cancha de bocha', `<p>O que vai ser?</p><div class="game-menu"><button class="primary" data-act="bocce">Jogar bocha</button><button data-act="sportTournament" data-id="bocha">Jogar campeonato</button><button data-act="learnBocce">Aprender com o Lauro Bolador</button><button data-act="sportBracket">Ver chave salva</button></div>`, 'canchaOptions');
}
