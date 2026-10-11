// Costelão de domingo (cenário aberto, fogo de chão, maionese) e a laçada no pasto do curral, a qualquer hora.
'use strict';

const CAMPO_IMG='assets/images/campo/';
function campoImage(file){const image=new Image();image.src=CAMPO_IMG+file;return image;}
const campoArt=campoImage('campo.webp'),fogoArt=campoImage('fogo.png'),espetoArt=campoImage('espeto.png'),boisArt=campoImage('bois.png'),lenhaArt=campoImage('lenha.png'),queroArt=campoImage('queroquero.png');
const CAMPO_ART=[[campoArt,'campo.webp'],[fogoArt,'fogo.png'],[espetoArt,'espeto.png'],[boisArt,'bois.png'],[lenhaArt,'lenha.png'],[queroArt,'queroquero.png']];
const BOI_COATS=['angus','colorado','holandes','hereford','charoles','crioulo'],BOI_W=72,BOI_H=52,ESPETO_W=44,ESPETO_H=96;
// Basta laçar um boi: cada laço certeiro enche a barra e com LASSO_HITS laços ele está laçado.
const BOI_COST=150,MANTAS_PER_BOI=6,MANTA_GRAMS=2000,MIN_LASSO=1,LASSO_HITS=6,MANTA_BUY_COST=110;
// Cada lado da manta leva COOK_SIDE s (com o fogo forte) para chegar ao ponto; passa do ponto e queima em BURN_AT.
const COOK_SIDE=18,BURN_AT=1.8,PERFECT_MAX=1.35,ESPETO_SCALE=1.95;
// O fogo de chão gasta lenha: sem lenha sobram só brasas e a costela quase não assa.
// O domingo começa com o fogo apagado: lenha rachada no fogo e segurar E acende (com um tanto de gravetos).
const FUEL_START=70,FUEL_BURN=.7,LENHA_FUEL=35,CHOP_HITS=3,CHOP_TIME=1.1,CHOP_ZONE=[.62,.84],LIGHT_TIME=1.6,KINDLING=15;
function fireFuel(){return campoState().fuel;}
function fireLit(){return !!campoState().lit;}
function fireHeat(){const c=campoState();return !c.lit?0:c.fuel<=0?.1:.35+.65*Math.min(1,c.fuel/50);}

function isCampo(state=G){return state?.event?.id==='costelao'||!!state?.lasso||(state===G&&sceneForcesCampo);}
function campoState(state=G){state.campo??={espetos:[null,null,null,null],bowl:{ovo:false,azeite:false,cost:0},tutorial:null,fuel:FUEL_START};state.campo.fuel??=FUEL_START;state.campo.lit??=state.campo.fuel>0;state.campo.espetos??=[null,null,null,null];state.campo.bowl??={ovo:false,azeite:false,cost:0};return state.campo;}

// Fogo ao fundo, espetos plantados na frente dele, mesas de apoio à direita.
const CAMPO_FIXED=[
 {id:'fogo',x:290,y:455,w:470,h:110,label:'Fogo de chão'},
 {id:'espeto:0',x:318,y:548,w:72,h:112,label:'Espeto 1'},{id:'espeto:1',x:428,y:548,w:72,h:112,label:'Espeto 2'},
 {id:'espeto:2',x:538,y:548,w:72,h:112,label:'Espeto 3'},{id:'espeto:3',x:648,y:548,w:72,h:112,label:'Espeto 4'},
 {id:'costela_crua',x:110,y:560,w:100,h:62,label:'Mantas de costela crua'},
 {id:'lenha',x:96,y:688,w:124,h:78,label:'Pilha de lenha e cepo'},
 {id:'lenha',x:96,y:688,w:124,h:78,label:'Pilha de lenha e cepo'},
 {id:'tabua',x:820,y:560,w:100,h:62,label:'Tábua de corte'},
 {id:'maionese',x:958,y:560,w:86,h:62,label:'Tigela da maionese'},
 {id:'bin:ovo',x:1066,y:560,w:72,h:57,label:'Ovos'},{id:'bin:azeite',x:1150,y:560,w:72,h:57,label:'Óleo vegetal'},
 {id:'bottle:refri',x:1262,y:530,w:62,h:88,label:'Caixa térmica · refrigerante'},
 {id:'mate',x:860,y:740,w:66,h:54,label:'Chimarrão · segure E'},
 {id:'service',x:1030,y:770,w:150,h:55,label:'Balcão 1 do costelão'},{id:'service:1',x:1215,y:770,w:150,h:55,label:'Balcão 2 do costelão'},
 {id:'shop:pepino',x:1345,y:545,w:52,h:57,label:'Pepino em conserva',unlock:'pepino'},
 {id:'parking:2',x:450,y:770,w:83,h:78,label:'Mesa de apoio · lugar 1'},{id:'parking:3',x:542,y:770,w:83,h:78,label:'Mesa de apoio · lugar 2'},
 {id:'trash',x:50,y:815,w:48,h:52,label:'Lixeira'}
];

// ---------- Espetos ----------
function espetoReady(e){return e&&!e.burned&&e.heat[0]>=1&&e.heat[1]>=1;}
function campoTick(dt){
 if(!isCampo()||G.lasso)return;
 campoBirdsTick(dt);slingTick(dt);
 // No primeiro costelão vêm só três fregueses (costela + maionese); atendidos, o dia fecha.
 if(firstCostelao()&&campoState().firstOrders>=FIRST_COSTELAO_ORDERS&&G.phase==='open'&&!G.shop.some(c=>c.state==='queue')&&G.elapsed<DAY){G.elapsed=DAY;say('Primeiro costelão vendido! Hora de fechar.');}
 const c=campoState(),before=c.fuel;
 if(c.lit)c.fuel=Math.max(0,c.fuel-FUEL_BURN*dt);
 if(c.lit&&before>=25&&c.fuel<25){AudioEngine.warning();effect('O fogo está baixando: traga lenha!',525,430,'#ffc875');}
 if(c.lit&&before>0&&c.fuel<=0){c.lit=false;AudioEngine.fireOut();effect('O fogo apagou! Traga lenha e acenda de novo',525,430,'#ff9a70');}
 const heat=fireHeat();
 c.espetos.forEach((e,i)=>{
  if(!e||e.burned)return;
  const s=e.fire;e.heat[s]+=dt*heat/COOK_SIDE*(costelaoTutorialActive()?2.5:1);if(costelaoTutorialActive())e.heat[s]=Math.min(e.heat[s],1.3);
  if(e.heat[s]>=1&&!e.doneSide?.[s]){e.doneSide??=[false,false];e.doneSide[s]=true;AudioEngine.ready();effect(espetoReady(e)?'No ponto! Retire com E':'Lado pronto · vire com E',354+i*110,520,'#d9ffa3');}
  if(e.heat[s]>=1.45&&!e.warned?.[s]){e.warned??=[false,false];e.warned[s]=true;AudioEngine.warning();effect('Vai queimar!',354+i*110,520,'#ffc875');}
  if(e.heat[s]>=BURN_AT){e.burned=true;AudioEngine.bad();effect('Queimou!',354+i*110,520,'#ff9872');}
 });
}
function useEspeto(i){
 const c=campoState(),e=c.espetos[i],h=held();
 if(!e){
  if(h?.key!=='costela_crua'){say(h?'No espeto vai a manta de costela crua.':'Pegue uma manta de costela crua na mesa ao lado do fogo.');return;}
  takeHeld();c.mantasUsed=(c.mantasUsed||0)+1;c.espetos[i]={heat:[0,0],fire:0,burned:false,cost:h.cost,turns:0};AudioEngine.sizzle();costelaoTutorialEvent('espeto');save();return;
 }
 if(e.burned){if(!freeHand()){say('Libere as mãos para tirar a costela queimada.');return;}putHeld({id:G.next++,kind:'ingredient',key:'costela_assada',cost:e.cost,burned:true,ready:false});c.espetos[i]=null;say('Queimou: leve à lixeira.');save();return;}
 if(espetoReady(e)){
  if(!freeHand()){say('Libere as mãos para retirar a costela.');return;}
  putHeld({id:G.next++,kind:'ingredient',key:'costela_assada',cost:e.cost,ready:true,perfect:Math.max(...e.heat)<PERFECT_MAX});
  c.espetos[i]=null;AudioEngine.glass();effect('Costela no ponto!',G.player.x,G.player.y-100,'#e1ff9e');costelaoTutorialEvent('retirar');save();return;
 }
 // Virar: o lado que estava no fogo vem para a frente.
 const wasDone=e.heat[e.fire]>=1;e.fire=1-e.fire;e.turns++;AudioEngine.sizzle();effect('Virou!',G.player.x,G.player.y-100);
 if(wasDone)costelaoTutorialEvent('virar');save();
}

// ---------- Tábua, mantas e maionese ----------
function useCostelaCrua(){if(!freeHand()){say('Libere as mãos para pegar a manta.');return;}const item=consumeStock('costela_crua');if(!item){say('Acabaram as mantas. Lace e carneie um boi no curral.');return;}putHeld(item);AudioEngine.tick();save();}
function useTabua(){
 const h=held();
 if(h?.key==='costela_assada'){
  if(h.burned){say('Costela queimada vai para a lixeira.');return;}
  takeHeld();const units=G.stock.costela;G.avg.costela=(G.avg.costela*units+h.cost)/(units+MANTA_GRAMS);G.stock.costela+=MANTA_GRAMS;
  effect('+2 kg de costela na tábua',G.player.x,G.player.y-100,'#f6e4a8');AudioEngine.chop();costelaoTutorialEvent('tabua');save();return;
 }
 if(h){say('Traga a costela assada do espeto ou venha com as mãos livres para cortar.');return;}
 if(G.stock.costela<=0){say('A tábua está vazia: retire uma costela no ponto do espeto.');return;}
 startWeigh('costela','tabua');
}
function useMaionese(){
 const b=campoState().bowl,h=held();
 if(h){
  // Pegou maionese a mais? E na tigela devolve a porção.
  if(h.pid==='maionese'||h.key==='maionese'){takeHeld();G.avg.maionese=G.stock.maionese>0?G.avg.maionese:(h.cost||G.avg.maionese);G.stock.maionese++;effect('Maionese de volta à tigela',G.player.x,G.player.y-90,'#fff2b0');AudioEngine.tick();save();return;}
  if(h.key==='ovo'&&!h.ready&&!h.burned){if(b.ovo){say('O ovo já está na tigela. Agora o óleo.');return;}takeHeld();b.ovo=true;b.cost+=h.cost;AudioEngine.tick();save();return;}
  if(h.key==='azeite'){if(b.azeite){say('O óleo já está na tigela. Agora o ovo.');return;}takeHeld();b.azeite=true;b.cost+=h.cost;AudioEngine.tick();save();return;}
  say('Na tigela vão ovo e óleo.');return;
 }
 if(b.ovo&&b.azeite){startMix();return;}
 if(G.stock.maionese>0){readyProduct('maionese');return;}
 say(b.ovo||b.azeite?'Falta '+(b.ovo?'o óleo':'o ovo')+' na tigela.':'Traga um ovo e o óleo para a tigela.');
}
function startMix(){G.task={type:'mix',target:'maionese',progress:0,last:null,time:0};$('mixUI').classList.remove('hidden');updateMixUI();}
// Depois de começar com E, bata alternando A e D: repetir a mesma tecla não conta.
const MIX_STEP=.045;
function mixKey(k){
 const t=G.task;if(t?.type!=='mix')return;if(!['a','d'].includes(k)||k===t.last)return;
 t.progress+=MIX_STEP*(costelaoTutorialActive()?2:1);t.last=k;AudioEngine.noise(.05,.12,1600);
 if(t.progress>=1)finishMix();else updateMixUI();
}
function mixTick(dt){const t=G.task;if(t?.type!=='mix')return;t.time+=dt;t.progress=Math.max(0,t.progress-.035*dt);updateMixUI();}
function updateMixUI(){const t=G.task;if(t?.type!=='mix')return;$('mixFill').style.width=Math.round(t.progress*100)+'%';$('mixStatus').textContent=t.progress<.3?'Alterne A e D sem parar':t.progress<.75?'Está engrossando… continue!':'Quase no ponto!';}
function finishMix(){
 const b=campoState().bowl,n=3,units=G.stock.maionese;
 G.avg.maionese=(G.avg.maionese*units+b.cost)/(units+n);G.stock.maionese+=n;b.ovo=b.azeite=false;b.cost=0;
 G.task=null;$('mixUI').classList.add('hidden');AudioEngine.scaleDone();effect('Maionese pronta · 3 porções',G.player.x,G.player.y-100,'#fff2b0');costelaoTutorialEvent('maionese');save();
}
function cancelMix(){if(G.task?.type!=='mix')return;G.task=null;$('mixUI').classList.add('hidden');say('Ovo e óleo continuam na tigela.');}

// ---------- Lenha: rachar no cepo (3 golpes no ponto) e levar ao fogo ----------
function startChop(){if(!freeHand()){say('Libere as mãos para pegar o machado.');return;}G.task={type:'chop',target:'lenha',time:0,hits:0,swinging:false};$('chopUI').classList.remove('hidden');updateChopUI();}
function chopTick(dt,holding,n){
 const t=G.task;if(phoneOpen||!n||n.id!=='lenha'){abortChop();return;}
 if(holding){t.swinging=true;t.time+=dt;if(t.time/CHOP_TIME>1.25)chopRelease();}
 else if(t.swinging)chopRelease();
 updateChopUI();
}
function chopRelease(){
 const t=G.task;if(t?.type!=='chop'||!t.swinging)return;
 const fill=t.time/CHOP_TIME,good=fill>=CHOP_ZONE[0]&&fill<=CHOP_ZONE[1];t.swinging=false;t.time=0;
 if(good){t.hits++;AudioEngine.chop();burst(G.player.x+30,G.player.y-40);effect('Toc! '+t.hits+'/'+CHOP_HITS,G.player.x,G.player.y-110,'#e1ff9e');}
 else{AudioEngine.bad();effect(fill<CHOP_ZONE[0]?'Golpe fraco':'Passou do ponto',G.player.x,G.player.y-110,'#ffc0a0');}
 if(t.hits>=CHOP_HITS){G.task=null;$('chopUI').classList.add('hidden');putHeld({id:G.next++,kind:'ingredient',key:'lenha',cost:0,ready:true});AudioEngine.ready();effect('Lenha rachada! Leve ao fogo',G.player.x,G.player.y-130,'#fff2b0');costelaoTutorialEvent('rachar');save();return;}
 updateChopUI();
}
function abortChop(){if(G.task?.type!=='chop')return;G.task=null;$('chopUI').classList.add('hidden');}
function updateChopUI(){const t=G.task;if(t?.type!=='chop')return;$('chopTitle').textContent='Rachando lenha · golpe '+Math.min(CHOP_HITS,t.hits+1)+' de '+CHOP_HITS;$('chopFill').style.width=Math.min(100,t.time/CHOP_TIME*100)+'%';}
function feedFire(){const c=campoState();takeHeld();c.fuel=Math.min(100,c.fuel+LENHA_FUEL);AudioEngine.logDrop();burst(525,500);effect(c.lit?'Fogo avivado · '+Math.round(c.fuel)+'%':'Lenha no fogo · segure E para acender',525,430,'#ffd56a');costelaoTutorialEvent('fogo');save();}
function startLight(){G.task={type:'light',target:'fogo',time:0};AudioEngine.matchStrike();}
function finishLight(){const c=campoState();G.task=null;c.lit=true;c.fuel=Math.min(100,c.fuel+KINDLING);AudioEngine.ignite();burst(525,500);fxPuffs(525,505,10,160,'#d8cfc0');effect('Fogo aceso!',525,430,'#ffd56a');costelaoTutorialEvent('acender');save();}
// No primeiro costelão vai só a carne do boi do pai.
// No costelão vai no máximo a carne de um boi por domingo.
function mantasToday(){return (G.stock.costela_crua||0)+bagQty('costela_crua')+G.deliveries.filter(d=>d.key==='costela_crua').reduce((n,d)=>n+d.qty,0)+(campoState().mantasUsed||0);}
function buyManta(){if(mantasToday()>=MANTAS_PER_BOI){say('No costelão vai no máximo a carne de um boi: '+MANTAS_PER_BOI+' mantas por domingo.');AudioEngine.bad();return;}if(!G.costelaoTaught){say('No primeiro costelão vai só a carne do boi que teu pai deu.');AudioEngine.bad();return;}if(!hasCash(MANTA_BUY_COST)){say('Uma manta do açougue custa '+money(MANTA_BUY_COST)+'.');AudioEngine.bad();return;}spendCash(MANTA_BUY_COST);G.stats.purchases+=MANTA_BUY_COST;G.deliveries.push({id:G.next++,key:'costela_crua',qty:1,cost:MANTA_BUY_COST,left:8,total:8});AudioEngine.phone();say('Manta encomendada no açougue: chega em 8 s.');save();if(phoneOpen)renderPhone();}

function campoInteract(n){
 if(!isCampo())return false;const[id,arg]=n.id.split(':');
 if(id==='espeto'){useEspeto(Number(arg));return true;}
 if(id==='costela_crua'){useCostelaCrua();return true;}
 if(id==='tabua'){useTabua();return true;}
 if(id==='maionese'){useMaionese();return true;}
 if(id==='lenha'){startChop();return true;}
 if(id==='fogo'){if(held()?.key==='lenha'){feedFire();return true;}const c=campoState();if(!c.lit&&c.fuel>0){startLight();return true;}say(c.lit?'O fogo é alimentado com lenha rachada no cepo. As mantas vão nos espetos.':'Fogo apagado: rache lenha no cepo e traga para cá.');return true;}
 return false;
}
function campoHint(n){
 if(!isCampo()||!n?.id)return null;const[id,arg]=n.id.split(':');
 if(id==='espeto'){const e=campoState().espetos[Number(arg)];if(!e)return '<strong>E</strong> colocar manta de costela crua';if(e.burned)return '<strong>E</strong> retirar costela queimada';if(espetoReady(e))return '<strong>E</strong> retirar a costela no ponto';return '<strong>E</strong> virar a manta · lado no fogo: '+Math.round(Math.min(1,e.heat[e.fire])*100)+'%';}
 if(id==='costela_crua')return '<strong>E</strong> pegar manta crua · '+G.stock.costela_crua+' mantas';
 if(id==='tabua'){const c=G.shop.find(c=>c.state==='queue'&&c.pid==='costela');return held()?.key==='costela_assada'?'<strong>E</strong> apoiar a costela na tábua':'<strong>Segure E</strong> cortar '+(c?formatWeight(c.grams):'costela')+' · '+formatWeight(G.stock.costela)+' na tábua';}
 if(id==='maionese'){const b=campoState().bowl;return b.ovo&&b.azeite?'<strong>E</strong> bater a maionese (depois A e D alternados)':G.stock.maionese>0&&!held()?'<strong>E</strong> pegar maionese · '+G.stock.maionese+' porções':'Tigela: '+(b.ovo?'ovo ✓':'falta ovo')+' · '+(b.azeite?'óleo ✓':'falta óleo');}
 if(id==='fogo'){if(held()?.key==='lenha')return '<strong>E</strong> colocar lenha no fogo';if(G.task?.type==='light')return 'Acendendo… continue segurando E';if(!fireLit())return fireFuel()>0?'<strong>Segure E</strong> para acender o fogo':'Fogo apagado · rache lenha no cepo e traga aqui';return 'Fogo de chão · '+Math.round(fireFuel())+'% de lenha'+(fireFuel()<25?' · traga lenha!':'');}
 if(id==='lenha')return '<strong>E</strong> rachar lenha · segure e solte na faixa verde · '+CHOP_HITS+' golpes';
 return null;
}
const FIRST_COSTELAO_ORDERS=3;
function firstCostelao(){return G.event.id==='costelao'&&campoState().firstDay===G.day&&!costelaoTutorialActive();}
// Depois do primeiro costelão, sem carne e sem dinheiro para boi ou manta, o domingo vira dia normal.
// Domingo de costelão sem carne: antes de abrir, o caixa explica o que fazer (laçar um boi da cerca ou comprar um boi
// na Casa do Campeiro) e, sem boi nem dinheiro, deixa pular o costelão (o domingo vira dia normal).
function costelaoMeatReady(){return !G.costelaoTaught||mantasToday()>0||G.stock.costela>0||campoState().espetos.some(Boolean);}
function costelaoNoMeatText(){const herd=G.herd||0;return herd>0?'lace um boi da cerca antes de abrir':hasCash(BOI_COST)?'compre um boi na Casa do Campeiro e lace antes de abrir':'sem boi e sem dinheiro, dá para pular o costelão no caixa';}
function costelaoNoMeat(){
 const herd=G.herd||0,btn=[];let text;
 if(herd>0){text=`Não tem manta de costela na despensa. Tem <b>${herd===1?'1 boi':herd+' bois'}</b> na cerca: lace e carneie um antes de abrir.`;btn.push('<button class="primary" data-act="lassoStart">Ir laçar</button>');}
 else if(hasCash(BOI_COST)){text=`Não tem manta nem boi. Compre um boi na <b>Casa do Campeiro</b> (${money(BOI_COST)}), volte e lace antes de abrir.`;}
 else{text=`Não tem manta, nem boi, nem dinheiro para um boi (${money(BOI_COST)}). Dá para pular o costelão: hoje a bodega abre como um dia normal.`;btn.push('<button class="primary" data-act="costelaoSkip">Pular o costelão</button>');}
 btn.push('<button data-act="close">Voltar</button>');
 openDialog('Domingo de costelão sem carne',`<p>${text}</p><div class="actions">${btn.join('')}</div>`,'costelaoMeat');
}
function skipCostelao(){if(G.event.id!=='costelao'||G.phase!=='prep')return;G.event={id:'normal',seen:true,fired:{},noCostelao:true};closeDialog(true);floatNote('🔥 Sem costelão hoje: a bodega abre como um dia normal.');save();refreshHUD();openDay();}
function costelaoPossible(){if(!G.costelaoTaught||G.testMode)return true;return G.stock.costela_crua>0||G.stock.costela>0||hasCash(Math.min(BOI_COST,MANTA_BUY_COST));}
// O primeiro costelão fecha sozinho depois dos três pedidos: não conta como fechar cedo.
function firstCostelaoDone(){return firstCostelao()&&campoState().firstOrders>=FIRST_COSTELAO_ORDERS;}
function maioneseAvailable(){return G.stock.maionese>0||G.stock.ovo>0&&G.stock.azeite>0;}
function campoOrder(){
 const options=[];
 if(G.stock.costela_crua>0||G.stock.costela>0||campoState().espetos.some(Boolean))options.push(['costela',.62]);
 if(G.stock.maionese>0||G.stock.ovo>0&&G.stock.azeite>0)options.push(['maionese',.24]);
 if(G.stock.refri>0)options.push(['refri',.14]);
 if(G.up.pepino&&G.stock.pepino>0)options.push(['pepino',.12]);
 if(!options.length)return null;let r=Math.random()*options.reduce((n,o)=>n+o[1],0);
 for(const[k,w]of options){if((r-=w)<=0)return k;}return options[0][0];
}

// ---------- Desenho do campo ----------
const HERD=Array.from({length:9},(_,i)=>({x:90+i*170+(i%2)*40,y:394+(i%3)*9,coat:i%6,dir:i%2?1:-1,speed:6+(i%4)*3,graze:i%3===0}));
function drawBoi(coat,frame,x,y,scale=1.6,flip=false,alpha=1){
 if(!boisArt.complete||!boisArt.naturalWidth)return;const w=BOI_W*scale,h=BOI_H*scale;
 ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;ctx.translate(x,y);if(flip)ctx.scale(-1,1);
 ctx.drawImage(boisArt,frame*BOI_W,coat*BOI_H,BOI_W,BOI_H,-w/2,-h+4,w,h);ctx.restore();
}
function drawCampoBackground(){
 if(campoArt.complete&&campoArt.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(campoArt,0,0,W,H);ctx.imageSmoothingEnabled=true;}else rect(0,0,W,H,'#6ca040');
 // Rebanho pastando atrás da cerca
 for(const c of HERD){
  if(!c.graze){c.x+=c.dir*c.speed*(frameClock-(c.clock??frameClock));if(c.x<40||c.x>W-40){c.dir*=-1;c.x=clamp(c.x,40,W-40);}}
  c.clock=frameClock;if(Math.sin(frameClock*.2+c.x)>.92)c.graze=!c.graze;
  drawBoi(c.coat,c.graze?2:Math.floor(frameClock*2+c.x)%2,c.x,c.y,.75,c.dir<0);
 }
 if(!G.lasso){rect(ENTRY.x-70,H-25,139,23,'#624c2e',3,'#ae9253');txt('COSTELÃO',ENTRY.x,H-14,11,'#f0d088');}
}
function drawEspetoCell(cell,x,y,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;ctx.drawImage(espetoArt,cell*ESPETO_W,0,ESPETO_W,ESPETO_H,x,y,ESPETO_W*ESPETO_SCALE,ESPETO_H*ESPETO_SCALE);ctx.restore();}
function drawCampoStation(f){
 if(!isCampo())return false;const{x,y,w,h}=f,[id,arg]=f.id.split(':');
 if(id==='fogo'){
  const fuel=fireFuel(),lit=fireLit(),row=!lit?2:fuel>40?0:fuel>0?1:2,frame=lit?Math.floor(frameClock*7)%4:0;ctx.save();ctx.imageSmoothingEnabled=false;if(!lit)ctx.filter='grayscale(.85) brightness(.55)';
  if(fogoArt.complete&&fogoArt.naturalWidth)ctx.drawImage(fogoArt,frame*150,row*70,150,70,x-5,y-112,480,224);ctx.restore();
  rect(x+w/2-70,y-118,140,12,'#2a1d12',5,'#d2b982');rect(x+w/2-68,y-116,136*fuel/100,8,!lit?'#8a7a6a':fuel<25?'#e0603a':'#f0a030',3);txt(lit?'Lenha '+Math.round(fuel)+'%':fuel>0?'Apagado · segure E para acender':'Apagado · traga lenha',x+w/2,y-131,12,!lit||fuel<25?'#ffb08a':'#fff0c3');
  if(G.task?.type==='light'){const k=clamp(G.task.time/LIGHT_TIME,0,1);bar(x+w/2-60,y-152,120,k,'#ffb347');for(let i=0;i<3;i++){const ph=(frameClock*1.4+i*.33)%1;ellipse(x+w/2-20+i*20,y+20-ph*60,5+ph*8,6+ph*9,`rgba(200,195,185,${.5*(1-ph)})`);}ellipse(x+w/2,y+30,6+k*22,5+k*16,`rgba(255,${150+Math.round(k*60)},60,${.4+k*.4})`);}
  if(!lit)return true;
  ctx.save();ctx.globalCompositeOperation='lighter';const fl=(.35+.65*Math.min(1,fuel/50))*(1+Math.sin(frameClock*9)*.06);const g=ctx.createRadialGradient(x+w/2,y+40,10,x+w/2,y+40,300*fl);g.addColorStop(0,'rgba(255,140,40,.22)');g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.fillRect(x-200,y-260,w+400,520);ctx.restore();
  return true;
 }
 if(id==='espeto'){
  const e=campoState().espetos[Number(arg)],px=x+w/2-ESPETO_W*ESPETO_SCALE/2,py=y+h-ESPETO_H*ESPETO_SCALE+8;
  ellipse(x+w/2,y+h+2,26,7,'#24180c55');
  if(!e){drawEspetoCell(0,px,py);return true;}
  const front=1-e.fire,kind=front===0?0:1;
  if(e.burned)drawEspetoCell(5+kind,px,py);
  else{drawEspetoCell(1+kind,px,py);drawEspetoCell(3+kind,px,py,clamp(e.heat[front],0,1));if(e.heat[front]>1.25)drawEspetoCell(5+kind,px,py,clamp((e.heat[front]-1.25)/.55,0,1));}
  // Barras dos dois lados: verde = no ponto; vermelho = passando
  for(let s=0;s<2;s++){const v=e.heat[s],bx=x+4,by=y+h+8+s*10;rect(bx,by,w-8,7,'#2a1d12',3,'#d2b982');rect(bx+2,by+2,(w-12)*clamp(v/BURN_AT,0,1),3,v>=1.45?'#e0603a':v>=1?'#9ccc5a':'#e8b65d',1);rect(bx+2+(w-12)/BURN_AT,by,1,7,'#fff2c0');}
  const label=e.burned?'Queimou':espetoReady(e)?'Pronto ✓':e.heat[e.fire]>=1?'Vire!':'';if(label)txt(label,x+w/2,y-8,12,e.burned?'#ff9a70':espetoReady(e)?'#e2ffa8':e.heat[e.fire]>=1?'#ffd56a':'#fff0c3');
  if(!e.burned&&!espetoReady(e))for(let k=0;k<3;k++){const p=(frameClock*.5+k*.33)%1;ellipse(x+w/2+Math.sin(p*7+k)*8,y+20-p*50,4+p*5,5+p*6,`rgba(230,220,200,${.3*(1-p)})`);}
  return true;
 }
 if(id==='lenha'){ctx.save();ctx.imageSmoothingEnabled=false;if(lenhaArt.complete&&lenhaArt.naturalWidth)ctx.drawImage(lenhaArt,x-22,y+h-124,168,126);ctx.restore();if(G.task?.type==='chop')bar(x,y-24,w,G.task.hits/CHOP_HITS,'#e8b65d');return true;}
 if(id==='costela_crua'){counter(f,'wood');ctx.save();if(!G.stock.costela_crua)ctx.globalAlpha=.25;food('costela_crua',x+w/2,y+18,62);ctx.restore();rect(x+w/2-22,y+h-10,44,17,'#382e1f',3,'#b99250');txt(G.stock.costela_crua,x+w/2,y+h-1,13,G.stock.costela_crua?'#ffe4a9':'#ffad83');return true;}
 if(id==='tabua'){counter(f,'wood');ellipse(x+w/2,y+20,44,16,'#b8803e');ellipse(x+w/2,y+18,40,13,'#d4a058');if(G.stock.costela>0)food('costela',x+w/2,y+14,56);txt(formatWeight(G.stock.costela),x+w/2,y+h-8,12,'#fff0c3');if(G.task?.type==='weigh'&&G.task.target==='tabua')bar(x,y-14,w,G.task.grams/G.task.requested);return true;}
 if(id==='maionese'){
  const b=campoState().bowl;counter(f,'wood');ellipse(x+w/2,y+20,30,14,'#d8dde0');ellipse(x+w/2,y+17,26,10,'#eef2f2');
  if(b.ovo)ellipse(x+w/2-7,y+17,7,5,'#f2c23a');if(b.azeite)ellipse(x+w/2+7,y+18,8,4,'#c8b42a');
  if(G.task?.type==='mix'){ellipse(x+w/2,y+17,24,9,`rgb(${248-G.task.progress*20},${226+G.task.progress*10},${150+G.task.progress*40})`);ctx.save();ctx.translate(x+w/2,y+10);ctx.rotate(Math.sin(frameClock*18)*.5);rect(-2,-28,4,28,'#a8aeb4',2);ctx.restore();}
  else if(G.stock.maionese>0&&!b.ovo&&!b.azeite)food('maionese',x+w/2,y+14,46);
  txt(G.stock.maionese+' porç.',x+w/2,y+h-8,12,'#fff0c3');return true;
 }
 if(id==='bottle'){
  ellipse(x+w/2,y+h+6,w*.6,9,'#22180b55');rect(x,y+10,w,h-10,'#3a7ab8',6,'#1e4a78');rect(x+3,y+14,w-6,h-24,'#5a9ad0',4);rect(x-2,y,w+4,16,'#f2f4f2',5,'#9aa4aa');rect(x+w/2-10,y+5,20,4,'#9aa4aa',2);
  ctx.save();if(!G.stock.refri)ctx.globalAlpha=.25;food('refri',x+w/2,y+44,34);ctx.restore();rect(x+10,y+h-14,w-20,18,'#263425',3,'#c7b875');txt(G.stock.refri,x+w/2,y+h-5,13,'#fff0b8');return true;
 }
 return false;
}

// ---------- Tutorial do primeiro costelão ----------
// Tutorial do primeiro costelão: só a primeira etapa pausa o jogo; as outras aparecem num aviso
// rápido, com uma seta sobre a estação certa. A costela assa mais rápido e não queima no treino.
const COSTELAO_STEPS=[
 {id:'rachar',title:'Rache a lenha',text:'O fogo tá apagado. No cepo, segure E e solte na faixa verde: 3 golpes.'},
 {id:'fogo',title:'Lenha no fogo',text:'Leve a lenha até o fogo de chão e aperte E.'},
 {id:'acender',title:'Acenda o fogo',text:'Segure E no fogo até pegar.'},
 {id:'espeto',title:'Costela no espeto',text:'Pegue uma manta crua na mesa e ponha num espeto com E.'},
 {id:'virar',title:'Vire a manta',text:'Quando a barra ficar verde, aperte E no espeto para virar.'},
 {id:'retirar',title:'Retire no ponto',text:'Os dois lados verdes: aperte E para tirar do espeto.'},
 {id:'tabua',title:'Para a tábua',text:'Leve a costela à tábua de corte e aperte E.'},
 {id:'cortar',title:'Corte no peso',text:'Segure E na tábua, solte no peso pedido e entregue no balcão.'},
 {id:'maionese',title:'Maionese',text:'Ovo e óleo na tigela, E para começar e alterne A e D.'},
 {id:'servir',title:'Sirva a maionese',text:'Pegue uma porção na tigela e entregue no balcão.'}
];
function costelaoTutorial(){return campoState().tutorial;}
function costelaoTutorialActive(){const t=costelaoTutorial();return isCampo()&&!G.lasso&&!!t&&!t.done&&G.phase==='open';}
function costelaoStep(){return COSTELAO_STEPS[costelaoTutorial()?.step||0];}
function costelaoTutorialEvent(id){const t=costelaoTutorial();if(!costelaoTutorialActive()||costelaoStep()?.id!==id)return;costelaoAdvance();}
function costelaoAdvance(){const t=costelaoTutorial();t.step++;t.actor=null;t.introduced=false;if(t.step>=COSTELAO_STEPS.length){t.done=true;G.costelaoTaught=true;showBanner('Costelão liberado!','Agora a freguesia chega à vontade. Bom domingo!','level');}save();}
// O primeiro costelão nunca trava: se faltar ovo ou óleo para a maionese, o Valter traz do galinheiro dele.
function costelaoSupplies(){let given=[];if(G.stock.ovo<2&&!campoState().bowl.ovo){G.stock.ovo=2;given.push('2 ovos');}if(G.stock.azeite<1&&!campoState().bowl.azeite){G.stock.azeite=1;given.push('óleo');}if(given.length)say('O Valter trouxe '+given.join(' e ')+' para a maionese do costelão.');}
function costelaoTutorialTick(){
 const t=costelaoTutorial();let s=costelaoStep();if(!s)return;if(s.id==='maionese'&&!G.task)costelaoSupplies();
 // Pula o que o jogador já fez por conta (lenha rachada, fogo aceso, manta no espeto).
 const c=campoState(),done={rachar:()=>held()?.key==='lenha'||c.fuel>0||c.lit,fogo:()=>c.fuel>0||c.lit,acender:()=>c.lit,espeto:()=>c.espetos.some(Boolean)};
 while(s&&done[s.id]?.()){t.step++;t.introduced=false;s=costelaoStep();}if(!s){costelaoAdvance();return;}
 if(['cortar','servir'].includes(s.id)&&!t.actor&&!G.shop.some(c=>c.state==='queue')){
  const c=spawnShop(s.id==='cortar'?{pid:'costela',grams:500,training:true}:{pid:'maionese',training:true});if(c)t.actor=c.id;
 }
 // Só a primeira etapa para o jogo; as seguintes entram num aviso rápido, sem interromper.
 if(!t.introduced&&!phoneOpen){t.introduced=true;if(!t.welcomed){t.welcomed=true;openDialog('Costelão · '+s.title,`<p>${s.text}</p><p>Siga a seta: ela mostra onde ir em cada etapa.</p><button class="primary" data-act="close">Vamos lá</button>`,'costelaoStep');}else{showBanner((t.step+1)+'/'+COSTELAO_STEPS.length+' · '+s.title,s.text,'info');AudioEngine.tick();}save();}
}
function costelaoTarget(){
 const s=costelaoStep(),h=held(),c=campoState(),e=c.espetos.findIndex(Boolean);if(!s)return null;
 switch(s.id){
  case 'rachar':return 'lenha';
  case 'fogo':return h?.key==='lenha'?'fogo':'lenha';
  case 'acender':return 'fogo';
  case 'espeto':return h?.key==='costela_crua'?'espeto:'+Math.max(0,c.espetos.findIndex(x=>!x)):'costela_crua';
  case 'virar':{const x=c.espetos[e];return x&&x.heat[x.fire]>=1?'espeto:'+e:null;}
  case 'retirar':return e>=0&&espetoReady(c.espetos[e])?'espeto:'+e:null;
  case 'tabua':return 'tabua';
  case 'cortar':return h?.pid==='costela'?'service':'tabua';
  case 'maionese':return ['ovo','azeite'].includes(h?.key)?'maionese':!c.bowl.ovo?'bin:ovo':!c.bowl.azeite?'bin:azeite':'maionese';
  case 'servir':return h?.pid==='maionese'?'service':'maionese';
 }
 return null;
}
// Seta amarela pulando sobre a estação que o tutorial pede (costelão e primeiro dia).
function drawTutorialArrow(){
 if(modal)return;const id=prologueActive()?prologueBodegaTarget():sportState().waiting?'door':costelaoTutorialActive()?costelaoTarget():costelaoPrepFirst()||doorReminder()?'service':tutorialActive()&&['open','prep'].includes(G.phase)?tutorialTarget():null;
 const f=id==='door'?{id:'door',x:ENTRY.x-20,y:H-60,w:40,h:20}:id&&furniture().find(f=>f.id===id);if(!f)return;
 const x=f.x+f.w/2,y=f.y-(f.id==='fogo'?150:f.id.startsWith('espeto')?95:f.id.startsWith('table')?60:40)-Math.abs(Math.sin(frameClock*5))*12;
 ctx.fillStyle='#ffd34a';ctx.strokeStyle='#5a3a10';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-16,y-22);ctx.lineTo(x+16,y-22);ctx.lineTo(x+16,y-6);ctx.lineTo(x+26,y-6);ctx.lineTo(x,y+16);ctx.lineTo(x-26,y-6);ctx.lineTo(x-16,y-6);ctx.closePath();ctx.fill();ctx.stroke();
}
function costelaoTutorialDelivered(c){const t=costelaoTutorial();if(costelaoTutorialActive()&&c.id===t.actor){t.actor=null;costelaoAdvance();}}
function costelaoPrepFirst(){return isCampo()&&!G.lasso&&G.phase==='prep'&&!G.costelaoTaught&&!scene;}
function costelaoTutorialHint(){if(costelaoPrepFirst())return '<b>Primeiro costelão · abra o domingo</b><p>Vá ao <b>caixa</b> (o balcão), aperte <span class="keycap">E</span> e escolha <b>Abrir a bodega</b>. Depois o passo a passo mostra cada etapa: lenha, fogo, espeto, corte e maionese.</p>';const t=costelaoTutorial(),s=costelaoStep();return s?'<b>Costelão '+(t.step+1)+' / '+COSTELAO_STEPS.length+' · '+s.title+'</b><p>'+s.text+'</p>':'';}
function resetCampoDay(){const c=campoState();c.mantasUsed=0;G.stock.costela_crua=Math.min(G.stock.costela_crua||0,MANTAS_PER_BOI);c.fuel=0;c.lit=false;c.espetos=[null,null,null,null];c.bowl={ovo:false,azeite:false,cost:0};}
function costelaoWelcome(){
 const first=!G.costelaoTaught;
 // O fogo, os espetos e a tigela são zerados quando o domingo começa (resetCampoDay): o que foi feito antes de abrir continua valendo.
 {const c=campoState();c.firstOrders=0;c.firstDay=first?G.day:0;}
 if(first){campoState().tutorial={step:0,done:false,actor:null};if(G.stock.costela_crua<2){G.stock.costela_crua=2;G.avg.costela_crua=BOI_COST/MANTAS_PER_BOI;}costelaoSupplies();}
 openDialog(first?'Primeiro costelão de domingo!':'Domingo de costelão',`<p>A bodega vai para o campo: costela no fogo de chão, maionese caseira e chimarrão.</p><div class="callout">Rache lenha · ponha no fogo e segure E para acender · manta no espeto · vire quando ficar verde · retire, leve à tábua e corte no peso. Maionese: ovo + óleo, A e D alternados.</div><p>${first?'Hoje é passo a passo: os fregueses esperam você ficar pronto.':'Mantas no estoque: <b>'+G.stock.costela_crua+'</b> · costela na tábua: <b>'+formatWeight(G.stock.costela)+'</b>. Faltou carne? Laça um boi na cerca do campo.'}</p><button class="primary" data-act="close">Acender o fogo</button>`,'costelao');
}

// ---------- Laçada ----------
// Laçar não tem mais dia marcado: o boi se laça a qualquer hora no pasto do curral e depois é carneado (prologue.js).
function lassoNeeded(){return false;}
function lassoIntro(){
 const herd=G.herd||0,need=Math.min(MIN_LASSO,herd);
 openDialog(G.lassoTaught?'Laçada de sábado':'Hora de laçar os bois!',`<p>Amanhã tem costelão: lace <b>pelo menos um boi</b>. Cada laço certeiro enche a barra; com <b>${LASSO_HITS} laços</b> o boi está laçado e rende ${MANTAS_PER_BOI} mantas.</p><div class="callout"><b>Segure Q</b> para girar o laço e <b>solte</b> com o círculo sobre o boi. Quando aparecer um <b>alvo vermelho</b> no chão, é rasante de quero-quero: saia dele ou aperte <b>Espaço</b>.</div><p>Rebanho: <b>${herd===1?'1 boi':herd+' bois'}</b>${herd<MIN_LASSO?' · faltam bois! '+(physicalShopping()?'Compre na Casa do Campeiro, saindo pela porta.':'Compre no celular (Fornecedor → Campo).'):''}</p><div class="actions"><button class="primary" data-act="lassoStart" ${herd<1?'disabled':''}>Ir ao campo laçar</button>${herd<MIN_LASSO?'<button data-act="lassoBuy">Comprar bois</button>':''}${herd<1&&!hasCash(BOI_COST)?'<button data-act="lassoSkip">Sem bois nem dinheiro · pular</button>':''}</div>`,'lassoIntro');
}
function buyBoi(){if(!hasCash(BOI_COST)){say('Um boi custa '+money(BOI_COST)+'.');AudioEngine.bad();return;}spendCash(BOI_COST);G.stats.purchases+=BOI_COST;G.herd=(G.herd||0)+1;G.herdValue=(G.herdValue||0)+BOI_COST;AudioEngine.heart();say('Boi comprado! Rebanho: '+G.herd+'.');save();if(phoneOpen)renderPhone();else if(modal==='lassoIntro')lassoIntro();}
function startLasso(){
 if(!G.herd){lassoIntro();return;}closeDialog(true);if(phoneOpen)togglePhone(false);
 const n=G.lassoTaught?Math.min(G.herd,8):1,bois=Array.from({length:n},(_,i)=>({id:i,coat:Math.floor(Math.random()*BOI_COATS.length),x:420+Math.random()*900,y:480+Math.random()*330,dx:Math.random()<.5?-1:1,dy:0,state:'free',t:Math.random()*3,speed:40}));
 G.lasso={bois,caught:0,need:Math.min(MIN_LASSO,G.herd),charge:0,charging:false,throw:null,saved:{...G.player},fx:1,fy:0,time:0};
 G.player={x:220,y:700,dx:1,dy:0,walk:false};$('lassoUI').classList.remove('hidden');updateLassoUI();
 if(!G.lassoTaught)showBanner('Gire o laço segurando Q','Solte quando o círculo estiver sobre o boi. Espaço esquiva do quero-quero.','info');
 save();
}
const CURRAL={x:1360,y:470,w:200,h:190};
function lassoTick(dt){
 const L=G.lasso;if(!L||modal||paused)return;L.time+=dt;for(const e of sparks)e.life-=dt;sparks=sparks.filter(e=>e.life>0);
 L.stun=Math.max(0,(L.stun||0)-dt);L.immune=Math.max(0,(L.immune||0)-dt);L.dashCool=Math.max(0,(L.dashCool||0)-dt);querosTick(L,dt);slingTick(dt);fxTick(dt);
 let dx=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0),dy=(keys.has('s')||keys.has('ArrowDown')?1:0)-(keys.has('w')||keys.has('ArrowUp')?1:0);const len=Math.hypot(dx,dy);
 G.player.walk=!!len&&!L.charging&&!L.stun;
 if(L.dash>0){L.dash-=dt;G.player.walk=true;G.player.x=clamp(G.player.x+L.dashX*640*dt,60,1340);G.player.y=clamp(G.player.y+L.dashY*640*dt,450,870);}
 else if(L.knock>0){L.knock-=dt;G.player.x=clamp(G.player.x+L.knockX*dt,60,1340);G.player.y=clamp(G.player.y+L.knockY*dt,450,870);}
 else if(len&&!L.throw&&!L.stun){dx/=len;dy/=len;L.fx=dx;L.fy=dy;G.player.dx=dx;G.player.dy=dy;const sp=L.charging?90:230;G.player.x=clamp(G.player.x+dx*sp*dt,60,1340);G.player.y=clamp(G.player.y+dy*sp*dt,450,870);}
 if(L.charging){L.charge+=dt;L.whirl=(L.whirl||0)-dt;if(L.whirl<=0){L.whirl=.3;AudioEngine.whirl();}}
 for(const b of L.bois){
  // Caçada de javali (map-events.js): o bicho não foge, investe.
  if(L.mode==='javali'){if(b.state==='free')boarTick(L,b,dt);continue;}
  if(b.state==='caught'){const tx=CURRAL.x+40+(b.id%4)*40,ty=CURRAL.y+60+Math.floor(b.id/4)*60,d=Math.hypot(tx-b.x,ty-b.y);if(d<4){b.state='pen';continue;}b.dx=(tx-b.x)/d;b.x+=b.dx*70*dt;b.y+=(ty-b.y)/d*70*dt;continue;}
  if(b.state!=='free')continue;
  const pd=Math.hypot(b.x-G.player.x,b.y-G.player.y);
  if(pd<170){const k=1/Math.max(pd,1);b.dx=(b.x-G.player.x)*k;b.dy=(b.y-G.player.y)*k;b.speed=135;b.t=1.2;}
  else{b.t-=dt;if(b.t<=0){b.t=2+Math.random()*3;const a=Math.random()*Math.PI*2,go=Math.random()<.6;b.dx=go?Math.cos(a):0;b.dy=go?Math.sin(a)*.5:0;b.speed=go?38:0;}}
  b.x+=b.dx*b.speed*dt;b.y+=b.dy*b.speed*dt;
  if(b.x<80||b.x>1320){b.dx*=-1;b.x=clamp(b.x,80,1320);}if(b.y<470||b.y>860){b.dy*=-1;b.y=clamp(b.y,470,860);}
 }
 if(L.throw){
  const t=L.throw;t.time+=dt;
  if(t.time>=t.total&&!t.done){
   t.done=true;const hit=L.bois.filter(b=>b.state==='free').map(b=>({b,d:Math.hypot(b.x-t.tx,b.y-28-t.ty)})).filter(o=>o.d<52).sort((a,b)=>a.d-b.d)[0];
   if(hit){const b=hit.b;b.rope=(b.rope||0)+1;AudioEngine.ropeHit();
    const need=L.mode==='rodeio'?RODEO_HITS:LASSO_HITS;
    if(b.javali)javaliRoped(L,b);else if(b.rope>=need){b.state='caught';L.caught++;if(L.mode==='rodeio')L.doneTime??=L.time;AudioEngine.heart();AudioEngine.moo(.11,fxRand(.85,1.1));burst(b.x,b.y-40,'leaf');effect(L.mode==='rodeio'?'Laçou o terneiro!':'Laçou! '+L.caught+(L.caught>1?' bois':' boi'),b.x,b.y-90,'#e1ff9e');gainXP(8);}
    else{const d=Math.hypot(b.x-G.player.x,b.y-G.player.y)||1;b.dx=(b.x-G.player.x)/d;b.dy=(b.y-G.player.y)/d*.6;b.speed=170;b.t=1.3;AudioEngine.moo(.06,1.1+Math.random()*.15);effect('Laço! '+b.rope+'/'+need,b.x,b.y-100,'#ffe9a8');}}
   else{AudioEngine.thud();effect('Errou o laço',t.tx,t.ty-20,'#ffc0a0');}
   updateLassoUI();save();
  }
  if(t.time>=t.total+.35)L.throw=null;
 }
 // Boi laçado: ele vai para o curral e a laçada encerra sozinha (no costelão vai a carne de um boi só).
 if(L.mode==='rodeio'){if(!L.caught&&L.time>=RODEO_LIMIT){finishRodeio(L);return;}if(Math.floor(L.time*10)!==L.shown){L.shown=Math.floor(L.time*10);rodeioUI(L);}}
 if(L.caught>=L.need){L.endT=(L.endT||0)+dt;if(L.endT>.6&&L.bois.every(b=>b.state!=='caught')||L.endT>3)finishLasso();}
}
function lassoCharge(){const L=G.lasso;if(!L||L.throw||L.charging||L.stun>0||L.knock>0)return;L.charging=true;L.charge=0;}
function lassoAim(){const L=G.lasso,p=.5-.5*Math.cos(L.charge*Math.PI*1.4),dist=110+p*380;return {x:clamp(G.player.x+L.fx*dist,40,W-40),y:clamp(G.player.y-40+L.fy*dist,430,880),p};}
function lassoRelease(){const L=G.lasso;if(!L?.charging)return;L.charging=false;const a=lassoAim();L.throw={sx:G.player.x,sy:G.player.y-110,tx:a.x,ty:a.y,time:0,total:.32+a.p*.25};AudioEngine.lassoThrow();}
function lassoKeyDown(e){
 const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','e','q'].includes(key))e.preventDefault();
 if(key==='Escape'){pauseGame('Laçada pausada.');return;}
 // Q (ou E) gira e solta o laço; Espaço (ou Shift) esquiva do quero-quero.
 if((key==='q'||key==='e')&&!e.repeat){lassoCharge();return;}
 if(key==='f'){if(!e.repeat)slingStart();return;}
 if(key===' '||key==='Shift'){if(!e.repeat)lassoDash();return;}
 keys.add(key);
}
function lassoKeyUp(e){const key=e.key.length===1?e.key.toLowerCase():e.key;keys.delete(key);if(key==='q'||key==='e')lassoRelease();if(key==='f')slingRelease();}
function updateLassoUI(){const L=G.lasso;if(!L)return;if(L.mode==='rodeio'){rodeioUI(L);return;}$('lassoUI').querySelector('b').textContent=L.mode==='javali'?'Caçada de javali':'Laçada';$('lassoUI').querySelectorAll('small')[1].innerHTML=L.mode==='javali'?'WASD anda · segure <b>Q</b> e solte em cima do javali · <b>Espaço</b> esquiva da cabeçada':'WASD anda · segure <b>Q</b> para girar · solte em cima do boi · <b>Espaço</b> esquiva do quero-quero · <b>F</b> bodoque';if(L.mode==='javali'){const b=L.bois[0],st=mapEvState('javali');$('lassoCount').textContent=L.caught?'Javali abatido!':'Laços no javali: '+(b.rope||0)+'/'+JAVALI_HITS;$('lassoHerd').textContent='Javalis abatidos esta noite: '+st.kills+'/'+JAVALI_NEED+' · cabeçadas: '+(L.hits||0)+'/5';$('lassoFinish').disabled=true;$('lassoFinish').textContent=L.caught?'Levando o javali…':'Lace o javali';return;}const best=Math.max(0,...L.bois.filter(b=>b.state==='free').map(b=>b.rope||0));$('lassoCount').textContent=(L.caught?L.caught+(L.caught>1?' bois laçados':' boi laçado'):'Nenhum boi laçado')+(best?' · laço '+best+'/'+LASSO_HITS:'');$('lassoHerd').textContent='Rebanho no campo: '+L.bois.filter(b=>b.state==='free').length;$('lassoFinish').disabled=true;$('lassoFinish').textContent=L.caught<L.need?'Lace um boi':'Levando o boi pro curral…';}
// Boi laçado: volta para o campo (ou para a bodega) e a carne sai na hora: mantas de costela e hambúrguer.
function finishLasso(){
 const L=G.lasso;if(L?.mode==='javali'){if(L.caught>=L.need)finishHunt(L);return;}if(L?.mode==='rodeio'){finishRodeio(L);return;}if(!L||L.caught<L.need)return;
 G.herd-=L.caught;G.bullsLassoed=(G.bullsLassoed||0)+L.caught;
 G.player={...L.saved};G.lasso=null;G.lassoDay=G.day;G.lassoTaught=true;keys.clear();$('lassoUI').classList.add('hidden');
 save();refreshHUD();
 butcherBoi(L.caught);
}
// ---------- Quero-queros ----------
// Cada quero-quero guarda um ninho. Perto dele, levanta voo, circula, marca um alvo no chão e dá o rasante.
const QUERO_W=48,QUERO_H=36,QUERO_ALERT=230,QUERO_HIT=40,QUERO_KNOCK=.35,QUERO_GRACE=1;
function makeQueros(){
 const nests=[];for(let tries=0;nests.length<3&&tries<200;tries++){const n={x:360+Math.random()*880,y:520+Math.random()*310};if(Math.hypot(n.x-220,n.y-700)>320&&nests.every(o=>Math.hypot(o.x-n.x,o.y-n.y)>300))nests.push(n);}
 const fallback=[{x:560,y:560},{x:1000,y:800},{x:1220,y:540}];while(nests.length<3)nests.push(fallback[nests.length]);
 return nests.map((n,i)=>({id:i,nest:n,x:n.x,y:n.y,h:0,state:'guard',t:0,wake:1.5+i*3.5,face:i%2?-1:1,flap:i*.3,vx:0,vy:0}));
}
// Os três quero-queros levantam voo logo no começo, um depois do outro, e não largam mais o peão.
// Na primeira laçada, só um quero-quero incomoda.
function activeQueros(L){return (L.queros||[]).slice(0,G.lassoTaught?3:1);}
function startleBois(x,y){for(const b of G.lasso.bois){if(b.state!=='free')continue;const d=Math.hypot(b.x-x,b.y-y);if(d<320){b.dx=(b.x-x)/(d||1);b.dy=(b.y-y)/(d||1)*.6;b.speed=150;b.t=1.4;}}}
function querosTick(L,dt){
 L.queros??=makeQueros();const p=G.player;
 for(const q of activeQueros(L)){
  q.t-=dt;q.flap+=dt;const near=Math.hypot(p.x-q.nest.x,p.y-q.nest.y),ox=q.x;
  if(q.state==='guard'){q.x=q.nest.x;q.y=q.nest.y;q.h=0;if(near<QUERO_ALERT||L.time>=(q.wake??0)){q.state='rise';q.t=.55;AudioEngine.queroquero(.09,3);effect('Quero-quero!',q.x,q.y-100,'#ffe28a');startleBois(q.x,q.y);}}
  else if(q.state==='rise'){q.h=Math.min(180,q.h+330*dt);if(q.t<=0){q.state='circle';q.t=.9+Math.random()*.6;}}
  else if(q.state==='circle'){
   const a=L.time*1.9+q.id*2.1,tx=p.x+Math.cos(a)*230,ty=p.y+Math.sin(a)*90,k=Math.min(1,dt*2.6);q.h+=(180-q.h)*Math.min(1,dt*3);q.x+=(tx-q.x)*k;q.y+=(ty-q.y)*k;
   if(q.t<=0){q.state='warn';q.t=.75;q.tx=clamp(p.x+(p.walk?p.dx*55:0),60,1340);q.ty=clamp(p.y+(p.walk?p.dy*35:0),450,870);if(Math.random()<.6)AudioEngine.queroquero(.06,2);}
  }
  else if(q.state==='warn'){q.h+=(200-q.h)*Math.min(1,dt*3);if(q.t<=0){const d=Math.hypot(q.tx-q.x,q.ty-q.y)||1;q.state='dive';q.vx=(q.tx-q.x)/d;q.vy=(q.ty-q.y)/d;q.dist=d;q.travel=0;q.h0=q.h;AudioEngine.swoosh();}}
  else if(q.state==='dive'){
   const step=720*dt;q.x+=q.vx*step;q.y+=q.vy*step;q.travel+=step;const k=q.travel/q.dist;q.h=k<1?q.h0+(34-q.h0)*k:34+(k-1)*q.h0*1.3;
   if(!(L.immune>0)&&!(L.dash>0)&&q.h<90&&Math.hypot(p.x-q.x,p.y-q.y)<QUERO_HIT)queroHit(L,q);
   if(k>1.7){q.state='circle';q.t=1.4+Math.random()*1.1;}
  }
  else if(q.state==='flee'){q.h=Math.min(420,q.h+260*dt);q.x+=q.fleeDir*340*dt;if(q.t<=0){q.state='return';q.x=q.nest.x+q.fleeDir*900;q.h=300;}}
  else if(q.state==='return'){
   const d=Math.hypot(q.nest.x-q.x,q.nest.y-q.y);q.h=Math.max(0,q.h-110*dt);
   if(d<6&&q.h<=0)q.state='guard';else{const s=Math.min(d,280*dt);q.x+=(q.nest.x-q.x)/(d||1)*s;q.y+=(q.nest.y-q.y)/(d||1)*s;}
   if(near<QUERO_ALERT&&q.h>0){q.state='circle';q.t=.8;}
  }
  if(Math.abs(q.x-ox)>.2)q.face=q.x>ox?1:-1;
 }
}
function queroHit(L,q){
 const p=G.player;L.immune=QUERO_GRACE;L.charging=false;L.knock=QUERO_KNOCK;L.knockX=q.vx*680;L.knockY=q.vy*430;L.pecks=(L.pecks||0)+1;
 AudioEngine.ouch();AudioEngine.queroquero(.1,2);effect('Rasante de quero-quero!',p.x,p.y-150,'#ffb3a0');fxPuffs(p.x,p.y-70,6,90,'#efece6');
}
function lassoDash(){const L=G.lasso;if(!L||L.dash>0||L.dashCool>0||L.stun>0)return;L.charging=false;L.dash=.2;L.dashCool=.7;L.dashX=L.fx;L.dashY=L.fy;AudioEngine.swoosh(.05);fxPuffs(G.player.x,G.player.y,4,60,'#9c8a52');}
function drawQuero(frame,x,y,scale=2,flip=false,angle=0){
 if(!queroArt.complete||!queroArt.naturalWidth)return;const w=QUERO_W*scale,h=QUERO_H*scale;
 ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.rotate(angle);ctx.drawImage(queroArt,frame*QUERO_W,0,QUERO_W,QUERO_H,-w/2,-h/2,w,h);ctx.restore();
}
function drawQueroGround(L){
 for(const q of activeQueros(L)){
  // ninho no chão com os ovos pintados
  const n=q.nest;ellipse(n.x,n.y+2,30,10,'#5a4a2a');ellipse(n.x,n.y,24,7,'#8a7444');
  for(let i=0;i<3;i++){const ex=n.x-9+i*9,ey=n.y-2+(i%2)*2;ellipse(ex,ey,5,4,'#8a8a5a');ellipse(ex-1,ey-1,1.2,1.2,'#2a2418');ellipse(ex+2,ey+1,1,1,'#2a2418');}
  if(q.state!=='guard')ellipse(q.x,q.y+4,26*(1-q.h/420),7*(1-q.h/420),'#1c140c55');
  if(q.state==='warn'){
   const pulse=.5+.5*Math.sin(L.time*18);ellipse(q.tx,q.ty,QUERO_HIT,QUERO_HIT*.4,`rgba(230,50,36,${.18+.14*pulse})`);ctx.strokeStyle=`rgba(235,52,40,${.7+.3*pulse})`;ctx.lineWidth=4;
   ctx.beginPath();ctx.ellipse(q.tx,q.ty,QUERO_HIT,QUERO_HIT*.4,0,0,Math.PI*2);ctx.stroke();
   ctx.beginPath();ctx.moveTo(q.tx-12,q.ty-5);ctx.lineTo(q.tx+12,q.ty+5);ctx.moveTo(q.tx+12,q.ty-5);ctx.lineTo(q.tx-12,q.ty+5);ctx.stroke();
   ctx.setLineDash([6,8]);ctx.strokeStyle='rgba(220,52,40,.45)';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.tx,q.ty);ctx.stroke();ctx.setLineDash([]);
  }
 }
}
function drawQueroAir(L){
 for(const q of activeQueros(L)){
  if(q.state==='guard')continue;
  const frame=q.state==='dive'?3:Math.floor(q.flap*(q.state==='warn'?14:9))%2?1:2;
  drawQuero(frame,q.x,q.y-q.h,2.2,q.face<0,q.state==='dive'&&q.travel<q.dist?.3:0);
 }
 drawSlingAim();
 // tontura depois da bicada
 if(L.stun>0)for(let i=0;i<3;i++){const a=L.time*7+i*2.1;txt('★',G.player.x+Math.cos(a)*22,G.player.y-142+Math.sin(a)*6,14,'#ffd75e');}
}
// ---------- Quero-queros de visita no costelão ----------
// Enquanto a costela assa, às vezes pousa um quero-quero: cisca um tempo, grita e vai embora.
// Cada um tem seu gênio: perto deles, uns dão rasante (que joga o peão para trás), outros só gritam e se afastam.
// Às vezes um desiste, vai embora e volta um tempo depois.
let campoBirds=[],campoKnock={t:0,vx:0,vy:0},campoBirdReturns=[];
const CAMPO_BIRD_SPOTS=[[170,860],[600,700],[720,845],[960,680],[1480,700],[1500,860]];
function campoRoasting(){return fireLit()&&campoState().espetos.some(e=>e&&!e.burned);}
function spawnCampoBird(){
 const free=CAMPO_BIRD_SPOTS.filter(([x,y])=>Math.hypot(G.player.x-x,G.player.y-y)>220&&campoBirds.every(b=>Math.hypot(b.tx-x,b.ty-y)>120));if(!free.length)return;
 const [x,y]=pick(free),left=x<W/2;campoBirds.push({x:left?-60:W+60,y,tx:x+fxRand(-30,30),ty:y,h:230,state:'in',face:left?1:-1,flap:Math.random(),t:0,hop:0,peck:0,calm:0,aggr:.2+Math.random()*.5});AudioEngine.birdCall(.05,3);
}
function campoBirdsTick(dt){
 if(campoKnock.t>0){campoKnock.t-=dt;const nx=G.player.x+campoKnock.vx*dt,ny=G.player.y+campoKnock.vy*dt;if(canWalk(nx,G.player.y))G.player.x=nx;if(canWalk(G.player.x,ny))G.player.y=ny;}
 const roasting=campoRoasting();
 for(const r of campoBirdReturns)r.t-=dt;
 if(roasting&&campoBirds.length<2&&(campoBirdReturns.some(r=>r.t<=0)||Math.random()<dt/22)){campoBirdReturns=campoBirdReturns.filter(r=>r.t>0);spawnCampoBird();}
 for(const b of campoBirds){
  b.flap+=dt;const near=Math.hypot(G.player.x-b.x,G.player.y-b.y);
  if(b.state==='in'){const d=Math.hypot(b.tx-b.x,b.ty-b.y),s=Math.min(d,280*dt);b.x+=(b.tx-b.x)/(d||1)*s;b.y+=(b.ty-b.y)/(d||1)*s;b.h=Math.max(0,b.h-(d<220?260:60)*dt);if(d<4&&b.h<=0){b.state='ground';b.t=8+Math.random()*10;}}
  else if(b.state==='ground'){
   b.t-=dt;b.calm=Math.max(0,(b.calm||0)-dt);
   if(near<110&&!b.calm){if(Math.random()<(b.aggr??.5)){b.state='warn';b.t=.7;b.tx=G.player.x;b.ty=G.player.y;b.face=b.tx>b.x?1:-1;AudioEngine.queroquero(.09,3);continue;}
    b.calm=3+Math.random()*3;b.face=G.player.x<b.x?1:-1;b.hop=1.5;b.peck=.5;AudioEngine.birdCall(.07,2);}
   if(b.t<=0||!roasting&&b.t>2){b.state='out';b.face=b.x<W/2?-1:1;continue;}
   b.hop-=dt;if(b.hop<=0){b.hop=1+Math.random()*2.2;b.face=Math.random()<.5?-1:1;b.peck=.5;}
   b.peck=Math.max(0,b.peck-dt);if(b.peck>.25)b.x=clamp(b.x+b.face*(b.calm>2?70:34)*dt,40,W-40);
   if(Math.random()<dt/7)AudioEngine.birdCall(.03,2);
  }
  else if(b.state==='warn'){b.t-=dt;b.h=Math.min(70,b.h+180*dt);if(b.t<=0){const d=Math.hypot(b.tx-b.x,b.ty-b.y)||1;b.state='dive';b.vx=(b.tx-b.x)/d;b.vy=(b.ty-b.y)/d;b.dist=d;b.travel=0;b.h0=b.h;AudioEngine.swoosh();}}
  else if(b.state==='dive'){const step=620*dt;b.x+=b.vx*step;b.y+=b.vy*step;b.travel+=step;const k=b.travel/b.dist;b.h=k<1?b.h0+(30-b.h0)*k:30+(k-1)*120;
   if(!b.hit&&b.h<60&&Math.hypot(G.player.x-b.x,G.player.y-b.y)<40){b.hit=true;campoKnock={t:.3,vx:b.vx*650,vy:b.vy*420};AudioEngine.ouch();effect('Rasante de quero-quero!',G.player.x,G.player.y-150,'#ffb3a0');fxPuffs(G.player.x,G.player.y-70,6,90,'#efece6');}
   if(k>1.6){b.hit=false;b.calm=4+Math.random()*4;
    // depois do rasante: metade pousa de novo noutro canto, metade vai embora
    const spot=Math.random()<.5&&CAMPO_BIRD_SPOTS.filter(([x,y])=>Math.hypot(G.player.x-x,G.player.y-y)>260);
    if(spot&&spot.length){const[x,y]=pick(spot);b.state='in';b.tx=x+fxRand(-30,30);b.ty=y;b.face=b.tx>b.x?1:-1;}else{b.state='out';b.face=b.vx<0?-1:1;b.ty=b.y;}}}
  else{b.h+=160*dt;b.x+=b.face*280*dt;}
 }
 campoBirds=campoBirds.filter(b=>{if(b.state!=='out'||(b.x>-90&&b.x<W+90))return true;if(Math.random()<.4)campoBirdReturns.push({t:8+Math.random()*8});return false;});
}
function drawCampoBirds(layers){
 if(!isCampo()||G.lasso)return;
 for(const b of campoBirds)layers.push({y:b.state==='dive'?b.y:b.ty,draw:()=>{
  if(b.state==='ground'){const pecking=b.peck>0&&b.peck<=.25;drawQuero(0,b.x,b.y-28+(pecking?3:0),1.6,b.face<0,pecking?.4:0);return;}
  if(b.state==='warn'){const pulse=.5+.5*Math.sin(frameClock*18);ellipse(b.tx,b.ty,40,16,`rgba(230,50,36,${.18+.14*pulse})`);}
  if(b.state==='dive'){ellipse(b.x,b.y+3,16,5,'#1c140c44');drawQuero(3,b.x,b.y-28-b.h,1.9,b.face<0,.25);return;}
  ellipse(b.x,b.y+3,18*(1-Math.min(.7,b.h/400)),5,'#1c140c33');drawQuero(Math.floor(b.flap*9)%2?1:2,b.x,b.y-28-b.h,1.9,b.face<0,b.state==='out'?-.15:.1);
 }});
}
// Fim do costelão: carne que sobrou (crua, no espeto, na tábua ou na mão) vai fora, sem contar como prejuízo.
function discardCostelao(){
 const c=campoState(),meat=i=>i&&['costela_crua','costela_assada'].includes(i.key)||i?.pid==='costela';let cost=0,any=false;
 if(G.stock.costela_crua>0){cost+=G.stock.costela_crua*(G.avg.costela_crua||0);G.stock.costela_crua=0;any=true;}
 if(G.stock.costela>0){cost+=G.stock.costela/MANTA_GRAMS*(G.avg.costela_crua||0);G.stock.costela=0;any=true;}
 c.espetos.forEach((e,i)=>{if(e){cost+=e.cost||0;c.espetos[i]=null;any=true;}});
 G.hands=G.hands.map(i=>{if(meat(i)){cost+=i.cost||0;any=true;return null;}return i;});
 G.floor=G.floor.filter(f=>{if(meat(f.item)){cost+=f.item.cost||0;any=true;return false;}return true;});
 if(any)say('Sobrou carne do costelão: foi repartida com a vizinhança.');
 return any;
}
function skipLasso(){G.lassoDay=G.day;closeDialog(true);say('Sem bois, o costelão de amanhã fica só com o que sobrou no estoque.');nextDay();}
function drawLasso(){
 const L=G.lasso;if(!L){if(scene)drawScene();else draw();return;}beginWorld();drawCampoBackground();
 // curral (na caçada de javali é de noite e não tem curral)
 if(L.mode==='javali')huntBackdrop();else{const c=CURRAL;rect(c.x,c.y+c.h-8,c.w,10,'#5a3a20');for(let k=0;k<=5;k++){wood(c.x+k*(c.w/5)-4,c.y,9,c.h,true);}for(const y of [c.y+30,c.y+90,c.y+150])wood(c.x,y,c.w,9);txt('CURRAL',c.x+c.w/2,c.y-12,13,'#fff0c3');}
 drawQueroGround(L);
 const layers=L.bois.map(b=>({y:b.y,draw:()=>{if(b.javali){drawHuntBoar(L,b);return;}ellipse(b.x,b.y+2,40,9,'#1c140c44');drawBoi(b.coat,b.state==='free'&&b.speed===0?2:Math.floor(L.time*(b.speed>60?9:4)+b.id)%2,b.x,b.y,b.terneiro?1.15:1.6,b.dx<0);if(b.state==='free'&&b.rope){bar(b.x-32,b.y-(b.terneiro?80:100),64,b.rope/(L.mode==='rodeio'?RODEO_HITS:LASSO_HITS),'#e8cc8a');}if(b.state==='caught'){ctx.strokeStyle='#d8b878';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(b.x+(b.dx<0?-40:40),b.y-60,12,6,0,0,Math.PI*2);ctx.stroke();}}}));
 layers.push({y:G.player.y,draw:()=>personDraw(avatarSprite(),G.player.x,G.player.y,G.player.walk,true,G.player.dx,false,0,G.player.dy)});
 for(const q of activeQueros(L))if(q.state==='guard')layers.push({y:q.y,draw:()=>drawQuero(0,q.x,q.y-30,1.8,q.face<0)});
 layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
 drawQueroAir(L);drawFx();
 ctx.strokeStyle='#e8cc8a';ctx.lineWidth=3;
 if(L.charging){const a=lassoAim(),ang=L.time*14;ctx.beginPath();ctx.ellipse(G.player.x+Math.cos(ang)*8,G.player.y-132,30,10,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([8,8]);ctx.strokeStyle='#fff4c488';ctx.beginPath();ctx.moveTo(G.player.x,G.player.y-60);ctx.lineTo(a.x,a.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#ffe28a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(a.x,a.y,52,20,0,0,Math.PI*2);ctx.stroke();}
 if(L.throw){const t=L.throw,k=clamp(t.time/t.total,0,1),x=t.sx+(t.tx-t.sx)*k,y=t.sy+(t.ty-t.sy)*k-Math.sin(k*Math.PI)*90;ctx.beginPath();ctx.moveTo(G.player.x,G.player.y-80);ctx.quadraticCurveTo((G.player.x+x)/2,Math.min(y,G.player.y)-60,x,y);ctx.stroke();ctx.beginPath();ctx.ellipse(x,y,34*(.5+k*.5),12*(.5+k*.5),0,0,Math.PI*2);ctx.stroke();}
 for(const e of sparks){ctx.globalAlpha=Math.min(1,e.life);txt(e.text,e.x,e.y-(2.2-e.life)*16,15,e.color);}ctx.globalAlpha=1;
 if(L.mode==='rodeio')drawRodeioHUD(L);
 ctx.setTransform(1,0,0,1,0,0);
}
function campoSupplierHTML(){return `<div class="supply"><span class="icon"><span class="pixel-item boi-icon" aria-hidden="true"></span></span><div><b>Boi para o costelão</b><p>Rebanho: <b>${G.herd||0} bois</b><br>Cada boi laçado no sábado rende ${MANTAS_PER_BOI} mantas (${formatWeight(MANTAS_PER_BOI*MANTA_GRAMS)}).</p></div><button class="primary" data-act="buyBoi" ${hasCash(BOI_COST)?'':'disabled'}>Comprar · ${money(BOI_COST)}</button></div><div class="supply"><span class="icon">${itemIconHTML('costela_crua')}</span><div><b>Manta do açougue</b><p>Para quando faltar carne no costelão. Chega em 8 s, mas custa bem mais que laçar: ${money(MANTA_BUY_COST)} contra ${money(BOI_COST/MANTAS_PER_BOI)}.</p></div><button class="primary" data-act="buyManta" ${hasCash(MANTA_BUY_COST)&&G.costelaoTaught?'':'disabled'}>${G.costelaoTaught?'Comprar · '+money(MANTA_BUY_COST):'Depois do primeiro costelão'}</button></div><div class="supply"><span class="icon">${itemIconHTML('costela_crua')}</span><div><b>No estoque</b><p>${G.stock.costela_crua} mantas cruas · ${formatWeight(G.stock.costela)} na tábua · ${G.stock.maionese} maioneses</p></div></div>`;}
