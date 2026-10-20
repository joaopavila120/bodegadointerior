'use strict';

function alcoholRound(g,team=null){
 ensureDiners(g);
 const drinks=['cerveja','cachaca','bitter'].filter(unlocked);
 for(const d of g.diners){
  if(team&&PEOPLE[d.person].team!==team)continue;
  if(d.status!=='waiting'){d.status='waiting';d.patience=d.maxPatience=ORDER_WAIT;}
  d.orders.push(PEOPLE[d.person]?.onlyChopp?'cerveja':pick(drinks));
 }
 g.state='seated';g.paid=false;g.round=1;syncGroupOrders(g);
}
function finishHouseTournament(){
 const t=G.tournament;if(!t||t.finished)return false;
 const groups=G.groups.filter(g=>g.tournament&&g.state!=='leave');
 if(groups.some(g=>!['seated','chat'].includes(g.state)))return false;
 for(const pair of t.pairs)pair.points??=0;
 const highest=Math.max(...t.pairs.map(p=>p.points)),pair=pick(t.pairs.filter(p=>p.points===highest));
 if(!pair)return false;
 t.finished=true;t.winnerPair=pair.id;t.winner=pick(pair.members);
 for(const g of groups){G.tables.find(table=>table.id===g.table).fight=null;alcoholRound(g);}
 const names=pair.members.map(sportName).join(' e ');
 say('Campeões do truco: '+names+'! '+sportName(t.winner)+' paga uma rodada para todo mundo.');
 openDialog('Campeões do truco!',`<p>A dupla <b>${escapeHTML(names)}</b> ganhou o campeonato com ${highest} vitórias.</p><p>${escapeHTML(sportName(t.winner))} paga uma rodada de cerveja, cachaça ou bitter para todos os presentes. Sirva os pedidos dos balões antes de encerrar o expediente.</p><button data-act="close">Servir a rodada dos campeões</button>`,'celebration');save();return true;
}
function scoreHouseRound(){
 const t=G.tournament;if(!t||t.finished)return;
 for(const g of G.groups.filter(g=>g.tournament&&g.pairs?.length===2)){const winner=t.pairs[pick(g.pairs)];if(winner)winner.points=(winner.points||0)+1;}
}
function finishFootball(){
 const e=G.event;if(!isFootball()||e.fired.result)return false;
 const home=e.id==='inter'?'inter':'gremio';
 const result=e.result??(Math.random()<.15?'empate':e.id==='grenal'?pick(['gremio','inter']):Math.random()<.6?home:'visitante');
 e.result=result;e.fired.result=true;
 const celebrating=result==='gremio'||result==='inter';
 if(e.id==='grenal'&&celebrating){
  for(const c of G.shop)if(c.state!=='leave'&&PEOPLE[c.person].team!==result){c.state='leave';setDestination(c,EXIT);}
  for(const g of [...G.groups]){
   if(g.state==='leave')continue;ensureDiners(g);
   const keep=[];
   g.diners.forEach((d,i)=>{
    if(PEOPLE[d.person].team===result){keep.push(d);return;}
    const p=groupSeatPosition(g,i),actor={id:G.next++,person:d.person,state:'leave',...p,path:[],dest:null};
    setDestination(actor,EXIT);G.shop.push(actor);
    G.stats.waste+=d.delivered.reduce((sum,item)=>sum+(item.cost||0),0);
   });
   g.diners=keep;g.members=keep.map(d=>d.person);g.size=keep.length;
   if(!keep.length){const table=G.tables.find(t=>t.id===g.table);if(table){table.group=null;table.dirty=table.plates>0;table.fight=null;}G.groups=G.groups.filter(other=>other!==g);}
   else{g.person=g.members[0];syncGroupOrders(g);}
  }
  resetQueuePaths();
 }
 if(celebrating)for(const g of G.groups.filter(g=>g.state!=='leave'&&g.members.some(p=>PEOPLE[p].team===result))){const table=G.tables.find(t=>t.id===g.table);if(table)table.fight=null;if(['seated','chat'].includes(g.state))alcoholRound(g,result);else g.celebrationTeam=result;}
 const text=result==='empate'?'O jogo terminou empatado.':result==='visitante'?'O visitante venceu. Hoje não teve rodada de comemoração.':(result==='gremio'?'Grêmio':'Inter')+' venceu! A torcida pede uma rodada de bebidas alcoólicas.'+(e.id==='grenal'?' A torcida rival está indo embora.':'');
 say(text);openDialog('Apito final na TV',`<p>${text}</p><button data-act="close">Continuar o atendimento</button>`,'celebration');save();return true;
}
function dailyFinale(){
 if(G.event.id==='campeonato')return finishHouseTournament();
 if(isFootball())return finishFootball();return false;
}
function toastLessonTick(){
 const t=G.toastLesson;if(!t||t.done||G.day<t.day||G.phase!=='open'||tutorialActive())return false;
 if(t.actor&&!G.groups.some(g=>g.id===t.actor&&g.state!=='leave'))t.actor=null;
 // Liberou o salame: a lição vem no mesmo dia, assim que o Sadi estiver dentro da bodega aberta.
 if(!t.actor&&worldOut)return false;
 if(!t.actor){
  // Este pedido tem prioridade sobre todas as chegadas do novo dia.
  if(championshipActive()){
   const g=G.groups.find(g=>g.tournament);if(!g)return true;
   g.fixedOrders=['torrada'];g.toastLesson=true;g.training=true;t.actor=g.id;
  }else{
   const g=spawnGroup({size:1,fixedOrders:['torrada'],training:true,toastLesson:true});if(!g)return true;t.actor=g.id;
  }
  t.introduced=true;
  openDialog('Primeira torrada de salame','<p><b>Pegue um pão de xis e coloque na chapa junto do salame.</b></p><p>Use E para deixar o pão em um espaço livre da chapa. Busque salame no balcão e aperte E no mesmo espaço. Aguarde 6 segundos e retire com as mãos livres. Entregue a torrada ao cliente indicado. Também é possível fazer na prensa.</p><p>Este pedido não tem prazo. Novos clientes aguardam até você concluir esta lição.</p><button data-act="close">Preparar a torrada</button>','toastLesson');save();
 }
 return true;
}
function finishToastLesson(g,item){
 if(!g.toastLesson||item.pid!=='torrada')return;
 G.toastLesson.done=true;g.training=false;g.toastLesson=false;save();
}
function useToastGrill(index){
 const grill=G.kitchen.grill,i=grill[index],h=held();
 if(i?.waitingToast){
  if(!h){putHeld(i);i.ready=!!i.toastWasReady;delete i.toastWasReady;delete i.waitingToast;grill[index]=null;save();return true;}
  if(!['pao_xis','salame'].includes(h.key)||h.key===i.key||h.spoiled||h.burned){say('Coloque pão e salame no mesmo espaço da chapa.');return true;}
  const extra=takeHeld();mergeLife(i,extra);Object.assign(i,{key:'torrada',pid:'torrada',kind:'product',cost:i.cost+extra.cost,heat:0,ready:false,waitingToast:false,perfect:true});AudioEngine.sizzle();save();return true;
 }
 if(!i&&G.up.salame&&h&&['pao_xis','salame'].includes(h.key)&&!h.spoiled&&!h.burned){grill[index]=takeHeld();grill[index].waitingToast=true;grill[index].toastWasReady=!!h.ready;grill[index].ready=false;say('Agora traga '+(h.key==='pao_xis'?'salame':'pão')+' para este mesmo espaço.');save();return true;}
 return false;
}
