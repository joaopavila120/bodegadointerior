// HUD de combate reestruturado: em vez de só R atirar e X rodar as armas uma a uma, a pilha de botões do canto
// ganha atalhos diretos:
//   · Armas de longe: um quadradinho por arma que o Sadi tem (bodoque, 38, arpão, carabina), com a munição de cada
//     uma. Clicar escolhe na hora (arpão ⇄ carabina sem dar a volta). X continua trocando: agora ele volta pra arma
//     usada antes (troca rápida entre as duas últimas) e, se só tem duas, alterna entre elas.
//   · Poderes: um quadradinho por poder, com a volta (cooldown) de cada um à vista. Clicar já usa o poder direto.
//     V usa o escolhido e G troca, como sempre.
//   · Bornal: um botão 🎒 na pilha abre o inventário no meio da peleia (a tecla B já fazia isso; agora tem botão).
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
function chudRangedPick(id) {
  if (!rangedOwned(id) || rangedWeapon() === id) return;
  G.rangedPrev = rangedWeapon(); G.rangedPick = id; AudioEngine.tick?.();
  if (worldOut) effect(RANGED[id].name, worldOut.x, worldOut.y - 150, '#ffe2a6', 15);
  updateRangedButton();
}
function chudPoderCast(id) {
  if (!poderHas(id)) return;
  poderState().pick = id; updatePoderButton(); poderUse();
}
function chudBag() { if (typeof inCave === 'function' && inCave()) { if (typeof openCaveBag === 'function') openCaveBag(); } else showBag(); }

// ---------- Munição de cada arma, pro quadradinho ----------
function chudAmmo(id) {
  if (id === 'revolver38') return (ranged.reload > 0 ? '⟳' : rangedDrum()) + '·' + rangedBalas();
  if (id === 'carabina') return String(typeof carabinaBalas === 'function' ? carabinaBalas() : 0);
  if (id === 'bodoque') return '∞';
  return '';
}
function chudSlotIcon(id) {
  const src = RANGED_ART[id];
  return src ? `<img src="${src}" alt="" draggable="false">` : `<span class="slot-emoji">🎯</span>`;
}

// ---------- A fila das armas ----------
let chudRangedHTML = '';
updateRangedButton = function () {
  const box = $('rangedBox'); if (!box) return;
  const id = rangedWeapon(), show = !!id && rangedCombat() && !modal && !scene;
  box.classList.toggle('hidden', !show); box.classList.toggle('in-cave', inCave());
  chudBagButton(show);
  if (!show) return;
  const list = rangedList();
  const slots = list.length < 2 ? '' : `<div class="combat-slots" id="rangedSlots">${list.map(w =>
    `<button type="button" class="combat-slot${w === id ? ' active' : ''}" data-act="rangedPick" data-id="${w}" title="${RANGED[w].name}" aria-label="${RANGED[w].name}">${chudSlotIcon(w)}<em>${chudAmmo(w)}</em></button>`).join('')}</div>`;
  const drum = rangedDrum();
  const fire = id === 'revolver38' ? '<b>R</b> · 38 ' + (ranged.reload > 0 ? '⟳' : '●'.repeat(drum) + '○'.repeat(RANGED.revolver38.drum - drum)) + ' <small>' + rangedBalas() + '</small>'
    : id === 'carabina' ? '<b>R</b> · Carabina <small>' + carabinaBalas() + '</small>'
    : '<b>R</b> · ' + (id === 'arpao' ? 'Arpão' : 'Bodoque');
  const html = slots + `<button id="rangedButton" class="sling-button" type="button" data-act="rangedFire">${fire}</button>`;
  if (html !== chudRangedHTML) { chudRangedHTML = html; box.innerHTML = html; }
};

// ---------- A fila dos poderes ----------
let chudPoderHTML = '';
updatePoderButton = function () {
  const box = $('poderBox'); if (!box) return;
  const id = poderPick(), show = !!id && rangedCombat() && !modal && !scene;
  box.classList.toggle('hidden', !show); box.classList.toggle('in-cave', inCave()); if (!show) return;
  const list = poderList(), benz = typeof poderBenzido === 'function' ? poderBenzido : () => false;
  const slots = list.length < 2 ? '' : `<div class="combat-slots" id="poderSlots">${list.map(k => {
    const P = PODERES[k], cd = Math.ceil(poder.cd[k] || 0);
    return `<button type="button" class="combat-slot${k === id ? ' active' : ''}${cd > 0 ? ' cooling' : ''}" data-act="poderCast" data-id="${k}" title="${P.name}" aria-label="${P.name}"><span class="slot-emoji">${P.icon}</span>${benz(k) ? '<span class="slot-benzido">✨</span>' : ''}${cd > 0 ? `<span class="slot-cd">${cd}</span>` : ''}</button>`;
  }).join('')}</div>`;
  const P = PODERES[id], cd = Math.ceil(poder.cd[id] || 0);
  const html = slots + `<button id="poderButton" class="sling-button${cd > 0 ? ' cooling' : ''}" type="button" data-act="poderUse"><b>V</b> · ${P.icon} ${cd > 0 ? cd + ' s' : P.name.split(' ')[0]}</button>`;
  if (html !== chudPoderHTML) { chudPoderHTML = html; box.innerHTML = html; }
};

// ---------- O botão do bornal na pilha ----------
function chudBagButton(show) {
  const b = $('combatBagButton'); if (!b) return;
  b.classList.toggle('hidden', !(show || rangedCombat() && !modal && !scene));
}

// ---------- Ligações ----------
{
  const act = action; action = function (name, id) {
    if (name === 'rangedPick') { chudRangedPick(id); return; }
    if (name === 'poderCast') { chudPoderCast(id); return; }
    if (name === 'combatBag') { chudBag(); return; }
    return act(name, id);
  };
  // O botão do bornal entra na pilha de combate (criada em poderes.js), por cima de tudo.
  document.addEventListener('DOMContentLoaded', () => {
    const stack = $('combatStack') || $('hudLayer'); if (!stack) return;
    stack.insertAdjacentHTML('beforeend', '<button id="combatBagButton" class="sling-button combat-bag hidden" type="button" data-act="combatBag" aria-label="Abrir o bornal"><b>B</b> · 🎒 Bornal</button>');
  });
}
