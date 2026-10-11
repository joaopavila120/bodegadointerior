// Disputa de pênaltis: estado serializável, física independente da tela.
'use strict';
const PENALTY = { halfGoal: 3.66, height: 2.44, radius: .11, distance: 11 };
const penaltyKeys = new Set();
let penaltyHUDClock=0;
const PENALTY_SKILL = { marcio: .62, marcelo: .66, badin: .45, guri: .72, manolima: .5, mitodosul: .8, indavirus: .57, lauro: .64 };
function penaltyPeople() { return sportPeople().filter(sportFriend); }
function penaltyMenu() {
  if (!started || G.penalties || G.bocce || G.game || G.task || worldOut?.map !== 'serra') return;
  const spot = WORLD_MAPS.serra.spots().find(s => s.id === 'campinho');
  if (Math.hypot(worldOut.x - spot.x, worldOut.y - spot.y) > 110) return;
  if (!penaltyPeople().length) { warnDialog('Ninguém pra bater pênalti', 'O campinho é com os amigos: faça amizade na bodega e puxe prosa na rua. Com amizade ' + CONTACT_AT + ', o especial aceita ir pro gol.'); return; }
  openDialog('Pênaltis no campinho', `<p>Câmera atrás do cobrador, bola no chão e um especial no gol. Cada lado bate <b>cinco pênaltis</b>; se empatar, vamos às alternadas.</p><label>Adversário <select id="penaltyOpponent">${penaltyPeople().map(i => `<option value="${i}">${escapeHTML(PEOPLE[i].name)}</option>`).join('')}</select></label><div class="callout"><p><b>Para chutar:</b> WASD ou setas ajustam direção e altura. Q/E coloca efeito. Segure Espaço e solte para bater. Força demais reduz a precisão.</p><p><b>Para defender:</b> A/D escolhe o lado, W/S a altura. Aperte Espaço no momento certo para saltar.</p><p>No celular, toque na mira ou use os botões da partida.</p></div><p>Partida sem aposta. O expediente fica pausado e a disputa é salva automaticamente.</p><div class="actions"><button class="primary" data-act="penaltyStart">Entrar em campo</button><button data-act="close">Voltar</button></div>`, 'penaltySetup');
}
function startPenalties() {
  if (modal !== 'penaltySetup' || G.penalties) return;
  const opponent = Number($('penaltyOpponent')?.value);
  if (!penaltyPeople().includes(opponent) || !worldOut) return;
  const returnTo = { ...worldOut, walk: false };
  G.penalties = { version: 1, opponent, returnTo, score: [0,0], used: [0,0], history: [[],[]], turn: 0, phase: 'aim', clock: 0, aimX: 0, aimY: 1.1, curve: 0, power: 0, keeperSide: 0, keeperHigh: 1.15, keeper: null, shot: null, paused: false, settled: false, winner: null, talk: '', result: '' };
  closeDialog(true); G.player.walk = false; keys.clear(); pointerHold = false;
  penaltyNextTurn(true); showPenalties(); save(); AudioEngine.ready();
}
function showPenalties() {
  if (!G.penalties) return;
  modal = null; paused = false; keys.clear(); penaltyKeys.clear(); pointerHold = false;
  worldOut = { ...G.penalties.returnTo, walk: false };
  $('overlay').classList.add('hidden'); $('phone').classList.add('hidden'); phoneOpen = false;
  $('penaltyScreen').classList.remove('hidden'); document.body.classList.add('playing-penalties');
  updatePenaltyUI(); drawPenalties(); $('penaltyCanvas').focus();
}
function hidePenalties() { $('penaltyScreen').classList.add('hidden'); document.body.classList.remove('playing-penalties'); penaltyKeys.clear(); }
function penaltyTalk(action) {
  const m = G.penalties, person = PEOPLE[m.opponent];
  const own = { marcio: ['É o quê? Show de bola! Quero ver acertar esse canto!', 'Show de bola! Essa deu assunto pro domingo.'], marcelo: ['É o quê? Show de bola! Agora é comigo!', 'Ô Márcio, viu essa? Show de bola!'], badin: ['CUDIO! Capricha que eu tô cuidando desse gol!', 'DIO MADONA! Essa bola veio com vontade!'], guri: ['Chê, quero ver se o pé é tão bom quanto o xis!', 'Mas bah, essa vai virar causo no galpão!'], manolima: ['Nem a cadela baia pega um chute no cantinho!', 'O lobisome do Arvoredo também sabe bater uma bola!'] };
  m.talk = own[person.id]?.[action === 'inicio' ? 0 : 1] || (action === 'inicio' ? 'Bora, que hoje tem disputa no campinho!' : pick(['Bah, foi por um fio!', 'Agora quero ver a próxima!', 'Esse campinho ainda vai dar muita prosa!', 'Capricha no canto, vivente!']));
}
function penaltyNextTurn(first = false) {
  const m = G.penalties; if (!m || m.settled || !first && m.phase !== 'result') return;
  if (!first) m.turn = 1 - m.turn;
  m.phase = m.turn === 0 ? 'aim' : 'ai'; m.clock = 0; m.power = 0; m.aimX = 0; m.aimY = 1.1; m.curve = 0; m.keeperSide = 0; m.keeperHigh = 1.15; m.keeper = null; m.shot = null; m.result = ''; m.quit = false;
  penaltyKeys.clear(); penaltyTalk(first ? 'inicio' : 'rodada'); updatePenaltyUI(); save();
}
function penaltyPress() {
  const m = G.penalties; if (!m || m.paused || m.quit) return;
  AudioEngine.unlock();
  if (m.phase === 'aim') { m.phase = 'charge'; m.power = 0; updatePenaltyUI(); }
  else if (m.turn === 1 && ['ai','flight'].includes(m.phase) && !m.keeper) {
    m.keeper = { side: m.keeperSide, x: m.keeperSide * 2.65, y: m.keeperHigh, start: m.clock, duration: .40 };
    AudioEngine.noise(.10,.035,650); save();
  }
}
function penaltyRelease(cancel = false) {
  const m = G.penalties; if (!m || m.phase !== 'charge') return;
  if (cancel || m.paused || m.quit) { m.phase = 'aim'; m.power = 0; updatePenaltyUI(); return; }
  launchPenalty(0,m.aimX,m.aimY,m.power,m.curve);
}
function launchPenalty(owner,x,y,power,curve=0) {
  const m = G.penalties; if (!m || m.turn !== owner || !['aim','charge','ai'].includes(m.phase) || m.paused) return;
  power = clamp(power,.06,1);
  const error = owner === 0 ? Math.max(0,power-.84)*5 : 0;
  const tx = x + curve*.65 + Math.sin(m.clock*17)*error, ty = y + error*.55;
  m.shot = { owner, x: tx, y: ty, power, curve, start: m.clock, duration: 1.35-power*.72, resolved: false };
  m.phase = 'flight'; penaltyKeys.clear();
  if (owner === 0) {
    const skill = PENALTY_SKILL[PEOPLE[m.opponent].id] ?? .58;
    const guess = clamp(tx+(Math.random()-.5)*(4.4-skill*2),-2.85,2.85);
    m.keeper = { side: Math.sign(guess), x: guess, y: clamp(ty+(Math.random()-.5)*1.2,.5,1.9), start: m.clock+.17+(1-skill)*.16, duration: .5 };
  }
  AudioEngine.noise(.12,.12,260); AudioEngine.note(95,.10,'triangle',.10); updatePenaltyUI(); save();
}
function penaltyKeeperPosition(m=G.penalties) {
  const k = m.keeper;
  if (!k || m.clock < k.start) return { x: 0, y: 1, dive: 0, side: 0 };
  const age = m.clock-k.start, t = clamp(age/k.duration,0,1), rise = Math.sin(t*Math.PI/2), recover = clamp((age-.85)/.6,0,1);
  return { x: k.x*rise, y: 1+(k.y-1)*rise-recover*.7, dive: rise*(1-recover*.55), side: k.side };
}
function penaltyShotResult(shot,keeper) {
  const r=PENALTY.radius,x=Math.abs(shot.x),y=shot.y;
  if ((Math.abs(x-PENALTY.halfGoal)<=r&&y<=PENALTY.height+r) || (Math.abs(y-PENALTY.height)<=r&&x<=PENALTY.halfGoal+r)) return 'post';
  if (x>PENALTY.halfGoal-r || y>PENALTY.height-r || y<r) return 'out';
  if (Math.abs(shot.x-keeper.x)<.66 && Math.abs(shot.y-keeper.y)<.82) return 'save';
  return 'goal';
}
function penaltyWinner(score,used) {
  if(used[0]<=5&&used[1]<=5){if(score[0]>score[1]+5-used[1])return 0;if(score[1]>score[0]+5-used[0])return 1;}
  if(used[0]>=5&&used[0]===used[1]&&score[0]!==score[1])return score[0]>score[1]?0:1;
  return null;
}
function resolvePenalty() {
  const m=G.penalties,s=m?.shot;if(!s||s.resolved)return;
  s.resolved=true; s.result=penaltyShotResult(s,penaltyKeeperPosition());
  m.used[s.owner]++;m.history[s.owner].push(s.result);if(s.result==='goal')m.score[s.owner]++;
  m.result=({goal:'GOOOL!',save:'DEFENDEU!',post:'NA TRAVE!',out:'PRA FORA!'})[s.result];
  if(s.result==='goal')AudioEngine.ready();else if(s.result==='post')AudioEngine.note(440,.16,'triangle',.1);else AudioEngine.noise(.13,.06,450);
  m.phase='result';m.winner=penaltyWinner(m.score,m.used);penaltyTalk('rodada');
  if(m.winner!==null){m.phase='over';settlePenalties();}
  updatePenaltyUI();save();
}
function settlePenalties() {
  const m=G.penalties;if(!m||m.settled||m.winner===null)return;
  m.settled=true;G.footballRecord??={matches:0,wins:0};G.footballRecord.matches++;if(m.winner===0)G.footballRecord.wins++;
  addFriendship(m.opponent,2);m.talk=m.winner===0?'Bah, ganhou na bola! Na próxima eu quero revanche.':'Hoje deu pra mim! Bora outra quando tu quiser.';
}
function penaltyTick(dt) {
  const m=G.penalties;if(!m||m.paused||m.quit||paused||modal||document.hidden)return;
  m.clock+=dt;
  const h=(penaltyKeys.has('d')||penaltyKeys.has('ArrowRight')?1:0)-(penaltyKeys.has('a')||penaltyKeys.has('ArrowLeft')?1:0);
  const v=(penaltyKeys.has('w')||penaltyKeys.has('ArrowUp')?1:0)-(penaltyKeys.has('s')||penaltyKeys.has('ArrowDown')?1:0);
  if(m.turn===0&&['aim','charge'].includes(m.phase)){
    m.aimX=clamp(m.aimX+h*3.4*dt,-4.5,4.5);m.aimY=clamp(m.aimY+v*2.0*dt,.12,3.3);
    m.curve=clamp(m.curve+((penaltyKeys.has('e')?1:0)-(penaltyKeys.has('q')?1:0))*dt*1.5,-1,1);
    if(m.phase==='charge'){m.power=Math.min(1,m.power+dt/.95);if(m.power>=1)penaltyRelease();}
  }else if(m.turn===1&&['ai','flight'].includes(m.phase)&&!m.keeper){
    if(h)m.keeperSide=h;if(v)m.keeperHigh=clamp(m.keeperHigh+v*dt*2,.4,1.9);
    if(m.phase==='ai'&&m.clock>=1.45){
      const skill=PENALTY_SKILL[PEOPLE[m.opponent].id]??.58;
      launchPenalty(1,(Math.random()-.5)*(8.4-skill),.25+Math.random()*(2.8-skill*.5),.5+Math.random()*.38,(Math.random()-.5)*.7);
    }
  }
  // A cobrança da IA acontece mesmo se o jogador saltar antes da corrida.
  if(m.turn===1&&m.phase==='ai'&&m.clock>=1.45)launchPenalty(1,(Math.random()-.5)*7.8,.3+Math.random()*2.2,.65+Math.random()*.2);
  if(m.phase==='flight'&&m.clock-m.shot.start>=m.shot.duration)resolvePenalty();
  penaltyHUDClock+=dt;if(penaltyHUDClock>=.08){penaltyHUDClock=0;updatePenaltyUI();}
}
function togglePenaltyPause(force) {
  const m=G.penalties;if(!m)return;penaltyRelease(true);m.paused=force??!m.paused;penaltyKeys.clear();updatePenaltyUI();save();
}
function leavePenalties(force=false) {
  const m=G.penalties;if(!m)return;
  if(!m.settled&&!force){penaltyRelease(true);m.quit=true;penaltyKeys.clear();updatePenaltyUI();return;}
  worldOut={...m.returnTo,walk:false};G.penalties=null;hidePenalties();keys.clear();paused=false;save();refreshHUD();draw();canvas.focus();
}
function penaltyKeyDown(e) {
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)&&e.key!=='Escape')return;
  const k=e.key.length===1?e.key.toLowerCase():e.key;
  if(e.target.tagName==='BUTTON'&&e.target.id!=='penaltyKick'&&[' ','Enter'].includes(k))return;
  if([' ','Enter','Escape','a','d','w','s','q','e','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(k))e.preventDefault();
  const m=G.penalties;if(k==='Escape'&&!e.repeat){if(m.quit){m.quit=false;updatePenaltyUI();}else togglePenaltyPause();return;}
  if(m.paused||m.quit)return;
  if((k===' '||k==='Enter')&&!e.repeat){if(m.phase==='result')penaltyNextTurn();else if(m.phase==='over')leavePenalties();else penaltyPress();return;}
  penaltyKeys.add(k);
}
function penaltyKeyUp(e) { const k=e.key.length===1?e.key.toLowerCase():e.key;penaltyKeys.delete(k);if(k===' '||k==='Enter')penaltyRelease(); }
function penaltyAction(act) { if(act==='penaltyStart'){startPenalties();return true;}return false; }
function normalizePenaltySave(s) {
  if(!s.penalties)return;
  const m=s.penalties;
  if(m.version!==1||!specialOpponent(m.opponent)||!m.returnTo||!['aim','charge','ai','flight','result','over'].includes(m.phase)){s.penalties=null;return;}
  m.paused=true;m.quit=false;if(m.phase==='charge'){m.phase='aim';m.power=0;}
}

// Interface própria: botões acessíveis e pointer capture para soltar o chute fora do botão.
const penaltyScreen=document.createElement('section');penaltyScreen.id='penaltyScreen';penaltyScreen.className='penalty-screen hidden';penaltyScreen.setAttribute('aria-label','Disputa de pênaltis');
penaltyScreen.innerHTML=`<div class="penalty-view"><canvas id="penaltyCanvas" width="1200" height="700" tabindex="0" aria-label="Campo: mire com WASD ou setas; segure e solte Espaço para chutar."></canvas><div class="penalty-scoreboard"><small>CAMPINHO DA COMUNIDADE</small><strong id="penaltyScore"></strong><span id="penaltyRound"></span><div id="penaltyHistory"></div></div><div id="penaltyResult" role="status" aria-live="polite"></div></div><aside class="penalty-controls"><div id="penaltyOpponentPortrait"></div><h2 id="penaltyOpponentName"></h2><p id="penaltyTalk"></p><h3 id="penaltyStage"></h3><p id="penaltyHelp"></p><div class="penalty-meter"><span id="penaltyPowerText">Força</span><div><i id="penaltyPowerFill"></i></div><small>Faixa boa: 45–80% · acima de 85% perde precisão</small></div><div class="penalty-pad"><button data-penalty-move="w" aria-label="Mirar mais alto">↑</button><button data-penalty-move="a" aria-label="Mirar à esquerda">←</button><button id="penaltyCenter" aria-label="Centralizar mira">Centro</button><button data-penalty-move="d" aria-label="Mirar à direita">→</button><button data-penalty-move="s" aria-label="Mirar mais baixo">↓</button></div><label class="penalty-curve">Efeito da bola <input id="penaltyCurve" type="range" min="-1" max="1" step=".05" value="0"><span>Q ↶ · reto · ↷ E</span></label><button id="penaltyKick" class="primary">Segure para chutar</button><button id="penaltyNext" class="primary hidden">Próxima cobrança</button><div class="penalty-actions"><button id="penaltyPause">Pausar</button><button id="penaltyLeave">Sair</button></div><div id="penaltyQuit" class="hidden"><p>Sair desta disputa? O placar será descartado.</p><button id="penaltyQuitYes">Sair para o campinho</button><button id="penaltyQuitNo">Continuar partida</button></div></aside>`;
document.body.append(penaltyScreen);
const penaltyCanvas=$('penaltyCanvas'),penaltyContext=penaltyCanvas.getContext('2d');
function updatePenaltyUI() {
  const m=G.penalties;if(!m)return;
  const opponent=PEOPLE[m.opponent].name,defending=m.turn===1,locked=m.paused||m.quit,active=['aim','charge','ai','flight'].includes(m.phase);
  $('penaltyScore').textContent=`Você ${m.score[0]} × ${m.score[1]} ${opponent}`;
  $('penaltyRound').textContent=m.settled?'Fim de jogo':`${Math.min(...m.used)>=5?'Alternadas':'Série de 5'} · ${defending?opponent:'Você'} bate · cobrança ${m.used[m.turn]+(active?1:0)}`;
  setHTML($('penaltyHistory'),m.history.map((h,i)=>`<span>${i?'Rival':'Você'} ${Array.from({length:Math.max(5,h.length)},(_,j)=>`<b class="${j>=h.length?'pending':h[j]==='goal'?'goal':'miss'}">${j>=h.length?'·':h[j]==='goal'?'●':'×'}</b>`).join('')}</span>`).join(''));
  $('penaltyOpponentName').textContent=opponent;setHTML($('penaltyOpponentPortrait'),portraitHTML(m.opponent,76));$('penaltyTalk').textContent='“'+m.talk+'”';
  $('penaltyStage').textContent=m.quit?'Sair da disputa?':m.paused?'Partida pausada':m.settled?(m.winner===0?'Você venceu!':opponent+' venceu!'):m.phase==='result'?m.result:defending?'Sua vez no gol':m.phase==='flight'?'Acompanhe a bola':m.phase==='charge'?'Solte para bater':'Escolha o canto';
  $('penaltyHelp').textContent=defending?'A/D: lado · W/S: altura · Espaço: saltar. Espere a corrida do cobrador.':'WASD / setas: direção e altura · Q/E: efeito. Segure e solte Espaço para chutar.';
  $('penaltyResult').textContent=m.paused?'PAUSADO':m.phase==='result'||m.phase==='over'?m.result:'';
  $('penaltyPowerText').textContent=`Força · ${Math.round((m.shot?.power??m.power)*100)}%`;$('penaltyPowerFill').style.width=((m.shot?.power??m.power)*100)+'%';
  $('penaltyPowerFill').style.background=m.power>.85?'#ed784c':'#efd16b';
  $('penaltyKick').textContent=defending?(m.keeper?'Salto escolhido':'Saltar · Espaço'):m.phase==='charge'?'Solte para chutar':'Segure para chutar';
  $('penaltyKick').disabled=locked||!active||defending&&!!m.keeper||!defending&&m.phase==='flight';
  $('penaltyNext').classList.toggle('hidden',!['result','over'].includes(m.phase));$('penaltyNext').disabled=locked;$('penaltyNext').textContent=m.settled?'Voltar ao campinho':'Próxima cobrança';
  $('penaltyPause').textContent=m.paused?'Continuar':'Pausar';$('penaltyQuit').classList.toggle('hidden',!m.quit);
  $('penaltyCurve').disabled=locked||defending||!['aim','charge'].includes(m.phase);$('penaltyCurve').value=m.curve;
  for(const b of penaltyScreen.querySelectorAll('[data-penalty-move],#penaltyCenter'))b.disabled=locked||!active;
}
$('penaltyKick').addEventListener('pointerdown',e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);penaltyPress();});
$('penaltyKick').addEventListener('pointerup',()=>penaltyRelease());
for(const type of ['pointercancel','lostpointercapture'])$('penaltyKick').addEventListener(type,()=>penaltyRelease(true));
for(const b of penaltyScreen.querySelectorAll('[data-penalty-move]')){
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);penaltyKeys.add(b.dataset.penaltyMove);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>penaltyKeys.delete(b.dataset.penaltyMove));
}
$('penaltyCenter').onclick=()=>{const m=G.penalties;if(m&&!m.paused&&!m.quit){m.aimX=0;m.keeperSide=0;}};
$('penaltyCurve').oninput=e=>{if(G.penalties&&!e.target.disabled)G.penalties.curve=Number(e.target.value);};
$('penaltyNext').onclick=()=>G.penalties?.settled?leavePenalties():penaltyNextTurn();
$('penaltyPause').onclick=()=>togglePenaltyPause();$('penaltyLeave').onclick=()=>leavePenalties();
$('penaltyQuitYes').onclick=()=>leavePenalties(true);$('penaltyQuitNo').onclick=()=>{G.penalties.quit=false;updatePenaltyUI();};
penaltyCanvas.addEventListener('pointerdown',e=>{const m=G.penalties;if(!m||m.paused||m.quit||!['aim','charge','ai'].includes(m.phase))return;const r=penaltyCanvas.getBoundingClientRect(),sx=(e.clientX-r.left)*1200/r.width,sy=(e.clientY-r.top)*700/r.height;const x=(sx-600)*18/1300,y=2.6-(sy-125)*18/1300;if(m.turn===0){m.aimX=clamp(x,-4.5,4.5);m.aimY=clamp(y,.12,3.3);}else{m.keeperSide=Math.abs(x)<.8?0:Math.sign(x);m.keeperHigh=clamp(y,.4,1.9);}penaltyCanvas.focus();e.preventDefault();});
window.addEventListener('blur',()=>{if(G.penalties)togglePenaltyPause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.penalties)togglePenaltyPause(true);});
