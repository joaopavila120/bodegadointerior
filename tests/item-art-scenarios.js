(() => {
 const results=[],check=(value,label)=>{if(!value)throw Error(label);results.push(label);};
 const old=G;G=fresh();
 try {
  for(const key of [...Object.keys(GOODS),...Object.keys(RECIPES),'mate','wait']) {
   const art=ITEM_ART[itemArtKey(key)];
   check(art?.complete&&art.naturalWidth>0&&art.src.endsWith('.png'),'sprite PNG carregado: '+key);
   const div=document.createElement('div');div.innerHTML=itemIconHTML(key);
   const raster=div.querySelector('img,svg image');
   check((raster?.getAttribute('src')||raster?.getAttribute('href')||'').endsWith('.png'),'mesma arte PNG no catálogo: '+key);
   food(key,32,32,32);
  }
  check(itemArtKey('burger',{ready:false})==='burger'&&itemArtKey('burger',{ready:true})==='burger_pronto','carne crua e pronta têm sprites distintos');
  check(itemArtKey('ovo',{ready:false})==='ovo'&&itemArtKey('ovo',{ready:true})==='ovo_pronto','ovo cru e frito têm sprites distintos');
  check(itemArtKey('xis_salada',{ready:false})==='xis_montado'&&itemArtKey('xis_salada',{ready:true})==='xis_prensado','xis mantém montagem e prensa distintos');
  G.up.cigarro_py=true;
  check(itemIconHTML('cigarro').includes('cigarro_py.png'),'melhoria troca o maço imediatamente');
  check(itemFilter({burned:true})==='brightness(.32)'&&itemFilter({spoiled:true}).includes('grayscale'),'queimados e estragados mantêm sinal visual');
  check(itemIconHTML('xis_bacon').includes('bacon.png')&&itemIconHTML('xis_coracao').includes('coracao.png')&&itemIconHTML('torrada').includes('salame.png'),'xis bacon, xis coração e torrada mostram o ingrediente ao lado');
  check(itemIconHTML('burger',{ready:true,cheese:true}).includes('queijo.png'),'queijo sobre carne mantém indicação na mão');
 } finally {G=old;draw();}
 return results;
})()
