// O Caminho da peleia: um mapa claro de como o Sadi evolui, pro jogador nunca ficar perdido sem saber
// o que falta pra ficar mais forte.
//   · No "Guia e progresso" (botão da barra ou Esc): a lista inteira, com o que já foi feito e o próximo passo
//     destacado, sempre dizendo ONDE se consegue cada coisa.
//   · Dicas no caminho: ao entrar numa área pesada sem o equipamento da vez (mata funda sem poncho, cerração sem
//     arpão, pampa sem gibão), um lembrete aparece uma vez por dia dizendo onde buscar.
'use strict';

function caminhoEtapas() {
  const cs = typeof caveState === 'function' ? caveState() : {}, up = id => typeof caveUp === 'function' && caveUp(id);
  const rw = id => typeof rangedOwned === 'function' && rangedOwned(id), ph = id => typeof poderHas === 'function' && poderHas(id);
  const wo = id => typeof weaponOwned === 'function' && weaponOwned(id);
  const i = G?.ilha || {}, p = G?.pampa || {}, m = G?.mata || {};
  return [
    { done: !!cs.facao, t: 'Ganhar o facão do vô', o: 'O seu Olmiro, o tropeiro, devolve no capítulo 2 (de noite, na rua da Fronteira).' },
    { done: !!G?.olmiroMel?.entregue || !!cs.facao && !G?.missions?.melOlmiro, t: 'Levar um pote de mel pro Olmiro', o: 'Mata adentro, pela picada do leste do pinheiral: a colmeia fica num tronco logo no começo da trilha. O Olmiro acampa na entrada do pinheiral.' },
    { done: !!G.up?.bodoque, t: 'Ganhar o bodoque do Garibaldi', o: 'Visite o rancho do Garibaldi, na Mata de Araucárias.' },
    { done: up('poncho'), t: 'Vestir o poncho (vida 140)', o: 'Ferraria do São Dunstano, na gruta da Serra.' },
    { done: typeof bornalNivel === 'function' && bornalNivel() >= 1, t: 'Comprar o primeiro bornal', o: 'Ferraria do São Dunstano: cabe mais item de cura.' },
    { done: rw('revolver38'), t: 'Comprar o revólver 38', o: 'O Garibaldi e o São Dunstano vendem, com caixa de bala.' },
    { done: !!m.laguna?.won, t: 'Vencer o navio do Império em Laguna', o: 'Siga a missão do Garibaldi pela mata: dá o Grito farroupilha.' },
    { done: ph('gralhas'), t: 'Replantar 3 clareiras de tocos', o: 'Nos trechos da mata: a gralha-azul traz o bando.' },
    { done: ph('lunar'), t: 'Achar a cruz missioneira do Sepé', o: 'O Sepé espera no fogo do trecho 21 da mata.' },
    { done: ph('benzedura'), t: 'Livrar a Doralice da Mula sem Cabeça', o: 'Capítulo do Padre Romio, na igreja da Serra (quinta à noite).' },
    { done: up('pala'), t: 'Vestir o pala (vida 180)', o: 'Forja, com o que a mata e a gruta dão.' },
    { done: !!i.griggs, t: 'Conhecer o John Griggs na ilha', o: 'O seu Nereu leva até a Ilha da Fortaleza, de Santa Catarina.' },
    { done: wo('sabre'), t: 'Forjar o sabre de abordagem', o: 'Com o Griggs: pedaços de sabre caem dos marinheiros da fortaleza.' },
    { done: rw('arpao'), t: 'Fazer o arpão de baleeiro', o: 'Com o Griggs: prende as bruxas na corda (elas nem fogem).' },
    { done: rw('carabina'), t: 'Fazer a carabina', o: 'Com o Griggs: tiro forte e comprido, com cartucho próprio.' },
    { done: ph('monge'), t: 'Aprender a reza do monge João Maria', o: 'Na fogueira da mata da cerração, subindo a ilha.' },
    { done: !!i.bruxaMor, t: 'Derrubar a Bruxa-mor', o: 'Na clareira de cinzas, trecho 4 da cerração.' },
    { done: !!i.bernunciaMae, t: 'Derrubar a Bernúncia-mãe', o: 'Trecho 7 da cerração, na subida do alto.' },
    { done: !!i.grenfell, t: 'Vencer o almirante Grenfell', o: 'Na fortaleza, no alto da ilha: a chave da cripta cai dele.' },
    { done: up('gibao'), t: 'Vestir o gibão de couro farrapo (vida 230)', o: 'Na forja, com couro cru e ferro imperial do pampa.' },
    { done: !!p.sargento, t: 'Passar pelo Sargento Recolhedor', o: 'O pampa começa depois da Serra: siga as taipas.' },
    { done: !!p.boi, t: 'Acalmar o Boi Barroso', o: 'Na mangueira de pedra do pampa.' },
    { done: !!p.capitao, t: 'Vencer o capitão de cavalaria', o: 'Perto do palanque: é o caminho até Porongos.' }
  ];
}
function caminhoProximo() { return caminhoEtapas().find(e => !e.done) || null; }
function caminhoPeleiaHTML() {
  const etapas = caminhoEtapas(), feito = etapas.filter(e => e.done).length;
  let proximoAchado = false;
  const linhas = etapas.map(e => {
    const proximo = !e.done && !proximoAchado; if (proximo) proximoAchado = true;
    return `<div class="caminho-etapa${e.done ? ' feita' : ''}${proximo ? ' proxima' : ''}"><span>${e.done ? '✔' : proximo ? '➜' : '○'}</span><div><b>${e.t}</b>${proximo ? `<small>${e.o}</small>` : ''}</div></div>`;
  }).join('');
  const chefes = typeof chefesVencidos === 'function' ? chefesVencidos() : 0;
  return `<div class="callout">🗡️ <b>Caminho da peleia</b> · ${feito}/${etapas.length} passos · chefes grandes vencidos: ${chefes} (cada um dá +10 ❤)</div><div class="caminho-lista">${linhas}</div>`;
}

// ---------- Dicas no caminho (uma por dia, cada uma) ----------
function caminhoDica(to) {
  if (!to?.map || !started || typeof caveUp !== 'function') return;
  G.caminhoDicas ??= {}; const d = G.caminhoDicas;
  const diz = (k, msg) => { if (d[k] === G.day) return; d[k] = G.day; floatNote(msg, 'reminder'); };
  const trecho = to.trecho || (typeof mataState === 'function' ? mataState().trecho : 0) || 0;
  if (to.map === 'trecho' && trecho >= 8 && !caveUp('poncho')) diz('poncho', '🧥 A mata funda bate forte: o poncho do São Dunstano (gruta da Serra) sobe a vida pra 140.');
  if (to.map === 'trecho' && trecho >= 14 && typeof bornalNivel === 'function' && bornalNivel() < 1) diz('bornal', '🎒 O bornal do São Dunstano leva mais chá de marcela: compra antes de descer mais fundo.');
  if (to.map === 'ilhamato' && G.ilha?.griggs && typeof weaponOwned === 'function' && !weaponOwned('sabre')) diz('sabre', '⚔️ O sabre do Griggs pega cheio nos bichos da ilha: pedaço de sabre cai dos marinheiros da fortaleza.');
  if (to.map === 'ilhamato' && typeof rangedOwned === 'function' && !rangedOwned('arpao')) diz('arpao', '🔱 Bruxa foge e some no meio da luta: o arpão do Griggs prende ela na corda.');
  if (to.map === 'pampa' && !caveUp('gibao')) diz('gibao', '🧥 O pampa é o fim do caminho: o gibão de couro farrapo (vida 230) se faz na forja, com couro cru e ferro imperial.');
  if (to.map === 'pampa' && typeof bornalNivel === 'function' && bornalNivel() < 2) diz('alforje', '🎒 No bolicho do seu Zeferino tem costela de fogo de chão; com o alforje de campanha dá pra levar bem mais.');
}

// ---------- Ligações ----------
{
  const gc = guideContent; guideContent = function () { return gc() + caminhoPeleiaHTML(); };
  const sm = switchMap; switchMap = function (to) { const r = sm(to); try { caminhoDica(to); } catch (e) { } return r; };
}
