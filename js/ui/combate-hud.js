// HUD de combate: uma barra só, no canto de baixo à esquerda, com três grupos lado a lado.
//   · Bornal: os itens de cura e de briga (1 a 9 usam) e o 🎒, que abre o inventário (B).
//   · Arma: um quadradinho por arma de longe, com a munição. O da vez tem o "R": clicar nele atira; clicar noutro troca
//     na hora (arpão ⇄ carabina sem dar a volta). X volta pra arma usada antes.
//   · Poder: um quadradinho por poder, com a volta (o tempo pra usar de novo) enchendo por cima. Clicar já usa aquele poder.
//     V usa o da vez e G troca.
// À direita ficam só os botões de ação: facão, dash e laço.
// Nada aqui muda dano nem regra: é só a mão chegando mais rápido no que já existia.
'use strict';

// ---------- Troca rápida (X volta pra arma anterior) ----------
{
  const swap = rangedSwap; rangedSwap = function () {
    const list = rangedList(); if (list.length < 2) return;
    const cur = rangedWeapon(), prev = G.rangedPrev;
    if (list.length > 2 && prev && prev !== cur && list.includes(prev)) {
      G.rangedPrev = cur; G.rangedPick = prev; AudioEngine.tick?.();
      effect(RANGED[prev].name, worldOut.x, worldOut.y - 150, '#ffe2a6', 15); updateRangedButton(); return;
    }
    G.rangedPrev = cur; swap();
  };
}
function chudRangedSlot(id) {
  if (!rangedOwned(id)) return;
  if (rangedWeapon() === id) { rangedFire(); return; }
  G.rangedPrev = rangedWeapon(); G.rangedPick = id; AudioEngine.tick?.();
  if (worldOut) effect(RANGED[id].name, worldOut.x, worldOut.y - 150, '#ffe2a6', 15);
  updateRangedButton();
}
function chudPoderCast(id) { if (!poderHas(id)) return; poderState().pick = id; updatePoderButton(); poderUse(); }
function chudBag() { if (typeof inCave === 'function' && inCave()) { if (typeof openCaveBag === 'function') openCaveBag(); } else showBag(); }
function chudAmmo(id) {
  if (id === 'revolver38') return ranged.reload > 0 ? '⟳' : rangedDrum() + '·' + rangedBalas();
  if (id === 'carabina') return String(typeof carabinaBalas === 'function' ? carabinaBalas() : 0);
  if (id === 'bodoque') return '∞';
  return '';
}
function chudArmaIcon(id) { const src = RANGED_ART[id]; return src ? `<img src="${src}" alt="" draggable="false">` : '<span class="slot-emoji">🎯</span>'; }
const chudKbd = k => `<kbd>${k}</kbd>`;

// ---------- O grupo das armas ----------
let chudRangedHTML = '';
updateRangedButton = function () {
  const box = $('rangedBox'); if (!box) return;
  const id = rangedWeapon(), show = !!id && rangedCombat() && !modal && !scene;
  box.classList.toggle('hidden', !show); if (!show) return;
  const list = rangedList();
  const html = `<header>Arma ${chudKbd('R')} atira${list.length > 1 ? ' · ' + chudKbd('X') + ' troca' : ''}</header><div class="cbar-row">${list.map(w =>
    `<button type="button" class="combat-slot${w === id ? ' active' : ''}" data-act="rangedSlot" data-id="${w}" title="${RANGED[w].name}${w === id ? ' · clique pra atirar' : ' · clique pra trocar'}" aria-label="${RANGED[w].name}">${chudArmaIcon(w)}<em>${chudAmmo(w)}</em>${w === id ? '<i>R</i>' : ''}</button>`).join('')}</div>`;
  if (html !== chudRangedHTML) { chudRangedHTML = html; box.innerHTML = html; }
};

// ---------- O grupo dos poderes ----------
let chudPoderHTML = '';
updatePoderButton = function () {
  const box = $('poderBox'); if (!box) return;
  const id = poderPick(), show = !!id && rangedCombat() && !modal && !scene;
  box.classList.toggle('hidden', !show); if (!show) return;
  const list = poderList(), benz = typeof poderBenzido === 'function' ? poderBenzido : () => false;
  const html = `<header>Poder ${chudKbd('V')} usa${list.length > 1 ? ' · ' + chudKbd('G') + ' troca' : ''}</header><div class="cbar-row">${list.map(k => {
    const P = PODERES[k], cd = poder.cd[k] || 0, total = benz(k) ? Math.round(P.cd * .7) : P.cd, frac = cd > 0 ? Math.min(1, cd / total) : 0;
    return `<button type="button" class="combat-slot${k === id ? ' active' : ''}${cd > 0 ? ' cooling' : ''}" data-act="poderCast" data-id="${k}" title="${P.name}${benz(k) ? ' (benzido)' : ''}" aria-label="${P.name}" style="--cd:${Math.round(frac * 100)}%"><span class="slot-emoji">${P.icon}</span>${benz(k) ? '<span class="slot-benzido">✨</span>' : ''}${cd > 0 ? `<span class="slot-cd">${Math.ceil(cd)}</span>` : ''}${k === id ? '<i>V</i>' : ''}</button>`;
  }).join('')}</div>`;
  if (html !== chudPoderHTML) { chudPoderHTML = html; box.innerHTML = html; }
};

// ---------- A barra ----------
function chudBarSync() {
  const bar = $('combatBar'); if (!bar) return;
  const itens = $('cbarItens'), cinto = ['mataBelt', 'caveBelt'].some(id => $(id) && !$(id).classList.contains('hidden'));
  const briga = typeof rangedCombat === 'function' && worldOut && rangedCombat() && !modal && !scene;
  itens?.classList.toggle('hidden', !(cinto || briga));
  const on = [...bar.children].some(g => !g.classList.contains('hidden'));
  bar.classList.toggle('hidden', !on); document.body.classList.toggle('combat-bar-on', on);
  if (on) document.body.style.setProperty('--cbar-h', bar.offsetHeight + 'px');
}

// ---------- Ligações ----------
{
  const act = action; action = function (name, id) {
    if (name === 'rangedSlot') { chudRangedSlot(id); return; }
    if (name === 'poderCast') { chudPoderCast(id); return; }
    if (name === 'combatBag') { chudBag(); return; }
    return act(name, id);
  };
  // Monta a barra com o que os outros arquivos criaram (o cinto da mata, o da gruta, as armas e os poderes).
  document.addEventListener('DOMContentLoaded', () => {
    const hud = $('hudLayer'); if (!hud) return;
    hud.insertAdjacentHTML('beforeend', `<div id="combatBar" class="combat-bar hidden" aria-label="Barra de combate"><section id="cbarItens" class="cbar-grupo cbar-itens hidden"><header>Bornal ${chudKbd('1')}–${chudKbd('9')}</header><div class="cbar-row" id="cbarCinto"><button type="button" class="combat-slot cbar-bag" data-act="combatBag" title="Abrir o bornal (B)" aria-label="Abrir o bornal">${typeof forgeUpgradeIcon === 'function' ? '<span class="slot-art">' + forgeUpgradeIcon('bornal') + '</span>' : '<span class="slot-emoji">🎒</span>'}<i>B</i></button></div></section></div>`);
    const bar = $('combatBar'), cinto = $('cbarCinto');
    for (const id of ['mataBelt', 'caveBelt']) { const el = $(id); if (el) cinto.insertBefore(el, cinto.lastElementChild); }
    for (const id of ['rangedBox', 'poderBox']) { const el = $(id); if (!el) continue; el.className = 'cbar-grupo ' + (id === 'rangedBox' ? 'cbar-armas' : 'cbar-poderes') + ' hidden'; el.innerHTML = ''; bar.appendChild(el); }
    $('combatBagButton')?.remove();
    setInterval(chudBarSync, 150);
  });
}
