'use strict';

// A bodega cresce aos poucos: conta os dias desde o primeiro dia de portas abertas (o do tutorial). No começo vem menos
// gente, com mais paciência e pedidos pequenos; depois, grupos maiores, mais pressa e mais pedidos em falta.
function bodegaDays(day=G.day){return Math.max(1,day-((G.tutorial&&G.tutorial.day)||1)+1);}
function difficulty(day=G.day){const n=bodegaDays(day),lvl=bodegaLevel();return {day:n,maxGroup:n<3?2:n<5?3:4,maxItems:n<3?1:n<7?2:3,fights:n>=5,pace:(n<=2?1.3:n<=4?1.15:n<=7?1:n<=12?.92:.85)*(1-Math.min(.12,(lvl-1)*.02)),patience:n<=2?1.25:n<=4?1.15:n<=7?1:n<=12?.95:.9,missing:n<=2?.1:n<=6?.2:.28,label:n===1?'Tutorial':n<3?'Primeiros fregueses':n<5?'Casa conhecida':n<7?'Casa movimentada':n<13?'Bodega cheia':'Bodega afamada'};}
function restaurantGroupSize(person){
 const d=difficulty(),pair=PEOPLE[person].partner&&Math.random()<.8;
 if(d.maxGroup===2)return pair||Math.random()<.55?2:1;
 const r=Math.random();return r<.12?1:r<.43?2:d.maxGroup===3||r<.7?3:4;
}
function fightsAllowed(){return G.day>1&&(G.event.id==='campeonato'||difficulty().fights);}
function fixedTableModes(state=G){for(const t of state.tables){t.mode=t.id===1||state.event.id==='campeonato'&&['open','closing'].includes(state.phase)?'truco':'restaurant';delete t.previousMode;}}


function plannedEvent(){if(!G.nextEvent){G.nextEvent=eventForDay(G.day+1,G);save();}return G.nextEvent;}

// A porta da cancha (fechada, com placa) está pintada no cenário, na parede direita (room2.png).
const CANCHA_DOOR={id:'cancha',x:1485,y:300,w:80,h:80,label:'Porta da cancha de bocha'};
const CANCHA_DOOR_SHAPE=[[1485,181],[1564,207],[1564,372],[1485,324]];
// A cancha agora tem entrada só por fora, pelo pátio.
function nearCanchaDoor(){return false;}
function nearTrucoTable(){return availableTables().filter(isTableTruco).find(t=>distRect(G.player,t)<65);}
function enterCancha(fromOutside=false){
 if(!started||G.task||G.game||G.bocce||!fromOutside&&!nearCanchaDoor()){say('Vá até a porta à direita do salão para entrar na cancha.');return;}
 if(sportState().bocceTutorialDay===G.day){warnDialog('Cancha fechada','Hoje o Lauro já guardou as bochas. A cancha abre de novo amanhã.');return;}
 if(phoneOpen)togglePhone(false);G.atCancha=true;G.player.walk=false;keys.clear();pointerHold=false;modal=null;paused=false;$('overlay').classList.add('hidden');showCanchaLobby();save();
}
// A cancha agora é um lugar para andar: entra-se nela (ou volta-se de uma partida) com a bocha no meio.
function showCanchaLobby(){
 $('bocceScreen').classList.add('hidden');document.body.classList.remove('playing-bocce');G.atCancha=false;
 if(worldOut?.map!=='cancha')worldOut={map:'cancha',...CANCHA_IN.spawn,dx:0,dy:-1,walk:false};keys.clear();refreshHUD();
}
function drawCanchaLobby(){
 const c=bocceContext,cw=bocceCanvas.clientWidth,ch=bocceCanvas.clientHeight,dpr=renderDpr();
 if(bocceCanvas.width!==Math.round(cw*dpr)||bocceCanvas.height!==Math.round(ch*dpr)){bocceCanvas.width=Math.round(cw*dpr);bocceCanvas.height=Math.round(ch*dpr);}
 c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#20180f';c.fillRect(0,0,cw,ch);
 const scale=Math.min(cw/1672,ch/941);c.translate((cw-1672*scale)/2,(ch-941*scale)/2);c.scale(scale,scale);c.drawImage(bocceArt,0,0,1672,941);
}
function leaveCancha(toPatio=false){if(G.bocce)return;G.atCancha=false;if(!toPatio)worldOut=null;$('bocceScreen').classList.add('hidden');document.body.classList.remove('playing-bocce');closeDialog(true);save();refreshHUD();if(!toPatio&&G.phase==='closed'&&G.giftQueue?.length)startGiftVisit();}
function drawCanchaDoor(){
 if(!started||!nearCanchaDoor())return;
 ctx.save();ctx.beginPath();CANCHA_DOOR_SHAPE.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
 ctx.fillStyle='#ffdb6830';ctx.fill();ctx.strokeStyle='#fce497';ctx.lineWidth=3;ctx.stroke();ctx.restore();
 rect(1440,140,170,30,'#2b1c10e6',7,'#fce497');txt('Aperte E para entrar',1525,155,14,'#fff4c4');
}

function updateContextActions(){
 const n=nearest(),table=nearTrucoTable();
 $('enterCanchaButton').classList.toggle('hidden',!nearCanchaDoor()||!!G.task);
 $('playTrucoButton').classList.toggle('hidden',!table||!!G.task);
 $('playTrucoButton').disabled=!!table?.fight;
 $('refuseFiadoButton').classList.toggle('hidden',!fiadoFirst()||!!G.task);$('dismissButton').classList.toggle('hidden',fiadoFirst()||!!G.task||!counterCustomer()||tutorialActive());updateSlingButton();updateHortaBar();updateFarmStatus();document.body.classList.toggle('world-out',!!worldOut);$('canchaExitButton').classList.toggle('hidden',worldOut?.map!=='cancha'||!!modal);
 $('hint').classList.toggle('hidden',worldOut?false:!!(G.lasso||G.bocce||scene)||nearShopDoor()&&!G.task||!G.task&&!n&&!nearCanchaDoor()&&!nearShopDoor()&&G.day>1);
 const toast=G.toastLesson&&!G.toastLesson.done&&G.toastLesson.actor&&G.day>=G.toastLesson.day;
 $('tutorialHint').classList.toggle('hidden',!toast&&(!firstDay()||!!scene||(phoneOpen&&!tutorialStockMissing().length)||!!G.task||!!G.dialogue));if(toast)$('tutorialHint').textContent='Torrada: pegue um pão de xis e coloque na chapa junto do salame. Use o mesmo espaço, aguarde 6 s, retire e sirva com E.';
 if(firstDay())setHTML($('tutorialHint'),tutorialHint());
 if((costelaoTutorialActive()||costelaoPrepFirst())&&!scene){$('tutorialHint').classList.remove('hidden');$('tutorialHint').innerHTML=costelaoTutorialHint();}
 else if(!toast&&doorReminder()){$('tutorialHint').classList.remove('hidden');setHTML($('tutorialHint'),doorReminder());}
 // Os avisos da bodega (porta, tutorial, costelão) ficam só dentro dela.
 if(worldOut&&!(tutorialActive()&&G.phase==='prep'))$('tutorialHint').classList.add('hidden');
 // Prólogo da roça e desafiante esperando na cancha: o quadro vale dentro e fora da bodega.
 const guide=!scene&&!G.lasso&&(prologueActive()?prologueHint():waitingHint());
 if(guide){$('tutorialHint').classList.remove('hidden');setHTML($('tutorialHint'),guide);}
 $('gameSidebar').classList.toggle('lasso-mode',!!G.lasso);
 $('gameSidebar').classList.toggle('focused-task',['weigh','pour'].includes(G.task?.type)||G.fightTarget!==null);
}




function awardTelevision(){
 if(!firstDay()||G.tv)return false;G.tv=true;G.tvAwardPending=true;return true;
}
// Fim do primeiro dia: o vizinho Valter entra e dá a TV de presente (em cena; sem cenas, num quadro).
function showTelevisionAward(){
 if(scenesEnabled()){playScene('tv',()=>{G.tvAwardPending=false;save();showReport();});return;}
 openDialog('Presente do vizinho: uma TV!',`<div class="rpg-speaker">${portraitHTML(PEOPLE.findIndex(p=>p.id==='valter'),88)}<div><p><b>Valter</b>: “Bodega que se preze precisa passar os Gre-Nal! Me criei junto com o teu pai, guri. Toma essa TV pra começar.”</p><p>Ela fica guardada e vai para a parede nos dias de jogo do Grêmio, do Inter e Gre-Nal.</p></div></div><div class="callout"><b>Amizade rende presente</b><br>Atendendo bem, jogando truco ou bocha com os fregueses conhecidos, a amizade cresce e eles trazem presentes no fim do dia.</div><button class="primary" data-act="tvAwardClose">Ver o resultado do primeiro dia</button>`,'tvAward');
}

// Bodega ou costelão ainda fechados (ou o dia já encerrado): um aviso no alto da tela lembra de ir até o caixa.
// O quadro fixo de "a bodega está fechada" virou lembrete flutuante (reminderTick, rural.js).
function doorReminder(){
 return '';
 if(!started||worldOut||scene||G.lasso||G.bocce||G.atCancha||G.game||G.task||G.dialogue||tutorialActive()||prologueActive()||sportState().waiting||costelaoPrepFirst()||!['prep','closed'].includes(G.phase))return '';
 if(G.phase==='closed')return '<b>Expediente encerrado</b><p>Para passar ao próximo dia, vá ao <b>caixa</b> (balcão de atendimento) e escolha <b>Dormir</b>. A porta leva para fora.</p>';
 const campo=isCampo();return '<b>'+(campo?'O costelão está fechado':'A bodega está fechada')+'</b><p>Quando estiver pronto, vá ao <b>caixa</b> (balcão de atendimento), aperte <span class="keycap">E</span> e escolha <b>Abrir</b>'+(campo?' o domingo':' a bodega')+'. A porta leva para fora.</p>';
}
