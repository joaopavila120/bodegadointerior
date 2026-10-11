// Sistema de conversa com os fregueses e contação de causos
'use strict';

const ALWAYS_TALK = new Set(['badin','guri','marcio','marcelo','indavirus','lauro','peixinhonabrasa','manolima','dianho','mitodosul','loligebien','jayme','baitaca','valter']);

function deliveryConversation(person,actor,diner=null){
 G.conversations[person]++;addFriendship(person,3);
 G.dialogueQueue=[];
 // Primeiro atendimento de um especial: a conversa de apresentação do arco dele.
 if(arcMeet(person)){save();return;}
 // Fregueses comuns falam em 20% das entregas; especiais sempre têm uma fala.
 if(!ALWAYS_TALK.has(PEOPLE[person].id)&&Math.random()>=.2){save();return;}
 const line=nextProse(person);
 G.dialogue={person,name:PEOPLE[person].name,player:line.player,reply:line.reply,title:line.title||'Prosa de balcão',source:line.source||null,life:15};
 AudioEngine.heart();save();updateDialogue();
}
function advanceDialogue(){G.dialogue=null;G.dialogueQueue=[];updateDialogue();save();}

// ---------- Caixa de diálogo estilo RPG: retrato quadrado ao lado da fala ----------
const PORTRAIT_FILES={badin:'badin',guri:'guri',indavirus:'indavirus',lauro:'lauro',manolima:'manolima',marcelo:'marcelo',marcio:'marcio',peixinhonabrasa:'peixinho',dianho:'dianho',mitodosul:'mitogames',loligebien:'loligarbien',jayme:'jayme',baitaca:'baitaca',gaudencio:'gaudencio'};
// Retrato do personagem: arte própria para os especiais; para os outros, o busto recortado do sprite (só CSS).
function portraitHTML(person,size=96){
 const p=PEOPLE[person];if(!p)return '';const file=PORTRAIT_FILES[p.id],style=`width:${size}px;height:${size}px`;
 if(file)return `<img class="portrait" src="assets/images/portraits/256/${file}.jpg" alt="" draggable="false" style="${style}">`;
 return portraitFromSprite(p.sprite,size);
}
// Busto recortado do sprite, só com CSS (funciona até abrindo o jogo direto do arquivo).
function portraitFromSprite(sp,size=96){
 const art=typeof sp==='object'?CHARACTER_ART[sp.file]:peopleArt,s=characterCrop(sp),W=art?.naturalWidth,H=art?.naturalHeight;if(!W)return '';
 return `<span class="portrait" style="width:${size}px;height:${size}px;background-image:url('${art.src}');background-size:${W/s.w*100}% auto;background-position:${s.x/(W-s.w)*100}% ${s.y/(H-s.w)*100}%"></span>`;
}
// Cada caixa (bodega: 'dialogue', cancha: 'bocceTalk') tem retrato, nome, pergunta e resposta.
// Cada caixa (bodega, cancha, cenas) mostra a conversa em partes: primeiro a fala do Sadi,
// com o retrato dele, e depois a resposta do personagem. Clique, E ou Espaço avançam.
const rpgBoxes={};
function avatarName(){return PEOPLE.find(p=>p.id===G.avatarId)?.name||'Sadi';}
function showRpgBox(prefix,line){
 const box=$(prefix+'UI'),state=rpgBoxes[prefix]??={key:'',timer:null,text:'',parts:[],part:0,auto:null};box.classList.toggle('hidden',!line);
 if(!line){state.key='';stopRpgTyping(prefix);clearTimeout(state.auto);return;}
 const key=line.name+'|'+line.reply;if(key===state.key)return;state.key=key;
 state.parts=[...(line.player?[{portrait:portraitFromSprite(avatarSprite(),104),name:avatarName(),text:line.player}]:[]),{portrait:line.portrait||portraitHTML(line.person,104),name:line.name,text:line.reply||''}];
 showRpgPart(prefix,0);
}
function showRpgPart(prefix,n){
 const state=rpgBoxes[prefix],part=state.parts[n],box=$(prefix+'UI'),el=$(prefix+'Reply');
 state.part=n;state.text=part.text;clearTimeout(state.auto);
 $(prefix+'Portrait').innerHTML=part.portrait;$(prefix+'Name').textContent=part.name;$(prefix+'Player').textContent='';
 // A fala aparece letra por letra, com um bipe baixinho.
 let i=0;stopRpgTyping(prefix);el.textContent='';box.classList.remove('done');
 state.timer=setInterval(()=>{i=Math.min(state.text.length,i+2);el.textContent=state.text.slice(0,i);if(i%8===0)AudioEngine.blip();if(i>=state.text.length)finishRpgTyping(prefix);},28);
}
function stopRpgTyping(prefix){const s=rpgBoxes[prefix];if(s?.timer)clearInterval(s.timer);if(s)s.timer=null;}
function finishRpgTyping(prefix){
 stopRpgTyping(prefix);const s=rpgBoxes[prefix];$(prefix+'Reply').textContent=s?.text||'';$(prefix+'UI').classList.add('done');
 // Sem clique, a resposta vem sozinha depois de um instante.
 if(s&&s.part<s.parts.length-1){clearTimeout(s.auto);const key=s.key,n=s.part;s.auto=setTimeout(()=>{if(s.key===key&&s.part===n&&!rpgTyping(prefix))showRpgPart(prefix,n+1);},1800);}
}
function rpgTyping(prefix){return !!rpgBoxes[prefix]?.timer;}
// Avança a caixa: completa a fala em digitação ou passa para a próxima parte. Falso quando acabou.
// Espaço: completa a fala que está sendo digitada; no toque seguinte, mostra a próxima fala já completa.
function rpgSpace(prefix){if(rpgTyping(prefix)){finishRpgTyping(prefix);return true;}const s=rpgBoxes[prefix];if(s&&s.part<s.parts.length-1){showRpgPart(prefix,s.part+1);finishRpgTyping(prefix);return true;}return false;}
function rpgAdvance(prefix){const s=rpgBoxes[prefix];if(!s)return false;if(rpgTyping(prefix)){finishRpgTyping(prefix);return true;}if(s.part<s.parts.length-1){showRpgPart(prefix,s.part+1);return true;}return false;}
function updateDialogue(){const d=G.dialogue;showRpgBox('dialogue',d&&{person:Number.isInteger(d.person)?d.person:PEOPLE.findIndex(p=>p.name===d.name),name:d.name,player:d.player,reply:d.reply});}
// Clique na caixa: completa a fala; com a fala inteira, fecha.
function dialogueClick(){if(rpgAdvance('dialogue'))return;advanceDialogue();}

function nextProse(person){const personal=personalizedProse(person);if(personal&&(PEOPLE[person].exclusiveVoice||G.friends[person]<12||G.conversations[person]%4!==0))return personal;const seen=new Set(G.dialogueSeen||[]),stories=STORIES.map((s,i)=>({id:'story:'+i,player:'E aquele causo que tu ficou de me contar?',reply:s.text,title:s.title,source:s.source,affinity:s.affinity})).filter(s=>G.friends[person]>=s.affinity);let ordinary=PROSE.filter(s=>!seen.has(s.id)),lore=stories.filter(s=>!seen.has(s.id));if(!ordinary.length&&!lore.length){G.dialogueSeen=[];ordinary=[...PROSE];lore=stories;}const pool=lore.length&&(!ordinary.length||G.conversations[person]%4===0)?lore:ordinary;const line=pick(pool);G.dialogueSeen.push(line.id);return line;}
