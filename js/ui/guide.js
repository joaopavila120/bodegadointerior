'use strict';

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function drawCharacterPortrait(context,sprite,x,y,height){
 const s=characterCrop(sprite),art=typeof sprite==='object'?CHARACTER_ART[sprite.file]:peopleArt;if(!art?.complete||!art.naturalWidth)return;
 const width=height*s.w/s.h,t=context.getTransform();context.imageSmoothingEnabled=true;
 context.drawImage(characterFrame(sprite,height*Math.hypot(t.a,t.b)),x-width/2,y-height,width,height);
}
function initializeCharacterChoice(){
 // Sempre começa com o Sadi; outros personagens são liberados pela amizade máxima.
 const c=$('avatarPreview');if(c)drawCharacterPortrait(c.getContext('2d'),0,c.width/2,c.height-4,c.height-8);
}
const UPGRADE_TABS=['Botas','Mate','Cozinha','Balcão','Outros'];
let upgradeTab='Cozinha';
function upgradeCategory(u){if(GEAR[u.id])return 'Botas';if(u.id.startsWith('mate'))return 'Mate';if(['bacon','coracao','grill3','coffee'].includes(u.id))return 'Cozinha';if(u.goods||['cigarro_py','placaFiado'].includes(u.id))return 'Balcão';return 'Outros';}
// Ícone de cada melhoria: sprite do produto que ela libera ou um ícone próprio.
const UPGRADE_ICONS={trago:'item:cachaca',coffee:'cambona',bootsGaucho:'bota_gaucho',bootsBagual:'bota_bagual',mateCuiudo:'mate:1',mateTopetudo:'mate:2',mateLendario:'mate:3',cigarro_py:'item:cigarro_py',table3:'mesa',table4:'mesa',tray:'bandeja',pepino:'item:pepino',bergamota:'item:bergamota',amendoim:'item:amendoim',salame:'item:salame',pinhao:'item:pinhao',bitter:'item:bitter',capacity:'estoque',bacon:'item:bacon',grill3:'chapa',coracao:'item:coracao',placaFiado:'placa_fiado',bodoque:'bodoque'};
function upgradeIconHTML(id){
 const icon=UPGRADE_ICONS[id];if(!icon)return '';const[kind,arg]=icon.split(':');
 if(kind==='item')return `<span class="upgrade-icon">${itemIconHTML(arg)}</span>`;
 if(kind==='emoji')return `<span class="upgrade-icon"><span class="bag-emoji">${arg}</span></span>`;
 if(kind==='mate')return `<span class="upgrade-icon">${itemIconHTML('mate:'+arg)}</span>`;
 if(icon==='placa_fiado')return `<span class="upgrade-icon">${itemIconHTML('placa_fiado')}</span>`;
 return `<span class="upgrade-icon"><img src="assets/images/icons/${icon}.png" alt="" draggable="false"></span>`;
}
function upgradeCatalog(){
 // Na etapa do tutorial, abre direto na aba da Mesa de tragos.
 const tab=tutorialActive()&&tutorialStep().id==='upgrade'?upgradeCategory(UPGRADES.find(u=>u.id==='trago')):upgradeTab;
 return `<div class="phone-cat upgrade-cats">${UPGRADE_TABS.map(c=>`<button class="${tab===c?'active':''}" data-act="upgradeTab" data-id="${c}">${c}</button>`).join('')}</div>`+({Botas:bootsPanel(),Mate:matePanel(),Outros:tablePanel()}[tab]||'')+[tab].map(category=>`<div class="upgrade-category">${UPGRADES.filter(u=>upgradeCategory(u)===category&&!(u.shop&&physicalShopping())).map(u=>{
  const missing=[];if(!tutorialUpgradeAllowed(u.id))missing.push('concluir a etapa do tutorial');if(bodegaLevel()<(u.level||1))missing.push('nível '+u.level);if(G.rep<u.rep)missing.push('reputação '+u.rep);if(!hasCash(u.cost))missing.push(money(u.cost));if(u.requires&&!G.up[u.requires])missing.push(UPGRADES.find(v=>v.id===u.requires).name);
  return `<div class="upgrade"><h3>${upgradeIconHTML(u.id)}${u.name}</h3><p>${u.desc}</p><p>${u.level>1?'Nível '+u.level+' · ':''}Reputação ${u.rep} · ${money(u.cost)}${u.requires?' · requer '+UPGRADES.find(v=>v.id===u.requires).name:''}</p><button class="primary" data-act="upgrade" data-id="${u.id}" ${G.up[u.id]||missing.length?'disabled':''}>${G.up[u.id]?'Já é da casa':missing.length?'Falta: '+missing.join(' + '):u.cost===0?'Instalar grátis':'Comprar melhoria'}</button></div>`;
 }).join('')}</div>`).join('');
}
function guideContent(){
 return `<div class="callout"><b>${escapeHTML(G.bodegaName)} · ${PEOPLE.find(p=>p.id===G.avatarId)?.name||'Sadi'}</b> · ${improvementCount()} melhorias · ${decorCount()} de ${DECOR.length} peças de decoração</div>${achievementsHTML()}
 <div class="guide-grid">
 ${tourismJournalHTML()}
 <article class="panel"><h3>Atendimento</h3><p>Balcão: ${COUNTER_WAIT} s de paciência. Mesas: ${ORDER_WAIT} s por pessoa, e cada um paga o que recebeu. A reputação sobe devagar com atendimento rápido e cai rápido com desistências, brigas, derrotas no truco e na bocha e portas fechadas cedo; reputação alta traz mais gente e gorjetas maiores. Com os dias chegam grupos maiores e pedidos com mais itens.</p><button data-act="help">Receitas e controles</button></article>
 <article class="panel"><h3>Dinheiro</h3><p>A mercadoria do fornecedor deixa uma margem de mais ou menos metade do preço; o que sai da roça (pão, queijo, salada, ovos, erva) custa quase nada e rende muito mais. Gorjeta é um pedaço da conta: atendimento rápido, ponto perfeito e freguês da casa aumentam. Todo dia tem luz e manutenção da casa, que crescem com a bodega. Abrir dias seguidos rende o extra da freguesia fiel. O Armazém compra a colheita, mas paga bem menos que o balcão.</p></article>
 <article class="panel"><h3>Dinheiro</h3><p>Sem aluguel: o galpão é herança do vô. No fim do dia sai a luz; no costelão, lenha e sal. O fiado fica no caderninho do celular. O estoque não estraga.</p></article>
 <article class="panel"><h3>Semana gaúcha</h3><p>Quarta tem futebol na TV; sábado, baile ou campeonato de truco; domingo, costelão no campo. A bodega abre e fecha no caixa; dormir no caixa passa o dia. Os outros dias são sorteados.</p><button data-act="event">Programação do dia</button></article>
 <article class="panel"><h3>Laçada e costelão</h3><p>Laçada: ${LASSO_HITS} laços certeiros laçam um boi, que rende ${MANTAS_PER_BOI} mantas; Q laça e Espaço esquiva do quero-quero. Costelão: acenda o fogo com lenha rachada, asse as mantas virando os lados e corte no peso. Sobras vão fora no fim do dia.</p></article>
 <article class="panel"><h3>Truco e bocha</h3><p>Truco na mesa fixa: Y joga com quem está sentado. Bocha pela porta da cancha, à direita: melhor de 3 rodadas. Os dois pausam o atendimento e podem valer aposta.</p></article>
 <article class="panel"><h3>Pênaltis no campinho</h3><p>Na Serra Gaúcha, chegue perto do campo e aperte E. Escolha um personagem especial para uma série de cinco cobranças, com alternadas em caso de empate. WASD mira, Q/E dá efeito e segurar/soltar Espaço define a força. Na vez do rival, escolha o lado e aperte Espaço para defender. Há controles por toque; o expediente fica pausado e a partida é salva.</p></article>
 <article class="panel"><h3>Contatos e presentes</h3><p>Todo dia aparece um personagem especial. Com amizade ele vira contato, traz presentes ao fim do dia e, no máximo de afeto, dá para jogar com ele.</p></article>
 <article class="panel"><h3>Melhorias e Estética</h3><p>Melhorias se compram nas lojas: Ferragem da Fronteira (móveis, cozinha, balcão) e Casa do Campeiro (botas e bodoque). Algumas pedem nível ou reputação. Decoração, quadros e guardar ou reinstalar os móveis: no caixa do balcão, em Personalizar bodega.</p></article>
 </div><div class="actions"><button data-act="caderno">📖 Caderno do vô · ${receitasFound()}/${RECEITAS.length}</button><button data-act="album">🃏 Álbum de cartas · ${cardsOwned()}/${CARDS.length}</button><button class="primary" data-act="close">Voltar à bodega</button></div>`;
}
function gameGuide(){if(G.game||G.bocce)return;openDialog('Guia e progresso',guideContent(),'guide');}
