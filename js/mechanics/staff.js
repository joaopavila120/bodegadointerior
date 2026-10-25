// Ajudantes da bodega: no fim da primeira noite do capítulo 3 (três noites seguidas), o Valter entra e conta que dá para
// contratar os amigos especiais. Ele mesmo já tem amizade pra ser o primeiro.
// · Balconista: atende tudo que se pede no balcão (prateleiras, erva e granel na balança, vinho e café da cambona).
// · Garçom: leva às mesas chope, refri, trago, bitter, café, petiscos e os lanches prontos no apoio; sem pedido, limpa mesa.
// · Chapeiro: faz o xis e a torrada da mesa que pediu (chapa e prensa) e deixa pronto no apoio da cozinha.
// Mais lentos que o Sadi e sem o "no ponto" (gorjeta menor); usam o estoque da bodega; o salário sai no fechamento de
// cada dia aberto. Com os dias de casa, pegam prática e ficam um pouco mais rápidos. A roça segue com o Sadi.
'use strict';

const HIRE_AT = 40, STAFF_UNLOCK_DAYS = 8;
const STAFF_ROLES = {
  balcao: { name: 'Balconista', icon: '🧾', job: 'atende tudo do balcão: cigarro, conservas, salame, erva e granel na balança, vinho e café' },
  garcom: { name: 'Garçom', icon: '🍺', job: 'leva às mesas chope, refri, trago, bitter, café, petiscos e os lanches prontos no apoio; sem pedido, limpa as mesas' },
  chapa: { name: 'Chapeiro', icon: '🍔', job: 'faz o xis e a torrada que as mesas pediram e deixa no apoio da cozinha' }
};
// Onde buscar cada pedido que não fica numa prateleira do balcão (as prateleiras são "shop:" + o produto).
const STAFF_STATIONS = { erva: 'bag', refri: 'bottle:refri', cerveja: 'tap:cerveja', cachaca: 'pour', bitter: 'bitter', cafe: 'coffee' };
const STAFF_TRAITS = {
  guri: { wage: 24, speed: .85, note: 'ligeiro que nem potro novo' }, manolima: { wage: 28, speed: 1.05, note: 'caprichoso, proseia com todo mundo' },
  baitaca: { wage: 26, speed: 1, note: 'canta enquanto serve' }, badin: { wage: 30, speed: .95, note: 'trabalhador da colônia' },
  loligebien: { wage: 27, speed: .9, note: 'chopeiro de Pomerode' }, jayme: { wage: 26, speed: 1.1, note: 'declama verso no balcão' },
  // Os gêmeos e o Peixinho saem mais baratos, mas são lentos e às vezes trazem o pedido trocado.
  marcio: { wage: 17, speed: 1.35, mistake: .2, note: 'mais barato, mas demora e às vezes troca o pedido (é o quê?)' },
  marcelo: { wage: 17, speed: 1.35, mistake: .2, note: 'mais barato, mas distraído: demora e às vezes troca o pedido' },
  peixinhonabrasa: { wage: 15, speed: 1.4, mistake: .22, note: 'o mais barato: para pra um gole de Kaiser e às vezes troca o pedido' },
  lauro: { wage: 27, speed: .95, note: 'organizado, conta tudo duas vezes' }, valter: { wage: 30, speed: 1, note: 'conhece cada freguês pelo nome' }
};
const STAFF_DEFAULT = { wage: 26, speed: 1, note: 'dá conta do recado' };
function staffTrait(i) { return STAFF_TRAITS[PEOPLE[i]?.id] || STAFF_DEFAULT; }
function staffState() { G.staff ??= {}; for (const r of Object.keys(G.staff)) if (!PEOPLE[G.staff[r]?.person] || PEOPLE[G.staff[r].person].removed) delete G.staff[r]; return G.staff; }
function staffIds() { return Object.values(G.staff || {}).map(s => s.person); }
// Salário acompanha a bodega: 60% no nível 1, mais 10% por nível até o cheio no nível 5. O Valter, que é de casa,
// cobra a metade na primeira semana dos ajudantes.
function staffWage(i) { const full = staffTrait(i).wage * Math.min(1, .6 + .1 * (bodegaLevel() - 1)), deal = PEOPLE[i]?.id === 'valter' && G.staffUnlockedDay != null && G.day - G.staffUnlockedDay < 7; return Math.round(full * (deal ? .5 : 1)); }
function staffWages() { return Object.values(staffState()).reduce((n, s) => n + staffWage(s.person), 0); }
function staffCandidates() { return specialPeople().filter(i => !PEOPLE[i].removed).sort((a, b) => (G.friends[b] || 0) - (G.friends[a] || 0)); }
// Tempo de cada atendimento: o jeito de cada um e a prática dos dias de casa (até 30% mais rápido).
function staffTime(s, base) { return base * staffTrait(s.person).speed * Math.max(.7, 1 - (s.days || 0) * .03); }
// Distraído: às vezes pega a coisa errada (nunca o granel, que é pesado na hora); o freguês reclama e ele volta pra trocar.
const STAFF_TABLE_ITEMS = ['cerveja', 'refri', 'cachaca', 'bitter', 'cafe', 'codorna', 'amendoim', 'pepino', 'salame'], STAFF_COUNTER_ITEMS = ['cigarro', 'codorna', 'pepino', 'salame', 'amendoim', 'vinho'];
function staffMistake(s, k, list) {
  const m = staffTrait(s.person).mistake || 0; if (!m || bulk(k) || Math.random() >= m) return k;
  const other = list.filter(x => x !== k && unlocked(x) && staffStation(x) && staffStock(x)); return other.length ? pick(other) : k;
}
function staffWrong(s, w, t, who, x, y, wait) {
  G.stock[t.fetch] = (G.stock[t.fetch] || 0) + 1; G.stats.staffMistakes = (G.stats.staffMistakes || 0) + 1; AudioEngine.bad();
  effect(PEOPLE[who].name + ': eu pedi ' + nameOf(t.k).toLowerCase() + ', tchê!', x, y - 150, '#ffb3a0');
  const left = staffTime(s, staffFetchTime(t.k)); Object.assign(t, { fetch: t.k, item: null, stage: wait, at: staffStation(t.k), left, total: left }); w.hand = null;
}

// ---------- Contratar e dispensar (caixa do balcão → Ajudantes) ----------
function staffMenu() {
  const st = staffState(), box = $('dialogContent').closest('.dialog'), keep = modal === 'staff' ? box.scrollTop : 0;
  const slot = r => { const s = st[r], R = STAFF_ROLES[r]; if (!s) return `<div class="supply"><span class="icon"><span class="bag-emoji">${R.icon}</span></span><div><b>${R.name} · vaga aberta</b><p>${R.job}.</p></div></div>`;
    const t = staffTrait(s.person); return `<div class="supply"><span class="icon">${portraitHTML(s.person, 48)}</span><div><b>${R.name} · ${escapeHTML(PEOPLE[s.person].name)}</b><p>${money(staffWage(s.person))} por dia aberto · ${s.days || 0} dia${s.days === 1 ? '' : 's'} de casa · ${t.note}</p></div><button data-act="staffFire" data-id="${r}">Dispensar</button></div>`; };
  const cand = staffCandidates().filter(i => !staffIds().includes(i)).map(i => {
    const f = Math.floor(G.friends[i] || 0), ok = f >= HIRE_AT, t = staffTrait(i);
    return `<div class="supply"><span class="icon">${portraitHTML(i, 48)}</span><div><b>${escapeHTML(PEOPLE[i].name)}</b><p>${ok ? money(staffWage(i)) + ' por dia · ' + t.note : 'Amizade ' + f + '/' + HIRE_AT}</p></div>${ok ? Object.keys(STAFF_ROLES).map(r => `<button data-act="staffHire" data-id="${r}:${PEOPLE[i].id}" ${st[r] ? 'disabled' : ''}>${STAFF_ROLES[r].name}</button>`).join('') : '<button disabled>Ainda não topa</button>'}</div>`;
  }).join('');
  openDialog('Ajudantes', `<p>Amigos com amizade ${HIRE_AT} ou mais topam trabalhar na bodega. O salário sai no fechamento de cada dia aberto.</p><h3>Na bodega</h3><div class="store-list">${Object.keys(STAFF_ROLES).map(slot).join('')}</div><h3>Quem pode trabalhar</h3><div class="store-list">${cand || '<p class="small-note">Todo mundo que é amigo já está trabalhando.</p>'}</div><div class="actions"><button data-act="caixaBack">Voltar ao caixa</button><button data-act="close">Fechar</button></div>`, 'staff');
  box.scrollTop = keep;
}
function staffHire(arg, after = staffMenu) {
  const [role, id] = String(arg).split(':'), i = PEOPLE.findIndex(p => p.id === id), st = staffState();
  if (!STAFF_ROLES[role] || i < 0 || st[role] || staffIds().includes(i) || (G.friends[i] || 0) < HIRE_AT) return;
  st[role] = { person: i, since: G.day, days: 0 }; AudioEngine.heart();
  floatNote(PEOPLE[i].name + ' agora é ' + STAFF_ROLES[role].name.toLowerCase() + ' da bodega!'); save(); after();
}
function staffFire(role, after = staffMenu) { const st = staffState(); if (!st[role]) return; const i = st[role].person; delete st[role]; if (staffWork[role]) staffDrop(staffWork[role]); staffWork[role] = null; floatNote(PEOPLE[i].name + ' foi dispensado. Amigos como antes.'); save(); after(); }
function staffRoleOf(i) { return Object.keys(staffState()).find(r => G.staff[r].person === i) || null; }
// Contatos do celular: contratar direto pelo cartão do amigo, escolhendo pra quê.
function contactsBack() { closeDialog(true); phoneTab = 'contacts'; togglePhone(true); }
function contactHireMenu(i) {
  i = Number(i); const p = PEOPLE[i]; if (!p || !G.staffUnlocked || staffIds().includes(i)) return;
  const st = staffState(), t = staffTrait(i), f = Math.floor(G.friends[i] || 0), ok = f >= HIRE_AT;
  const role = r => { const R = STAFF_ROLES[r], s = st[r]; return `<div class="supply"><span class="icon"><span class="bag-emoji">${R.icon}</span></span><div><b>${R.name}</b><p>${R.job}.${s ? ' <b>Vaga ocupada por ' + escapeHTML(PEOPLE[s.person].name) + '.</b>' : ''}</p></div><button class="primary" data-act="contactHireRole" data-id="${r}:${p.id}" ${s || !ok ? 'disabled' : ''}>Contratar como ${R.name.toLowerCase()}</button></div>`; };
  togglePhone(false);
  openDialog('Contratar ' + p.name, `<div class="supply"><span class="icon">${portraitHTML(i, 48)}</span><div><b>${escapeHTML(p.name)}</b><p>${ok ? money(staffWage(i)) + ' por dia aberto · ' + t.note : 'Ainda não topa: amizade ' + f + '/' + HIRE_AT + '.'}</p></div></div><h3>Pra que você quer contratar?</h3><div class="store-list">${Object.keys(STAFF_ROLES).map(role).join('')}</div><p class="small-note">O salário sai no fechamento de cada dia aberto. Dá pra trocar a equipe também no caixa do balcão.</p><div class="actions"><button data-act="contactsBack">Voltar aos contatos</button><button data-act="close">Fechar</button></div>`, 'contactHire');
}
function contactHireRole(arg) { staffHire(arg, contactsBack); }
function contactFire(i) { const r = staffRoleOf(Number(i)); if (r) staffFire(r, renderPhone); }

// ---------- Trabalho durante o expediente ----------
const STAFF_HOME = { balcao: { x: 1250, y: 742 }, garcom: { x: 700, y: 725 }, chapa: { x: 215, y: 610 } }, STAFF_TAPS = { x: 640, y: 690 };
const STAFF_GRILL = { x: 168, y: 575 }, STAFF_PRESS = { x: 190, y: 760 };
const staffWork = { balcao: null, garcom: null, chapa: null }, staffClaims = new WeakSet();   // pedidos que o ajudante já pegou (fora do save)
function staffOn() { return ['open', 'closing'].includes(G.phase) && !isCampo() && !tutorialActive() && !worldOut; }
function staffStock(k, n = 1) { return (G.stock[k] || 0) >= n; }
function staffItem(k, grams) { const each = G.avg[k] ?? GOODS[k].cost; if (grams) { G.stock[k] -= grams; return { kind: 'product', pid: k, key: k, ready: true, cost: each * grams, weight: grams }; } G.stock[k]--; return { kind: 'product', pid: k, key: k, ready: true, cost: each }; }
function staffBody(role) { const w = staffWork[role]; if (!w) { const h = STAFF_HOME[role]; staffWork[role] = { x: h.x, y: h.y, task: null }; } return staffWork[role]; }
function staffTick(dt) {
  if (!staffOn()) { for (const r of Object.keys(STAFF_ROLES)) { if (staffWork[r]) staffDrop(staffWork[r]); staffWork[r] = null; } return; }
  const st = staffState();
  for (const r of Object.keys(STAFF_ROLES)) if (st[r]) staffBody(r).pace = 1 / staffTrait(st[r].person).speed;
  if (st.balcao) balconistaTick(st.balcao, staffBody('balcao'), dt);
  if (st.garcom) garcomTick(st.garcom, staffBody('garcom'), dt);
  if (st.chapa) chapeiroTick(st.chapa, staffBody('chapa'), dt);
}
// Anda até o ponto; true quando chegou.
function staffMove(w, to, dt, speed = 170 * (w.pace || 1)) { const d = Math.hypot(to.x - w.x, to.y - w.y); w.walk = d > 4; if (d > 4) { const k = Math.min(d, speed * dt); w.dx = to.x < w.x ? -1 : 1; w.x += (to.x - w.x) / d * k; w.y += (to.y - w.y) / d * k; } return d <= 4; }
// Onde está cada produto: a prateleira dele, a balança (erva), a geladeira, a chopeira, a mesa de tragos, o bitter ou a cambona.
// Sem a estação (melhoria ainda não comprada), o ajudante deixa o pedido para o Sadi.
function staffStation(k) { const id = STAFF_STATIONS[k] || 'shop:' + k, f = furniture().find(f => f.id === id); return f ? { x: f.x + f.w / 2, y: f.y + f.h + 34 } : null; }
// O garçom leva tudo que não é receita da cozinha (xis e torrada).
function staffTableItem(k) { return !RECIPES[k] && unlocked(k) && !!staffStation(k) && staffStock(k); }
// Quanto demora para buscar: o granel é pesado na balança e o café passa na cambona.
function staffFetchTime(k) { return bulk(k) ? 6 : k === 'cafe' ? 4.5 : 3.5; }
// Desistiu no meio do caminho: o que já saiu da prateleira volta para o estoque.
// O lanche pego no apoio volta pro apoio; os ingredientes do chapeiro voltam pra despensa.
function staffDrop(w) {
  const t = w.task;
  if (t?.item && t.fromParking) staffParkItem(t.item) || (G.stats.waste += t.item.cost || 0);
  else if (t?.parts) for (const [k, n] of Object.entries(t.parts)) G.stock[k] = (G.stock[k] || 0) + n;
  else if (t?.item) G.stock[t.fetch || t.k] = (G.stock[t.fetch || t.k] || 0) + (t.item.weight || 1);
  if (t) { staffClaims.delete(t.c || t.d || t.table); if (t.src) staffClaims.delete(t.src); }
  w.task = null; w.hand = null;
}
// Apoio da cozinha (os dois lugares de "Apoio"): onde o chapeiro deixa o lanche pronto.
function staffParkSpot(i) { const f = furniture().find(f => f.id === 'parking:' + i); return f ? { x: f.x + f.w / 2, y: f.y + f.h + 30 } : null; }
function staffParkItem(item) { const p = G.kitchen?.parking; if (!p) return false; const i = p.findIndex(x => !x); if (i < 0) return false; p[i] = item; return true; }
// Balconista: pega o pedido de quem está no balcão, vai buscar na prateleira (ou pesa na balança) e volta para entregar.
function balconistaTick(s, w, dt) {
  const t = w.task;
  if (!t) {
    const c = G.shop.find(c => c.state === 'queue' && atCounter(c) && !c.path?.length && !c.missing && !c.training && !c.extra?.length && !staffClaims.has(c) && staffStation(c.pid) && staffStock(c.pid, bulk(c.pid) ? c.grams || bulk(c.pid).unit : 1));
    if (!c) { staffMove(w, STAFF_HOME.balcao, dt); return; }
    staffClaims.add(c); const fetch = staffMistake(s, c.pid, STAFF_COUNTER_ITEMS), left = staffTime(s, staffFetchTime(fetch));
    w.task = { c, k: c.pid, fetch, grams: bulk(c.pid) ? c.grams || bulk(c.pid).unit : 0, stage: 'fetch', at: staffStation(fetch), left, total: left }; return;
  }
  const c = t.c; if (c.state !== 'queue' || !atCounter(c)) { staffDrop(w); return; }
  if (t.stage === 'fetch') {
    if (!staffMove(w, t.at, dt)) return; t.left -= dt; if (t.left > 0) return;
    if (!staffStock(t.fetch, t.grams || 1)) { staffDrop(w); return; }
    t.item = staffItem(t.fetch, t.grams); w.hand = t.fetch; t.stage = 'back'; return;
  }
  if (!staffMove(w, STAFF_HOME.balcao, dt)) return;
  if (t.fetch !== t.k) { c.patience = Math.max(1.5, c.patience - c.maxPatience * .15); staffWrong(s, w, t, c.person, c.x, c.y, 'fetch'); return; }
  const items = [...(c.got || []), t.item]; w.task = null; w.hand = null; staffClaims.delete(c);
  if (c.fiado && fiadoTotal() + salePrice(t.item) > creditLimit()) c.fiado = false;
  pay(items, c.person, c.patience / c.maxPatience, true, c.x, c.y, c.fiado); G.stats.staffServed = (G.stats.staffServed || 0) + 1;
  c.state = 'leave'; c.dest = null; setDestination(c, EXIT); resetQueuePaths(); effect(PEOPLE[s.person].name + ' atendeu', w.x, w.y - 150, '#d8ffac'); save();
}
// Garçom: busca o pedido (chopeira, geladeira, mesa de tragos, bitter, cambona ou prateleira) e leva até quem pediu.
function garcomTick(s, w, dt) {
  const t = w.task;
  if (!t) {
    const free = [];
    const park = (G.kitchen?.parking || []).map((item, i) => ({ item, i })).filter(({ item }) => item && RECIPES[item.pid] && item.ready && !item.spoiled && !item.burned && !staffClaims.has(item));
    for (const g of G.groups) if (g.state === 'seated' && !g.training) (g.diners || []).forEach((d, n) => {
      if (d.status !== 'waiting' || staffClaims.has(d)) return;
      const k = d.orders.find(staffTableItem); if (k) { free.push({ g, d, n, k }); return; }
      const p = park.find(p => d.orders.includes(p.item.pid)); if (p) free.push({ g, d, n, k: p.item.pid, park: p });
    });
    free.sort((a, b) => a.d.patience - b.d.patience);
    const o = free[0];
    if (!o) { if (!garcomCleanPick(s, w)) staffMove(w, STAFF_HOME.garcom, dt); return; }
    staffClaims.add(o.d);
    if (o.park) { staffClaims.add(o.park.item); w.task = { g: o.g, d: o.d, n: o.n, k: o.k, stage: 'pick', at: staffParkSpot(o.park.i), slot: o.park.i, src: o.park.item }; return; }
    const fetch = staffMistake(s, o.k, STAFF_TABLE_ITEMS), left = staffTime(s, staffFetchTime(fetch)); w.task = { ...o, fetch, stage: 'tap', at: staffStation(fetch), left, total: left }; return;
  }
  if (t.type === 'clean') { garcomCleanTick(s, w, t, dt); return; }
  const valid = t.g.state === 'seated' && G.groups.includes(t.g) && t.d.status === 'waiting' && t.d.orders.includes(t.k);
  if (!valid) { staffDrop(w); return; }
  if (t.stage === 'pick') { if (!staffMove(w, t.at, dt)) return; if (G.kitchen.parking[t.slot] !== t.src) { staffDrop(w); return; } G.kitchen.parking[t.slot] = null; t.item = t.src; t.fromParking = true; w.hand = t.k; t.stage = 'walk'; return; }
  if (t.stage === 'tap') { if (!staffMove(w, t.at || STAFF_TAPS, dt)) return; t.left -= dt; if (t.left > 0) return; const f = t.fetch || t.k; if (!staffStock(f)) { staffDrop(w); return; } t.item = staffItem(f); w.hand = f; t.stage = 'walk'; return; }
  const seat = groupSeatPosition(t.g, t.n); if (!staffMove(w, { x: seat.x, y: seat.y + 20 }, dt)) return;
  const d = t.d, table = G.tables.find(x => x.id === t.g.table);
  if (t.fetch && t.fetch !== t.k) { d.patience = Math.max(1.5, d.patience - d.maxPatience * .15); staffWrong(s, w, t, d.person, seat.x, seat.y, 'tap'); return; }
  d.orders.splice(d.orders.indexOf(t.k), 1); d.delivered.push(t.item); if (table) table.plates++; staffClaims.delete(d); if (t.src) staffClaims.delete(t.src); w.task = null; w.hand = null; AudioEngine.tick();
  if (!d.orders.length) { pay(d.delivered, d.person, d.patience / d.maxPatience, true, t.g.x, t.g.y); d.delivered = []; d.status = d.later?.length && G.phase === 'open' ? 'thinking' : 'served'; d.think = thinkTime(THINK_NEXT); }
  G.stats.staffServed = (G.stats.staffServed || 0) + 1; completeDinerRound(t.g); save();
}
// Sem pedido pra levar, o garçom limpa a mesa suja (a que ficou vazia primeiro).
function garcomCleanPick(s, w) {
  const t = G.tables.find(t => t.dirty && !t.group && !t.fight && (!t.unlock || G.up[t.unlock]) && !staffClaims.has(t)); if (!t) return false;
  staffClaims.add(t); const left = staffTime(s, 2.2); w.task = { type: 'clean', table: t, k: null, stage: 'clean', at: { x: t.x + t.w / 2, y: t.y + t.h + 34 }, left, total: left }; return true;
}
function garcomCleanTick(s, w, t, dt) {
  const table = t.table; if (!table.dirty || table.group || table.fight) { staffDrop(w); return; }
  if (!staffMove(w, t.at, dt)) return; t.left -= dt; if (t.left > 0) return;
  table.dirty = false; table.plates = 0; staffClaims.delete(table); w.task = null;
  effect(PEOPLE[s.person].name + ' limpou a mesa', table.x + table.w / 2, table.y - 30, '#d8ffac'); AudioEngine.clean(); G.stats.staffCleaned = (G.stats.staffCleaned || 0) + 1; assignTables(); save();
}
// Chapeiro: escolhe o xis (ou a torrada) da mesa que espera há mais tempo e que ainda não está pronto em lugar nenhum,
// passa na chapa e na prensa e deixa no apoio. Só começa com ingrediente na despensa e um lugar livre no apoio.
function chapeiroNeed(k) {
  let n = pendingUnits(k) - preparedUnits(k);
  for (const b of G.kitchen?.bench || []) if (b && matchRecipe(benchParts(b)) === k) n--;
  for (const i of G.kitchen?.grill || []) if (i?.waitingToast && k === 'torrada') n--;
  // O que o garçom já pegou no apoio e está levando também conta como pronto.
  for (const w of Object.values(staffWork)) if (w?.task?.k === k && w.task.src) n--;
  return n;
}
function chapeiroPick() {
  if (!(G.kitchen?.parking || []).some(x => !x)) return null;
  const list = []; for (const g of G.groups) if (g.state === 'seated' && !g.training) for (const d of g.diners || []) if (d.status === 'waiting') for (const k of d.orders) if (RECIPES[k]) list.push({ k, p: d.patience });
  list.sort((a, b) => a.p - b.p);
  for (const { k } of list) if ((!RECIPES[k].unlock || G.up[RECIPES[k].unlock]) && xisReady(k) && chapeiroNeed(k) > 0) return k;
  return null;
}
function chapeiroTick(s, w, dt) {
  const t = w.task;
  if (!t) {
    const k = chapeiroPick(); if (!k) { staffMove(w, STAFF_HOME.chapa, dt); return; }
    const parts = {}; let cost = 0; for (const p of RECIPES[k].parts) { parts[p] = (parts[p] || 0) + 1; cost += G.avg[p] ?? GOODS[p].cost; G.stock[p]--; }
    const left = staffTime(s, k === 'torrada' ? 4.5 : 7); w.task = { k, parts, cost, stage: 'grill', at: STAFF_GRILL, left, total: left }; return;
  }
  if (t.stage === 'grill' || t.stage === 'press') {
    if (!staffMove(w, t.at, dt)) return; t.left -= dt;
    if (t.left > 0) return;
    if (t.stage === 'grill') { const left = staffTime(s, 2.5); Object.assign(t, { stage: 'press', at: STAFF_PRESS, left, total: left }); w.hand = t.k; AudioEngine.press?.(); return; }
    t.stage = 'park'; return;
  }
  // No apoio: espera um lugar livre se o Sadi ocupou os dois.
  const i = (G.kitchen?.parking || []).findIndex(x => !x); if (i < 0) { staffMove(w, STAFF_HOME.chapa, dt); return; }
  if (!staffMove(w, staffParkSpot(i), dt)) return;
  if (G.kitchen.parking[i]) return;
  G.kitchen.parking[i] = { kind: 'product', pid: t.k, key: t.k, parts: RECIPES[t.k].parts.slice(), cost: t.cost, ready: true, perfect: false, heat: 0, burned: false, spoiled: false, floorLeft: null };
  w.task = null; w.hand = null; G.stats.staffCooked = (G.stats.staffCooked || 0) + 1; AudioEngine.tick();
  effect(nameOf(t.k) + ' pronto no apoio', staffParkSpot(i).x, staffParkSpot(i).y - 130, '#d8ffac'); save();
}
// Quem está com um pedido mostra o balão dele na cabeça: assim o Sadi sabe que aquele já tem dono.
function staffBubble(x, y, k) { rect(x - 24, y - 40, 48, 40, '#fff8e8', 10, '#5a3a20'); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.moveTo(x - 7, y - 1); ctx.lineTo(x, y + 8); ctx.lineTo(x + 7, y - 1); ctx.fill(); if (k) food(k, x, y - 20, 30); else txt('🧽', x, y - 18, 22, '#3a2414', 'center', 'Arial', false); }
function staffLayers(layers) {
  if (!staffOn() || scene) return;
  const st = staffState();
  for (const role of Object.keys(STAFF_ROLES)) {
    const s = st[role]; if (!s) continue; const w = staffBody(role), t = w.task;
    layers.push({ y: w.y, draw: () => {
      personDraw(PEOPLE[s.person].sprite, w.x, w.y, !!w.walk, false, w.dx || -1);
      if (w.hand) food(w.hand, w.x + 22, w.y - 96, 30);
      if (t) { staffBubble(w.x, w.y - 140, t.k); if (t.left > 0 && ['fetch', 'tap', 'grill', 'press', 'clean'].includes(t.stage) && Math.hypot(w.x - t.at.x, w.y - t.at.y) < 6) bar(w.x - 24, w.y - 136, 48, 1 - t.left / t.total, '#e8cc8a'); }
    } });
  }
}

// Fechamento: salário de quem trabalhou (só em dia de bodega aberta, fora o costelão) e mais um dia de casa.
function staffPayday() {
  if (G.openedDay !== G.day || G.event.id === 'costelao') return 0;
  const wages = staffWages(); for (const s of Object.values(staffState())) s.days = (s.days || 0) + 1;
  return wages;
}

// ---------- A conversa do Valter (fim da primeira noite do capítulo 3) ----------
// Fechada a primeira noite das três seguidas, o Valter entra na bodega. Saves que passaram disso sem a conversa (ou que
// pularam o capítulo) ainda recebem ela depois de uma semana de bodega, de manhã.
function staffIntroDue() {
  const ab = missionState('abertura');
  if (G.phase === 'closed') return !!ab && ab.status !== 'offered' && G.openedDay === G.day && G.day >= (ab.day || 0) && G.day > (G.tutorial?.day || 1);
  return G.phase === 'prep' && bodegaDays() >= STAFF_UNLOCK_DAYS;
}
function staffIntroTick() {
  if (G.staffUnlocked || !G.missions || prologueActive() || tutorialActive() || worldOut || !staffIntroDue() || !storyCalm()) return;
  G.staffUnlocked = true; G.staffUnlockedDay = G.day;
  // O Valter é de casa: já começa com amizade pra ser contratado.
  const vi = PEOPLE.findIndex(p => p.id === 'valter'); if (vi >= 0) G.friends[vi] = Math.max(G.friends[vi] || 0, HIRE_AT);
  save();
  const near = { x: 900, y: 640 }, night = G.phase === 'closed';
  playSteps([{ view: 'bodega' }, { do: () => { G.player = { ...G.player, x: 800, y: 640, dx: 1, dy: 0, walk: false }; } }, { fade: 'in', time: .4 }, { actor: 'valter', x: ENTRY.x, y: ENTRY.y, dx: -1 }, { do: () => AudioEngine.doorChime() }, { walk: 'valter', to: near },
    { say: 'valter', text: night ? 'Ô, Sadi! Vi a luz acesa e entrei. Que noite, hein? E tu fez tudo sozinho, vivente: balcão, chapa, mesa…' : 'Ô, Sadi! Uma semana de bodega e tu ainda faz tudo sozinho, vivente?' },
    { say: 'valter', text: 'Bodega boa tem ajudante. Quem é teu amigo de verdade topa te dar uma mão no balcão, na chapa ou servindo as mesas.' },
    { say: 'valter', text: 'Mas ninguém trabalha de graça, hein: cada um tem o seu salário, pago no fim de cada dia de bodega aberta.' },
    { say: 'sadi', text: 'E como eu chamo alguém?' },
    { say: 'valter', text: 'No caixa, em Ajudantes, ou pelos Contatos do celular. Quanto mais amizade, mais gente topa.' },
    { say: 'valter', text: 'E se quiser, o primeiro já tá aqui: eu conheço cada freguês pelo nome. Na primeira semana eu cobro a metade, que sou de casa, hehe.' },
    { walk: 'valter', to: { x: ENTRY.x, y: ENTRY.y } }], 'ajudantes',
    () => talk([['card', `<b>👥 Ajudantes</b><br>No caixa do balcão (ou em Contatos, no celular): contrate um <b>balconista</b> (atende tudo do balcão, até o café), um <b>garçom</b> (leva às mesas bebidas, café, petiscos e os lanches prontos, e limpa as mesas) e um <b>chapeiro</b> (faz o xis e a torrada). Só os amigos topam (amizade ${HIRE_AT}+): o <b>Valter</b> já topa. O salário sai no fechamento de cada dia aberto e acompanha o nível da bodega (começa em 60%). A roça continua contigo.`, 'Novidade na bodega']], null, 'Entendi'));
}

// ---------- Ligações ----------
{
  const customers = customersTick; customersTick = function (dt) { customers(dt); staffTick(dt); };
  const layersHook = sceneLayers; sceneLayers = function (layers) { layersHook(layers); staffLayers(layers); };
  const story = storyTick; storyTick = function () { story(); staffIntroTick(); };
  const available = visitorAvailable; visitorAvailable = function (i, extra = []) { return available(i, extra) && !(G.staff && staffIds().includes(i)); };
}
