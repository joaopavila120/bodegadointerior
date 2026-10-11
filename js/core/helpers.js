// Utilidades, formatação de moeda, cálculos e auxiliares
'use strict';

const $ = id => document.getElementById(id);
const canvas = $('scene');
let ctx = canvas ? canvas.getContext('2d') : null;

const money = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round = v => Math.round(v * 100) / 100;
// fit=false preenche a área do jogo (sem barras); fit=true mostra a bodega inteira.
const camera = { zoom: 1, fit: false, x: 0, y: 0, scale: 1 };
const held = () => G.hands[G.slot];
const freeHand = () => !held();
const pick = values => values[Math.floor(Math.random() * values.length)];
const unlocked = key => !GOODS[key]?.unlock || !!G.up[GOODS[key].unlock];
const capacity = () => G.up.capacity ? 30 : 18;
const price = key => key === 'cigarro' && G.up.cigarro_py ? 18 : RECIPES[key]?.price || GOODS[key]?.price || 0;
const nameOf = key => key === 'cigarro' && G.up.cigarro_py ? 'Cigarro do Paraguai' : RECIPES[key]?.name || GOODS[key]?.name || key;

function bulk(k){return BULK[k]||null;}

function formatWeight(n){return n>=1000?(round(n/1000)).toLocaleString('pt-BR')+' kg':Math.round(n)+' g';}

function stationCapacity(k){return bulk(k)?Math.round(bulk(k).capacity*(G.up.capacity?1.6:1)):capacity();}

function stockText(k,n=G.stock[k]){return bulk(k)?formatWeight(n):Math.floor(n)+' un.';}

function salePrice(i){return bulk(i.pid)?round(price(i.pid)*(i.weight||bulk(i.pid).unit)/bulk(i.pid).unit):price(i.pid);}

function movementBonus(){return GEAR[G.gear]?.bonus||0;}

function mateLevel(){return G.up.mateLendario?3:G.up.mateTopetudo?2:G.up.mateCuiudo?1:0;}

function mateStats(){return MATES[mateLevel()];}

function isTableTruco(t){return t?.mode==='truco';}


function hasCash(amount){return G.testMode||G.cash>=amount;}

function spendCash(amount){if(!G.testMode)G.cash=round(G.cash-amount);}

function walletText(){return G.testMode?'R$ ∞':money(G.cash);}

function alcoholPool(){return ['cerveja','cachaca','bitter'].filter(unlocked);}

function snackPool(){return ['codorna','pepino','salame','amendoim'].filter(k=>unlocked(k)&&orderable(k));}

function drinkPool(){return ['refri','cerveja','cachaca','cafe','bitter'].filter(unlocked);}

// Preferências de cada especial: sem álcool, sem bebida nenhuma ou chopp sempre que der.
const DRINKS=['refri','cerveja','cachaca','cafe','bitter'],ALCOHOL=['cerveja','cachaca','bitter','vinho'];
function fitOrder(person,key){
 const p=PEOPLE[person];if(!p||!key)return key;
 if(p.noDrinks&&(DRINKS.includes(key)||key==='cigarro')){const food=snackPool();return food.length?pick(food):'codorna';}
 if(p.noAlcohol&&ALCOHOL.includes(key))return 'refri';
 if(p.lovesChopp&&DRINKS.includes(key)&&unlocked('cerveja')&&Math.random()<.85)return 'cerveja';
 return key;
}
// Reputação: sobe devagar com bom atendimento e cai rápido com descaso. O saldo do dia vai pro relatório.
function repChange(delta){if(!G||!delta)return;if(G.testMode){G.rep=100;return;}const before=G.rep;G.rep=clamp(round(G.rep+delta),0,100);if(G.stats)G.stats.repDelta=round((G.stats.repDelta||0)+G.rep-before);}
// A fama da bodega traz mais gente e gorjetas melhores (60 é o ponto neutro).
function repArrival(){return clamp(1.3-G.rep/200,.8,1.3);}
function repTips(){return clamp(.5+G.rep/120,.5,1.35);}
function drinksForGroup(g){return G.event.id==='campeonato'?alcoholPool():drinkPool();}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// Baralho espanhol de 40 cartas, usado no truco.
function deck(){const a=[];for(let s=0;s<4;s++)for(const r of [1,2,3,4,5,6,7,10,11,12])a.push({r,s,uid:`${s}-${r}`});return shuffle(a);}

// Só troca o HTML quando ele muda: evita recriar imagens e refazer o layout a cada atualização.
function setHTML(element,html){if(element._html===html)return false;element.innerHTML=html;element._html=html;return true;}
function cardName(c){return `${c.r} de ${['Espada','Paus','Ouro','Copas'][c.s]}`;}

function distRect(p,r){return Math.hypot(p.x-clamp(p.x,r.x,r.x+r.w),p.y-clamp(p.y,r.y,r.y+r.h));}

function itemLabel(i){return nameOf(i.pid||i.key)+(bulk(i.pid)?' · '+formatWeight(i.weight||bulk(i.pid).unit):'')+(i.spoiled?' · estragado':i.burned?' · queimado':i.kind==='ingredient'&&COOK[i.key]?(i.ready?' pronto':' cru'):'');}
