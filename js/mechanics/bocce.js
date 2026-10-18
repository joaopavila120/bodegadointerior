// Bocha arcade: estado serializável em G.bocce; a física usa coordenadas da cancha,
// independentes da perspectiva da imagem e da resolução da tela.
'use strict';
const BOCCE={width:600,length:1100,launchY:1030,radius:12,drag:.95,target:2,step:1/120};
// Cada adversário tem seu jeito de jogar: o erro de mira e de força define a precisão da IA.
const BOCCE_LEVELS={
 tutorial:{name:'Treino com o Mano Lima',angle:.14,power:.17,attack:0},
 pessimo:{name:'Joga muito mal',angle:.2,power:.24,attack:0},
 fraco:{name:'Joga mal',angle:.085,power:.11,attack:.1},
 medio:{name:'Joga razoável',angle:.035,power:.05,attack:.3},
 bom:{name:'Joga bem',angle:.013,power:.019,attack:.45},
 // Níveis antigos, mantidos para partidas salvas.
 easy:{name:'Fácil',angle:.065,power:.085,attack:.2},normal:{name:'Normal',angle:.027,power:.04,attack:.35},hard:{name:'Difícil',angle:.012,power:.018,attack:.45}
};
const BOCCE_SKILL={marcio:'pessimo',marcelo:'pessimo',peixinhonabrasa:'fraco',indavirus:'medio',lauro:'bom',manolima:'bom',badin:'bom',guri:'bom',dianho:'fraco',mitodosul:'medio',loligebien:'fraco',jayme:'bom',baitaca:'bom',gaudencio:'medio',valter:'medio'};
function bocceSkill(person){return BOCCE_SKILL[PEOPLE[person]?.id]||'medio';}
const bocceArt=new Image();bocceArt.src='assets/images/bocha.webp';
const bocceCanvas=$('bocceCanvas'),bocceContext=bocceCanvas.getContext('2d');
let bocceAccumulator=0;

function bocceMenu(){
 if(!started||G.game||G.bocce||G.task){say('Termine a ação atual antes de ir à cancha.');return;}
 if(!boccePeople().length){warnDialog('Ninguém pra jogar ainda','Bocha é com os amigos: faça amizade na bodega e puxe prosa na rua. Com amizade '+CONTACT_AT+', o especial vira contato e aceita jogar.');return;}

 openDialog('Bora pra cancha!',`<p>Quatro bochas por lado. Chegue mais perto do bolim para pontuar. Partida em <b>melhor de 3 rodadas</b>: vence quem ganhar 2, com lançamentos alternados.</p><div class="grid"><div class="panel"><h3>Aposta da partida</h3><label for="bocceWager">Valor por jogador</label><select id="bocceWager">${WAGER_OPTIONS.map(n=>`<option value="${n}" ${hasCash(n)?'':'disabled'}>${n?money(n):'Sem aposta · treino'}</option>`).join('')}</select><p>A entrada sai do caixa agora. Vitória devolve o dobro; derrota ou desistência perde a entrada. Empate na rodada não dá pontos.</p></div><div class="panel"><h3>Convidar um contato</h3><label>Quem joga? <select id="bocceOpponent">${boccePeople().map(i=>`<option value="${i}">${PEOPLE[i].name}</option>`).join('')}</select></label><p>${sportStanding('bocha')}</p><p>Cada adversário tem seu nível: uns erram quase tudo, outros encostam no bolim e ainda tiram sua bocha do ponto.</p></div></div><div class="callout"><b>A / D ou ← / →</b>: escolha de onde lançar.<br><b>E</b>: trave a direção; aperte de novo para definir a força. <b>Espaço</b> pula a fala do adversário.<br>No celular, use os botões ao lado da cancha.</div><p>A bodega fica pausada durante a partida. Seu progresso na cancha também é salvo.</p><div class="actions"><button class="primary" data-act="startBocce">Entrar na cancha</button><button data-act="close">Voltar ao caixa</button></div>`,'bocceSetup');
}
function startBocceGame(){
 if(modal!=='bocceSetup'||G.bocce||G.game||G.task)return;
 const wager=Number($('bocceWager').value),opponent=Number($('bocceOpponent')?.value),level=bocceSkill(opponent);if(!specialOpponent(opponent))return;
 if(!WAGER_OPTIONS.includes(wager)||!BOCCE_LEVELS[level]||!hasCash(wager))return;
 spendCash(wager);G.stats.bocceStakes=(G.stats.bocceStakes||0)+wager;
 G.bocce={version:1,opponent,wager,level,score:[0,0],round:0,used:[0,0],balls:[],phase:'jack',turn:0,playerX:300,aiX:300,angle:0,power:0,clock:0,aimClock:0,powerClock:0,effects:[],settled:false,paused:false,lastBall:null,result:'',winner:null};
 closeDialog(true);if(phoneOpen)togglePhone(false);G.player.walk=false;
 sportTalk(G.bocce,'bocha','inicio');startNextBocceRound();showBocce();syncBocceReport();save();AudioEngine.unlock();
}
function showBocce(){
 if(!G.bocce)return;modal=null;paused=false;keys.clear();pointerHold=false;bocceAccumulator=0;
 $('canchaLobby').classList.add('hidden');$('bocceMatchUI').classList.remove('hidden');$('overlay').classList.add('hidden');$('bocceScreen').classList.remove('hidden');
 document.body.classList.add('playing-bocce');bocceCanvas.focus();updateBocceUI();drawBocce();
}
function startNextBocceRound(){
 const b=G.bocce;if(!b||!['jack','between'].includes(b.phase)||b.settled)return;
 b.round++;b.used=[0,0];b.balls=[];b.effects=[];b.result='';b.clock=0;b.phase='jack';b.turn=(b.round-1)%2;b.lastBall=null;
 // Lançamento automático do bolim até uma posição válida no terço mais distante.
 b.jackTarget={x:115+Math.random()*370,y:175+Math.random()*150};
 b.balls.push({id:0,owner:-1,x:300,y:BOCCE.launchY,vx:0,vy:0,r:7,mass:.5});
 keys.clear();save();updateBocceUI();
}
function startBocceTurn(){
 const b=G.bocce;b.clock=0;b.aimClock=0;b.powerClock=0;b.power=0;b.angle=0;
 b.phase=b.turn===0?'direction':'ai';if(b.turn===0)sportTalk(b,'bocha','direcao');keys.clear();save();updateBocceUI();
}
function bocceSpeed(power){return 80+1000*Math.pow(clamp(power,0,1),1.65);}
function boccePowerForDistance(distance){return clamp(Math.pow(Math.max(0,distance*BOCCE.drag+4-80)/1000,1/1.65),0,1);}
function throwBocce(owner,x,angle,power,variation=true){
 const b=G.bocce;if(!b||b.used[owner]>=4||owner!==b.turn)return;
 const speed=bocceSpeed(power)*(variation?1+(Math.random()-.5)*.025:1),ball={id:b.balls.length,owner,x:clamp(x,25,575),y:BOCCE.launchY,vx:Math.sin(angle)*speed,vy:-Math.cos(angle)*speed,r:BOCCE.radius,mass:1};
 b.balls.push(ball);b.lastBall=ball.id;b.used[owner]++;b.phase='rolling';b.clock=0;b.lastPower=power;
 sportTalk(b,'bocha','lancamento');bocceEffect(ball.x,ball.y,'dust');AudioEngine.noise(.16,.065,700);keys.clear();save();updateBocceUI();
}
function confirmBocce(){
 const b=G.bocce;if(!b)return;AudioEngine.unlock();
 if(b.paused){toggleBoccePause(false);return;}
 if(b.phase==='direction'){sportTalk(b,'bocha','forca');b.phase='power';b.powerClock=0;b.power=0;keys.clear();AudioEngine.tick();save();}
 else if(b.phase==='power')throwBocce(0,b.playerX,b.angle,b.power);
 else if(b.phase==='between')startNextBocceRound();
 else if(b.phase==='over')leaveBocce();
 updateBocceUI();
}
function enemyBocceTurn(){
 const b=G.bocce,jack=b.balls[0],level=BOCCE_LEVELS[b.level];let target=jack;
 const threats=b.balls.filter(ball=>ball.owner===0).sort((a,c)=>bocceDistance(a,jack)-bocceDistance(c,jack));
 const attack=threats[0]&&bocceDistance(threats[0],jack)<65&&Math.random()<(level.attack??.35);
 if(attack)target=threats[0];
 b.aiX=70+Math.random()*460;
 const dx=target.x-b.aiX,dy=BOCCE.launchY-target.y,distance=Math.hypot(dx,dy);
 const angle=Math.atan2(dx,dy)+(Math.random()*2-1)*level.angle;
 const power=clamp(boccePowerForDistance(distance)*(attack?1.13:1)+(Math.random()*2-1)*level.power,0,1);
 throwBocce(1,b.aiX,angle,power);
}
function bocceDistance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function bocceEffect(x,y,type,text=''){const b=G.bocce;if(!b)return;b.effects.push({x,y,type,text,life:type==='text'?1.7:.45,total:type==='text'?1.7:.45});}
function handleBocceCollision(a,b){
 const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),required=a.r+b.r;if(d>=required)return false;
 const nx=d>1e-6?dx/d:1,ny=d>1e-6?dy/d:0,ia=1/a.mass,ib=1/b.mass,overlap=required-d+.01;
 a.x-=nx*overlap*ia/(ia+ib);a.y-=ny*overlap*ia/(ia+ib);b.x+=nx*overlap*ib/(ia+ib);b.y+=ny*overlap*ib/(ia+ib);
 const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
 if(closing<0){const impulse=-(1+.62)*closing/(ia+ib);a.vx-=impulse*nx*ia;a.vy-=impulse*ny*ia;b.vx+=impulse*nx*ib;b.vy+=impulse*ny*ib;
  if(closing<-25){bocceEffect((a.x+b.x)/2,(a.y+b.y)/2,'impact');AudioEngine.note(220+Math.min(500,-closing),.065,'triangle',.055);}
 }
 return true;
}
function bocceWalls(ball){
 const r=ball.r;
 if(ball.x<r){ball.x=r;ball.vx=Math.abs(ball.vx)*.36;}else if(ball.x>BOCCE.width-r){ball.x=BOCCE.width-r;ball.vx=-Math.abs(ball.vx)*.36;}
 if(ball.y<r){ball.y=r;ball.vy=Math.abs(ball.vy)*.36;}else if(ball.y>BOCCE.length-r){ball.y=BOCCE.length-r;ball.vy=-Math.abs(ball.vy)*.36;}
}
function updateBoccePhysics(dt){
 const b=G.bocce,damping=Math.exp(-BOCCE.drag*dt);
 for(const ball of b.balls){
  if(Math.hypot(ball.vx,ball.vy)>3){
   // Imperfeição muito sutil da terra; independe da taxa de quadros.
   ball.vx+=Math.sin(ball.y*.023+ball.x*.011)*.7*dt;
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=damping;ball.vy*=damping;
  }else if(ball.vx||ball.vy){ball.vx=ball.vy=0;bocceEffect(ball.x,ball.y,'stop');AudioEngine.note(155,.04,'triangle',.018);}
  bocceWalls(ball);
 }
 // Subpassos de 1/120 s evitam atravessar uma bola mesmo nas batidas fortes.
 for(let pass=0;pass<2;pass++)for(let i=0;i<b.balls.length;i++)for(let j=i+1;j<b.balls.length;j++)handleBocceCollision(b.balls[i],b.balls[j]);
 for(const ball of b.balls)bocceWalls(ball);
 return b.balls.some(ball=>Math.hypot(ball.vx,ball.vy)>0);
}
function calculateBocceRoundScore(balls){
 const jack=balls.find(ball=>ball.owner===-1),teams=[0,1].map(owner=>balls.filter(ball=>ball.owner===owner).map(ball=>bocceDistance(ball,jack)).sort((a,b)=>a-b));
 if(!teams[0].length||!teams[1].length)return{winner:null,points:0,distances:teams};
 if(Math.abs(teams[0][0]-teams[1][0])<=.5)return{winner:null,points:0,distances:teams};
 const winner=teams[0][0]<teams[1][0]?0:1;
 return{winner,points:teams[winner].filter(d=>d<teams[1-winner][0]-.5).length,distances:teams};
}
function finishBocceRound(){
 const b=G.bocce;if(!b||b.used.some(n=>n!==4)||['between','over'].includes(b.phase))return;
 const result=calculateBocceRoundScore(b.balls);b.measurements=result.distances;sportTalk(b,'bocha','rodada');
 // Melhor de 3: cada rodada vale uma vitória para quem deixou a bocha mais perto do bolim.
 if(result.winner!==null)b.score[result.winner]+=1;
 b.result=result.winner===null?'Empate técnico: a rodada não conta.':(result.winner===0?'Você venceu a rodada':'O adversário venceu a rodada')+' · '+result.points+(result.points===1?' bocha':' bochas')+' mais perto';
 b.phase='between';if(b.score.some(n=>n>=BOCCE.target))settleBocce(b.score[0]>=BOCCE.target?0:1);
 else AudioEngine.ready();save();updateBocceUI();
}
function settleBocce(winner){
 const b=G.bocce;if(!b||b.settled)return;
 b.settled=true;b.winner=winner;b.phase='over';
 if(winner===0){const prize=b.wager*2;G.cash=round(G.cash+prize);G.stats.bocceReturns=(G.stats.bocceReturns||0)+prize;b.result=b.wager?'Vitória! '+money(prize)+' voltaram ao caixa.':'Vitória no treino!';AudioEngine.coins();}
 else{b.result=b.wager?'O adversário venceu. Entrada de '+money(b.wager)+' perdida.':'O adversário venceu o treino.';AudioEngine.bad();}
 settleSport('bocha',b,winner===0);syncBocceReport();save();updateBocceUI();
 // Treino com o Lauro: depois de ver o resultado, a partida fecha sozinha e vem a explicação da cancha.
 if(b.tutorial&&!b.bracket)setTimeout(()=>{if(G.bocce===b&&!modal)leaveBocce();},2200);
}
function syncBocceReport(){if(G.report){G.report.end=G.cash;G.report.bocceStakes=G.stats.bocceStakes||0;G.report.bocceReturns=G.stats.bocceReturns||0;}}
function leaveBocce(){
 const b=G.bocce;if(!b)return;
 if(!b.settled&&!confirm(b.wager?'Desistir perde a aposta de '+money(b.wager)+'. Sair da partida?':'Encerrar este treino de bocha?'))return;
 if(!b.settled)settleBocce(1);
 G.bocce=null;keys.clear();$('bocceScreen').classList.add('hidden');document.body.classList.remove('playing-bocce');bocceAccumulator=0;save();refreshHUD();if(b.tutorial&&!b.bracket){showBocceTutorialEnd();return;}if(b.bracket)showSportBracket();else if(G.atCancha||worldOut?.map==='cancha')showCanchaLobby();else if(G.phase==='closed')showReport();else canvas.focus();
}
function toggleBoccePause(value){const b=G.bocce;if(!b)return;b.paused=typeof value==='boolean'?value:!b.paused;keys.clear();save();updateBocceUI();}
function bocceTick(dt){
 const b=G.bocce;if(!b||b.paused||document.hidden)return;b.clock+=dt;
 for(const e of b.effects)e.life-=dt;b.effects=b.effects.filter(e=>e.life>0);
 if(b.phase==='jack'){const t=clamp(b.clock/1.2,0,1),ease=1-(1-t)**2;b.balls[0].x=300+(b.jackTarget.x-300)*ease;b.balls[0].y=BOCCE.launchY+(b.jackTarget.y-BOCCE.launchY)*ease;if(t>=1)startBocceTurn();}
 else if(b.phase==='direction'){
  const move=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0);
  b.playerX=clamp(b.playerX+move*190*dt,30,570);b.aimClock+=dt;b.angle=Math.sin(b.aimClock*.95)*.31;
 }else if(b.phase==='power'){b.powerClock+=dt;const sweep=(b.powerClock/(b.tutorial?1.9:.95))%2;b.power=sweep<=1?sweep:2-sweep;}
 else if(b.phase==='ai'&&b.clock>=1.1)enemyBocceTurn();
 else if(b.phase==='rolling'){
  bocceAccumulator+=dt;let moving=true;
  while(bocceAccumulator>=BOCCE.step){moving=updateBoccePhysics(BOCCE.step);bocceAccumulator-=BOCCE.step;}
  if(!moving){const last=b.balls.find(ball=>ball.id===b.lastBall);if(last&&bocceDistance(last,b.balls[0])<45){sportTalk(b,'bocha','aproximacao');bocceEffect(last.x,last.y,'text','BOA!');AudioEngine.ready();}b.phase='settling';b.clock=0;save();}
 }else if(b.phase==='settling'&&b.clock>.65){if(b.used[0]===4&&b.used[1]===4)finishBocceRound();else{b.turn=1-b.turn;startBocceTurn();}}
 updateBocceUI();
}
function updateBocceUI(){
 const b=G.bocce;if(!b)return;updateBocceSocial();
 $('bocceScore').textContent=b.score[0]+' × '+b.score[1];$('bocceRound').textContent='Rodada '+b.round+' · melhor de 3';
 $('bocceRemaining').textContent='Você: '+('🔵 '.repeat(4-b.used[0])||'nenhuma')+'\n'+sportName(b.opponent)+': '+('🔴 '.repeat(4-b.used[1])||'nenhuma');
 $('bocceWallet').textContent=walletText()+' · '+(b.wager?'aposta '+money(b.wager):'sem aposta');
 const stages={jack:'O bolim está sendo lançado',direction:'1 · Escolha a direção',power:'2 · Escolha a força',ai:'O adversário prepara o lançamento',rolling:'Bocha rolando…',settling:'Medindo a aproximação…',between:'Rodada encerrada',over:b.winner===0?'Você venceu!':'Fim da partida'};
 $('bocceStage').textContent=b.paused?'Partida pausada':stages[b.phase];$('bocceResult').textContent=b.result;
 $('boccePowerPanel').classList.toggle('hidden',b.phase!=='power');$('boccePowerFill').style.width=(b.power*100)+'%';$('boccePowerValue').textContent=Math.round(b.power*100)+'%';
 const button=$('bocceConfirm');button.disabled=!b.paused&&!['direction','power','between','over'].includes(b.phase);button.textContent=b.paused?'Retomar':({direction:'Travar direção · E',power:'Lançar · E',between:'Próxima rodada',over:'Voltar à bodega'}[b.phase]||'Aguarde o lançamento');
 $('boccePause').textContent=b.paused?'Retomar':'Pausar';$('bocceExit').textContent=b.settled?'Voltar à bodega':'Sair da partida';
 document.querySelectorAll('[data-bocce-move]').forEach(button=>button.disabled=b.paused||b.phase!=='direction');
 $('bocceMeasurements').textContent=b.measurements&&['between','over'].includes(b.phase)?'Distância ao bolim · você: '+b.measurements[0].map(n=>Math.round(n)).join(', ')+' · '+sportName(b.opponent)+': '+b.measurements[1].map(n=>Math.round(n)).join(', '):'';
}
// Projeta a cancha retangular no trapézio da arte fornecida (1672 × 941).
function projectBocce(x,y){const t=clamp(y/BOCCE.length,0,1),width=420+1240*t;return{x:870-34*t+(x/BOCCE.width-.5)*width,y:315+626*t,scale:width/BOCCE.width};}
function drawBocce(){
 const b=G.bocce;if(!b)return;const c=bocceContext,cw=bocceCanvas.clientWidth,ch=bocceCanvas.clientHeight,dpr=renderDpr();
 if(bocceCanvas.width!==Math.round(cw*dpr)||bocceCanvas.height!==Math.round(ch*dpr)){bocceCanvas.width=Math.round(cw*dpr);bocceCanvas.height=Math.round(ch*dpr);}
 c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#20180f';c.fillRect(0,0,cw,ch);
 const scale=Math.min(cw/1672,ch/941),ox=(cw-1672*scale)/2,oy=(ch-941*scale)/2;c.translate(ox,oy);c.scale(scale,scale);c.imageSmoothingEnabled=false;
 if(bocceArt.complete&&bocceArt.naturalWidth)c.drawImage(bocceArt,0,0,1672,941);
 const px=b.turn===0?b.playerX:b.aiX,p=projectBocce(px,BOCCE.launchY);
 // O lançador fica atrás da linha, sem ocultar as bochas no centro da cancha.
 drawCharacterPortrait(c,b.turn===0?avatarSprite():PEOPLE[b.opponent??sportPeople()[0]].sprite,clamp(p.x-80,95,1540),p.y+25,230);
 if(['direction','power'].includes(b.phase)){
  c.strokeStyle='#ffefab';c.lineWidth=4;c.setLineDash([7,9]);c.beginPath();c.moveTo(p.x,p.y);
  const end=projectBocce(px+Math.sin(b.angle)*130,BOCCE.launchY-Math.cos(b.angle)*130);c.lineTo(end.x,end.y);c.stroke();c.setLineDash([]);
  const angle=Math.atan2(end.y-p.y,end.x-p.x);c.beginPath();c.moveTo(end.x,end.y);c.lineTo(end.x-19*Math.cos(angle-.45),end.y-19*Math.sin(angle-.45));c.moveTo(end.x,end.y);c.lineTo(end.x-19*Math.cos(angle+.45),end.y-19*Math.sin(angle+.45));c.stroke();
 }
 const nearest=b.balls.filter(ball=>ball.owner>=0).sort((a,d)=>bocceDistance(a,b.balls[0])-bocceDistance(d,b.balls[0]))[0];
 for(const ball of [...b.balls].sort((a,d)=>a.y-d.y)){
  const point=projectBocce(ball.x,ball.y),r=ball.r*point.scale;c.fillStyle='#27150766';c.beginPath();c.ellipse(point.x+4,point.y+4,r*1.05,r*.52,0,0,Math.PI*2);c.fill();
  c.fillStyle=ball.owner===-1?'#fce7a1':ball.owner===0?'#4ca4db':'#dd644c';c.strokeStyle=ball.owner===-1?'#724d20':ball.owner===0?'#204d78':'#792c23';c.lineWidth=Math.max(2,point.scale*1.5);
  c.beginPath();c.arc(point.x,point.y-r*.35,r,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff1c77f';c.fillRect(point.x-r*.4,point.y-r*.9,r*.45,r*.35);
  if(nearest?.id===ball.id){c.strokeStyle='#fff5a0';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.ellipse(point.x,point.y+3,r+8,r*.65+6,0,0,Math.PI*2);c.stroke();c.setLineDash([]);}
 }
 for(const e of b.effects){const point=projectBocce(e.x,e.y),age=1-e.life/e.total;c.globalAlpha=1-age;
  if(e.type==='text'){c.font='bold 27px monospace';c.textAlign='center';c.fillStyle='#fff4ae';c.strokeStyle='#452d15';c.lineWidth=4;c.strokeText(e.text,point.x,point.y-35-age*28);c.fillText(e.text,point.x,point.y-35-age*28);}
  else{c.fillStyle=e.type==='impact'?'#ffe6ad':'#d3a273';for(let i=0;i<6;i++){const angle=i*Math.PI/3;c.fillRect(point.x+Math.cos(angle)*age*40,point.y+Math.sin(angle)*age*17,5,5);}}
 }c.globalAlpha=1;c.setTransform(1,0,0,1,0,0);
}
function bocceKeyDown(event){
 const key=event.key.length===1?event.key.toLowerCase():event.key;
 if([' ','e','a','d','ArrowLeft','ArrowRight','Escape'].includes(key))event.preventDefault();
 if(event.repeat&&[' ','e','Escape'].includes(key))return;
 if(key==='Escape'){toggleBoccePause();return;}
 // Espaço pula a fala do adversário; E trava a direção, lança e segue a partida.
 if(key===' '){if(!$('bocceTalkUI').classList.contains('hidden'))bocceTalkClick();return;}
 if(key==='e'){confirmBocce();return;}
 if(!G.bocce.paused&&G.bocce.phase==='direction'&&['a','d','ArrowLeft','ArrowRight'].includes(key))keys.add(key);
}
$('bocceConfirm').addEventListener('click',confirmBocce);
$('boccePause').addEventListener('click',()=>toggleBoccePause());
$('bocceExit').addEventListener('click',leaveBocce);
bocceCanvas.addEventListener('click',()=>{if(['direction','power'].includes(G.bocce?.phase))confirmBocce();});
for(const button of document.querySelectorAll('[data-bocce-move]')){
 button.addEventListener('pointerdown',e=>{e.preventDefault();if(!G.bocce||G.bocce.paused||G.bocce.phase!=='direction')return;button.setPointerCapture(e.pointerId);keys.add(button.dataset.bocceMove);});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,()=>keys.delete(button.dataset.bocceMove));
}
