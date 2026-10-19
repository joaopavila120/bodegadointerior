// Caverna, ferraria, novos moradores e montaria. IDs antigos permanecem na mesma ordem nos saves.
'use strict';
function expansionCharacter(key) {
  CHARACTER_ART[key] = EXPANSION_ART[key];
  const crop=EXPANSION_CROPS[key].frames[0].slice(0,4);
  return { file: key, crop, outline:[[0,0],[crop[2],0],[crop[2],crop[3]],[0,crop[3]]] };
}
PEOPLE.push(
  { id: 'padre_romio', name: 'Padre Romio', retailFav: 'erva', fav: 'refri', noAlcohol: true, unique: true, origin: 'Padre gaúcho da capela da Serra', sprite: expansionCharacter('padre-romio-v1') },
  { id: 'olmiro', name: 'Olmiro Mimoso', worldOnly: true, unique: true, retailFav: 'erva', fav: 'refri', origin: 'O último dos tropeiros · sempre a cavalo', sprite: expansionCharacter('olmiro-mounted-v1') },
  { id: 'dunstano', name: 'São Dunstano', worldOnly: true, unique: true, origin: 'Ferreiro e guardião do primeiro andar', sprite: expansionCharacter('dunstan-walk-v2') }
);
UNIQUE_VISITORS.add('padre_romio'); UNIQUE_VISITORS.add('olmiro');
const PADRE_ROMIO = PEOPLE.findIndex(p => p.id === 'padre_romio');
function registerSecondary(id, key, row = 0, steps = 3) {
  const p = PEOPLE.find(p => p.id === id); if (!p) return;
  const start = row * steps * 3;
  SECONDARY_POSES.set(p.sprite, { id, key, start, steps, height: expansionRowHeight(key, start, steps * 3) });
}
['lucia', 'anselmo', 'rosa', 'nair'].forEach((id,row) => registerSecondary(id,'secondary-common-v4',row,2));
registerSecondary('arlindo','secondary-common-v4',1,2);
for (const team of ['inter', 'gremio', 'gremio2']) for (let i=0;i<6;i++) registerSecondary(team+'_'+(i+1),'secondary-'+team+'-v4',i,2);
registerSecondary('padre_romio', 'padre-romio-v1', 0, 4);
registerSecondary('dunstano', 'dunstan-walk-v2', 0, 4);
WORLD_TALK.padre_romio = [
  { player: 'Buenas, padre! Como vai a capela?', reply: 'De porta aberta, tchê. Fé também é botar mais um prato na mesa pra quem chega.' },
  { player: 'Vai ter missa antes do baile?', reply: 'Vai sim. Primeiro a gente agradece a colheita, depois gasta a sola no salão!' },
  { player: 'Aceita um mate, Padre Romio?', reply: 'Aceito, vivente. Uma roda de mate resolve muita coisa que discussão não resolve.' },
  { player: 'O senhor também vem à bodega?', reply: 'Claro! A paróquia não termina na porta da igreja. E tua torrada tem boa fama.' }
];
WORLD_TALK.olmiro = [
  { player: 'Buenas! De onde vem essa tropa?', reply: 'Das estradas velhas, vivente. Sou Olmiro Mimoso; me chamam de último dos tropeiros.' },
  { player: 'O que ensina uma tropeada?', reply: 'Que o mais ligeiro tem de respeitar o passo do cansado. Senão tu perde a tropa pelo caminho.' },
  { player: 'Sempre em cima do cavalo?', reply: 'Meu escritório tem quatro patas, bombacha larga e horizonte de sobra.' },
  { player: 'Como se escolhe um pouso?', reply: 'Água limpa, abrigo do vento e pasto. Primeiro cuida dos animais; depois acende teu fogo.' },
  { player: 'Ainda lembra os caminhos antigos?', reply: 'Lembro pelo rio e pelo cerro. Antes de placa e asfalto, quem guiava era a experiência dos antigos.' }
];
DEFAULT_DIALOGUES.padre_romio = WORLD_TALK.padre_romio;
DEFAULT_DIALOGUES.olmiro = WORLD_TALK.olmiro;

// O primeiro andar é um refúgio permanente, também em saves que já visitaram a mina.
const DUNSTAN = { x:520,y:700,dx:0,dy:1,walk:false,step:0,wait:2 }, DUNSTAN_FORGE = { x: 700, y: 585, w: 260, h: 110 };
const DUNSTAN_PERSON = PEOPLE.findIndex(p=>p.id==='dunstano');
const DUNSTAN_ROUTE = [[520,700],[620,800],[830,800],[830,740],[620,800]];
function dunstanTick(dt) {
  if(!inCave()||caveState().floor!==1)return;
  DUNSTAN.walk=false;
  if(modal||paused||scene||worldTalkOpen())return;
  if(DUNSTAN.wait>0){DUNSTAN.wait-=dt;return;}
  const [x,y]=DUNSTAN_ROUTE[DUNSTAN.step],dx=x-DUNSTAN.x,dy=y-DUNSTAN.y,d=Math.hypot(dx,dy),step=52*dt;
  if(d<=step){DUNSTAN.x=x;DUNSTAN.y=y;DUNSTAN.step=(DUNSTAN.step+1)%DUNSTAN_ROUTE.length;DUNSTAN.wait=2.5;return;}
  DUNSTAN.dx=dx/d;DUNSTAN.dy=dy/d;
  const nx=DUNSTAN.x+DUNSTAN.dx*step,ny=DUNSTAN.y+DUNSTAN.dy*step;
  if(worldCanWalk(nx,ny)){DUNSTAN.x=nx;DUNSTAN.y=ny;DUNSTAN.walk=true;}
}
WORLD_TALK.dunstano = [
  {player:'Como vai a ferraria, São Dunstano?',reply:'O fogo está no ponto. Na bancada tu melhora o facão, a proteção e o lampião antes de descer.'},
  {player:'O que tem nos andares de baixo?',reply:'Cada bicho avisa antes de investir. Dá espaço, espera passar e só então chega com o facão.'},
  {player:'E essas pedras brilhantes?',reply:'Eu compro os minérios que tu trouxer. Até o andar 10 tem ametista; depois o chão fica vermelho e aparecem ágatas. Lá os bichos são mais brabos.'},
  {player:'Por que o senhor anda por aqui?',reply:'Cuido do fogo e de quem chega. Este primeiro andar é um refúgio; aqui tu pode respirar sossegado.'},
  {player:'Algum conselho antes de descer?',reply:'Leva pinhão para recuperar a vida. Se a coisa apertar, a corda te traz de volta à Serra.'}
];
function dunstanShopOpen() { return inCave() && caveState().floor === 1; }
function dunstanShop() {
  if (!dunstanShopOpen()) { floatNote('Procure a ferraria de São Dunstano no primeiro andar da caverna.'); return; }
  const st = caveState(), box = $('dialogContent').closest('.dialog'), keep = modal === 'dunstanShop' ? box.scrollTop : 0;
  const cards = CAVE_UPGRADES.map(u => {
    const owned = caveUp(u.id), needs = u.requires && !caveUp(u.requires), label = owned ? 'Já é teu' : needs ? 'Antes: ' + CAVE_UPGRADES.find(x => x.id === u.requires).name : 'Comprar · ' + money(u.cost);
    return `<div class="supply"><span class="icon"><span class="bag-emoji">${u.icon}</span></span><div><b>${u.name}</b><p>${u.desc}</p></div><button class="primary" data-act="facaoBuy" data-id="${u.id}" ${owned || needs || !hasCash(u.cost) ? 'disabled' : ''}>${label}</button></div>`;
  }).join('');
  openDialog('Ferraria de São Dunstano', `<div class="rpg-speaker">${portraitHTML(DUNSTAN_PERSON,72)}<div><p><b>São Dunstano</b></p><p>Aqui o fogo serve para cuidar de quem desce. Vamos preparar tua lâmina?</p></div></div><p class="small-note">Na caverna: ${caveDmg()} de dano · ${caveMaxHp()} de vida</p><div class="store-list">${cards}</div><div class="actions"><button data-act="close">Até mais</button></div>`, 'dunstanShop');
  box.scrollTop = keep;
}
function facaoBuy(id) {
  if (!dunstanShopOpen()) return;
  const u = CAVE_UPGRADES.find(x => x.id === id); if (!u || caveUp(id) || u.requires && !caveUp(u.requires)) return;
  if (!hasCash(u.cost)) { say('Falta dinheiro para ' + u.name.toLowerCase() + '.'); AudioEngine.bad(); return; }
  spendCash(u.cost); caveState().up[id] = true; AudioEngine.coins?.(); floatNote(u.icon + ' ' + u.name + ': pronto pra caverna!'); save(); refreshHUD(); dunstanShop();
}

function dunstanTalk() {
  DUNSTAN.walk=false;DUNSTAN.wait=3;DUNSTAN.dx=worldOut.x-DUNSTAN.x;DUNSTAN.dy=worldOut.y-DUNSTAN.y;
  if(caveState().dunstanTaught){worldTalk({...DUNSTAN,person:DUNSTAN_PERSON});return;}
  talk([
    ['dunstano','Buenas, Sadi. Sou São Dunstano, o ferreiro desta gruta. Aqui no primeiro andar ninguém te ataca. Pode preparar teu equipamento com calma.'],
    ['sadi','Buenas! E como faço para enfrentar os bichos lá embaixo?'],
    ['dunstano','Anda com WASD e golpeia com Espaço ou F. Na ferraria tu pode comprar o Passo de esquiva: ele libera o dash com Shift e te deixa invulnerável durante a esquiva. No celular aparece um botão depois da compra.'],
    ['dunstano','Pinhões recuperam tua vida. Se desmaiar, volta à boca da gruta e perde parte do dinheiro. Não precisa esperar a vida acabar para subir pela corda!'],
    ['dunstano','Este refúgio não tem pedras nem bichos. Do segundo ao décimo andar tu encontra ametista. Depois do décimo, vem a pedra vermelha, a ágata e inimigos mais fortes. Traga os minérios para mim: eu compro aqui na ferraria.'],
    ['dunstano','Lá embaixo, a escada aparece ao derrotar os bichos ou quebrar a pedra que a esconde. Usa E nas escadas, nos baús e na corda.'],
    ['dunstano','Minha bancada é logo ali. Aperta E perto dela para melhorar dano, alcance, velocidade do golpe, proteção e iluminação. Os andares 5, 10, 15 e 20 também liberam atalhos.'],
    ['sadi','Entendido! Vou conhecer a ferraria antes de descer.']
  ], () => { caveState().dunstanTaught = true; giveCard('dunstano','conversa no refúgio'); save(); }, 'Explorar o refúgio');
}
{
  const M = WORLD_MAPS.caverna, spots = M.spots, draw = M.draw, enter = M.onEnter, walk = M.canWalk, hint = M.hint;
  M.onEnter = function() { enter.call(this);Object.assign(DUNSTAN,{x:520,y:700,dx:0,dy:1,walk:false,step:1,wait:2}); if (caveState().floor === 1 && !caveState().dunstanTaught) dunstanTalk(); };
  M.spots = function() { const list = spots.call(this); if (caveState().floor === 1) list.push(
    { id:'cave:dunstan', ...DUNSTAN, radius:90, label:'Conversar com São Dunstano', act:dunstanTalk },
    { id:'cave:forge', x:DUNSTAN_FORGE.x+DUNSTAN_FORGE.w/2, y:DUNSTAN_FORGE.y+DUNSTAN_FORGE.h+30, radius:90, label:'Ferraria de São Dunstano', act:dunstanShop }
  ); return list; };
  M.canWalk = function(x,y) { return walk.call(this,x,y) && !(caveState().floor === 1 && hitRect([DUNSTAN_FORGE],x,y)); };
  M.hint = function() { return caveState().floor === 1 && !worldNearest() ? 'Refúgio seguro · converse com São Dunstano · E na ferraria ou na escada' : hint.call(this); };
  M.draw = function(view,seen,layers) { draw.call(this,view,seen,layers); if(caveState().floor!==1)return;
    layers.push({y:DUNSTAN.y,draw:()=>personDraw(PEOPLE[DUNSTAN_PERSON].sprite,DUNSTAN.x,DUNSTAN.y,DUNSTAN.walk,false,DUNSTAN.dx,false,0,DUNSTAN.dy)});
    layers.push({y:DUNSTAN_FORGE.y+DUNSTAN_FORGE.h,draw:()=>expansionSprite('cave-props-v1',9,DUNSTAN_FORGE.x+130,DUNSTAN_FORGE.y+110,180)});
    for(const x of [350,1050])layers.push({y:600,draw:()=>expansionSprite('cave-props-v1',11,x,600,110)});
  };
  const tick=outsideTick;outsideTick=function(dt){tick(dt);dunstanTick(dt);};
}

// Compra independente das botas antigas; ficar guardado persiste entre dias e recargas.
const HORSE_COST = 900, HORSE_POST = { x: 900, y: 710 };
function mountState() { return G.mount ??= { owned:false, stabled:false }; }
function playerMounted() { return !!worldOut && !worldMap().indoor && !scene && !!G.mount?.owned && !G.mount.stabled; }
function buyRidingHorse() {
  if (worldOut?.map !== 'ferragem' || mountState().owned) return;
  if (!hasCash(HORSE_COST)) { worldSay('Falta dinheiro para o cavalo crioulo.'); return; }
  spendCash(HORSE_COST); G.stats.purchases += HORSE_COST; Object.assign(mountState(),{owned:true,stabled:false});
  AudioEngine.coins(); save(); refreshStore(); worldSay('Cavalo encilhado! Ao sair, você já vai montado. Pode guardá-lo no campo.');
}
// Casco leve no chão quando o Sadi anda montado: um trote "pocotó", baixinho.
let hoofClock = 0, hoofStep = 0;
function hoofTick(dt) {
  if (!playerMounted() || !worldOut?.walk || paused || modal || scene) { hoofClock = 0; return; }
  hoofClock -= dt; if (hoofClock > 0) return;
  hoofStep = (hoofStep + 1) % 4; hoofClock = hoofStep % 2 ? .13 : .21;
  AudioEngine.noise(.035, .028, hoofStep % 2 ? 1500 : 1100); AudioEngine.note(hoofStep % 2 ? 210 : 170, .04, 'triangle', .02);
}
function stableHorse() {
  if(worldOut?.map!=='curral'||!mountState().owned||Math.hypot(worldOut.x-HORSE_POST.x,worldOut.y-HORSE_POST.y)>120)return;
  G.mount.stabled=!G.mount.stabled; keys.clear(); worldOut.walk=false; save();
  worldSay(G.mount.stabled?'Cavalo guardado no campo.':'Cavalo encilhado. Bora pegar a estrada!');
}
{
  // O cavalo crioulo fica na Ferragem, com as outras melhorias.
  const cards = ferragemCards;
  ferragemCards = function() { return cards() + '<h3>Montaria</h3><div class="store-list">' + extraCard('ridingHorse','🐎','Cavalo crioulo encilhado','Anda 65% mais rápido no mundo aberto. Aguarda fora dos interiores. Guarde ou busque no campo.',HORSE_COST,mountState().owned?'Já é teu':'Comprar · '+money(HORSE_COST),!mountState().owned) + '</div>'; };
  const extra=storeExtra; storeExtra=function(id){if(id==='ridingHorse'){buyRidingHorse();return;}return extra(id);};
  const hoof=outsideTick; outsideTick=function(dt){hoof(dt);hoofTick(dt);};
  const M=WORLD_MAPS.curral, spots=M.spots, draw=M.draw;
  M.spots=function(){const list=spots.call(this);if(G.mount?.owned)list.push({id:'horse:stable',...HORSE_POST,radius:90,label:G.mount.stabled?'Encilhar e montar seu cavalo':'Guardar cavalo no campo',act:stableHorse});return list;};
  M.draw=function(view,seen,layers){draw.call(this,view,seen,layers);if(!G.mount?.owned)return;
    layers.push({y:HORSE_POST.y-20,draw:()=>{wood(HORSE_POST.x-44,HORSE_POST.y-65,8,50);wood(HORSE_POST.x+36,HORSE_POST.y-65,8,50);wood(HORSE_POST.x-44,HORSE_POST.y-63,88,7);}});
    if(G.mount.stabled)layers.push({y:HORSE_POST.y,draw:()=>expansionSprite('horse-tether-v1',0,HORSE_POST.x,HORSE_POST.y,155)});
  };
}

// Presença sorteada por dia/save; visitar outro mapa não cria cópias do cavaleiro.
// Cada região tem a mesma chance. A posição e o sentido variam a cada chegada.
function roadEncounterPlan(id, regions = ['vila','serra','sc'], chance = .6) {
  if (!Number.isInteger(G.roadEncounterSeed)) G.roadEncounterSeed = Math.floor(Math.random() * 4294967296);
  let seed = (G.roadEncounterSeed ^ Math.imul(G.day, 2654435761)) >>> 0;
  for (const char of id) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  const R = caveRand(seed);
  return R() < chance ? {map:regions[Math.floor(R() * regions.length)]} : null;
}
function randomRoadWalker(M, R = Math.random) {
  const segments=[];let length=0;
  for (const line of M.walkLines || []) for (let seg=0;seg<line.length-1;seg++) {
    const a=line[seg],b=line[seg+1],size=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(size>0){length+=size;segments.push({line,seg,a,b,size});}
  }
  if(!length)return null;
  let at=R()*length,chosen=segments.at(-1);
  for(const part of segments){if(at<part.size){chosen=part;break;}at-=part.size;}
  const {line,seg,a,b,size}=chosen,t=clamp(at/size,0,1),dir=R()<.5?-1:1;
  return {line,seg,dir,x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,wait:R()*2,dx:(b[0]-a[0])/size*dir,dy:(b[1]-a[1])/size*dir,walk:false};
}
// Romio alterna entre capela e passeio; não duplica se estiver atendido na bodega.
function romioAtChapel() { return G.day % 2 === 1 && !activeUniqueVisitors().has(PADRE_ROMIO); }
{
  const spawn=spawnWalkers;
  spawnWalkers=function(M){spawn(M);if(M.id!=='serra'||romioAtChapel()||activeUniqueVisitors().has(PADRE_ROMIO)||lateNight()||prologueActive())return;
    if(!roadEncounterPlan('romio',['serra']))return;
    const route=randomRoadWalker(M);if(route)worldWalkers.push({person:PADRE_ROMIO,kind:'minor',...route});
  };
  const M=WORLD_MAPS.igreja,spots=M.spots,draw=M.draw;
  M.spots=function(){const list=spots.call(this);if(romioAtChapel()&&!scene)list.push({id:'romio',x:600,y:470,label:'Prosear com Padre Romio',act:()=>worldTalk({person:PADRE_ROMIO,x:600,y:470})});return list;};
  M.draw=function(view,seen,layers){draw.call(this,view,seen,layers);if(romioAtChapel()&&!scene)layers.push({y:470,draw:()=>personDraw(PEOPLE[PADRE_ROMIO].sprite,600,470,false,false,0,false,0,1)});};
}
// Olmiro é exclusivo das estradas; não entra em lojas, capela, esportes ou bodega.
let olmiroWalker = null, olmiroKey = '';
function olmiroTick(dt) {
  const M=worldMap();
  if(!M.walkLines||lateNight()||prologueActive()){olmiroWalker=null;olmiroKey='';return;}
  const key=G.roadEncounterSeed+':'+G.day+':'+M.id;
  if(key!==olmiroKey){const plan=roadEncounterPlan('olmiro');olmiroKey=G.roadEncounterSeed+':'+G.day+':'+M.id;olmiroWalker=plan?.map===M.id?randomRoadWalker(M):null;if(olmiroWalker)olmiroWalker.map=M.id;}
  const w=olmiroWalker;if(!w)return;
  if(worldTalkOpen()&&Math.hypot(w.x-worldOut.x,w.y-worldOut.y)<180){w.walk=false;return;}
  const target=w.line[w.seg+(w.dir>0?1:0)],dx=target[0]-w.x,dy=target[1]-w.y,d=Math.hypot(dx,dy),step=85*dt;
  w.walk=d>1;if(d<=step){w.x=target[0];w.y=target[1];w.seg+=w.dir;if(w.seg<0||w.seg>=w.line.length-1){w.dir=-w.dir;w.seg=clamp(w.seg,0,w.line.length-2);}}else{w.dx=dx/d;w.dy=dy/d;w.x+=w.dx*step;w.y+=w.dy*step;}
}
{
  const tick=outsideTick;outsideTick=function(dt){tick(dt);olmiroTick(dt);};
  const spots=walkerSpots;walkerSpots=function(){const list=spots();if(olmiroWalker?.map===worldOut?.map)list.push({id:'walker:olmiro',x:olmiroWalker.x,y:olmiroWalker.y,label:'Prosear com Olmiro Mimoso',act:()=>worldTalk({...olmiroWalker,person:PEOPLE.findIndex(p=>p.id==='olmiro')})});return list;};
  const landscape=worldLandscape;worldLandscape=function(M,seen,layers,view){landscape(M,seen,layers,view);const w=olmiroWalker;if(w&&M.id===w.map&&seen(w.x,w.y))layers.push({y:w.y,draw:()=>mountedPose('olmiro-mounted-v1',w.x,w.y,w.dx,w.dy,w.walk)});};
}
