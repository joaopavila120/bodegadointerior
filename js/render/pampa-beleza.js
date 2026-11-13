// O pampa mais vivo. Nada aqui muda colisão, rota nem ponto de interação: é só o campo respirando.
//   · No chão (pintado uma vez nos blocos): touceiras de macela amarela e de flor roxa do campo, manchas de
//     trevo e juncos com taboa na beira das poças e dos banhados.
//   · A cada quadro, por cima: sombras de nuvem passando devagar pelo campo, borboletas perto do Sadi e, de
//     tempo em tempo, um bando de avoantes cruzando o céu.
'use strict';

// ---------- O que entra no chão (uma vez, nos blocos) ----------
function belezaFlorPampa(x, y, n, chao) {
  const roxa = chao !== 'cerro' && (Math.floor(n * 97) % 3 === 0), cor = roxa ? '#a88ad4' : '#e8c838', miolo = roxa ? '#6a4a94' : '#b89020';
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 1.6; ctx.strokeStyle = '#4e6a30';
  const q = 4 + Math.floor(n * 13) % 4;
  for (let j = 0; j < q; j++) {
    const a = j * 2.2 + n * 11, r = 4 + (j % 3) * 5, fx = x + Math.cos(a) * r, fy = y + Math.sin(a) * r * .6, alt = 7 + (j % 3) * 4;
    ctx.beginPath(); ctx.moveTo(fx, fy + alt); ctx.lineTo(fx, fy); ctx.stroke();
    if (roxa) { for (let p = 0; p < 4; p++) { const pa = p * Math.PI / 2 + j; ellipse(fx + Math.cos(pa) * 2.4, fy + Math.sin(pa) * 2, 2, 1.6, cor); } ellipse(fx, fy, 1.4, 1.4, miolo); }
    else { ellipse(fx, fy, 2.6, 2.4, cor); ellipse(fx, fy - .6, 1.2, 1, '#f6e8a0'); }
  }
  ctx.restore();
}
function belezaTrevo(x, y, n) {
  ctx.save(); ctx.fillStyle = 'rgba(66,112,48,.5)';
  const q = 8 + Math.floor(n * 11) % 6;
  for (let j = 0; j < q; j++) { const a = j * 2.6 + n * 7, r = 3 + (j * 13 % 17); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * .6, 2.1, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function belezaJuncos(q, salt) {
  ctx.save(); ctx.lineCap = 'round';
  const n = 10 + Math.floor(ilhaNoise(q.x, q.y) * 8);
  for (let j = 0; j < n; j++) {
    const a = j / n * Math.PI * 2 + salt, k = ilhaNoise(q.x + j * 7, q.y + j * 3);
    if (k < .25) continue;
    const bx = q.x + Math.cos(a) * (q.rx + 10 + k * 16), by = q.y + Math.sin(a) * (q.ry + 8 + k * 12);
    const alt = 20 + k * 22, lean = (k - .5) * 10;
    ctx.strokeStyle = k > .6 ? '#3e5a2c' : '#55703a'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + lean * .4, by - alt * .6, bx + lean, by - alt); ctx.stroke();
    if (k > .62) ellipse(bx + lean, by - alt - 3, 2.2, 6, '#6a4a28'); // a taboa
  }
  ctx.restore();
}
{
  const paint = paintPampaGround; paintPampaGround = function (L, view) {
    paint(L, view);
    const { x, y, w, h } = view, A = PAMPA_AREAS[L.n];
    for (let gy = Math.floor(y / 72) * 72; gy < y + h; gy += 72) for (let gx = Math.floor(x / 72) * 72; gx < x + w; gx += 72) {
      const n = ilhaNoise(gx + L.n * 13, gy + 7);
      const px = gx + ilhaNoise(gy, gx) * 72, py = gy + ilhaNoise(gx + 9, gy) * 72;
      if (n > .93) belezaFlorPampa(px, py, ilhaNoise(gx + 3, gy + 5), A.chao);
      else if (n > .895 && A.chao !== 'cerro') belezaTrevo(px, py, ilhaNoise(gx + 1, gy + 9));
    }
    for (const q of L.pools) {
      if (q.x + q.rx < x - 80 || q.x - q.rx > x + w + 80 || q.y + q.ry < y - 80 || q.y - q.ry > y + h + 80) continue;
      belezaJuncos(q, L.n * .7);
    }
  };
}

// ---------- O que vive e se mexe (a cada quadro) ----------
function belezaPassaro(x, y, k) {
  const flap = Math.sin(frameClock * 9 + k * 2.2);
  ctx.save(); ctx.strokeStyle = 'rgba(52,44,36,.85)'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 8, y - flap * 3.4); ctx.quadraticCurveTo(x - 2, y + 1.5 - flap * 4, x, y); ctx.quadraticCurveTo(x + 2, y + 1.5 - flap * 4, x + 8, y - flap * 3.4); ctx.stroke();
  ctx.restore();
}
{
  const draw = drawPampa; drawPampa = function (view, seen, layers) {
    draw(view, seen, layers);
    layers.push({ y: 8.2e9, draw: () => {
      // As sombras das nuvens, passando devagar com o minuano.
      ctx.save(); ctx.fillStyle = 'rgba(16,24,10,.09)';
      for (let k = 0; k < 2; k++) {
        const span = view.w + 1800, cx = view.x + ((k * 1100 + frameClock * 24) % span) - 900;
        const cy = view.y + (k ? view.h * .7 : view.h * .22) + Math.sin(frameClock * .06 + k * 2) * 50;
        ctx.beginPath(); ctx.ellipse(cx, cy, 540, 210, .25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 280, cy + 70, 340, 140, .15, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // Borboletas perto do Sadi (o campo tem flor, tem borboleta).
      const p = worldOut;
      if (p && !scene) for (let k = 0; k < 3; k++) {
        const bx = p.x + Math.cos(frameClock * .8 + k * 2.4) * (100 + k * 60), by = p.y - 26 + Math.sin(frameClock * 1.2 + k * 1.6) * (64 + k * 22);
        belezaBorboleta(bx, by, k + 3, ['#f2e8c8', '#e8c838', '#d8a0c0'][k]);
      }
      // Um bando de avoantes cruzando, de tempo em tempo.
      const ciclo = frameClock % 52;
      if (ciclo < 16) {
        const k = ciclo / 16, bx = view.x - 140 + (view.w + 280) * k, by = view.y + 70 + Math.sin(k * 5) * 34;
        for (let i = 0; i < 5; i++) belezaPassaro(bx - i * 36, by + (i % 2) * 15 + i * 7, i);
      }
    } });
  };
}
