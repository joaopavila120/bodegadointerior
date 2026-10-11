'use strict';

const SPORT_ACTIONS={bocha:['inicio','direcao','forca','lancamento','aproximacao','rodada','vitoria','derrota'],truco:['inicio','carta','truco','aceitar','correr','rodada','vitoria','derrota']};
function specialOpponent(person){return ALWAYS_TALK.has(PEOPLE[person]?.id);}
function sportPeople(){return PEOPLE.map((p,i)=>i).filter(i=>specialOpponent(i)&&PEOPLE[i].id!==G.avatarId);}
function sportState(state=G){return state.sports??={bocha:{reputation:0,wins:0,matches:0,titles:0},truco:{reputation:0,wins:0,matches:0,titles:0},bracket:null,challenge:null,challengeDay:0,tutorialDone:false,tutorialOffered:false};}
function sportName(person){return person===-1?'Você':PEOPLE[person]?.name||'Convidado';}
function sportTitle(type){return type==='bocha'?'bocha':'truco';}
function sportStanding(type){const s=sportState()[type],rank=s.reputation<20?'Aprendiz':s.reputation<50?'Conhecido na comunidade':s.reputation<80?'Respeitado na região':'Lenda da comunidade';return rank+' · reputação '+s.reputation+'/100 · '+s.wins+' vitórias / '+s.matches+' partidas · '+s.titles+' títulos';}
function sportLine(person,type,action){
 const lines=customDialogues[PEOPLE[person].id+'.'+type+'.'+action];
 return lines?.length?pick(lines):nextProse(person);
}
function sportTalk(match,type,action){
 if(!match)return;
 if(!specialOpponent(match.opponent))match.opponent=pick(sportPeople());
 const spectator=match.spectator??(match.spectator=pick(sportPeople().filter(i=>i!==match.opponent)));
 match.talk=[match.opponent].map(person=>{const line=sportLine(person,type,action);return {person,player:line.player,reply:line.reply};});
 match.talkLife=15;match.talkSequence=(match.talkSequence||0)+1;
}
function sportTalkHTML(match){return match?.talk?.length?'<div class="sport-talk" aria-live="polite">'+match.talk.map(line=>'<div class="talk-line">'+portraitFromSprite(avatarSprite(),52)+'<p><b>'+escapeHTML(avatarName())+'</b>'+escapeHTML(line.player)+'</p></div><div class="talk-line">'+portraitHTML(line.person,52)+'<p><b>'+escapeHTML(sportName(line.person))+'</b>'+escapeHTML(line.reply)+'</p></div>').join('')+'</div>':'';}
function sportTalkTick(dt){
 const match=G.bocce||G.game;if(!match||document.hidden||match.paused||!match.talkLife)return;
 match.talkLife=Math.max(0,match.talkLife-dt);
 if(!match.talkLife){match.talk=[];if(G.bocce){updateBocceSocial();updateBocceTalk();}else document.querySelector('#dialogContent .sport-talk')?.remove();}
}
// A caixa fica no canto de baixo do chão da cancha (a imagem é centralizada no canvas).
function placeBocceTalk(){const c=$('bocceCanvas'),box=$('bocceTalkUI');if(!c||!box||innerWidth<=750)return;const cw=c.clientWidth,ch=c.clientHeight,k=Math.min(cw/1672,ch/941);box.style.bottom=Math.max(8,(ch-941*k)/2+14)+'px';box.style.right=Math.max(8,(cw-1672*k)/2+16)+'px';}
addEventListener('resize',placeBocceTalk);
function updateBocceTalk(){placeBocceTalk();const b=G.bocce,line=b&&b.talkLife>0&&b.talk?.[0];showRpgBox('bocceTalk',line&&{person:line.person,name:sportName(line.person)+(PEOPLE[line.person]?.id==='lauro'?' Bolador':''),reply:line.reply});}
function bocceTalkClick(){if(rpgAdvance('bocceTalk'))return;const b=G.bocce;if(b){b.talkLife=0;b.talk=[];}updateBocceTalk();}
function updateBocceSocial(){
 const b=G.bocce,host=$('bocceSocial');if(!b||!host)return;
 $('bocceMatchUI').classList.toggle('guided',!!b.tutorial);
 const token=(b.talkLife>0?b.talkSequence:0)+':'+b.phase+':'+b.paused+':'+b.tutorial;
 if(host.dataset.token===token)return;host.dataset.token=token;
 const tips={jack:'1 · A bolinha pequena é o bolim. Ganha quem deixar suas bochas mais perto dele.',direction:'2 · Mova com A/D. Quando a mira apontar para o bolim, aperte E para travar a direção.',power:'3 · A força está subindo. Aperte E para lançar. Aproximadamente 70% alcança o fundo da cancha.',rolling:'4 · Observe onde sua bocha para. Na próxima, ajuste a direção e a força.',ai:'Agora observe o lançamento do '+sportName(b.opponent)+'. Cada lado tem quatro bochas.',between:'5 · Quem deixou a bocha mais perto do bolim vence a rodada. Aperte Próxima rodada. A partida é melhor de 3: vence quem ganhar 2 rodadas.',over:'Tutorial concluído! Você pode apostar e organizar campeonatos na cancha.'};
 host.innerHTML='<p><b>Contra '+escapeHTML(sportName(b.opponent))+(PEOPLE[b.opponent]?.id==='lauro'?' Bolador':'')+'</b></p>'+(b.tutorial?'<div class="callout">'+tips[b.phase]+'</div>':'');
 updateBocceTalk();
}
function settleSport(type,match,won){
 if(match.sportSettled)return;match.sportSettled=true;if(!match.tutorial)repChange(won?1:-1.5);
 const s=sportState()[type];s.matches++;if(won)s.wins++;s.reputation=clamp(s.reputation+(won?10:-3),0,100);
 addFriendship(match.opponent,won?5:3);gainXP(won?20:6);
 sportTalk(match,type,won?'vitoria':'derrota');
 if(match.tutorial&&type==='bocha'){sportState().tutorialDone=true;finishBocceTutorial();}
 if(match.tutorial&&type==='truco')finishTrucoTutorial();
 if(match.bracket)recordSportMatch(won);
}
function prepareAfterHours(){
 const s=sportState();if(s.challengeDay===G.day)return;s.challengeDay=G.day;queueAfterHoursGifts();
 if(firstDay()&&G.tutorial.complete&&!s.tutorialDone&&!s.tutorialOffered){s.tutorialOffered=true;s.challenge={person:PEOPLE.findIndex(p=>p.id==='lauro'),wager:0,tutorial:true,type:'bocha'};}
 // No fim do segundo dia de bodega (o sábado), o Mano Lima aparece para ensinar truco.
 else if(!s.trucoTutorialOffered&&G.tutorial?.complete&&bodegaDays()>=2){s.trucoTutorialOffered=true;s.challenge={person:PEOPLE.findIndex(p=>p.id==='manolima'),wager:0,tutorial:true,type:'truco'};}
 else if(G.day>1&&contactPeople().length&&Math.random()<.25)s.challenge={person:pick(contactPeople()),wager:pick([5,10,25]),tutorial:false};
}
function showSportChallenge(){
 const challenge=sportState().challenge;if(!challenge)return false;
 const truco=challenge.type==='truco';
 openDialog(challenge.tutorial?(truco?'Mano Lima te ensina a jogar truco':'Lauro Bolador te ensina a jogar bocha'):'Desafio depois do expediente',`<div class="rpg-speaker">${portraitHTML(challenge.person,88)}<div><p><b>${sportName(challenge.person)}</b> apareceu na bodega!</p><p>${challenge.tutorial?(truco?'“Puxa uma cadeira, vivente! Índio véio te ensina as cartas, o truco e a hora de correr.” Partida de treino, sem aposta.':'“Bora pra cancha, rapaz! O Lauro Bolador te ensina a mirar, a dosar a força e a contar os pontos.” Treino gratuito e guiado.'):'“Vamos tirar uma bocha valendo '+money(challenge.wager)+' por lado?” Vitória devolve o dobro; derrota perde a entrada. Recusar custa 3 pontos de amizade.'}</p></div></div><div class="actions"><button class="primary" data-act="sportAccept" ${hasCash(challenge.wager)?'':'disabled'}>${challenge.tutorial?(truco?'Aprender truco com o Mano':worldOut?.map==='cancha'?'Aprender com o Lauro':'Ir com o Lauro até a cancha'):'Aceitar · '+money(challenge.wager)+(truco||worldOut?.map==='cancha'?'':' · na cancha')}</button><button data-act="sportDecline">${challenge.tutorial?'Aprender depois':'Recusar · −3 amizade'}</button></div>`,'sportChallenge');return true;
}
function answerSportChallenge(accept){
 const s=sportState(),c=s.challenge;if(!c)return;
 if(accept&&!hasCash(c.wager))return;
 s.challenge=null;
 // Recusar a lição de truco: o Mano Lima entrega a bandeira assim mesmo.
 if(!accept&&c.tutorial&&c.type==='truco'){closeDialog(true);finishTrucoTutorial();if(G.challengeVisit){G.challengeVisit.kind='gift';if(!showGiftVisit())challengeVisitLeave();}save();return;}
 if(!accept){if(!c.tutorial)addFriendship(c.person,-3);closeDialog(true);challengeVisitLeave();save();return;}
 // Bocha se joga na cancha, do lado: quem convidou sai na frente e espera lá, a não ser que já estejam na cancha.
 if(c.type!=='truco'&&worldOut?.map!=='cancha'){waitAtCancha(c);return;}
 G.challengeVisit=null;closeDialog(true);
 if(c.type==='truco'){launchSport('truco',c.person,{tutorial:true});return;}
 G.atCancha=true;launchSport('bocha',c.person,{wager:c.wager,tutorial:c.tutorial});
}
// Partidas do sistema (tutorial, desafio e campeonato) aceitam adversário fora da agenda.
let sportLaunch=null;
function invitablePeople(){return [...new Set([sportLaunch,sportState().challenge?.person,...contactPeople()].filter(i=>Number.isInteger(i)&&i>=0))];}
// O Mano Lima está sempre disponível para uma bocha.
// Só se joga com quem tem amizade (o contato sai com amizade 15); os convites do jogo (tutorial, desafio) valem sempre.
function sportFriend(i){return hasContact(i)||(G.friends[i]||0)>=CONTACT_AT;}
function boccePeople(){const sys=[sportLaunch,sportState().challenge?.person].filter(i=>Number.isInteger(i)&&i>=0);return [...new Set([...sys,...sportPeople().filter(sportFriend)])];}

// ---------- Desafiante entrando na bodega ----------
// Depois do expediente, quem propõe a bocha entra pela porta e caminha até você; só então aparece o convite.
function startChallengeVisit(){
 const c=sportState().challenge;if(!c)return false;return startVisit(c.person,'challenge');
}
// Presentes também chegam em pessoa: quem presenteia entra e caminha até você.
function startGiftVisit(){const item=G.giftQueue?.[0];return item?startVisit(item.person,'gift'):false;}
function startVisit(person,kind){
 if(G.challengeVisit&&!G.challengeVisit.leaving)return false;
 const near={x:clamp(G.player.x+90,80,W-80),y:clamp(G.player.y+10,450,860)};
 const actor={id:G.next++,person,kind,x:ENTRY.x,y:ENTRY.y,path:[],dest:null,dx:0,dy:-1,arrived:false,leaving:false};
 setDestination(actor,near);G.challengeVisit=actor;if(modal)closeDialog(true);if(kind==='challenge')announceArrivals([person]);save();return true;
}
function challengeVisitTick(dt){
 const v=G.challengeVisit;if(!v)return;
 const done=moveActor(v,dt,130);
 if(v.leaving){if(done){G.challengeVisit=null;continueSleep();}return;}
 if(done&&!v.arrived){v.arrived=true;v.dx=G.player.x<v.x?-1:1;save();if(v.kind==='gift'?!showGiftVisit():!showSportChallenge())challengeVisitLeave();return;}
 // Chegou e não tem mais nada a fazer (presente já entregue, convite resolvido): vai embora em vez de ficar parado.
 if(v.arrived&&!modal&&(v.kind==='gift'?!G.giftQueue?.length:!sportState().challenge))challengeVisitLeave();
}
function challengeVisitLeave(){const v=G.challengeVisit;if(!v)return;v.leaving=true;v.dest=null;setDestination(v,EXIT);}
function drawChallengeVisit(layers){const v=G.challengeVisit;if(v)layers.push({y:v.y,draw:()=>{if(isSpecial(v.person))specialRing(v.x,v.y);personDraw(PEOPLE[v.person].sprite,v.x,v.y,!!v.path?.length,false,v.dx);}});}
function launchSport(type,opponent,options={}){sportLaunch=opponent;try{return launchSportNow(type,opponent,options);}finally{sportLaunch=null;}}
function launchSportNow(type,opponent,options={}){
 if(G.bocce||G.game||G.task)return false;
 if(type==='bocha'){
  bocceMenu();if(modal!=='bocceSetup')return false;
  $('bocceWager').value=String(options.wager||0);$('bocceOpponent').value=String(opponent);
  startBocceGame();if(!G.bocce)return false;
  Object.assign(G.bocce,{tutorial:!!options.tutorial,bracket:!!options.bracket});if(options.tutorial)G.bocce.level='tutorial';updateBocceSocial();
 }else{
  cardsMenu();$('opponent').value=String(opponent);$('trucoWager').value='0';startTruco();if(!G.game)return false;G.game.bracket=!!options.bracket;G.game.tutorial=!!options.tutorial;showCards();
 }
 save();return true;
}
function sportTournamentMenu(type){
 if(!started||G.bocce||G.game||G.task)return;
 const b=sportState().bracket;
 if(b&&!b.finished){showSportBracket();return;}
 openDialog('Organizar campeonato de '+sportTitle(type),`<p>${sportStanding(type)}</p><p>Oito participantes: você e sete personagens especiais. Quartas de final, semifinal e final. Você joga suas partidas; as outras são simuladas e ficam registradas na chave. Uma derrota elimina o participante.</p><p>Inscrição: <b>R$ 10</b>. Prêmio do campeão: <b>R$ 80</b> e +20 reputação. Não há cobrança por rodada. Você pode sair e retomar a chave salva.</p><button data-act="sportCreate" data-id="${type}" ${hasCash(10)?'':'disabled'}>Inscrever e sortear a chave</button><button data-act="close">Voltar</button>`,'sportTournament');
}
function createSportTournament(type){
 if(!['bocha','truco'].includes(type)||!hasCash(10)||G.game||G.bocce||G.task||sportState().bracket&&!sportState().bracket.finished)return;
 const people=[...sportPeople()];for(let i=people.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[people[i],people[j]]=[people[j],people[i]];}
 spendCash(10);const stat=type==='bocha'?'bocceStakes':'cardStakes';G.stats[stat]+=10;
 const participants=[-1,...people.slice(0,7)];
 sportState().bracket={type,rounds:[Array.from({length:4},(_,i)=>({a:participants[i*2],b:participants[i*2+1],winner:null}))],finished:false,paid:false,champion:null};
 syncBocceReport();syncCardReport();save();showSportBracket();
}
function currentSportMatch(){const b=sportState().bracket;return b?.rounds.at(-1).find(m=>m.winner===null&&(m.a===-1||m.b===-1));}
function advanceSportBracket(){
 const b=sportState().bracket;if(!b||b.finished)return;
 const matches=b.rounds.at(-1);
 for(const m of matches)if(m.winner===null&&m.a!==-1&&m.b!==-1)m.winner=pick([m.a,m.b]);
 if(matches.some(m=>m.winner===null))return;
 if(matches.length===1){b.finished=true;b.champion=matches[0].winner;G.sportCups??={};G.sportCups[b.type]=(G.sportCups[b.type]||0)+1;if(b.champion===-1&&!b.paid){b.paid=true;G.cash=round(G.cash+80);G.stats[b.type==='bocha'?'bocceReturns':'cardReturns']+=80;const s=sportState()[b.type];s.titles++;s.reputation=clamp(s.reputation+20,0,100);syncBocceReport();syncCardReport();}return;}
 const winners=matches.map(m=>m.winner);b.rounds.push(Array.from({length:winners.length/2},(_,i)=>({a:winners[i*2],b:winners[i*2+1],winner:null})));advanceSportBracket();
}
function recordSportMatch(won){
 const m=currentSportMatch();if(!m)return;m.winner=won?-1:(m.a===-1?m.b:m.a);advanceSportBracket();save();
}
function showSportBracket(){
 const b=sportState().bracket;if(!b){say('Ainda não há chave. Escolha Organizar campeonato para inscrever os participantes.');return;}advanceSportBracket();save();
 openDialog('Campeonato de '+sportTitle(b.type),`<p>${sportStanding(b.type)}</p><div class="sport-bracket">${b.rounds.map((r,i)=>'<section><h3>'+['Quartas de final','Semifinais','Final'][i]+'</h3>'+r.map(m=>'<p>'+escapeHTML(sportName(m.a))+' × '+escapeHTML(sportName(m.b))+'<br><b>'+(m.winner===null?'A jogar':'Venceu: '+escapeHTML(sportName(m.winner)))+'</b></p>').join('')+'</section>').join('')}</div>${b.finished?'<div class="callout">Campeão: <b>'+escapeHTML(sportName(b.champion))+'</b>'+(b.champion===-1?' · R$ 80 no caixa!':' · campeão da chave.')+'</div>':'<button class="primary" data-act="sportNext">Jogar minha próxima partida</button>'}<button data-act="close">Voltar · chave salva</button>`,'sportBracket');
}
function playSportBracket(){
 const b=sportState().bracket,m=currentSportMatch();if(!b||b.finished||!m||G.bocce||G.game)return;
 closeDialog(true);launchSport(b.type,m.a===-1?m.b:m.a,{bracket:true});
}
function sportsAction(act,id){
 if(act==='sportAccept')answerSportChallenge(true);else if(act==='sportDecline')answerSportChallenge(false);
 else if(act==='sportTournament')sportTournamentMenu(id);else if(act==='sportCreate')createSportTournament(id);
 else if(act==='sportNext')playSportBracket();else if(act==='sportBracket')showSportBracket();
 else if(act==='learnBocce'){sportState().challenge={person:PEOPLE.findIndex(p=>p.id==='lauro'),wager:0,tutorial:true,type:'bocha'};showSportChallenge();}
 else return false;return true;
}

// Fim do treino com o Lauro (ganhando, perdendo ou desistindo): explica a cancha e volta para a bodega,
// onde o Lauro entra para entregar a lâmpada. Campeonatos e desafios ficam para as próximas noites.
function showBocceTutorialEnd(){
 const lauro=PEOPLE.findIndex(p=>p.id==='lauro');sportState().bocceTutorialDay=G.day;
 openDialog('A cancha é tua!',`<div class="rpg-speaker">${portraitHTML(lauro,88)}<div><p><b>Lauro Bolador</b></p><p>“Bah, tu leva jeito pra coisa! De agora em diante a cancha tá sempre aberta pra ti.”</p></div></div><div class="callout">Volte à cancha quando quiser pela <b>porta à direita do salão</b>. Lá você pode <b>organizar campeonatos de bocha</b> e <b>desafiar seus contatos</b>. Para ter com quem jogar, faça amizade com os fregueses especiais: atenda bem, converse e eles viram contatos.</div><p>Hoje o Lauro já guardou as bochas: a cancha abre de novo amanhã à noite.</p><button class="primary" data-act="bocceTutorialHome">Voltar para a bodega</button>`,'bocceTutorialEnd');
}
function bocceTutorialHome(){if(modal==='bocceTutorialEnd'){modal=null;$('overlay').classList.add('hidden');}G.atCancha=true;leaveCancha();}
