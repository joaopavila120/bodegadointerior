(() => {
 const results=[],check=(v,m)=>{if(!v)throw Error(m);results.push(m);};
 const random=Math.random,visitor=pickVisitor,dialogues=customDialogues;
 const reset=()=>{G=fresh();G.xp=99999;G.levelSeen=7;G.day=2;G.tutorial.guided=false;G.tutorial.complete=true;G.cash=1000;G.rep=100;started=true;paused=false;modal=null;phoneOpen=false;AudioEngine.on=false;keys.clear();cardInvite=null;['start','overlay','phone','bocceScreen'].forEach(id=>$(id).classList.add('hidden'));document.body.classList.remove('playing-bocce');};
 try{
  reset();cardsMenu();check(!$('opponent')&&$('dialogContent').textContent.includes('agenda ainda está vazia'),'sem contatos não há convite para truco');closeDialog(true);
  bocceMenu();check(modal==='aviso'&&!$('bocceOpponent'),'sem amizade, ninguém aceita jogar bocha: aviso em caixa de diálogo');closeDialog(true);
  const badin=PEOPLE.findIndex(p=>p.id==='badin'),mano=PEOPLE.findIndex(p=>p.id==='manolima');G.contacts={badin:2,manolima:2};
  cardsMenu();check([...$('opponent').options].map(o=>Number(o.value)).sort().join()===[badin,mano].sort().join(),'truco convida apenas contatos da agenda');closeDialog(true);
  bocceMenu();check([...$('bocceOpponent').options].map(o=>Number(o.value)).sort().join()===[badin,mano].sort().join(),'bocha convida só quem tem amizade (os contatos da agenda)');startBocceGame();
  check(specialOpponent(G.bocce.opponent)&&G.bocce.talk.length===1&&G.bocce.talk[0].person===G.bocce.opponent,'bocha só tem a fala do adversário, sem torcida');
  G.bocce.phase='direction';G.bocce.turn=0;confirmBocce();G.bocce.power=.7;const sequence=G.bocce.talkSequence;confirmBocce();
  check(G.bocce.used[0]===1&&G.bocce.talkSequence>sequence&&G.bocce.talk.length===1,'lançamento real gera nova fala do adversário');
  const person=G.bocce.opponent,key=PEOPLE[person].id+'.bocha.lancamento';customDialogues={...customDialogues,[key]:[{player:'Como foi?',reply:'Fala por ação de teste'}]};sportTalk(G.bocce,'bocha','lancamento');
  check(G.bocce.talk[0].reply==='Fala por ação de teste','fala específica da ação tem prioridade');
  customDialogues[key]=[];sportTalk(G.bocce,'bocha','lancamento');check(G.bocce.talk[0].reply!=='Fala por ação de teste','seção vazia usa diálogo normal');
  check(parseDialogueText('[badin]\nOi | Cudio\n[badin.truco.carta]\nCarta? | Boa!')['badin.truco.carta'][0].reply==='Boa!','TXT aceita seções por jogo e ação');
  const cash=G.cash;settleBocce(0);settleBocce(0);check(sportState().bocha.matches===1&&sportState().bocha.wins===1&&sportState().bocha.reputation===10&&G.cash===cash,'reputação da bocha é independente e liquidada uma vez');
  save();G=readSave();check(G.bocce.opponent===person&&sportState().bocha.reputation===10,'adversário e reputação persistem');
  reset();G.day=1;G.phase='closed';prepareAfterHours();check(sportState().challenge.tutorial&&PEOPLE[sportState().challenge.person].id==='lauro','fim do primeiro dia: o Lauro Bolador convida para a bocha');showSportChallenge();answerSportChallenge(true);
  check(sportState().waiting?.tutorial&&!G.bocce,'aceitar o Lauro: ele vai na frente e espera na cancha, ao lado da bodega');playWaitingBocha();
  check(G.bocce.tutorial&&G.bocce.wager===0&&G.bocce.level==='tutorial'&&$('bocceSocial').textContent.includes('bolim'),'aceitar o Lauro inicia lição gratuita, fácil e guiada');
  G.bocce.phase='direction';updateBocceUI();check($('bocceSocial').textContent.includes('A/D'),'tutorial ensina posicionamento e mira');confirmBocce();check($('bocceSocial').textContent.includes('força'),'tutorial avança para força por ação real');settleBocce(0);check(sportState().tutorialDone,'partida do tutorial concluída persiste');
  const lauroIdx=PEOPLE.findIndex(p=>p.id==='lauro');check(hasContact(lauroIdx)&&G.giftQueue[0]?.key==='lauro:tutorial'&&!decorState().lampada,'Lauro vira contato e guarda a lâmpada para entregar em pessoa');
  leaveBocce();check(modal==='bocceTutorialEnd'&&$('dialogContent').textContent.includes('organizar campeonatos')&&!G.bocce,'fim do treino: tela explica a cancha, campeonatos e desafios');
  closeDialog();check(!G.atCancha&&!modal&&$('bocceScreen').classList.contains('hidden')&&G.challengeVisit?.kind==='gift'&&G.challengeVisit.person===lauroIdx,'de volta à bodega, o Lauro entra pela porta');
  {const d=G.player;G.player={x:0,y:0};const near=window.nearCanchaDoor;window.nearCanchaDoor=()=>true;enterCancha();window.nearCanchaDoor=near;G.player=d;check(!G.atCancha,'na noite do treino a cancha não reabre');}for(let n=0;n<600&&!G.challengeVisit.arrived;n++)challengeVisitTick(.05);
  check(modal==='giftVisit'&&$('dialogContent').textContent.includes('Lâmpada pendente'),'e entrega a lâmpada');action('giftAccept');check(decorState().lampada===true&&G.giftsGiven['lauro:tutorial'],'a lâmpada vai para o salão');G.challengeVisit=null;
  // truco com o Mano Lima na primeira segunda
  reset();G.day=4;G.phase='closed';prepareAfterHours();const lesson=sportState().challenge;check(lesson?.type==='truco'&&lesson.tutorial&&PEOPLE[lesson.person].id==='manolima','primeira segunda: o Mano Lima vem ensinar truco');
  showSportChallenge();check($('dialogTitle').textContent.includes('truco'),'convite da lição de truco');answerSportChallenge(true);check(G.game?.tutorial&&$('dialogContent').textContent.includes('Lição do Mano Lima'),'partida de treino com dicas do Mano Lima');
  leaveCards();check(!G.game&&sportState().trucoTutorialDone&&G.giftQueue.some(g=>g.key==='manolima:tutorial')&&G.challengeVisit?.kind==='gift','desistindo do truco, o Mano Lima entrega a bandeira assim mesmo');G.challengeVisit=null;closeDialog(true);
  check(G.game===null,'sem partida pendurada');
  reset();sportState().trucoTutorialOffered=true;G.contacts={badin:2,guri:2};G.phase='closed';Math.random=()=>.24;prepareAfterHours();const challenge=sportState().challenge;check(challenge&&!challenge.tutorial&&hasContact(challenge.person)&&challenge.wager>0,'sorteio inferior a 25% cria desafio apostado de um contato');prepareAfterHours();check(sportState().challenge===challenge,'fechar relatório não sorteia outro desafio');
  G.friends[challenge.person]=10;answerSportChallenge(false);check(G.friends[challenge.person]===7&&!sportState().challenge,'recusar desafio reduz amizade em três pontos');
  reset();sportState().trucoTutorialOffered=true;G.contacts={badin:2};Math.random=()=>.25;prepareAfterHours();check(!sportState().challenge,'sorteio de 25% ou mais não cria desafio');
  reset();G.tutorial.day=G.day-1;prepareAfterHours();check(sportState().challenge?.tutorial&&sportState().challenge.type==='truco'&&PEOPLE[sportState().challenge.person].id==='manolima','no fim do segundo dia (o sábado), o Mano Lima vem ensinar truco');
  reset();sportState().trucoTutorialOffered=true;G.phase='closed';Math.random=()=>.1;prepareAfterHours();check(!sportState().challenge,'sem contatos ninguém liga para desafiar');Math.random=random;
  reset();G.phase='closed';sportState().challenge={person:PEOPLE.findIndex(p=>p.id==='badin'),wager:25,tutorial:false};save();G=readSave();showSportChallenge();const wagerCash=G.cash;answerSportChallenge(true);check(sportState().waiting?.wager===25&&G.cash===wagerCash,'o desafiante espera na cancha; a aposta só sai quando o jogo começa');playWaitingBocha();check(G.cash===wagerCash-25&&G.bocce.wager===25&&!sportState().challenge,'desafio salvo cobra uma entrada ao aceitar');settleBocce(0);settleBocce(0);check(G.cash===wagerCash+25,'vitória no desafio paga o dobro uma única vez');
  for(const type of ['bocha','truco']){
   reset();createSportTournament(type);const b=sportState().bracket;check(b.rounds[0].length===4&&new Set(b.rounds[0].flatMap(m=>[m.a,m.b])).size===8,'chave de oito participantes únicos: '+type);
   const before=G.cash;
   for(let round=0;round<3;round++){
    playSportBracket();const match=type==='bocha'?G.bocce:G.game;check(match.bracket&&specialOpponent(match.opponent),'partida jogável da chave '+type+' / '+(round+1));
    if(type==='bocha'){settleBocce(0);leaveBocce();}else{finishTrucoHand(0,6);leaveCards();}
    save();G=readSave();
   }
   check(sportState().bracket.finished&&sportState().bracket.champion===-1&&G.cash===before+80&&sportState()[type].titles===1,'campeão recebe prêmio único após três vitórias: '+type);
   showSportBracket();showSportBracket();check(G.cash===before+80,'reabrir chave não duplica pagamento: '+type);
   createSportTournament(type);playSportBracket();if(type==='bocha'){settleBocce(1);leaveBocce();}else{finishTrucoHand(1,6);leaveCards();}
   check(sportState().bracket.finished&&specialOpponent(sportState().bracket.champion),'derrota elimina jogador e conclui chave com campeão especial: '+type);
  }
  reset();G.phase='open';for(const special of sportPeople()){pickVisitor=()=>special;for(let n=0;n<20;n++){G.shop=[];const c=spawnShop();check(c&&c.pid!=='cigarro','especial nunca pede cigarro: '+PEOPLE[special].name);}}pickVisitor=visitor;
  reset();G.up.salame=true;orderGoods('salame');check(G.toastLesson?.day===3,'compra de salame no fornecedor também agenda lição para partida antiga');
  reset();G.phase='prep';buyUpgrade('salame');closeDialog(true);check(G.toastLesson.day===3&&!G.toastLesson.done,'compra de salame agenda lição para o dia seguinte');G.day=3;G.event.seen=true;openDay();simulate(.05);
  check(G.groups.length===1&&!G.shop.length&&G.groups[0].fixedOrders?.[0]==='torrada'&&modal==='toastLesson','primeiro cliente pede torrada antes das outras chegadas');closeDialog(true);const toast=G.groups[0];for(let n=0;n<350;n++)customersTick(.05);
  takeFromBin('pao_xis');useGrill(0);kitchenTick(30);check(G.kitchen.grill[0].waitingToast&&!G.kitchen.grill[0].burned,'pão na chapa aguarda salame sem queimar');readyProduct('salame');useGrill(0);kitchenTick(6.1);useGrill(0);
  check(held()?.pid==='torrada'&&held().ready&&Number.isFinite(held().cost),'pão e salame produzem torrada real na chapa');deliverToDiner(toast,held(),G.tables[toast.table]);check(G.toastLesson.done,'servir torrada encerra lição e libera chegadas');
  reset();G.event={id:'campeonato',seen:true,fired:{}};G.phase='prep';openDay();for(let n=0;n<350;n++)customersTick(.05);scoreHouseRound();G.elapsed=155;finishHouseTournament();
  check(G.tournament.finished&&Number.isInteger(G.tournament.winner)&&modal==='celebration','campeonato da bodega anuncia dupla e pagador antes de fechar');
  const orders=G.groups.flatMap(g=>g.diners).map(d=>d.orders.length);check(G.groups.every(g=>g.diners.every(d=>['cerveja','cachaca','bitter'].includes(d.orders.at(-1)))),'campeão pede bebida alcoólica para cada pessoa');finishHouseTournament();check(JSON.stringify(orders)===JSON.stringify(G.groups.flatMap(g=>g.diners).map(d=>d.orders.length)),'rodada do campeão não duplica');
  for(const team of ['gremio','inter']){
   reset();G.phase='open';G.event={id:'grenal',seen:true,fired:{},result:team};const rival=team==='gremio'?'inter':'gremio';const a=visitorPool(team)[0],z=visitorPool(rival)[0];const g=spawnGroup({size:2,members:[a,z],fixedOrders:['refri','refri']});for(let n=0;n<350;n++)customersTick(.05);finishFootball();
   check(g.size===1&&g.members[0]===a&&G.shop.some(c=>c.person===z&&c.state==='leave'),'Gre-Nal: torcida perdedora sai individualmente / '+team);
   check(['cerveja','cachaca','bitter'].includes(g.diners[0].orders.at(-1))&&PEOPLE[pickVisitor()].team===team,'Gre-Nal: vencedores pedem rodada e continuam chegando / '+team);
   reset();G.phase='open';G.event={id:team,seen:true,fired:{},result:team};const fans=spawnGroup({size:2});for(let n=0;n<350;n++)customersTick(.05);finishFootball();check(fans.diners.every(d=>['cerveja','cachaca','bitter'].includes(d.orders.at(-1))),'vitória em jogo isolado gera rodada alcoólica / '+team);
  }
  reset();G.phase='open';G.event={id:'grenal',seen:true,fired:{},result:'empate'};const tied=spawnGroup({size:2});for(let n=0;n<350;n++)customersTick(.05);const tiedOrders=JSON.stringify(tied.orders);finishFootball();check(tied.size===2&&JSON.stringify(tied.orders)===tiedOrders,'empate não expulsa torcida nem cria rodada vencedora');
 }finally{Math.random=random;pickVisitor=visitor;customDialogues=dialogues;reset();}
 return results;
})()
