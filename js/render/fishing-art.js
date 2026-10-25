// The river and pier are static; water highlights and gameplay stay on top.
'use strict';
const fishingBackdrop=new Image(),fishingBackgroundFrames=new Map();
const fishingArtReady=new Promise(resolve=>{
  fishingBackdrop.onload=()=>resolve(true);fishingBackdrop.onerror=()=>resolve(false);
  fishingBackdrop.src='assets/images/fishing/uruguai-v1.png';
});
function drawFishingBackdrop(g,night){
  if(!fishingBackdrop.naturalWidth)return false;
  const key=!!night;
  if(!fishingBackgroundFrames.has(key)){
    const tile=document.createElement('canvas');tile.width=FW*2;tile.height=FH*2;
    const c=tile.getContext('2d');c.imageSmoothingQuality='high';
    c.drawImage(fishingBackdrop,0,0,tile.width,tile.height);
    if(night){
      c.fillStyle='#101c4399';c.fillRect(0,0,tile.width,tile.height);
      c.fillStyle='#ece7c7';c.beginPath();c.arc(1280,98,15,0,Math.PI*2);c.fill();
      for(let i=0;i<25;i++)c.fillRect(60+i*53,18+(i*37)%155,2,2);
    }
    fishingBackgroundFrames.set(key,tile);
  }
  g.drawImage(fishingBackgroundFrames.get(key),0,0,FW,FH);
  g.save();g.strokeStyle=night?'#c9d5ed12':'#f1ecd81e';g.lineWidth=.8;
  const t=fishing?.clock||0;
  for(let i=0;i<12;i++){
    const x=260+(i*113+t*(3+i%3))%470,y=195+i*18;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+18+i%4*7,y);g.stroke();
  }
  g.restore();return true;
}
