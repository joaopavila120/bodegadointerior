// Personagens especiais: raridade, chegada, amizade, contatos, presentes e
// troca de personagem. Também o caderninho de fiado do balcão.
'use strict';

const SPECIAL_CHANCE=.12;     // chance de um visitante ser personagem especial
const CONTACT_AT=15;          // afeto para ganhar o contato
const GIFT_AT=50;             // afeto para ganhar o presente
const MAX_FRIENDSHIP=100;     // afeto para poder jogar com o personagem
const GIFTS={
 manolima:[{at:'tutorial',decor:['bandeira'],text:'“Pra tua bodega ter cara de galpão de verdade. E treina, que um dia tu enfrenta o Lauro Bolador!”'},{at:GIFT_AT,decor:['prateleira','gaita'],text:'“Essa gaita já tocou muito baile no Arvoredo.”'}],
 badin:[{at:GIFT_AT,decor:['chapeu'],text:'“Um chapéu campeiro pra receber a freguesia.”'}],
 guri:[{at:GIFT_AT,decor:['laco'],text:'“Laço trançado pelo meu avô. Cuida bem.”'}],
 marcio:[{at:GIFT_AT,decor:['poncho'],text:'“Pro inverno da bodega.”'}],
 marcelo:[{at:GIFT_AT,decor:['cabaca'],text:'“Porongo da roça lá de casa.”'}],
 indavirus:[{at:GIFT_AT,decor:['alho'],text:'“Réstia da colônia. Espanta até mau-olhado.”'}],
 lauro:[{at:'tutorial',decor:['lampada'],text:'“Uma lâmpada pra clarear a bodega. E treina, que a revanche vem!”'},{at:GIFT_AT,decor:['ervas'],text:'“Ervas secas pro chá e pro tempero.”'}],
 dianho:[{at:GIFT_AT,decor:['bancada_lenha'],text:'“Bancada que eu mesmo reformei, todo Nicolas Cagezinho!”'}],
 mitodosul:[{at:GIFT_AT,decor:['planta_esq'],text:'“O chat escolheu: uma samambaia pro cantinho da bodega.”'}],
 loligebien:[{at:GIFT_AT,decor:['prateleira_potes','frigideiras'],text:'“Panelas da oma, de Pomerode. Prosit!”'}],
 jayme:[{at:GIFT_AT,decor:['comoda','kit_chimarrao'],text:'“Cômoda e cuia: todo galpão precisa de um canto pro mate e pro verso.”'}],
 valter:[{at:GIFT_AT,decor:['planta_dir'],text:'“Da horta da minha patroa. Teu pai sempre dizia que galpão sem planta é galpão triste.”'}],
 baitaca:[{at:GIFT_AT,decor:['lampiao_centro'],text:'“Um lampião pra iluminar os bailes da bodega.”'}],
 peixinhonabrasa:[{at:GIFT_AT,decor:['lampiao_dir'],text:'“Um lampião pra noite não ficar escura.”'}]
};

// Amizade traz o especial mais vezes: a chance geral sobe e, entre eles, quem tem mais afeto vem mais.
function specialChance(){return Math.min(.35,SPECIAL_CHANCE+specialPeople().reduce((n,i)=>n+(G.friends[i]||0),0)/100*.06);}
function pickByFriendship(list){const w=list.map(i=>1+(G.friends[i]||0)/20);let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let k=0;k<list.length;k++){if((r-=w[k])<=0)return list[k];}return list[list.length-1];}
// Quem ainda está com corpo provisório só aparece depois que todos os de pixel art própria já vieram.
function specialReady(i){if(!PEOPLE[i]?.placeholder)return true;return specialPeople().every(j=>PEOPLE[j].placeholder||G.metSpecial?.[PEOPLE[j].id]);}
function dailySpecial(extra=[]){if(G.phase!=='open'||tutorialActive()||G.dailySpecialDay===G.day||G.elapsed<DAY*.2)return null;const all=specialPeople().filter(i=>visitorAvailable(i,extra)&&specialReady(i));if(!all.length)return null;const fresh=all.filter(i=>!G.metSpecial?.[PEOPLE[i].id]);return fresh.length?pick(fresh):pickByFriendship(all);}
function isSpecial(i){return ALWAYS_TALK.has(PEOPLE[i]?.id);}
function specialPeople(){return PEOPLE.map((p,i)=>i).filter(i=>isSpecial(i)&&PEOPLE[i].id!==G.avatarId);}
function hasContact(i){return !!G.contacts?.[PEOPLE[i]?.id];}
function contactPeople(){return specialPeople().filter(hasContact);}
function addFriendship(person,n){if(!isSpecial(person))return;const before=G.friends[person]||0;G.friends[person]=clamp(before+n,0,MAX_FRIENDSHIP);if(before<QUADRO_AT&&G.friends[person]>=QUADRO_AT&&PORTRAIT_FILES[PEOPLE[person].id])showBanner('Quadro de '+PEOPLE[person].name+' liberado!','A amizade rendeu um retrato: pendure na sua casa, pela coleção ou pela aba Estética do celular.','friend',{world:true});}
function unlockContact(person,silent=false){
 const id=PEOPLE[person]?.id;if(!id||G.contacts[id])return;G.contacts[id]=G.day;
 if(!silent)showBanner('Novo contato: '+PEOPLE[person].name,'Agora dá para convidar para truco e bocha.','friend');
}
// Presentes: além da peça decorativa de cada um, os especiais trazem mercadorias da roça
// conforme a amizade cresce (25, 75 e 100) e, às vezes, depois de uma visita. Quem presenteia
// vem pessoalmente depois do expediente, quando você encerra o dia.
const GIFT_GOODS=[
 {key:'erva',qty:2000,name:'2 kg de erva-mate',text:'“Erva boa, moída grossa, do jeito que o mate pede.”'},
 {key:'bergamota',qty:2000,name:'2 kg de bergamota do pé',text:'“Bergamota do pé, colhida hoje cedo lá em casa.”'},
 {key:'pinhao',qty:2000,name:'2 kg de pinhão',text:'“Pinhão da serra, pra sapecar no fogão.”'},
 {key:'cachaca',qty:6,name:'6 doses de cachaça da colônia',text:'“Da colônia, curtida em barril de carvalho.”'},
 {key:'queijo',qty:6,name:'6 queijos coloniais',text:'“Queijo colonial da vizinha. Vai bem no xis.”'},
 {key:'salame',qty:4,name:'4 salames coloniais',text:'“Salame curado no galpão, receita do nono.”'},
 {key:'pepino',qty:4,name:'4 potes de pepino em conserva',text:'“Conserva da patroa, pra vender no balcão.”'}
];
// Presente de visita: raro (8%), no máximo um por noite e o mesmo amigo só volta com presente depois de uma semana.
const GOODS_GIFT_AT=[25,75,100],VISIT_GIFT_CHANCE=.08,VISIT_GIFT_GAP=7;
function giftGoodsOptions(){return GIFT_GOODS.filter(g=>GOODS[g.key]&&unlocked(g.key));}
function giftKey(person,at){return PEOPLE[person].id+':'+at;}
function queueGift(person,gift){
 G.giftQueue??=[];G.giftsGiven??={};const key=giftKey(person,gift.at);if(G.giftsGiven[key]||G.giftQueue.some(g=>g.key===key))return false;
 const item={person,key,text:gift.text};
 if(gift.decor)item.decor=gift.decor;else{const g=pick(giftGoodsOptions());if(!g)return false;item.goods={key:g.key,qty:g.qty,name:g.name};item.text=g.text;}
 G.giftQueue.push(item);return true;
}
function giftLabel(item){return item.decor?item.decor.map(d=>DECOR.find(x=>x.id===d)?.name).join(' e '):item.goods.name;}
function deliverGift(item){
 if(!item||G.giftsGiven[item.key])return;G.giftsGiven[item.key]=G.day;
 const names=[];let cash=0;
 if(item.decor){for(const d of item.decor){const dec=DECOR.find(x=>x.id===d);if(decorOwned(d))cash+=dec.cost;else{decorState()[d]=true;names.push(dec.name);}}}
 else{const{key,qty}=item.goods,units=G.stock[key]||0;G.avg[key]=(G.avg[key]||0)*units/(units+qty);G.stock[key]=units+qty;names.push(item.goods.name);}
 if(cash){G.cash=round(G.cash+cash);G.stats.aid+=cash;}
 showBanner(PEOPLE[item.person].name+' te deu um presente!',(names.length?names.join(' e '):'')+(cash?(names.length?' · ':'')+money(cash)+' (a peça já era tua)':'')+' · '+item.text,'gift');AudioEngine.heart();save();
}
// Entrega na hora, com a pessoa presente (ex.: fim do tutorial de bocha com o Mano Lima).
function giveGift(person,gift){const key=giftKey(person,gift.at);G.giftQueue=(G.giftQueue||[]).filter(g=>g.key!==key);deliverGift({person,key,decor:gift.decor,text:gift.text});}
// Depois do expediente: presentes de visita e a bandeira do Mano Lima no fim do segundo dia.
function queueAfterHoursGifts(){
 const today=G.visitedToday?.day===G.day?G.visitedToday.ids:[];
 G.visitGiftDay??={};
 for(const id of shuffle(today.slice())){const i=PEOPLE.findIndex(p=>p.id===id);if(i<0||(G.friends[i]||0)<25||G.day-(G.visitGiftDay[id]??-99)<VISIT_GIFT_GAP||Math.random()>=VISIT_GIFT_CHANCE)continue;if(queueGift(i,{at:'dia'+G.day})){G.visitGiftDay[id]=G.day;break;}}
}
function showGiftVisit(){
 const item=G.giftQueue?.[0];if(!item)return false;const p=PEOPLE[item.person];
 openDialog('Presente de '+p.name,`<div class="rpg-speaker">${portraitHTML(item.person,88)}<div><p><b>${p.name}</b> trouxe um presente.</p><div class="callout"><b>🎁 ${giftLabel(item)}</b><p>${item.text}</p></div></div></div><div class="actions"><button class="primary" data-act="giftAccept">Receber o presente</button></div>`,'giftVisit');return true;
}
function acceptGiftVisit(){const item=G.giftQueue?.shift();deliverGift(item);closeDialog(true);challengeVisitLeave();save();}
// Modo dinheiro infinito: nível e reputação no máximo e amizade máxima com todos os especiais.
// Contatos, personagens jogáveis e peças de presente já ficam liberados, sem fila de visitas.
function maxTestProgress(){
 if(!G.testMode)return;G.rep=100;G.xp=Math.max(G.xp||0,LEVELS[LEVELS.length-1].xp);G.levelSeen=LEVELS.length;G.levelStory=LEVELS.length;
 G.contacts??={};G.playable??={};G.giftsGiven??={};G.giftQueue=[];
 for(const i of PEOPLE.map((p,i)=>i).filter(isSpecial)){
  const id=PEOPLE[i].id;G.friends[i]=MAX_FRIENDSHIP;G.contacts[id]??=G.day;G.playable[id]??=G.day;
  for(const g of GIFTS[id]||[]){G.giftsGiven[id+':'+g.at]??=G.day;for(const d of g.decor||[])if(!decorOwned(d))decorState()[d]=false;}
  for(const at of GOODS_GIFT_AT)G.giftsGiven[id+':'+at]??=G.day;
 }
}
function socialCheck(){
 G.contacts??={};G.giftsGiven??={};G.playable??={};arcCheck();
 for(const i of specialPeople()){
  const id=PEOPLE[i].id,f=G.friends[i]||0;
  if(f>=CONTACT_AT)unlockContact(i);
  for(const gift of GIFTS[id]||[])if(typeof gift.at==='number'&&f>=gift.at)queueGift(i,gift);
  for(const at of GOODS_GIFT_AT)if(f>=at)queueGift(i,{at});
  if(f>=MAX_FRIENDSHIP&&!G.playable[id]){G.playable[id]=G.day;showBanner(PEOPLE[i].name+' é teu parceiro de verdade','Agora dá para jogar com '+PEOPLE[i].name+': Celular → Contatos.','friend');}
 }
}
// Lições depois do expediente: quem ensina vira contato e volta com um presente em mãos.
function lessonGift(id){const i=PEOPLE.findIndex(p=>p.id===id);unlockContact(i);queueGift(i,GIFTS[id][0]);const key=id+':tutorial';G.giftQueue.sort((a,b)=>(b.key===key)-(a.key===key));}
// Bocha com o Lauro Bolador (fim do primeiro dia): lâmpada de coração.
function finishBocceTutorial(){lessonGift('lauro');}
// Truco com o Mano Lima (primeira segunda): bandeira do Rio Grande, mesmo se o jogador desistir.
function finishTrucoTutorial(){sportState().trucoTutorialDone=true;lessonGift('manolima');}

// Primeira visita de um especial: aviso grande. Depois, só uma notinha.
function announceArrivals(people){
 G.metSpecial??={};
 for(const i of new Set(people)){
  if(!isSpecial(i))continue;const p=PEOPLE[i];G.dailySpecialDay=G.day;if(G.visitedToday?.day!==G.day)G.visitedToday={day:G.day,ids:[]};if(!G.visitedToday.ids.includes(p.id))G.visitedToday.ids.push(p.id);
  if(!G.metSpecial[p.id]){G.metSpecial[p.id]=G.day;showBanner(p.name+' entrou na bodega!',p.origin||'Um personagem especial. Atenda bem para ganhar o contato.','special');AudioEngine.heart();}
  else say(p.name+' chegou na bodega.');
 }
}
function specialRing(x,y){ctx.save();ctx.strokeStyle='#f2c75a';ctx.lineWidth=2.5;ctx.globalAlpha=.7+.3*Math.sin(frameClock*4);ctx.beginPath();ctx.ellipse(x,y+1,24,9,0,0,Math.PI*2);ctx.stroke();ctx.restore();}

function canPlayAs(id){if(id==='sadi')return true;const i=PEOPLE.findIndex(p=>p.id===id);return i>=0&&isSpecial(i)&&!!G.playable?.[id];}
function playAs(id){
 if(!canPlayAs(id)||G.avatarId===id)return;
 if(!['prep','closed'].includes(G.phase)||G.shop.length||G.groups.length){say('Troque de personagem com a bodega vazia, antes de abrir ou depois de fechar.');return;}
 G.avatarId=id;save();renderPhone();say('Agora você joga com '+(PEOPLE.find(p=>p.id===id)?.name||'Sadi')+'.');
}
function inviteContact(person,sport){
 if(!hasContact(person)||G.bocce||G.game||G.task)return;
 togglePhone(false);
 if(sport==='truco'){cardsMenu();const s=$('opponent');if(s)s.value=String(person);}
 else{G.atCancha=true;showCanchaLobby();bocceMenu();const s=$('bocceOpponent');if(s)s.value=String(person);}
}

function contactsPanel(){
 const people=PEOPLE.map((p,i)=>i).filter(isSpecial);
 return `<div class="phone-intro"><h3>Contatos da bodega</h3><p>Só os personagens especiais viram amigos. Atenda e jogue com eles: com ${CONTACT_AT} de afeto você ganha o contato e pode convidá-los para truco e bocha; com ${GIFT_AT}, eles trazem presentes; com ${MAX_FRIENDSHIP}, dá para jogar com eles.</p>${G.avatarId!=='sadi'?'<button data-act="playAs" data-id="sadi">Voltar a jogar com Sadi</button>':''}</div>`+people.map(i=>{
  const p=PEOPLE[i],f=G.friends[i]||0,contact=hasContact(i),met=G.metSpecial?.[p.id],me=p.id===G.avatarId;
  const next=!contact?CONTACT_AT:f<GIFT_AT?GIFT_AT:MAX_FRIENDSHIP;
  return `<article class="contact-card ${contact?'':'locked'}"><canvas width="64" height="90" data-contact="${i}" aria-label="${escapeHTML(met?p.name:'Desconhecido')}"></canvas><div><h3>${contact?'☎ ':''}${escapeHTML(met||contact?p.name:'???')}</h3><div class="xp-track small"><div style="width:${f}%"></div></div><p>Afeto ${f} / ${MAX_FRIENDSHIP}${f<MAX_FRIENDSHIP?' · próximo marco: '+next:''}</p>${arcProgressText(i)}<small>${me?'É você agora.':contact?(p.origin||'Personagem especial'):met?'Atenda mais vezes para ganhar o contato.':'Ainda não apareceu na bodega.'}</small>${contact&&!me?`<div class="contact-actions"><button class="small" data-act="invite" data-id="${i}:truco">Convidar · truco</button><button class="small" data-act="invite" data-id="${i}:bocha">Convidar · bocha</button>${G.playable?.[p.id]?`<button class="small" data-act="playAs" data-id="${p.id}">Jogar com ${escapeHTML(p.name)}</button>`:''}${contactHireHTML(i)}</div>`:''}</div></article>`;
 }).join('');
}
// Contratar pelo cartão: quem já trabalha mostra a função (e dá pra dispensar); quem não tem amizade ainda, o quanto falta.
function contactHireHTML(i){
 if(!G.staffUnlocked)return '';
 const r=staffRoleOf(i);if(r)return `<button class="small" disabled>${STAFF_ROLES[r].icon} Trabalha de ${STAFF_ROLES[r].name.toLowerCase()}</button><button class="small" data-act="contactFire" data-id="${i}">Dispensar</button>`;
 const f=Math.floor(G.friends[i]||0);return f>=HIRE_AT?`<button class="small primary" data-act="contactHire" data-id="${i}">Contratar</button>`:`<button class="small" disabled>Contratar · amizade ${f}/${HIRE_AT}</button>`;
}
function drawContactPortraits(){document.querySelectorAll('[data-contact]').forEach(c=>{const i=Number(c.dataset.contact),context=c.getContext('2d');drawCharacterPortrait(context,PEOPLE[i].sprite,32,88,86);if(!hasContact(i)){context.globalCompositeOperation='source-atop';context.fillStyle=G.metSpecial?.[PEOPLE[i].id]?'#3a2b1ccc':'#2a1f15';context.fillRect(0,0,c.width,c.height);context.globalCompositeOperation='source-over';}});}
function noContactsHTML(sport){return `<p>Tua agenda ainda está vazia. Os personagens especiais aparecem de vez em quando na bodega: atenda bem e converse para ganhar o contato (${CONTACT_AT} de afeto).</p>${sport==='bocha'&&!sportState().tutorialDone?'<p>O Mano Lima ensina bocha de graça: use <b>Aprender bocha com Mano Lima</b> na cancha.</p>':''}<div class="actions"><button data-act="close">Voltar</button></div>`;}

// ---------- Caderninho de fiado ----------
function fiadoState(){G.fiado??=[];return G.fiado;}
function fiadoOpen(){return fiadoState().filter(e=>e.status==='open');}
function fiadoTotal(){return round(fiadoOpen().reduce((n,e)=>n+e.amount,0));}
// Cada freguês tem um jeito de pagar: uns são pontuais, outros somem.
function reliability(person){return .5+((person*37+11)%45)/100;}
const placaFiadoArt=new Image();placaFiadoArt.src='assets/images/icons/placa_fiado.png';
function fiadoChance(){return G.up.placaFiado?.04:.18;}
function wantsFiado(person){return G.day>=2&&!tutorialActive()&&!isSpecial(person)&&!PEOPLE[person].team&&Math.random()<fiadoChance();}
function fiadoFirst(){const c=G.shop.find(c=>c.state==='queue');return c?.fiado?c:null;}
function recordFiado(person,amount){
 const e={id:G.next++,person,amount:round(amount),day:G.day,due:G.day+2+Math.floor(Math.random()*3),status:'open',charged:0};
 fiadoState().push(e);G.stats.credit=round((G.stats.credit||0)+amount);
 effect('Anotado no caderninho · '+money(amount),G.player.x,G.player.y-90,'#f0dc9a');
}
function refuseFiado(){
 const c=fiadoFirst();if(!c)return;
 if(tutorialActive()){say('Hoje é dia de aprender: anote este no caderninho entregando com E.');return;}
 if(Math.random()<.6){c.fiado=false;say(PEOPLE[c.person].name+': “Tá, tá… pago à vista então.”');}
 else{c.state='leave';c.dest=null;setDestination(c,EXIT);repChange(-1.5);G.stats.lost++;resetQueuePaths();say(PEOPLE[c.person].name+' foi embora sem levar nada.');}
 save();refreshHUD();
}
function settleFiado(e,amount,why){e.status='paid';e.paidDay=G.day;e.paid=round(amount);G.cash=round(G.cash+amount);G.stats.fiadoIn=round((G.stats.fiadoIn||0)+amount);G.fiadoPaid=(G.fiadoPaid||0)+1;gainXP(5);return why;}
// Roda na virada do dia: quem vence paga com “juros de amizade”; alguns somem.
function processFiado(){
 const paid=[],lost=[];
 for(const e of fiadoOpen()){
  const r=reliability(e.person),late=G.day-e.due;
  if(late>=0&&Math.random()<r*.65){settleFiado(e,e.amount*1.1+(Math.random()<.3?2:0),'');paid.push(e);}
  else if(late>=5&&Math.random()<(1-r)*.6){e.status='lost';e.lostDay=G.day;G.stats.fiadoLost=round((G.stats.fiadoLost||0)+e.amount);lost.push(e);}
 }
 if(paid.length)showBanner('Fiado acertado','Pagaram com juros de amizade: '+paid.map(e=>PEOPLE[e.person].name.split(' ·')[0]+' '+money(e.paid)).join(', ')+'.','gift');
 if(lost.length)showBanner('Calote no caderninho',lost.map(e=>PEOPLE[e.person].name.split(' ·')[0]).join(', ')+' sumiu sem pagar ('+money(lost.reduce((n,e)=>n+e.amount,0))+').','bad');
}
function chargeFiado(id){
 const e=fiadoOpen().find(e=>e.id===Number(id));if(!e||e.charged===G.day)return;e.charged=G.day;
 if(Math.random()<reliability(e.person)*.5){settleFiado(e,e.amount);say(PEOPLE[e.person].name+' pagou '+money(e.amount)+' na hora.');AudioEngine.coins();}
 else{e.due=Math.max(e.due,G.day+2);say(PEOPLE[e.person].name+': “Semana que vem eu acerto, palavra!”');}
 save();renderPhone();
}
function forgiveFiado(id){const e=fiadoOpen().find(e=>e.id===Number(id));if(!e)return;e.status='forgiven';e.paidDay=G.day;repChange(1);say('Conta perdoada. A vizinhança comenta tua bondade.');save();renderPhone();}
function fiadoPanel(){
 const open=fiadoOpen(),closed=fiadoState().filter(e=>e.status!=='open').slice(-8).reverse(),total=fiadoTotal(),limit=creditLimit();
 const status={paid:'pago',lost:'sumiu',forgiven:'perdoado'};
 return `<div class="phone-intro"><h3>Caderninho de fiado</h3><p>Alguns fregueses pedem para anotar (📒 no balão). Entregar com E anota no caderno; <b>X</b> recusa o fiado. Quem paga em dia traz juros de amizade (10%); alguns somem.</p><div class="xp-track small"><div style="width:${Math.min(100,total/limit*100)}%"></div></div><p><b>${money(total)}</b> em aberto · limite ${money(limit)} (sobe com o nível)</p></div>`+
 (open.length?open.map(e=>{const late=G.day-e.due;return `<div class="fiado-line ${late>0?'late':''}"><div><b>${escapeHTML(PEOPLE[e.person].name)}</b><small>${money(e.amount)} · anotado no dia ${e.day} · ${late>0?late+' dia(s) de atraso':'vence no dia '+e.due}</small></div><div><button class="small" data-act="fiadoCharge" data-id="${e.id}" ${e.charged===G.day?'disabled':''}>${e.charged===G.day?'Cobrado hoje':'Cobrar'}</button><button class="small" data-act="fiadoForgive" data-id="${e.id}">Perdoar</button></div></div>`;}).join(''):'<p class="muted">Nenhuma conta em aberto.</p>')+
 (closed.length?'<h4>Últimas contas</h4>'+closed.map(e=>`<div class="fiado-line done"><div><b>${escapeHTML(PEOPLE[e.person].name)}</b><small>${money(e.paid??e.amount)} · ${status[e.status]}</small></div></div>`).join(''):'');
}
