// Gestão de clientes, fila do balcão, ocupação de mesas e pedidos
'use strict';

function availableTables(){if(isCampo())return [];return G.tables.filter(t=>!t.unlock||G.up[t.unlock]);}

// No costelão há dois balcões: os dois primeiros da fila são atendidos ao mesmo tempo.
function counterCount(){return isCampo()?2:1;}
function queuedShop(){return G.shop.filter(c=>c.state==='queue');}
function atCounter(c){return queuedShop().indexOf(c)<counterCount();}
function queueSpot(index,shop=false){if(shop&&isCampo())return index<2?{x:[1105,1290][index],y:868}:{x:1000-(index-2)*70,y:868};return shop?{x:1250-index*72,y:868}:{x:880,y:830-index*60};}

function resetQueuePaths(){let i=0;for(const g of G.groups.filter(g=>g.state==='wait'))setDestination(g,queueSpot(i++));G.shop.filter(c=>c.state==='queue').forEach((c,j)=>setDestination(c,queueSpot(j,true)));}

function arrivalInterval(kind){const shop=kind==='shop',e=G.event.id;let n=shop?(firstDay()?27:19):(firstDay()?65:57);if(e==='chuva')n*=.78;if(isFootball())n*=shop?.9:.72;if(e==='feira')n*=shop?.7:1.4;if(e==='campeonato')n*=shop?1.15:.48;if(e==='geada')n*=shop?1.05:.85;if(e==='baile')n*=G.elapsed<75?.63:2.4;if(e==='costelao')n*=shop?.42:1;return n*repArrival()*difficulty().pace;}
// Xis só entra no pedido quando dá para montar: todos os ingredientes na despensa.
function xisReady(k){return RECIPES[k].parts.every(p=>(G.stock[p]||0)>0);}
function readyRecipes(){return Object.keys(RECIPES).filter(k=>(!RECIPES[k].unlock||G.up[RECIPES[k].unlock])&&xisReady(k));}
// Produto pedido e em falta: o freguês reclama, sai chateado e a bodega perde um pouco de reputação.
function missingComplaint(name,k,x,y){effect((name?name+': ':'')+'não tem '+nameOf(k).toLowerCase()+'? Bah…',x,y,'#ffb3a0');fxAnger(x,y+20);AudioEngine.bad();G.stats.missing=(G.stats.missing||0)+1;teach('falta');}

function spawnShop(options={}){if(championshipActive())return;if(isCampo()&&!options.pid&&firstCostelao()){if(campoState().firstOrders>=FIRST_COSTELAO_ORDERS||!(G.stock.costela_crua>0||G.stock.costela>0||campoState().espetos.some(Boolean)))return;options={...options,pid:'costela',grams:pick([500,1000]),extra:maioneseAvailable()?['maionese']:undefined,firstCostelao:true};}
 if(isCampo()&&!options.pid){const pid=campoOrder();if(!pid)return;options={...options,pid,grams:bulk(pid)?pick(bulk(pid).weights):undefined,extra:pid==='costela'&&maioneseAvailable()&&Math.random()<.6?['maionese']:undefined};}if(G.phase!=='open'||G.shop.filter(c=>c.state==='queue').length>=(firstDay()?2:isCampo()?6:4))return;const shelf=Object.keys(GOODS).filter(k=>(GOODS[k].cat==='Balcão'||k==='cafe')&&unlocked(k)&&!GOODS[k].noSupplier),choices=shelf.filter(k=>orderableFree(k,bulk(k)?bulk(k).weights[0]:1)),lacking=shelf.filter(k=>!choices.includes(k));if(!choices.length&&!lacking.length&&!options.pid)return;let person=pickVisitor();if(person===null)return;if(options.pid&&(PEOPLE[person].onlyChopp&&options.pid!=='cerveja'||options.pid==='cigarro'&&specialOpponent(person)))person=pick(visitorPool(isFootball()&&G.event.id!=='grenal'?G.event.id:null).filter(i=>!PEOPLE[i].onlyChopp&&(options.pid!=='cigarro'||!specialOpponent(i))&&visitorAvailable(i)));if(person===undefined)return;const allowedChoices=choices.filter(k=>k!=='cigarro'||!specialOpponent(person)),allowedLacking=lacking.filter(k=>k!=='cigarro'||!specialOpponent(person));let wantsMissing=!options.pid&&!options.training&&!firstDay()&&allowedLacking.length>0&&(!allowedChoices.length||Math.random()<difficulty().missing);if(!allowedChoices.length&&!wantsMissing&&!options.pid)return;const habit=PEOPLE[person].retailFav;let key=options.pid||(wantsMissing?pick(allowedLacking):G.elapsed<50&&allowedChoices.includes('cigarro')&&(G.shopVisits===0||Math.random()<.7)?'cigarro':allowedChoices.includes(habit)&&Math.random()<.3?habit:pick(allowedChoices));if(!options.pid&&!wantsMissing){const fit=fitOrder(person,key);if(fit!==key&&orderableFree(fit))key=fit;}if(PEOPLE[person].onlyChopp){key='cerveja';wantsMissing=!orderableFree(key);options={...options,extra:undefined,grams:undefined};}const weights=bulk(key)?.weights.filter(n=>wantsMissing||orderableFree(key,n));if(weights&&!weights.length&&options.grams==null)return;const grams=options.grams??(weights?pick(weights):null);const customer={id:G.next++,person,pid:key,missing:!!wantsMissing,extra:options.extra?[...options.extra]:undefined,got:[],grams,challenge:grams?makeChallenge(grams):null,x:ENTRY.x,y:ENTRY.y,path:[],dest:null,state:'queue',patience:COUNTER_WAIT*(options.extra?1.35:1)*(options.training?1:difficulty().patience),maxPatience:COUNTER_WAIT*(options.extra?1.35:1)*(options.training?1:difficulty().patience),training:!!options.training,fiado:options.fiado??(!options.training&&wantsFiado(person))};G.shop.push(customer);if(options.firstCostelao)campoState().firstOrders++;G.shopVisits++;resetQueuePaths();announceArrivals([person]);return customer;}

function orderList(c){return [c.pid,...(c.extra||[])];}
function serveShop(c){if(!atCounter(c))return;const i=held();if(!validForDelivery(i))return;const want=orderList(c);if(!want.includes(i.pid)){say('O pedido é '+want.map(nameOf).join(' + ')+'.');return;}if(bulk(i.pid)&&Math.abs((i.weight||bulk(i.pid).unit)-c.grams)>weightTolerance(c.grams,c.challenge)){say('Este pedido quer '+formatWeight(c.grams)+'. Pese o pacote na faixa indicada.');AudioEngine.bad();return;}takeHeld({x:c.x,y:c.y-65});
 // Pedido em dobro (costela + maionese): guarda o que chegou e espera o resto.
 if(want.length>1){c.got=[...(c.got||[]),i];if(i.pid===c.pid)c.pid=c.extra.shift();else c.extra.splice(c.extra.indexOf(i.pid),1);if(!c.extra.length)delete c.extra;AudioEngine.tick();effect('Falta '+nameOf(c.pid),c.x,c.y-150,'#fff2b0');save();return;}
 const items=[...(c.got||[]),i];G.tutorial.shop=true;if(c.fiado&&fiadoTotal()+salePrice(i)>creditLimit()){c.fiado=false;say('Caderninho no limite: '+PEOPLE[c.person].name+' pagou à vista.');}pay(items,c.person,c.patience/c.maxPatience,true,c.x,c.y,c.fiado);deliveryConversation(c.person,c);tutorialDelivered(c,i.pid);costelaoTutorialDelivered(c);c.state='leave';c.dest=null;setDestination(c,EXIT);resetQueuePaths();save();}

function spawnGroup(options={}){
 if(isCampo())return null;
 if(championshipActive()&&G.tournament&&!options.tournament)return null;
 if(G.phase!=='open'||!options.dailyTruco&&G.groups.filter(g=>g.state!=='leave').length>=availableTables().length+(firstDay()?1:3))return null;
 const requested=options.members?.[0]??options.person,person=requested!==undefined&&visitorAvailable(requested)?requested:pickVisitor();if(person===null)return null;
 const size=clamp(options.size??Math.max(G.event.id==='campeonato'?2:1,restaurantGroupSize(person)),1,4);
 let members=groupMembers(person,size);
 if(options.members){members=[];for(let i=0;i<size;i++){const candidate=options.members[i];members.push(visitorAvailable(candidate,members)?candidate:pickVisitor(members));}}
 // Ninguém disponível para uma vaga: o grupo fica menor, sem lugar vazio.
 members=members.filter(i=>Number.isInteger(i));if(!members.length)return null;
 const g={id:G.next++,x:ENTRY.x,y:ENTRY.y,path:[],dest:null,state:'wait',table:null,reserved:false,orders:[],delivered:[],patience:ORDER_WAIT,maxPatience:ORDER_WAIT,waitLeft:110,age:0,chat:0,round:0,paid:false,...options,person:members[0],size:members.length,members};
 G.groups.push(g);assignTables();announceArrivals(members);return g;
}

function assignTables(){for(const g of G.groups.filter(g=>g.state==='wait')){const t=availableTables().sort((a,b)=>(a.seatings||0)-(b.seatings||0)).find(t=>!t.group&&!t.dirty&&!t.fight&&t.seats>=g.size&&(g.targetTable===undefined||t.id===g.targetTable));if(!t)continue;t.seatings=(t.seatings||0)+1;t.group=g.id;g.table=t.id;g.state='walkTable';g.reserved=true;setDestination(g,{x:t.x+t.w/2,y:t.y+t.h+39});}resetQueuePaths();}

// Grupo na fila só por causa de mesa suja: tem mesa vazia (sem ninguém sentado nem briga) que serviria, mas está suja.
function dirtyTableFor(g){return availableTables().find(t=>t.dirty&&!t.group&&!t.fight&&t.seats>=g.size&&(g.targetTable===undefined||t.id===g.targetTable))||null;}
const DIRTY_COMPLAIN=5,DIRTY_GIVEUP=26,DIRTY_SHOUT='Vão limpar as mesas pra gente sentar ou não, tchê!';
// Primeiro reclamam; com a mesa ainda suja, a bodega perde reputação e alguns desistem (true: o grupo foi embora).
function dirtyTableWait(g,dt){
 if(g.shoutT>0)g.shoutT-=dt;
 if(G.phase!=='open'||g.tournament||!dirtyTableFor(g)){g.dirtyWait=0;g.dirtyShoutAt=null;return false;}
 g.dirtyWait=(g.dirtyWait||0)+dt;
 // Um de cada vez: se outro grupo está reclamando, este espera um pouco pra não encavalar os balões.
 if(g.dirtyWait>=(g.dirtyShoutAt??DIRTY_COMPLAIN)){if(G.groups.some(o=>o!==g&&o.shoutT>0))g.dirtyShoutAt=g.dirtyWait+3;else{g.dirtyShoutAt=g.dirtyWait+12;g.shout=DIRTY_SHOUT;g.shoutT=4.5;fxAnger(g.x,g.y-150);AudioEngine.bad();if(!g.training)teach('mesas');}}
 if(g.training||g.dirtyWait<DIRTY_GIVEUP)return false;
 repChange(-1);dirtyNotice();
 if(Math.random()<.5){departGroup(g,true);return true;}
 g.dirtyWait=DIRTY_GIVEUP-14;g.dirtyShoutAt=g.dirtyWait+3;return false;
}
const dirtyNote={day:0,t:-99};
function dirtyNotice(){if(dirtyNote.day===G.day&&G.elapsed-dirtyNote.t<20)return;dirtyNote.day=G.day;dirtyNote.t=G.elapsed;floatNote('Clientes estão desistindo pois não tem mesas limpas','reminder');}

function tableOrders(g){
 if(g.fixedOrders){const a=g.fixedOrders;delete g.fixedOrders;return [...a];}
 const table=G.tables.find(t=>t.id===g.table),drinks=drinkPool(),snacks=snackPool(),d=difficulty(),cards=G.event.id==='campeonato';
 const recipes=readyRecipes();
 let first;if(cards)first=pick(Math.random()<.5&&snacks.length?snacks:alcoholPool());

 else first=recipes.length&&Math.random()<.35?pick(recipes):snacks.length&&Math.random()<.35?pick(snacks):pick(drinks);
 const orders=[first];if(d.maxItems>=2&&Math.random()<(G.day<5?.35:.75))orders.push(pick(cards?alcoholPool():drinks));
 if(d.maxItems===3&&Math.random()<.35&&snacks.length)orders.push(pick(snacks));return orders;
}

function customersTick(dt){for(const c of G.shop){if(c.state==='queue'){moveActor(c,dt);if(!c.complained&&atCounter(c)&&!c.path?.length&&(c.missing?!orderable(c.pid,c.grams||1):!isCampo()&&!c.training&&orderList(c).some(k=>unservable(k,k===c.pid&&c.grams||1)))){c.complained=true;c.patience=Math.min(c.patience,2.2);missingComplaint(PEOPLE[c.person]?.name,c.pid,c.x,c.y-150);}c.patience-=(c.training?0:dt)*(atCounter(c)?1:.45);if(c.patience<=0){c.state='leave';c.dest=null;setDestination(c,EXIT);repChange(c.complained?-1.5:-2.5);G.stats.lost++;resetQueuePaths();}}else moveActor(c,dt,132);}G.shop=G.shop.filter(c=>c.state!=='leave'||c.path.length);resetQueuePaths();
 for(const g of [...G.groups]){g.age+=dt;if(G.tables.find(t=>t.id===g.table)?.fight)continue;if(g.state==='tournamentMove'){moveTournamentGroup(g,dt);}else if(g.state==='wait'){moveActor(g,dt);if(dirtyTableWait(g,dt))continue;g.waitLeft-=(g.training?0:dt)*.45;if(g.waitLeft<=0)departGroup(g,true);}else if(g.state==='walkTable'){if(moveActor(g,dt)){g.state='seated';seatDiners(g);g.seatedAt=G.elapsed;if(!G.tutorial.tableTip){G.tutorial.tableTip=true;say('Cada lugar tem seu pedido e seu prazo nos balões sobre os fregueses. Sirva com E.');}}}else if(g.state==='seated'){tickDiners(g,dt);}else if(g.state==='chat'){g.chat-=dt;if(g.chat<=0){if(g.tournament&&championshipActive()){renewTournamentOrders(g);continue;}if(G.day>=3&&g.round===0&&G.phase==='open'&&G.elapsed-(g.seatedAt||0)<85&&Math.random()<.3){addDinerRound(g);effect('Mais uma rodada!',g.x,g.y-70);}else departGroup(g);}}else moveActor(g,dt,126);}
 G.groups=G.groups.filter(g=>g.state!=='leave'||g.path.length);assignTables();

}

function departGroup(g,unhappy=false){if(keepTournamentGroup(g,unhappy))return;const table=G.tables.find(t=>t.id===g.table);if(table?.fight){table.fight=null;if(G.fightTarget===table.id)G.fightTarget=null;updateFightUI();}if(table&&table.group===g.id){table.group=null;table.dirty=table.plates>0;if(table.dirty&&!G.tutorial.cleanTip){G.tutorial.cleanTip=true;say('Mesa suja: aproxime-se com as mãos livres e segure E para limpar.');}g.reserved=false;}if(unhappy){if(g.diners)syncGroupOrders(g);G.stats.lost+=g.diners?g.diners.filter(d=>d.status==='waiting').length:1;repChange(-3);G.stats.waste+=g.delivered.reduce((n,i)=>n+i.cost,0);g.delivered=[];effect('Até outra hora…',g.x,g.y-70,'#e7b097');for(let j=0;j<g.size;j++)fxAnger(g.x-j*25,g.y-135);}g.table=null;g.state='leave';g.dest=null;setDestination(g,EXIT);assignTables();}

function clearUnserved(){let waste=0;for(const i of [...G.hands,...G.kitchen.grill,...G.kitchen.parking,G.kitchen.press,...G.floor.map(f=>f.item)])if(i)waste+=i.cost||0;for(const b of G.kitchen.bench)if(b)waste+=b.items.reduce((n,i)=>n+i.cost,0);G.stats.waste+=waste;G.hands=[null,null];G.kitchen={grill:[null,null,null],bench:[null,null],press:null,parking:[null,null]};G.floor=[];}

// Dispensar o freguês do balcão: vai embora sem comprar e a bodega perde reputação.
function counterCustomer(){return queuedShop().find(c=>atCounter(c))||null;}
function dismissCustomer(){
 const c=counterCustomer();if(!c){say('Ninguém esperando no balcão.');return;}
 if(c.training||tutorialActive()||costelaoTutorialActive()){say('No tutorial, atenda o freguês.');return;}
 c.state='leave';c.dest=null;c.dismissed=true;setDestination(c,EXIT);resetQueuePaths();repChange(-2);G.stats.dismissed=(G.stats.dismissed||0)+1;
 AudioEngine.bad();effect('Dispensado · reputação caiu',c.x,c.y-150,'#ffb3a0');say((PEOPLE[c.person]?.name||'O freguês')+' foi dispensado e saiu de cara feia.');save();refreshHUD();
}
