// Lojas e ficha no jeito RPG. Vale pra ferraria do São Dunstano, o rancho do Garibaldi, o acampamento do Griggs e a
// ferraria do seu Zeferino, sem mudar o que cada uma vende nem o preço:
//   · Ficha do Sadi (à esquerda): o que está equipado em cada parte do corpo, os atributos (vida, dano, golpes por
//     segundo, alcance, defesa) e o PODER DE PELEIA, com a força que cada região pede. Embaixo, "Pra ficar mais forte":
//     a próxima arma, a próxima armadura e o próximo acessório, com onde conseguir e o que falta.
//   · Balcão (à direita): as seções viram abas (Armas, Afiar, Equipamento, Bornal…). Cada aba mostra quantas coisas
//     dá pra comprar agora. Cada cartão ganha raridade (comum, bom, raro, épico, lendário), a comparação com o que está
//     na mão ("Dano 12 → 28 ▲16") e um selo: Equipado, Teu, Disponível, Falta material ou Bloqueado.
//   · Ao entrar numa região pesada demais pro poder de peleia, um aviso diz o que pede e onde ver o que falta.
'use strict';

// ---------- Atributos e poder de peleia ----------
const RPG_REGIOES = [
  { id: 'mata', nome: 'Mata adentro', rec: 120 },
  { id: 'funda', nome: 'Mata funda e Laguna', rec: 210 },
  { id: 'gruta', nome: 'Gruta funda e Salamanca', rec: 320 },
  { id: 'ilha', nome: 'Ilha da Fortaleza', rec: 430 },
  { id: 'pampa', nome: 'Pampa até Porongos', rec: 600 }
];
function rpgDanoBase(w) { return (w.id === 'facao' ? (caveUp('aco') ? 26 : caveUp('afiado') ? 18 : 12) : w.dmg) + 3 * weaponRefine(w.id); }
function rpgSabre(id) { return typeof armaSabre === 'function' && armaSabre(id); }
function rpgDefesa() { return caveUp('chapeu') ? .15 : 0; }
function rpgLongeMelhor() { return typeof rangedList === 'function' ? rangedList().reduce((m, id) => Math.max(m, +RANGED[id]?.dmg || 0), 0) : 0; }
function rpgPoderDe({ dano = caveDmg(), cd = caveCd(), vida = caveMaxHp(), def = rpgDefesa(), longe = rpgLongeMelhor(), poderes = typeof poderList === 'function' ? poderList().length : 0 } = {}) {
  return Math.round(dano / cd * 1.2 + vida * .8 / (1 - def) + longe * 20 + poderes * 12);
}
function rpgPoder() { return rpgPoderDe(); }
function rpgAtributos() {
  return [['❤', 'Vida', caveMaxHp()], ['⚔', 'Dano', caveDmg()], ['⚡', 'Golpes/s', (1 / caveCd()).toFixed(1)], ['📏', 'Alcance', Math.round(caveReach())], ['🛡', 'Defesa', Math.round(rpgDefesa() * 100) + '%'], ['🎒', 'Bornal', mataBagMax()]];
}

// ---------- Raridade ----------
const RPG_TIERS = ['comum', 'bom', 'raro', 'épico', 'lendário'];
function rpgTierArma(dano) { return dano <= 12 ? 0 : dano <= 24 ? 1 : dano <= 36 ? 2 : dano <= 50 ? 3 : 4; }
function rpgTierPreco(c) { return c < 150 ? 0 : c < 250 ? 1 : c < 700 ? 2 : c < 1200 ? 3 : 4; }
const RPG_TIER_LONGE = { bodoque: 0, revolver38: 1, arpao: 2, carabina: 3 };

// ---------- O que cada coisa muda (a comparação) ----------
function rpgChip(icon, label, de, para, fmt = v => v) {
  const d = para - de, cls = d > 0 ? 'up' : d < 0 ? 'down' : 'eq', seta = d > 0 ? '▲' : d < 0 ? '▼' : '=';
  return `<span class="rpg-cmp ${cls}">${icon} ${label} ${fmt(de)} → <b>${fmt(para)}</b> <i>${seta}${d ? fmt(Math.abs(d)) : ''}</i></span>`;
}
function rpgCmpArma(w) {
  const cur = caveWeapon(), agora = caveDmg(), novo = agora - rpgDanoBase(cur) + rpgDanoBase(w);
  const cdBase = rpgSabre(cur.id) ? caveCd() / .7 : caveCd(), cdNovo = rpgSabre(w.id) ? cdBase * .7 : cdBase;
  let html = rpgChip('⚔', 'Dano', agora, novo);
  if (Math.abs(cdNovo - caveCd()) > .005) html += rpgChip('⚡', 'Golpes/s', +(1 / caveCd()).toFixed(1), +(1 / cdNovo).toFixed(1), v => (+v).toFixed(1));
  return html;
}
function rpgCmpUpgrade(id) {
  const vida = caveMaxHp(), chefes = typeof chefesVencidos === 'function' ? 10 * chefesVencidos() : 0;
  const f = {
    poncho: () => rpgChip('❤', 'Vida', vida, Math.max(vida, 140 + chefes)),
    pala: () => rpgChip('❤', 'Vida', vida, Math.max(vida, 180 + chefes)),
    gibao: () => rpgChip('❤', 'Vida', vida, Math.max(vida, 230 + chefes)),
    afiado: () => caveWeapon().id === 'facao' ? rpgChip('⚔', 'Dano', caveDmg(), caveDmg() - rpgDanoBase(caveWeapon()) + 18 + 3 * weaponRefine('facao')) : '',
    aco: () => caveWeapon().id === 'facao' ? rpgChip('⚔', 'Dano', caveDmg(), caveDmg() - rpgDanoBase(caveWeapon()) + 26 + 3 * weaponRefine('facao')) : '',
    cabo: () => rpgChip('⚡', 'Golpes/s', +(1 / caveCd()).toFixed(1), +(1 / (caveCd() * .26 / .38)).toFixed(1), v => (+v).toFixed(1)),
    comprida: () => rpgChip('📏', 'Alcance', Math.round(caveReach()), Math.round(caveReach() + 35)),
    chapeu: () => rpgChip('🛡', 'Defesa', 0, 15, v => v + '%'),
    botas: () => '<span class="rpg-cmp up">👢 Andar <b>+15%</b> na mata e na gruta</span>',
    guaiaca: () => '<span class="rpg-cmp up">🪙 Moedas <b>+30%</b> dos bichos e baús</span>',
    lampiao: () => '<span class="rpg-cmp up">🔦 Luz <b>bem mais longe</b> na gruta</span>',
    bornal: () => rpgChip('🎒', 'Bornal', mataBagMax(), 6), bornal2: () => rpgChip('🎒', 'Bornal', mataBagMax(), 8), bornal3: () => rpgChip('🎒', 'Bornal', mataBagMax(), 12)
  }[id];
  return f ? f() : '';
}
function rpgCmpLonge(id) {
  const R = RANGED[id]; if (!R) return '';
  const atual = rpgLongeMelhor(), dano = +R.dmg || 0;
  return rpgChip('🎯', 'De longe ×', +atual.toFixed(2), +dano.toFixed(2), v => (+v).toFixed(1)) + (R.pierce ? '<span class="rpg-cmp up">🔱 atravessa a fila</span>' : '');
}

// ---------- A ficha ----------
function rpgSlot(rotulo, icone, nome, vazio) {
  return `<div class="rpg-slot${icone ? '' : ' vazio'}" title="${nome || vazio}"><span class="rpg-slot-art">${icone || ''}</span><small>${rotulo}</small><b>${nome || vazio}</b></div>`;
}
function rpgSlotsHTML() {
  const w = caveWeapon(), lv = weaponRefine(w.id), longe = typeof rangedWeapon === 'function' ? rangedWeapon() : null;
  const corpo = ['gibao', 'pala', 'poncho'].find(caveUp), costas = ['bornal3', 'bornal2', 'bornal'].find(caveUp);
  const up = id => CAVE_UPGRADES.find(u => u.id === id), icon = id => (typeof forgeUpgradeIcon === 'function' ? forgeUpgradeIcon(id) : '') || up(id)?.icon || '';
  return `<div class="rpg-slots">
    ${rpgSlot('Arma', forgeWeaponIcon(w.id), w.name + (lv ? ' +' + lv : ''), 'mão vazia')}
    ${rpgSlot('De longe', longe ? rangedIcon(longe) : '', longe ? RANGED[longe].name : '', 'nenhuma')}
    ${rpgSlot('Corpo', corpo ? icon(corpo) : '', corpo ? up(corpo).name : '', 'camisa de algodão')}
    ${rpgSlot('Cabeça', caveUp('chapeu') ? icon('chapeu') : '', caveUp('chapeu') ? up('chapeu').name : '', 'sem chapéu')}
    ${rpgSlot('Pés', caveUp('botas') ? icon('botas') : '', caveUp('botas') ? up('botas').name : '', 'alpargata')}
    ${rpgSlot('Cintura', caveUp('guaiaca') ? icon('guaiaca') : '', caveUp('guaiaca') ? up('guaiaca').name : '', 'sem guaiaca')}
    ${rpgSlot('Costas', costas ? icon(costas) : '', costas ? up(costas).name : '', 'bornal velho')}
    ${rpgSlot('Luz', caveUp('lampiao') ? icon('lampiao') : '', caveUp('lampiao') ? up('lampiao').name : '', 'vela')}
  </div>`;
}
function rpgRegioesHTML(pp = rpgPoder()) {
  return `<div class="rpg-regioes">${RPG_REGIOES.map(r => {
    const k = Math.min(1, pp / r.rec), st = pp >= r.rec ? 'ok' : k >= .8 ? 'quase' : 'longe';
    return `<div class="rpg-regiao ${st}"><span>${st === 'ok' ? '✔' : st === 'quase' ? '◐' : '✖'} ${r.nome}</span><small>${r.rec}</small><i style="--k:${Math.round(k * 100)}%"></i></div>`;
  }).join('')}</div>`;
}
// O que falta pra uma coisa: o material que falta e o dinheiro, ou "dá pra fazer agora".
function rpgFalta(needs = {}, cost = 0) {
  const falta = Object.entries(needs).filter(([k, q]) => bagQty(k) < q).map(([k, q]) => (q - Math.floor(bagQty(k))) + ' ' + bagName(k).toLowerCase());
  if (cost && !hasCash(cost)) falta.push(money(cost - G.cash) + ' a mais');
  return falta.length ? '<em class="miss">falta ' + falta.join(', ') + '</em>' : '<em class="ok">dá pra fazer agora!</em>';
}
function rpgProximos() {
  const out = [], cur = caveWeapon(), base = rpgDanoBase(cur), receita = id => typeof ILHA_RECEITAS === 'object' ? ILHA_RECEITAS.find(r => r.id === id) : null;
  const arma = CAVE_WEAPONS.filter(w => w.id !== 'lanca' && !weaponOwned(w.id) && w.dmg > base && (!w.griggs || G.ilha?.griggs && receita(w.id))).sort((a, b) => a.dmg - b.dmg)[0];
  if (arma) { const r = arma.griggs ? receita(arma.id) : arma; out.push(`<li>⚔ <b>${arma.name}</b> <span class="rpg-cmp up">dano ${caveDmg()} → ${caveDmg() - base + arma.dmg}</span><small>${arma.griggs ? 'John Griggs, na ilha' : 'São Dunstano (gruta) ou Garibaldi (mata)'} · ${rpgFalta(r.needs, r.cost)}</small></li>`); }
  const roupa = ['poncho', 'pala', 'gibao'].map(id => CAVE_UPGRADES.find(u => u.id === id)).find(u => u && !caveUp(u.id));
  if (roupa) out.push(`<li>❤ <b>${roupa.name}</b> ${rpgCmpUpgrade(roupa.id)}<small>${roupa.id === 'gibao' ? 'Forja (couro cru e ferro imperial vêm do pampa)' : 'São Dunstano ou Garibaldi'}${roupa.requires && !caveUp(roupa.requires) ? ' · antes: ' + CAVE_UPGRADES.find(u => u.id === roupa.requires).name : ' · ' + rpgFalta(roupa.needs, roupa.cost)}</small></li>`);
  if (!rangedOwned?.('revolver38')) out.push('<li>🎯 <b>Revólver 38</b> <span class="rpg-cmp up">tiro de longe que segura o bote</span><small>Garibaldi ou São Dunstano · ' + rpgFalta({}, RANGED.revolver38.cost) + '</small></li>');
  const acc = ['chapeu', 'cabo', 'comprida', 'botas', 'guaiaca', 'bornal'].map(id => CAVE_UPGRADES.find(u => u.id === id)).find(u => u && !caveUp(u.id));
  if (acc && out.length < 3) out.push(`<li>✦ <b>${acc.name}</b> ${rpgCmpUpgrade(acc.id)}<small>São Dunstano ou Garibaldi · ${rpgFalta(acc.needs, acc.cost)}</small></li>`);
  return out.slice(0, 3);
}
function rpgFichaHTML(grande = false) {
  const pp = rpgPoder(), at = rpgAtributos(), prox = rpgProximos();
  const col1 = `<div class="rpg-ficha-cab"><div><small>Sadi · peleador</small><b>Poder de peleia</b></div><strong class="rpg-pp">${pp}</strong></div>
    ${rpgSlotsHTML()}
    <div class="rpg-atributos">${at.map(([i, n, v]) => `<span><i>${i}</i>${n}<b>${v}</b></span>`).join('')}</div>`;
  const col2 = `<h4>Força que cada região pede</h4>${rpgRegioesHTML(pp)}
    ${prox.length ? `<h4>Pra ficar mais forte</h4><ul class="rpg-proximos">${prox.join('')}</ul>` : '<p class="rpg-pronto">Build completa: o Sadi tá pronto pra qualquer peleia.</p>'}
    ${grande ? '' : '<p class="rpg-dica">B abre o inventário com a ficha completa.</p>'}`;
  return grande ? `<div class="rpg-col">${col1}</div><div class="rpg-col">${col2}</div>` : col1 + col2;
}

// ---------- O balcão: abas e cartões ----------
const RPG_LOJAS = new Set(['dunstanShop', 'garibaldiShop', 'griggsShop']);
const RPG_CATS = [['armas', '⚔ Armas'], ['afiar', '✨ Afiar'], ['equip', '🛡 Equipamento'], ['bornal', '🎒 Bornal e munição'], ['outros', '✦ Outros']];
function rpgCatDe(titulo) {
  const t = titulo.toLowerCase();
  if (/muni|bala|bolicho|cura|bornal/.test(t)) return 'bornal';
  if (/afiar|fio|golpe/.test(t)) return 'afiar';
  if (/equipamento|ferradura/.test(t)) return 'equip';
  if (/arma|rev[oó]lver|arp[aã]o|carabina|lan[cç]a|sabre|fazer/.test(t)) return 'armas';
  return 'outros';
}
const rpgAbaLoja = {};
function rpgSelo(btn) {
  if (!btn) return ['', ''];
  const t = btn.textContent.trim(), off = btn.disabled;
  if (/na m[aã]o/i.test(t)) return ['equipado', 'Equipado'];
  if (btn.dataset.act === 'forjaEquip') return ['teu', 'Teu'];
  if (/na m[aã]o|no cavalo/i.test(t)) return ['equipado', 'Equipado'];
  if (/✔|j[aá] [eé] teu|m[aá]ximo/i.test(t)) return ['teu', 'Teu'];
  if (/bloquead|antes/i.test(t)) return ['bloq', 'Bloqueado'];
  if (/cheio/i.test(t)) return ['teu', 'Cheio'];
  if (off) return ['falta', 'Falta material'];
  if (btn.classList.contains('primary')) return ['pode', 'Disponível'];
  return ['', ''];
}
function rpgDecoraCartao(card) {
  if (card.dataset.rpg) return; card.dataset.rpg = 1;
  const btns = [...card.querySelectorAll('button[data-act]')], b = btns.find(x => x.classList.contains('primary')) || btns[0] || card.querySelector('button');
  let act = b?.dataset.act, id = b?.dataset.id, tier = -1, cmp = '';
  // A arma que está na mão vem sem ação no botão ("✔ Na mão"): acha ela pelo nome.
  const nome = card.querySelector(':scope > div b')?.textContent || '';
  if (!act && /na m[aã]o/i.test(b?.textContent || '')) { const w = CAVE_WEAPONS.find(x => nome.startsWith(x.name)); if (w) { act = 'forjaEquip'; id = w.id; } }
  const W = id && CAVE_WEAPONS.find(w => w.id === id);
  if (['forjaMake', 'forjaEquip'].includes(act) && W) { tier = rpgTierArma(W.dmg); if (act === 'forjaMake' || caveWeapon().id !== id) cmp = rpgCmpArma(W); }
  else if (act === 'griggsFaz' && W) { tier = rpgTierArma(W.dmg); if (!weaponOwned(id)) cmp = rpgCmpArma(W); }
  else if ((act === 'griggsFaz' || act === 'rangedBuy') && RANGED[id]) { tier = RPG_TIER_LONGE[id] ?? 1; if (!rangedOwned(id)) cmp = rpgCmpLonge(id); }
  else if (act === 'facaoBuy') { const u = CAVE_UPGRADES.find(x => x.id === id); if (u) { tier = rpgTierPreco(u.cost || 0); if (!caveUp(id)) cmp = rpgCmpUpgrade(id); } }
  else if (act === 'forjaAfiar') { tier = 2; cmp = rpgChip('⚔', 'Dano', caveDmg(), caveDmg() + 3); }
  else if (act === 'griggsAfia' || act === 'pampaMelhora') tier = 3;
  else if (act === 'ferraduraForjar') tier = 1;
  const [selo, seloTxt] = rpgSelo(b);
  if (tier >= 0) { card.classList.add('tier-' + tier); card.querySelector(':scope > div b')?.insertAdjacentHTML('afterend', `<span class="rpg-tier">${RPG_TIERS[tier]}</span>`); }
  if (cmp) card.querySelector(':scope > div')?.insertAdjacentHTML('beforeend', `<div class="rpg-cmps">${cmp}</div>`);
  if (selo) { card.classList.add('selo-' + selo); card.insertAdjacentHTML('afterbegin', `<span class="rpg-selo">${seloTxt}</span>`); }
}
function rpgLojaMonta() {
  const box = $('dialogContent'), dlg = box.closest('.dialog'); if (!box || box.querySelector(':scope > .rpg-loja')) return;
  dlg.classList.add('rpg-janela');
  const titulo = $('dialogTitle').textContent, nodes = [...box.children];
  const loja = document.createElement('div'); loja.className = 'rpg-loja';
  const ficha = document.createElement('aside'); ficha.className = 'rpg-ficha'; ficha.innerHTML = rpgFichaHTML();
  const balcao = document.createElement('div'); balcao.className = 'rpg-balcao';
  const topo = document.createElement('div'); topo.className = 'rpg-balcao-topo';
  const abas = document.createElement('nav'); abas.className = 'rpg-abas';
  const panes = new Map(); let atual = null; const fim = [];
  for (const n of nodes) {
    if (n.matches('.rpg-speaker')) continue;
    if (n.matches('h3.forja-sec')) {
      const cat = rpgCatDe([...n.childNodes].filter(c => c.nodeName !== 'SMALL').map(c => c.textContent).join('')); if (!panes.has(cat)) { const p = document.createElement('section'); p.className = 'rpg-pane'; p.dataset.cat = cat; panes.set(cat, p); }
      atual = panes.get(cat); atual.appendChild(n); continue;
    }
    if (n.matches('.actions')) { fim.push(n); continue; }
    if (atual) atual.appendChild(n); else topo.appendChild(n);
  }
  const speaker = box.querySelector(':scope > .rpg-speaker');
  box.innerHTML = '';
  if (speaker) { speaker.classList.add('rpg-mercador'); box.appendChild(speaker); }
  balcao.appendChild(topo);
  if (panes.size) {
    const cats = [...panes.keys()], escolhida = cats.includes(rpgAbaLoja[titulo]) ? rpgAbaLoja[titulo] : cats[0];
    for (const cat of cats) {
      const p = panes.get(cat), n = p.querySelectorAll('button.primary[data-act]:not([disabled])').length, label = RPG_CATS.find(c => c[0] === cat)?.[1] || cat;
      abas.insertAdjacentHTML('beforeend', `<button type="button" class="${cat === escolhida ? 'active' : ''}" data-act="rpgAba" data-id="${cat}">${label}${n ? `<i class="rpg-pode">${n}</i>` : ''}</button>`);
      p.classList.toggle('rpg-off', cat !== escolhida); balcao.appendChild(p);
    }
    balcao.insertBefore(abas, panes.get(cats[0]));
  }
  for (const n of fim) balcao.appendChild(n);
  loja.append(ficha, balcao); box.appendChild(loja);
  for (const c of box.querySelectorAll('.forja-card')) rpgDecoraCartao(c);
}
function rpgAba(cat) {
  const box = $('dialogContent'), titulo = $('dialogTitle').textContent; rpgAbaLoja[titulo] = cat;
  for (const b of box.querySelectorAll('.rpg-abas button')) b.classList.toggle('active', b.dataset.id === cat);
  for (const p of box.querySelectorAll('.rpg-pane')) p.classList.toggle('rpg-off', p.dataset.cat !== cat);
  AudioEngine.tick?.();
}

// ---------- Aviso ao entrar numa região pesada demais ----------
function rpgRegiaoDoMapa(to) {
  const m = to?.map; if (!m) return null;
  if (m === 'trecho') return (to.trecho || 0) >= 10 ? 'funda' : 'mata';
  if (m === 'laguna') return 'funda';
  if (m === 'caverna') return (caveState().floor || 1) >= 10 ? 'gruta' : null;
  if (['ilha', 'ilhamato', 'masmorra'].includes(m)) return 'ilha';
  if (m === 'pampa') return 'pampa';
  return null;
}
function rpgAvisoRegiao(to) {
  const id = rpgRegiaoDoMapa(to), r = RPG_REGIOES.find(x => x.id === id); if (!r || !started) return;
  const pp = rpgPoder(); if (pp >= r.rec * .85) return;
  G.rpgAvisos ??= {}; if (G.rpgAvisos[id] === G.day) return; G.rpgAvisos[id] = G.day;
  showBanner('⚠ Peleia braba pela frente', `Teu poder de peleia é ${pp}; ${r.nome} pede ${r.rec}. Aperte B pra ver a ficha e o que falta melhorar.`, 'info', { world: true });
}

// ---------- Ligações ----------
{
  const open = openDialog; openDialog = function (title, html, type = 'menu') {
    const r = open(title, html, type);
    const dlg = $('dialogContent')?.closest('.dialog'); dlg?.classList.toggle('rpg-janela', RPG_LOJAS.has(type) || type === 'worldStore' && title === 'Inventário' || type === 'caveBag');
    if (RPG_LOJAS.has(type)) { try { rpgLojaMonta(); } catch (e) { console.error(e); } }
    return r;
  };
  const act = action; action = function (name, id) { if (name === 'rpgAba') { rpgAba(id); return; } return act(name, id); };
  const sm = switchMap; switchMap = function (to) { const r = sm(to); try { rpgAvisoRegiao(to); } catch (e) { } return r; };
}
