'use strict';

function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function drawCharacterPortrait(context,sprite,x,y,height){
 const s=characterCrop(sprite),art=typeof sprite==='object'?CHARACTER_ART[sprite.file]:peopleArt;if(!art?.complete||!art.naturalWidth)return;
 const width=height*s.w/s.h,t=context.getTransform();context.imageSmoothingEnabled=true;
 context.drawImage(characterFrame(sprite,height*Math.hypot(t.a,t.b)),x-width/2,y-height,width,height);
}
function initializeCharacterChoice(){
 // Sempre começa com o Sadi; outros personagens são liberados pela amizade máxima.
 const c=$('avatarPreview');if(c)drawCharacterPortrait(c.getContext('2d'),0,c.width/2,c.height-4,c.height-8);
}
const UPGRADE_TABS=['Botas','Mate','Cozinha','Balcão','Outros'];
let upgradeTab='Cozinha';
function upgradeCategory(u){if(GEAR[u.id])return 'Botas';if(u.id.startsWith('mate'))return 'Mate';if(['bacon','coracao','grill3','coffee'].includes(u.id))return 'Cozinha';if(u.goods||['cigarro_py','placaFiado'].includes(u.id))return 'Balcão';return 'Outros';}
// Ícone de cada melhoria: sprite do produto que ela libera ou um ícone próprio.
const UPGRADE_ICONS={trago:'item:cachaca',coffee:'cambona',bootsGaucho:'bota_gaucho',bootsBagual:'bota_bagual',mateCuiudo:'mate:1',mateTopetudo:'mate:2',mateLendario:'mate:3',cigarro_py:'item:cigarro_py',table3:'mesa',table4:'mesa',tray:'bandeja',pepino:'item:pepino',bergamota:'item:bergamota',amendoim:'item:amendoim',salame:'item:salame',pinhao:'item:pinhao',bitter:'item:bitter',capacity:'estoque',bacon:'item:bacon',grill3:'chapa',coracao:'item:coracao',placaFiado:'placa_fiado',bodoque:'bodoque'};
function upgradeIconHTML(id){
 const icon=UPGRADE_ICONS[id];if(!icon)return '';const[kind,arg]=icon.split(':');
 if(kind==='item')return `<span class="upgrade-icon">${itemIconHTML(arg)}</span>`;
 if(kind==='emoji')return `<span class="upgrade-icon"><span class="bag-emoji">${arg}</span></span>`;
 if(kind==='mate')return `<span class="upgrade-icon">${itemIconHTML('mate:'+arg)}</span>`;
 if(icon==='placa_fiado')return `<span class="upgrade-icon">${itemIconHTML('placa_fiado')}</span>`;
 return `<span class="upgrade-icon"><img src="assets/images/icons/${icon}.png" alt="" draggable="false"></span>`;
}
function upgradeCatalog(){
 // Na etapa do tutorial, abre direto na aba da Mesa de tragos.
 const tab=tutorialActive()&&tutorialStep().id==='upgrade'?upgradeCategory(UPGRADES.find(u=>u.id==='trago')):upgradeTab;
 return `<div class="phone-cat upgrade-cats">${UPGRADE_TABS.map(c=>`<button class="${tab===c?'active':''}" data-act="upgradeTab" data-id="${c}">${c}</button>`).join('')}</div>`+({Botas:bootsPanel(),Mate:matePanel(),Outros:tablePanel()}[tab]||'')+[tab].map(category=>`<div class="upgrade-category">${UPGRADES.filter(u=>upgradeCategory(u)===category&&!(u.shop&&physicalShopping())).map(u=>{
  const missing=[];if(!tutorialUpgradeAllowed(u.id))missing.push('concluir a etapa do tutorial');if(bodegaLevel()<(u.level||1))missing.push('nível '+u.level);if(G.rep<u.rep)missing.push('reputação '+u.rep);if(!hasCash(u.cost))missing.push(money(u.cost));if(u.requires&&!G.up[u.requires])missing.push(UPGRADES.find(v=>v.id===u.requires).name);
  return `<div class="upgrade"><h3>${upgradeIconHTML(u.id)}${u.name}</h3><p>${u.desc}</p><p>${u.level>1?'Nível '+u.level+' · ':''}Reputação ${u.rep} · ${money(u.cost)}${u.requires?' · requer '+UPGRADES.find(v=>v.id===u.requires).name:''}</p><button class="primary" data-act="upgrade" data-id="${u.id}" ${G.up[u.id]||missing.length?'disabled':''}>${G.up[u.id]?'Já é da casa':missing.length?'Falta: '+missing.join(' + '):u.cost===0?'Instalar grátis':'Comprar melhoria'}</button></div>`;
 }).join('')}</div>`).join('');
}
function guideContent(){
 return `<div class="callout"><b>${escapeHTML(G.bodegaName)} · ${PEOPLE.find(p=>p.id===G.avatarId)?.name||'Sadi'}</b> · ${improvementCount()} melhorias · ${decorCount()} de ${DECOR.length} peças de decoração</div>${achievementsHTML()}`;
}
function gameGuide(){if(G.game||G.bocce)return;openDialog('Guia e progresso',guideContent(),'guide');}
// Atalhos no topo do celular: o álbum de figurinhas e o guia com as conquistas, sempre à vista.
function phoneShortcutsHTML(){const got=Object.keys(G.achievements||{}).length;return `<button data-act="phoneAlbum">🃏 Álbum · ${cardsOwned()}/${CARDS.length}${G.cardsNew?'<span class="new">novo</span>':''}</button><button data-act="phoneGuide">📘 Guia e progresso · ${got}/${ACHIEVEMENTS.length}</button>`;}
{const render=renderPhone;renderPhone=function(){render();const el=$('phoneShortcuts');if(el)setHTML(el,phoneShortcutsHTML());};}
