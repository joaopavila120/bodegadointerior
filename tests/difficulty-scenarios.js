(() => {
 const results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const reset=()=>{G=fresh();G.xp=99999;G.levelSeen=7;G.contacts=Object.fromEntries([...ALWAYS_TALK].map(id=>[id,1]));started=true;paused=false;modal=null;phoneOpen=false;keys.clear();G.spawnShop=G.spawnGroup=999;AudioEngine.on=false;['start','overlay','phone','bocceScreen'].forEach(id=>$(id).classList.add('hidden'));document.body.classList.remove('playing-bocce');};
 const advance=seconds=>{for(let n=0;n<seconds;n+=.05)customersTick(.05);};
 reset();check(G.event.id==='normal'&&!fightsAllowed(),'primeiro dia sempre tranquilo e sem brigas');
 for(const day of [1,2,3,4,5,7]){
  G.day=day;const sizes=new Set(),items=new Set();for(let i=0;i<300;i++){const size=restaurantGroupSize(0);sizes.add(size);const orders=tableOrders({table:0,person:0,size:1});items.add(orders.length);if(size>difficulty().maxGroup||orders.length>difficulty().maxItems)throw Error('Limite da dificuldade violado');}
  check(sizes.has(difficulty().maxGroup)&&items.has(difficulty().maxItems),'grupos e pedidos crescem nos limites do dia '+day);
 }
 reset();G.phase='open';const diners=spawnGroup({size:2});advance(12);check(diners.table===0,'clientes comuns usam restaurante e deixam a mesa fixa para o truco');
 G.day=2;G.elapsed=100;const crew=spawnGroup({size:2});advance(12);check(crew.table===1&&crew.state==='seated','mesa de truco recebe a fila comum');
 check(!triggerFight(G.tables[1]),'truco normal do início não provoca briga');
 G.day=2;G.event.id='campeonato';check(triggerFight(G.tables[1]),'campeonato permite brigas antes do nível avançado');G.tables[1].fight=null;
 G.event.id='normal';G.day=5;check(triggerFight(G.tables[1]),'dia 5 libera brigas no truco comum');G.tables[1].fight=null;
 const modes=G.tables.map(t=>t.mode).join();toggleTable(1);check(G.tables.map(t=>t.mode).join()===modes,'troca manual de mesas permanece desativada');
 reset();let previous=G.event.id;const draws=[];for(let day=2;day<=170;day++){const e=eventForDay(day,G),c=calendar(day),fixed=fixedEventFor(day);if(!fixed&&e.id===previous)throw Error('Evento sorteado repetido em dias seguidos');
  if(c.weekday===6&&e.id!=='costelao')throw Error('Domingo sem costelão');if(c.weekday===2&&!['gremio','inter','grenal'].includes(e.id))throw Error('Quarta sem futebol');
  if(['truco','rodeio','motos'].includes(e.id))throw Error('Evento removido voltou: '+e.id);
  if(e.id==='geada'&&![5,6,7].includes(c.month))throw Error('Geada fora do inverno');draws.push(e.id);G.event=e;previous=e.id;}
 check(Object.keys(EVENTS).every(id=>draws.includes(id)),'calendário gaúcho: domingo de costelão, quarta de futebol, sábado de baile ou campeonato e sorteio sem repetição');
 check(eventForDay(3).id==='costelao'&&eventForDay(6).id==='grenal'&&calendar(1).name==='Sexta'&&calendar(3).name==='Domingo','o jogo começa na sexta e o primeiro domingo é de costelão');
 G.phase='closed';const next=plannedEvent();planDay();closeDialog(true);check(plannedEvent().id===next.id&&readSave().nextEvent.id===next.id,'consultar ou recarregar a previsão não sorteia outro evento');
 reset();finishDay();check(G.tv&&G.tvAwardPending&&modal==='tvAward'&&$('dialogContent').textContent.includes('Valter')&&$('dialogContent').textContent.includes('presentes'),'TV anunciada ao concluir o primeiro dia');
 save();check(readSave().tvAwardPending,'anúncio pendente da TV sobrevive ao salvamento');action('tvAwardClose');check(modal==='report'&&!G.tvAwardPending,'anúncio da TV conduz ao relatório sem prêmio duplicado');nextDay('automatic');closeDialog(true);check(G.day===2&&G.tv,'segundo dia mantém a TV e começa a nova progressão');

 G.day=2;G.player={x:510,y:585,dx:1,dy:0};{const phase=G.phase;G.phase='prep';refreshHUD();check(!$('tutorialHint').textContent.includes('A bodega está fechada'),'bodega fechada: sem quadro fixo no alto (os lembretes flutuam e somem)');G.phase='open';refreshHUD();check($('tutorialHint').classList.contains('hidden')&&!$('hint').textContent.includes('WASD'),'dicas gerais e tutorial desaparecem depois do primeiro dia');G.phase=phase;refreshHUD();}
 check(!$('refillMateContext')&&!$('mateStock'),'cuia não precisa ser abastecida: sem botão de reposição');
 check(!document.querySelector('[data-act="map"]')&&!document.querySelector('[data-act="tableMode"]')&&!$('combo')&&!$('tableOrders'),'mapa, troca de mesa, combo e lista lateral foram removidos');
 check(!document.querySelector('[data-act="rooms"]')&&$('phone').querySelector('[data-act="tab"][data-id="decor"]'),'troca de cenário removida e Estética no celular');
 check(getComputedStyle($('gameSidebar')).overflowY==='hidden'&&$('dayNotice').textContent.split('\n').length===2,'faixa lateral fixa e cabeçalho do dia em duas linhas');
 check(itemArtKey('xis_salada',{kind:'assembled'})==='xis_montado'&&itemArtKey('xis_salada',{ready:true})==='xis_prensado'&&ITEM_ART.xis_montado.src!==ITEM_ART.xis_prensado.src,'xis muda de desenho entre montagem e prensa');
 const originalBar=bar;try{
  for(const type of ['mate','clean']){let bars=0;bar=(...args)=>{bars++;originalBar(...args);};G.task={type,target:type==='mate'?'mate':'table:1',time:.5};G.boost=5;if(type==='clean')G.tables[1].dirty=true;draw();check(bars===1,'somente uma barra de ação durante '+type);}
 }finally{bar=originalBar;G.task=null;G.boost=0;G.tables[1].dirty=false;}
 G.player={x:510,y:585,dx:1,dy:0};joinSeatedTruco();check(!modal,'truco não inicia longe da mesa');G.player={x:1334,y:590,dx:0,dy:-1};refreshHUD();check(!$('playTrucoButton').classList.contains('hidden'),'jogar truco aparece perto da mesa fixa');joinSeatedTruco();check(modal==='cards','mesa vazia também oferece partida contextual');closeDialog(true);
 G.player={x:510,y:585,dx:1,dy:0};enterCancha();check(!G.atCancha,'entrada na cancha exige proximidade da porta');
 enterCancha(true);
 check(worldOut?.map==='cancha'&&!G.bocce&&$('bocceScreen').classList.contains('hidden'),'entrar na cancha (pelo pátio) deixa andar por dentro antes de jogar');
 bocceMenu();$('bocceWager').value='0';startBocceGame();const before=G.elapsed;G.phase='open';simulate(2);check(!!G.bocce&&G.elapsed===before,'a partida de bocha pausa o atendimento');
 settleBocce(1);leaveBocce();check(!G.bocce&&worldOut?.map==='cancha'&&$('bocceScreen').classList.contains('hidden'),'terminar a bocha volta para dentro da cancha');canchaExit();check(worldOut?.map==='vila'&&G.phase==='open','saindo da cancha, o pátio');goInside();
 reset();return results;
})()
