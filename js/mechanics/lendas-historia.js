// As lendas na linha principal da história: cada uma é um capítulo que termina na luta da clareira.
//   · Cap. 6 · As crinas trançadas (Sanguanel): a primeira missão do Badin, na Serra. Antes da luta, as adivinhas dele:
//     quem acerta luta contra ele atrapalhado (menos vida), mas a luta acontece de qualquer jeito.
//   · Cap. 9 · A moça que virou mula (lenda-mula.js), do Padre Romio.
//   · Cap. 10 · O filhote roubado (Anhangá): o Garibaldi pede ajuda com as arapucas dos caçadores no pinheiral.
//   · Cap. 12 · Fogo no campo (Boitatá): o Guri conta das queimadas na Fronteira. Os sinais mostram que quem bota fogo é
//     gente (um fazendeiro de fora), e o Boitatá, guardião dos campos, anda furioso no banhado.
//   · Cap. 14 · O ouro do Lauro (Teiniaguá): em Santa Catarina, o Lauro anda encantado. Antes da luta, as tentações
//     dela: quem recusa o ouro luta contra ela enfraquecida; quem aceita, contra ela mais forte.
//   · Cap. 20 · O lobisomem do arvoredo: perto do fim, a investigação das criações mortas na Fronteira, que termina numa
//     sexta à noite no arvoredo… e o lobisomem é o Mano Lima.
// Cada capítulo: o chamado → o causo de quem chama → os sinais pelo mapa → as conversas → o encontro (noite) → a luta →
// a volta pra contar. Perdeu? A lenda segue ali, toda noite, até o Sadi vencer. Sem seta: o quadro dá as dicas, os sinais
// brilham no chão e o jogador procura. Essas lendas não aparecem mais sorteadas de noite.
'use strict';

// A linha principal inteira, na ordem: os números dos capítulos saem daqui.
const STORY_ORDER = ['trago', 'fantasma', 'abertura', 'baia', 'conhecer', 'sanguanel', 'campeonato', 'sino', 'mula', 'anhanga', 'festa', 'boitata', 'indaial', 'teiniagua', 'reportagem', 'gaita', 'bau', 'carta', 'oktober', 'lobisomem', 'lendaria'];
const lendaNearCache = {};
function lendaNear(map, x, y) {
  const key = map + ':' + x + ':' + y; if (lendaNearCache[key]) return lendaNearCache[key]; const M = WORLD_MAPS[map];
  for (let r = 0; r < 520; r += 20) for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) { const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .7; if (M.canWalk(px, py)) return lendaNearCache[key] = { x: px, y: py }; }
  return lendaNearCache[key] = { x, y };
}
function mataTrailPoint(id, k) { const t = mataTrails().find(t => t.id === id); const p = t.pts[Math.floor((t.pts.length - 1) * k)]; return { x: p[0], y: p[1] }; }

const LENDA_ARCS = {
  sanguanel: {
    mission: { title: 'As crinas trançadas', giver: 'badin', where: 'Serra: a casa do Badin, as parreiras, a igreja e a vinícola',
      reward: { cash: 120, xp: 80, rep: 2, friend: { badin: 12 }, items: { salame: 4 } }, outroBy: 'badin',
      outro: [['badin', 'O guri do vizinho desceu da figueira sozinho hoje cedo, rindo à toa. E as crinas amanheceram soltas!'], ['badin', 'A nona mandou dizer que tu é o primeiro bodegueiro que ela respeita. Toma, salame da colônia, que é o melhor obrigado que tem aqui.']] },
    waitText: 'amanhã, depois de conhecer o Badin: ele manda chamar',
    call: ['📜 O Badin mandou chamar', 'Passe na casa de pedra dele, na Serra: tem coisa estranha na colônia'],
    story: [['badin', 'Bah, Sadi, ainda bem que tu veio! De noite tem alguém trançando a crina dos cavalos da colônia, tudo em nó de duende.'],
      ['badin', 'Esvaziaram uma pipa da cantina e o guri do vizinho amanheceu em cima da figueira, sem saber como subiu!'],
      ['badin', 'A nona diz que é o Sanguanel: um duende de barrete vermelho que veio da Itália junto com os nossos avós. Brincalhão, mas quando se irrita…'],
      ['badin', 'Procura os rastros dele pela Serra e pergunta pros vizinhos. Eu não durmo enquanto ele andar solto nas minhas parreiras.']],
    clues: [
      { id: 'crina', map: 'serra', base: [1120, 870], icon: '🐴', label: 'Um cavalo com a crina toda trançada', text: '<b>🧢 Rastro do Sanguanel · Crina trançada</b><br>A crina do cavalo do vizinho, toda em trancinhas miúdas, apertadas como só mão de duende faz. Nenhum peão desmancha sem tesoura.' },
      { id: 'barrete', map: 'serra', base: [300, 1720], icon: '🧢', label: 'Um barrete vermelho num galho alto', text: '<b>🧢 Rastro do Sanguanel · Barrete vermelho</b><br>Um barrete vermelho, pequeno como de criança, pendurado num galho alto demais pra qualquer guri alcançar. Cheira a vinho.' },
      { id: 'pipa', map: 'serra', base: [2690, 1900], icon: '🍷', label: 'Uma pipa de vinho furada', text: '<b>🧢 Rastro do Sanguanel · Pipa furada</b><br>Uma pipa de vinho com um furinho do tamanho de um dedo, e marquinhas de pé descalço pequenininho em volta. Do lado, cascas de nozes e uma risada desenhada no barro.' }],
    ask: [{ id: 'mitodosul', region: 'serra', lines: [['mitodosul', 'O Sanguanel? Meu vô falava dele! Duende dos colonos, de barrete vermelho. Faz arte, mas tem uma fraqueza: não resiste a uma adivinha.'], ['mitodosul', 'Desafia ele numa adivinha. Se tu acertar as dele, ele fica atrapalhado de raiva.']] },
      { id: 'dianho', region: 'serra', lines: [['dianho', 'Vi uma luzinha pulando nas parreiras do Badin, de madrugada. E ouvi uma risadinha fina: hihihi.'], ['dianho', 'É de noite que ele aparece, perto da casa de pedra. Vai lá, que eu é que não vou.']] }],
    askDone: '<b>🌙 De noite, nas parreiras do Badin</b><br>É lá que o Sanguanel apronta. Ele vai te desafiar nas adivinhas: acertando, ele fica atrapalhado na briga. Errando ou acertando, tu vai ter que enfrentar o duende.',
    encounter: { map: 'serra', base: [300, 880], when: () => worldNight(), label: 'Uma risadinha entre as parreiras…', waitText: () => 'De noite, nas parreiras do Badin (do lado da casa de pedra)' },
    prelude: 'adivinhas',
    win: '<b>🧢 O Sanguanel se rendeu</b><br>“Bravo, bodegheiro! Ninguém nunca me pegou!” Ele destrançou as crinas, devolveu o guri pro chão e deixou uma fita vermelha, que dizem que dá sorte.<br><br><i>Volta e conta pro Badin.</i>',
    lose: '<b>🧢 O Sanguanel sumiu rindo</b><br>“Hihihi!” Ele segue nas parreiras do Badin, toda noite. Cura com butiá ou pitanga, prepara o bornal e volta pra tentar de novo.',
    report: 'badin'
  },
  anhanga: {
    mission: { title: 'O filhote roubado', giver: 'garibaldi', where: 'Mata de Araucárias: o pinheiral do Garibaldi',
      reward: { cash: 160, xp: 100, rep: 3, items: { butia: 3 } }, outroBy: 'garibaldi',
      outro: [['garibaldi', 'O filhote voltou pra mãe, e os caçadores sumiram de medo. Fizeste o certo, gaúcho.'], ['garibaldi', 'Quem respeita a mata, a mata respeita de volta. Toma uns butiás do meu paiol.']] },
    waitText: 'no dia seguinte, o Garibaldi manda recado pela estrada',
    call: ['📜 O Garibaldi mandou recado', 'Vá até o refúgio dele, na Mata de Araucárias: caçadores no pinheiral'],
    story: [['garibaldi', 'Gaúcho, tem caçador armando arapuca no meu pinheiral. Não é caça pra comer: é pra vender, e pegaram até filhote de veado.'],
      ['garibaldi', 'E de noite um veado branco, de olhos de fogo, ronda o rancho, furioso. É o Anhangá, o guardião da caça. Ele protege os bichos de quem caça por maldade.'],
      ['garibaldi', 'Se ele achar que fomos nós… Desarma as arapucas e acha o filhote. E não briga pra ganhar: briga pra acalmar ele.']],
    clues: [
      { id: 'arapuca1', map: 'mata', at: () => mataTrailPoint('mirante', .45), icon: '🪤', label: 'Desarmar a arapuca', text: '<b>🦌 Arapuca desarmada · 1</b><br>Uma arapuca de taquara escondida no capim, com um nó de laço por dentro. O Sadi corta o laço com o facão.' },
      { id: 'arapuca2', map: 'mata', at: () => mataTrailPoint('sul', .3), icon: '🪤', label: 'Desarmar a arapuca', text: '<b>🦌 Arapuca desarmada · 2</b><br>Mais uma, perto do arroio, com isca de milho. Do lado, pegadas de bota e uma ponta de cigarro de palha.' },
      { id: 'arapuca3', map: 'mata', at: () => mataTrailPoint('leste', .35), icon: '🪤', label: 'Desarmar a arapuca', text: '<b>🦌 Arapuca desarmada · 3</b><br>A última, perto da araucária centenária. As pegadas de bota seguem pro leste, e dá pra ouvir um berro fininho: o filhote!' }],
    askDone: '<b>🌙 De noite, no fim da picada do leste</b><br>As pegadas levam até a jaula do filhote, perto da araucária centenária. O Anhangá vai estar por perto: acalma ele e solta o filhote.',
    encounter: { map: 'mata', at: () => mataTrailPoint('leste', .7), when: () => worldNight(), label: 'A jaula do filhote… e um veado branco entre as árvores', waitText: () => 'De noite, no fim da picada do leste do pinheiral (perto da araucária centenária)' },
    win: '<b>🦌 O Anhangá se acalmou</b><br>Ele baixou a galhada, cheirou o filhote e deixou tu abrir a jaula. O veadinho saiu pulando pro mato, onde a mãe esperava. No chão ficou uma galhada velha.<br><br><i>Volta e conta pro Garibaldi.</i>',
    lose: '<b>🦌 O Anhangá sumiu na neblina</b><br>Ele ainda ronda a jaula, toda noite. Prepara o bornal e volta pra acalmar ele.',
    report: 'garibaldi'
  },
  boitata: {
    mission: { title: 'Fogo no campo', giver: 'guri', where: 'Fronteira: os campos queimados e o banhado',
      reward: { cash: 180, xp: 110, rep: 3, friend: { guri: 15 } }, outroBy: 'guri',
      outro: [['guri', 'Bah, Sadi! O fazendeiro de fora foi embora da Fronteira de mala e cuia, depois que viu a cobra de fogo passar na frente da caminhonete dele.'], ['guri', 'E o campo já tá brotando de novo. Dizem que onde o Boitatá passa, a lavoura amanhece sem praga!']] },
    waitText: 'depois do baile: o Guri vem preocupado com o fogo no campo',
    call: ['📜 O Guri mandou chamar', 'Tão queimando o campo da Fronteira de noite: passe na casa dele'],
    story: [['guri', 'Sadi, tu viu o clarão de ontem de noite? Botaram fogo no campo de novo, perto do banhado!'],
      ['guri', 'Já é a terceira vez. E o povo diz que viu uma cobra de fogo correndo atrás das labaredas, furiosa, queimando ainda mais.'],
      ['guri', 'O vô dizia que é o Boitatá, o guardião dos campos: ele castiga quem bota fogo no mato. Se ele tá brabo assim, alguém tá provocando. Investiga pra mim?']],
    clues: [
      { id: 'queimada', map: 'vila', base: [1650, 1320], icon: '🔥', label: 'Um pedaço de campo queimado', text: '<b>🔥 Sinal do Boitatá · Campo queimado</b><br>O pasto queimado em roda, com um rastro de fogo serpenteando no meio, como se alguma coisa tivesse rastejado ali. O capim em volta ainda tá morno.' },
      { id: 'lata', map: 'vila', base: [960, 1330], icon: '🛢️', label: 'Uma lata de querosene escondida no capim', text: '<b>🔥 Sinal do Boitatá · Lata de querosene</b><br>Uma lata de querosene meio vazia, escondida no capim, e marcas de bota de cano alto. Fogo de cobra não precisa de querosene: isso aqui foi gente.' },
      { id: 'escama', map: 'vila', base: [700, 1180], icon: '✨', label: 'Uma escama dourada no barro', text: '<b>🔥 Sinal do Boitatá · Escama dourada</b><br>Uma escama dourada, quente como brasa, caída no barro perto do banhado. Contam que, depois do dilúvio, a cobra-grande comeu os olhos dos bichos mortos e ficou toda feita de luz.' }],
    ask: [{ id: 'manolima', region: 'vila', lines: [['manolima', 'O Boitatá? Bah, ele é o dono do fogo do campo, vivente. Não castiga quem planta: castiga quem queima.'], ['manolima', 'E não olha nos olhos dele, que tu fica zonzo. Se o capim pegar fogo, abafa com terra.']] },
      { id: 'valter', region: 'vila', lines: [['valter', 'Tem um fazendeiro de fora rondando a Fronteira, de caminhonete nova. Quer o campo limpo pra plantar soja, e já ofereceu dinheiro pra meio mundo.'], ['valter', 'Aposto que é ele que tá queimando. E o Boitatá, brabo do jeito que tá, vai acabar queimando tudo junto. Vai lá no banhado de noite, guri.']] }],
    askDone: '<b>🌙 De noite, no banhado da Fronteira</b><br>O fogo começa sempre perto do banhado, na beira do rio. De noite, o Boitatá vai estar lá, furioso. Enfrenta ele pra acalmar: o fazendeiro a gente resolve depois.',
    encounter: { map: 'vila', base: [780, 1000], when: () => worldNight(), label: 'Uma luz serpenteando no banhado…', waitText: () => 'De noite, no banhado da Fronteira (na beira do rio)' },
    win: '<b>🔥 O Boitatá se acalmou</b><br>A cobra de fogo deu uma volta no Sadi, olhou pro lado da estrada, onde uma caminhonete fugia de faróis apagados, e sumiu no banhado. No capim ficou uma escama dourada.<br><br><i>Volta e conta pro Guri.</i>',
    lose: '<b>🔥 O clarão te deixou zonzo</b><br>O Boitatá segue no banhado, toda noite. Cura, prepara o bornal e volta pra tentar de novo.',
    report: 'guri'
  },
  teiniagua: {
    mission: { title: 'O ouro do Lauro', giver: 'lauro', where: 'Santa Catarina: a casa do Lauro e a sanga dos fundos',
      reward: { cash: 200, xp: 120, rep: 3, friend: { lauro: 15 } }, outroBy: 'lauro',
      outro: [['lauro', 'Bah, Sadi… acordei como quem sai de um sonho comprido. A moça de olhos vermelhos, o ouro… nada disso era meu.'], ['lauro', 'O Gustavo disse que tu enfrentou a Teiniaguá na sanga. Te devo essa, parceiro.']] },
    waitText: 'logo depois de Indaial: o Gustavo manda recado sobre o Lauro',
    call: ['📜 O Gustavo mandou recado', 'O Lauro anda estranho: passe na casa dele, em Santa Catarina'],
    story: [['lauro', 'Ah, Sadi… tu viu a moça? Uma princesa, de olhos vermelhos como brasa. Ela me espera na sanga, toda noite.'],
      ['lauro', 'Olha o que ela me deu: onças de ouro, de verdade! Só que eu não durmo mais, e a mãe diz que eu falo sozinho…'],
      ['sadi', '(Olhos vermelhos, ouro, sanga… isso é coisa da Teiniaguá, a lagartixa encantada da Salamanca do Jarau!)'],
      ['sadi', 'Lauro, fica em casa hoje. Eu vou dar uma olhada nessa sanga.']],
    clues: [
      { id: 'moedas', map: 'sc', base: [520, 1730], icon: '🪙', label: 'Moedas antigas jogadas no chão', text: '<b>🦎 Sinal da Teiniaguá · Onças de ouro</b><br>Moedas de ouro antigas, de um tempo de reis, jogadas na frente da casa do Lauro. Frias como pedra de rio.' },
      { id: 'pegadas', map: 'sc', base: [720, 1860], icon: '🦎', label: 'Pegadas de lagartixa no barro', text: '<b>🦎 Sinal da Teiniaguá · Pegadas</b><br>Pegadinhas de lagartixa no barro da cancha, que vão e voltam da sanga. Cada uma deixa um pontinho chamuscado.' },
      { id: 'escama', map: 'sc', base: [1230, 1480], icon: '🔴', label: 'Uma escama vermelha brilhando', text: '<b>🦎 Sinal da Teiniaguá · Escama de rubi</b><br>Uma escama vermelha que brilha sozinha, como brasa. Dizem que é do carbúnculo, a pedra que a Teiniaguá tem na cabeça.' }],
    ask: [{ id: 'padre_romio', region: 'serra', lines: [['padre_romio', 'A Teiniaguá… Conheço o causo do sacristão da Salamanca do Jarau. Ele prendeu a lagartixa encantada e ganhou riqueza, mas perdeu tudo o que importava.'], ['padre_romio', 'Ela vai te oferecer ouro, amor e poder, meu filho. Não aceita nada. É assim que se quebra o encanto dela.']] },
      { id: 'peixinhonabrasa', region: 'sc', lines: [['peixinhonabrasa', 'Uma luz vermelha embaixo d\'água? Vi sim! Na sanga dos fundos da casa do Lauro, depois da meia-noite.'], ['peixinhonabrasa', 'Parecia um peixe de fogo, mas peixe não tem olho de gente. Vai lá de noite, mas leva coragem.']] }],
    askDone: '<b>🌙 De noite, na sanga dos fundos da casa do Lauro</b><br>A Teiniaguá vai te tentar antes da briga. Recusando o que ela oferece, ela fica fraca; aceitando, o encanto pega em ti também. A luta acontece de qualquer jeito.',
    encounter: { map: 'sc', base: [960, 1720], when: () => worldNight(), label: 'Uma luz vermelha na sanga…', waitText: () => 'De noite, na sanga dos fundos da casa do Lauro (Santa Catarina)', pool: true },
    prelude: 'provas',
    win: '<b>🦎 A Teiniaguá riu, faceira</b><br>“Igualzinho ao Blau Nunes: não quis nada.” O encanto que prendia o Lauro se desfez como névoa na sanga, e ela deixou uma lasca da pedra vermelha da cabeça.<br><br><i>Volta e conta pro Lauro.</i>',
    lose: '<b>🦎 A luz vermelha sumiu na sanga</b><br>Ela segue lá, toda noite, esperando o Lauro. Prepara o bornal e volta pra tentar de novo.',
    report: 'lauro'
  },
  lobisomem: {
    mission: { title: 'O lobisomem do arvoredo', giver: 'valter', where: 'Fronteira: o curral, o pouso de tropeiros e o arvoredo',
      reward: { cash: 300, xp: 160, rep: 5, friend: { manolima: 20 } }, outroBy: 'manolima',
      outro: [['manolima', 'Vivente… tu viu tudo, né? Desde guri eu carrego essa sina. Sétimo filho homem, e ninguém pra me batizar.'], ['manolima', 'A Baia sempre soube. Ela uivava na porta, me esperando voltar de manhã, com o poncho rasgado.'],
        ['sadi', 'Com a gota de sangue da faca benta, o encanto quebrou, Mano. Ninguém mais precisa saber.'], ['manolima', 'Índio véio não esquece isso, Sadi. Enquanto eu tiver gaita e cuia, a tua bodega tem freguês.']] },
    waitText: 'quando a Fronteira inteira já conhece a bodega: o Valter vem preocupado',
    call: ['📜 O Valter quer falar contigo', 'Tão sumindo criação na Fronteira: ele te espera em casa'],
    story: [['valter', 'Sadi, a coisa tá feia. Sumiram galinhas do teu curral, ovelhas do vizinho apareceram mortas, e o cachorro do Jayme não voltou.'],
      ['valter', 'O povo da Fronteira já fala em lobisomem. E toda vez é sexta-feira de lua.'],
      ['valter', 'Eu não acredito nessas coisas… mas também não durmo mais. Investiga, guri: procura os rastros e pergunta por aí.']],
    clues: [
      { id: 'pegadas', map: 'vila', base: [870, 650], icon: '🐾', label: 'Pegadas enormes perto do curral', text: '<b>🐺 Rastro do lobisomem · Pegadas</b><br>Pegadas de cachorro, só que do tamanho de uma mão aberta. Vêm do lado do arvoredo e voltam pra lá.' },
      { id: 'pelo', map: 'vila', base: [2330, 1860], icon: '🐺', label: 'Um tufo de pelo preso na cerca', text: '<b>🐺 Rastro do lobisomem · Pelo cinza</b><br>Um tufo de pelo cinza e duro preso no arame da cerca do pouso de tropeiros. Tem cheiro de fumo de rolo… e de erva-mate.' },
      { id: 'poncho', map: 'vila', base: [1180, 2030], icon: '🧣', label: 'Um pedaço de poncho rasgado no arvoredo', text: '<b>🐺 Rastro do lobisomem · Poncho rasgado</b><br>Um pedaço de poncho rasgado, de lã grossa, caído entre as árvores do arvoredo. O Sadi já viu esse tecido em algum lugar…' }],
    ask: [{ id: 'baitaca', region: 'vila', lines: [['baitaca', 'Esse pano de poncho? Bah… só vi um igual nessa Fronteira toda. É o do Mano Lima.'], ['baitaca', 'Mas o Mano Lima é um santo, vivente. Não deve ser nada.']] },
      { id: 'jayme', region: 'vila', lines: [['jayme', 'Toda sexta de lua o Mano Lima some, e a Cadela Baia fica uivando sozinha na porta da casa dele.'], ['jayme', 'E ele mesmo me contou, uma vez, num baile: que é o sétimo filho homem da família dele.']] },
      { id: 'padre_romio', region: 'serra', lines: [['padre_romio', 'Sétimo filho homem, sem o irmão mais velho de padrinho… O povo diz que vira lobisomem nas sextas de lua.'], ['padre_romio', 'O encanto quebra com uma gota de sangue, de faca benta. Me dá o teu facão, meu filho, que eu benzo ele agora mesmo.'], ['card', '<b>✝️ Facão benzido</b><br>O Padre Romio benzeu o facão do vô. Uma gota de sangue com ele quebra o encanto.', 'Faca benta']] }],
    askDone: '<b>🌕 Sexta à noite, no arvoredo da Fronteira</b><br>As pegadas, o pelo e o poncho levam pro arvoredo, perto da casa do Mano Lima. Na sexta à noite, espera escondido por lá. Com o facão benzido.',
    encounter: { map: 'vila', base: [1260, 2020], when: () => worldNight() && calendar().weekday === 4, label: 'Alguém entrando no arvoredo…', waitText: () => calendar().weekday === 4 ? (worldNight() ? 'É hoje! Sexta à noite: vá pro arvoredo, perto da casa do Mano Lima' : 'Hoje é sexta: de noite, espere no arvoredo, perto da casa do Mano Lima') : 'Sexta à noite, no arvoredo, perto da casa do Mano Lima (falta' + ((4 - calendar().weekday + 7) % 7 > 1 ? 'm ' + (4 - calendar().weekday + 7) % 7 + ' dias' : ' 1 dia') + ')', grove: true },
    reveal: true,
    win: '<b>🐺 O lobisomem virou gente</b><br>No chão do arvoredo, ofegando, o Mano Lima. A gota de sangue da faca benta quebrou o encanto de uma vez.<br><br><i>Amanhã, passa na casa dele.</i>',
    lose: '<b>🐺 O lobisomem fugiu pro mato</b><br>Ele segue rondando o arvoredo, toda noite agora. Prepara o bornal e volta: o facão benzido ainda tá contigo.',
    report: 'manolima'
  }
};

// ---------- Estado e capítulos ----------
function lendaArc(id) { G.lendaArcs ??= {}; return G.lendaArcs[id] ??= { stage: null, clues: {}, asked: {} }; }
function lendaArcStage(id) { return G.lendaArcs?.[id]?.stage || null; }
function lendaArcMission(id) { return MISSIONS.find(m => m.id === id); }
for (const [id, d] of Object.entries(LENDA_ARCS)) {
  MISSIONS.push({ id, ...d.mission, when: () => false, waitText: () => d.waitText, goal: () => lendaArcGoal(id), done: () => false });
  FOLK[id].ok = () => false;   // não sai mais sorteada: é deste capítulo
}
{ const m = MISSIONS.find(x => x.id === 'mula'); if (m) { delete m.side; m.when = () => false; m.waitText = () => 'no dia seguinte ao sino: o Padre Romio manda chamar'; } }
STORY_ORDER.forEach((id, i) => { const m = MISSIONS.find(x => x.id === id); if (m) m.chapter = i + 1; });
function lendaArcEncounterAt(id) { const e = LENDA_ARCS[id].encounter; return e.at ? e.at() : lendaNear(e.map, ...e.base); }
function lendaArcClueAt(c) { return c.at ? c.at() : lendaNear(c.map, ...c.base); }
function lendaArcTonight(id) { const a = G.lendaArcs?.[id]; return !!a && a.stage === 'wait' && (a.retry || LENDA_ARCS[id].encounter.when()) && worldNight() && !prologueActive(); }
function lendaArcGoal(id) {
  const d = LENDA_ARCS[id], a = lendaArc(id), s = a.stage, check = (ok, t) => (ok ? '✔ ' : '') + t, giver = PEOPLE.find(p => p.id === d.mission.giver)?.name || 'Garibaldi';
  if (s === 'call') return d.call[1];
  if (s === 'clues') return 'Procure os sinais (' + d.clues.filter(c => a.clues[c.id]).length + '/' + d.clues.length + '): ' + d.clues.map(c => check(a.clues[c.id], c.label.toLowerCase())).join(' · ');
  if (s === 'ask') return 'Pergunte por aí: ' + d.ask.map(q => check(a.asked[q.id], PEOPLE.find(p => p.id === q.id)?.name || q.id)).join(' · ');
  if (s === 'wait') return !caveState().facao ? 'Antes, pegue o facão do vô, cravado na boca da gruta da Serra' : a.retry ? 'A lenda segue lá: volte pra tentar de novo · ' + d.encounter.waitText() : d.encounter.waitText();
  if (s === 'fight' || s === 'prelude') return 'Enfrente a lenda!';
  if (s === 'report') return 'Volte e conte pra quem te chamou (' + (PEOPLE.find(p => p.id === d.report)?.name || giver) + ')';
  return '';
}
function lendaArcStart(id) {
  const d = LENDA_ARCS[id]; Object.assign(lendaArc(id), { stage: 'call', clues: {}, asked: {}, retry: false }); G.missions[id] = { status: 'active', day: G.day }; save();
  showBanner('📖 Capítulo ' + lendaArcMission(id).chapter + ' · ' + d.mission.title, d.call[1], 'info', { world: true });
}
function lendaArcStory(id) {
  const d = LENDA_ARCS[id], m = lendaArcMission(id);
  talk([...d.story, ['dica', '<b>📖 Capítulo ' + m.chapter + ' · ' + m.title + '</b><br>Procure os sinais pelo mapa (eles brilham no chão) e depois pergunte por aí. O quadro no alto lembra onde procurar.<br><br>Recompensa:' + rewardHTML(m.reward), 'História · capítulo ' + m.chapter]],
    () => { lendaArc(id).stage = 'clues'; save(); }, 'Bora');
}
function lendaArcClue(id, cid) {
  const d = LENDA_ARCS[id], a = lendaArc(id); if (a.stage !== 'clues' || a.clues[cid]) return false;
  a.clues[cid] = G.day; save(); AudioEngine.caveGem?.(); const all = d.clues.every(c => a.clues[c.id]), c = d.clues.find(x => x.id === cid);
  const next = all ? (d.ask?.length ? [['dica', '<b>Agora, pergunte por aí</b><br>' + d.ask.map(q => PEOPLE.find(p => p.id === q.id)?.name).join(', ') + ' podem saber mais.', 'História']] : [['dica', d.askDone, 'História']]) : [];
  talk([['card', c.text, 'Sinal'], ...next], () => { if (all) { a.stage = d.ask?.length ? 'ask' : 'wait'; save(); } }, all ? 'Bora' : 'Guardar');
  return true;
}
function lendaArcAskPending(id, pid) { const a = G.lendaArcs?.[id]; return a?.stage === 'ask' && LENDA_ARCS[id].ask?.some(q => q.id === pid) && !a.asked[pid]; }
function lendaArcAsk(id, pid) {
  const d = LENDA_ARCS[id], a = lendaArc(id); if (!lendaArcAskPending(id, pid)) return false; a.asked[pid] = G.day; save(); const all = d.ask.every(q => a.asked[q.id]);
  talk([...d.ask.find(q => q.id === pid).lines, ...(all ? [['dica', d.askDone, 'História']] : [])], () => { if (all) { a.stage = 'wait'; save(); } }, all ? 'Entendi' : 'Valeu');
  return true;
}
// Quem a história precisa encontrar: o que chama, os que contam o causo e o que espera a notícia.
function lendaArcNeeds(pid) {
  for (const id of Object.keys(LENDA_ARCS)) {
    const s = lendaArcStage(id), d = LENDA_ARCS[id];
    if ((s === 'call' && d.mission.giver === pid) || (s === 'report' && d.report === pid) || lendaArcAskPending(id, pid)) return id;
  }
  return null;
}
function lendaArcTalk(pid) {
  const id = lendaArcNeeds(pid); if (!id) return false; const s = lendaArcStage(id), d = LENDA_ARCS[id];
  if (s === 'call') { lendaArcStory(id); return true; }
  if (s === 'report') { lendaArc(id).stage = 'done'; completeMission(lendaArcMission(id)); return true; }
  return lendaArcAsk(id, pid);
}
// ---------- O encontro e a luta ----------
function lendaArcMeet(id) {
  if (!caveState().facao) { floatNote('Sem o facão do vô não dá pra enfrentar a lenda: ele fica cravado na boca da gruta da Serra.'); AudioEngine.bad(); return; }
  const a = lendaArc(id), d = LENDA_ARCS[id]; a.stage = 'fight'; a.prelude = null; save();
  if (d.reveal && !a.revealed) { lobisomemReveal(); return; }
  if (d.reveal) { floatNote('🐺 Ele te viu de novo no arvoredo…'); lendaStart(id); return; }
  meetFolk(id);
}
// No arvoredo: o Mano Lima chega, pede pra Baia ir pra casa… e vira o lobisomem.
function lobisomemReveal() {
  const at = lendaArcEncounterAt('lobisomem'), wolf = (a, y) => { ctx.save(); ctx.globalAlpha = clamp(a.alpha ?? 1, 0, 1); drawFolk('lobisomem', a.x, y, a.dx); ctx.restore(); };
  const fade = (id, to) => ({ do: () => { const a = scene.actors[id], step = () => { if (!scene || scene.actors[id] !== a) return; a.alpha = clamp((a.alpha ?? 1) + (to ? .06 : -.06), 0, 1); if (to ? a.alpha < 1 : a.alpha > 0) setTimeout(step, 40); }; step(); } });
  playSteps([...sceneWorld({ map: 'vila', x: at.x, y: at.y - 40, night: .5 }),
    { actor: 'sadi', x: at.x - 280, y: at.y + 40, dx: 1 }, { actor: 'manolima', x: at.x + 320, y: at.y, dx: -1 }, { fade: 'in', time: .8 },
    { walk: 'manolima', to: { x: at.x + 40, y: at.y } },
    { say: 'manolima', text: 'De novo não… de novo não, meu Deus. Baia, vai pra casa, guria! Vai!' },
    { say: 'sadi', text: '(O Mano Lima? O que ele tá fazendo no arvoredo, essa hora da noite?)' },
    { actor: 'lobo', x: at.x + 40, y: at.y, dx: -1, alpha: 0, draw: wolf },
    { do: () => { AudioEngine.caveVoice?.([300, 520, 560, 360], 1.8, { formant: 900, q: 1.5, vol: .07, vib: 12, rate: 6 }); AudioEngine.ouch?.(); } },
    fade('manolima', false), fade('lobo', true), { wait: 1.4 },
    { say: 'sadi', text: 'Mano Lima…?! O lobisomem do arvoredo é tu!' }, { say: 'lobisomem', text: 'AUUUUUUU!' },
    { fade: 'out', time: .5 }], 'lobisomem-arvoredo', () => { lendaArc('lobisomem').revealed = true; save(); lendaStart('lobisomem'); });
}
function drawLendaClue(c) {
  const p = lendaArcClueAt(c), k = .5 + .5 * Math.sin(frameClock * 4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x, p.y - 10, 40, .22 + .1 * k, '255,220,140'); ctx.restore();
  txt(c.icon, p.x, p.y - 14, 26, '#fff', 'center'); ctx.globalAlpha = .55 + .45 * k; txt('✦', p.x + 16, p.y - 52 + Math.sin(frameClock * 3) * 4, 16 + 4 * k, '#ffd27a', 'center'); ctx.globalAlpha = 1;
}
function drawLendaEncounter(id) {
  const e = LENDA_ARCS[id].encounter, p = lendaArcEncounterAt(id), t = frameClock;
  if (e.pool) { ellipse(p.x, p.y + 30, 110, 36, '#1d3a4a'); ellipse(p.x, p.y + 28, 94, 28, '#2a5a6a'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x, p.y + 20, 90, .35 + .1 * Math.sin(t * 3), '255,60,50'); ctx.restore(); }
  if (e.grove) { for (const [ox, oy, s] of [[-150, -30, 1.1], [120, -50, 1], [-40, -110, 1.25], [190, 30, .9]]) worldTreeSprite?.(0, p.x + ox, p.y + oy, 240 * s, 300 * s, 1); }
  if (id === 'lobisomem' && !lendaArc(id).revealed) { txt('…', p.x + 60, p.y - 120, 30, '#f0e6cc', 'center'); return; }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x, p.y - 80, 110, .25 + .08 * Math.sin(t * 5), id === 'teiniagua' ? '255,70,60' : '200,220,255'); ctx.restore();
  drawFolk(id, p.x + Math.sin(t * .7) * 20, p.y, Math.sin(t * .4) > 0 ? 1 : -1);
}

// ---------- Ligações ----------
{
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (!G.missions) return;
    for (const id of Object.keys(LENDA_ARCS)) {
      const a = G.lendaArcs?.[id];
      if (a && ['fight', 'prelude'].includes(a.stage) && !lendaFight && !scene && !modal && !G.folkQuiz && !G.salamanca) { a.stage = 'wait'; a.retry = true; save(); }
    }
    const ch = currentChapter(), prev = ch && STORY_ORDER[STORY_ORDER.indexOf(ch.id) - 1];
    if (ch && LENDA_ARCS[ch.id] && !missionState(ch.id) && !lendaArcStage(ch.id) && (!prev || G.day > (missionState(prev)?.day || 0)) && !prologueActive() && !tutorialActive() && storyCalm() && !worldTalkOpen()) lendaArcStart(ch.id);
  };
  // Conversas: quem chama, quem conta o causo e quem espera a notícia.
  const prosa = worldTalk; worldTalk = function (w) { if (lendaArcTalk(PEOPLE[w?.person]?.id)) { worldTalkAt = { x: w.x, y: w.y }; return; } return prosa(w); };
  const resident = houseResidentTalk; houseResidentTalk = function (i, x, y) { if (lendaArcTalk(PEOPLE[i]?.id)) return; return resident(i, x, y); };
  const gari = garibaldiTalk; garibaldiTalk = function () { if (lendaArcTalk('garibaldi')) return; return gari(); };
  const home = atHome; atHome = function (id) { return !!lendaArcNeeds(id) || home(id); };
  const chapel = romioAtChapel; romioAtChapel = function () { return lendaArcNeeds('padre_romio') === 'teiniagua' || lendaArcNeeds('padre_romio') === 'lobisomem' || chapel(); };
  // Os sinais e o encontro nos mapas.
  for (const map of ['serra', 'mata', 'sc', 'vila']) {
    const M = WORLD_MAPS[map], sp = M.spots, dr = M.draw;
    M.spots = function () {
      const list = sp.call(this);
      for (const [id, d] of Object.entries(LENDA_ARCS)) {
        const a = G.lendaArcs?.[id];
        if (a?.stage === 'clues') for (const c of d.clues) if (c.map === map && !a.clues[c.id]) list.push({ id: 'lenda:' + id + ':' + c.id, ...lendaArcClueAt(c), radius: 100, label: c.label, act: () => lendaArcClue(id, c.id) });
        if (d.encounter.map === map && lendaArcTonight(id)) list.push({ id: 'lenda:' + id, ...lendaArcEncounterAt(id), radius: 150, label: d.encounter.label, act: () => lendaArcMeet(id) });
      }
      return list;
    };
    M.draw = function (view, seen, layers) {
      dr.call(this, view, seen, layers); if (scene) return;
      for (const [id, d] of Object.entries(LENDA_ARCS)) {
        const a = G.lendaArcs?.[id];
        if (a?.stage === 'clues') for (const c of d.clues) if (c.map === map && !a.clues[c.id]) { const p = lendaArcClueAt(c); if (seen(p.x, p.y)) layers.push({ y: p.y, draw: () => drawLendaClue(c) }); }
        if (d.encounter.map === map && lendaArcTonight(id)) { const p = lendaArcEncounterAt(id); if (seen(p.x, p.y, 400)) layers.push({ y: p.y, draw: () => drawLendaEncounter(id) }); }
      }
    };
  }
  // Antes da luta, a prova: as adivinhas do Sanguanel e as tentações da Teiniaguá (a luta vem de qualquer jeito).
  const confront = folkConfront; folkConfront = function (id) {
    const a = G.lendaArcs?.[id], d = LENDA_ARCS[id];
    if (a?.stage === 'fight' && d?.prelude && a.prelude == null) {
      a.stage = 'prelude'; save();
      if (d.prelude === 'adivinhas') { G.folkQuiz = { n: 0, right: 0 }; folkQuestion(); } else { G.salamanca = { n: 0, right: 0 }; salamancaQuestion(); }
      return;
    }
    return confront(id);
  };
  const result = folkResult; folkResult = function (id, win) {
    const a = G.lendaArcs?.[id], d = LENDA_ARCS[id]; if (!a || !d) return result(id, win);
    if (a.stage === 'prelude') {
      a.prelude = !!win; a.stage = 'fight'; save();
      floatNote(id === 'sanguanel' ? (win ? '🧢 Acertou as adivinhas: o Sanguanel ficou atrapalhado de raiva!' : '🧢 Errou as adivinhas: ele ri e vem com tudo!') : (win ? '🦎 Recusou tudo: o encanto dela ficou fraco!' : '🦎 Aceitou o que ela ofereceu: o encanto pegou em ti também!'));
      lendaStart(id); return;
    }
    if (!['fight', 'wait'].includes(a.stage)) return result(id, win);
    const keepWin = FOLK_WIN[id], keepLose = FOLK_LOSE[id]; FOLK_WIN[id] = d.win; FOLK_LOSE[id] = d.lose;
    try { result(id, win); } finally { FOLK_WIN[id] = keepWin; FOLK_LOSE[id] = keepLose; }
    if (win) a.stage = 'report'; else { a.stage = 'wait'; a.retry = true; } save();
  };
  // O resultado da prova muda a força da lenda: acertou/recusou, ela vem fraca; aceitou o ouro, vem mais forte.
  const boss = lendaBoss; lendaBoss = function (id) {
    const b = boss(id), a = G.lendaArcs?.[id]; if (!a || a.prelude == null) return b;
    const k = id === 'sanguanel' ? (a.prelude ? .6 : 1) : id === 'teiniagua' ? (a.prelude ? .7 : 1.35) : 1;
    b.hp = b.max = Math.round(b.hp * k); return b;
  };
}
