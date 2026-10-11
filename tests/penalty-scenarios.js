(() => {
 const previous={G,worldOut,started,paused,modal,phoneOpen,random:Math.random,keys:[...keys]},results=[];
 const check=(ok,text)=>{if(!ok)throw Error(text);results.push(text);};
 const tickUntilResult=()=>{for(let i=0;i<110&&G.penalties.phase==='flight';i++)penaltyTick(.025);};
 try{
  G=fresh();started=true;paused=false;modal=null;phoneOpen=false;worldOut={map:'serra',x:0,y:0,dx:0,dy:1};Math.random=()=>.5;
  penaltyMenu();check(modal===null,'Pênaltis só abrem ao chegar ao campinho');
  const spot=WORLD_MAPS.serra.spots().find(s=>s.id==='campinho');worldOut={map:'serra',x:spot.x,y:spot.y,dx:0,dy:1};spot.act();
  check(modal==='aviso','sem amizade, ninguém aceita bater pênalti: aviso em caixa de diálogo');closeDialog(true);
  for(const id of ['marcio','badin'])G.friends[PEOPLE.findIndex(p=>p.id===id)]=CONTACT_AT;spot.act();
  check(modal==='penaltySetup'&&[...$('penaltyOpponent').options].map(o=>PEOPLE[Number(o.value)].id).sort().join()==='badin,marcio','Campinho oferece só os especiais com amizade');
  $('penaltyOpponent').value=PEOPLE.findIndex(p=>p.id==='marcio');startPenalties();
  check(G.penalties.phase==='aim'&&!$('penaltyScreen').classList.contains('hidden'),'Partida começa com câmera e controles próprios');
  const elapsed=G.elapsed,cash=G.cash,stock=JSON.stringify(G.stock);simulate(10,true);
  check(G.elapsed===elapsed&&G.cash===cash&&JSON.stringify(G.stock)===stock,'Expediente, caixa e estoque ficam congelados durante os pênaltis');
  penaltyKeys.add('d');penaltyKeys.add('w');penaltyKeys.add('e');penaltyTick(.1);penaltyKeys.clear();
  check(G.penalties.aimX>0&&G.penalties.aimY>1.1&&G.penalties.curve>0,'Direção, altura e efeito respondem aos controles');
  penaltyPress();penaltyTick(.4);check(G.penalties.phase==='charge'&&G.penalties.power>.4,'Segurar o chute acumula força');
  penaltyRelease(true);check(G.penalties.phase==='aim'&&!G.penalties.shot,'Cancelar o toque não dispara a bola');
  penaltyPress();penaltyTick(.2);togglePenaltyPause(true);const clock=G.penalties.clock;penaltyTick(3);
  check(G.penalties.phase==='aim'&&G.penalties.clock===clock,'Pausar cancela a carga e congela a partida');togglePenaltyPause(false);
  const keeper={x:0,y:1};
  check(penaltyShotResult({x:3,y:1.5},keeper)==='goal','Chute dentro do gol fora do alcance é gol');
  check(penaltyShotResult({x:0,y:1},keeper)==='save','Contato com o goleiro resulta em defesa');
  check(penaltyShotResult({x:3.66,y:1},keeper)==='post'&&penaltyShotResult({x:0,y:2.44},keeper)==='post','Poste e travessão têm colisão');
  check(penaltyShotResult({x:4,y:1},keeper)==='out'&&penaltyShotResult({x:1,y:3},keeper)==='out','Chutes fora da largura ou altura não contam');
  G.penalties.aimX=3;G.penalties.aimY=1.4;G.penalties.curve=0;penaltyPress();penaltyTick(.6);penaltyRelease();
  G.penalties.keeper={x:-2,y:.6,side:-1,start:G.penalties.clock,duration:.1};
  check(G.penalties.phase==='flight'&&G.penalties.shot.power>.6,'Soltar o botão lança a bola com a força escolhida');tickUntilResult();
  check(G.penalties.history[0][0]==='goal'&&G.penalties.used[0]===1&&G.penalties.score[0]===1,'Trajetória resolvida contabiliza uma cobrança e um gol');resolvePenalty();
  check(G.penalties.used[0]===1,'Repetir a resolução não duplica gols');
  penaltyNextTurn();penaltyKeys.add('d');penaltyTick(.1);penaltyKeys.clear();penaltyPress();
  check(G.penalties.keeper?.side===1,'Jogador pode escolher o lado e saltar como goleiro');
  for(let i=0;i<65&&G.penalties.phase==='ai';i++)penaltyTick(.025);
  check(G.penalties.phase==='flight'&&G.penalties.shot.owner===1,'Especial cobra mesmo quando o jogador salta cedo');tickUntilResult();
  check(G.penalties.used[1]===1,'Cobranças alternam entre jogador e especial');
  check(penaltyWinner([3,0],[3,3])===0&&penaltyWinner([0,3],[3,3])===1,'Disputa termina quando a vantagem não pode ser alcançada');
  check(penaltyWinner([4,4],[5,5])===null&&penaltyWinner([5,4],[6,5])===null&&penaltyWinner([5,4],[6,6])===0,'Empate segue às alternadas com direito de resposta');
  penaltyNextTurn();launchPenalty(0,2,1.8,.7,.4);penaltyTick(.2);save();const savedClock=G.penalties.clock;
  G=readSave(false);showPenalties();check(G.penalties.paused&&G.penalties.clock===savedClock&&G.penalties.phase==='flight','Save retoma a cobrança em andamento pausada, sem perder o placar');
  togglePenaltyPause(false);tickUntilResult();drawPenalties();check(ctx!==penaltyContext&&penaltyBackdrop.width===1200,'Renderizador restaura o canvas e reutiliza o cenário estático');
  leavePenalties();check(G.penalties.quit,'Sair durante a partida pede confirmação');G.penalties.quit=false;
  const m=G.penalties;m.winner=0;m.phase='over';settlePenalties();settlePenalties();
  check(G.footballRecord.matches===1&&G.footballRecord.wins===1,'Resultado e amizade são concedidos uma única vez');leavePenalties();
  check(!G.penalties&&worldOut.map==='serra'&&worldOut.x===spot.x&&worldOut.y===spot.y&&$('penaltyScreen').classList.contains('hidden'),'Fim da partida devolve o jogador ao campinho');
  return results;
 }finally{
  hidePenalties();G=previous.G;worldOut=previous.worldOut;started=previous.started;paused=previous.paused;modal=previous.modal;phoneOpen=previous.phoneOpen;Math.random=previous.random;keys.clear();previous.keys.forEach(k=>keys.add(k));$('overlay').classList.toggle('hidden',!modal);draw();
 }
})()
