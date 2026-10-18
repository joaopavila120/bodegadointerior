'use strict';

// Balões individuais. O limite inferior das mercadorias fica sempre livre.
function customerOrderBubbles(){
 const result=[];
 for(const g of G.groups){
  if(g.state!=='seated')continue;ensureDiners(g);
  g.diners.forEach((d,i)=>{if(d.status!=='waiting')return;const p=groupSeatPosition(g,i);
   result.push({x:p.x,y:p.y-109,items:d.orders,seconds:d.patience,total:d.maxPatience,training:g.training,seat:i+1});
  });
 }
 // Só quem já chegou ao atendimento exibe o pedido; não cobre as estações no caminho.
 for(const c of queuedShop().slice(0,counterCount()))if(c?.dest&&Math.hypot(c.x-c.dest.x,c.y-c.dest.y)<18)result.push({x:c.x,y:c.y-124,items:orderList(c),seconds:c.patience,total:c.maxPatience,training:c.training,weight:c.grams,counter:true,fiado:c.fiado});
 return result.map(b=>{
  const width=b.counter?(b.weight?98:70)+(b.items.length>1?32:0):b.items.length>=3?58:b.items.length===2?54:46,height=b.counter?32:38;
  return {...b,width,height,left:clamp(b.x-width/2,4,W-width-4),top:Math.max(414,b.y-height-5)};
 });
}
// Ampulheta sobre quem espera a vez: na fila do balcão (atrás de quem está sendo atendido) e grupos sem mesa.
function drawHourglass(x,y){
 const t=frameClock*1.5%2,flip=t>1.8?(t-1.8)/.2*Math.PI:0;ctx.save();ctx.translate(x,y);ctx.rotate(flip);
 rect(-10,-15,20,30,'#fff1d1',6,'#866840');ctx.fillStyle='#866840';ctx.fillRect(-6,-11,12,2);ctx.fillRect(-6,9,12,2);
 const k=(t%1);ctx.fillStyle='#d8a93e';ctx.beginPath();ctx.moveTo(-5,-9);ctx.lineTo(5,-9);ctx.lineTo(0,-1);ctx.closePath();ctx.globalAlpha=1-k*.8;ctx.fill();ctx.globalAlpha=1;
 ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(5,9);ctx.lineTo(-5,9);ctx.closePath();ctx.globalAlpha=.3+k*.7;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#866840';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-6,-9);ctx.lineTo(6,9);ctx.moveTo(6,-9);ctx.lineTo(-6,9);ctx.stroke();ctx.restore();
}
// Fala de quem reclama na fila (mesa suja): balão com o texto quebrado em linhas curtas.
function shoutLines(text,max=26){const out=[];let line='';for(const w of String(text).split(' ')){if(line&&(line+' '+w).length>max){out.push(line);line=w;}else line=line?line+' '+w:w;}if(line)out.push(line);return out;}
function drawShout(x,y,text){
 ctx.font='bold 13px Arial';const lines=shoutLines(text),w=Math.max(...lines.map(l=>ctx.measureText(l).width))+20,h=lines.length*16+12,left=clamp(x-w/2,4,W-w-4),top=y-h;
 rect(left,top,w,h,'#fff1d1',8,'#866840');ctx.fillStyle='#fff1d1';ctx.beginPath();ctx.moveTo(x-6,top+h-1);ctx.lineTo(x,top+h+8);ctx.lineTo(x+6,top+h-1);ctx.fill();
 lines.forEach((l,i)=>txt(l,left+w/2,top+14+i*16,13,'#5a2a14','center','Arial',false));
}
function drawWaiting(){
 queuedShop().slice(counterCount()).forEach(c=>drawHourglass(c.x,c.y-140));
 const waiting=G.groups.filter(g=>g.state==='wait');
 for(const g of waiting)drawHourglass(g.x-(g.size-1)*12,g.y-150);
 for(const g of waiting)if(g.shoutT>0)drawShout(g.x-(g.size-1)*12,g.y-172,g.shout);
}
function drawCustomerOrders(){
 drawWaiting();
 for(const b of customerOrderBubbles()){
  const x=b.left,y=b.top,w=b.width,h=b.height;
  rect(x,y,w,h,'#fff1d1',5,'#866840');
  if(!b.training&&b.seconds/b.total<.3)drawPatienceClock(x+w+4,y+2,b.seconds/b.total);
  ctx.fillStyle='#fff1d1';ctx.beginPath();ctx.moveTo(b.x-3,y+h-1);ctx.lineTo(b.x,y+h+4);ctx.lineTo(b.x+3,y+h-1);ctx.fill();
  if(b.counter){
   food(b.items[0],x+17,y+14,28);
   if(b.weight&&bulk(b.items[0]))txt(formatWeight(b.weight),x+49,y+14,10,'#5a442a','center','Arial',false);
   if(b.items[1])food(b.items[1],x+(b.weight&&bulk(b.items[0])?84:47),y+14,26);
   txt(b.training?'livre':Math.ceil(b.seconds)+'s',x+w-4,y+14,10,b.seconds<25&&!b.training?'#a33420':'#584629','right','Arial',false);
   rect(x+5,y+h-4,w-10,2,'#d6c7a7');rect(x+5,y+h-4,(w-10)*clamp(b.seconds/b.total,0,1),2,'#73934c');if(b.fiado){rect(x+w-8,y-12,22,18,'#f3e1a6',4,'#866840');txt('📒',x+w+3,y-3,12,'#5a442a','center','Arial',false);}continue;
  }
  const size=b.items.length===3?18:b.items.length===2?24:28;
  b.items.slice(0,3).forEach((k,j)=>food(k,x+w/2+(j-(b.items.length-1)/2)*size,y+13,size));
  if(b.weight)txt(formatWeight(b.weight),x+w/2,y+27,10,'#5a442a','center','Arial',false);
  txt(b.training?'livre':Math.ceil(b.seconds)+'s',x+w/2,y+h-9,10,b.seconds<25&&!b.training?'#a33420':'#584629','center','Arial',false);
  rect(x+5,y+h-4,w-10,2,'#d6c7a7');rect(x+5,y+h-4,(w-10)*clamp(b.seconds/b.total,0,1),2,b.seconds<25&&!b.training?'#c65b39':'#73934c');
 }
}
