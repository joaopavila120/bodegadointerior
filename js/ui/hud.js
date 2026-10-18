// Atualização da HUD, textos informativos (toast), efeitos de partículas e dinheiro
'use strict';

function refreshHUD(){
 $('bodegaBrand').textContent=G.bodegaName||'Bodega Do Sadi';const sec=Math.ceil(Math.max(0,DAY-G.elapsed));
 $('cash').textContent=walletText();$('clock').textContent=tutorialActive()||prologueActive()?'Tutorial':gameTimeText();$('clockLeft').textContent=tutorialActive()||!['open','closing'].includes(G.phase)?(G.phase==='prep'?'antes de abrir':G.phase==='closed'?'fechado':''):'faltam '+String(Math.floor(sec/60))+':'+String(sec%60).padStart(2,'0');$('level').textContent='Nv '+bodegaLevel();$('levelName').textContent=levelInfo().name;$('levelBar').style.width=Math.round(levelProgress()*100)+'%';$('reputation').textContent=Math.round(G.rep);
 $('soundButton').textContent=AudioEngine.on?'♫':'♪';$('soundButton').setAttribute('aria-label',AudioEngine.on?'Desligar som':'Ligar som');
 $('dayNotice').textContent=(prologueActive()?'ROÇA DO VÔ':'DIA '+dayNumber()+' · '+calendar().name.slice(0,3))+'\n'+eventInfo().icon+' '+eventInfo().name;
 updatePaymentFeedback();$('openButton').textContent=tutorialActive()&&G.phase==='open'?'Dia de aprendizado':{prep:'Abrir bodega',open:'Fechar portas',closing:'Encerrar dia',closed:'Próximo dia'}[G.phase];
 setHTML($('hands'),G.hands.slice(0,G.up.tray?2:1).map((i,n)=>`<button class="hand-slot ${G.slot===n?'active':''}" data-act="slot" data-id="${n}" aria-label="Espaço ${n+1}: ${i?itemLabel(i):'vazio'}" title="${i?itemLabel(i):'Mãos livres'}"><span class="number">${n+1}</span>${i?`<span class="item-icon">${itemIconHTML(i.pid||i.key,i)}</span><small>${i.spoiled?'ESTRAGADO':i.burned?'QUEIMADO':i.kind==='assembled'?'PRENSAR':i.kind==='ingredient'&&COOK[i.key]?(i.ready?'PRONTO':'CRU'):bulk(i.pid)?formatWeight(i.weight||bulk(i.pid).unit):'NA MÃO'}</small>`:'<span style="font-size:23px;color:#e2c797">✋</span><small>LIVRE</small>'}</button>`).join(''));
 setHTML($('hint'),hintText(nearest())??'');updateDialogue();updateFightUI();updateContextActions();updateQuestTracker();
}

// Mensagens flutuantes: aparecem no meio da tela, ficam um pouco e somem (não ficam mais no canto).
function floatNote(text,kind=''){const host=$('floatNotes');if(!host)return;[...host.children].find(e=>e.textContent===text)?.remove();const e=document.createElement('div');e.className='float-note'+(kind?' '+kind:'');e.textContent=text;host.prepend(e);while(host.children.length>2)host.lastChild.remove();setTimeout(()=>e.remove(),kind==='reminder'?7000:4200);}
function say(text,opts){if(bodegaNoticeMuted(opts))return;floatNote(text);}

function effect(text,x,y,color='#fce59e',size=15){sparks.push({text,x,y,life:2.2,color,size,map:G?.lasso?'lasso':worldOut?.map||null});}
// Textos que sobem: os da bodega na bodega; os do mundo aberto só no mapa onde nasceram.
function drawSparks(map=null){for(const e of sparks)if((e.map||null)===map){ctx.globalAlpha=Math.min(1,e.life);txt(e.text,e.x,e.y-(2.2-e.life)*16,e.size||15,e.color);}ctx.globalAlpha=1;}

function burst(x,y,type='spark'){for(let i=0;i<7;i++)G.visual.push({x,y,dx:(Math.random()-.5)*80,dy:-20-Math.random()*40,life:.7+Math.random()*.4,total:1,type});}
