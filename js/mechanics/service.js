// Atendimento no balcão, entrega de pedidos nas mesas e pagamentos
'use strict';

// Porta da frente: perto dela, E abre ou fecha a bodega (no lugar do antigo botão lateral).
function shopDoorDistance(){return Math.hypot(G.player.x-ENTRY.x,G.player.y-(ENTRY.y-15));}
function nearShopDoor(){if(!started||worldOut||G.lasso||G.bocce||G.atCancha||scene)return false;const d=shopDoorDistance(),n=nearest();return d<75&&(!n||d<n.d+10);}
function shopDoorLabel(){return ['open','closing'].includes(G.phase)&&!prologueActive()?'Porta · encerre o expediente no caixa para sair':'Sair para o pátio';}
// A porta só leva para fora. Com o expediente aberto, não dá para largar a freguesia: primeiro encerre no caixa.
function doorExit(){if(['open','closing'].includes(G.phase)&&!prologueActive()){warnDialog('A bodega está aberta','Com o expediente aberto não dá para sair: a freguesia ficaria sozinha. Vá ao <b>caixa</b> (o balcão de atendimento), encerre o expediente e depois saia pela porta.');return;}goOutside();}
// Caixa da bodega: abrir e encerrar o expediente. O descanso fica na cama de casa.
function caixaMenu(){
 if(prologueActive()){warnDialog('Caixa da bodega','A prateleira ainda está vazia. Agora: <b>'+prologueStep().title.toLowerCase()+'</b>.');return;}
 const e=eventInfo(),tut=tutorialActive(),btn=[];let note='';
 if(G.phase==='prep'){
  note=G.event.noCostelao?'<p class="small-note">🔥 Sem costelão hoje: falta manta, boi e dinheiro. O domingo vira um dia normal.</p>':`<p class="small-note">💡 ${e.prep}</p>`;
  if(!tut){const b=loyalNext();note+=b?`<p class="small-note">🤝 Freguesia fiel: abrindo hoje, +${money(b)} no fechamento.</p>`:'';}
  if(!tut&&bodegaLevel()>1)note+=`<p class="small-note">⭐ Fama da bodega (nível ${bodegaLevel()}): tudo vende ${Math.round((fameBonus()-1)*100)}% mais caro.</p>`;
  btn.push('<button class="primary" data-act="caixaOpen">Abrir a bodega</button>');
 }else if(G.phase==='open'){const fila=G.shop.filter(c=>c.state==='queue').length+G.groups.length;note='<p>Expediente aberto. '+(tut?'Hoje o expediente termina sozinho depois das lições.':'Encerrar fecha as portas: quem já chegou ainda é atendido'+(fila?' ('+fila+(fila>1?' fregueses esperando)':' freguês esperando)'):'')+'.')+'</p>';if(!tut)btn.push('<button class="primary" data-act="caixaClose">Encerrar o expediente</button>');}
 else if(G.phase==='closing'){note='<p>Portas fechadas: atenda quem já chegou, ou encerre de vez.</p>';btn.push('<button class="danger" data-act="caixaClose">Encerrar agora (cancela os pedidos)</button>');}
 else{note='<p>A bodega já fechou hoje: abrir de novo, só amanhã. Para dormir, vá até a cama da sua casa, ao lado da bodega.</p>';if(G.report)btn.push('<button data-act="caixaReport">Ver o caixa de hoje</button>');}
 if(G.testMode||G.eventMode)btn.push('<button data-act="testSkip" data-id="1">⏭ Pular 1 dia (teste)</button><button data-act="testSkip" data-id="7">⏭ Pular 7 dias (teste)</button>');
 if(!tut)btn.push('<button data-act="personalizar">🎨 Personalizar bodega</button>');
 if(!tut&&G.staffUnlocked)btn.push('<button data-act="staffMenu">👥 Ajudantes</button>');
 btn.push('<button data-act="close">Voltar</button>');
 const me=mapEventToday();if(me&&!me.st.done)note+=`<p class="small-note">${me.def.icon} De noite: <b>${me.def.name}</b> · ${me.def.place.split(',')[0]}</p>`;
 openDialog('Caixa da bodega',`<div class="event-card"><span class="event-symbol">${e.icon}</span><div><h3>Dia ${dayNumber()} · ${calendar().name}</h3><p><b>${e.name}</b></p></div></div>${note}<div class="actions">${btn.join('')}</div>`,'caixa');
}
function interact(){if(!started||paused||modal||phoneOpen||G.task)return;if(worldOut){outsideInteract();return;}if(nearCanchaDoor()){enterCancha();return;}if(nearShopDoor()){doorExit();return;}const n=nearest();if(!n){effect('Chegue mais perto',G.player.x,G.player.y-52);return;}if(n.kind==='floor'){pickupFloor(n.obj);return;}if(n.kind==='shop'){if(!held()){caixaMenu();return;}serveShop(n.obj);return;}if(campoInteract(n))return;if(returnToSource(n.id))return;const[id,arg]=n.id.split(':');if(id==='bin')takeFromBin(arg);else if(id==='forno')useForno();else if(id==='tacho')useTacho();else if(id==='conservas')useConservas();else if(id==='bottle')readyProduct(arg);else if(id==='shop'){if(bulk(arg))startWeigh(arg,n.id);else readyProduct(arg);}else if(id==='tap')startHold('pour',n.id);else if(id==='coffee')startHold('coffee',n.id);else if(id==='grill')useGrill(Number(arg));else if(id==='bench')useBench(Number(arg));else if(id==='press')usePress();else if(id==='parking')useParking(Number(arg));else if(id==='trash')trash();else if(id==='bag')startHold('bag',n.id);else if(id==='pour'||id==='bitter')startHold('pour',n.id);else if(id==='mate')startHold('mate',n.id);else if(id==='service')serveCounter(Number(arg)||0);else if(id==='puddle')startHold('mop',n.id);else if(id==='table')interactTable(Number(arg));refreshHUD();}

function interactTable(id){const table=G.tables.find(t=>t.id===id);if(!table)return;if(table.fight){beginFight(table);return;}if(isTableTruco(table)&&!table.group&&!table.dirty){cardsMenu();return;}if(table.dirty&&!table.group){if(held()){say('Libere as mãos e segure E para limpar.');return;}startHold('clean','table:'+id);return;}const g=G.groups.find(g=>g.id===table.group);if(!g){effect('Mesa livre',table.x+table.w/2,table.y-20);return;}if(g.state==='walkTable'){effect('O grupo está chegando',table.x+table.w/2,table.y-20);return;}if(g.state==='chat'){effect('Bah, caprichado!',g.x,g.y-65,'#f9df9b');return;}if(g.state!=='seated')return;const i=held();if(!validForDelivery(i))return;deliverToDiner(g,i,table);}


// Mãos vazias no balcão: o caixa (encerrar o expediente mesmo com freguês na fila). Com o pedido na mão: entrega.
function serveCounter(index=0){const c=queuedShop()[index];if(!held()){caixaMenu();return;}if(!c){say('Balcão livre: ninguém esperando por esse pedido.');return;}if(Math.hypot(c.x-c.dest.x,c.y-c.dest.y)>18){say('O freguês está chegando ao balcão.');return;}serveShop(c);}

function pay(items,person,patience,tipOK=true,x=G.player.x,y=G.player.y,credit=false){const revenue=items.reduce((n,i)=>n+salePrice(i),0),cost=items.reduce((n,i)=>n+i.cost,0),perfect=items.some(i=>i.perfect);for(const i of items)if(i.pid==='costela')G.costelaSold=(G.costelaSold||0)+(i.weight||0);G.regulars[person]=(G.regulars[person]||0)+1;const regular=G.regulars[person]>=3,tip=credit||!tipOK?0:tipFor(revenue,patience,perfect,regular);if(credit)recordFiado(person,revenue);else{G.cash=round(G.cash+revenue+tip);G.stats.revenue+=revenue;}G.stats.cogs+=cost;G.stats.tips+=tip;G.stats.served++;G.stats.satisfaction+=clamp(55+patience*40+(perfect?5:0),0,100);G.totalServed++;G.xp+=12+(perfect?5:0);repChange(.25+(patience>.6?.35:patience>.3?.15:0)+(perfect?.2:0));addFriendship(person,2);if(!credit){AudioEngine.register();burst(x,y-40,'coin');showPaymentFeedback(revenue+tip,tip);}if(patience>.6||perfect)fxHearts(x,y-115,perfect?3:2);if(G.regulars[person]===3){say(PEOPLE[person].name+' virou freguês da casa! ♥ Gorjeta extra permanente.');AudioEngine.heart();}save();}

// Gorjeta: um percentual da conta. Atendimento rápido 8% (no prazo 4%), ponto perfeito +4%, freguês da casa +4%;
// a reputação ajusta (de 60% a 110%). Arredonda para R$ 0,50.
function tipFor(revenue,patience,perfect,regular){const pct=(patience>.6?.08:patience>.35?.04:0)+(perfect?.04:0)+(regular?.04:0);return pct?Math.max(.5,Math.round(revenue*pct*clamp(.6+G.rep/200,.6,1.1)*2)/2):0;}
function validForDelivery(i){if(!i||i.kind!=='product'){say('Traga um pedido pronto no espaço selecionado.');return false;}if(i.spoiled||i.burned){say('Esse produto não pode ser servido. Leve à lixeira.');return false;}return true;}
