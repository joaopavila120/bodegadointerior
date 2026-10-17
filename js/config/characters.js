'use strict';

// Recortes em coordenadas da arte original. Os PNGs fornecidos ficam intactos.
const CHARACTER_ART = {};
function characterSprite(file, crop, outline) {
  if (!CHARACTER_ART[file]) { const image = new Image(); image.src = 'assets/images/' + file + (file.startsWith('sadi-side-walk')?'.png':'.webp'); CHARACTER_ART[file] = image; }
  return { file, crop, outline };
}
const originalIds = ['lucia','anselmo','rosa','nair','valter','arlindo'];
PEOPLE.forEach((p,i) => p.id = originalIds[i]);
// O vizinho Valter, amigo de lida do pai do Sadi, é personagem especial com o próprio sprite.
Object.assign(PEOPLE.find(p=>p.id==='valter'),{name:'Valter',retailFav:'erva',fav:'cachaca',exclusiveVoice:true,origin:'O vizinho · amigo de lida do pai do Sadi, colorado de coração'});
const specialCharacters = [
  {id:'badin',name:'Badin',retailFav:'erva',fav:'cachaca',origin:'Badin, o Colono · humor da colônia italiana de Erechim',exclusiveVoice:true,sprite:characterSprite('badin',[260,130,510,1295],[[70,155],[70,110],[125,48],[220,5],[285,5],[362,27],[415,88],[422,208],[377,260],[330,285],[340,312],[440,345],[471,405],[505,531],[507,610],[479,707],[479,782],[442,806],[413,804],[451,929],[422,990],[428,1071],[425,1149],[461,1247],[456,1288],[365,1294],[345,1265],[326,1141],[312,1048],[278,1008],[234,883],[229,1064],[234,1180],[156,1225],[71,1235],[41,1216],[53,1181],[120,1138],[134,1106],[124,1010],[93,964],[73,902],[96,710],[116,617],[83,695],[89,747],[54,762],[24,738],[5,703],[32,634],[32,568],[42,530],[52,489],[87,424],[111,354],[172,307],[147,260],[104,222]])},
  {id:'guri',name:'Guri',retailFav:'codorna',fav:'cerveja',origin:'Guri de Uruguaiana · gaudério da fronteira',exclusiveVoice:true,sprite:characterSprite('guri',[200,90,625,1385],[[163,105],[201,41],[302,0],[362,2],[431,77],[438,144],[453,184],[438,230],[474,252],[541,295],[582,346],[613,442],[622,668],[609,719],[604,790],[567,826],[512,837],[495,809],[515,725],[501,685],[495,797],[555,996],[552,1050],[513,1104],[519,1223],[546,1305],[547,1370],[505,1381],[438,1364],[425,1327],[436,1245],[405,1130],[381,1087],[320,1011],[292,958],[292,1067],[281,1135],[299,1236],[278,1280],[230,1292],[143,1317],[78,1303],[75,1268],[158,1227],[170,1182],[161,1064],[112,1026],[91,981],[113,870],[148,736],[120,714],[96,741],[51,728],[30,704],[50,666],[29,642],[14,609],[19,574],[44,545],[19,502],[10,423],[7,326],[36,308],[11,320],[3,317],[9,299],[84,291],[103,213],[131,201],[111,251],[99,294],[134,294],[142,307],[123,328],[151,364],[157,333],[171,314],[168,302],[215,281],[179,263],[172,221]])},
  {id:'marcio',name:'Márcio',retailFav:'salame',fav:'cerveja',partner:'marcelo',sprite:characterSprite('marciomarcelo',[279,34,450,966],[[139,76],[155,25],[196,0],[244,15],[277,60],[286,130],[287,183],[312,194],[327,220],[337,214],[346,244],[368,280],[421,338],[422,372],[400,388],[353,375],[317,332],[353,496],[365,581],[374,690],[365,842],[423,868],[449,906],[431,923],[381,919],[322,903],[281,869],[279,771],[241,619],[211,602],[189,716],[151,848],[154,886],[130,939],[91,963],[53,948],[52,908],[76,857],[77,810],[69,795],[122,544],[100,445],[53,434],[4,405],[0,378],[21,332],[62,285],[99,235],[157,202],[165,174],[139,146]])},
  {id:'marcelo',name:'Marcelo',retailFav:'codorna',fav:'refri',partner:'marcio',sprite:characterSprite('marciomarcelo',[798,30,472,965],[[160,60],[182,23],[220,0],[272,19],[300,53],[307,116],[296,167],[273,200],[307,227],[365,256],[384,332],[422,355],[449,397],[445,443],[414,466],[378,452],[373,423],[371,545],[402,688],[401,816],[451,865],[470,910],[451,927],[387,922],[337,905],[310,884],[301,750],[271,625],[249,611],[210,753],[195,857],[197,900],[173,935],[139,961],[105,956],[85,935],[88,903],[110,866],[115,807],[109,772],[153,579],[152,516],[116,487],[83,476],[68,457],[30,440],[4,413],[0,382],[37,331],[64,269],[98,243],[159,221],[179,207],[168,178],[148,127]])}
];
PEOPLE.push(...specialCharacters);

// Os três arquivos de torcida possuem seis figuras cada, em duas linhas.
const fanCrops = [[180,20,240,490],[650,20,245,490],[1110,15,280,495],[170,515,265,485],[648,514,260,486],[1120,515,245,485]];
// A folha do Inter tem outro enquadramento e transparência própria.
// Preservar seu contorno completo, sem aplicar as máscaras da folha do Grêmio.
const interFanSprites = [
 [155,29,234,499],[603,33,265,502],[1058,25,266,509],
 [130,545,275,499],[609,535,257,509],[1085,542,230,500]
].map(crop=>characterSprite('inter',crop,[[0,0],[crop[2],0],[crop[2],crop[3]],[0,crop[3]]]));
const fanOutlines = [
 [[60,50],[82,17],[151,10],[179,48],[173,103],[213,136],[236,216],[225,243],[222,302],[202,329],[202,390],[184,421],[189,463],[164,482],[143,472],[139,423],[138,386],[114,366],[103,409],[73,449],[46,462],[30,444],[49,418],[70,393],[63,343],[49,304],[47,270],[33,290],[23,283],[22,260],[36,208],[36,173],[52,139],[80,116],[66,87]],
 [[60,45],[82,18],[129,17],[140,3],[168,8],[187,40],[181,117],[201,151],[208,217],[197,231],[211,272],[233,360],[243,380],[225,406],[213,433],[178,445],[175,471],[158,484],[143,475],[146,448],[124,445],[91,444],[73,465],[49,466],[48,453],[72,435],[53,425],[27,411],[10,383],[29,347],[40,317],[63,252],[50,282],[39,291],[31,280],[36,247],[44,221],[41,205],[56,151],[90,121],[66,108],[59,82]],
 [[23,63],[64,43],[85,12],[136,14],[178,36],[188,75],[218,83],[230,102],[204,113],[177,110],[176,144],[220,159],[240,212],[267,240],[267,309],[244,331],[218,313],[216,352],[199,391],[194,430],[198,470],[177,487],[156,484],[146,469],[149,421],[142,384],[123,365],[111,405],[106,430],[71,456],[42,460],[30,443],[46,421],[61,405],[57,365],[50,324],[50,299],[33,316],[24,307],[20,280],[29,242],[25,221],[39,166],[70,134],[82,112],[56,106],[27,85]],
 [[66,48],[104,12],[142,10],[174,24],[188,72],[198,113],[219,151],[218,174],[197,181],[213,204],[213,222],[221,256],[208,273],[220,330],[249,383],[252,400],[224,423],[191,445],[176,446],[179,471],[153,483],[137,471],[139,447],[111,440],[94,454],[66,466],[44,459],[53,443],[69,429],[48,427],[23,411],[7,391],[27,340],[54,267],[60,242],[49,266],[41,270],[35,254],[43,220],[54,197],[43,189],[42,171],[59,126],[74,119],[63,90]],
 [[29,38],[68,23],[87,6],[140,8],[169,23],[176,44],[204,65],[194,89],[161,100],[162,124],[190,135],[219,164],[239,208],[257,263],[253,316],[226,330],[201,311],[212,360],[191,402],[180,438],[181,474],[151,486],[132,474],[130,431],[123,391],[106,365],[100,408],[80,437],[42,454],[18,449],[12,429],[39,407],[54,393],[51,350],[45,304],[31,285],[26,251],[36,226],[42,175],[73,134],[88,111],[76,86],[46,75],[27,59]],
 [[40,51],[59,23],[92,9],[144,9],[171,28],[186,59],[177,84],[158,104],[160,128],[187,146],[208,187],[232,219],[229,242],[226,273],[221,306],[203,324],[183,312],[186,365],[174,402],[163,426],[162,469],[143,485],[119,479],[112,462],[118,425],[111,392],[96,368],[77,406],[65,437],[38,451],[15,449],[8,434],[30,406],[41,394],[37,365],[40,330],[48,289],[33,273],[30,250],[35,227],[45,206],[51,168],[75,139],[89,117],[74,90]]
];
// Contorno pr?prio das pernas do rapaz de boina (arquivos Gr?mio e Inter).
fanOutlines[5]=[[40,51],[59,23],[92,9],[144,9],[171,28],[186,59],[177,84],[158,104],[160,128],[187,146],[208,187],[232,219],[229,242],[226,273],[221,306],[203,324],[186,310],[208,365],[208,391],[187,408],[192,440],[211,458],[210,471],[190,481],[165,476],[143,461],[135,430],[124,387],[120,416],[105,435],[93,451],[65,469],[43,472],[37,457],[42,440],[66,413],[60,394],[44,379],[42,340],[48,289],[33,273],[30,250],[35,227],[45,206],[51,168],[75,139],[89,117],[74,90]];
for (const [file,team,names] of [
 ['gremio','gremio',['Tiago','Bia','Seu Dario','Clara','Nestor','Pedro']],
 ['gremio2','gremio',['Leandro','Marta','Seu Juca','Helena','Fábio','Ana']],
 ['inter','inter',['André','Cris','Seu Osvaldo','Vera','Renato','Lucas']]
]) for (let i=0;i<6;i++) PEOPLE.push({id:file+'_'+(i+1),name:names[i]+(team==='gremio'?' · gremista':' · colorado'),team,dialogueKey:team,retailFav:i%2?'erva':'cigarro',fav:i%2?'refri':'cerveja',sprite:file==='inter'?interFanSprites[i]:characterSprite(file,fanCrops[i],file==='gremio2'&&i===0?[[55,42],[75,33],[82,7],[118,2],[159,10],[178,42],[207,65],[214,80],[200,94],[173,102],...fanOutlines[0].slice(5)]:file==='gremio2'&&i===5?[[28,40],[70,25],[86,7],[145,8],[158,31],[182,50],[177,75],[143,88],[144,115],[165,133],[190,160],[206,206],[230,246],[225,285],[201,303],[196,340],[208,370],[199,394],[176,405],[161,410],[162,451],[153,473],[131,484],[111,477],[105,456],[111,421],[110,400],[94,399],[91,437],[83,452],[61,460],[48,454],[47,441],[64,422],[73,391],[54,380],[44,356],[50,296],[27,281],[17,251],[31,202],[47,154],[78,116],[77,90],[50,78],[25,59]]:fanOutlines[i])});

// Sem membro definido (saves antigos, vagas extras): usa só fregueses comuns, nunca um especial como o Valter.
let commonFallback = null;
function groupPerson(g, index) { const m = g.members?.[index]; if (m !== undefined && m !== null) return m; commonFallback ??= PEOPLE.map((p, i) => i).filter(i => !PEOPLE[i].unique && !PEOPLE[i].removed && !PEOPLE[i].team && !isSpecial(i)); return commonFallback[((g.person || 0) + index) % commonFallback.length]; }
function visitorPool(team = null) { return PEOPLE.map((p,i)=>i).filter(i => !PEOPLE[i].removed && !PEOPLE[i].worldOnly && (!team || PEOPLE[i].team === team)); }
function pickVisitor(extra=[]) {
 let team=['gremio','inter'].includes(G.event.id)?G.event.id:G.event.id==='grenal'?(Math.random()<.5?'gremio':'inter'):null;
 if(G.event.id==='grenal'&&['gremio','inter'].includes(G.event.result))team=G.event.result;
 // Todo dia entra um personagem especial, de preferência um que ainda não apareceu.
 const daily=dailySpecial(extra);if(daily!==null)return daily;
 let pool=visitorPool(team).filter(i=>visitorAvailable(i,extra));
 if(!team){const fans=Math.random()<.18;const subset=pool.filter(i=>fans?!!PEOPLE[i].team:!PEOPLE[i].team);if(subset.length)pool=subset;}
 // Personagens especiais são raros: aparecem em cerca de 12% das chegadas.
 const specials=pool.filter(i=>isSpecial(i)&&specialReady(i)),commons=pool.filter(i=>!isSpecial(i));
 if(specials.length&&(!commons.length||Math.random()<specialChance()))return pickByFriendship(specials);
 if(commons.length)pool=commons;
 return pool.length?pick(pool):null;
}

function groupMembers(person,size) {
 const result=[person],partner=PEOPLE.findIndex(p=>p.id===PEOPLE[person].partner);
 if(size>1&&partner>=0&&visitorAvailable(partner,result))result.push(partner);
 while(result.length<size){let next=pickVisitor(result);
  if(G.event.id==='grenal'&&result.length===1)next=pick(visitorPool(PEOPLE[person].team==='gremio'?'inter':'gremio'));
  if(next===null)break;result.push(next);
 }
 return result;
}
