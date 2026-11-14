// O inventário no jeito RPG (B, o botão do bornal na peleia e o ícone da horta abrem). Abas:
//   · Ficha: o que está equipado em cada parte do corpo, os atributos, o poder de peleia, a força que cada região pede
//     e o que melhorar em seguida (rpg-loja.js).
//   · Bornal: o que cura e o que ajuda na briga (bornal da mata, bornal da gruta e as frutas), com "Usar" onde der.
//   · Materiais: minério, couro, prata, madeira… com pra que serve cada um e quanto vale.
//   · Bodega: o estoque do balcão e da cozinha.
//   · Lembranças: troféus, relíquias, enfeites da casa e o álbum.
// Cada aba é uma grade de espaços com a quantidade no canto; clicar num espaço mostra o detalhe ao lado.
'use strict';

const RPG_INV_ABAS = [['ficha', '🧍 Ficha'], ['bornal', '🎒 Bornal'], ['materiais', '⛏ Materiais'], ['bodega', '🏚 Bodega'], ['lembrancas', '🏆 Lembranças']];
const rpgInv = { aba: 'ficha', sel: null };
function rpgInvNaCaverna() { return typeof inCave === 'function' && inCave(); }

// ---------- O que tem em cada aba ----------
function rpgUsosDe(k) {
  const usa = [...CAVE_WEAPONS.filter(w => !weaponOwned(w.id) && w.needs?.[k]), ...CAVE_UPGRADES.filter(u => !caveUp(u.id) && u.needs?.[k])];
  if (typeof ILHA_RECEITAS === 'object') usa.push(...ILHA_RECEITAS.filter(r => r.needs?.[k] && !(typeof ilhaArmaFeita === 'function' && ilhaArmaFeita(r.id))));
  return [...new Set(usa.map(x => x.name))];
}
function rpgItensBornal() {
  const out = [], mata = mataBag(), cave = caveBag(), cinto = typeof mataBeltItems === 'function' ? mataBeltItems() : [];
  const podeMata = !rpgInvNaCaverna() && typeof mataHere === 'function' && mataHere(), podeBriga = !!worldOut && (podeMata || rpgInvNaCaverna() || typeof inArena === 'function' && inArena());
  for (const f of (typeof HEAL_FRUITS === 'object' ? HEAL_FRUITS : [])) { const q = fruitQty(f.id); if (q > 0) out.push({ key: 'fruta:' + f.id, nome: f.name, icon: itemIconHTML(f.id), qtd: q, desc: f.desc, tipo: 'Cura', usar: podeBriga && 'fruta:' + f.id }); }
  for (const it of MATA_ITEMS) { const q = mata[it.id] || 0; if (q > 0) { const n = cinto.findIndex(x => x.id === it.id); out.push({ key: 'mata:' + it.id, nome: it.name, icon: mataGearHTML(it.id, 48), qtd: q, max: mataBagMax(it.id), desc: it.desc + (n >= 0 ? ` <b>Tecla ${n + 1}</b> na mata.` : ''), tipo: it.cura ? 'Cura' : 'Bornal da mata', usar: podeMata && 'mata:' + it.id }); } }
  for (const it of CAVE_ITEMS) { const q = cave[it.id] || 0; if (q > 0) out.push({ key: 'cave:' + it.id, nome: it.name, icon: caveItemIcon(it), qtd: q, max: caveBagMax(), desc: it.desc, tipo: 'Bornal da gruta', usar: rpgInvNaCaverna() && 'cave:' + it.id }); }
  return out;
}
function rpgItensMateriais() {
  const frutas = new Set((typeof HEAL_FRUITS === 'object' ? HEAL_FRUITS : []).map(f => f.id));
  return Object.keys(bagState()).filter(k => !frutas.has(k) && bagQty(k) > 0).map(k => {
    const R = BAG_RAW[k], usos = rpgUsosDe(k), q = bagQty(k);
    return { key: 'mat:' + k, nome: bagName(k), icon: bagIcon(k), qtd: bagBulk(k) ? formatWeight(q) : Math.floor(q), desc: (R?.note || '') + (usos.length ? `<br><b>A forja ainda usa em:</b> ${usos.join(', ')}.` : ''), tipo: usos.length ? 'Material de forja' : 'Material', valor: R?.value ? money(R.value) + ' cada' : '' };
  });
}
function rpgItensBodega() {
  return Object.keys(GOODS).filter(k => unlocked(k) && (G.stock[k] || 0) > 0 && !GOODS[k].removed).map(k => ({ key: 'loja:' + k, nome: nameOf(k), icon: itemIconHTML(k), qtd: stockText(k), desc: GOODS[k].cat === 'Cozinha' ? 'Vai pra chapa e pra montagem do xis.' : 'Fica no balcão pra vender.', tipo: GOODS[k].cat || 'Bodega', valor: GOODS[k].price ? 'vende por ' + money(GOODS[k].price) : '' }));
}
function rpgItensLembrancas() {
  const out = (typeof lembrancas === 'function' ? lembrancas() : []).map(id => ({ key: 'lem:' + id, nome: typeof HOME_KEEPSAKE_NAMES === 'object' && HOME_KEEPSAKE_NAMES[id] || 'Lembrança', icon: '<span class="slot-emoji">🏆</span>', qtd: '', desc: 'Fica na prateleira de lembranças da sua casa.', tipo: 'Lembrança' }));
  if (typeof CASA_ENFEITES === 'object') for (const e of CASA_ENFEITES) if (casaTem(e.id)) out.push({ key: 'casa:' + e.id, nome: e.name, icon: `<span class="slot-emoji">${e.icon}</span>`, qtd: '', desc: e.desc + ' Escolha se fica à mostra na estante de Coleções e retratos da sua casa.', tipo: 'Enfeite da casa' });
  if (typeof CARDS === 'object') out.push({ key: 'album', nome: 'Álbum de figurinhas', icon: '<span class="slot-emoji">🃏</span>', qtd: cardsOwned() + '/' + CARDS.length, desc: 'As figurinhas que o Sadi juntou pelo caminho. O álbum abre pelo celular.', tipo: 'Coleção' });
  return out;
}
function rpgItensDa(aba) { return aba === 'bornal' ? rpgItensBornal() : aba === 'materiais' ? rpgItensMateriais() : aba === 'bodega' ? rpgItensBodega() : aba === 'lembrancas' ? rpgItensLembrancas() : []; }

// ---------- A tela ----------
function rpgInvDetalhe(it) {
  if (!it) return '<div class="rpg-detalhe vazio"><p>Escolha um espaço pra ver o que é.</p></div>';
  return `<div class="rpg-detalhe"><div class="rpg-detalhe-art">${it.icon}</div><small>${it.tipo || ''}</small><h3>${it.nome}</h3>
    ${it.qtd !== '' ? `<p class="rpg-detalhe-qtd">Tem: <b>${it.qtd}</b>${it.max ? ' de ' + it.max : ''}</p>` : ''}
    <p>${it.desc || ''}</p>${it.valor ? `<p class="rpg-detalhe-valor">🪙 ${it.valor}</p>` : ''}
    ${it.usar ? `<button class="primary" data-act="invUsar" data-id="${it.usar}">Usar agora</button>` : it.tipo === 'Cura' || /Bornal/.test(it.tipo || '') ? '<p class="small-note">Usa no meio da peleia: na mata, na gruta, na ilha ou no pampa.</p>' : ''}</div>`;
}
function rpgInvHTML() {
  const aba = rpgInv.aba, abas = `<nav class="rpg-abas">${RPG_INV_ABAS.map(([id, label]) => { const n = id === 'ficha' ? '' : rpgItensDa(id).length; return `<button type="button" class="${aba === id ? 'active' : ''}" data-act="invAba" data-id="${id}">${label}${n ? `<i class="rpg-qtd">${n}</i>` : ''}</button>`; }).join('')}</nav>`;
  const bolsa = `<div class="rpg-bolsa"><span>🪙 <b>${money(G.cash)}</b></span><span>❤ <b>${Math.round(caveState().hp)}/${caveMaxHp()}</b></span><span>⚔ Poder de peleia <b>${rpgPoder()}</b></span></div>`;
  if (aba === 'ficha') return `<div class="rpg-inv">${bolsa}${abas}<div class="rpg-ficha rpg-ficha-grande">${rpgFichaHTML(true)}${rpgPoderesHTML()}</div></div>`;
  const itens = rpgItensDa(aba), sel = itens.find(i => i.key === rpgInv.sel) || itens[0];
  const vazios = Math.max(0, 20 - itens.length);
  const grade = itens.map(i => `<button type="button" class="rpg-cel${i === sel ? ' sel' : ''}" data-act="invSel" data-id="${i.key}" title="${i.nome}"><span class="rpg-cel-art">${i.icon}</span>${i.qtd !== '' ? `<em>${i.qtd}</em>` : ''}${i.usar ? '<i class="rpg-usavel">●</i>' : ''}</button>`).join('') + '<span class="rpg-cel vazia"></span>'.repeat(vazios);
  const vazio = itens.length ? '' : `<p class="small-note">${{ bornal: 'Bornal vazio. Garibaldi, São Dunstano, Griggs e o seu Zeferino vendem cura e coisa de briga.', materiais: 'Nenhum material ainda. Minério sai da gruta; couro, prata e madeira saem dos bichos e dos baús.', bodega: 'O estoque da bodega está vazio.', lembrancas: 'Nenhuma lembrança ainda.' }[aba]}</p>`;
  return `<div class="rpg-inv">${bolsa}${abas}${vazio}<div class="rpg-inv-corpo"><div class="rpg-grade">${grade}</div>${rpgInvDetalhe(sel)}</div></div>`;
}
function rpgPoderesHTML() {
  if (typeof PODERES !== 'object') return '';
  const lista = Object.keys(PODERES), benz = typeof poderBenzido === 'function' ? poderBenzido : () => false;
  return `<h4>Poderes</h4><div class="rpg-poderes">${lista.map(id => { const P = PODERES[id], tem = poderHas(id); return `<div class="rpg-poder${tem ? '' : ' falta'}" title="${tem ? P.desc : PODER_DICAS[id] || ''}"><span>${P.icon}</span><b>${P.name}${benz(id) ? ' ✨' : ''}</b><small>${tem ? P.desc : 'Como ganhar: ' + (PODER_DICAS[id] || '…')}</small></div>`; }).join('')}</div>`;
}
function rpgInventario(aba = rpgInv.aba, sel = null) {
  rpgInv.aba = aba; if (sel) rpgInv.sel = sel;
  const naGruta = rpgInvNaCaverna();
  openDialog(naGruta ? 'Bornal da caverna' : 'Inventário', rpgInvHTML(), naGruta ? 'caveBag' : 'worldStore');
}
function rpgInvUsar(id) {
  const [tipo, k] = String(id).split(':'), aba = rpgInv.aba, sel = rpgInv.sel;
  if (tipo === 'cave') { caveUse(k); rpgInventario(aba, sel); return; }
  closeDialog(true);
  if (tipo === 'mata') mataUseItem(k);
  else if (tipo === 'fruta') butiaUse(() => caveState().hp, caveMaxHp, () => { mataBeltRefresh?.(); caveBeltRefresh?.(); }, k);
  rpgInventario(aba, sel);
}

// ---------- Ligações ----------
{
  showBag = function () { rpgInventario(rpgInvNaCaverna() ? 'bornal' : rpgInv.aba); };
  openCaveBag = function () { rpgInventario('bornal'); };
  const act = action; action = function (name, id) {
    if (name === 'invAba') { rpgInventario(id); return; }
    if (name === 'invSel') { rpgInventario(rpgInv.aba, id); return; }
    if (name === 'invUsar') { rpgInvUsar(id); return; }
    return act(name, id);
  };
  // B de novo fecha o inventário (na gruta, a forja já faz isso).
  document.addEventListener('keydown', e => {
    if (e.repeat || e.key.toLowerCase() !== 'b' || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (modal === 'worldStore' && $('dialogTitle').textContent === 'Inventário') { e.preventDefault(); e.stopImmediatePropagation(); closeDialog(true); }
  }, true);
}
