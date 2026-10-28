// Avisos de ataque no chão (investida, bote, pisão, mordida, canhonaço): em vez de retângulo e elipse chapados, uma
// mancha de luz com borda brilhante e beirada macia, que aparece aos poucos e vai se enchendo até a hora do golpe.
// As texturas são pintadas uma vez por cor e só esticadas no desenho, então quase não pesam por quadro.
const teleArt = new Map();
function teleTexture(kind, rgb) {
  const key = kind + ':' + rgb; let c = teleArt.get(key); if (c) return c;
  const [r, g, b] = rgb.split(',').map(Number), round = kind === 'area', w = round ? 128 : 256, h = round ? 128 : 64;
  c = document.createElement('canvas'); c.width = w; c.height = h;
  const x2 = c.getContext('2d'), img = x2.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const u = (x + .5) / w, v = (y + .5) / h * 2 - 1; let e = 2, along = 1;
    if (round) e = Math.hypot(u * 2 - 1, v);
    else if (kind === 'lane') { const hw = u > .8 ? (1 - u) / .2 : 1; if (hw > 0) e = Math.abs(v) / hw; along = Math.min(1, u / .12); } // ponta de flecha
    else { e = Math.abs(v); along = Math.min(1, u / .03, (1 - u) / .03); } // faixa reta
    if (e >= 1) continue;
    const rim = Math.exp(-(((1 - e) / .1) ** 2)), soft = Math.min(1, (1 - e) / .07), a = (.2 + .28 * e * e + .6 * rim) * soft * along, i = (y * w + x) * 4;
    d[i] = r + (255 - r) * rim * .55; d[i + 1] = g + (255 - g) * rim * .5; d[i + 2] = b + (255 - b) * rim * .4; d[i + 3] = Math.min(255, a * 255);
  }
  x2.putImageData(img, 0, 0); teleArt.set(key, c); return c;
}
// Quanto do aviso já passou (0 a 1), pelo tempo que falta e o tempo total do aviso.
function teleK(t, total) { return clamp(1 - Math.max(0, t) / total, 0, 1); }
function teleLight(rgb) { return 'rgb(' + rgb.split(',').map(v => (+v + 510) / 3 | 0).join(',') + ')'; }
// Investida: faixa com ponta de flecha; a carga enche da fera até a ponta e as setas correm pra frente.
function teleLane(x, y, ang, len, w, k, rgb = '255,70,40') {
  const c = teleTexture('lane', rgb), show = Math.min(1, k * 5), s = Math.min(w * .22, 24);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.globalAlpha = show * (.45 + .3 * k); ctx.drawImage(c, 0, -w / 2, len, w);
  if (k > .02) { ctx.globalAlpha = show * .6; ctx.drawImage(c, 0, 0, c.width * k, c.height, 0, -w / 2, len * k, w); }
  ctx.lineWidth = Math.max(2, s * .3); ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = teleLight(rgb);
  for (let i = 0; i < 3; i++) { const p = (frameClock * 1.6 + i / 3) % 1, px = len * (.12 + .64 * p); ctx.globalAlpha = Math.sin(Math.PI * p) * show * (.2 + .5 * k); ctx.beginPath(); ctx.moveTo(px - s * .7, -s); ctx.lineTo(px, 0); ctx.lineTo(px - s * .7, s); ctx.stroke(); }
  ctx.restore();
}
// Área (pisão, bote, brasa caindo): por dentro, uma mancha cresce até encostar na borda; quando encosta, é o golpe.
function teleArea(x, y, rx, ry, k, rgb = '255,70,40') {
  const c = teleTexture('area', rgb), show = Math.min(1, k * 5), breathe = .9 + .1 * Math.sin(frameClock * 8 + x);
  ctx.save(); ctx.globalAlpha = show * (.45 + .3 * k) * breathe; ctx.drawImage(c, x - rx, y - ry, rx * 2, ry * 2);
  if (k > .02) { ctx.globalAlpha = show * .55; ctx.drawImage(c, x - rx * k, y - ry * k, rx * 2 * k, ry * 2 * k); }
  ctx.restore();
}
// Mordida ou golpe de lado: o mesmo enchimento, recortado no leque do golpe.
function teleCone(x, y, ang, r, spread, k, rgb = '255,70,40') {
  const c = teleTexture('area', rgb), show = Math.min(1, k * 5);
  ctx.save(); ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r + 2, ang - spread, ang + spread); ctx.closePath(); ctx.clip();
  ctx.globalAlpha = show * (.5 + .3 * k); ctx.drawImage(c, x - r, y - r, r * 2, r * 2);
  if (k > .02) { ctx.globalAlpha = show * .55; ctx.drawImage(c, x - r * k, y - r * k, r * 2 * k, r * 2 * k); }
  ctx.globalAlpha = show * .35; ctx.strokeStyle = teleLight(rgb); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  for (const s of [-spread, spread]) { ctx.moveTo(x + Math.cos(ang + s) * 24, y + Math.sin(ang + s) * 24); ctx.lineTo(x + Math.cos(ang + s) * r, y + Math.sin(ang + s) * r); }
  ctx.stroke(); ctx.restore();
}
// Faixa reta (a linha do canhonaço): estreita no meio e vai se abrindo até a largura toda.
function teleBand(x, y, len, w, k, rgb = '255,70,40', fade = 1) {
  const c = teleTexture('band', rgb), show = Math.min(1, k * 5) * fade;
  ctx.save(); ctx.globalAlpha = show * (.45 + .3 * k); ctx.drawImage(c, x, y - w / 2, len, w);
  if (k > .02) { ctx.globalAlpha = show * .55; ctx.drawImage(c, x, y - w * k / 2, len, w * k); }
  ctx.restore();
}
// Antes do golpe a fera recua um pouco e treme cada vez mais, em vez de vibrar no mesmo ritmo o tempo todo.
function windupLean(b, k, back = 10, shake = 2) { const e = k * k * (3 - 2 * k); return -(b.dx < 0 ? -1 : 1) * back * e + Math.sin(frameClock * 40) * shake * e; }
