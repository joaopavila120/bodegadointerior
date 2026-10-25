// Visual finish only. Stations, collisions and purchased decorations keep their data.
'use strict';
const BODEGA_ART={},bodegaFurnitureFrames=new Map();
let bodegaRoomFrame=null;
const bodegaArtReady=Promise.all(['room-v1','furniture-v1'].map(id=>new Promise(resolve=>{
  const im=BODEGA_ART[id]=new Image();
  im.onload=()=>resolve(true);im.onerror=()=>resolve(false);
  im.src='assets/images/bodega/'+id+'.png';
}))).then(results=>results.every(Boolean));

// Tight atlas crops, in the same order as the original six furniture types,
// followed by the dining chair and the ingredient cabinet.
const BODEGA_FURNITURE_CROPS=[
  [83,125,309,358],[483,80,307,403],[882,69,235,413],[1258,43,198,457],
  [46,607,388,313],[489,606,393,315],[978,624,178,299],[1262,630,229,294]
];

function drawBodegaRoom(){
  const im=BODEGA_ART['room-v1'];
  if(!im?.naturalWidth)return false;
  if(!bodegaRoomFrame){
    bodegaRoomFrame=document.createElement('canvas');
    bodegaRoomFrame.width=W;bodegaRoomFrame.height=H;
    const g=bodegaRoomFrame.getContext('2d');
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(im,0,0,W,H);
  }
  ctx.drawImage(bodegaRoomFrame,0,0,W,H);return true;
}

function bodegaFurniture(index,x,y,w,h){
  const im=BODEGA_ART['furniture-v1'],crop=BODEGA_FURNITURE_CROPS[index];
  if(worldOut||isCampo()||!im?.naturalWidth||!crop)return false;
  const key=index+':'+w+':'+h;
  let tile=bodegaFurnitureFrames.get(key);
  if(!tile){
    tile=document.createElement('canvas');
    // Fixed 2x frames keep edges crisp without reprocessing the large atlas per frame.
    tile.width=Math.ceil(w*2);tile.height=Math.ceil(h*2);
    const g=tile.getContext('2d');g.imageSmoothingQuality='high';
    g.drawImage(im,...crop,0,0,tile.width,tile.height);
    if(bodegaFurnitureFrames.size>=64)bodegaFurnitureFrames.clear();
    bodegaFurnitureFrames.set(key,tile);
  }
  ctx.save();ctx.imageSmoothingEnabled=true;
  ctx.drawImage(tile,x,y,w,h);ctx.restore();return true;
}

{
  const originalArt=artFurniture,originalChair=chair,originalCounter=counter;
  artFurniture=function(index,x,y,w,h){
    return bodegaFurniture(index,x,y,w,h)||originalArt(index,x,y,w,h);
  };
  chair=function(x,y,back=false){
    if(!back&&bodegaFurniture(6,x-23,y-39,46,68))return;
    originalChair(x,y,back);
  };
  counter=function(f,type='steel'){
    if(f.id.startsWith('bin:')&&bodegaFurniture(7,f.x-3,f.y-4,f.w+6,f.h+22))return;
    originalCounter(f,type);
  };
}
