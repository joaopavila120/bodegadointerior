// O jornal do Valter: a vila fica sabendo do que o Sadi anda fazendo.
//   · No dia seguinte a cada chefe grande vencido, com o Sadi dentro da bodega (de manhã, ou de portas abertas sem fila),
//     o Valter entra com o Jornal da Comunidade, mostra a primeira página e comenta. Uma edição por dia.
//   · Por três dias, os especiais comentam a notícia no balcão, e os fregueses que lêem o jornal falam disso quando são
//     atendidos. A notícia rende reputação e amizade com o Valter.
//   · Save antigo que já venceu vários chefes: só a vitória mais recente vira jornal (as outras contam como lidas).
'use strict';

const JORNAL_EDICOES = [
  { id: 'cachaco', feito: () => G.mata?.cachaco,
    manchete: 'Bodegueiro derruba javali do tamanho de um boi na mata da Serra',
    texto: 'Tropeiros contam que o Javali Cachaço, o terror dos pinheirais, caiu de facão. O autor da façanha atende no balcão da bodega do galpão e, segundo testemunhas, voltou pra abrir as portas no mesmo dia.',
    valter: [['valter', 'Meu pai caçou javali a vida inteira e nunca viu um desses. E tu me volta pra abrir a bodega como se nada fosse?'], ['sadi', 'O bicho era maior que carreta, Valter. Eu só não quis ficar de janta.'], ['valter', 'Vou pendurar a página do lado do caixa. Freguês vai querer ver.']],
    boca: ['Bah, o bodegueiro do javali!', 'É tu do jornal? O do Cachaço?', 'Li hoje cedo: que bicho, hein!'],
    reacao: { _: [['', 'Li no jornal que tu derrubou o Cachaço! É verdade que ele virava carreta?'], ['', 'Tu no jornal, Sadi! Agora quero ver quem é que vai dizer que bodegueiro não é valente.']],
      peixinhonabrasa: [['', 'Javali do tamanho de um boi e tu não trouxe nem uma costela pra minha brasa? Bah, que desperdício!']], indavirus: [['', 'Essa matéria era pra ser minha, tchê! Da próxima vez me chama antes de sair de facão.']] } },
  { id: 'papo', feito: () => G.mata?.papo,
    manchete: 'Lagarto gigante deixa de guardar a descida da Serra',
    texto: 'O papo-amarelo que, segundo os antigos, guardava o caminho pro mar, não foi mais visto na descida da mata. Mateiros já falam em reabrir a trilha das tropas até a restinga.',
    valter: [['valter', 'Minha vó dizia que o papo-amarelo guardava a descida desde antes dos jesuítas. E agora o caminho pro mar tá aberto por causa de um bodegueiro.'], ['sadi', 'Ele não queria deixar ninguém passar, Valter. Eu tinha pressa.'], ['valter', 'Pois a tropa vai voltar a descer por lá. E tropeiro com sede para em bodega.']],
    boca: ['Tu abriu a descida da Serra? Bah!', 'O lagarto do jornal! Era grande mesmo?', 'Minha vó vai querer te conhecer.'],
    reacao: { _: [['', 'O papo-amarelo! Minha vó dizia que ele guardava o caminho pro mar. E tu passou por ele?'], ['', 'Saiu no jornal que a descida da Serra abriu. Já tem mateiro falando em levar tropa até a restinga.']],
      badin: [['', 'Lá em Erechim saiu a mesma notícia, Sadi! A mãe recortou e botou na geladeira.']] } },
  { id: 'laguna', feito: () => G.mata?.laguna?.won,
    manchete: 'Navio fantasma some da barra de Laguna',
    texto: 'Pescadores de Laguna garantem: o navio do Império que rondava a barra toda noite afundou de vez, cercado de fogo. Quem estava lá fala num gaúcho de facão e num italiano de camisa vermelha.',
    valter: [['valter', '“Um gaúcho de facão e um italiano de camisa vermelha.” Sadi… tu e o fantasma do Garibaldi?'], ['sadi', 'O Giuseppe precisava acertar uma conta antiga. Eu fui junto.'], ['valter', 'Teu vô ia ter orgulho. Ele contava da Batalha de Laguna como se tivesse estado lá.']],
    boca: ['Tu e o Garibaldi em Laguna? Que história!', 'O navio fantasma afundou mesmo?', 'Meu primo pesca em Laguna e jurou que viu o fogo.'],
    reacao: { _: [['', 'Navio fantasma afundado em Laguna! Os pescadores de lá tão fazendo festa.'], ['', 'Um italiano de camisa vermelha, diz o jornal… Tu anda com cada companhia, Sadi.']],
      jayme: [['', 'Garibaldi, herói de dois mundos, e agora de mais um. Isso dá pajada das boas.']], peixinhonabrasa: [['', 'Barra de Laguna sem navio fantasma! Agora sim os peixes voltam pro meu trapiche.']] } },
  { id: 'mula', feito: () => typeof missionState === 'function' && missionState('mula')?.status === 'done' && missionState('mula').day,
    manchete: 'Moça desaparecida há sete anos volta pra casa na Serra',
    texto: 'A Doralice, sumida desde a noite de uma procissão, bateu à porta da igreja descalça e de vestido de festa. O Padre Romio agradece a um bodegueiro da Fronteira, mas não quis dar detalhes.',
    valter: [['valter', 'A Doralice! Sete anos sumida, Sadi. A família já tinha até rezado missa.'], ['sadi', 'Ela tá bem? O padre disse que tava na casa da mãe.'], ['valter', 'Tá. E diz que quer vir aqui te agradecer. Só não pede pra ela correr muito, que o povo ainda fala de um tropel.']],
    boca: ['Foi tu que trouxe a Doralice de volta?', 'A moça da Serra! Que coisa bonita.', 'O padre falou de ti na missa.'],
    reacao: { _: [['', 'A Doralice voltou pra casa! A Serra inteira tá falando disso.'], ['', 'O Padre Romio agradeceu um bodegueiro da Fronteira no jornal. Eu sei que foi tu, Sadi.']],
      manolima: [['', 'Eu ouvi o tropel aquela noite, vivente. Agora a Serra dorme em paz.']] } },
  { id: 'salamanca', feito: () => G.cave?.salamanca,
    manchete: 'Tremor e clarão vermelho no fundo da gruta da Serra',
    texto: 'Moradores relatam um estrondo debaixo da terra e um clarão vermelho saindo da gruta. O ferreiro da caverna, São Dunstano, diz apenas que “o que tava preso, agora tá livre”.',
    valter: [['valter', 'Clarão vermelho, estrondo debaixo da terra… E tu lá embaixo, aposto.'], ['sadi', 'Tinha uma moça presa numa gaiola de luz, Valter. A Teiniaguá. Agora ela tá livre.'], ['valter', 'A Salamanca do Jarau… Eu achava que era só livro de escola. Fecha a porta da gruta quando sair, vivente.']],
    boca: ['Tu viu o Diabo na gruta?', 'O clarão vermelho! Eu vi da janela.', 'Bah, a Salamanca do Jarau é de verdade?'],
    reacao: { _: [['', 'O chão tremeu a noite inteira lá na Serra. Dizem que foi coisa tua.'], ['', 'Clarão vermelho saindo da gruta, diz o jornal. Tu vai me contar ou não vai?']],
      mitodosul: [['', 'A Salamanca do Jarau no jornal! Eu sempre disse que as lendas são mais verdade que muita notícia.']] } },
  { id: 'bruxaMor', feito: () => G.ilha?.bruxaMor,
    manchete: 'A cerração da Ilha da Fortaleza começa a se abrir',
    texto: 'Barqueiros do Itajaí-Açu contam que a mata da ilha, sempre coberta de cerração, amanheceu clara pela primeira vez em décadas. Dizem que uma nuvem de mariposas saiu voando pro mar.',
    valter: [['valter', 'Uma nuvem de mariposas voando pro mar… O seu Nereu, o barqueiro, deu entrevista e tudo.'], ['sadi', 'Era a Bruxa-mor, Valter. Ela virou mariposa e foi embora rindo.'], ['valter', 'Rindo! Pois se ela voltar, tu já sabe o caminho.']],
    boca: ['Tu enfrentou bruxa na ilha?', 'Li que a cerração abriu. Foi tu?', 'Mariposa voando pro mar… que medo!'],
    reacao: { _: [['', 'A ilha da Fortaleza amanheceu sem cerração! O jornal diz que foi a primeira vez em décadas.'], ['', 'Bruxa na ilha, Sadi? Eu é que não piso naquele barco.']],
      loligebien: [['', 'Uma nuvem de mariposas saindo da ilha… Isso daria um vídeo lindo, se não fosse assustador.']] } },
  { id: 'bernunciaMae', feito: () => G.ilha?.bernunciaMae,
    manchete: 'Bicho gigante foge mata adentro na ilha',
    texto: 'O chão parou de tremer na subida da Ilha da Fortaleza. Pescadores falam numa bernúncia do tamanho de uma baleia, ferida, e num gaúcho que não arredou o pé.',
    valter: [['valter', 'Bernúncia do tamanho de uma baleia! No Boi de Mamão ela é de pano, Sadi.'], ['sadi', 'Essa não era de pano, Valter. Eu garanto.'], ['valter', 'Bueno, a subida pro alto da ilha tá livre, diz aqui. Vai com cuidado lá em cima.']],
    boca: ['A bernúncia era grande mesmo?', 'Tu não arredou o pé, diz o jornal!', 'Bah, que coragem, Sadi.'],
    reacao: { _: [['', 'O chão parou de tremer na ilha. Os pescadores tão chamando tu de “o gaúcho que não arredou o pé”.'], ['', 'Bernúncia de verdade! Eu achava que era só do Boi de Mamão.']] } },
  { id: 'grenfell', feito: () => G.ilha?.grenfell,
    manchete: 'Almirante do Império derrotado no alto da ilha',
    texto: 'A fortaleza da Ilha, ocupada pelos marinheiros que não baixaram a bandeira, caiu. O almirante Grenfell foi visto pela última vez na muralha. A cripta foi aberta, e o paradeiro do presidente Bento Gonçalves pode estar perto de ser revelado.',
    valter: [['valter', 'O almirante Grenfell! Sadi, isso é coisa de livro de história.'], ['sadi', 'Ele guardava a chave da cripta. Lá embaixo tinha uma pista do Bento.'], ['valter', 'Então tu vai atrás. Eu cuido da bodega, que freguês não espera.']],
    boca: ['Tu derrubou um almirante?!', 'A fortaleza caiu, diz o jornal!', 'E o Bento, Sadi? Acharam?'],
    reacao: { _: [['', 'A fortaleza da ilha caiu! E dizem que o Bento Gonçalves tá vivo em algum lugar.'], ['', 'Almirante do Império derrotado por bodegueiro. Bah, o Rio Grande inteiro vai ler isso.']],
      indavirus: [['', 'Eu tô montando uma edição especial só sobre a ilha. Tu me dá uma entrevista, Sadi?']] } },
  { id: 'sargento', feito: () => G.pampa?.sargento,
    manchete: 'Lanças dos Lanceiros Negros voltam pras mãos certas',
    texto: 'No Passo do Banhado, o Sargento Recolhedor, que tomava as lanças de quem passava pelo pampa, perdeu o duelo. As lanças voltaram pros lanceiros, que agora seguem rumo ao sul.',
    valter: [['valter', 'Os Lanceiros Negros… Pouca gente conta essa parte da história, Sadi. Que bom que tu ouviu.'], ['sadi', 'Eles me deram uma lança, Valter. Disseram que é pra quem não abaixa a cabeça.'], ['valter', 'Pois carrega com respeito. Essa lança pesa mais do que parece.']],
    boca: ['As lanças dos lanceiros! Que história bonita.', 'Tu enfrentou o Sargento Recolhedor?', 'Li no jornal: tu tá no pampa agora?'],
    reacao: { _: [['', 'O jornal falou dos Lanceiros Negros. Meu bisavô contava deles.'], ['', 'O Sargento Recolhedor perdeu as lanças pra ti! Bah, que duelo deve ter sido.']],
      baitaca: [['', 'Tô terminando a música dos Lanceiros Negros. Agora ela tem um verso novo: o do bodegueiro.']] } },
  { id: 'boi', feito: () => G.pampa?.boi,
    manchete: 'Boi Barroso volta pra mangueira de pedra',
    texto: 'O boi brabo da cantiga, que ninguém segurava, foi laçado e acalmado na mangueira de pedra. Peões do pampa já cantam a versão nova: “meu Boi Barroso, que eu já dava por perdido…”',
    valter: [['valter', '“Meu Boi Barroso, que eu já dava por perdido…” Tu laçou o boi da cantiga, Sadi!'], ['sadi', 'Laçar foi o fácil, Valter. Difícil foi ele não me levar junto.'], ['valter', 'Hoje à noite a gauchada canta essa aqui na bodega, pode escrever.']],
    boca: ['Meu Boi Barroso! Tu laçou ele?', 'O boi da cantiga existe mesmo?', 'Canta comigo: meu Boi Barroso…'],
    reacao: { _: [['', 'O Boi Barroso de verdade! A gauchada não fala de outra coisa.'], ['', 'Tu laçou o boi da cantiga? Agora quero aprender a laçar contigo.']],
      jayme: [['', '“Meu Boi Barroso, que eu já dava por perdido / deixando o rastro na barranca do rio…” Agora com o Sadi no laço!']] } },
  { id: 'capitao', feito: () => G.pampa?.capitao,
    manchete: 'Cavalaria imperial abre a cancela do pampa',
    texto: 'O capitão de cavalaria que fechava o caminho perto do palanque foi derrotado. A estrada pro Cerro de Porongos está livre, e dizem que lá o coronel Moringue espera.',
    valter: [['valter', 'O Moringue… Esse nome eu conheço das aulas, Sadi. Não é gente boa.'], ['sadi', 'Ele tá no Cerro de Porongos. E o Bento tá com ele.'], ['valter', 'Então vai, guri. Mas volta. A bodega precisa de ti mais que o jornal.']],
    boca: ['A cancela do pampa abriu!', 'Tu vai até Porongos?', 'Cuida-te, Sadi, que o Moringue é brabo.'],
    reacao: { _: [['', 'A estrada pra Porongos tá aberta, diz o jornal. Tu vai mesmo até lá?'], ['', 'Cavalaria do Império derrotada! Meu avô ia dar um grito de alegria.']] } },
  { id: 'moringue', feito: () => G.pampa?.moringue,
    manchete: 'Viva a República! Bandeira tremula no palanque do pampa',
    texto: 'Na madrugada da tempestade, no Cerro de Porongos, o coronel Moringue caiu num raio. O presidente Bento Gonçalves, livre, ergueu a bandeira no palanque. Os Lanceiros Negros, enfim, descansam em paz.',
    valter: [['valter', 'Sadi… primeira página inteira. “Viva a República!”'], ['valter', 'Eu te conheci servindo cigarro no balcão e errando o troco. Olha onde tu chegou.'], ['sadi', 'Eu ainda erro o troco, Valter.'], ['valter', 'Eu sei. Por isso eu gosto de ti. Agora abre essa bodega, que hoje vem gente até de Porongos.']],
    boca: ['Viva a República!', 'Tu viu o Bento erguer a bandeira?', 'O herói de Porongos no balcão!'],
    reacao: { _: [['', 'Viva a República, Sadi! O jornal diz que os Lanceiros enfim descansam em paz.'], ['', 'Primeira página inteira! Tu vai autografar meu jornal, Sadi.']],
      manolima: [['', 'Teu vô ia dizer: “o guri passou da conta”. E ia rir a noite inteira de orgulho.']], indavirus: [['', 'Edição histórica, Sadi. Guardei dez exemplares: um é teu.']] } }
];
const JORNAL_DIAS = 3;   // quantos dias a notícia rende prosa no balcão

function jornalState() {
  const st = G.jornal ??= { visto: {} }; st.visto ??= {};
  // Primeira vez (save antigo): só a vitória mais recente vira jornal.
  if (!st.iniciado) {
    st.iniciado = true;
    const feitas = JORNAL_EDICOES.map(e => ({ e, d: e.feito() })).filter(x => x.d);
    const ultima = feitas.sort((a, b) => b.d - a.d)[0];
    for (const x of feitas) if (x !== ultima) st.visto[x.e.id] = x.d;
  }
  return st;
}
function jornalPendente() { const st = jornalState(); return JORNAL_EDICOES.find(e => { const d = e.feito(); return d && !st.visto[e.id] && G.day > d; }) || null; }
function jornalDaHora() {
  if (!started || !G.missions || worldOut || paused || modal || scene || phoneOpen || G.dialogue || typeof storyCalm !== 'function' || !storyCalm()) return false;
  if (prologueActive?.() || tutorialActive?.()) return false;
  if (G.phase === 'open' ? G.shop.some(c => c.state !== 'leave') || G.groups.some(g => g.state === 'seated' && g.diners?.some(d => d.status === 'waiting')) : G.phase !== 'prep') return false;
  return jornalState().ultimoDia !== G.day;
}
// A notícia que a vila está comentando agora (até alguns dias depois do jornal).
function jornalNoticia() { const st = G.jornal; if (!st?.hoje) return null; if (G.day - st.hoje.day >= JORNAL_DIAS) return null; return JORNAL_EDICOES.find(e => e.id === st.hoje.id) || null; }

function jornalChega(E) {
  const st = jornalState(); st.visto[E.id] = G.day; st.ultimoDia = G.day; save();
  const meta = document.querySelector('#sceneNews .news-meta'), metaAntes = meta?.textContent;
  const fala = [['valter', pick(['Sadi! Tu tá no jornal, guri! Olha a primeira página!', 'Bah, Sadi, para tudo e olha o Jornal da Comunidade de hoje!', 'Bom dia, bodegueiro! Trouxe o jornal fresquinho. Adivinha quem tá na capa?'])]];
  const depois = () => { if (meta && metaAntes) meta.textContent = metaAntes; jornalDepois(E); };
  if (!scenesEnabled()) { talk([...fala, ['card', `<b>📰 ${E.manchete}</b><br>${E.texto}`, 'Jornal da Comunidade'], ...E.valter], depois, 'Bah!'); return; }
  playSteps([...sceneVisitor('valter'), ...fala.map(([say, text]) => ({ say, text })),
    { do: () => { if (meta) meta.textContent = 'Edição do dia ' + dayNumber() + ' · Notícias do interior'; } },
    { overlay: 'news', headline: E.manchete, body: E.texto },
    ...E.valter.map(([say, text]) => ({ say, text })), ...sceneVisitorLeaves('valter')], 'jornal-' + E.id, depois);
}
function jornalDepois(E) {
  const st = jornalState(); st.hoje = { id: E.id, day: G.day };
  repChange?.(2); const v = PEOPLE.findIndex(p => p.id === 'valter'); if (v >= 0) addFriendship?.(v, 4);
  floatNote('📰 A vila leu o jornal: +2 de reputação. Hoje a freguesia vai comentar.'); save(); refreshHUD();
}

// ---------- Ligações ----------
{
  const sim = simulate; simulate = function (dt, background = false) {
    sim(dt, background);
    if (!background && jornalDaHora()) { const E = jornalPendente(); if (E) jornalChega(E); }
  };
  // Os especiais comentam a notícia no balcão (uma vez cada um, por edição).
  const prose = nextProse; nextProse = function (person) {
    const E = jornalNoticia(), id = PEOPLE[person]?.id;
    if (E && id) {
      const st = jornalState(), quem = st.comentou ??= {}, ja = quem[E.id] ??= [];
      if (!ja.includes(id)) { const list = E.reacao[id] || E.reacao._; ja.push(id); const [player, reply] = pick(list); return { id: 'jornal:' + E.id, player, reply, title: '📰 O jornal de hoje' }; }
    }
    return prose(person);
  };
  // Os fregueses que leram o jornal falam disso quando são atendidos no balcão.
  const serve = serveShop; serveShop = function (c) {
    const antes = c && G.shop.includes(c) && c.state; const r = serve(c);
    const E = jornalNoticia(); if (E && c && antes && c.state !== antes && Math.random() < .3) effect(pick(E.boca), c.x, c.y - 96, '#fff0b8', 15);
    return r;
  };
}
