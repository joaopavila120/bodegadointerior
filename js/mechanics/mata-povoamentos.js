// Os amigos da expedição passam a viver nos dois ramais da mata inicial.
// A lista de encontros existente é a única fonte de progresso, inclusive nos saves antigos.
'use strict';
const FOREST_SETTLEMENTS = {
  aldeia: { name:'Aldeia do Pinhal', direction:'no ramal ao norte da entrada', x:920, y:565, members:['jasy','kurupi','sepe'] },
  farroupilha: { name:'Acampamento Farroupilha', direction:'no ramal ao sul, atravessando o arroio pelas pedras', x:3000, y:2320, members:['lanceiro','bento','anita'] }
};
const SETTLEMENT_RECTS = {
  'aldeia-pinhal':[[15,78,612,462],[618,185,392,357],[1019,112,503,428],[33,667,488,280],[568,620,409,327],[1029,578,481,360]],
  'campanha-farroupilha':[[16,26,606,501],[644,147,369,374],[1042,125,481,383],[82,628,459,368],[660,545,361,425],[1147,524,336,472]]
};
// These two silhouettes have overlapping bounding boxes in the source atlas.
// Clip the registered frames so a neighbour's thatch never floats beside a house.
const SETTLEMENT_MASKS = {
  'aldeia-pinhal:0':[[15,445],[15,400],[88,220],[319,78],[328,78],[565,223],[626,429],[626,447],[563,519],[390,540],[255,540],[79,515]],
  'aldeia-pinhal:1':[[618,386],[618,360],[634,306],[659,268],[810,185],[822,185],[948,255],[977,286],[1009,360],[1009,390],[950,520],[868,542],[759,542],[680,520]]
};
const SETTLEMENT_PROPS = [
  {id:'casa-pinhal',group:'aldeia',art:'aldeia-pinhal',frame:0,x:740,y:430,w:470,depth:105,room:'casa:pinhal',label:'Entrar na casa do Pinhal'},
  {id:'casa-encantados',group:'aldeia',art:'aldeia-pinhal',frame:1,x:1160,y:400,w:300,depth:78,room:'casa:encantados',label:'Entrar no abrigo dos encantados'},
  {id:'artesanato',group:'aldeia',art:'aldeia-pinhal',frame:2,x:1180,y:745,w:240,depth:60},
  {id:'roda-aldeia',group:'aldeia',art:'aldeia-pinhal',frame:3,x:755,y:720,w:145,depth:35},
  {id:'cestos',group:'aldeia',art:'aldeia-pinhal',frame:4,x:1010,y:420,w:80,depth:25},
  {id:'roca',group:'aldeia',art:'aldeia-pinhal',frame:5,x:1370,y:550,w:145,depth:50},
  {id:'comando',group:'farroupilha',art:'campanha-farroupilha',frame:0,x:3010,y:2110,w:420,depth:110,room:'casa:comando-farrapo',label:'Entrar na tenda de comando'},
  {id:'alojamento',group:'farroupilha',art:'campanha-farroupilha',frame:1,x:2660,y:2235,w:280,depth:80,room:'casa:alojamento-farrapo',label:'Entrar no alojamento farroupilha'},
  {id:'mantimentos',group:'farroupilha',art:'campanha-farroupilha',frame:2,x:3370,y:2240,w:260,depth:65},
  {id:'mesa-campanha',group:'farroupilha',art:'campanha-farroupilha',frame:3,x:3150,y:2380,w:140,depth:38},
  {id:'arreios',group:'farroupilha',art:'campanha-farroupilha',frame:4,x:2700,y:2520,w:105,depth:28},
  {id:'bandeira-campanha',group:'farroupilha',art:'campanha-farroupilha',frame:5,x:3295,y:2460,w:122,depth:32}
];
const SETTLEMENT_ROOM_ART = ['aldeia-casa-interior','aldeia-refugio-interior','farroupilha-comando-interior','farroupilha-alojamento-interior'];
const settlementArtReady = Promise.all([...Object.keys(SETTLEMENT_RECTS),...SETTLEMENT_ROOM_ART].map(id=>new Promise(resolve=>{
  const im=MATA_ART['povoamento:'+id]=new Image();
  im.onload=()=>resolve(true);im.onerror=()=>resolve(false);
  im.src='assets/images/mata/povoamentos/'+id+'-v1.png';
}))).then(ok=>{mataTiles.clear();return ok.every(Boolean);});

function settlementHome(id) { return Object.values(FOREST_SETTLEMENTS).find(s=>s.members.includes(id)); }
function settlementDoor(p) { return {x:p.x,y:p.y+38}; }
function settlementSolid(x,y) {
  return SETTLEMENT_PROPS.some(p=>x>p.x-p.w*.39-12&&x<p.x+p.w*.39+12&&y>p.y-p.depth&&y<p.y-6);
}
function settlementDrawProp(p) {
  const r=SETTLEMENT_RECTS[p.art][p.frame],h=p.w*r[3]/r[2];
  ctx.save();
  if(worldOut.y<p.y-6&&worldOut.y>p.y-h&&Math.abs(worldOut.x-p.x)<p.w*.47)ctx.globalAlpha=.38;
  ellipse(p.x,p.y-4,p.w*.41,12,'rgba(18,20,10,.24)');
  const mask=SETTLEMENT_MASKS[p.art+':'+p.frame];
  if(mask&&MATA_ART['povoamento:'+p.art]?.naturalWidth){
    if(!p.clip){p.clip=new Path2D();mask.forEach(([sx,sy],i)=>{const x=p.x-p.w/2+(sx-r[0])*p.w/r[2],y=p.y-h+(sy-r[1])*h/r[3];if(i)p.clip.lineTo(x,y);else p.clip.moveTo(x,y);});p.clip.closePath();}
    ctx.clip(p.clip);
  }
  if(!mataArtRect('povoamento:'+p.art,r,p.x-p.w/2,p.y-h,p.w,h)){
    // Um arquivo ausente nunca torna a porta invisível nem impede a inicialização.
    worldHouse({x:p.x-p.w/2,y:p.y-170,w:p.w,h:170},'',{wall:'#8b7454',roof:'#80613c',chimney:false});
  }
  ctx.restore();
}
function settlementInfo(id) {
  const s=FOREST_SETTLEMENTS[id],met=s.members.filter(w=>G.mata?.folks?.[w]).map(w=>CAMP_FOLK_LIST.find(f=>f.id===w).name);
  const intro=id==='aldeia'?'Moradias de madeira, palha e chão batido. Sepé e os encantados Jasy e Kurupi encontram abrigo nesta clareira.':'Tendas, arreios e uma mesa de campanha. Anita, Bento e o Lanceiro Negro se reúnem neste acampamento.';
  showInfo(s.name,intro+' Os amigos que tu conhecer nos acampamentos da expedição passam a morar aqui e passear pelas picadas.'+(met.length?' Já chegaram: '+met.join(', ')+'.':' Segue a trilha do leste para encontrar os primeiros companheiros.'));
}

// Pequenas picadas ligam portas e áreas de convivência. São pintadas no cache do chão.
const SETTLEMENT_PATHS = [
  [[740,430],[740,490],[810,530],[920,565]],
  [[1160,400],[1160,460],[1040,520],[920,565]],
  [[1180,745],[1150,790],[1010,790],[995,650],[920,565]],
  [[755,720],[840,675],[920,565]],
  [[3010,2110],[3100,2170],[3070,2270],[3000,2320]],
  [[2660,2235],[2660,2300],[2780,2360],[3000,2320]],
  [[3370,2240],[3330,2300],[3220,2310],[3000,2320]],
  [[3000,2320],[3010,2440],[3200,2490],[3295,2460]],
  [[2660,2300],[2580,2370],[2590,2500],[2700,2520]]
];
let settlementPaths=null;
function settlementGround(view) {
  settlementPaths??=SETTLEMENT_PATHS.map(pts=>{const path=new Path2D();pts.forEach((p,i)=>i?path.lineTo(...p):path.moveTo(...p));return path;});
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  // Soft worn-earth edges instead of rectangular slabs under the buildings.
  for(const [width,alpha] of [[65,.035],[53,.06],[42,.1],[28,.15]]){
    ctx.strokeStyle='#ac8150';ctx.globalAlpha=alpha;ctx.lineWidth=width;
    for(const p of settlementPaths)ctx.stroke(p);
  }
  ctx.restore();
}

const SETTLEMENT_STARTS = {
  sepe:[[740,490],[810,530],[920,565]],
  jasy:[[1160,460],[1040,520],[920,565]],
  kurupi:[[1150,790],[1010,790],[995,650],[920,565]],
  anita:[[3100,2170],[3070,2270],[3000,2320]],
  lanceiro:[[2660,2300],[2780,2360],[3000,2320]],
  bento:[[3330,2300],[3220,2310],[3000,2320]]
};
const SETTLEMENT_ROUTES=new Map();
function settlementRoute(id) {
  if(SETTLEMENT_ROUTES.has(id))return SETTLEMENT_ROUTES.get(id);
  const indigenous=settlementHome(id)===FOREST_SETTLEMENTS.aldeia;
  const branch=mataTrails().find(t=>t.id===(indigenous?'mirante':'sul'));
  const main=mataTrails().find(t=>t.id==='principal').pts;
  const fork=branch.pts[0];
  let start=0;for(let i=1;i<main.length;i++)if(Math.hypot(main[i][0]-fork[0],main[i][1]-fork[1])<Math.hypot(main[start][0]-fork[0],main[start][1]-fork[1]))start=i;
  // All six can leave their clearing. Different turning points and waits spread them over the forest.
  const target={jasy:1250,kurupi:850,sepe:1720,lanceiro:1550,bento:2050,anita:2400}[id];
  const extension=main.slice(start).filter(p=>p[0]<=target);
  const raw=[...SETTLEMENT_STARTS[id],...branch.pts.slice().reverse(),...extension];
  const route=raw.filter((p,i)=>!i||Math.hypot(p[0]-raw[i-1][0],p[1]-raw[i-1][1])>1);
  SETTLEMENT_ROUTES.set(id,route);return route;
}
let settlementGame=null,settlementPeople=[];
function settlementResidents() {
  if(settlementGame!==G){settlementGame=G;settlementPeople=[];}
  const ids=CAMP_FOLK_LIST.filter(f=>settlementHome(f.id)&&G.mata?.folks?.[f.id]).map(f=>f.id);
  settlementPeople=settlementPeople.filter(p=>ids.includes(p.id));
  for(const id of ids)if(!settlementPeople.some(p=>p.id===id)){
    const route=settlementRoute(id),i=CAMP_FOLK_LIST.findIndex(f=>f.id===id);
    settlementPeople.push({id,x:route[0][0],y:route[0][1],route,target:1,dir:1,wait:1.8+i*.7,walk:false,dx:0,dy:1});
  }
  return settlementPeople;
}
function settlementPeopleTick(dt) {
  if(worldOut?.map!=='mata')return;
  for(const p of settlementResidents()){
    p.walk=false;
    if(paused||modal||scene||worldTalkOpen()||Math.hypot(p.x-worldOut.x,p.y-worldOut.y)<135)continue;
    if(p.wait>0){p.wait=Math.max(0,p.wait-dt);continue;}
    const q=p.route[p.target],dx=q[0]-p.x,dy=q[1]-p.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*(p.id==='jasy'?75:66));
    if(d<1){
      p.target+=p.dir;
      if(p.target>=p.route.length||p.target<0){p.dir*=-1;p.target+=p.dir*2;p.wait=4+(p.id.length%4);}
      continue;
    }
    const x=p.x+dx/d*step,y=p.y+dy/d*step;
    if(WORLD_MAPS.mata.canWalk(x,y)){p.x=x;p.y=y;p.dx=dx/d;p.dy=dy/d;p.walk=true;}
  }
}

// Quatro interiores próprios; coordenadas das colisões acompanham os móveis de cada arte.
const SETTLEMENT_ROOMS = [
  {id:'casa:pinhal',prop:'casa-pinhal',art:'aldeia-casa-interior',name:'Casa do Pinhal',group:'aldeia',
    solids:[[195,240,815,115],[1030,170,290,160],[1205,340,235,320],[125,410,160,260]],
    info:[{x:770,y:400,title:'Mesa da aldeia',text:'Cestos, mandioca, milho e ervas da mata. Um lugar para preparar comida e dividir as histórias da caminhada.'},{x:420,y:415,title:'Rede e esteiras',text:'Um canto de descanso na clareira. Depois de encontrar Sepé na expedição, tu também vai vê-lo caminhando pelas picadas daqui.'}]},
  {id:'casa:encantados',prop:'casa-encantados',art:'aldeia-refugio-interior',name:'Abrigo dos Encantados',group:'aldeia',
    solids:[[335,200,590,135],[945,190,395,190],[125,270,165,365],[1300,390,125,310]],
    info:[{x:760,y:390,title:'Ervas e sementes',text:'Um abrigo tranquilo para Jasy e Kurupi. Cada amigo encontrado nos acampamentos passa a visitar esta parte da mata.'},{x:1090,y:425,title:'Catre junto à palha',text:'A cama foi feita de madeira e fibras trançadas. Do lado de fora, as picadas levam de volta ao refúgio do Giuseppe.'}]},
  {id:'casa:comando-farrapo',prop:'comando',art:'farroupilha-comando-interior',name:'Tenda de Comando Farroupilha',group:'farroupilha',
    solids:[[190,175,365,180],[570,160,410,230],[1025,175,305,170],[1200,340,245,365],[125,360,170,350]],
    info:[{x:780,y:440,title:'Mesa de campanha',text:'Mapas abertos, uma bússola e espaço para reunir os companheiros. Anita, Bento e o Lanceiro Negro vêm para este acampamento depois dos encontros na expedição.'},{x:1100,y:405,title:'Arreios de campanha',text:'Selas, cordas e ponchos preparados para a estrada. O acampamento guarda a memória dos companheiros farroupilhas.'}]},
  {id:'casa:alojamento-farrapo',prop:'alojamento',art:'farroupilha-alojamento-interior',name:'Alojamento Farroupilha',group:'farroupilha',
    solids:[[180,160,390,195],[610,170,320,145],[1015,160,355,170],[125,350,120,355],[1290,335,155,375]],
    info:[{x:400,y:405,title:'Catres de campanha',text:'Cobertores, ponchos e os poucos pertences de quem vive na estrada. Os moradores passeiam pela mata e param para conversar quando tu chega perto.'},{x:760,y:390,title:'Sela e bornal',text:'Equipamento simples, remendado depois de muita viagem. O próximo encontro na floresta pode trazer mais um companheiro para cá.'}]}
];
function settlementRoomPoint(x,y) { return {x:85+x*.8,y:25+y*.8}; }
function settlementRoomWalk(room,x,y) {
  const px=(x-85)/.8,py=(y-25)/.8;
  const floor=px>145&&px<1390&&py>350&&py<695,door=px>700&&px<825&&py>=650&&py<1000;
  return (floor||door)&&!room.solids.some(([sx,sy,w,h])=>px>sx-18&&px<sx+w+18&&py>sy-12&&py<sy+h+12);
}
for(const room of SETTLEMENT_ROOMS){
  const prop=SETTLEMENT_PROPS.find(p=>p.id===room.prop);
  const back=()=>({map:'mata',...settlementDoor(prop),title:FOREST_SETTLEMENTS[room.group].name});
  MATA_MAPS.add(room.id);MATA_MUSIC_MAPS.add(room.id);
  WORLD_MAPS[room.id]={id:room.id,name:room.name,indoor:true,W:1400,H:880,
    spawn:()=>settlementRoomPoint(760,825),canWalk:(x,y)=>settlementRoomWalk(room,x,y),
    edge:p=>p.y>settlementRoomPoint(0,960).y?back():null,
    spots:()=>[
      ...room.info.map((s,i)=>({id:room.id+':info'+i,...settlementRoomPoint(s.x,s.y),radius:100,label:s.title,act:()=>showInfo(s.title,s.text)})),
      {id:room.id+':exit',...settlementRoomPoint(760,900),radius:80,label:'Voltar para a mata',act:()=>switchMap(back())}
    ],
    draw(view){
      rect(view.x,view.y,view.w,view.h,'#110e09');
      const im=MATA_ART['povoamento:'+room.art];
      if(im?.naturalWidth)ctx.drawImage(im,85,25,1228.8,819.2);
      else{rect(200,300,1000,300,'#775239');rect(645,560,100,270,'#775239');}
    }
  };
}

{
  const map=WORLD_MAPS.mata,walk=map.canWalk,spots=map.spots,draw=map.draw,paint=paintMataTerrain,tick=outsideTick;
  map.canWalk=function(x,y){return walk.call(this,x,y)&&!settlementSolid(x,y);};
  map.spots=function(){return [...spots.call(this),
    ...SETTLEMENT_PROPS.filter(p=>p.room).map(p=>({id:'settlement:'+p.id,...settlementDoor(p),radius:85,label:p.label,act:()=>enterInterior(p.room)})),
    ...Object.entries(FOREST_SETTLEMENTS).map(([id,s])=>({id:'settlement:'+id,x:s.x,y:s.y,radius:65,label:s.name,act:()=>settlementInfo(id)})),
    ...settlementResidents().map(p=>({id:'resident:'+p.id,x:p.x,y:p.y,radius:110,label:'Prosear com '+CAMP_FOLK_LIST.find(f=>f.id===p.id).name,act:()=>{p.walk=false;p.wait=4;campFolkTalk(CAMP_FOLK_LIST.find(f=>f.id===p.id));}}))
  ];};
  map.draw=function(view,seen,layers){
    draw.call(this,view,seen,layers);
    for(const p of SETTLEMENT_PROPS)if(seen(p.x,p.y,550))layers.push({y:p.y-6,draw:()=>settlementDrawProp(p)});
    for(const p of settlementResidents())if(seen(p.x,p.y,180))layers.push({y:p.y,draw:()=>drawCampFolk(p.id,p.x,p.y,1,p.dx,p.walk,p.dy)});
  };
  paintMataTerrain=function(view){paint(view);settlementGround(view);};
  outsideTick=function(dt){tick(dt);settlementPeopleTick(dt);};
}
