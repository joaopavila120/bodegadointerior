'use strict';

// Cada lugar mantém seu pedido, pagamento e prazo. O grupo só libera a mesa ao final.
function syncGroupOrders(g){
 g.orders=g.diners.flatMap(d=>d.status==='waiting'?d.orders:[]);
 g.delivered=g.diners.flatMap(d=>d.delivered);
 const pending=g.diners.filter(d=>d.status==='waiting');
 g.patience=pending.length?Math.min(...pending.map(d=>d.patience)):0;
 g.maxPatience=ORDER_WAIT;
}
function ensureDiners(g){
 if(g.diners)return;
 g.diners=Array.from({length:g.size},(_,i)=>({person:groupPerson(g,i),orders:[],delivered:[],patience:g.patience??ORDER_WAIT,maxPatience:ORDER_WAIT,status:'served'}));
 (g.orders||[]).forEach((k,i)=>{const d=g.diners[i%g.size];d.orders.push(k);d.status='waiting';});
 if(g.delivered?.length)g.diners[0].delivered=[...g.delivered];
 syncGroupOrders(g);
}
// Cada pessoa pede um item por vez: os outros da mesa pensam alguns segundos
// antes do primeiro pedido, e o próximo item só sai depois da entrega anterior.
const THINK_FIRST=[2,7],THINK_NEXT=[7,16];
function thinkTime([a,b]){return a+Math.random()*(b-a);}
function orderNext(d,g){
 let k=d.later.shift();
 // Xis só se pede quando dá para montar: se acabou um ingrediente, a pessoa escolhe outro xis ou passa a vez.
 if(RECIPES[k]&&!xisReady(k)){const other=readyRecipes();k=other.length?pick(other):null;}
 // Bebida ou petisco em falta: reclama e fica sem.
 if(k&&!RECIPES[k]&&!orderableFree(k)){missingComplaint(PEOPLE[d.person]?.name,k,g?.x??ENTRY.x,(g?.y??ENTRY.y)-80);repChange(-1);k=null;}
 if(!k){d.orders=[];d.status=d.later?.length?'thinking':'served';d.think=thinkTime(THINK_NEXT);return;}
 d.orders=[k];d.status='waiting';d.patience=d.maxPatience=Math.round(ORDER_WAIT*difficulty().patience);
}
function seatDiners(g){
 const fixed=g.fixedOrders;delete g.fixedOrders;
 g.diners=Array.from({length:g.size},(_,i)=>{
  const all=fixed?fixed.filter((_,j)=>j%g.size===i):tableOrders({...g,person:groupPerson(g,i),size:1}).map(k=>fitOrder(groupPerson(g,i),k));
  // Encomendas fixas e lições chegam completas; a freguesia comum pede aos poucos.
  if(fixed||g.training)return {person:groupPerson(g,i),orders:all,later:[],delivered:[],patience:ORDER_WAIT,maxPatience:ORDER_WAIT,status:all.length?'waiting':'served'};
  const d={person:groupPerson(g,i),orders:[],later:all,delivered:[],patience:ORDER_WAIT,maxPatience:ORDER_WAIT,status:'thinking',think:i===0?0:thinkTime(THINK_FIRST)};
  if(!all.length)d.status='served';else if(i===0)orderNext(d,g);return d;
 });syncGroupOrders(g);if(g.celebrationTeam){const team=g.celebrationTeam;delete g.celebrationTeam;alcoholRound(g,team);}
}
function addDinerRound(g){
 ensureDiners(g);
 for(const d of g.diners){
  if(d.status==='lost')continue;
  // Quem ainda tem pedido em aberto deixa a rodada para depois.
  if(['waiting','thinking'].includes(d.status)){d.later??=[];if(d.later.length<difficulty().maxItems)d.later.push(fitOrder(d.person,pick(drinksForGroup(g))));continue;}
  d.status='waiting';d.patience=d.maxPatience=ORDER_WAIT;d.orders=[fitOrder(d.person,pick(drinksForGroup(g)))];
 }
 g.state='seated';g.round=1;syncGroupOrders(g);
}
function completeDinerRound(g){
 syncGroupOrders(g);if(g.diners.some(d=>['waiting','thinking'].includes(d.status)))return;
 if(g.tournament&&championshipActive()){tournamentRest(g);return;}
 if(g.diners.every(d=>d.status==='lost')){departGroup(g);return;}
 const t=G.tables.find(t=>t.id===g.table);g.state='chat';g.chat=g.training?1:9+Math.random()*5;g.paid=true;
}
function tickDiners(g,dt){
 ensureDiners(g);
 for(const d of g.diners){
  if(d.status==='thinking'){
   // Depois que as portas fecham, ninguém pede mais nada.
   if(G.phase!=='open'||!d.later?.length){d.later=[];d.status='served';continue;}
   d.think-=dt;if(d.think<=0){orderNext(d,g);syncGroupOrders(g);}continue;
  }
  if(d.status==='waiting'&&!g.training)dropUnservable(d,g);
  if(d.status!=='waiting')continue;d.patience=Math.max(0,d.patience-(g.training?0:dt));if(d.patience>0)continue;
  d.status='lost';d.orders=[];d.later=[];G.stats.lost++;repChange(-2.5);
  G.stats.waste+=d.delivered.reduce((sum,item)=>sum+(item.cost||0),0);d.delivered=[];
  effect(PEOPLE[d.person].name+': desisti do pedido',g.x,g.y-80,'#e7b097');fxAnger(g.x,g.y-130);
 }
 completeDinerRound(g);
}
// Acabou o produto de um pedido em aberto: o freguês reclama e desiste daquele item na hora, em vez de ficar esperando
// até o fim do prazo. O que já recebeu, ele paga.
function dropUnservable(d,g){
 const gone=d.orders.filter(k=>unservable(k));if(!gone.length)return;
 for(const k of gone){d.orders.splice(d.orders.indexOf(k),1);missingComplaint(PEOPLE[d.person]?.name,k,g.x,g.y-80);repChange(-1);}
 if(d.orders.length)return;
 if(d.delivered.length){pay(d.delivered,d.person,d.patience/d.maxPatience,true,g.x,g.y);d.delivered=[];}
 d.status=d.later?.length&&G.phase==='open'?'thinking':'served';d.think=thinkTime(THINK_NEXT);
}
function deliverToDiner(g,item,table){
 ensureDiners(g);
 const d=g.diners.filter(d=>d.status==='waiting'&&d.orders.includes(item.pid)).sort((a,b)=>a.patience-b.patience)[0];
 if(!d){say('A mesa espera '+g.orders.map(nameOf).join(' e ')+'.');return;}
 const seat=groupSeatPosition(g,g.diners.indexOf(d));
 takeHeld({x:seat.x,y:seat.y-65});d.orders.splice(d.orders.indexOf(item.pid),1);d.delivered.push(item);table.plates++;G.tutorial.table=true;
 if(RECIPES[item.pid])G.tutorial.xis=true;AudioEngine.tick();
 if(!d.orders.length){pay(d.delivered,d.person,d.patience/d.maxPatience,true,g.x,g.y);d.delivered=[];d.status=d.later?.length&&G.phase==='open'&&!g.training?'thinking':'served';d.think=thinkTime(THINK_NEXT);}
 finishToastLesson(g,item);deliveryConversation(d.person,g,d);tutorialDelivered(g,item.pid);completeDinerRound(g);save();
}
function renderTableOrders(){
 const host=$('tableOrders');if(!host)return;
 const groups=G.groups.filter(g=>['seated','chat'].includes(g.state));
 host.innerHTML=groups.length?groups.map(g=>{ensureDiners(g);return `<section class="table-ticket"><b>Mesa ${g.table+1} · ${g.size}/4 lugares</b>${g.diners.map(d=>`<div class="diner-ticket ${d.status}"><span>${escapeHTML(PEOPLE[d.person].name)}</span><strong>${d.status==='waiting'?Math.ceil(d.patience)+' s':d.status==='served'?'✓ Pago':'Desistiu'}</strong><small>${d.orders.map(nameOf).join(' + ')|| (d.status==='served'?'Aproveitando a prosa':'Pedido cancelado')}</small>${d.status==='waiting'?`<progress max="${d.maxPatience}" value="${d.patience}" aria-label="Tempo de ${escapeHTML(PEOPLE[d.person].name)}"></progress>`:''}</div>`).join('')}</section>`;}).join(''):'<p class="muted">Os pedidos aparecem aqui quando os fregueses sentam. Cada pessoa tem seu prazo.</p>';
}
