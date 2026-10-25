// Region-specific flora replaces existing dressing at the same safe positions.
// No new collisions, no gameplay RNG, no trees covering entrances or landmarks.
'use strict';
ENV_CROPS['regional-flora-v1']=[
  [44,95,336,466],[417,136,350,425],[804,98,345,464],[1206,81,284,480],
  [29,663,361,264],[414,668,349,262],[790,644,337,284],[1158,693,353,235]
];
ENV_CROPS['ipes-sc-v1']=[[21,139,740,761],[777,129,738,771]];
ENV_CROPS['tree-varieties-v1']=[[39,63,614,558],[678,41,544,579],[28,655,682,567],[710,632,505,591]];
const regionalIdentityReady=Promise.all(['regional-flora-v1','ipes-sc-v1','tree-varieties-v1'].map(id=>new Promise(resolve=>{
  const im=ENV_ART[id]=new Image();
  im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src='assets/images/environment/'+id+'.png';
}))).then(ok=>{regionalTerrainTiles.clear();worldGroundTileCache.clear();return ok.every(Boolean);});
let regionalIpeSites=null;
function regionalIpes(){
  if(regionalIpeSites)return regionalIpeSites;
  const selected=[],replaced=regionalExtraTrees(WORLD_MAPS.sc);
  const candidates=worldDressing(WORLD_MAPS.sc).props.filter(p=>p.sheet==='nature'&&p.index<3&&p.index!==1&&
    !replaced.some(t=>t.replace&&t.x===p.x&&t.y===p.y)&&regionalTreeClear('sc',p.x,p.y,p.w,p.h));
  candidates.sort((a,b)=>frontierNoise(a.x+53,a.y)-frontierNoise(b.x+53,b.y));
  for(const p of candidates){
    if(selected.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<600))continue;
    selected.push({x:p.x,y:p.y,i:selected.length%2});
    if(selected.length===5)break;
  }
  return regionalIpeSites=selected;
}
function regionalFloraIndex(map,index,x,y){
  return map==='sc'?regionalIpes().find(p=>p.x===x&&p.y===y)?.i??null:null;
}

// A few stable, seeded additions per town. No gameplay RNG or save migration.
const regionalExtraTreeCache=new Map();
function regionalExtraTrees(M){
  if(!ENV_MAIN_MAPS.has(M.id))return [];
  if(regionalExtraTreeCache.has(M.id))return regionalExtraTreeCache.get(M.id);
  const d=worldDressing(M),trees=[],overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  let seed=59371;for(const c of M.id)seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const obstacles=typeof M.obstacles==='function'?M.obstacles():M.obstacles||[];
  const reserved=[...worldLandmarkClearings(M.id),...obstacles,
    ...d.roads.map(([x,y,w,h])=>({x:x-20,y:y-20,w:w+40,h:h+40})),
    ...d.buildings.map(b=>({x:b.x-30,y:b.y-45,w:b.w+60,h:b.h+160})),
    ...(M.spots?.()||[]).map(p=>({x:p.x-80,y:p.y-85,w:160,h:170}))];
  if(M.id==='serra')reserved.push(...SERRA.vines,SERRA.praca,SERRA.campinho,{x:0,y:SERRA.arroio-40,w:M.W,h:150});
  if(M.id==='vila')reserved.push(VILA.horta,VILA.fogo);
  if(M.id==='sc')reserved.push(SC.ostern,SC.canchaLauro);
  const oldTrees=d.props.filter(p=>p.sheet==='nature'&&p.index<3);
  const available=(x,y,w,h)=>M.canWalk(x,y)&&M.canWalk(x-28,y)&&M.canWalk(x+28,y)&&
    !reserved.some(r=>overlap({x:x-w/2,y:y-h,w,h:h+12},r));
  // Reuse some broadleaf positions first: retain the araucarias and avoid overcrowding.
  const candidates=oldTrees.filter(p=>M.id==='sc'||p.index!==1).slice().sort((a,b)=>frontierNoise(a.x+17,a.y)-frontierNoise(b.x+17,b.y));
  for(const p of candidates){
    const w=Math.min(p.w,256),h=Math.min(p.h,320);
    if(!available(p.x,p.y,w,h))continue;
    if(trees.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<230))continue;
    trees.push({i:trees.length%4,x:p.x,y:p.y,w,h,replace:true});
    if(trees.length>=8)break;
  }
  for(let attempt=0;attempt<2200&&trees.length<12;attempt++){
    const x=Math.round(150+random()*(M.W-300)),y=Math.round(410+random()*(M.H-550));
    const w=224+Math.floor(random()*5)*8,h=288+Math.floor(random()*5)*8;
    // Ground tufts may sit under a canopy; only solid sites, access and trees reserve space.
    if(!available(x,y,w,h))continue;
    if([...oldTrees,...trees].some(p=>Math.hypot(p.x-x,(p.y-y)*.9)<(w+p.w)*.48))continue;
    trees.push({i:trees.length%4,x,y,w,h});
  }
  regionalExtraTreeCache.set(M.id,trees);return trees;
}
{
  const landscape=worldLandscape;
  worldLandscape=function(M,seen,layers,view){
    landscape(M,seen,layers,view);
    if(!ENV_ART['tree-varieties-v1']?.naturalWidth)return;
    for(const t of regionalExtraTrees(M)){
      if(!seen(t.x,t.y,t.h+30))continue;
      layers.push({y:t.y,draw:()=>{
        ctx.save();ellipse(t.x+6,t.y+2,t.w*.23,12,'#17291930');
        const p=worldOut;if(p&&Math.abs(p.x-t.x)<t.w*.46&&p.y<t.y+6&&p.y>t.y-t.h)ctx.globalAlpha*=.42;
        ctx.translate(Math.sin(frameClock*.7+t.x*.017)*.8,0);
        environmentSprite('tree-varieties-v1',t.i,t.x,t.y,t.w,t.h);ctx.restore();
      }});
    }
  };
}
function regionalDetailIndex(map,index){
  if(map==='serra')return index===4?5:index===2?4:6;
  if(map==='sc')return index===2?7:6;
  return null;
}
const regionalTreeVisibility=new Map();
function regionalTreeClear(map,x,y,w,h){
  const key=[map,x,y,w,h].join(':');if(regionalTreeVisibility.has(key))return regionalTreeVisibility.get(key);
  const M=WORLD_MAPS[map],r={x:x-w/2,y:y-h,w,h:h+5};
  const overlaps=b=>r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y;
  const reserved=map==='serra'?[SERRA.praca,SERRA.campinho,...SERRA.vines]:[SC.ostern,SC.canchaLauro];
  const clear=!worldDressingBuildings(map).some(b=>overlaps({x:b.x-16,y:b.y-45,w:b.w+32,h:b.h+110}))&&
    !regionalRoads(M).some(([x,y,w,h])=>overlaps({x,y,w,h}))&&
    !worldLandmarkClearings(map).some(overlaps)&&!reserved.some(overlaps);
  regionalTreeVisibility.set(key,clear);return clear;
}
{
  const tree=worldTreeSprite,sprite=environmentSprite,meadow=paintRegionalMeadow,world=worldSprite;
  worldTreeSprite=function(index,x,y,w,h){
    const map=worldOut?.map,i=regionalFloraIndex(map,index,x,y);
    if(ENV_ART['tree-varieties-v1']?.naturalWidth&&ENV_MAIN_MAPS.has(map)&&
      regionalExtraTrees(WORLD_MAPS[map]).some(t=>t.replace&&t.x===x&&t.y===y))return true;
    if(map==='serra')return regionalTreeClear(map,x,y,w,h)?tree(index,x,y,w,h):true;
    if(map==='sc'&&!regionalTreeClear(map,x,y,w,h))return true;
    if(map==='sc'&&i===null)return tree(index===1?1:0,x,y,w,h);
    if(i===null||!ENV_ART['ipes-sc-v1'].naturalWidth)return tree(index,x,y,w,h);
    const height=Math.floor(h/8)*8,width=Math.floor(w/8)*8;
    if(!regionalTreeClear(worldOut.map,x,y,width,height))return true;
    ctx.save();ellipse(x+8,y+2,width*.25,12,'#15261928');
    const p=worldOut;if(p&&Math.abs(p.x-x)<width*.43&&p.y<y+6&&p.y>y-height*.8)ctx.globalAlpha*=.42;
    ctx.translate(Math.sin(frameClock*.65+x*.017)*.8,0);
    const drawn=sprite('ipes-sc-v1',i,x,y,width,height);ctx.restore();return drawn;
  };
  environmentSprite=function(sheet,index,x,y,w,h){
    if(sheet==='rural-details-v2'&&ENV_DECOR_MAPS.has(worldOut?.map)&&ENV_ART['environment-props-v3']?.naturalWidth){
      const kind=index===4?'home':index===2?'garden':'woodland';
      return sprite('environment-props-v3',environmentPropIndex(worldOut.map,kind,x,y),x,y,w,h);
    }
    const i=sheet==='rural-details-v2'?regionalDetailIndex(worldOut?.map,index):null;
    if(i!==null&&ENV_ART['regional-flora-v1'].naturalWidth)return sprite('regional-flora-v1',i,x,y,w,h);
    return sprite(sheet,index,x,y,w,h);
  };
  worldSprite=function(sheet,index,x,y,w,h){
    const map=worldOut?.map;
    if(sheet==='nature'&&index===5&&ENV_MAIN_MAPS.has(map)&&ENV_ART['environment-props-v3']?.naturalWidth)
      return sprite('environment-props-v3',environmentPropIndex(map,'garden',x,y),x+w/2,y+h,w,h);
    // Flower beds belong to house gardens, never scattered meadow decorations.
    if(map==='sc'&&sheet==='frontier-flora'&&index===4)return true;
    if(sheet==='nature'&&index===5&&(map==='serra'||map==='sc')&&ENV_ART['regional-flora-v1'].naturalWidth)
      return sprite('regional-flora-v1',map==='serra'?4:7,x+w/2,y+h,w,h);
    return world(sheet,index,x,y,w,h);
  };
  paintRegionalMeadow=function(M,v){
    meadow(M,v);if(M.id!=='serra'&&M.id!=='sc')return;
    ctx.save();ctx.fillStyle=M.id==='serra'?'#9ba1b015':'#16493219';ctx.fillRect(v.x,v.y,v.w,v.h);ctx.restore();
  };
}
