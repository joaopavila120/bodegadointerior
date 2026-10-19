// Outside the bodega, use one atlas and one scale for both rest and movement.
// Bodega rendering deliberately stays on its established paths.
'use strict';
const worldCharacterHeights=new Map();
function worldCharacterSpec(sprite,x,y,walking,dx,dy){
  if(!worldOut||sprite===0||sprite===SADI_BACK||SADI_SIDE.includes(sprite))return null;
  const secondary=SECONDARY_POSES.get(sprite),id=walkCharacterId(sprite);
  if(secondary){
    if(!EXPANSION_ART[secondary.key]?.naturalWidth)return null;
    const gait=secondaryGait(secondary.id,x,y,walking,dx,dy);
    const direction=walking?walkDirection(gait.dx,gait.dy):0;
    const step=walking?secondaryStep(secondary.steps,gait.phase,true):0;
    return {kind:'secondary',id:secondary.id,key:secondary.key,index:secondary.start+direction*secondary.steps+step,reference:secondary.height,flip:direction===1&&gait.dx<0,height:124};
  }
  if(!id||id==='sadi'||!WALK_ART[id]?.naturalWidth)return null;
  if(walking)({dx,dy}=visitorWalkDirection(id,x,y,dx,dy));
  const direction=walking?walkDirection(dx,dy):0,index=walking?walkPoseFrame(id,direction,frameClock*Math.PI*3):0;
  if(!worldCharacterHeights.has(id))worldCharacterHeights.set(id,Math.max(...WALK_ART_CROPS[id].map(c=>c[3])));
  return {kind:'special',id,index,reference:worldCharacterHeights.get(id),flip:direction===1&&dx<0,height:124};
}
function drawWorldCharacterPose(sprite,x,y,walking,dx,dy){
  const spec=worldCharacterSpec(sprite,x,y,walking,dx,dy);if(!spec)return false;
  ellipse(x,y+1,18,7,'#271c1755');
  if(spec.kind==='secondary')return expansionSprite(spec.key,spec.index,x,y,spec.height,spec.flip,spec.reference);
  const crop=WALK_ART_CROPS[spec.id][spec.index],scale=spec.height/spec.reference;
  const h=crop[3]*scale,w=crop[2]*scale,t=ctx.getTransform(),frame=walkFrame(spec.id,spec.index,h*Math.hypot(t.a,t.b));
  ctx.save();ctx.translate(x,y);if(spec.flip)ctx.scale(-1,1);ctx.imageSmoothingEnabled=true;
  ctx.drawImage(frame,-crop[4]*scale,-h,w,h);ctx.restore();return true;
}
