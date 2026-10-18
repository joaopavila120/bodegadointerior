// Carregamento de imagens, desenho de móveis, personagens, ícones PNG e comida
'use strict';

const roomArt = new Image(), peopleArt = new Image();
const SADI_BACK = characterSprite('sadi-back', [200,69,627,1399], [[0,0],[627,0],[627,1399],[0,1399]]);
// Register poses by the head/hip axis, not by the changing bounds of the boots.
// Eight walk poses followed by an idle pose with both feet on the ground.
const SADI_SIDE = [[208,13,332],[626,13,330],[1041,13,330],[207,354,322],[629,355,321],[1041,354,322],[210,686,327],[627,686,326],[1041,686,330]]
  .map(([x,y,h])=>characterSprite('sadi-side-walk-v3',[x,y,280,h],[[0,0],[280,0],[280,h],[0,h]]));
function playerSideSprite(sprite,dx,dy,pose){
  if(sprite!==0||!worldOut||worldMap().indoor||Math.abs(dx)<=Math.abs(dy)||!CHARACTER_ART['sadi-side-walk-v3'].naturalWidth||playerCarrying())return null;
  const phase=(((pose.sidePhase||0)%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  return SADI_SIDE[pose.stride>.15?Math.floor(phase/(Math.PI/4)):8];
}
function personHeight(sprite,chef){
  if(chef&&worldOut&&!worldMap().indoor){
    // Same visible stature as the adults nearby. The original front crop has
    // 17 transparent rows; the back and side crops are already tightly fitted.
    if(sprite===0)return 124*483/466;
    if(sprite===SADI_BACK||SADI_SIDE.includes(sprite))return 124;
  }
  return chef?130:124;
}
function playerFacingSprite(sprite, dy) {
  return sprite === 0 && dy < -.25 && CHARACTER_ART['sadi-back'].naturalWidth ? SADI_BACK : sprite;
}
roomArt.src = ROOM_DATA;
peopleArt.src = PEOPLE_DATA;

const furnitureArt = new Image();
furnitureArt.src = FURNITURE_DATA;


function rect(x,y,w,h,c,r=0,stroke=null){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=c;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}

function ellipse(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}

function txt(s,x,y,size=15,color='#fff0c3',align='center',font='Arial',outline=true){ctx.font=`bold ${size}px ${font}`;ctx.textAlign=align;ctx.textBaseline='middle';if(outline){ctx.lineJoin='round';ctx.strokeStyle='#291c12';ctx.lineWidth=3;ctx.strokeText(s,x,y);}ctx.fillStyle=color;ctx.fillText(s,x,y);}

function wood(x,y,w,h,dark=false){rect(x,y,w,h,dark?'#613b20':'#9d6736',3,'#392718');for(let j=0;j<h;j+=14){rect(x+2,y+j,w-4,1,'#4e2f1955');for(let i=0;i<3;i++)rect(x+8+(i*31+j*7)%Math.max(20,w-30),y+j+4,15,1,'#e3aa5c55');}rect(x+3,y+2,w-6,3,'#dfaa65');}

function counter(f,type='steel'){const{x,y,w,h}=f;if(!f.id.startsWith('bin:')&&artFurniture(type==='wood'?4:0,x-3,y-9,w+6,h+ 30))return;const pad=Math.ceil(w*.1)+6;cachedShape('counter:'+type+':'+w+'x'+h,x-pad,y-4,w+pad*2,h+26,()=>paintCounter(pad,4,w,h,type));}
function paintCounter(x,y,w,h,type){ellipse(x+w/2+4,y+h+8,w*.58,11,'#23180e55');wood(x+5,y+h-17,w-10,29,true);rect(x+10,y+h+5,8,12,'#4e311f');rect(x+w-18,y+h+5,8,12,'#4e311f');if(type==='wood')wood(x,y,w,h-12);else{const grad=ctx.createLinearGradient(x,y,x+w,y+h);grad.addColorStop(0,'#e4dfc4');grad.addColorStop(.2,'#bdbdad');grad.addColorStop(.5,'#ebe5ce');grad.addColorStop(1,'#999c90');rect(x,y,w,h-12,grad,4,'#55584d');rect(x+4,y+4,w-8,3,'#faf0d3');rect(x+4,y+h-16,w-8,5,'#6e786d');for(let j=12;j<h-17;j+=19)rect(x+10,y+j,w-20,1,'#626c6122');}for(const xx of[x+7,x+w-7])ellipse(xx,y+8,2,2,'#574f3b');}

function bar(x,y,w,value,color='#9cc967'){rect(x,y,w,8,'#322a1e',3,'#d2b982');rect(x+2,y+2,(w-4)*clamp(value,0,1),4,color,2);}

// Formas estáticas desenhadas uma vez num canvas próprio (por escala de tela) e depois só copiadas.
const shapeCache=new Map();
function cachedShape(id,x,y,w,h,paint){
 const t=ctx.getTransform(),k=Math.min(6,Math.ceil(Math.hypot(t.a,t.b)*2)/2),key=id+'@'+k;let image=shapeCache.get(key);
 if(!image){image=document.createElement('canvas');image.width=Math.ceil(w*k);image.height=Math.ceil(h*k);const own=image.getContext('2d'),main=ctx;own.scale(k,k);ctx=own;try{paint();}finally{ctx=main;}shapeCache.set(key,image);}
 ctx.drawImage(image,x,y,w,h);
}

function chair(x,y,back=false){cachedShape('chair'+back,x-21,y-42,42,72,()=>{const x=21,y=42;wood(x-18,y-17,36,30,true);wood(x-19,y-(back?40:7),38,13);rect(x-16,y+13,6,14,'#4c321e');rect(x+10,y+13,6,14,'#4c321e');});}

function drawDining(f,cards){cards=cards||isTableTruco(G.tables[Number(f.id.split(':')[1])]);const{x,y,w,h}=f,t=cards?null:G.tables[Number(f.id.split(':')[1])];ellipse(x+w/2+3,y+h+16,w*.62,18,'#28180855');if(!furnitureArt.complete||!furnitureArt.naturalWidth){rect(x+13,y+h-6,11,36,'#56371e');rect(x+w-24,y+h-6,11,36,'#56371e');wood(x,y+8,w,h-12,true);wood(x-3,y,w+6,h-17);}artFurniture(cards?5:4,x-7,y-10,w+14,h+43);if(cards){rect(x+9,y+8,w-18,h- 30,'#416044',5,'#b6904b');for(let j=0;j<6;j++){ctx.save();ctx.translate(x+33+(j%3)*45,y+20+Math.floor(j/3)*27);ctx.rotate((j-2)*.13);rect(-8,-12,16,23,'#f4e3b3',2,'#9f8a59');txt(['♠','♥','♣'][j%3],0,0,10,j%3===1?'#b85536':'#3e4f37');ctx.restore();}food('cerveja',x+17,y+37, 30);food('cachaca',x+w-20,y+52,26);return;}
 if(t.plates||t.dirty){for(let j=0;j<Math.min(3,t.plates);j++){ellipse(x+32+j*33,y+ 30,18,11,'#e1d7b5');ellipse(x+32+j*33,y+29,13,8,t.dirty?'#a3986e':'#ede5c3');if(t.dirty)for(let k=0;k<3;k++)rect(x+22+j*33+k*7,y+25+k%2*5,4,3,'#776344');}}else{rect(x+w/2-18,y+16,36,25,'#d3b57a',2,'#8e693d');rect(x+w/2-14,y+11,28,18,'#f0dec0',2,'#b0986b');}food('cachaca',x+w-21,y+19,23);if(t?.dirty){txt('⌁',x+w/2,y-12,25,'#efdb9a');} }

// Sadi com as mãos erguidas segurando a bandeja (mesmo recorte do sprite original).
function personDraw(index,x,y,walking=false,chef=false,dx=1,seated=false,mood=0,dy=0){if(typeof drawDirectionalPerson==='function'&&drawDirectionalPerson(index,x,y,walking,chef,dx,seated,mood,dy))return;const pose=chef?playerWalkPose(x,y):null,side=chef?playerSideSprite(index,dx,dy,pose):null;if(chef)index=side||playerFacingSprite(index,dy);const facingBack=index===SADI_BACK,reach=chef?playerReachPose():{lean:0,dip:0};const custom=typeof index==='object'?index:null,art=custom?CHARACTER_ART[custom.file]:peopleArt,s=custom?{x:custom.crop[0],y:custom.crop[1],w:custom.crop[2],h:custom.crop[3]}:SPRITES[index%6],height=personHeight(index,chef),seed=x*.05+(custom?3:index);if(chef&&facingBack)drawPlayerCarry(x,y,true);ellipse(x,y+1,seated?22:18,7,'#271c1755');ctx.save();ctx.translate(x,y);if(!facingBack&&(side?dx<0:chef?dx>.05:dx<-.05))ctx.scale(-1,1);if(art.complete&&art.naturalWidth){const t=ctx.getTransform(),baseFrame=characterFrame(custom||index,height*Math.hypot(t.a,t.b)),f=chef&&playerCarrying()?playerCarryFrame(custom||index,baseFrame):baseFrame,dw=height*s.w/s.h,part=(fx,fy,fw,fh,px,py,pw,ph)=>ctx.drawImage(f,fx*f.width,fy*f.height,fw*f.width,fh*f.height,px,py,pw,ph);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';const breath=Math.sin(frameClock*2.3+seed);
 if(side){ctx.drawImage(f,-dw/2,-height,dw,height);
 }else if(seated){
  // Sentado: respira e, perto de desistir, se remexe na cadeira.
  if(mood>.7)ctx.translate(Math.sin(frameClock*16+seed)*1.5,0);
  part(0,.72,1,.28,-dw/2,-height*.28+15,dw,height*.28-15);ctx.save();ctx.translate(0,-height*.28+15);ctx.scale(1,1+breath*.012);part(0,0,1,.72,-dw/2,-height*.72,dw,height*.72);ctx.restore();
 }else if(chef||walking){
  const stride=chef?pose.stride:1,ph=chef?pose.phase:frameClock*10+(custom?3:index)*1.7;
  const swing=Math.sin(ph)*stride,bob=chef?pose.bob:(1-Math.cos(ph*2))*.65;
  const hip=-height*.25,legLen=height*.25,flip=t.a<0?-1:1;
  for(let leg=0;leg<2;leg++){
   const step=swing*(leg?1:-1),angle=step*.19,lift=Math.max(0,step)*2.5;
   ctx.save();ctx.translate(-dw/4+leg*dw/2,hip+legLen*(1-Math.cos(angle))-lift);ctx.rotate(angle);
   part(leg*.5,.75,.5,.25,-dw/4,0,dw/2,legLen);ctx.restore();
  }
  ctx.save();ctx.translate(0,hip-bob+reach.dip);
  ctx.rotate((.025*Math.sign(dx||0)*stride+reach.lean)*flip+swing*.009);
  ctx.scale(1,1+breath*.004*(1-stride));
  part(0,0,1,.78,-dw/2,-height*.75,dw,height*.78);ctx.restore();
 }else if(mood>.65){
  // Impaciente: bate o pé da frente e balança o corpo.
  const tap=Math.max(0,Math.sin(frameClock*11+seed))**2;part(0,.7,.5,.3,-dw/2,-height*.3,dw/2,height*.3);
  ctx.save();ctx.translate(dw/4,-height*.3);ctx.rotate(-tap*.2);part(.5,.7,.5,.3,-dw/4,-tap*3,dw/2,height*.3);ctx.restore();
  ctx.save();ctx.translate(0,-height*.3);ctx.rotate(Math.sin(frameClock*5+seed)*.025);ctx.scale(1,1+breath*.015);part(0,0,1,.72,-dw/2,-height*.7,dw,height*.72);ctx.restore();
 }else{
  // Parado: respira e troca o peso de uma perna para a outra.
  ctx.save();ctx.rotate(Math.sin(frameClock*.8+seed*1.7)*.012);ctx.scale(1,1+breath*.012);ctx.drawImage(f,-dw/2,-height,dw,height);ctx.restore();
 }}else{rect(-13,-60,26,48,chef?'#e6d6ac':'#688657',5);ellipse(0,-72,12,15,'#c9935d');}ctx.restore();if(chef&&!side&&['bootsGaucho','bootsBagual'].includes(G.gear)){const color=G.gear==='bootsBagual'?'#42382b':'#b58147';rect(x-15,y-10,10,7,color,3,'#44341f');rect(x+5,y-9,10,7,color,3,'#44341f');}if(chef){drawPlayerTask(x,y);}if(chef&&G.boost>0&&!['mate','clean','mop'].includes(G.task?.type)){bar(x-24,y+10,48,G.boost/mateStats().duration,'#b8e67a');txt(Math.ceil(G.boost)+'s',x,y+27,12,'#e1ffae');}if(chef){drawPlayerCarry(x,y,false);drawPlayerTransfers();if(G.cosmetic)txt('★',x,y-106,17,'#ffd36b');}}


function bubble(items,x,y,ratio=1,waiting=false){const width=items.length*43+20,left=x-width/2;ctx.save();ctx.shadowColor='#39230b66';ctx.shadowBlur=5;ctx.shadowOffsetY=3;rect(left,y-60,width,57,'#fff1c9',7,'#71512a');ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.fillStyle='#fff1c9';ctx.beginPath();ctx.moveTo(x-6,y-4);ctx.lineTo(x,y+4);ctx.lineTo(x+6,y-4);ctx.fill();if(waiting){txt('⌛',x,y-34,25,'#e8be62');}else items.forEach((k,i)=>food(k,left+30+i*43,y-35,39));bar(left+9,y-14,width-18,ratio,ratio<.25?'#d7754b':ratio<.5?'#d2b44e':'#83a94c');ctx.restore();}

function artFurniture(index,x,y,w,h){if(!furnitureArt.complete||!furnitureArt.naturalWidth)return false;const [sx,sy,sw,sh]=furnitureCrops[index];ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(furnitureArt,sx,sy,sw,sh,x,y,w,h);ctx.restore();return true;}

function furnitureDraw(f){if(drawExpansionStation(f))return;const[x,y,w,h]=[f.x,f.y,f.w,f.h],[type,arg]=f.id.split(':');
 if(type==='bin'){counter(f);rect(x+6,y+7,w-12,h-26,'#4b4c3b',4,'#777665');ctx.save();if(!G.stock[arg])ctx.globalAlpha=.25;food(arg,x+w/2,y+21,46);ctx.restore();if(G.stock[arg]<=3)txt('!',x+w-8,y+8,16,'#ffb075');rect(x+18,y+h-10,w-36,17,'#382e1f',3,'#b99250');txt(G.stock[arg],x+w/2,y+h-1,13,G.stock[arg]?'#ffe4a9':'#ffad83');return;}
 if(type==='grill'){counter(f);rect(x+7,y+7,w-14,h-25,'#302d26',3,'#646051');for(let i=12;i<w-8;i+=9)rect(x+i,y+9,3,h-30,'#7e7866');artFurniture(1,x-4,y-19,w+8,h+38);const item=G.kitchen.grill[Number(arg)];if(item){food(item.key,x+w/2,y+25,52,item);if(item.waitingToast)txt('+ '+nameOf(item.key==='pao_xis'?'salame':'pao_xis'),x+w/2,y-12,12);else bar(x+10,y-11,w-20,item.ready?1-(item.heat-COOK[item.key])/18:item.heat/COOK[item.key],item.burned?'#c75231':item.warned?'#ec9345':item.ready?'#a6cf62':'#e8b65d');if(item.ready)txt(item.burned?'!':'✓',x+w-7,y+6,19,item.burned?'#ff9970':'#e0ffaa');for(let k=0;k<3;k++){const phase=(frameClock*.45+k*.33)%1;ellipse(x+25+k*18+Math.sin(phase*8)*5,y+15-phase*40,4+phase*5,6+phase*6,`rgba(${item.burned?'60,50,38':item.warned?'133,117,85':'237,224,180'},${.38*(1-phase)})`);}}for(let k=0;k<2;k++){ellipse(x+25+k*40,y+h-6,5,5,'#252822');ellipse(x+25+k*40,y+h-8,2,2,item?'#f7ac32':'#ab8e5e');}return;}
 if(type==='bench'){counter(f);if(!furnitureArt.complete)wood(x+10,y+10,w-20,h-37);rect(x+16,y+16,4,13,'#604322');const b=G.kitchen.bench[Number(arg)];if(b){b.items.forEach((i,k)=>food(i.key,x+w/2+(k%2?9:-6),y+30-k*5,51,i));const parts=benchParts(b),ready=matchRecipe(parts);if(ready)txt('✓',x+w-10,y+13,21,'#e2ffa8');else{const missing=RECIPES.xis_salada.parts.filter(k=>!parts.includes(k));missing.slice(0,3).forEach((k,n)=>{ctx.globalAlpha=.7;food(k,x+14+n*25,y+h-10,23);ctx.globalAlpha=1;});}}else{ctx.globalAlpha=.28;food('pao_xis',x+w/2,y+43,48);ctx.globalAlpha=1;}return;}
 if(type==='press'){counter(f);rect(x+13,y+13,w-26,38,'#3c413a',3,'#777a66');for(let j=20;j<50;j+=6)rect(x+20,y+j,w-40,2,'#93937d');artFurniture(2,x-4,y-40,w+8,h+55);const p=G.kitchen.press;if(p){food(p.pid||p.key,x+w/2,y+32,58,p);drawPressLid(x,y,w,p);if(p.waitingToast)txt('+ '+nameOf(p.key==='pao_xis'?'salame':'pao_xis'),x+w/2,y-13,12);else bar(x+12,y-13,w-24,p.ready?1-(p.heat-6)/18:p.heat/6,p.burned?'#bf5734':p.warned?'#ea9145':p.ready?'#b6d477':'#e3ae51');}if(!furnitureArt.complete){ctx.save();ctx.translate(x+12,y+11);ctx.rotate(p?-.08:-.26);rect(0,-13,w-24,19,'#b2b6a4',3,'#4c5549');rect(15,-21,w-54,8,'#28372e',3,'#797968');ctx.restore();}ellipse(x+w-17,y+h-12,4,4,p?.ready&&!p.waitingToast?'#bbd265':p?'#eeb151':'#895b3c');return;}
 if(type==='bottle'){ellipse(x+w/2,y+h+7,w*.63,10,'#22180b55');rect(x,y-27,w,h+ 30,'#879985',4,'#374635');rect(x+5,y-21,w-10,h+15,'#385843',3,'#d2cbaa');rect(x+9,y-16,w-18,18,arg==='refri'?'#ad4b2d':'#b29b50',1);for(let j=0;j<2;j++){for(let k=0;k<2;k++)food(arg,x+16+k*23,y+23+j* 30,28);rect(x+8,y+39+j*30,w-16,3,'#c5d0b2');}rect(x+w-9,y+16,3,25,'#e1d4a9');artFurniture(3,x-4,y-48,w+8,h+61);if(!G.stock[arg])rect(x+5,y-28,w-10,h+28,'#193322bc',3);if(G.stock[arg]<=3)txt('!',x+w-2,y-36,20,'#ffb375');food(arg,x+w/2,y+31,35);rect(x+10,y+h-12,w-20,20,'#263425',3,'#c7b875');txt(G.stock[arg],x+w/2,y+h-3,13,'#fff0b8');return;}
 if(type==='pour'){counter(f);wood(x+12,y+13,w-24,h-37,true);rect(x+25,y-14,27,46,'#60733b',6,'#394324');rect(x+31,y-26,14,18,'#b59b59',2,'#584624');rect(x+28,y+5,21,15,'#d7c48b',1);rect(x+49,y+18,14,6,'#bdbb94',2,'#716647');rect(x+57,y+21,5,10,'#bdbb94',1);food('cachaca',x+62,y+48, 30);txt(G.stock.cachaca,x+20,y+h-14,13);if(G.task?.type==='pour')bar(x,y-34,w,G.task.time/1.65);return;}
 if(type==='parking'){counter(f,'wood');rect(x+8,y+8,w-16,h-27,'#bbc0a0',3,'#65775d');rect(x+12,y+12,w-24,h-35,'#d5d4ae',1,'#9f9f7b');const i=G.kitchen.parking[Number(arg)];if(i)food(i.pid||i.key,x+w/2,y+27,55,i);return;}
 if(type==='shop'||type==='bag'){counter(f,'wood');if(type==='bag'){ellipse(x+w/2,y+21,23,17,'#ac8450');ellipse(x+w/2,y+17,22,12,'#535f2b');for(let i=0;i<14;i++)rect(x+13+(i*13)%38,y+12+(i*7)%14,5,2,'#9b9e48');food('erva',x+w/2+8,y+36, 30);}else{ctx.save();if(!G.stock[arg])ctx.globalAlpha=.25;food(arg,x+w/2,y+22,44);ctx.restore();}txt(type==='bag'?Math.round(G.stock.erva/100)/10+'kg':G.stock[arg],x+w/2,y+h-10,13);if(type==='bag'&&G.task?.type==='weigh')bar(x,y-14,w,G.task.grams/G.task.requested);return;}
 if(type==='trash'){ellipse(x+w/2,y+h+5,w*.65,8,'#241e1655');rect(x+5,y+8,w-10,h-5,'#657267',4,'#303b33');for(let j=12;j<w-5;j+=9)rect(x+j,y+15,3,h-15,'#94a090');ellipse(x+w/2,y+8,w*.5,10,'#a9b09a');ellipse(x+w/2,y+8,w*.35,5,'#3b443b');return;}
 if(type==='cards'){drawDining(f,true);return;}if(type==='table'){drawDining(f,false);return;}
}

// Quadros de personagem já recortados e reduzidos para o tamanho de tela.
// Desenhar a folha original (até 1536 px) com suavização alta a cada quadro era
// o maior custo do jogo; agora cada personagem é reduzido uma vez por faixa de tamanho.
const characterFrames=new Map();
function characterCrop(sprite){return typeof sprite==='object'?{x:sprite.crop[0],y:sprite.crop[1],w:sprite.crop[2],h:sprite.crop[3]}:SPRITES[sprite%6];}
function characterFrame(sprite,pixels){
 const custom=typeof sprite==='object',key=custom?sprite:sprite%6,s=characterCrop(sprite);
 const height=Math.min(s.h,Math.max(32,Math.ceil(pixels/32)*32));
 if(!characterFrames.has(key))characterFrames.set(key,new Map());
 const sizes=characterFrames.get(key);if(sizes.has(height))return sizes.get(height);
 let source=document.createElement('canvas');source.width=Math.round(s.w);source.height=Math.round(s.h);
 const c=source.getContext('2d');
 if(custom){c.beginPath();sprite.outline.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();}
 c.drawImage(custom?CHARACTER_ART[sprite.file]:peopleArt,s.x,s.y,s.w,s.h,0,0,s.w,s.h);
 // Reduções sucessivas pela metade preservam o contorno sem serrilhado.
 while(source.height>height){
  const next=document.createElement('canvas'),h=Math.max(height,Math.ceil(source.height/2));
  next.width=Math.max(1,Math.round(source.width*h/source.height));next.height=h;
  const n=next.getContext('2d');n.imageSmoothingEnabled=true;n.imageSmoothingQuality='medium';n.drawImage(source,0,0,next.width,next.height);source=next;
 }
 sizes.set(height,source);return source;
}

// Só o jogador usa a pose de carregar. Os antebraços originais do Sadi saem
// do recorte para não aparecerem quatro mãos; mangas, avental e NPCs ficam intactos.
const playerCarryFrames = new WeakMap();
function playerCarryFrame(sprite, base) {
 if(sprite!==0 && sprite!==SADI_BACK)return base;
 if(playerCarryFrames.has(base))return playerCarryFrames.get(base);
 const canvas=document.createElement('canvas');canvas.width=base.width;canvas.height=base.height;
 const c=canvas.getContext('2d');c.drawImage(base,0,0);c.globalCompositeOperation='destination-out';
 const back=sprite===SADI_BACK, crop=back?[200,69,627,1399]:[190,26,244,483];
 const arms=back?[
  [[207,711],[316,722],[308,803],[317,850],[299,930],[279,959],[211,944],[201,885],[210,818]],
  [[702,722],[819,712],[824,828],[830,932],[793,959],[736,955],[715,913],[722,857],[711,804]]
 ]:[
  [[210,232],[246,237],[239,267],[238,304],[226,322],[207,312],[201,288]],
  [[367,253],[403,252],[400,301],[404,330],[391,345],[373,345],[357,331],[364,301]]
 ];
 for(const arm of arms){c.beginPath();arm.forEach(([x,y],i)=>{x=(x-crop[0])*canvas.width/crop[2];y=(y-crop[1])*canvas.height/crop[3];if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.closePath();c.fill();}
 playerCarryFrames.set(base,canvas);return canvas;
}

function carryArm(ex,ey,hx,hy,back=false){
 // Cotovelo abaixo da mão: a palma sustenta o peso da bandeja.
 const bx=ex+(hx-ex)*.30,by=Math.max(ey+9,hy+5);
 const stroke=(color,width,offset=0)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();ctx.moveTo(ex+offset,ey);ctx.lineTo(bx+offset,by);ctx.lineTo(hx+offset,hy);ctx.stroke();};
 ctx.save();stroke('#4c2b1b',8);stroke('#c9874d',5.7);stroke(back?'#e2a262':'#eab078',2.2,-.8);ctx.restore();
}
function carryHand(x,y,side,thumb=false){
 // Silhueta pequena com palma, dedos sob a borda e polegar por cima.
 if(thumb){rect(x-side*2-1,y-3,5,4,'#714626',1);rect(x-side*2,y-3,3,2,'#efba83',1);return;}
 rect(x-4,y-1,8,6,'#55321d',2);
 rect(x-3,y-1,6,5,'#c98954',1);rect(x-2,y-1,5,2,'#efba83',1);
 rect(x-2,y+3,1,1,'#8e542f');rect(x+1,y+3,1,1,'#8e542f');
}

function drawPlayerCarry(x,y,behind=false){
 if(!playerCarrying())return;
 const carry=playerCarryPose(x,y),p=worldOut||G.player,pose=playerWalkPose(x,y),reach=playerReachPose();
 if(carry.spriteTray){
  if(behind===carry.back)G.hands.forEach((item,slot)=>{if(item){const a=sadiTrayItemAnchor(carry,slot);food(item.pid||item.key,a.x,a.y,G.up.tray?30:34,item);}});
  return;
 }
 const sadi=avatarSprite()===0,flip=!carry.back&&p.dx>.05?-1:1;
 const transfer=playerAnimationState().transfers.at(-1);
 const wave=transfer?Math.sin(clamp((frameClock-transfer.start)/transfer.duration,0,1)*Math.PI):0;
 const activeSide=transfer&&transfer.point.x<carry.x?-1:1;
 // De costas, bandeja e produtos ficam à frente do corpo (camada de trás).
 if(behind!==carry.back){
  if(carry.back&&sadi)drawArms();
  return;
 }
 if(!carry.back)drawArms();
 ctx.save();ctx.translate(carry.x,carry.y);ctx.rotate(carry.roll);
 // Borda grossa, superfície recuada e brilho: já não é uma elipse lisa.
 ellipse(0,2,30,8,'#4a3422');ellipse(0,0,30,8,'#bb8e53');
 ellipse(0,-1,27,5.8,'#e5cc94');ellipse(0,-1,23,4,'#cfb57d');
 ctx.strokeStyle='#f5dda6';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-1,27,5.8,0,Math.PI,Math.PI*2);ctx.stroke();
 G.hands.forEach((item,j)=>{if(item)food(item.pid||item.key,G.up.tray?(j?13:-13):0,-9,38,item);});
 if(!carry.back){carryHand(-22,4,-1,true);carryHand(22,4,1,true);}
 ctx.restore();

 function drawArms(){
  for(const side of [-1,1]){
   const local=side*22, hx=carry.x+local*Math.cos(carry.roll),hy=carry.y+local*Math.sin(carry.roll)+4;
   if(sadi){
    const sourceSide=side*flip;
    const ex=x+side*(carry.back?22:sourceSide<0?23:20),ey=y-(carry.back?69:sourceSide<0?74:69)-pose.bob+reach.dip;
    carryArm(ex,ey,hx,hy,carry.back);
   }
   carryHand(hx,hy,side);
   // A mão ajusta a pegada quando recebe/entrega; a outra continua apoiando.
   if(side===activeSide&&wave>.05){rect(hx-side*3,hy-4-wave*2,4,3,'#efba83',1,'#714626');}
  }
 }
}
