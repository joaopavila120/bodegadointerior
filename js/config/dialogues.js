// Falas padrão de reserva; para personalizar, edite dialogos.txt e recarregue o jogo.
'use strict';
const DEFAULT_DIALOGUES={
  "badin": [
  {"player": "E aí, Badin?", "reply": "Ô, buenas! Badin, o colono, direto da colônia de Erechim. Vim de carroça de luxo: a caminhonete do cunhado."},
  {"player": "Como começou essa fama?", "reply": "Gravei um áudio falando das coisas de Erechim, mandei no grupo da família e foi parar na rádio. Quando vi, tava sete minutos no ar!"},
  {"player": "Tu não era engenheiro?", "reply": "Era, rapaz! Engenheiro mecânico. Hoje só conserto o humor da colonada. Dá menos graxa e mais risada."},
  {"player": "Como tá a mãe?", "reply": "A mãe tá boa! Ligou três vezes pra saber se eu comi. Na quarta ligação já perguntou se eu tô namorando."},
  {"player": "Vai um xis?", "reply": "Vai, mas capricha! Colono não pede pouco: se sobrar, leva pra casa num pote de margarina."},
  {"player": "E a família?", "reply": "Família de colono é grande! Almoço de domingo começa com dez pessoas e termina com trinta, porque sempre chega mais um primo."},
  {"player": "Tem salame da colônia?", "reply": "Se não tiver, eu trago! Salame da nona é patrimônio da família. Corta fininho que rende mais."},
  {"player": "Já foi pra cidade grande?", "reply": "Fui, até virou filme: um colono na cidade! Lá ninguém dá bom dia pro vizinho. Eu dei bom dia pra prédio inteiro."},
  {"player": "Que história é essa da enchente?", "reply": "Quando o Rio Grande precisou, a colonada se juntou. Teve gente do Brasil inteiro ajudando. Coração de colono é grande, rapaz."},
  {"player": "Vai levar erva?", "reply": "Me pesa bem certinho! A mãe confere na balança da cozinha e, se faltar um grama, eu volto aqui."},
  {"player": "Mais um café?", "reply": "Bota! Café de colono tem que ser passado na hora, com cuca do lado. Café sem cuca é visita sem prosa."},
  {"player": "Qual o segredo do teu humor?", "reply": "É só contar como é a vida na colônia, sem desfazer de ninguém. A colonada se reconhece e ri junto."}
 ],
  "guri": [
  {"player": "E aí, Guri?", "reply": "Mas bah, tchê! Vim de Uruguaiana, da fronteira, só pra ver se o xis daqui é tão taura quanto falam."},
  {"player": "Como tá a fronteira?", "reply": "Tranquila! Atravessei a ponte pra Paso de los Libres, comprei uma erva e voltei. Só se fala de outra coisa!"},
  {"player": "Como tá Uruguaiana?", "reply": "Quente que nem chapa de xis, tchê! Lá o sol nasce já de bombacha."},
  {"player": "Vai um mate?", "reply": "Vai! Mas mate meu dura a tarde inteira, tchê. Separa a térmica grande."},
  {"player": "Vai um xis?", "reply": "Capricha, que gaudério da fronteira não come pouco. Bota tudo que tiver, que se faltar eu reclamo cantando!"},
  {"player": "Que música tu tá cantando?", "reply": "Uma paródia nova, tchê! Pego o sucesso do momento e boto bombacha nele. Até o Canto Alegretense entra no meio."},
  {"player": "Como foi o show?", "reply": "Theatro São Pedro lotado em Porto Alegre! Gaúcho rindo de gaúcho, que é o melhor tipo de riso que tem."},
  {"player": "Tu usa WhatsApp?", "reply": "Uso, mas no meu ritmo. Mando áudio de sete minutos e começo com bom dia, que educação vem antes da tecnologia."},
  {"player": "Mais um mate?", "reply": "Mas bah, sempre! Cuia bem cevada, água no ponto e conversa sem pressa. O resto é modernagem."},
  {"player": "Vai jogar truco?", "reply": "Truco com gaudério da fronteira é perigoso, tchê. Eu já peço o truco olhando pro horizonte, que é pra não entregar a carta."},
  {"player": "Tá pilchado hoje?", "reply": "Sempre! Boina, bigode e lenço no pescoço. Se tirar a boina, ninguém me reconhece."},
  {"player": "Qual a novidade?", "reply": "A novidade é que não tem novidade! Mas que falta de opção, tchê. Por isso vim pra bodega: aqui sempre tem causo."}
 ],
  "marcio": [
    {
      "player": "E o pedido, Márcio?",
      "reply": "É o quê? Show de bola! Manda um salame pra começar a conversa."
    },
    {
      "player": "O Marcelo vem junto?",
      "reply": "É o quê? Show de bola, vem sim! Só parou pra conversar com outro que também tava atrasado."
    },
    {
      "player": "Gostou do xis?",
      "reply": "É o quê? Show de bola! Esse merece replay antes da segunda mordida."
    },
    {
      "player": "Hoje veio sozinho?",
      "reply": "É o quê? Show de bola! Até sozinho eu guardo assunto pro Marcelo."
    },
    {
      "player": "Vai querer mais uma?",
      "reply": "É o quê? Show de bola! Mas primeiro deixa eu terminar de elogiar a anterior."
    },
    {
      "player": "Tudo certo por aí?",
      "reply": "É o quê? Show de bola! Se melhorar, vou ter que dividir com os amigos."
    },
    {
      "player": "Tem novidade?",
      "reply": "É o quê? Show de bola! Aprendi a chegar cedo, só ainda não botei em prática."
    },
    {
      "player": "E a partida?",
      "reply": "É o quê? Show de bola! Eu entendo mais do petisco do intervalo."
    }
  ],
  "marcelo": [
    {
      "player": "Bem-vindo, Marcelo!",
      "reply": "É o quê? Show de bola! Já pode separar uma cadeira e um causo."
    },
    {
      "player": "Márcio já pediu?",
      "reply": "É o quê? Show de bola! Se ele escolheu, eu elogio. Se faltar comida, eu complemento."
    },
    {
      "player": "O que achou da casa?",
      "reply": "É o quê? Show de bola! Aqui até o relógio devia parar pra prosear."
    },
    {
      "player": "Vai um refrigerante?",
      "reply": "É o quê? Show de bola! Gelado no ponto de arrepiar o bigode de quem tem."
    },
    {
      "player": "Hoje tá quieto?",
      "reply": "É o quê? Show de bola! Tô só juntando assunto pra próxima rodada."
    },
    {
      "player": "Vai de truco?",
      "reply": "É o quê? Show de bola! Minha estratégia é sorrir e torcer pela carta."
    },
    {
      "player": "Chegou sem o Márcio?",
      "reply": "É o quê? Show de bola! Hoje o causo é individual, mas amanhã a dupla volta."
    },
    {
      "player": "Mais salame?",
      "reply": "É o quê? Show de bola! A conversa ainda tem uns três pratos pela frente."
    }
  ],
  "gremio": [
    {
      "player": "Vai começar o jogo!",
      "reply": "Hoje eu só levanto dessa cadeira pra comemorar ou buscar petisco. Dá-lhe, Grêmio!"
    },
    {
      "player": "Tá nervoso?",
      "reply": "Nada! Só mexi o café umas quarenta vezes sem ter colocado açúcar."
    },
    {
      "player": "Vai um xis?",
      "reply": "Capricha no lanche que o placar eu deixo pro Tricolor!"
    },
    {
      "player": "Que lance foi esse?",
      "reply": "Eu vi gol, o juiz viu impedimento e minha caneca quase viu o chão."
    },
    {
      "player": "Como tá a torcida?",
      "reply": "A voz já foi embora no aquecimento. O otimismo continua aqui."
    },
    {
      "player": "Mais uma rodada?",
      "reply": "No intervalo, sim! Durante o jogo eu não largo nem o braço da cadeira."
    },
    {
      "player": "E a prosa hoje?",
      "reply": "Pode falar de tudo. Só não fica na frente da televisão, chê!"
    },
    {
      "player": "Tá boa a TV?",
      "reply": "Uma beleza! Agora consigo discordar do juiz em detalhes."
    }
  ],
  "inter": [
    {
      "player": "Preparado pro jogo?",
      "reply": "Colorado pronto! Já pedi o petisco pra não perder nenhum lance."
    },
    {
      "player": "Tá confiante?",
      "reply": "Confiança eu trouxe de casa. A calma eu esqueci no portão."
    },
    {
      "player": "Vai um trago?",
      "reply": "Depois desse lance, vai uma água primeiro que eu gritei até secar a garganta!"
    },
    {
      "player": "O que achou do primeiro tempo?",
      "reply": "Meu coração correu mais que os pontas. Vamos, Inter!"
    },
    {
      "player": "Sai mais um petisco?",
      "reply": "Sai! Pra cada escanteio eu pego um ovo de codorna em conserva. Hoje o prato tá sofrendo."
    },
    {
      "player": "Quem ganha hoje?",
      "reply": "O Inter, se depender de mim. Se depender do meu palpite, melhor não apostar."
    },
    {
      "player": "Como tá a imagem?",
      "reply": "Boa demais. Até a bola parece saber que a gente tá olhando."
    },
    {
      "player": "Tudo tranquilo na mesa?",
      "reply": "Tranquilo, chê. Posso discordar do gremista e dividir o salame. Só o último pedaço complica."
    }
  ],
  "dianho": [
  {"player": "E aí, quem é tu?", "reply": "É os guri! Dianho, gângster de galpão, direto de Santa Cruz do Sul. Tá todo Nicolas Cagezinho esse lugar!"},
  {"player": "Que história é essa de Nicolas Cagezinho?", "reply": "Era verão, eu tava bronzeado, de chapéu, cabelo penteado… me achei bonitão. Pronto: todo Nicolas Cagezinho!"},
  {"player": "Por que Dianho?", "reply": "No serviço da estrada eu não lembrava o nome de ninguém, chamava todo mundo de dianho. Aí o apelido voltou pra mim, hehehe."},
  {"player": "Me conta um causo da estrada.", "reply": "Uma vez chamei o chefe de dianho na frente da firma inteira. Desde então o dianho sou eu, hehehe."},
  {"player": "O que tu faz da vida?", "reply": "Reformo galpão, cuido da roça, viajo e filmo tudo. O povo gosta de ver o Dianho martelando torto, hehehe."},
  {"player": "E essa revoada?", "reply": "Revoada dos cupinxa, rapaz! Quando junta os guri tudo, é revoada. Ninguém segura."},
  {"player": "Tu é famoso mesmo?", "reply": "Sou ídolo na Irlanda do Norte! Lá eles não sabem quem eu sou, mas eu sei que sou ídolo, hehehe."},
  {"player": "Gostou da bodega?", "reply": "Galpão bonito assim dá até vontade de trocar uma tábua só por esporte. Tá todo Nicolas Cagezinho!"},
  {"player": "Como tá a roça?", "reply": "A roça tá linda! Plantei, reguei, filmei. Agora é só esperar o milho virar celebridade."},
  {"player": "Vai um xis?", "reply": "Vai! Capricha que o gângster de galpão tá com fome de reforma. E um refri, que é os guri!"}
  ],
  "mitodosul": [
  {"player": "Quem é tu?", "reply": "Mito do Sul, streamer! Gameplay de Farming Simulator, My Summer Car e o que o chat mandar. Manda um salve pra bodega!"},
  {"player": "Vai uma bebida?", "reply": "Não, valeu! Hoje é só comida. Bebida eu deixo pros personagens do jogo."},
  {"player": "Que jogo tu joga?", "reply": "Farming Simulator, principalmente. Já plantei mais soja virtual que muito produtor de verdade."},
  {"player": "E o My Summer Car?", "reply": "Ah, esse é sofrimento! Montar carro peça por peça e ver ele pegar fogo na primeira curva. O chat adora."},
  {"player": "Quando são as lives?", "reply": "Quarta, sexta e domingo, às 20h. Se tiver jogo do Grêmio, a live vira resenha."},
  {"player": "Tu é gremista?", "reply": "Gremista roxo… quer dizer, azul! O chat sabe: se o Grêmio ganha, a live vai até tarde."},
  {"player": "Gostou da bodega?", "reply": "Bah, daria um mapa ótimo pro Farming! Galpão, campo, curral… só falta o trator."},
  {"player": "Vai um xis?", "reply": "Vai! Xis é combustível de streamer. E capricha, que o chat tá olhando."},
  {"player": "O que o chat pediu hoje?", "reply": "Pediram pra eu comer um xis em live. Missão aceita!"},
  {"player": "Tu é mito mesmo?", "reply": "O nome é Mito do Sul, mas quem decide é o chat. Hoje eles tão me chamando de mito da bodega."}
  ],
  "loligebien": [
  {"player": "Quem é tu?", "reply": "Loli Gebien, o jovem alemão de Pomerode! Prosit! Me vê um chopp bem gelado, ja?"},
  {"player": "Que tamancos são esses?", "reply": "Tamancos de madeira, ja! Fiquei famoso na Festa do Imigrante em Timbó por causa deles. Fazem toc-toc bonito."},
  {"player": "Vai um chopp?", "reply": "Ja, ja! Um chopp. E depois outro chopp. E depois a gente vê, ja."},
  {"player": "Como tá Pomerode?", "reply": "A cidade mais alemã do Brasil! Lá até o cachorro late com sotaque, ja."},
  {"player": "Tu conhece o Indavírus?", "reply": "Ja! O Gustavo e o Lauro vivem lá em casa fazendo vídeo. O Lauro quebrou uma cadeira minha, ja."},
  {"player": "O que tu gosta de comer?", "reply": "Salsicha, chucrute, cuca… e xis! Xis com chopp é Gemütlichkeit, ja."},
  {"player": "O que é Gemütlichkeit?", "reply": "É aquele aconchego bom: mesa cheia, chopp gelado, amigo do lado. Igual tua bodega, ja."},
  {"player": "Tu trabalha com o quê?", "reply": "Já trabalhei no açougue! Sei cortar carne melhor que muito churrasqueiro, ja."},
  {"player": "Gostou da bodega?", "reply": "Ja! Só falta uma bandinha alemã e um barril de chopp maior. Prosit!"},
  {"player": "Mais um chopp?", "reply": "Ja, bitte! Chopp nunca é demais pra alemão de Santa Catarina."}
  ],
  "jayme": [
  {"player": "Quem é o senhor?", "reply": "Jayme Caetano Braun, pajador de Bossoroca. Não toco instrumento: o meu verso é a gaita que eu tenho."},
  {"player": "O que é payada?", "reply": "É verso de improviso, vivente, nascido na hora, cru como o vento do pampa e quente como o fogo de chão."},
  {"player": "Me fala um verso?", "reply": "“Neste galpão de madeira, onde o tempo fez morada, a bodega acordada tem prosa a noite inteira.”"},
  {"player": "De onde o senhor é?", "reply": "De Bossoroca, nas Missões. Terra de chão vermelho e gente que fala pouco e diz muito."},
  {"player": "O senhor fez rádio?", "reply": "Fiz, na Rádio Guaíba, muitos anos. O verso andava no ar e pousava em cada rancho do Rio Grande."},
  {"player": "Vai um mate?", "reply": "Mate sim, que o mate é o primeiro verso do dia. Amargo, pra não mentir o gosto."},
  {"player": "Gostou da bodega?", "reply": "Galpão que volta a ter gente é poema que a vida reescreve. Teu vô ia se orgulhar."},
  {"player": "O que é ser gaúcho?", "reply": "É carregar o pampa por dentro, mesmo longe dele. É ter querência até em pensamento."},
  {"player": "Vai um xis?", "reply": "Que venha! Até o pajador precisa de sustância pra rimar."},
  {"player": "O senhor tem pressa?", "reply": "Pajador não tem pressa, tem compasso. O verso chega na hora que o coração deixa."}
  ],
  "baitaca": [
  {"player": "Quem é o senhor?", "reply": "Baitaca, cantor do fundo da grota! Antônio César, criado no Rincão dos Pintos, lá em São Luiz Gonzaga."},
  {"player": "Por que Baitaca?", "reply": "Herdei do meu avô! Baitaca é parente da maitaca, aquele bicho que fala alto. Combina comigo, né?"},
  {"player": "O senhor toca gaita?", "reply": "Toco gaita, violão e o que tiver! Mas o que eu gosto mesmo é de cantar causo da campanha."},
  {"player": "Que música o senhor canta?", "reply": "“Do Fundo da Grota”, que fala da vida simples, do mato e da bicharada. O povo canta junto em tudo que é baile."},
  {"player": "Como começou?", "reply": "Com dez anos já cantava Gildo de Freitas. Com catorze ganhei trova em CTG, lá nas Missões."},
  {"player": "Vai um trago?", "reply": "Um traguinho de canha, só pra afinar a garganta. Cantor de campanha precisa da voz quente."},
  {"player": "Gostou da bodega?", "reply": "Bodega boa é igual baile bom: gente simples, prosa farta e ninguém com pressa."},
  {"player": "Me conta um causo?", "reply": "Lá no fundo da grota o galo canta antes do sol, e o sol, de vergonha, levanta correndo."},
  {"player": "Vai um xis?", "reply": "Vai! Mas faz caprichado, que gaúcho da campanha come que nem trabalha: com vontade."},
  {"player": "O senhor é famoso?", "reply": "Que nada, sou um gaúcho simples. A música é que anda mais longe que eu."}
  ],
  "gaudencio": [
  {"player": "Quem é o senhor?", "reply": "Gaudêncio, gaúcho bagual da campanha! Bombacha, bigode e paciência curta, tchê."},
  {"player": "De onde o senhor vem?", "reply": "Do interior, onde o galo acorda tarde porque o peão já levantou antes dele."},
  {"player": "Vai um trago?", "reply": "Vai uma canha, mas da boa! Canha fraca é igual cavalo manso: não serve pra nada."},
  {"player": "O senhor é tradicionalista?", "reply": "Mas é claro! Gaúcho que não toma mate de manhã cedo nem gaúcho é, é só alguém de bombacha."},
  {"player": "O que acha dos guri de hoje?", "reply": "Piá de hoje não sabe encilhar um cavalo, mas sabe trocar a senha do wi-fi. Mundo virado, tchê!"},
  {"player": "Me conta um causo?", "reply": "Uma vez laçaram um boi tão grande lá na invernada que o laço ficou com medo e voltou sozinho."},
  {"player": "Gostou da bodega?", "reply": "Bodega com galpão, chão batido e chimarrão? Isso sim é bodega de verdade, não essas modernagem."},
  {"player": "O senhor tá apressado?", "reply": "Apressado não, tô impaciente! É diferente. O apressado corre, o impaciente reclama."},
  {"player": "Vai um xis?", "reply": "Vai, mas não me inventa moda! Xis é xis: pão, carne, ovo e capricho."},
  {"player": "Como tá a lida?", "reply": "A lida tá braba! Mas gaúcho bagual não se queixa… só um pouquinho, enquanto toma o mate."}
  ],
  "valter": [
  {"player": "E aí, Valter?", "reply": "Buenas, guri! Passei pra ver se o filho do meu velho parceiro tá cuidando direito do galpão."},
  {"player": "O senhor conheceu meu pai?", "reply": "Se conheci! Nos criamos juntos, lidando com gado desde piá. Teu pai laçava melhor que eu, mas eu domava melhor."},
  {"player": "Como era meu pai na lida?", "reply": "Trabalhador que só! Acordava antes do galo e ainda reclamava que o galo era preguiçoso."},
  {"player": "E o meu vô?", "reply": "O velho Sadi era bom de causo e ruim de truco. Teu pai puxou o causo; tu, espero que não tenha puxado o truco."},
  {"player": "Vai um trago?", "reply": "Um traguinho de canha, que eu e teu pai sempre fechávamos a lida assim, no galpão."},
  {"player": "A TV tá ajudando?", "reply": "Tá! Mas nem me fala do último Gre-Nal. Colorado de coração sofre, mas não larga."},
  {"player": "O senhor ainda lida no campo?", "reply": "Lido sim! O corpo reclama, mas o campo chama. E de vez em quando eu dou uma olhada no teu rebanho."},
  {"player": "Gostou da bodega?", "reply": "Bah, se teu pai visse o galpão aceso de novo, ia chorar fingindo que era fumaça do fogo."},
  {"player": "Me conta um causo da lida?", "reply": "Uma vez teu pai e eu tropeamos uma boiada inteira na chuva. Chegamos tão molhados que o pasto achou que era açude."},
  {"player": "Vai um xis?", "reply": "Vai! Mas faz do jeito que tua mãe fazia o carreteiro: com carinho e sem pressa."}
  ]
};
