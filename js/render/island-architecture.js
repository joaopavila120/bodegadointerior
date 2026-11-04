// Coastal architecture for the island. Images load on demand; existing quests keep their IDs.
'use strict';
const ISLAND_ART={}, islandArtLoads={}, islandMaterials=new Map();
let islandDungeonCache=null;
function islandImage(id){
  if(!ISLAND_ATLAS[id])return null;
  if(!ISLAND_ART[id]){
    const im=ISLAND_ART[id]=new Image();MATA_ART['island:'+id]=im;
    islandArtLoads[id]=new Promise(resolve=>{
      im.onload=()=>{islandDungeonCache=null;resolve(true);};im.onerror=()=>resolve(false);
      im.src='assets/images/island/'+id+'-v1.png';
    });
  }
  return ISLAND_ART[id];
}
function loadIslandArt(ids=Object.keys(ISLAND_ATLAS)){
  return Promise.all(ids.map(id=>(islandImage(id),islandArtLoads[id]))).then(r=>r.every(Boolean));
}
function islandArtRect(id,index,x,y,w,h){
  if(!islandImage(id)?.naturalWidth)return false;
  return mataArtRect('island:'+id,ISLAND_ATLAS[id].rects[index],x,y,w,h);
}
function islandSprite(id,index,x,y,w,h,anchor=.5){
  const r=ISLAND_ATLAS[id]?.rects[index];if(!r)return false;
  return islandArtRect(id,index,x-w*anchor,y-(h??w*r[3]/r[2]),w,h??w*r[3]/r[2]);
}
function islandMaterial(index,x,y,w,h){
  const id='masmorra-materiais',im=islandImage(id);if(!im?.naturalWidth)return false;
  if(!islandMaterials.has(index)){
    const r=ISLAND_ATLAS[id].rects[index],tile=document.createElement('canvas');tile.width=tile.height=512;
    const g=tile.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    for(const [sx,sy]of [[1,1],[-1,1],[1,-1],[-1,-1]]){g.save();g.translate(sx<0?512:0,sy<0?512:0);g.scale(sx,sy);g.drawImage(im,...r,0,0,256,256);g.restore();}
    islandMaterials.set(index,ctx.createPattern(tile,'repeat'));
  }
  ctx.save();ctx.fillStyle=islandMaterials.get(index);ctx.fillRect(x,y,w,h);ctx.restore();return true;
}
function islandBuilding(id,index,x,y,w,anchor=.5,height=null){
  const r=ISLAND_ATLAS[id].rects[index],h=height??w*r[3]/r[2],left=x-w*anchor;
  ctx.save();
  if(worldOut&&worldOut.x>left+16&&worldOut.x<left+w-16&&worldOut.y<y-20&&worldOut.y>y-h)ctx.globalAlpha*=.48;
  const ok=islandSprite(id,index,x,y,w,h,anchor);
  if(!ok)worldHouse({x:left,y:y-h,w,h},null,{wall:'#d3c5a7',roof:'#9a5937',chimney:false});
  ctx.restore();return ok;
}

const ISLAND_WAREHOUSE={x:5170,y:4130,w:340};
const ISLAND_WORKSHOP={x:2520,y:4648,w:430};
const ISLAND_CISTERN={x:3375,y:1450};
const ISLAND_KITCHEN={x:2440,y:1190,w:420,h:260,name:'COZINHA DA GUARDA'};
FORT_PARTS.houses.push(ISLAND_KITCHEN);
ILHA_RANCHOS.splice(0,ILHA_RANCHOS.length,[-210,0],[170,30]);
ILHA_TRILHAS.push([[4700,4250],[4650,4090],[4950,4040],[4950,4180],[5170,4190]]);
delete ilhaPaths.trilhas;
{
  const reserved=ilhaReserved,solid=ilhaFortSolid;
  ilhaReserved=function(x,y,pad=0){
    return reserved(x,y,pad)
      ||ILHA_RANCHOS.some(([dx,dy])=>Math.hypot(x-ILHA.ranchos.x-dx,y-ILHA.ranchos.y-dy)<270+pad)
      ||Math.hypot(x-ISLAND_WAREHOUSE.x,y-ISLAND_WAREHOUSE.y)<330+pad
      ||Math.hypot(x-ISLAND_WORKSHOP.x,y-ISLAND_WORKSHOP.y)<310+pad;
  };
  ilhaFortSolid=function(x,y){return solid(x,y)||Math.hypot(x-ISLAND_CISTERN.x,(y-ISLAND_CISTERN.y)*1.4)<33;};
  ilhaLandmarkSolid=function(x,y){
    const f=ILHA.farol,c=ILHA.capela,r=ILHA.ranchos;
    if(Math.hypot(x-f.x,(y-f.y)*1.4)<75||inRect({x:f.x-185,y:f.y-95,w:120,h:90},x,y))return true;
    if(ILHA_RANCHOS.some(([dx,dy])=>inRect({x:r.x+dx-145,y:r.y+dy-100,w:290,h:92},x,y)))return true;
    if(inRect({x:c.x-230,y:c.y-150,w:420,h:130},x,y))return true;
    if([ISLAND_WAREHOUSE,ISLAND_WORKSHOP].some(b=>inRect({x:b.x-b.w*.45,y:b.y-115,w:b.w*.9,h:100},x,y)))return true;
    return Math.hypot(x-ILHA.fogo.x,(y-ILHA.fogo.y)*1.6)<40;
  };
  ilhaProps=null;ilhaAchadosPos=null;
  const spots=WORLD_MAPS.ilha.spots;
  WORLD_MAPS.ilha.spots=function(){
    const list=spots.call(this),church=list.find(s=>s.id==='ilha:capela');
    if(church)Object.assign(church,{label:'Capela antiga dos Navegantes',text:'A capela dos antigos pescadores: cal branca, porta azul e sino gasto pelo sal. Ainda há velas no nicho e arruda crescendo junto às paredes.'});
    list.push({id:'ilha:armazem-sal',x:ISLAND_WAREHOUSE.x,y:ISLAND_WAREHOUSE.y+55,radius:100,info:true,label:'Armazém de sal',text:'Aqui o pescado era salgado antes de seguir de barco para o continente. As marcas dos antigos barris ainda cobrem o piso.'},
      {id:'ilha:cisterna',x:ISLAND_CISTERN.x,y:ISLAND_CISTERN.y+60,radius:85,info:true,label:'Cisterna do forte',text:'A água da chuva abastecia a guarnição quando o mar impedia a chegada dos barcos.'});
    for(const [i,h]of FORT_PARTS.houses.entries())list.push({id:'ilha:predio:'+i,x:h.x+h.w/2,y:h.y+h.h+45,radius:90,info:true,label:['Quartel da tropa','Casa do comandante','Paiol da pólvora','Cozinha da guarda'][i],text:['O alojamento dos marinheiros. Pelas janelas fechadas ainda se ouvem passos.','Da varanda, o comandante vigiava o pátio e a entrada da fortaleza.','Paredes grossas e poucas aberturas protegiam a pólvora da umidade.','O cheiro de lenha ficou nas pedras. Era aqui que se preparavam as refeições da guarnição.'][i]});
    return list;
  };
}
function islandFarolLightY(){return islandImage('farol')?.naturalWidth?ILHA.farol.y-472:ILHA.farol.y-345;}
// Rear-view cannon: wheels rest on the wall walk, barrel projects into the courtyard.
// Rendering and Grenfell's projectiles share the same muzzle; no sprite is inverted.
function fortCannonPose(x,wall=FORT_PARTS.walls.find(r=>r.cannons?.includes(x))){
  if(!wall)return null;
  const frame=ISLAND_ATLAS['canhao-patio'].rects[0],h=94,y=wall.y+wall.h-(wall.tall||FORT.H)-2;
  return{x,y,w:h*frame[2]/frame[3],h,muzzle:{x,y:y-h+3}};
}
function drawFortCannon(x,wall){
  const p=fortCannonPose(x,wall);if(!p)return;
  ellipse(p.x,p.y-8,p.w*.45,7,'rgba(15,12,8,.24)');
  if(islandSprite('canhao-patio',0,p.x,p.y,p.w,p.h))return;
  // A rear-facing fallback while the PNG is loading, using the same ground/muzzle anchors.
  for(const y of [p.y-43,p.y-12])for(const side of [-1,1])rect(x+side*23-5,y-10,10,20,'#392d22',3,'#1f1e1b');
  rect(x-20,p.y-57,40,48,'#775333',3,'#30261d');
  rect(x-11,p.muzzle.y,22,66,'#383b38',5,'#20221f');
  rect(x-8,p.muzzle.y+5,4,55,'#68695d',2);
  ellipse(x,p.y-29,12,9,'#47483f');ellipse(x,p.y-24,4,4,'#6b6755');
}
{
  const ground=drawIlhaGround,stairs=drawMasmorraEscada;
  drawMasmorraEscada=function(s){if(!islandSprite('entradas',0,s.x+s.w/2,s.y+s.h+10,s.w+28,s.h+72))stairs(s);};
  drawIlhaGround=function(view){
    ground(view);
    const F=FORT;
    if(view.x<F.x+F.w&&view.x+view.w>F.x&&view.y<F.y+F.h&&view.y+view.h>F.y){islandMaterial(3,F.x,F.y,F.w,F.h);drawMasmorraEscada(FORT_PARTS.stair);}
  };
  const wall=drawFortWall;
  drawFortWall=function(r){
    if(!islandImage('forte-muralhas')?.naturalWidth){wall({...r,cannons:null});for(const x of r.cannons||[])drawFortCannon(x,r);return;}
    const H=r.tall||FORT.H;
    if(r.side){islandArtRect('forte-muralhas',r.x<FORT.x+FORT.w/2?1:2,r.x-5,r.y-H,r.w+10,r.h+H);return;}
    if(r.tall){islandArtRect('forte-muralhas',3,r.x-8,r.y-H,r.w+16,r.h+H);return;}
    // Repeat a middle section of the masonry strip, avoiding end pillars at every join.
    const source=ISLAND_ATLAS['forte-muralhas'].rects[0],crop=[source[0]+65,source[1],source[2]-130,source[3]],n=Math.ceil(r.w/260),width=r.w/n;
    for(let k=0;k<n;k++)mataArtRect('island:forte-muralhas',crop,r.x+k*width,r.y-H,width+.5,r.h+H);
    for(const x of r.cannons||[])drawFortCannon(x,r);
  };
  drawIlhaFortLayers=function(seen,layers){
    const P=FORT_PARTS;
    for(const r of [...P.walls,...P.towers])if(seen(r.x+r.w/2,r.y+r.h/2,Math.max(r.w,r.h)))layers.push({y:r.y+r.h,draw:()=>drawFortWall(r)});
    const base=FORT.y+FORT.h+30;
    layers.push({y:base,draw:()=>{if(!islandSprite('forte-muralhas',4,P.gateX+FORT.gate/2,base,320,250)){for(const r of P.gate)wall(r);}}});
    P.houses.forEach((h,i)=>{if(seen(h.x+h.w/2,h.y+h.h,500))layers.push({y:h.y+h.h,draw:()=>islandBuilding('forte-predios',i,h.x+h.w/2,h.y+h.h,h.w,.5,[280,400,270,275][i])});});
    const c=ISLAND_CISTERN;
    if(seen(c.x,c.y))layers.push({y:c.y,draw:()=>islandSprite('objetos-costeiros',2,c.x,c.y,100)});
    layers.push({y:P.flag.y,draw:()=>drawNavioFlag(P.flag.x,P.flag.y)});
  };
  drawIlhaLandmarks=function(seen,layers){
    const c=ILHA.capela,f=ILHA.farol,r=ILHA.ranchos;
    if(seen(c.x,c.y,520))layers.push({y:c.y-20,draw:()=>islandBuilding('capela-costeira',0,c.x,c.y,440,.552)});
    if(seen(f.x,f.y,640))layers.push({y:f.y,draw:()=>islandBuilding('farol',0,f.x,f.y,300,.642)});
    ILHA_RANCHOS.forEach(([dx,dy],i)=>{if(seen(r.x+dx,r.y+dy,420))layers.push({y:r.y+dy,draw:()=>islandBuilding('vila-pesqueira',i,r.x+dx,r.y+dy,340)});});
    const s=ISLAND_WAREHOUSE;if(seen(s.x,s.y,440))layers.push({y:s.y,draw:()=>islandBuilding('vila-pesqueira',2,s.x,s.y,s.w)});
    for(const [index,x,y,w]of [[0,r.x+270,r.y+145,110],[1,s.x+190,s.y+25,90],[3,r.x-260,r.y+65,75],[7,r.x-40,r.y+190,180]])if(seen(x,y,200))layers.push({y,draw:()=>islandSprite('objetos-costeiros',index,x,y,w)});
  };
  const cliff=drawIlhaPenhasco;
  drawIlhaPenhasco=function(seen,layers){
    cliff(seen,layers);
    const P=PLANALTO,g=P.gap;
    if(seen(g.x+g.w/2,P.y,450))layers.push({y:P.y+P.face+2,draw:()=>islandSprite('entradas',1,g.x+g.w/2,P.y+P.face+12,350,302)});
  };
  drawGriggsCamp=function(seen,layers){
    const s=ISLAND_WORKSHOP;if(!seen(s.x,s.y,650))return;
    layers.push({y:s.y,draw:()=>islandBuilding('vila-pesqueira',3,s.x,s.y,s.w)});
    for(const [x,y]of GRIGGS.barris.slice(0,2))layers.push({y:y+85,draw:()=>islandSprite('masmorra-objetos',5,x+100,y+85,64)});
    layers.push({y:GRIGGS.y,draw:()=>drawGriggs(GRIGGS.x,GRIGGS.y,worldOut?.x<GRIGGS.x?-1:1)});
  };
}

// The dungeon's masonry and furniture are static. Keep one bounded surface (22 MB)
// rather than repainting every stone, wall face and cell on every animation frame.
function islandDungeonSurface(){
  if(islandDungeonCache)return islandDungeonCache;
  if(!['masmorra-materiais','masmorra-objetos','entradas'].map(islandImage).every(im=>im?.naturalWidth))return null;
  const c=document.createElement('canvas');c.width=MASM.W;c.height=MASM.H;
  const main=ctx;ctx=c.getContext('2d');
  try{
    islandMaterial(2,0,0,c.width,c.height);
    rect(0,0,c.width,c.height,'rgba(4,7,7,.77)');
    for(const r of MASM.floors){
      rect(r.x-7,r.y-6,r.w+14,r.h+14,'#242521',3);
      islandMaterial(0,r.x,r.y,r.w,r.h);
      rect(r.x,r.y,r.w,r.h,'rgba(15,22,20,.16)');
      rect(r.x,r.y+r.h-4,r.w,4,'rgba(0,0,0,.35)');
    }
    const runs=[];
    for(const f of [...MASM_FACES].sort((a,b)=>a.y-b.y||a.x-b.x)){
      const prev=runs.at(-1);
      if(prev&&prev.y===f.y&&prev.x+prev.w===f.x)prev.w+=f.w;
      else runs.push({...f});
    }
    for(const f of runs){
      islandMaterial(1,f.x,f.y,f.w,f.h);
      rect(f.x,f.y,f.w,5,'#5c6057');
      const shadow=ctx.createLinearGradient(0,f.y,0,f.y+f.h);shadow.addColorStop(0,'rgba(0,0,0,0)');shadow.addColorStop(1,'rgba(0,0,0,.46)');ctx.fillStyle=shadow;ctx.fillRect(f.x,f.y,f.w,f.h);
    }
    for(const r of MASM.cells){
      islandMaterial(0,r.x,r.y,r.w,r.h);
      rect(r.x,r.y,r.w,r.h,'rgba(8,15,14,.32)');
      islandMaterial(1,r.x,r.y-70,r.w,70);
      rect(r.x,r.y-70,r.w,4,'#5c6057');
      islandSprite('masmorra-objetos',2,r.x+r.w*.57,r.y+r.h*.65,95,64);
      islandSprite('masmorra-objetos',3,r.x+28,r.y+34,22,94);
    }
    for(const r of MASM.floors.filter(r=>r.cell==='aberta'))islandSprite('masmorra-objetos',2,r.x+r.w*.55,r.y+r.h*.6,100,68);
    islandSprite('masmorra-objetos',5,180,1250,70,78);
    islandSprite('masmorra-objetos',6,385,1620,75,66);
  }finally{ctx=main;}
  return islandDungeonCache=c;
}
{
  const dungeon=drawMasmorra;
  drawMasmorra=function(view,seen,layers){
    const surface=islandDungeonSurface();if(!surface)return dungeon(view,seen,layers);
    rect(view.x,view.y,view.w,view.h,'#0c1010');
    ctx.drawImage(surface,0,0);
    for(const r of MASM.cells)if(seen(r.x+r.w/2,r.y+r.h,250))layers.push({y:r.y+r.h,draw:()=>islandSprite('masmorra-objetos',0,r.x+r.w/2,r.y+r.h+5,r.w,142)});
    for(const r of MASM.floors.filter(r=>r.cell))if(seen(r.x+r.w/2,r.y+r.h,280))layers.push({y:r.y+r.h,draw:()=>islandSprite('masmorra-objetos',1,r.x+r.w/2,r.y+r.h+6,r.w,152)});
    if(!ilhaState().pista)islandSprite('masmorra-objetos',7,MASM.clue.x,MASM.clue.y+12,40,35);
    const s=MASM.stair;islandSprite('entradas',2,s.x,s.y+62,190,147);
    for(const [x,y]of MASM.torches)if(seen(x,y,260))layers.push({y,draw:()=>{
      islandSprite('masmorra-objetos',4,x,y-30,25,70);
      ellipse(x,y-88,3,5,'rgba(255,238,161,'+(.45+.15*Math.sin(frameClock*10+x))+')');
    }});
    if(mataCombatOn()&&!scene)drawMataNightLayers(layers,seen);
    layers.push({y:8e9,draw:()=>{
      rect(view.x,view.y,view.w,view.h,'rgba(4,8,9,.17)');
      darkHole(worldOut.x,worldOut.y-40,240,760,'4,8,9',.25);
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(const[x,y]of MASM.torches)if(seen(x,y,230))glow(x,y-88,180,.16+.02*Math.sin(frameClock*9+x),'255,180,95');
      ctx.restore();
    }});
  };
}
