// Novos encontros e recompensas. IDs são acrescentados ao fim para preservar saves.
'use strict';
const OKTO_VISITORS = [
  {id:'hans',name:'Hans',sheet:'oktober-hans-v1'},
  {id:'helga',name:'Helga',sheet:'oktober-helga-v1'}
];
const ROAD_RIDERS = [
  {id:'estela',name:'Estela',sheet:'estela-mounted-v1'},
  {id:'ramiro',name:'Ramiro',sheet:'ramiro-mounted-v1'},
  {id:'arami',name:'Arami',sheet:'charrua-mounted-v1'}
];
for(const p of OKTO_VISITORS){
  PEOPLE.push({id:p.id,name:p.name,onlyChopp:true,homeRegion:'sc',retailFav:'cerveja',fav:'cerveja',origin:'Santa Catarina · Oktoberfest',sprite:expansionCharacter(p.sheet)});
  registerSecondary(p.id,p.sheet,0,4);
}
for(const p of ROAD_RIDERS)PEOPLE.push({id:p.id,name:p.name,worldOnly:true,unique:true,origin:p.id==='arami'?'Cavaleiro charrua da fronteira':'Cavaleiro dos caminhos do Sul',sprite:expansionCharacter(p.sheet)});
PEOPLE.push({id:'saci',name:'Saci',worldOnly:true,unique:true,origin:'Uma visita das noites de vento',sprite:expansionCharacter('saci-walk-v2')});
const SACI_PERSON=PEOPLE.findIndex(p=>p.id==='saci');
Object.assign(WORLD_TALK,{
  hans:[
    {player:'Buenas, Hans! Indo pra festa?',reply:'Se a bandinha começou, minhas pernas já sabem o caminho. Mas antes, um chopp na tua bodega!'},
    {player:'Esse traje é de ocasião?',reply:'É o meu de domingo e de Oktoberfest. O suspensório já aguentou muita dança!'},
    {player:'Vai querer comer alguma coisa?',reply:'Hoje só chopp, por favor. A Helga já me fez repetir o almoço.'},
    {player:'Como anda a festa em Santa Catarina?',reply:'Tem música, vizinho reencontrando vizinho e história que cresce a cada mesa. Prost!'}
  ],
  helga:[
    {player:'Buenas, Helga! Vestida pra festa?',reply:'Dirndl ajeitado e sapato confortável. Festa boa é a que deixa a gente dançar até o fim.'},
    {player:'O Hans já passou por aqui.',reply:'Então já falou da bandinha! Se deixar, ele transforma qualquer terça-feira em Oktoberfest.'},
    {player:'O que vai querer na bodega?',reply:'Só um chopp bem tirado. A espuma faz parte, mas deixa espaço pra bebida, hein!'},
    {player:'E a volta pra casa?',reply:'Com calma e companhia. Antes disso, quero ouvir mais uma música.'}
  ],
  estela:[
    {player:'Buenas, amazona! Qual é o rumo?',reply:'Sou Estela. Vou onde o campo chama, mas minha querência fica aqui na fronteira.'},
    {player:'Esse cavalo é parceiro antigo?',reply:'Desde potranco. Primeiro ganhou minha confiança, depois ganhou sela. Pressa não ensina ninguém.'},
    {player:'Como tu escolhe o caminho?',reply:'Olho o tempo, a água e o chão. Atalho que machuca o cavalo nunca vale a distância.'},
    {player:'Passa pra tomar um mate!',reply:'Passo sim, depois de dar água pro meu parceiro. Quem carrega a gente merece cuidado primeiro.'}
  ],
  ramiro:[
    {player:'Buenas! Teu chapéu faz uma sombra boa.',reply:'Ramiro, ao teu dispor. Aqui cabe sombra pra mim e conselho pra quem pedir!'},
    {player:'Esse poncho já viu muita estrada?',reply:'Viu geada, chuva de lado e noite sem pouso. O remendo é novo; os causos são antigos.'},
    {player:'Vai muito longe hoje?',reply:'Até onde der antes de cansar o cavalo. O horizonte não foge; amanhã a gente continua.'},
    {player:'E esse bigode, não atrapalha o mate?',reply:'Só filtra a primeira erva, vivente! O difícil é o vento não me pentear do avesso.'}
  ],
  arami:[
    {player:'Buenas. Como te chamas?',reply:'Arami. Sou charrua e caminho por estas bandas com meu cavalo. É bom encontrar gente que escuta.'},
    {player:'Tu conhece bem a fronteira?',reply:'Conheço alguns caminhos e sigo aprendendo outros. O rio muda a margem; a gente precisa prestar atenção.'},
    {player:'Como vai o teu companheiro?',reply:'Vai bem. Na subida eu alivio o passo, na parada confiro a água. A viagem é dos dois.'},
    {player:'Tem lugar pra um mate na bodega.',reply:'Agradeço. Uma conversa com respeito vale uma parada no caminho. Guarda um lugar na sombra.'}
  ],
  saci:[
    {player:'Mas bah! Era tu naquele redemoinho?',reply:'Com uma perna eu passeio. Com o vento eu chego antes de tu terminar a pergunta!'},
    {player:'Foi tu que escondeu minha tampa?',reply:'Eu? Capaz! Mas olha atrás do fogão… e não pergunta como eu sei.'},
    {player:'Vai entrar na bodega?',reply:'Hoje fico na estrada. Se o chapéu sair voando, corre devagar: pode ser só brincadeira minha.'},
    {player:'Te vi passar por aqui duas vezes!',reply:'Uma era eu, a outra era a poeira tentando acompanhar. Guarda minha figurinha pra lembrar!'}
  ]
});
for(const id of [...OKTO_VISITORS,...ROAD_RIDERS].map(p=>p.id).concat('saci'))DEFAULT_DIALOGUES[id]=WORLD_TALK[id];

// Os visitantes de SC só chegam quando a região e a chopeira estão disponíveis.
{
  const pool=visitorPool;
  visitorPool=function(team=null){return pool(team).filter(i=>!PEOPLE[i].onlyChopp||(!regionLocked('sc')&&unlocked('cerveja')));};
  const minors=minorPeople;
  minorPeople=function(){return minors().filter(i=>!PEOPLE[i].worldOnly&&!PEOPLE[i].homeRegion);};
  const spawn=spawnWalkers;
  spawnWalkers=function(M){
    // O Arami, cavaleiro charrua, só cruza as estradas de noite (também depois das 23h30, quando o resto já dormiu).
    spawn(M);if(!M.walkLines?.length||prologueActive())return;
    const late=lateNight();
    const occupied=new Set([...G.shop.map(c=>c.person),...G.groups.flatMap(g=>g.members||[g.person])]);
    const add=(p,regions)=>{
      const i=PEOPLE.findIndex(x=>x.id===p.id);if(occupied.has(i))return;
      if(roadEncounterPlan(p.id,regions)?.map!==M.id)return;
      const route=randomRoadWalker(M);if(route)worldWalkers.push({person:i,kind:'minor',...route});
    };
    if(M.id==='sc'&&!late)OKTO_VISITORS.forEach(p=>add(p,['sc']));
    if(['vila','serra','sc'].includes(M.id))ROAD_RIDERS.forEach(p=>{if(p.id==='arami'?worldNight():!late)add(p);});
  };
  const person=drawExpansionPerson;
  drawExpansionPerson=function(sprite,x,y,walking,chef,dx,seated,mood,dy){
    if(chef&&caveDefeatActive())return drawCaveDefeatedPlayer(x,y);
    const rider=ROAD_RIDERS.find(p=>PEOPLE.find(q=>q.id===p.id).sprite===sprite);
    if(rider&&!chef&&worldOut&&!worldMap().indoor)return mountedPose(rider.sheet,x,y,dx,dy,walking);
    return person(sprite,x,y,walking,chef,dx,seated,mood,dy);
  };
}

// Encontro noturno: uma única decisão por mapa/noite, sem sortear a cada quadro.
let saciEncounter=null,saciEncounterKey='',saciEncounterGame=null;
function saciTick(dt){
  const M=worldMap();
  if(saciEncounterGame!==G){saciEncounterGame=G;saciEncounterKey='';saciEncounter=null;}
  if(!['vila','serra','sc'].includes(M.id)||!worldNight()||prologueActive()){saciEncounter=null;saciEncounterKey='';return;}
  const key=G.day+':'+M.id;
  if(key!==saciEncounterKey){
    saciEncounterKey=key;saciEncounter=null;
    const R=caveRand(G.day*1109+{vila:23,serra:37,sc:59}[M.id]);if(R()>=.35)return;
    const route=randomRoadWalker(M,R);if(!route)return;
    saciEncounter={...route,map:M.id,age:0,mode:'hop'};
  }
  const w=saciEncounter;if(!w)return;
  w.walk=false;if(paused||modal||scene||worldTalkOpen())return;
  w.age+=dt;w.mode=w.age%12<6?'hop':'whirl';
  const target=w.line[w.seg+(w.dir>0?1:0)],dx=target[0]-w.x,dy=target[1]-w.y,d=Math.hypot(dx,dy),step=(w.mode==='whirl'?150:65)*dt;
  if(d<=step){w.x=target[0];w.y=target[1];w.seg+=w.dir;if(w.seg<0||w.seg>=w.line.length-1){w.dir=-w.dir;w.seg=clamp(w.seg,0,w.line.length-2);}}
  else{w.dx=dx/d;w.dy=dy/d;w.x+=w.dx*step;w.y+=w.dy*step;w.walk=true;}
}
function saciTalk(){if(!saciEncounter)return;worldTalk({...saciEncounter,person:SACI_PERSON});giveCard('saci','encontro noturno');}
{
  const tick=outsideTick;outsideTick=function(dt){tick(dt);saciTick(dt);};
  const spots=walkerSpots;walkerSpots=function(){const list=spots();if(saciEncounter?.map===worldOut?.map&&worldNight())list.push({id:'walker:saci',...saciEncounter,label:'Prosear com o Saci',act:saciTalk});return list;};
  const landscape=worldLandscape;
  worldLandscape=function(M,seen,layers,view){landscape(M,seen,layers,view);const w=saciEncounter;if(!w||w.map!==M.id||!worldNight()||!seen(w.x,w.y))return;
    layers.push({y:w.y,draw:()=>{const start=w.mode==='whirl'?4:0,step=w.walk?Math.floor(w.age*7)%4:0,hop=start===0&&w.walk?Math.max(0,Math.sin(w.age*7*Math.PI/2))*14:0;expansionSprite('saci-walk-v2',start+step,w.x,w.y-hop,115,w.dx<0,expansionRowHeight('saci-walk-v2',start,4));}});
  };
}

// Venda de minerais na ferraria, separada da venda de colheita no Armazém.
BAG_RAW.agata.value=18;
function mineralTradeHTML(){return '<h3>Vender minérios</h3><div class="store-list">'+['ametista','agata'].map(k=>{
  const q=Math.floor(bagQty(k));return `<div class="supply"><span class="icon">${bagIcon(k)}</span><div><b>${bagName(k)}</b><p>${q} no inventário · ${money(BAG_RAW[k].value)} por unidade</p></div><button data-act="dunstanSell" data-id="${k}:1" ${q?'':'disabled'}>Vender 1</button><button class="primary" data-act="dunstanSell" data-id="${k}:all" ${q?'':'disabled'}>Vender tudo · ${money(q*BAG_RAW[k].value)}</button></div>`;
}).join('')+'</div>';}
function dunstanSell(id){
  if(!dunstanShopOpen()||modal!=='dunstanShop')return false;
  const [key,amount]=String(id).split(':');if(!['ametista','agata'].includes(key)||!['1','all'].includes(amount))return false;
  const q=amount==='all'?Math.floor(bagQty(key)):1;if(q<1||!bagTake(key,q))return false;
  const value=round(q*BAG_RAW[key].value);G.cash=round(G.cash+value);AudioEngine.coins();floatNote('São Dunstano comprou '+q+' '+bagName(key).toLowerCase()+' · +'+money(value));save();refreshHUD();dunstanShop();return true;
}
{
  const shop=dunstanShop;dunstanShop=function(){if(!dunstanShopOpen())return;skipWorldTalk();shop();$('dialogContent').querySelector('.store-list').insertAdjacentHTML('beforebegin',mineralTradeHTML()+'<h3>Melhorias do equipamento</h3>');caveUpdateControls();};
  const speak=dunstanTalk;dunstanTalk=function(){speak();if(caveState().dunstanTaught)giveCard('dunstano','conversa no refúgio');};
  const talkWorld=worldTalk;worldTalk=function(w){
    $('dunstanTradeButton')?.remove();
    const id=PEOPLE[w.person]?.id,original=WORLD_TALK[id];
    if([...OKTO_VISITORS,...ROAD_RIDERS].some(p=>p.id===id)||id==='saci')if(customDialogues[id]?.length)WORLD_TALK[id]=customDialogues[id];
    try{talkWorld(w);}finally{if(original)WORLD_TALK[id]=original;}
    if(w.person===DUNSTAN_PERSON&&worldTalkOpen())$('worldTalkUI').insertAdjacentHTML('beforeend','<button id="dunstanTradeButton" class="small" data-act="dunstanShop">Negociar e melhorar equipamento</button>');
  };
}

// Derrota: o mundo congela enquanto o corpo cai e a tela escurece.
let caveDefeat=null;
function caveDefeatActive(){return !!caveDefeat&&caveDefeat.game===G;}
function beginCaveDefeat(){
  if(!inCave()||caveDefeatActive())return;
  const lost=Math.min(50,Math.round(G.cash*.1));G.cash=round(G.cash-lost);caveState().hp=0;
  caveDefeat={game:G,t:0,lost};keys.clear();worldOut.walk=false;caveFloorRun().swing=null;caveFloorRun().dash=null;
  AudioEngine.caveFaintSound();save();
  let el=$('caveDefeat');if(!el){el=document.createElement('section');el.id='caveDefeat';el.className='cave-defeat';el.setAttribute('role','status');el.innerHTML='<p>às vezes é morto quem peleia</p>';document.body.appendChild(el);}
  el.classList.remove('hidden');updateCaveDefeatOverlay();
}
function updateCaveDefeatOverlay(){
  const el=$('caveDefeat');if(!el||!caveDefeatActive())return;
  const t=caveDefeat.t;el.style.backgroundColor='rgba(0,0,0,'+clamp((t-.25)/2.1,0,1)+')';el.firstElementChild.style.opacity=clamp((t-1.5)/.8,0,1);
}
function caveDefeatTick(dt){
  if(!caveDefeatActive())return;
  caveDefeat.t+=Math.max(0,dt);updateCaveDefeatOverlay();
  if(caveDefeat.t>=4.5){const lost=caveDefeat.lost;caveDefeat=null;$('caveDefeat')?.classList.add('hidden');caveRecover(lost);}
}
function drawCaveDefeatedPlayer(x,y){
  const t=clamp(caveDefeat.t/1.1,0,1),ease=t*t*(3-2*t),sprite=avatarSprite();
  ctx.save();ctx.translate(x+ease*22,y-ease*8);ctx.rotate(ease*Math.PI*.48);
  if(sprite===0)expansionSprite('sadi-combat-v1',7,0,0,124,false,expansionRowHeight('sadi-combat-v1',4,4));
  else{const crop=characterCrop(sprite),width=124*crop.w/crop.h;ctx.drawImage(characterFrame(sprite,124),-width/2,-124,width,124);}
  ctx.restore();return true;
}
{
  const step=frameStep;frameStep=function(time){
    if(!caveDefeatActive()){if(caveDefeat){caveDefeat=null;$('caveDefeat')?.classList.add('hidden');}return step(time);}
    const dt=document.hidden?0:Math.min(.05,Math.max(0,(time-lastFrame)/1000));lastFrame=time;
    caveDefeatTick(dt);draw();AudioEngine.update(dt);
  };
  const simulation=simulate;simulate=function(dt,background=false){if(!caveDefeatActive())simulation(dt,background);};
  const act=action;action=function(name,id){
    if(caveDefeatActive())return;
    if(name==='dunstanSell'){dunstanSell(id);return;}
    if(name==='dunstanShop'){dunstanShop();return;}
    return act(name,id);
  };
  document.addEventListener('keydown',e=>{if(caveDefeatActive()){e.preventDefault();e.stopImmediatePropagation();}},true);
}

// Espécies distintas no inventário; missões antigas continuam aceitando qualquer peixe.
const RIVER_FISH=[
  {key:'jundia',name:'Jundiá',value:4,note:'Bagre de barbilhões, habitante do rio Uruguai.'},
  {key:'piava',name:'Piava',value:5,note:'Peixe de escamas e corpo alongado do rio Uruguai.'},
  {key:'grumata',name:'Grumatã',value:4,note:'Peixe prateado de boca voltada para baixo.'},
  {key:'traira',name:'Traíra',value:6,note:'Peixe de corpo alongado e manchas escuras.'}
];
for(const f of RIVER_FISH){BAG_RAW[f.key]={name:f.name,icon:'🐟',value:f.value,note:f.note};SELLABLE.push(f.key);}
function catchRiverFish(n){
  const fish=pick(RIVER_FISH);bagAdd(fish.key,n);AudioEngine.ready();farmXP(4,'+'+n+' '+fish.name.toLowerCase()+' no inventário');return fish.key;
}
{
  const image=itemImageForSize,icon=itemIconHTML;
  itemImageForSize=function(key,pixels){const i=RIVER_FISH.findIndex(f=>f.key===key);return i<0?image(key,pixels):expansionFrame('uruguai-fish-v1',i,Math.max(16,(pixels||64)*.45))?.image;};
  itemIconHTML=function(key,item=null){const i=RIVER_FISH.findIndex(f=>f.key===key);return i<0?icon(key,item):`<span class="pixel-item">${expansionPortrait('uruguai-fish-v1',i,72)}</span>`;};
  const have=haveItem;haveItem=function(k){return have(k)+(k==='peixe'?RIVER_FISH.reduce((n,f)=>n+bagQty(f.key),0):0);};
  const take=takeItems;takeItems=function(want){
    if(!want.peixe)return take(want);
    let left=want.peixe;for(const key of ['peixe',...RIVER_FISH.map(f=>f.key)]){const q=Math.min(left,bagQty(key));if(q)bagTake(key,q);left-=q;if(left<=0)break;}
    const rest={...want};delete rest.peixe;take(rest);
  };
}

// Novas figurinhas saem dos encontros correspondentes, uma única vez.
{
  const kill=caveKill;caveKill=function(b){kill(b);if(['teiniagua','onca'].includes(b.kind))giveCard(b.kind,'criatura da caverna');};
}
