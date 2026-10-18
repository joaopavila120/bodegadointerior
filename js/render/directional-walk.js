// Complete drawn poses, shared by playable special characters and visitors.
// Kept outside save data and loaded in the background, with the old art as fallback.
'use strict';
const WALK_ART = {}, walkFrameCache = new Map(), walkTracks = [];
const walkArtLoaded = Promise.all(Object.keys(WALK_ART_CROPS).map(id => new Promise(resolve => {
  const im = new Image(); WALK_ART[id] = im;
  im.onload = im.onerror = resolve; im.src = 'assets/images/walk/' + id + '.png';
})));
function walkCharacterId(sprite) {
  if(sprite===0 || sprite===SADI_BACK || SADI_SIDE.includes(sprite))return 'sadi';
  return PEOPLE.find(p=>p.sprite===sprite && WALK_ART_CROPS[p.id])?.id || null;
}
function walkDirection(dx,dy) { return Math.abs(dx)>Math.abs(dy)?1:dy<0?2:0; }
function walkPoseFrame(id,direction,phase,moving=true) {
  const step=moving?Math.floor(((phase%(Math.PI*2)+Math.PI*2)%(Math.PI*2))/(Math.PI/2)):1;
  return direction*4+step;
}
function walkFrame(id,index,height) {
  const crop=WALK_ART_CROPS[id][index], pixels=Math.min(384,Math.max(64,Math.ceil(height/32)*32)),key=id+':'+index+':'+pixels;
  if(!walkFrameCache.has(key)){
    const c=document.createElement('canvas');c.height=pixels;c.width=Math.ceil(crop[2]*pixels/crop[3]);
    const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
    g.drawImage(WALK_ART[id],...crop.slice(0,4),0,0,c.width,c.height);
    // Bound memory even after many zoom / avatar changes.
    if(walkFrameCache.size>=540)walkFrameCache.delete(walkFrameCache.keys().next().value);
    walkFrameCache.set(key,c);
  }
  return walkFrameCache.get(key);
}
let walkTrackGame=null,walkTrackMap=null;
function visitorWalkDirection(id,x,y,dx,dy) {
  const map=worldOut?.map||'bodega';
  if(walkTrackGame!==G||walkTrackMap!==map){walkTracks.length=0;walkTrackGame=G;walkTrackMap=map;}
  let found=null,nearest=70;
  for(const t of walkTracks){const d=Math.hypot(x-t.x,y-t.y);if(t.id===id&&frameClock-t.time<.4&&t.time!==frameClock&&d<nearest){found=t;nearest=d;}}
  if(found){const mx=x-found.x,my=y-found.y;if(nearest>.1){dx=mx;dy=my;}Object.assign(found,{x,y,time:frameClock});}
  else {if(walkTracks.length>=96)walkTracks.shift();walkTracks.push({id,x,y,time:frameClock});}
  return {dx,dy};
}
function drawDirectionalPerson(sprite,x,y,walking,chef,dx,seated,mood,dy){
  if(typeof drawExpansionPerson==='function'&&drawExpansionPerson(sprite,x,y,walking,chef,dx,seated,mood,dy))return true;
  const id=walkCharacterId(sprite);
  if(!id||seated||!WALK_ART[id]?.naturalWidth)return false;
  const pose=chef?playerWalkPose(x,y):null,moving=chef?pose.stride>.15:walking;
  // Idle is always front-facing; only the visual pose changes, never aiming/input.
  if(!moving){dx=0;dy=1;}
  if(id==='sadi'&&chef&&typeof drawSadiPose==='function'&&drawSadiPose(x,y,dx,dy))return true;
  // Preserve Sadi's already registered eight-pose outdoor profile cycle.
  if(id==='sadi'&&chef&&worldOut&&!worldMap().indoor&&walkDirection(dx,dy)===1&&!playerCarrying())return false;
  // Portraits, seated guests and front-facing idle retain their original artwork.
  if(!moving && (!chef || walkDirection(dx,dy)===0))return false;
  if(!chef)({dx,dy}=visitorWalkDirection(id,x,y,dx,dy));
  const carrying=chef&&playerCarrying(),direction=carrying?(dy<-.25?2:0):walkDirection(dx,dy);
  const phase=chef?pose.sidePhase:frameClock*Math.PI*2*1.5;
  const index=walkPoseFrame(id,direction,phase,moving),crop=WALK_ART_CROPS[id][index];
  const height=chef&&(!worldOut||worldMap().indoor)?130:124,scale=height/crop[3],width=crop[2]*scale;
  const t=ctx.getTransform(),frame=walkFrame(id,index,height*Math.hypot(t.a,t.b));
  const back=direction===2,flip=direction===1&&dx<0;
  if(chef&&back)drawPlayerCarry(x,y,true);
  ellipse(x,y+1,18,7,'#271c1755');ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';
  const left=-crop[4]*scale;
  if(carrying){
    // Keep the existing raised hands / tray torso; use drawn legs underneath it.
    const bodySprite=playerFacingSprite(sprite,dy),s=characterCrop(bodySprite),dw=height*s.w/s.h;
    const body=playerCarryFrame(bodySprite,characterFrame(bodySprite,height*Math.hypot(t.a,t.b)));
    ctx.drawImage(frame,0,frame.height*.72,frame.width,frame.height*.28,left,-height*.28,width,height*.28);
    const reach=playerReachPose();ctx.translate(0,reach.dip);ctx.rotate(reach.lean);
    ctx.drawImage(body,0,0,body.width,body.height*.77,-dw/2,-height,dw,height*.77);
  }else ctx.drawImage(frame,left,-height,width,height);
  ctx.restore();
  if(chef){
    drawPlayerTask(x,y);
    if(G.boost>0&&!['mate','clean','mop'].includes(G.task?.type)){
      bar(x-24,y+10,48,G.boost/mateStats().duration,'#b8e67a');txt(Math.ceil(G.boost)+'s',x,y+27,12,'#e1ffae');
    }
    drawPlayerCarry(x,y,false);drawPlayerTransfers();if(G.cosmetic)txt('★',x,y-106,17,'#ffd36b');
  }
  return true;
}
