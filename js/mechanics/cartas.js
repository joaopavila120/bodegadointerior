// Álbum de cartas: cada carta tem frente (arte) e verso (história). Os amigos especiais dão a carta deles com amizade
// 30; os eventos e as assombrações vencidas dão as cartas ligadas a eles; o resto vem do envelope de figurinhas do
// Atacado e dos baús da caverna da Serra. Abre no Guia e progresso → Álbum de cartas.
'use strict';

const CARD_FRIEND = 30, ENVELOPE_COST = 20;
const EVENT_CARDS = { farroupilha: 'bento_goncalves', fandango: 'paixao_cortes', rodeio: 'barbosa_lessa', oktoberfest: 'blumenau', capela: 'victor_meirelles', casona: 'lupicinio' };
const RELIC_CARDS = { cuia_vo: ['negrinho', 'simoes_lopes'], ticao: ['lobisomem'], fita: ['sanguanel'], escama: ['boitata'], freio: ['mula'] };
let albumSet = 'bodega';

function cardDef(id) { return CARDS.find(c => c.id === id); }
function cardSet(c) { return CARD_SETS.find(s => s.id === c.set); }
function hasCard(id) { return !!G.cards?.[id]; }
function cardsOwned(set) { return CARDS.filter(c => (!set || c.set === set) && hasCard(c.id)).length; }
function cardNo(c) { return 'Nº ' + String(c.n).padStart(2, '0'); }
// Figurinhas soltas (envelope e caverna): as históricas que não dependem de evento.
function looseCards() { return CARDS.filter(c => !['bodega', 'lendas'].includes(c.set) && !Object.values(EVENT_CARDS).includes(c.id) && c.id !== 'simoes_lopes'); }
function randomLooseCard() { const left = looseCards().filter(c => !hasCard(c.id)); return left.length ? pick(left).id : null; }

function giveCard(id, from = '') {
  const c = cardDef(id); if (!c) return false;
  G.cards ??= {}; if (G.cards[id]) return false;
  G.cards[id] = { day: G.day, from }; G.cardsNew = true;
  showBanner('Carta nova: ' + c.name, cardSet(c).name + ' · ' + cardsOwned() + '/' + CARDS.length + ' no álbum (Guia e progresso)', 'gift'); AudioEngine.heart(); save();
  return true;
}
// Uma carta por vez: amigo com amizade 30, evento de hoje concluído ou assombração vencida.
function cardsTick() {
  if (!started || !G?.missions || modal || scene || prologueActive()) return;
  for (const c of CARDS) if (c.person && !hasCard(c.id)) { const i = PEOPLE.findIndex(p => p.id === c.person); if (i >= 0 && !PEOPLE[i].removed && (G.friends[i] || 0) >= CARD_FRIEND) { giveCard(c.id, 'amizade'); return; } }
  const ev = mapEventToday(), id = EVENT_CARDS[ev?.id]; if (id && ev.st.done && !hasCard(id)) { giveCard(id, 'evento'); return; }
  for (const [relic, ids] of Object.entries(RELIC_CARDS)) if (G.relics?.[relic]) for (const k of ids) if (!hasCard(k)) { giveCard(k, 'lenda'); return; }
}

// ---------- Envelope de figurinhas (Atacado) ----------
function envelopeHTML() {
  const left = looseCards().filter(c => !hasCard(c.id)).length;
  return '<h3>Figurinhas</h3><div class="store-list">' + extraCard('figurinha', '🃏', 'Envelope de figurinhas', left ? 'Uma carta histórica nova para o álbum · faltam ' + left + ' das soltas' : 'Você já tem todas as figurinhas soltas do envelope.', ENVELOPE_COST, left ? 'Comprar · ' + money(ENVELOPE_COST) : 'Coleção completa', !!left) + '</div>';
}
function buyEnvelope() {
  const id = randomLooseCard(); if (!id) { say('Já tem todas as figurinhas do envelope.'); return; }
  if (!hasCash(ENVELOPE_COST)) { say('Falta dinheiro para o envelope.'); AudioEngine.bad(); return; }
  spendCash(ENVELOPE_COST); giveCard(id, 'envelope'); albumCard(id, true);
}

// ---------- Álbum ----------
function cardFront(c, mini = false) {
  const s = cardSet(c), i = c.person ? PEOPLE.findIndex(p => p.id === c.person) : -1;
  const initials = c.name.split(/\s+/).filter(w => w.length > 2 || /^[A-ZÁÉÍÓÚ]/.test(w)).map(w => w[0]).slice(0, 2).join('');
  const art = i >= 0 ? portraitHTML(i, mini ? 120 : 240) : `<div class="tcard-ph"><b>${initials}</b><small>arte em breve</small></div>`;
  const illustration = typeof collectibleArt === 'function' ? collectibleArt(c.id) : '';
  return `<div class="tcard-face tcard-front" style="--set:${s.color}"><div class="tcard-top"><span>${cardNo(c)}</span><span>${s.icon}</span></div><div class="tcard-art">${illustration || art}</div><div class="tcard-name"><b>${escapeHTML(c.name)}</b><small>${escapeHTML(c.title)}</small></div></div>`;
}
function cardBack(c) {
  const s = cardSet(c), got = G.cards?.[c.id];
  return `<div class="tcard-face tcard-back" style="--set:${s.color}"><div class="tcard-back-in"><small>${cardNo(c)} · ${s.name}</small><h4>${escapeHTML(c.name)}</h4>${c.years ? `<em>${c.years}</em>` : ''}<p>${c.text}</p><footer>${got ? 'Na coleção desde o dia ' + got.day + ' · ' : ''}${c.how}</footer></div></div>`;
}
function albumDialog(set) {
  if (CARD_SETS.some(s => s.id === set)) albumSet = set;
  const tabs = CARD_SETS.map(s => `<button class="${s.id === albumSet ? 'active' : ''}" data-act="album" data-id="${s.id}">${s.icon} ${s.name} <small>${cardsOwned(s.id)}/${CARDS.filter(c => c.set === s.id).length}</small></button>`).join('');
  const grid = CARDS.filter(c => c.set === albumSet).map(c => hasCard(c.id)
    ? `<button class="album-slot" data-act="albumCard" data-id="${c.id}" aria-label="${escapeHTML(c.name)}">${cardFront(c, true)}</button>`
    : `<div class="album-slot missing"><span>?</span><small>${cardNo(c)}</small><em>${c.how}</em></div>`).join('');
  openDialog('Álbum de cartas', `<p><b>${cardsOwned()}/${CARDS.length}</b> cartas. Clique numa carta para ver a frente e o verso.</p><div class="album-tabs">${tabs}</div><div class="album-grid">${grid}</div><div class="actions"><button data-act="guide">Voltar ao guia</button><button class="primary" data-act="close">Fechar</button></div>`, 'album');
  G.cardsNew = false;
}
// Carta grande: clique nela (ou em Virar) para ver o verso; as setas passam pelas cartas da mesma coleção.
function albumCard(id, fromStore = false) {
  const c = cardDef(id); if (!c || !hasCard(id)) return;
  const list = CARDS.filter(x => x.set === c.set && hasCard(x.id)), k = list.indexOf(c), prev = list[(k - 1 + list.length) % list.length], next = list[(k + 1) % list.length];
  openDialog(c.name, `<div class="tcard-stage"><div class="tcard" id="tcardFlip" data-act="albumFlip" role="button" tabindex="0" aria-label="Virar a carta"><div class="tcard-inner">${cardFront(c)}${cardBack(c)}</div></div></div>
    <div class="actions"><button data-act="albumCard" data-id="${prev.id}" ${list.length < 2 ? 'disabled' : ''} aria-label="Carta anterior">◀</button><button class="primary" data-act="albumFlip">Virar a carta</button><button data-act="albumCard" data-id="${next.id}" ${list.length < 2 ? 'disabled' : ''} aria-label="Próxima carta">▶</button>${fromStore ? '<button data-act="albumStore">Voltar ao Atacado</button>' : `<button data-act="album" data-id="${c.set}">Voltar ao álbum</button>`}</div>`, 'albumCard');
}
function albumFlip() { const el = $('tcardFlip'); if (!el) return; el.classList.toggle('flipped'); AudioEngine.tick(); }

// ---------- Ligações ----------
document.addEventListener('DOMContentLoaded', () => {
  const story = storyTick; storyTick = function () { story(); cardsTick(); };
  const shop = storeShop; storeShop = function (id) { shop(id); if (id === 'atacado' && modal === 'worldStore') $('dialogContent').insertAdjacentHTML('beforeend', envelopeHTML()); };
  const extra = storeExtra; storeExtra = function (id) { if (id === 'figurinha') { buyEnvelope(); return; } extra(id); };
});
