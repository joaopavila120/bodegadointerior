// PNGs compartilhados pelo cenário, pedidos, bandeja e catálogo do celular.
'use strict';
const ITEM_SPRITE_KEYS = ['erva','pao_xis','burger','burger_pronto','ovo','ovo_pronto','queijo','salada','bacon','coracao','refri','cerveja','cachaca','cigarro','cigarro_py','codorna','pepino','salame','amendoim','pinhao','bergamota','cafe','bitter','torrada','xis_montado','xis_prensado','mate','wait','costela_crua','costela_assada','costela_queimada','costela','maionese','azeite','lenha','vinho','pastel','cuca','polenta_frita','galeto','galeto_cru','farinha','fuba','ametista','agata'];
const ITEM_ART = Object.fromEntries(ITEM_SPRITE_KEYS.map(key => {
  const image = new Image();
  image.src = 'assets/images/items/' + key + '.png';
  return [key, image];
}));

// Redução progressiva: preserva as cores e o contorno sem descartar pixels
// ao reduzir os originais de 320 px para ícones pequenos.
const ITEM_LEVELS = new Map();
function itemImageForSize(key, pixels) {
  const original = ITEM_ART[key];
  if (!original?.complete || !original.naturalWidth) return null;
  if (!ITEM_LEVELS.has(key)) {
    const levels = [original];
    let source = original;
    for (let side=256;side>=32;side/=2) {
      if (side>=Math.max(source.width,source.height)) continue;
      const level=document.createElement('canvas');
      const ratio=side/Math.max(source.width,source.height);
      level.width=Math.max(1,Math.round(source.width*ratio));
      level.height=Math.max(1,Math.round(source.height*ratio));
      const context=level.getContext('2d');
      context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
      context.drawImage(source,0,0,level.width,level.height);
      levels.push(level);source=level;
    }
    ITEM_LEVELS.set(key,levels);
  }
  const levels=ITEM_LEVELS.get(key);
  for (let i=levels.length-1;i>=0;i--) if (Math.max(levels[i].width,levels[i].height)>=pixels) return levels[i];
  return original;
}

// xis bacon, xis coração e torrada de salame levam o ingrediente ao lado do lanche.
function itemBadge(key) { return {xis_bacon:'bacon',xis_coracao:'coracao',torrada:'salame'}[key] || null; }

function itemArtKey(key, item) {
  if (key === 'queijo_colonial') return 'queijo';
  if (key === 'pinhao_quente') return 'pinhao';
  if (key?.startsWith('xis_') && !['xis_montado','xis_prensado'].includes(key)) return item && !item.ready ? 'xis_montado' : 'xis_prensado';
  if (key === 'cigarro' && G?.up.cigarro_py) return 'cigarro_py';
  if (key === 'costela_assada' && item?.burned) return 'costela_queimada';
  if (item?.ready && ['burger','ovo'].includes(key)) return key + '_pronto';
  return key;
}

function itemFilter(item) {
  if (item?.spoiled) return 'grayscale(.8) brightness(.65)';
  if (item?.burned) return item.key === 'costela_assada' ? 'none' : 'brightness(.32)';
  if (item?.ready && ['bacon','coracao'].includes(item.key)) return 'saturate(.8) brightness(.72)';
  return 'none';
}

function itemIconHTML(key, item=null) {
  const artKey = itemArtKey(key,item);
  if (!ITEM_ART[artKey]) return '';
  const badge = itemBadge(key) || (item?.cheese ? 'queijo' : null);
  return `<span class="pixel-item" aria-hidden="true"><img src="assets/images/items/${artKey}.png" alt="" draggable="false" style="filter:${itemFilter(item)}">${badge?`<img class="pixel-item-extra" src="assets/images/items/${badge}.png" alt="" draggable="false">`:''}</span>`;
}

// Bacon/coração prontos, itens queimados e estragados: o filtro é aplicado uma vez por imagem e guardado
// (ctx.filter a cada quadro custa caro, principalmente com a chapa cheia).
const itemTintCache = new WeakMap();
function itemTinted(image, filter) {
  let byFilter = itemTintCache.get(image);
  if (!byFilter) itemTintCache.set(image, byFilter = new Map());
  let tinted = byFilter.get(filter);
  if (!tinted) {
    tinted = document.createElement('canvas'); tinted.width = image.width; tinted.height = image.height;
    const c = tinted.getContext('2d'); c.filter = filter; c.drawImage(image, 0, 0); byFilter.set(filter, tinted);
  }
  return tinted;
}

function food(key,x,y,size=40,item=null,inTransit=false) {
  if(item && !inTransit && itemInTransfer(item))return;
  const transform=ctx.getTransform();
  const image = itemImageForSize(itemArtKey(key,item),size*Math.hypot(transform.a,transform.b));
  if (image) {
    const filter = itemFilter(item), scale = size / Math.max(image.width,image.height);
    const w=image.width*scale,h=image.height*scale;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(filter !== 'none' ? itemTinted(image, filter) : image,Math.round(x-w/2),Math.round(y-h/2),w,h);
    ctx.restore();
  }
  // Selo do ingrediente que diferencia o lanche, grande e com sombra para destacar.
  const badge = itemBadge(key);
  if (badge) { ctx.save(); ctx.shadowColor='#1e120acc'; ctx.shadowBlur=Math.max(2,size*.08); ctx.shadowOffsetY=size*.03; food(badge,x+size*.3,y+size*.2,size*.68); ctx.restore(); }
  if (item?.cheese) food('queijo',x,y-4,size*.62);
  if (item?.spoiled) {
    ctx.save();ctx.strokeStyle='#d4ce72';ctx.lineWidth=2;
    for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x-10+k*10,y-18);ctx.bezierCurveTo(x-18+k*10,y-25,x+k*10,y-29,x-10+k*10,y-35);ctx.stroke();}
    ctx.restore();
  }
}
