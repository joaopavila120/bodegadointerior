// Ajudantes da bodega: depois da primeira semana, o Valter conta que dá para contratar os amigos especiais.
// · Balconista: atende o balcão (cigarro, conservas, salame, erva e pinhão na balança).
// · Garçom: tira chope, refri e trago e leva às mesas.
// Mais lentos que o Sadi e sem o "no ponto" (gorjeta menor); usam o estoque da bodega; o salário sai no fechamento de
// cada dia aberto. Com os dias de casa, pegam prática e ficam um pouco mais rápidos. Xis, cozinha e roça seguem com o Sadi.
'use strict';

const HIRE_AT = 40, STAFF_UNLOCK_DAYS = 8;
const STAFF_ROLES = {
  balcao: { name: 'Balconista', icon: '🧾', job: 'atende o balcão: cigarro, conservas, salame, erva e pinhão na balança' },
  garcom: { name: 'Garçom', icon: '🍺', job: 'tira chope, refri e trago e leva às mesas' }
};
const STAFF_DRINKS = ['cerveja', 'refri', 'cachaca'];
const STAFF_TRAITS = {
  guri: { wage: 24, speed: .85, note: 'ligeiro que nem potro novo' }, manolima: { wage: 28, speed: 1.05, note: 'caprichoso, proseia com todo mundo' },
  baitaca: { wage: 26, speed: 1, note: 'canta enquanto serve' }, badin: { wage: 30, speed: .95, note: 'trabalhador da colônia' },
  loligebien: { wage: 27, speed: .9, note: 'chopeiro de Pomerode' }, jayme: { wage: 26, speed: 1.1, note: 'declama verso no balcão' },
  marcio: { wage: 25, speed: 1, note: 'show de bola com a freguesia' }, marcelo: { wage: 25, speed: 1, note: 'show de bola com a freguesia' },
  lauro: { wage: 27, speed: .95, note: 'organizado, conta tudo duas vezes' }, valter: { wage: 30, speed: 1, note: 'conhece cada freguês pelo nome' }
};
const STAFF_DEFAULT = { wage: 26, speed: 1, note: 'dá conta do recado' };
function staffTrait(i) { return STAFF_TRAITS[PEOPLE[i]?.id] || STAFF_DEFAULT; }
function staffState() { G.staff ??= {}; for (const r of Object.keys(G.staff)) if (!PEOPLE[G.staff[r]?.person] || PEOPLE[G.staff[r].person].removed) delete G.staff[r]; return G.staff; }
function staffIds() { return Object.values(G.staff || {}).map(s => s.person); }
function staffWages() { return Object.values(staffState()).reduce((n, s) => n + staffTrait(s.person).wage, 0); }
function staffCandidates() { return specialPeople().filter(i => !PEOPLE[i].removed).sort((a, b) => (G.friends[b] || 0) - (G.friends[a] || 0)); }
// Tempo de cada atendimento: o jeito de cada um e a prática dos dias de casa (até 30% mais rápido).
function staffTime(s, base) { return base * staffTrait(s.person).speed * Math.max(.7, 1 - (s.days || 0) * .03); }

// ---------- Contratar e dispensar (caixa do balcão → Ajudantes) ----------
function staffMenu() {
  const st = staffState(), box = $('dialogContent').closest('.dialog'), keep = modal === 'staff' ? box.scrollTop : 0;
  const slot = r => { const s = st[r], R = STAFF_ROLES[r]; if (!s) return `<div class="supply"><span class="icon"><span class="bag-emoji">${R.icon}</span></span><div><b>${R.name} · vaga aberta</b><p>${R.job}.</p></div></div>`;
    const t = staffTrait(s.person); return `<div class="supply"><span class="icon">${portraitHTML(s.person, 48)}</span><div><b>${R.name} · ${escapeHTML(PEOPLE[s.person].name)}</b><p>${money(t.wage)} por dia aberto · ${s.days || 0} dia${s.days === 1 ? '' : 's'} de casa · ${t.note}</p></div><button data-act="staffFire" data-id="${r}">Dispensar</button></div>`; };
  const cand = staffCandidates().filter(i => !staffIds().includes(i)).map(i => {
    const f = Math.floor(G.friends[i] || 0), ok = f >= HIRE_AT, t = staffTrait(i);
    return `<div class="supply"><span class="icon">${portraitHTML(i, 48)}</span><div><b>${escapeHTML(PEOPLE[i].name)}</b><p>${ok ? money(t.wage) + ' por dia · ' + t.note : 'Amizade ' + f + '/' + HIRE_AT}</p></div>${ok ? Object.keys(STAFF_ROLES).map(r => `<button data-act="staffHire" data-id="${r}:${PEOPLE[i].id}" ${st[r] ? 'disabled' : ''}>${STAFF_ROLES[r].name}</button>`).join('') : '<button disabled>Ainda não topa</button>'}</div>`;
  }).join('');
  openDialog('Ajudantes', `<p>Amigos com amizade ${HIRE_AT} ou mais topam trabalhar na bodega. O salário sai no fechamento de cada dia aberto.</p><h3>Na bodega</h3><div class="store-list">${slot('balcao')}${slot('garcom')}</div><h3>Quem pode trabalhar</h3><div class="store-list">${cand || '<p class="small-note">Todo mundo que é amigo já está trabalhando.</p>'}</div><div class="actions"><button data-act="caixaBack">Voltar ao caixa</button><button data-act="close">Fechar</button></div>`, 'staff');
  box.scrollTop = keep;
}
function staffHire(arg) {
  const [role, id] = String(arg).split(':'), i = PEOPLE.findIndex(p => p.id === id), st = staffState();
  if (!STAFF_ROLES[role] || i < 0 || st[role] || staffIds().includes(i) || (G.friends[i] || 0) < HIRE_AT) return;
  st[role] = { person: i, since: G.day, days: 0 }; AudioEngine.heart();
  floatNote(PEOPLE[i].name + ' agora é ' + STAFF_ROLES[role].name.toLowerCase() + ' da bodega!'); save(); staffMenu();
}
function staffFire(role) { const st = staffState(); if (!st[role]) return; const i = st[role].person; delete st[role]; staffWork[role] = null; floatNote(PEOPLE[i].name + ' foi dispensado. Amigos como antes.'); save(); staffMenu(); }

// ---------- Trabalho durante o expediente ----------
const STAFF_HOME = { balcao: { x: 1250, y: 742 }, garcom: { x: 700, y: 725 } }, STAFF_TAPS = { x: 640, y: 690 };
const staffWork = { balcao: null, garcom: null }, staffClaims = new WeakSet();   // pedidos que o ajudante já pegou (fora do save)
function staffOn() { return ['open', 'closing'].includes(G.phase) && !isCampo() && !tutorialActive() && !worldOut; }
function staffStock(k, n = 1) { return (G.stock[k] || 0) >= n; }
function staffItem(k, grams) { const each = G.avg[k] ?? GOODS[k].cost; if (grams) { G.stock[k] -= grams; return { kind: 'product', pid: k, key: k, ready: true, cost: each * grams, weight: grams }; } G.stock[k]--; return { kind: 'product', pid: k, key: k, ready: true, cost: each }; }
function staffBody(role) { const w = staffWork[role]; if (!w) { const h = STAFF_HOME[role]; staffWork[role] = { x: h.x, y: h.y, task: null }; } return staffWork[role]; }
function staffTick(dt) {
  if (!staffOn()) { for (const r of ['balcao', 'garcom']) if (staffWork[r]) staffDrop(staffWork[r]); staffWork.balcao = staffWork.garcom = null; return; }
  const st = staffState();
  if (st.balcao) balconistaTick(st.balcao, staffBody('balcao'), dt);
  if (st.garcom) garcomTick(st.garcom, staffBody('garcom'), dt);
}
// Anda até o ponto; true quando chegou.
function staffMove(w, to, dt, speed = 170) { const d = Math.hypot(to.x - w.x, to.y - w.y); w.walk = d > 4; if (d > 4) { const k = Math.min(d, speed * dt); w.dx = to.x < w.x ? -1 : 1; w.x += (to.x - w.x) / d * k; w.y += (to.y - w.y) / d * k; } return d <= 4; }
// Onde está cada produto do balcão: a prateleira dele (a erva, na balança).
function staffStation(k) { const f = furniture().find(f => f.id === 'shop:' + k) || (k === 'erva' ? furniture().find(f => f.id === 'bag') : null); return f ? { x: f.x + f.w / 2, y: f.y + f.h + 34 } : null; }
// Desistiu no meio do caminho: o que já saiu da prateleira volta para o estoque.
function staffDrop(w) { const t = w.task; if (t?.item) G.stock[t.k] = (G.stock[t.k] || 0) + (t.item.weight || 1); if (t) staffClaims.delete(t.c || t.d); w.task = null; w.hand = null; }
// Balconista: pega o pedido de quem está no balcão, vai buscar na prateleira (ou pesa na balança) e volta para entregar.
function balconistaTick(s, w, dt) {
  const t = w.task;
  if (!t) {
    const c = G.shop.find(c => c.state === 'queue' && atCounter(c) && !c.path?.length && !c.missing && !c.training && !c.extra?.length && !staffClaims.has(c) && staffStation(c.pid) && staffStock(c.pid, bulk(c.pid) ? c.grams || bulk(c.pid).unit : 1));
    if (!c) { staffMove(w, STAFF_HOME.balcao, dt); return; }
    staffClaims.add(c); const left = staffTime(s, bulk(c.pid) ? 6 : 3.5);
    w.task = { c, k: c.pid, grams: bulk(c.pid) ? c.grams || bulk(c.pid).unit : 0, stage: 'fetch', at: staffStation(c.pid), left, total: left }; return;
  }
  const c = t.c; if (c.state !== 'queue' || !atCounter(c)) { staffDrop(w); return; }
  if (t.stage === 'fetch') {
    if (!staffMove(w, t.at, dt)) return; t.left -= dt; if (t.left > 0) return;
    if (!staffStock(t.k, t.grams || 1)) { staffDrop(w); return; }
    t.item = staffItem(t.k, t.grams); w.hand = t.k; t.stage = 'back'; return;
  }
  if (!staffMove(w, STAFF_HOME.balcao, dt)) return;
  const items = [...(c.got || []), t.item]; w.task = null; w.hand = null; staffClaims.delete(c);
  if (c.fiado && fiadoTotal() + salePrice(t.item) > creditLimit()) c.fiado = false;
  pay(items, c.person, c.patience / c.maxPatience, true, c.x, c.y, c.fiado); G.stats.staffServed = (G.stats.staffServed || 0) + 1;
  c.state = 'leave'; c.dest = null; setDestination(c, EXIT); resetQueuePaths(); effect(PEOPLE[s.person].name + ' atendeu', w.x, w.y - 150, '#d8ffac'); save();
}
// Garçom: tira a bebida na chopeira, na geladeira ou na mesa de tragos e leva até quem pediu.
function garcomTick(s, w, dt) {
  const t = w.task;
  if (!t) {
    const free = [];
    for (const g of G.groups) if (g.state === 'seated' && !g.training) (g.diners || []).forEach((d, n) => { const k = d.orders[0]; if (d.status === 'waiting' && STAFF_DRINKS.includes(k) && unlocked(k) && !staffClaims.has(d) && staffStock(k)) free.push({ g, d, n, k }); });
    free.sort((a, b) => a.d.patience - b.d.patience);
    const o = free[0]; if (!o) { staffMove(w, STAFF_HOME.garcom, dt); return; }
    staffClaims.add(o.d); const left = staffTime(s, 3.5); w.task = { ...o, stage: 'tap', left, total: left }; return;
  }
  const valid = t.g.state === 'seated' && G.groups.includes(t.g) && t.d.status === 'waiting' && t.d.orders.includes(t.k);
  if (!valid) { staffDrop(w); return; }
  if (t.stage === 'tap') { if (!staffMove(w, STAFF_TAPS, dt)) return; t.left -= dt; if (t.left > 0) return; if (!staffStock(t.k)) { staffDrop(w); return; } t.item = staffItem(t.k); w.hand = t.k; t.stage = 'walk'; return; }
  const seat = groupSeatPosition(t.g, t.n); if (!staffMove(w, { x: seat.x, y: seat.y + 20 }, dt)) return;
  const d = t.d, table = G.tables.find(x => x.id === t.g.table);
  d.orders.splice(d.orders.indexOf(t.k), 1); d.delivered.push(t.item); if (table) table.plates++; staffClaims.delete(d); w.task = null; w.hand = null; AudioEngine.tick();
  if (!d.orders.length) { pay(d.delivered, d.person, d.patience / d.maxPatience, true, t.g.x, t.g.y); d.delivered = []; d.status = d.later?.length && G.phase === 'open' ? 'thinking' : 'served'; d.think = thinkTime(THINK_NEXT); }
  G.stats.staffServed = (G.stats.staffServed || 0) + 1; completeDinerRound(t.g); save();
}
// Quem está com um pedido mostra o balão dele na cabeça: assim o Sadi sabe que aquele já tem dono.
function staffBubble(x, y, k) { rect(x - 24, y - 40, 48, 40, '#fff8e8', 10, '#5a3a20'); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.moveTo(x - 7, y - 1); ctx.lineTo(x, y + 8); ctx.lineTo(x + 7, y - 1); ctx.fill(); food(k, x, y - 20, 30); }
function staffLayers(layers) {
  if (!staffOn() || scene) return;
  const st = staffState();
  for (const role of Object.keys(STAFF_ROLES)) {
    const s = st[role]; if (!s) continue; const w = staffBody(role), t = w.task;
    layers.push({ y: w.y, draw: () => {
      personDraw(PEOPLE[s.person].sprite, w.x, w.y, !!w.walk, false, w.dx || -1);
      if (w.hand) food(w.hand, w.x + 22, w.y - 96, 30);
      if (t) { staffBubble(w.x, w.y - 140, t.k); if (t.left > 0 && (t.stage === 'fetch' || t.stage === 'tap')) bar(w.x - 24, w.y - 136, 48, 1 - t.left / t.total, '#e8cc8a'); }
    } });
  }
}

// Fechamento: salário de quem trabalhou (só em dia de bodega aberta, fora o costelão) e mais um dia de casa.
function staffPayday() {
  if (G.openedDay !== G.day || G.event.id === 'costelao') return 0;
  const wages = staffWages(); for (const s of Object.values(staffState())) s.days = (s.days || 0) + 1;
  return wages;
}

// ---------- A conversa do Valter (depois da primeira semana) ----------
function staffIntroTick() {
  if (G.staffUnlocked || !G.missions || prologueActive() || tutorialActive() || worldOut || G.phase !== 'prep' || bodegaDays() < STAFF_UNLOCK_DAYS || !storyCalm()) return;
  G.staffUnlocked = true; save();
  const near = { x: 900, y: 640 };
  playSteps([{ view: 'bodega' }, { do: () => { G.player = { ...G.player, x: 800, y: 640, dx: 1, dy: 0, walk: false }; } }, { fade: 'in', time: .4 }, { actor: 'valter', x: ENTRY.x, y: ENTRY.y, dx: -1 }, { do: () => AudioEngine.doorChime() }, { walk: 'valter', to: near },
    { say: 'valter', text: 'Ô, Sadi! Uma semana de bodega e tu ainda faz tudo sozinho, vivente?' },
    { say: 'valter', text: 'Bodega boa tem ajudante. Quem é teu amigo de verdade topa te dar uma mão no balcão ou levando bebida pras mesas.' },
    { say: 'valter', text: 'Mas ninguém trabalha de graça, hein: cada um tem o seu salário, pago no fim de cada dia de bodega aberta.' },
    { say: 'sadi', text: 'E como eu chamo alguém?' },
    { say: 'valter', text: 'No caixa, em Ajudantes. Quanto mais amizade, mais gente topa. Escolhe bem!' },
    { walk: 'valter', to: { x: ENTRY.x, y: ENTRY.y } }], 'ajudantes',
    () => talk([['card', `<b>👥 Ajudantes</b><br>No caixa do balcão: contrate um <b>balconista</b> (atende o balcão) e um <b>garçom</b> (tira chope, refri e trago e leva às mesas). Só os amigos topam (amizade ${HIRE_AT}+). O salário sai no fechamento de cada dia aberto. O xis e a cozinha continuam contigo.`, 'Novidade na bodega']], null, 'Entendi'));
}

// ---------- Ligações ----------
{
  const customers = customersTick; customersTick = function (dt) { customers(dt); staffTick(dt); };
  const layersHook = sceneLayers; sceneLayers = function (layers) { layersHook(layers); staffLayers(layers); };
  const story = storyTick; storyTick = function () { story(); staffIntroTick(); };
  const available = visitorAvailable; visitorAvailable = function (i, extra = []) { return available(i, extra) && !(G.staff && staffIds().includes(i)); };
}
