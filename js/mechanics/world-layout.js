// Outdoor composition in world units. Adults are 130 units tall; doors should
// accommodate them. Keep shared rectangles so exits, lights and shops follow.
'use strict';
function placeWorld(r,x,y,w,h){Object.assign(r,{x,y,w,h});}
Object.assign(VILA,{W:4200,H:3000,roadY:800,roadH:110,marketY:1510,border:2680});
VILA.rail=VILA.roadY+132;
placeWorld(VILA.bodega,1220,80,860,610);
placeWorld(VILA.cancha,2180,190,740,500);
placeWorld(VILA.ferragem,3120,260,720,430);
placeWorld(VILA.horta,920,350,260,330);placeWorld(VILA.fogo,580,340,300,340);
placeWorld(VILA.atacado,820,1060,650,430);
placeWorld(VILA.agro,1820,1040,680,450);placeWorld(VILA.gado,2600,1040,680,450);
placeWorld(VILA.acougue,1760,1680,680,450);
placeWorld(VILA.estacao,3340,1020,500,200);
placeWorld(VILA.pouso,2520,1790,440,310);placeWorld(VILA.missoes,3620,1610,500,410);
placeWorld(VILA.quadro,2070,715,80,30);placeWorld(VILA.marco,1670,2490,40,60);
for(const [id,x,y,w,h] of [['valter',580,1700,540,300],['manolima',960,2200,560,310],['baitaca',3030,1720,550,300],['guri',1740,2320,550,300],['jayme',3560,2250,550,310]])placeWorld(VILA.houses.find(r=>r.id===id),x,y,w,h);
placeWorld(VILA.ctg,2460,2250,1000,340);
VILA.houses.find(r=>r.id==='guri').y=2280;
VILA.houses.find(r=>r.id==='manolima').y=2250;
VILA_ROADS.splice(0,VILA_ROADS.length,[VILA.river,800,VILA.W-VILA.river,110],[VILA.roadX,800,80,VILA.border-800],[VILA.river,1510,VILA.W-VILA.river-100,90],[VILA.river,2160,VILA.W-VILA.river-100,70]);
WORLD_MAPS.vila.walkLines=[[[620,845],[1620,845],[2800,845],[4100,845]],[[1620,845],[1620,1560],[1620,2620]],[[620,1560],[1620,1560],[2750,1560],[4100,1560]]];
Object.assign(SERRA,{W:4000,H:2800,roadX:2060,roadEnd:3900,roadSouth:2680,arroio:2130});
placeWorld(SERRA.badin,410,460,550,410);placeWorld(SERRA.casona,2220,260,650,580);
placeWorld(SERRA.mito,3400,1230,530,410);placeWorld(SERRA.dianho,2220,2250,620,410);
placeWorld(SERRA.estacao,110,1140,430,180);placeWorld(SERRA.igreja,230,1400,500,560);
placeWorld(SERRA.salao,800,1370,1180,400);placeWorld(SERRA.praca,2260,1300,450,440);
placeWorld(SERRA.coreto,2350,1370,270,300);placeWorld(SERRA.campinho,2840,1160,460,300);
placeWorld(SERRA.vinicola,2750,1650,570,340);placeWorld(SERRA.galeteria,3400,1710,540,330);
placeWorld(SERRA.vines[0],70,510,250,350);placeWorld(SERRA.vines[1],1060,510,550,350);
placeWorld(SERRA.vines[2],110,2320,710,350);placeWorld(SERRA.vines[3],3140,2310,630,360);
placeWorld(SERRA.italianos,2990,690,130,160);placeWorld(SERRA.alemaes,1390,2350,130,160);
placeWorld(SERRA.capiteis[0],1700,680,85,115);placeWorld(SERRA.capiteis[1],3570,760,85,115);
WORLD_MAPS.serra.walkLines=[[[80,985],[1200,985],[2100,985],[3100,985],[3900,985]],[[2100,150],[2100,985],[2100,1840],[2100,2690]]];
Object.assign(SC,{W:3600,H:2300});
for(const [id,x,y,w,h] of [['indavirus',580,440,590,430],['lauro',210,1250,600,430],['peixinhonabrasa',1750,1210,620,450],['loligebien',2530,1220,620,440]])placeWorld(SC.houses.find(r=>r.id===id),x,y,w,h);
placeWorld(SC.oktoberfest,1660,190,1080,620);placeWorld(SC.cafe,2870,440,610,420);
placeWorld(SC.festa,870,1260,460,380);placeWorld(SC.ostern,1120,1750,260,260);
placeWorld(SC.canchaLauro,230,1790,400,180);placeWorld(SC.bolao,2750,1850,600,320);
placeWorld(SC.grelha,2170,1850,85,65);placeWorld(SC.marco,1640,1990,130,155);
const osternTrunk=SC.obstacles.find(r=>![...SC.houses,SC.cafe,SC.bolao,SC.festa,SC.canchaLauro,SC.grelha,SC.marco,SC.oktoberfest].includes(r));
if(osternTrunk)placeWorld(osternTrunk,SC.ostern.x+100,SC.ostern.y+100,60,60);
WORLD_MAPS.sc.walkLines=[[[240,1000],[1000,1000],[1500,1000],[2600,1000],[3380,1000]],[[1500,1060],[1500,1740],[1500,2190]]];
for(const [id,layout] of [['vila',VILA],['serra',SERRA],['sc',SC]])Object.assign(WORLD_MAPS[id],{W:layout.W,H:layout.H});

function worldMainRoads(id){
 if(id==='vila')return VILA_ROADS;
 if(id==='serra')return [[0,SERRA.roadY,SERRA.roadEnd,SERRA.roadH],[SERRA.roadX,0,SERRA.roadW,SERRA.roadSouth]];
 if(id==='sc')return [[200,SC.streetY,SC.W-400,SC.streetH],[SC.roadX,SC.streetY,SC.roadW,SC.H-SC.streetY]];
 return [];
}
const worldDoorPathCache=new Map();
function worldDoorPaths(M){
 if(worldDoorPathCache.has(M.id))return worldDoorPathCache.get(M.id);
 const roads=worldMainRoads(M.id),paths=[],solid=typeof M.obstacles==='function'?M.obstacles():M.obstacles||[];
 const segment=(a,b)=>[Math.min(a.x,b.x)-22,Math.min(a.y,b.y)-22,Math.abs(a.x-b.x)+44,Math.abs(a.y-b.y)+44];
 for(const r of worldDressingBuildings(M.id)){
  const door=front(r,38),targets=roads.map(([x,y,w,h])=>w>h?{x:clamp(door.x,x+22,x+w-22),y:y+h/2}:{x:x+w/2,y:clamp(door.y,y+22,y+h-22)}).sort((a,b)=>Math.hypot(a.x-door.x,a.y-door.y)-Math.hypot(b.x-door.x,b.y-door.y));
  for(const target of targets){
   let found=false;
   const routes=[
    [door,{x:door.x,y:target.y},target],
    [door,{x:target.x,y:door.y},target],
    ...[r.x-50,r.x+r.w+50].map(x=>[door,{x,y:door.y},{x,y:target.y},target])
   ];
   for(const points of routes){
    const route=points.slice(1).map((p,i)=>segment(points[i],p));
    if(route.some(([x,y,w,h])=>solid.some(b=>x<b.x+b.w+10&&x+w>b.x-10&&y<b.y+b.h+10&&y+h>b.y-10)))continue;
    if(points.slice(1).some((p,i)=>{
     const a=points[i],steps=Math.max(1,Math.ceil(Math.hypot(p.x-a.x,p.y-a.y)/20));
     for(let j=0;j<=steps;j++)if(!M.canWalk(a.x+(p.x-a.x)*j/steps,a.y+(p.y-a.y)*j/steps))return true;
     return false;
    }))continue;
    paths.push([door.x-22,r.y+r.h,44,38],...route);found=true;break;
   }
   if(found)break;
  }
 }
 worldDoorPathCache.set(M.id,paths);return paths;
}

// Collectibles and fruit trees follow the redesigned gardens, never a building footprint.
for(const [id,x,y] of [['espora',2750,2120],['pagina1',3880,720],['pagina2',195,1920],['gaitinha',2485,1710],['pinha',1670,875],['bone',850,1710],['cruz',3580,2080]]){
 const s=SECRETS.find(s=>s.id===id);if(s)Object.assign(s,{x,y});
}
for(const [id,x,y] of [['butiazeiro',720,1650],['guabirobeira',1160,2040],['pitangueira',2830,920]])Object.assign(FORAGE.find(f=>f.id===id),{x,y});

Object.assign(CUIUDOS,front(VILA.bodega,130));
Object.assign(NEGRINHO_PATH,{x:565,y0:1120,y1:1640});
