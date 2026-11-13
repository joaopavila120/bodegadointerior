// A Ilha da Fortaleza mais bonita. Nada aqui muda colisão, rota nem ponto de interação: é só enfeite.
//   · No chão (pintado uma vez nos blocos): conchas, estrelas-do-mar e madeira seca na faixa de areia; touceiras
//     de flores e bromélias no campo (longe do rio e das trilhas).
//   · A cada quadro, por cima: brilhos de sol no mar, gaivotas rodeando a ilha, borboletas de dia perto do Sadi
//     e vagalumes de noite no campo.
//   · Na Mata da cerração: esporos pálidos boiando na cerração, vagalumes esverdeados e, nos trechos de bruxa,
//     fiapos roxos subindo do chão.
'use strict';

// ---------- O que entra no chão (uma vez, nos blocos) ----------
function belezaConcha(x, y, n) {
  const k = Math.floor(n * 91) % 3;
  if (k === 0) { // concha em leque
    ctx.save(); ctx.strokeStyle = '#d9cfb4'; ctx.lineWidth = 1.4; ctx.fillStyle = '#efe5cc';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, 6, Math.PI * .15, Math.PI * .85); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const a of [.3, .5, .7]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(Math.PI * a) * 6, y + Math.sin(Math.PI * a) * 6); ctx.stroke(); }
    ctx.restore();
  } else if (k === 1) { // estrela-do-mar
    ctx.save(); ctx.fillStyle = '#d58a5a';
    for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5 + n * 6; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 3.6, 1.6, a, 0, Math.PI * 2); ctx.fill(); }
    ellipse(x, y, 2.4, 2.4, '#e8a874'); ctx.restore();
  } else { // madeira seca trazida pelo mar
    ctx.save(); ctx.translate(x, y); ctx.rotate(n * 6);
    rect(-14, -2.5, 28, 5, '#9a8468', 2, '#6a5a44'); rect(-10, -1, 7, 2, '#b3a084');
    ctx.restore();
  }
}
function belezaBromelia(x, y, n) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 2.2;
  for (let i = 0; i < 6; i++) { const a = -Math.PI * .12 - i * Math.PI * .15, L = 9 + (i % 3) * 3; ctx.strokeStyle = i % 2 ? '#3f7a3c' : '#55924a'; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * L * .6, y + Math.sin(a) * L, x + Math.cos(a) * L * 1.3, y + Math.sin(a) * L * 1.2); ctx.stroke(); }
  ellipse(x, y - 8, 2.4, 4, n > .92 ? '#d8506a' : '#c8703a'); ctx.restore();
}
{
  const paint = paintIlhaGround; paintIlhaGround = function (view) {
    paint(view);
    const { x, y, w, h } = view;
    for (let gy = Math.floor(y / 80) * 80; gy < y + h; gy += 80) for (let gx = Math.floor(x / 80) * 80; gx < x + w; gx += 80) {
      const n = ilhaNoise(gx + 17, gy + 31), px = gx + ilhaNoise(gy, gx) * 80, py = gy + ilhaNoise(gx + 3, gy) * 80;
      const beach = ilhaLand(px, py, .003) && !ilhaLand(px, py, .045), campo = ilhaLand(px, py, .09);
      if (beach && n > .6) belezaConcha(px, py, n);
      else if (campo && !ilhaRioAt(px, py, 60) && py < PLANALTO.y - 60) {
        if (n > .94 && typeof fronteiraFlowerClump === 'function') fronteiraFlowerClump(px, py, ilhaNoise(gx + 5, gy + 9));
        else if (n > .915) belezaBromelia(px, py, ilhaNoise(gx + 7, gy + 2));
      }
    }
  };
}

// ---------- O que vive e se mexe (a cada quadro) ----------
function belezaGaivota(x, y, t, k) {
  const flap = Math.sin(frameClock * 7 + k * 2.3), dir = Math.cos(t) > 0 ? 1 : -1;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.strokeStyle = '#f0f2ee'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-11, -flap * 4); ctx.quadraticCurveTo(-4, 2 - flap * 5, 0, 0); ctx.quadraticCurveTo(4, 2 - flap * 5, 11, -flap * 4); ctx.stroke();
  ctx.strokeStyle = '#8a8d88'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(9, -flap * 3.4); ctx.lineTo(12, -flap * 4.2); ctx.stroke();
  ctx.restore();
}
function belezaBorboleta(x, y, k, cor) {
  const flap = Math.abs(Math.sin(frameClock * 11 + k * 1.9));
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = cor; ctx.globalAlpha = .9;
  ctx.beginPath(); ctx.ellipse(-3 * flap - 1, -1, 4 * flap + 1, 3, -.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3 * flap + 1, -1, 4 * flap + 1, 3, .4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a2c1c'; ctx.fillRect(-.7, -3, 1.4, 6); ctx.restore();
}
function belezaVagalume(x, y, ph, verde) {
  const k = Math.max(0, Math.sin(frameClock * 1.7 + ph));
  if (k < .18) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(x, y, 16, .34 * k, verde ? '150,240,130' : '255,240,150');
  ellipse(x, y, 1.6, 1.6, verde ? `rgba(190,255,170,${k})` : `rgba(255,248,190,${k})`);
  ctx.restore();
}
{
  const draw = drawIlha; drawIlha = function (view, seen, layers) {
    draw(view, seen, layers);
    const p = worldOut, noite = worldNight();
    layers.push({ y: 8.5e9, draw: () => {
      // Os brilhos do sol (ou da lua) no mar.
      ctx.save();
      for (let k = 0; k < 30; k++) {
        const sx = view.x + (k * 379.7) % view.w, sy = view.y + (k * 523.3) % view.h;
        if (ilhaLand(sx, sy, -.015)) continue;
        const tw = Math.sin(frameClock * 2.2 + k * 1.7); if (tw < .55) continue;
        ctx.globalAlpha = (tw - .55) * (noite ? .7 : 1.1); ctx.fillStyle = noite ? '#cfe2ea' : '#f2f8f0'; ctx.fillRect(sx, sy, 3.5, 1.5);
      }
      ctx.restore();
      // As gaivotas rodeando a ilha (de dia).
      if (!noite) for (let k = 0; k < 3; k++) {
        const t = frameClock * (.075 + k * .012) + k * 2.1;
        const gx = ILHA.cx + Math.cos(t) * (ILHA.rx + 240 - k * 420), gy = ILHA.cy + Math.sin(t * 1.21) * (ILHA.ry + 140 - k * 320);
        if (gx > view.x - 40 && gx < view.x + view.w + 40 && gy > view.y - 40 && gy < view.y + view.h + 40) belezaGaivota(gx, gy, t, k);
      }
      if (!p) return;
      // Borboletas de dia perto do Sadi, no campo; vagalumes de noite.
      if (!noite) {
        for (let k = 0; k < 3; k++) {
          const bx = p.x + Math.cos(frameClock * .7 + k * 2.3) * (110 + k * 55), by = p.y - 30 + Math.sin(frameClock * 1.1 + k * 1.7) * (70 + k * 25);
          if (ilhaLand(bx, by, .06)) belezaBorboleta(bx, by, k, ['#f4eed0', '#f2d44c', '#b7a8e6'][k]);
        }
      } else {
        for (let k = 0; k < 12; k++) {
          const vx = view.x + (k * 293.3 + Math.sin(frameClock * .4 + k) * 30) % view.w, vy = view.y + (k * 431.7 + Math.cos(frameClock * .3 + k * 2) * 24) % view.h;
          if (ilhaLand(vx, vy, .055) && !ilhaRioAt(vx, vy, 30)) belezaVagalume(vx, vy, k * 1.3, false);
        }
      }
    } });
  };
}

// ---------- A Mata da cerração: esporos, vagalumes e os fiapos das bruxas ----------
{
  const draw = drawIlhaMato; drawIlhaMato = function (view, seen, layers) {
    draw(view, seen, layers);
    const L = ilhaMatoLayout(), bruxaTrecho = [2, 3, 6, 7].includes(L.n);
    layers.push({ y: 8.5e9, draw: () => {
      // Esporos pálidos boiando na cerração.
      ctx.save();
      for (let k = 0; k < 16; k++) {
        const ex = view.x + ((k * 311.3 + frameClock * (8 + k % 5 * 3)) % (view.w + 80)) - 40;
        const ey = view.y + ((k * 197.9 + Math.sin(frameClock * .5 + k) * 26) % view.h);
        ctx.globalAlpha = .14 + .1 * Math.sin(frameClock + k * 2.1); ellipse(ex, ey, 2.2, 2.2, '#dfe8de');
      }
      ctx.restore();
      // Vagalumes esverdeados, sempre (a mata é escura).
      for (let k = 0; k < 9; k++) {
        const vx = view.x + (k * 353.9 + Math.sin(frameClock * .35 + k) * 34) % view.w, vy = view.y + (k * 467.1 + Math.cos(frameClock * .28 + k * 1.6) * 28) % view.h;
        belezaVagalume(vx, vy, k * 1.7, true);
      }
      // Nos trechos de bruxa: fiapos roxos subindo do chão, como fumaça de vela.
      if (bruxaTrecho) for (let k = 0; k < 5; k++) {
        const f = (frameClock * .22 + k / 5) % 1, fx = view.x + (k * 509.3) % view.w + Math.sin(f * 9 + k) * 14, fy = view.y + view.h * (1 - f);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .13 * (1 - f) * Math.min(1, f * 5);
        ellipse(fx, fy, 3 + f * 5, 9 + f * 14, '#b070e0'); ctx.restore();
      }
    } });
  };
}
