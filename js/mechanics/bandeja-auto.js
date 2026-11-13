// Bandeja de dois espaços sem trocar na mão: o jogo escolhe o espaço sozinho.
//   · Entregando (balcão, freguês da fila ou mesa): usa o espaço que tem o que aquele freguês pediu.
//   · Pegando de uma prateleira, barril, torneira ou garrafa: se o espaço da vez está ocupado e o outro livre, o produto
//     vai pro livre. (Segurando o mesmo produto daquela prateleira, E continua devolvendo, como antes.)
// As teclas 1 e 2 seguem funcionando pra quem quiser escolher.
'use strict';

function bandejaTam() { return G.up?.tray ? 2 : 1; }
function bandejaAcha(pred) { for (let n = 0; n < bandejaTam(); n++) { const i = G.hands[n]; if (i && pred(i)) return n; } return -1; }
function bandejaBom(i) { return i.kind === 'product' && !i.spoiled && !i.burned; }
// Põe na mão o espaço que tem algum dos produtos pedidos (se o da vez não tiver).
function bandejaPraEntregar(want) {
  if (bandejaTam() < 2 || !want?.length) return;
  const h = held(); if (h && bandejaBom(h) && want.includes(h.pid)) return;
  const n = bandejaAcha(i => bandejaBom(i) && want.includes(i.pid)); if (n >= 0) G.slot = n;
}
const BANDEJA_FONTES = ['bin', 'shop', 'bottle', 'tap'], BANDEJA_FONTES_SOLTAS = ['pour', 'bitter', 'coffee', 'bag'];
function bandejaFonte(id) { const [tipo] = String(id || '').split(':'); return BANDEJA_FONTES.includes(tipo) || BANDEJA_FONTES_SOLTAS.includes(id); }
{
  const serve = serveShop; serveShop = function (c) { if (c) bandejaPraEntregar(orderList(c)); return serve(c); };
  const counter = serveCounter; serveCounter = function (index = 0) {
    const c = queuedShop()[index];
    if (c) bandejaPraEntregar(orderList(c));
    if (!held() && bandejaTam() > 1) { const n = bandejaAcha(i => !!i); if (n >= 0) G.slot = n; }
    return counter(index);
  };
  const table = interactTable; interactTable = function (id) {
    const t = G.tables.find(t => t.id === id), g = t && G.groups.find(g => g.id === t.group);
    if (g?.state === 'seated') { ensureDiners(g); bandejaPraEntregar(g.diners.filter(d => d.status === 'waiting').flatMap(d => d.orders)); }
    return table(id);
  };
  const inter = interact; interact = function () {
    if (!worldOut && bandejaTam() > 1 && started && !paused && !modal && !phoneOpen && !G.task) {
      const n = nearest();
      if (n?.kind === 'station' && bandejaFonte(n.id) && held() && !matchingReturn(n.id)) { const livre = G.hands.slice(0, 2).findIndex(i => !i); if (livre >= 0) G.slot = livre; }
      if (n?.kind === 'shop' && n.obj) { bandejaPraEntregar(orderList(n.obj)); if (!held()) { const k = bandejaAcha(i => !!i); if (k >= 0) G.slot = k; } }
    }
    return inter();
  };
}
