// Pampa: original atlases, explicit ground anchors and bounded caches.
'use strict';
const PAMPA_ART = {}, pampaArtLoads = {}, pampaWallCache = new Map(), pampaPatterns = new Map();
const pampaStonePatterns=new Map();
let pampaWallPixels=0;
const PAMPA_FIGURES = {
  zeferino:['pampa-npcs',0,8,329,130], neto:['pampa-npcs',8,8,339,132],
  graxaim:['pampa-fauna',0,8,273,110], boiBarroso:['pampa-fauna',8,8,323,285],
  batedor:['pampa-tropas',0,8,245,130], carabineiro:['pampa-tropas',8,8,248,134],
  oficialAdaga:['oficial-adaga',0,8,404,134],
  imperial:['pampa-tropas',16,8,222,134], soldado:['pampa-tropas',16,8,222,134], sargento:['pampa-chefes',0,8,153,148],
  capitao:['pampa-chefes',8,8,158,140], moringue:['pampa-chefes',16,8,167,150],
  'lanceiro-cavalo':['pampa-cavalaria',0,4,265,204],
  'capitao-cavalo':['pampa-cavalaria',4,4,282,212],
  'moringue-cavalo':['pampa-cavalaria',8,4,319,222]
};
function pampaImage(id) {
  const sheet=PAMPA_ART_CROPS[id];
  if(!sheet&&id!=='pampa-terrain')return null;
  if(!PAMPA_ART[id]){
    const im=PAMPA_ART[id]=new Image();
    if(sheet){ACTION_ART['pampa:'+id]=im;ACTION_ART_CROPS['pampa:'+id]=sheet;}
    pampaArtLoads[id]=new Promise(resolve=>{
      im.onload=()=>{if(id==='pampa-terrain')ilhaTiles.clear();if(id==='pampa-stone'){pampaWallCache.clear();pampaWallPixels=0;pampaStonePatterns.clear();}resolve(true);};
      im.onerror=()=>resolve(false);im.src=sheet?.file||'assets/images/pampa/pampa-terrain-v1.png';
    });
  }
  return PAMPA_ART[id];
}
function loadPampaArt(ids=[...Object.keys(PAMPA_ART_CROPS),'pampa-terrain']) {
  return Promise.all(ids.map(id=>(pampaImage(id),pampaArtLoads[id]))).then(r=>r.every(Boolean));
}
function pampaFigureSprite(id,frame,x,y,height,flip=false){
  const spec=PAMPA_FIGURES[id];if(!spec||!pampaImage(spec[0])?.naturalWidth)return false;
  const key='pampa:figure:'+id;
  if(!ACTION_ART_CROPS[key]){
    const sheet=PAMPA_ART_CROPS[spec[0]],clips={};
    for(let i=0;i<spec[2];i++)if(sheet.clips?.[i+spec[1]])clips[i]=sheet.clips[i+spec[1]];
    ACTION_ART[key]=PAMPA_ART[spec[0]];ACTION_ART_CROPS[key]={...sheet,reference:spec[3],frames:sheet.frames.slice(spec[1],spec[1]+spec[2]),clips};
  }
  return actionSprite(key,frame,x,y,height??spec[4],flip);
}
function pampaObject(id,index,x,y,width,flip=false){
  if(!pampaImage(id)?.naturalWidth)return false;
  const sheet=PAMPA_ART_CROPS[id],r=sheet.frames[index];
  return actionSprite('pampa:'+id,index,x,y,width*sheet.reference/r[2],flip);
}
function pampaPortraitArt(id,size=104){
  const spec=PAMPA_FIGURES[id];if(!spec||!pampaImage(spec[0])?.naturalWidth)return '';
  const sheet=PAMPA_ART_CROPS[spec[0]],r=sheet.frames[spec[1]],h=spec[3]*.43;
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;overflow:hidden;background:#56533e"><svg width="${size}" height="${size}" viewBox="${r[0]+r[4]-h/2} ${r[1]} ${h} ${h}"><image href="${sheet.file}" width="${sheet.size[0]}" height="${sheet.size[1]}"/></svg></span>`;
}
function pampaBeastPose(b){
  const pulse=creaturePulses.get(b);if(pulse?.until>frameClock)return pulse.frame;
  const s=b.state,k=b.kind;
  if(b.stun>0)return 7;
  if(k==='graxaim')return s==='windup'?4:s==='lunge'?(b.t>.14?5:6):s==='foge'?3:creatureWalking(b)?1+Math.floor(b.frame||frameClock*7)%3:0;
  if(k==='boiBarroso')return s==='mira'?4:s==='investe'?5:s==='bate'?6:['freia','cansado'].includes(s)?7:0;
  if(k==='batedor')return s==='oculto'?4:s==='mira'?5:creatureWalking(b)?1+Math.floor(b.frame||frameClock*7)%3:0;
  if(k==='carabineiro')return b.flash>0?5:b.shot?6:s==='aim'?4:s==='recarrega'?7:creatureWalking(b)?1+Math.floor(b.frame||frameClock*7)%3:0;
  if(s==='guarda')return 7;
  if(s==='arremesso')return 4;
  if(s==='varre')return 6;
  if(s==='windup')return 4;
  if(s==='lunge')return 5;
  if(s==='follow')return 6;
  if(s==='recuo')return 7;
  if(s==='rest')return 7;
  return creatureWalking(b)?1+Math.floor(b.frame||frameClock*7)%3:0;
}
function pampaBeastArt(b){
  let id=b.kind==='lanceiroMontado'?'imperial':b.kind,pose=pampaBeastPose(b);
  if(b.montado){id=(b.kind==='lanceiroMontado'?'lanceiro':b.kind)+'-cavalo';pose=b.state==='carga'?3:b.state==='mira'?0:creatureWalking(b)?1+Math.floor(b.frame||frameClock*7)%2:0;}
  const spec=PAMPA_FIGURES[id];if(!spec||!pampaImage(spec[0])?.naturalWidth)return false;
  const hidden=b.kind==='batedor'&&b.state==='oculto';
  const flip=(b.montado?b.mx??b.dx:b.dx)<0;
  ctx.save();if(hidden)ctx.globalAlpha*=typeof pampaOcultoAlpha==='function'?pampaOcultoAlpha():.18;if(b.hurt>0)ctx.globalAlpha*=.62;
  ellipse(b.x,b.y+2,b.montado?54:b.kind==='boiBarroso'?80:b.kind==='graxaim'?28:21,b.montado?12:7,'#1b211744');
  pampaFigureSprite(id,pose,b.x,b.y,spec[4],flip);ctx.restore();
  if(b.kind==='moringue'&&b.state==='guarda'){ctx.save();ctx.globalCompositeOperation='lighter';glow(b.x+(flip?-26:26),b.y-75,35,.25,'220,235,255');ctx.restore();}
  if(b.kind==='carabineiro'&&b.flash>0){const gun=carabineiroCano(b);ctx.save();ctx.globalCompositeOperation='lighter';glow(gun.x,gun.y,32,.45,'255,220,140');ctx.restore();}
  if(b.stun>0)for(let k=0;k<3;k++){const a=frameClock*5+k*2.1;txt('✦',b.x+Math.cos(a)*17,b.y-(b.montado?210:spec[4])-8+Math.sin(a)*4,12,'#ffe9ac');}
  if(!b.boss&&!hidden)mataHpBar(b,CAVE_BEASTS[b.kind].name,b.montado?240:b.kind==='graxaim'?85:spec[4]+18);
  return true;
}
{
  for(const kind of ['graxaim','batedor','carabineiro','oficialAdaga','boiBarroso','lanceiroMontado','sargento','capitao','moringue']){
    const mob=ILHA_MOBS[kind],draw=mob.draw,tick=mob.tick;
    mob.draw=b=>pampaBeastArt(b)||draw(b);
    mob.tick=function(b,dt,p,N){const state=b.state;tick(b,dt,p,N);
      if(b.state!==state&&['mira','arremesso','varre'].includes(state)&&['batedor','sargento'].includes(b.kind))creaturePulses.set(b,{until:frameClock+.22,frame:state==='varre'?6:kind==='batedor'?6:5});
    };
  }
  const figure=pampaFigura,portrait=pampaRetrato,zeferino=drawZeferino,zPortrait=zeferinoPortrait,moringue=moringueFigura;
  pampaFigura=function(id,x,y,dx=1,s=1,alpha=1,frame=0){
    const spec=PAMPA_FIGURES[id];if(!spec||!pampaImage(spec[0])?.naturalWidth)return figure(id,x,y,dx,s,alpha,frame);
    const walking=id==='neto'&&(scene?.actors?.neto?.walk||frame>0);
    const pose=walking?4+Math.floor(frame||frameClock*7)%4:Math.floor(frame)%4;
    ellipse(x,y+2,21*s,6*s,'#17232244');ctx.save();ctx.globalAlpha*=alpha;pampaFigureSprite(id,pose,x,y,spec[4]*s,dx<0&&(id!=='neto'||pose>=4));ctx.restore();
  };
  drawZeferino=function(x,y,dx=1){if(!pampaImage('pampa-npcs')?.naturalWidth)return zeferino(x,y,dx);ellipse(x,y+2,19,6,'#17232244');pampaFigureSprite('zeferino',0,x,y,130);};
  moringueFigura=function(x,y,dx=-1,alpha=1){if(!pampaImage('pampa-chefes')?.naturalWidth)return moringue(x,y,dx,alpha);ctx.save();ctx.globalAlpha*=alpha;pampaFigureSprite('moringue',0,x,y,150,dx<0);ctx.restore();};
  pampaRetrato=function(id,size=104){return pampaPortraitArt(id,size)||portrait(id,size);};
  zeferinoPortrait=function(size=72){return pampaPortraitArt('zeferino',size)||zPortrait(size);};
}

// The equipped spear stays in Sadi's hands on foot, including the peaceful entrance.
function pampaSadiReady(){return !!(worldOut&&armaLanca()&&!playerMounted()&&!playerCarrying()&&!scene&&(avatarSprite()===0||walkCharacterId(avatarSprite())==='sadi')&&pampaImage('sadi-lanca-walk')?.naturalWidth);}
function pampaSadiPose(walking,dx=0,dy=1){
  if(!pampaSadiReady()||G.lasso||sadiRangedPose())return null;
  const run=inCave()?caveFloorRun():mataNight;
  if(run?.faint||(inCave()&&caveDefeatActive()))return null;
  const s=run?.swing,attack=s&&armaLanca(s.artWeapon??caveWeapon().id)&&!(run.hurt>0)&&!worldDash&&!run.dash;
  let id='sadi-lanca-walk',index=walkDirection(dx,dy)*4,flip=walkDirection(dx,dy)===1&&dx<0,ox=0,oy=0;
  if(attack&&pampaImage('sadi-lanca-attack')?.naturalWidth){
    const k=golpeK(s),n=s.n||1,angle=n===4&&k<.62?s.ang+k/.62*Math.PI*2:s.ang;
    const stages=n===1?[0,1,1,0]:n===2?[0,2,1,0]:n===3?[0,2,2,0]:[0,2,2,3,3];
    const stage=stages[Math.min(stages.length-1,Math.floor(k*stages.length))],pose=sadiGolpeQuadro(angle,stage);
    id='sadi-lanca-attack';index=pose.index;flip=pose.flip;
    const lean=Math.sin(k*Math.PI)*(n===4?5:8);ox=Math.cos(s.ang)*lean;oy=Math.sin(s.ang)*lean;
  }else if(walking||worldDash||run?.dash){
    const direction=walkDirection(dx,dy),phase=playerWalkPose(worldOut.x,worldOut.y).sidePhase;
    index=direction*4+[1,2,3,0][Math.floor((phase%(Math.PI*2)+Math.PI*2)%(Math.PI*2)/(Math.PI/2))];flip=direction===1&&dx<0;
  }
  return{id:'pampa:'+id,index,flip,ox,oy,height:(worldMap().indoor?130:124)*sadiScale(),hurt:run?.hurt>0,dash:!!(worldDash||run?.dash),n:attack?s.n:0};
}

// Terrain is painted only into the existing 32-tile cache. Walls have a small
// separate LRU; neither cache grows as the player explores the ten stretches.
function pampaGroundPattern(index){
  if(!pampaImage('pampa-terrain')?.naturalWidth)return null;
  if(!pampaPatterns.has(index)){
    const im=PAMPA_ART['pampa-terrain'],w=im.naturalWidth/2,h=im.naturalHeight/2,c=document.createElement('canvas');c.width=c.height=384;
    const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,(index%2)*w,Math.floor(index/2)*h,w,h,0,0,384,384);
    pampaPatterns.set(index,ctx.createPattern(c,'repeat'));
  }
  return pampaPatterns.get(index);
}
function pampaWallTile(p){
  if(pampaWallCache.has(p)){const t=pampaWallCache.get(p);pampaWallCache.delete(p);pampaWallCache.set(p,t);return t;}
  let segments=p.wallSegments;
  if(!segments){
    // The short straight wall outside the Serra entrance predates the contour.
    const a=(p.pontos||[]).slice().sort((u,v)=>u[0]-v[0]);segments=[];
    for(let i=1;i<a.length;i++)segments.push([a[i-1],a[i]]);
    if(a.length){segments.unshift([[a[0][0]-12,a[0][1]],a[0]]);segments.push([a[a.length-1],[a[a.length-1][0]+12,a[a.length-1][1]]]);}
  }
  if(!segments.length)return null;
  const points=segments.flat(),x=Math.floor(Math.min(...points.map(q=>q[0]))-14),y=Math.floor(Math.min(...points.map(q=>q[1]))-46);
  const c=document.createElement('canvas');c.width=Math.ceil(Math.max(...points.map(q=>q[0]))-x+15);c.height=Math.ceil(Math.max(...points.map(q=>q[1]))-y+16);
  const g=c.getContext('2d');g.translate(-x,-y);g.lineCap='round';g.lineJoin='round';
  const ground=new Path2D(),cap=new Path2D(),face=new Path2D(),height=32,half=9;
  for(const [a,b]of segments){
    ground.moveTo(...a);ground.lineTo(...b);cap.moveTo(a[0],a[1]-height);cap.lineTo(b[0],b[1]-height);
    // Extrude the actual contour footprint. Adjacent pieces share one texture
    // origin, so bends keep continuous courses rather than stacked sprite towers.
    const len=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/len*half,ny=(b[0]-a[0])/len*half;
    const q=[];for(const v of [a,b])for(const sign of [-1,1])for(const h of [0,height])q.push([v[0]+sign*nx,v[1]+sign*ny-h]);
    const hull=pampaWallHull(q);face.moveTo(...hull[0]);for(const v of hull.slice(1))face.lineTo(...v);face.closePath();
  }
  g.strokeStyle='#17221935';g.lineWidth=25;g.stroke(ground);
  g.fillStyle=pampaWallPattern(0)||'#776b56';g.fill(face);
  g.strokeStyle='#3d3b2a';g.lineWidth=20;g.stroke(cap);
  g.strokeStyle=pampaWallPattern(1)||'#9c9176';g.lineWidth=16;g.stroke(cap);
  const tile={canvas:c,x,y};pampaWallCache.set(p,tile);
  pampaWallPixels+=c.width*c.height;
  while(pampaWallCache.size>256||pampaWallPixels>4*1024*1024){const key=pampaWallCache.keys().next().value,old=pampaWallCache.get(key);pampaWallCache.delete(key);pampaWallPixels-=old.canvas.width*old.canvas.height;old.canvas.width=old.canvas.height=0;}
  return tile;
}
function pampaWallHull(points){
  const q=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),a=[],b=[];
  for(const p of q){while(a.length>1&&cross(a[a.length-2],a[a.length-1],p)<=0)a.pop();a.push(p);}
  for(const p of q.slice().reverse()){while(b.length>1&&cross(b[b.length-2],b[b.length-1],p)<=0)b.pop();b.push(p);}
  return a.slice(0,-1).concat(b.slice(0,-1));
}
function pampaWallPattern(index){
  if(!pampaImage('pampa-stone')?.naturalWidth)return null;
  if(!pampaStonePatterns.has(index)){
    const im=PAMPA_ART['pampa-stone'],r=PAMPA_ART_CROPS['pampa-stone'].frames[index],c=document.createElement('canvas');
    c.width=128;c.height=index?48:36;const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,...r.slice(0,4),0,0,c.width,c.height);
    pampaStonePatterns.set(index,ctx.createPattern(c,'repeat'));
  }
  return pampaStonePatterns.get(index);
}
function pampaTreeSize(u){return 252+(u.w-250)*.45;}
function pampaNestSites(L){
  if(L.nestSites)return L.nestSites;
  const sites=[];
  for(let i=12;i<L.pedacos.length;i+=11){
    const p=L.pedacos[i],a=p.wallSegments?.[0]?.[0];if(!a||a[1]<240||a[1]>L.H-200)continue;
    // Put the post just in front of the taipa; its nest is 70 px above the cap.
    const x=a[0],y=a[1]+15;
    if(sites.some(q=>Math.hypot(q.x-x,q.y-y)<620)||L.umbus.some(u=>Math.abs(u.x-x)<180&&u.y>y-30&&u.y<y+320))continue;
    if(L.rects.some(r=>x>r.x-60&&x<r.x+r.w+60&&y>r.y-80&&y<r.y+r.h+100))continue;
    sites.push({x,y});if(sites.length>=5)break;
  }
  return L.nestSites=sites;
}
function pampaBuildingSprite(F){
  if(!pampaImage('pampa-props')?.naturalWidth)return false;
  pampaObject('pampa-props',10,F.x+F.w/2,F.y+F.h,F.w);
  ctx.save();ctx.globalCompositeOperation='lighter';glow(F.x+F.w*.73,F.y+F.h*.70,49,.14+.03*Math.sin(frameClock*8),'255,145,55');ctx.restore();return true;
}
function pampaStoneSprite(o){return pampaObject('pampa-flora',3,o.x,o.y,o.w);}
{
  const ground=paintPampaGround;
  paintPampaGround=function(L,view){
    const grass=pampaGroundPattern(PAMPA_AREAS[L.n].chao==='banhado'?2:0);if(!grass)return ground(L,view);
    const {x,y,w,h}=view,A=PAMPA_AREAS[L.n],dirt=pampaGroundPattern(A.chao==='cerro'?3:1);
    ctx.save();ctx.fillStyle=grass;ctx.fillRect(x,y,w,h);
    pampaManchas(view,A.chao==='banhado'?'36,61,43':'147,139,89',420,L.n*31,.14);
    for(const c of L.coxilhas){
      if(c.x+c.rx<x||c.x-c.rx>x+w||c.y+c.ry<y||c.y-c.ry>y+h)continue;
      ctx.save();ctx.translate(c.x,c.y);ctx.scale(1,c.ry/c.rx);const light=ctx.createRadialGradient(0,-30,0,0,0,c.rx);light.addColorStop(0,'#dfd49828');light.addColorStop(1,'#dfd49800');ctx.fillStyle=light;ctx.fillRect(-c.rx,-c.rx,2*c.rx,2*c.rx);ctx.restore();
    }
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=dirt;
    for(const [path,width]of [[L.path,156],[L.pathRamais,76]]){
      for(const [extra,opacity]of [[40,.08],[28,.12],[16,.22],[6,.48],[0,1]]){ctx.globalAlpha=opacity;ctx.lineWidth=width+extra;ctx.stroke(path);}
    }
    ctx.globalAlpha=1;
    if(L.palco){const q=L.palco;ctx.save();ctx.globalAlpha=.25;ctx.fillStyle=dirt;ctx.beginPath();ctx.ellipse(q.x,q.y,q.rx*.83,q.ry*.78,0,0,Math.PI*2);ctx.fill();ctx.restore();}
    for(const q of L.pools){
      if(q.x+q.rx+35<x||q.x-q.rx-35>x+w||q.y+q.ry+30<y||q.y-q.ry-30>y+h)continue;
      ellipse(q.x,q.y,q.rx+22,q.ry+15,'#3c4c3844');ctx.save();ctx.beginPath();ctx.ellipse(q.x,q.y,q.rx,q.ry,0,0,Math.PI*2);ctx.clip();
      if(!mataTexture(5,x,y,w,h))rect(x,y,w,h,'#34545a');rect(x,y,w,h,'#46533855');ctx.restore();
    }
    ctx.restore();
  };
  const wall=pampaPedaco,post=pampaMoirao,grass=pampaCapim,tree=pampaUmbu,skull=drawPampaCaveira,lance=drawPampaLanca,cart=drawPampaCarreta,ruin=drawPampaTapera,hill=drawPampaCerro,herb=drawPampaErva,bundle=drawPampaFeixe,gate=drawPampaCancela;
  pampaPedaco=function(p){if(!pampaImage('pampa-stone')?.naturalWidth)return wall(p);const t=pampaWallTile(p);if(t)ctx.drawImage(t.canvas,t.x,t.y);};
  pampaMoirao=function(x,y){if(!pampaObject('pampa-campo',3,x,y,18))return post(x,y);};
  pampaCapim=function(c){
    if(!pampaImage('pampa-props')?.naturalWidth)return grass(c);
    const index=c.i===2?5:c.i===4?7:4,width=c.i===2?c.w*.68:c.w*.58;
    pampaSway(c.x,c.y,Math.sin(frameClock*1.5+c.x*.02)*.022,()=>pampaObject('pampa-props',index,c.x,c.y,width));
  };
  pampaUmbu=function(u){const index=Math.floor(u.x)%3===0?1:0,r=PAMPA_ART_CROPS['pampa-campo']?.frames[index];if(!r||!pampaObject('pampa-campo',index,u.x,u.y,pampaTreeSize(u)*r[2]/r[3]))return tree(u);};
  drawPampaCaveira=function(c){if(!pampaObject('pampa-props',12,c.x,c.y,43,c.f<0))return skull(c);};
  drawPampaLanca=function(l){if(!pampaObject('pampa-props',13,l.x,l.y,58))return lance(l);};
  drawPampaCarreta=function(c){if(!pampaObject('pampa-props',8,c.x,c.y,310,c.f<0))return cart(c);};
  drawPampaTapera=function(r){if(!pampaObject('pampa-props',9,r.x+r.w/2,r.y+r.h,r.w))return ruin(r);};
  drawPampaCerro=function(c){if(!pampaObject('pampa-flora',6,c.x,c.y+30,c.w*1.2))return hill(c);};
  drawPampaErva=function(a){if(!pampaObject('pampa-flora',7,a.x,a.y,46))return herb(a);};
  drawPampaFeixe=function(x,y){if(!pampaObject('pampa-props',14,x,y,180))return bundle(x,y);};
  drawPampaCancela=function(L){
    if(!pampaImage('pampa-props')?.naturalWidth)return gate(L);
    const c=L.cancela;
    if(!pampaSaidaAberta(L.n))pampaObject('pampa-props',15,c.x,c.y,2*(PAMPA.meia+18));
    else{ctx.save();ctx.translate(c.x+PAMPA.meia+16,c.y);ctx.scale(.25,1);pampaObject('pampa-props',15,0,0,128);ctx.restore();}
  };
  const icon=pampaLancaIcone,projectile=pampaLancaDesenho;
  pampaLancaIcone=function(size=64){
    if(!pampaImage('pampa-props')?.naturalWidth)return icon(size);
    const s=PAMPA_ART_CROPS['pampa-props'],r=s.frames[13];return `<span class="mata-item-art" style="display:inline-flex;width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="${r.slice(0,4).join(' ')}"><image href="${s.file}" width="${s.size[0]}" height="${s.size[1]}"/></svg></span>`;
  };
  pampaLancaDesenho=function(x,y,ang,comp=200,alpha=1){
    if(!pampaImage('pampa-props')?.naturalWidth)return projectile(x,y,ang,comp,alpha);
    const key='pampa:projectile';
    if(!ACTION_ART_CROPS[key]){const sheet=PAMPA_ART_CROPS['pampa-props'],r=[...sheet.frames[13]];r[4]=14;ACTION_ART[key]=PAMPA_ART['pampa-props'];ACTION_ART_CROPS[key]={...sheet,reference:r[3],frames:[r],clips:{}};}
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x-Math.cos(ang)*40,y-Math.sin(ang)*40);ctx.rotate(ang+Math.PI/2);actionSprite(key,0,0,0,comp+76);ctx.restore();
  };
  const M=WORLD_MAPS.pampa,enter=M.onEnter,draw=M.draw;
  M.onEnter=function(){loadPampaArt();return enter?.call(this);};
  M.draw=function(view,seen,layers){
    if(!PAMPA_ART['pampa-props'])loadPampaArt();draw.call(this,view,seen,layers);
    // Nests belong above their own posts, with the same ground-depth sorting as people.
    const L=pampaLayout();for(const p of pampaNestSites(L)){
      if(!seen(p.x,p.y,120))continue;
      layers.push({y:p.y+8,draw:()=>pampaObject('pampa-campo',2,p.x,p.y,32)});
    }
  };
}
{
  const person=drawExpansionPerson;
  drawExpansionPerson=function(sprite,x,y,walking,chef,dx,seated,mood,dy){
    if(chef&&!seated&&(sprite===0||walkCharacterId(sprite)==='sadi')&&worldOut&&armaLanca()){
      pampaImage('sadi-lanca-walk');pampaImage('sadi-lanca-attack');
      const pose=pampaSadiPose(walking,dx,dy);
      if(pose){ellipse(x,y+1,19,6,'#271c1755');ctx.save();if(pose.hurt)ctx.globalAlpha*=.62;
        if(pose.dash)for(const d of [18,34]){ctx.save();ctx.globalAlpha*=.18;actionSprite(pose.id,pose.index,x-(dx||0)*d,y-(dy||0)*d,pose.height,pose.flip);ctx.restore();}
        const ok=actionSprite(pose.id,pose.index,x+pose.ox,y+pose.oy,pose.height,pose.flip);ctx.restore();if(ok)return true;
      }
    }
    return person(sprite,x,y,walking,chef,dx,seated,mood,dy);
  };
  const trail=drawGolpeRastro;
  drawGolpeRastro=function(s,p){
    if(!armaLanca(s.artWeapon??caveWeapon().id))return trail(s,p);
    const k=golpeK(s),n=s.n||1,reach=s.impactReach||caveReach(),alpha=Math.sin(k*Math.PI);
    ctx.save();ctx.lineCap='round';ctx.strokeStyle=`rgba(255,235,175,${alpha*.76})`;ctx.lineWidth=n===4?7:4;
    if(n===4){
      // A broad sweep, then a low shock ring; it follows the actual circular hit radius.
      const radius=reach*(.34+.66*Math.min(1,k*2));ctx.beginPath();ctx.ellipse(s.impactX??p.x,s.impactY??p.y,radius,radius*.76,0,s.ang+k*6.28-2.7,s.ang+k*6.28);ctx.stroke();
      ctx.strokeStyle=`rgba(220,191,130,${(1-k)*.46})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,reach*Math.min(1,.45+k),reach*.76*Math.min(1,.45+k),0,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<12;i++){const a=i*Math.PI/6+k*.12,r=radius*(.8+.2*(i%3)/2);ctx.fillStyle=`rgba(247,214,146,${alpha*.7})`;ctx.fillRect(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.76,3,3);}
    }else if(n===1){ctx.beginPath();ctx.moveTo(p.x+Math.cos(s.ang)*24,p.y-57+Math.sin(s.ang)*24);ctx.lineTo(p.x+Math.cos(s.ang)*reach*.86,p.y-57+Math.sin(s.ang)*reach*.65);ctx.stroke();}
    else {ctx.beginPath();ctx.ellipse(p.x,p.y-45,reach*.72,reach*.48,0,s.ang-1.4+k,s.ang+.2+k);ctx.stroke();}
    ctx.restore();
    if(!pampaSadiReady())pampaLancaDesenho(p.x,p.y-62,s.ang,110+Math.sin(k*Math.PI)*50);
  };
}
