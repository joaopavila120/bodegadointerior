// Decoração: comprada no balcão da bodega (caixa → Personalizar bodega) e exposta ou guardada ali ou pela aba Estética
// do celular. Também a janela de chuva e as luzes do cenário.
'use strict';

// Cada peça é um PNG recortado do room2.png original. `at` é o canto superior
// esquerdo no arquivo de 1672 x 941: desenhada ali, a peça volta ao lugar exato.
const DECOR_CATS=['Galpão','Cozinha campeira','Luz e plantas'];
const DECOR=[
 {id:'bandeira',cat:'Galpão',name:'Bandeira do Rio Grande',cost:75,rep:0,at:[625,25],desc:'Verde, vermelho e amarelo bem esticados na parede principal.'},
 {id:'comoda',cat:'Galpão',name:'Cômoda campeira',cost:110,rep:62,at:[615,240],desc:'Móvel de madeira maciça com pelego bordado por cima.'},
 {id:'kit_chimarrao',cat:'Galpão',name:'Kit do chimarrão',cost:50,rep:62,requires:'comoda',at:[647,179],desc:'Balde de madeira, térmica e cuia com bomba prontos para a roda.'},
 {id:'prateleira',cat:'Galpão',name:'Prateleira de conservas',cost:45,rep:0,at:[875,109],desc:'Prateleira com potes de compota da colônia.'},
 {id:'gaita',cat:'Galpão',name:'Gaita ponto',cost:150,rep:66,requires:'prateleira',at:[919,65],desc:'A cordeona vermelha descansando para o próximo baile.'},
 {id:'poncho',cat:'Galpão',name:'Poncho de lã',cost:80,rep:63,at:[1000,162],desc:'Poncho listrado com franjas, pendurado no gancho.'},
 {id:'chapeu',cat:'Galpão',name:'Chapéu campeiro',cost:55,rep:0,at:[1013,90],desc:'Chapéu de aba larga para as lidas de domingo.'},
 {id:'laco',cat:'Galpão',name:'Laço de couro trançado',cost:50,rep:0,at:[910,182],desc:'Rodilhas de laço penduradas embaixo da prateleira de conservas.'},
 {id:'fogao_lenha',cat:'Cozinha campeira',name:'Fogão a lenha',cost:225,rep:64,at:[252,0],desc:'Fogão de ferro com base de tijolo, chaminé e panelas no fogo.'},
 {id:'bancada_lenha',cat:'Cozinha campeira',name:'Bancada com lenha',cost:90,rep:0,at:[52,211],desc:'Bancada rústica, pano xadrez e lenha empilhada por baixo.'},
 {id:'utensilios',cat:'Cozinha campeira',name:'Tábuas e panela de barro',cost:40,rep:0,requires:'bancada_lenha',at:[87,154],desc:'Tábuas de carne, colheres de pau e panela de barro sobre a bancada.'},
 {id:'prateleira_potes',cat:'Cozinha campeira',name:'Prateleira da cozinha',cost:55,rep:0,at:[183,47],desc:'Potes, compoteira e panela de cobre acima da bancada.'},
 {id:'frigideiras',cat:'Cozinha campeira',name:'Frigideiras de ferro',cost:40,rep:0,requires:'prateleira_potes',at:[202,112],desc:'Duas frigideiras penduradas sob a prateleira.'},
 {id:'ervas',cat:'Cozinha campeira',name:'Maço de ervas',cost:20,rep:0,at:[463,82],desc:'Ervas secando de cabeça para baixo.'},
 {id:'alho',cat:'Cozinha campeira',name:'Réstia de alho',cost:20,rep:0,at:[519,82],desc:'Alho trançado para espantar até o lobisomem.'},
 {id:'cabaca',cat:'Cozinha campeira',name:'Cabaça',cost:25,rep:0,at:[549,82],desc:'Porongo pendurado ao lado do lampião.'},
 {id:'lampiao_esq',cat:'Luz e plantas',name:'Lampião da cozinha',cost:45,rep:0,at:[138,0],light:[159,100,95],desc:'Lampião a querosene: à noite ilumina a cozinha.'},
 {id:'lampiao_centro',cat:'Luz e plantas',name:'Lampião do meio',cost:45,rep:0,at:[575,44],light:[595,124,90],desc:'Lampião de parede: à noite clareia o meio do salão.'},
 {id:'lampiao_dir',cat:'Luz e plantas',name:'Lampião do salão',cost:45,rep:0,at:[1589,0],light:[1613,121,100],desc:'Lampião que, à noite, ilumina o canto do salão.'},
 {id:'planta_esq',cat:'Luz e plantas',name:'Samambaia pendurada',cost:30,rep:0,at:[49,36],desc:'Samambaia caindo do vaso no canto da cozinha.'},
 {id:'lampada',cat:'Luz e plantas',name:'Lâmpada pendente',cost:0,rep:0,gift:'Lauro Bolador',at:[1091,0],light:[1114,80,90],desc:'Presente do Lauro Bolador depois da primeira bocha. À noite clareia o salão.'},
 {id:'planta_dir',cat:'Luz e plantas',name:'Folhagem no vaso de barro',cost:40,rep:0,at:[1467,0],desc:'Vaso pendurado ao lado da janela, com folhas até o chão.'}
];
const DECOR_ART=Object.fromEntries(DECOR.map(d=>{const image=new Image();image.src='assets/images/decor/'+d.id+'.png';return[d.id,image];}));
const RAIN_WINDOW_DATA='assets/images/decor/janela_chuva.png';
const rainWindowArt=new Image();rainWindowArt.src=RAIN_WINDOW_DATA;
// Abertura da janela (entre as folhas), em coordenadas do room2.png.
const RAIN_WINDOW={at:[1140,80],view:[1171,81,1413,241]};
const FIRE_LIGHT=[345,318,120];

// O fundo ocupa o mundo inteiro em escala uniforme (1672 x 941 -> 1600 x 900).
function roomX(x){return x*W/1672;}
function roomY(y){return y*H/941;}
function drawRoomArt(image,ox,oy){
 if(!image.complete||!image.naturalWidth)return;
 ctx.drawImage(image,roomX(ox),roomY(oy),roomX(image.naturalWidth),roomY(image.naturalHeight));
}

function decorState(state=G){if(!state.decor||typeof state.decor!=='object')state.decor={};if('lampada_coracao' in state.decor){state.decor.lampada=state.decor.lampada_coracao;delete state.decor.lampada_coracao;}return state.decor;}
function decorOwned(id,state=G){return Object.hasOwn(decorState(state),id);}
function decorVisible(d){return decorState()[d.id]===true&&(!d.requires||decorState()[d.requires]===true);}
function decorCount(){return DECOR.filter(d=>decorOwned(d.id)).length;}
function decorMissing(d){
 const missing=[];if(G.rep<d.rep)missing.push('reputação '+d.rep);if(!hasCash(d.cost))missing.push(money(d.cost));
 if(d.requires&&!decorOwned(d.requires))missing.push(DECOR.find(x=>x.id===d.requires).name);return missing;
}
function buyDecor(id){
 const d=DECOR.find(d=>d.id===id);if(!d||decorOwned(id))return;
 const missing=decorMissing(d);if(missing.length){say('Falta: '+missing.join(' + ')+'.');AudioEngine.bad();return;}
 spendCash(d.cost);G.stats.investments+=d.cost;decorState()[id]=true;
 if(d.requires)decorState()[d.requires]=true;
 say(d.name+' já enfeita a bodega!');AudioEngine.heart();save();renderPhone();refreshCustomize();
}
function toggleDecor(id){
 const d=DECOR.find(d=>d.id===id);if(!d||!decorOwned(id))return;
 const shown=!decorState()[id];decorState()[id]=shown;
 // Peças apoiadas em outra acompanham a base: guardar a cômoda guarda o kit.
 if(shown&&d.requires)decorState()[d.requires]=true;
 if(!shown)for(const other of DECOR)if(other.requires===id&&decorOwned(other.id))decorState()[other.id]=false;
 save();renderPhone();refreshCustomize();
}
function sanitizeDecor(state){const decor=decorState(state);for(const id of Object.keys(decor))if(!DECOR.some(d=>d.id===id))delete decor[id];else decor[id]=decor[id]===true;}

function decorPanel(shop=false){
 return (shop?`<p class="small-note">${decorCount()} de ${DECOR.length} peças compradas. Itens de estética não mudam o atendimento: compre, exponha ou guarde quando quiser.</p>`:`<div class="phone-intro"><h3>Deixe a bodega com a sua cara</h3><p>${decorCount()} de ${DECOR.length} peças compradas. Itens de estética não mudam o atendimento: compre no balcão da bodega (Personalizar bodega) e exponha ou guarde por aqui.</p></div>`)+DECOR_CATS.map(cat=>`<details class="upgrade-category" open><summary>${cat}</summary>${DECOR.filter(d=>d.cat===cat).map(d=>{
  const owned=decorOwned(d.id),shown=decorState()[d.id]===true,missing=owned?[]:decorMissing(d),base=d.requires&&DECOR.find(x=>x.id===d.requires);
  const store=!shop&&!owned&&!d.gift;
  return `<div class="decor-card${shown?' shown':''}"><span class="decor-thumb"><img src="assets/images/decor/${d.id}.png" alt="" draggable="false"></span><div><h3>${d.name}</h3><p>${d.desc}</p><small>${d.gift?'Presente · não se compra':money(d.cost)}${d.rep?' · reputação '+d.rep:''}${base?' · vai junto com '+base.name:''}</small>${!owned&&d.gift?`<button disabled>Presente de ${d.gift}</button>`:owned?`<button data-act="decorToggle" data-id="${d.id}" aria-pressed="${shown}">${shown?'Exposto ✓ · guardar':'Guardado · expor'}</button>`:store?`<button disabled>À venda no balcão · Personalizar bodega</button>`:`<button class="primary" data-act="decorBuy" data-id="${d.id}" ${missing.length?'disabled':''}>${missing.length?'Falta: '+missing.join(' + '):'Comprar · '+money(d.cost)}</button>`}</div></div>`;
 }).join('')}</details>`).join('')+quadroPanel();
}

// Balcão → Personalizar bodega: comprar, expor e guardar a decoração, os quadros dos amigos e os móveis das melhorias
// (guardar ou reinstalar). Melhoria nova continua sendo comprada na loja.
function personalizeMenu(){
 const box=$('dialogContent').closest('.dialog'),keep=modal==='personalizar'?box.scrollTop:0;
 openDialog('Personalizar bodega',`<p>Deixe a bodega com a sua cara. A decoração se compra aqui; melhorias novas, na Ferragem da Fronteira (botas e bodoque na Casa do Campeiro).</p>${moveisSection()||'<h3>Móveis da bodega</h3><p class="small-note">Quando comprar melhorias como a mesa de tragos, dá para guardar ou reinstalar aqui.</p>'}<h3>Decoração</h3>${decorPanel(true)}<div class="actions"><button data-act="caixaBack">Voltar ao caixa</button><button data-act="close">Fechar</button></div>`,'personalizar');
 box.scrollTop=keep;
}
function refreshCustomize(){if(modal==='personalizar')personalizeMenu();}

function drawDecor(){
 ctx.save();ctx.imageSmoothingEnabled=false;
 for(const d of DECOR)if(decorVisible(d))drawRoomArt(DECOR_ART[d.id],d.at[0],d.at[1]);
 ctx.restore();drawFriendPortrait();
}
// Quadros dos amigos: amizade 25 libera o retrato de cada especial; cabe um na parede da direita, ao lado da janela.
const QUADRO_AT=25,QUADRO_SPOT=[1500,200,100,125],QUADRO_ART={};
function quadroPeople(){return Object.keys(PORTRAIT_FILES).map(id=>PEOPLE.findIndex(p=>p.id===id)).filter(i=>i>=0&&!PEOPLE[i].removed);}
function quadroUnlocked(i){return (G.friends[i]||0)>=QUADRO_AT;}
function toggleQuadro(id){const i=PEOPLE.findIndex(p=>p.id===id);if(i<0||!quadroUnlocked(i))return;G.quadro=G.quadro===id?null:id;say(G.quadro?'Quadro de '+PEOPLE[i].name+' na parede!':'Quadro guardado.');AudioEngine.heart();save();renderPhone();refreshCustomize();}
function quadroPanel(){return `<details class="upgrade-category" open><summary>Quadros dos amigos</summary><p class="small-note">Amizade ${QUADRO_AT} libera o quadro de cada especial. Só cabe um na parede.</p>`+quadroPeople().map(i=>{const id=PEOPLE[i].id,ok=quadroUnlocked(i),on=G.quadro===id;return `<div class="decor-card${on?' shown':''}"><span class="decor-thumb">${portraitHTML(i,56)}</span><div><h3>Quadro de ${PEOPLE[i].name}</h3><small>${ok?'Liberado pela amizade':'Amizade '+Math.floor(G.friends[i]||0)+'/'+QUADRO_AT}</small>${ok?`<button data-act="quadro" data-id="${id}" aria-pressed="${on}">${on?'Na parede ✓ · tirar':'Pendurar na parede'}</button>`:'<button disabled>Ainda bloqueado</button>'}</div></div>`;}).join('')+'</details>';}
function drawFriendPortrait(){
 const id=G.quadro;if(!id||!PORTRAIT_FILES[id])return;
 const img=QUADRO_ART[id]??=Object.assign(new Image(),{src:'assets/images/portraits/256/'+PORTRAIT_FILES[id]+'.jpg'});
 const[rx,ry,rw,rh]=QUADRO_SPOT,x=roomX(rx),y=roomY(ry),w=roomX(rw),h=roomY(rh);
 rect(x-8,y-8,w+16,h+16,'#5a3a1e',3,'#2a1a0e');rect(x-3,y-3,w+6,h+6,'#c8a050',2);
 if(img.complete&&img.naturalWidth){const s=Math.max(w/img.naturalWidth,h/img.naturalHeight),sw=w/s,sh=h/s;ctx.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,x,y,w,h);}else rect(x,y,w,h,'#3a2a1a');
}
function glow(x,y,radius,alpha,color){
 const g=ctx.createRadialGradient(x,y,0,x,y,radius);g.addColorStop(0,`rgba(${color},${alpha})`);g.addColorStop(1,`rgba(${color},0)`);
 ctx.fillStyle=g;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
}
function drawDecorLights(){
 ctx.save();ctx.globalCompositeOperation='lighter';
 const night=nightLevel();
 for(const d of DECOR){
  // Lampiões só acendem de verdade à noite.
  if(!d.light||!decorVisible(d)||night<=0)continue;const[lx,ly,r]=d.light,flicker=1+Math.sin(frameClock*6.3+lx)*.05+Math.sin(frameClock*14.1+ly)*.03;
  glow(roomX(lx),roomY(ly),roomX(r)*(1+night*.8)*flicker,(.12+.2*night)*flicker,d.lightColor||'255,176,82');
 }
 if(decorState().fogao_lenha===true){const[fx,fy,r]=FIRE_LIGHT,flicker=1+Math.sin(frameClock*8.7)*.08+Math.sin(frameClock*19.3)*.05;glow(roomX(fx),roomY(fy),roomX(r)*flicker,.16*flicker,'255,128,48');}
 ctx.restore();
}

function isRainDay(){return G.event.id==='chuva';}
function drawRainWindow(){
 if(!isRainDay())return;
 // Céu de temporal o dia inteiro; o resto do cenário escurece um pouco.
 rect(0,0,W,H,'#1d2c4426');
 ctx.save();ctx.imageSmoothingEnabled=false;drawRoomArt(rainWindowArt,RAIN_WINDOW.at[0],RAIN_WINDOW.at[1]);ctx.restore();
 const[x0,y0,x1,y1]=RAIN_WINDOW.view,left=roomX(x0),top=roomY(y0),width=roomX(x1)-left,height=roomY(y1)-top;
 ctx.save();ctx.beginPath();ctx.rect(left,top,width,height);ctx.clip();
 ctx.strokeStyle='#c9dcea88';ctx.lineWidth=1;ctx.beginPath();
 for(let i=0;i<46;i++){const x=left+(i*37.3)%width,y=top+((frameClock*150+i*29)%(height+14))-12;ctx.moveTo(x,y);ctx.lineTo(x-3,y+9);}
 ctx.stroke();
 const flash=Math.max(0,Math.sin(frameClock*.37)*12-11);if(flash>0)rect(left,top,width,height,`rgba(230,238,255,${flash*.35})`);
 ctx.restore();
 for(let i=0;i<7;i++){const phase=(frameClock*1.7+i*.37)%1;ellipse(left+18+i*26,roomY(y1)+1,2+phase*3,1,`rgba(205,225,236,${.5*(1-phase)})`);}
}
