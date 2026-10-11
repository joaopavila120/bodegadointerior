// Falas do mundo aberto: encontros na estrada, fora da bodega (as falas de balcão ficam em dialogues.js).
// Cada personagem pode prosear até 3 vezes por dia; cada prosa aumenta a amizade.
'use strict';

const WORLD_TALK = {
  valter: [
    { player: 'Bom dia, Valter! Saindo cedo?', reply: 'Fui ver a cerca do fundo, guri. Teu pai e eu fizemos ela com as próprias mãos, faz trinta anos.' },
    { player: 'E aí, vizinho, como tá o potreiro?', reply: 'Verde que dá gosto. Se faltar boi pro costelão, me avisa que eu te arrumo.' },
    { player: 'Vai passar na bodega hoje?', reply: 'Mais tarde. Quero ver se tu aprendeu a fazer o xis igual tua mãe fazia.' },
    { player: 'Que calor, hein, Valter?', reply: 'Calor é desculpa pra tomar tererê, que é coisa de paraguaio. Eu tomo chimarrão quente mesmo.' },
    { player: 'Tá com cara de quem tem causo pra contar.', reply: 'Teu vô uma vez atravessou o rio a cavalo pra buscar uma gaita. Voltou molhado e sem gaita.' }
  ],
  manolima: [
    { player: 'Buenas, Mano Lima!', reply: 'Buenas, vivente! Tô indo atrás de um parceiro pro truco de logo mais.' },
    { player: 'Treinando o truco na estrada?', reply: 'Truco não se treina, se sente. Igual o vento minuano: chega sem avisar.' },
    { player: 'E a gaita, Mano?', reply: 'Afinadinha. Se a bodega encher hoje, eu puxo uma vanera.' },
    { player: 'Vai chover, será?', reply: 'Quero-quero gritando de tarde é chuva na certa. Recolhe a roupa do varal.' },
    { player: 'Tá bonito o dia, hein?', reply: 'Dia bonito é dia de mate na sombra e prosa sem pressa. O resto é invenção da cidade.' }
  ],
  baitaca: [
    { player: 'Opa, Baitaca! Indo pra onde?', reply: 'Lá pras bandas das Missões, vivente. Tem baile no fim de semana e eu sou o cantor.' },
    { player: 'Canta um pedacinho aí!', reply: 'De graça não, que a voz é ferramenta de trabalho. Mas na bodega, com uma canha, quem sabe.' },
    { player: 'Bonita a tua bombacha.', reply: 'Foi a patroa que fez. Bombacha boa é a que aguenta tombo de cavalo e baile até de manhã.' },
    { player: 'Como tá a vida, Baitaca?', reply: 'Simples que nem rancho de barro: pouca coisa, mas tudo no lugar.' },
    { player: 'Viu o rio hoje?', reply: 'O Uruguai tá cheio. Esse rio já viu tropa, balsa e muito contrabandista passar.' }
  ],
  guri: [
    { player: 'E aí, Guri! Vindo da fronteira?', reply: 'Atravessei a ponte pra comprar erva do lado de lá. Castelhano vende mais barato, tchê!' },
    { player: 'Tudo certo lá em Uruguaiana?', reply: 'Tudo certo e tudo quente. Lá o sol frita ovo na calçada e ninguém reclama.' },
    { player: 'Qual a novidade, Guri?', reply: 'A novidade é que não tem novidade. Na fronteira o tempo anda devagar, que nem cusco velho.' },
    { player: 'Vai na bodega hoje?', reply: 'Vou sim. Guarda um xis caprichado que eu chego com fome de fronteira.' },
    { player: 'Bonito o cavalo ali, é teu?', reply: 'É do compadre. Eu só monto em cavalo que não tem pressa.' }
  ],
  badin: [
    { player: 'Bom dia, Badin!', reply: 'Bon giorno, Sadi! Tô vindo da roça. A uva esse ano tá doce que nem a nona.' },
    { player: 'Como tá a vindima?', reply: 'Trabalhosa! Mas a mãe diz que quem colhe uva com pressa faz vinho azedo.' },
    { player: 'O que tem pro almoço?', reply: 'Polenta, galeto e radicci. Na colônia, domingo sem galeto é pecado.' },
    { player: 'Vai pra Erechim hoje?', reply: 'Amanhã. Vou levar salame pro primo, mas metade some no caminho. Fome de viagem.' },
    { player: 'Bonita a casa de pedra.', reply: 'O nono que fez, pedra por pedra. Aguenta inverno, vento e as brigas da família.' }
  ],
  marcio: [
    { player: 'Fala, Márcio! E o Marcelo?', reply: 'Tá lá no campinho treinando falta. Ele acha que é titular da seleção.' },
    { player: 'Vai ter racha no domingo?', reply: 'Vai sim! Solteiros contra casados. Os casados sempre perdem, mas comem melhor depois.' },
    { player: 'Show de bola o campinho!', reply: 'Show de bola mesmo! A gente mesmo pintou as linhas. Tá meio torto, mas tem charme.' },
    { player: 'Bonita a Casona.', reply: 'Embaixo não tem nada, é só pilar. Em cima é nós dois e a bagunça dos dois.' }
  ],
  marcelo: [
    { player: 'Oi, Marcelo! Treinando?', reply: 'Treinando falta! Uma hora a bola entra no ângulo, nem que seja de raspão.' },
    { player: 'Cadê o Márcio?', reply: 'Deve tá dormindo na Casona. Gêmeo é igual, mas a preguiça é só dele.' },
    { player: 'Vai na bodega hoje?', reply: 'Vou! Me vê um refri gelado que futebol dá sede.' },
    { player: 'Quem é o melhor jogador, tu ou o Márcio?', reply: 'Eu, claro. Ele diz que é ele. Por isso a gente joga em times separados.' }
  ],
  gaudencio: [
    { player: 'Buenas, Gaudêncio!', reply: 'Buenas. Tô voltando do campo. Gado não espera ninguém acordar tarde.' },
    { player: 'Que pressa é essa?', reply: 'Pressa nenhuma. Gaúcho anda no passo do cavalo, nem mais rápido nem mais devagar.' },
    { player: 'Como tá a lida?', reply: 'Pesada, mas honesta. Mate cedo, campo o dia inteiro e um trago de noite.' },
    { player: 'Tá frio, hein?', reply: 'Frio é quando o minuano entra por baixo do poncho. Isso aí é só fresquinho.' },
    { player: 'Bonito o teu chapéu.', reply: 'É do tempo do meu pai. Chapéu bom não se compra, se herda.' }
  ],
  mitodosul: [
    { player: 'E aí, Mito! Gravando hoje?', reply: 'Live às oito! Hoje é colheita de soja no Farming Simulator. Passa lá no chat!' },
    { player: 'Viu o jogo do Grêmio?', reply: 'Vi e sofri! Mas gremista sofre e volta, que nem trator velho que pega no tranco.' },
    { player: 'Tu sabe dirigir trator de verdade?', reply: 'No jogo eu sou o maior fazendeiro do Sul. Na vida real, prefiro o controle.' },
    { player: 'Vai na bodega?', reply: 'Só se tiver xis salada! E nada de trago, que eu gravo de cabeça boa.' }
  ],
  dianho: [
    { player: 'Dianho! Que cara séria é essa?', reply: 'Cara de gângster de galpão, vivente. Mas fica tranquilo, hoje eu tô de folga.' },
    { player: 'Indo pra Santa Cruz?', reply: 'Lá é minha terra. Fumo, cuca e Oktoberfest. E os guri de lá são tudo cupinxa.' },
    { player: 'Tá precisando de alguma coisa?', reply: 'Um refri gelado e respeito na vizinhança. O resto eu me viro.' },
    { player: 'Como tá a vida?', reply: 'Tranquila. Galpão varrido, cavalo escovado e ninguém me devendo.' }
  ],
  lauro: [
    { player: 'Lauro Bolador! Treinando a mira?', reply: 'Todo dia, Sadi! Bocha é que nem pescaria: quem tem paciência leva.' },
    { player: 'Bonita tua canchinha.', reply: 'Pequena, mas honesta. Aqui eu treino antes de ir arrasar na tua cancha.' },
    { player: 'E o Indavírus, como tá?', reply: 'Escrevendo o jornal dele. Diz que vai me pôr na capa como maior boleador de Indaial.' },
    { player: 'Me ensina mais uma dica de bocha?', reply: 'Olha o bolim, não a bocha. A bocha vai sozinha se o olho estiver certo.' }
  ],
  indavirus: [
    { player: 'E aí, Indavírus! Novidade no jornal?', reply: 'Manchete de hoje: “Bodegueiro do Sul faz o melhor xis da região”. Exclusiva!' },
    { player: 'Tá escrevendo sobre o quê?', reply: 'Sobre a rivalidade entre a bocha do Rio Grande e o bolão de Santa Catarina. Polêmica!' },
    { player: 'O Lauro tá por aí?', reply: 'Tá na canchinha dele, mirando até em latinha. Esse aí não descansa.' },
    { player: 'Me dá uma notícia boa.', reply: 'A cuca da Festa Pomerana saiu do forno agora. Notícia quente!' }
  ],
  peixinhonabrasa: [
    { player: 'Peixinho! Tá assando o quê hoje?', reply: 'Um traíra na brasa, tchê! E uma Kaiser gelada pra acompanhar.' },
    { player: 'Qual o segredo do peixe?', reply: 'Brasa baixa, sal grosso e paciência. Peixe com pressa queima por fora e fica cru por dentro.' },
    { player: 'Saudade de Vera Cruz?', reply: 'Um pouco. Mas peixe na brasa é igual em qualquer lugar onde tenha amigo.' },
    { player: 'Vai passar na bodega?', reply: 'Vou! Me guarda um amendoim que eu levo a história de pescaria.' }
  ],
  loligebien: [
    { player: 'Guten Tag, Loli!', reply: 'Guten Tag! Tô indo pra Festa Pomerana. De tamanco e com sede de chope!' },
    { player: 'Bonito o enxaimel da tua casa.', reply: 'Foi o bisavô que montou, viga por viga. Aqui em Pomerode a gente cuida do que é velho.' },
    { player: 'Já foi na Osterbaum?', reply: 'Todo ano! Pintamos as casquinhas de ovo em família. Dá um trabalho, mas fica lindo.' },
    { player: 'Vai na bodega lá no Sul?', reply: 'Se tiver chope bem tirado, eu atravesso o estado de tamanco!' }
  ],
  jayme: [
    { player: 'Buenas, seu Jayme!', reply: 'Buenas, moço. Ando juntando versos pela estrada, que pajador não para.' },
    { player: 'Faz um verso pra mim?', reply: '“Bodega de chão batido, de mate e de prosa boa: quem entra por um sorriso, sai levando uma copla à toa.”' },
    { player: 'De onde vem tanta poesia?', reply: 'Da Bossoroca, do campo e do silêncio. O pampa ensina quem sabe escutar.' },
    { player: 'O que o senhor acha da vida?', reply: 'A vida é uma tropeada: o importante não é chegar ligeiro, é chegar com a tropa inteira.' }
  ]
};
// Depois das três prosas do dia, o personagem segue o caminho.
const WORLD_TALK_TIRED = ['Já proseamos bastante hoje, vivente. Amanhã tem mais!', 'Agora tenho que seguir caminho. Passa na bodega que a gente continua.', 'Bah, a prosa tá boa, mas o dia não espera. Até amanhã!'];

// Falas em casa: quando o Sadi visita alguém (diferentes das da estrada e das do balcão).
const WORLD_HOME_TALK = {
  valter: [
    { player: 'Com licença, Valter!', reply: 'Entra, guri, a casa é tua. Teu pai sentava nesse mesmo sofá pra ver o Inter perder.' },
    { player: 'Que cheiro bom é esse?', reply: 'Feijão no fogão a lenha. Panela de ferro, que nem a da tua vó.' },
    { player: 'Essa TV ainda funciona?', reply: 'Funciona quando dá um tapa do lado. Igual eu de manhã.' }
  ],
  manolima: [
    { player: 'Ô de casa, Mano Lima!', reply: 'Ô de fora! Entra e puxa uma cadeira, que a mesa de truco tá sempre posta.' },
    { player: 'Toca uma na gaita?', reply: 'Só uma vanerinha, que a vizinha reclama. Ela diz que gaita depois das dez é pecado.' },
    { player: 'Bonita a bandeira na parede.', reply: 'Foi do meu avô, lá do tempo do CTG. Bandeira do Rio Grande não se dobra, se pendura.' }
  ],
  baitaca: [
    { player: 'Buenas, Baitaca! Posso entrar?', reply: 'Entra, vivente. Rancho de barro, mas a porta é larga pra quem vem de coração aberto.' },
    { player: 'Tava ensaiando?', reply: 'Tava afinando a viola. Ela desafina quando chove, que nem eu.' },
    { player: 'Que lugar aconchegante.', reply: 'Fogão aceso, chimarrão pronto e o catre do lado. Precisa mais o quê?' }
  ],
  guri: [
    { player: 'Opa, Guri! Tá em casa hoje?', reply: 'Tô de folga da fronteira. Nem a ponte eu atravessei hoje.' },
    { player: 'Duas bandeiras na parede?', reply: 'Uma do Rio Grande e outra do Uruguai. Na fronteira a gente é meio dos dois lados.' },
    { player: 'Me serve um mate?', reply: 'Serve-se! Erva castelhana, forte que nem coice de mula.' }
  ],
  badin: [
    { player: 'Permesso, Badin!', reply: 'Avanti, Sadi! Entra que a nona deixou polenta no forno.' },
    { player: 'Quanto salame!', reply: 'Tá curando. Daqui a um mês eu levo pra bodega e tu vende pra gauchada.' },
    { player: 'Essas pipas são de vinho?', reply: 'Vinho da colônia, feito no pé. Mas não conta pra mãe que eu experimentei antes da hora.' }
  ],
  marcio: [
    { player: 'Bonita a Casona, Márcio!', reply: 'Bonita é pouco! Isso aqui é show de bola, top de linha, padrão Erechim.' },
    { player: 'Cadê a bola?', reply: 'Embaixo da cama baú. Tudo que some aqui tá embaixo da cama baú.' },
    { player: 'Muito troféu, hein?', reply: 'Metade é meu, metade é do Marcelo. A de melhor churrasco é minha, ele que não discuta.' }
  ],
  marcelo: [
    { player: 'E aí, Marcelo, de bobeira?', reply: 'Descansando pro racha. Atleta de várzea também precisa de sofá.' },
    { player: 'Que cozinha limpa!', reply: 'Limpa porque a gente só faz churrasco embaixo. Cozinha é só pra guardar refri.' },
    { player: 'O Márcio tá por aí?', reply: 'Tá sempre por aí. Gêmeo é igual sombra: não adianta fugir.' }
  ],
  gaudencio: [
    { player: 'Buenas, Gaudêncio. Incomodo?', reply: 'Gente de bem não incomoda. Senta aí que a chaleira tá no fogo.' },
    { player: 'Bonitos os arreios.', reply: 'Couro bom dura uma vida. O meu já durou duas: a do meu pai e a minha.' },
    { player: 'Rancho bem cuidado.', reply: 'Rancho é que nem cavalo: se não cuidar, ele te deixa a pé.' }
  ],
  mitodosul: [
    { player: 'E aí, Mito! Tá ao vivo?', reply: 'Tô em pausa, pode falar! O chat tá mandando um abraço pro bodegueiro.' },
    { player: 'Que setup, hein!', reply: 'Dois monitores: um pro jogo e outro pra ver o Grêmio. Prioridades.' },
    { player: 'Tu dorme quando?', reply: 'Quando a colheita do Farming termina. Ou seja: nunca.' }
  ],
  dianho: [
    { player: 'Dá licença, Dianho?', reply: 'Entra, mas limpa o pé. Gângster de galpão também tem tapete.' },
    { player: 'Só refri na geladeira?', reply: 'Só refri. Revoada dos cupinxa sem estoque de refri é crime, rapaz!' },
    { player: 'Bonito o quadro na parede.', reply: 'Foi presente dos guris de Santa Cruz. Respeito se ganha, não se compra.' }
  ],
  lauro: [
    { player: 'Seu Lauro, quanto troféu!', reply: 'Cada um com uma história. Esse do meio eu ganhei com a bocha emprestada!' },
    { player: 'Treinando dentro de casa?', reply: 'Só a mira, no tapete. A patroa não deixa jogar bocha na sala.' },
    { player: 'O senhor joga desde quando?', reply: 'Desde guri, em Indaial. Meu pai dizia: olho no bolim e paciência no braço.' }
  ],
  indavirus: [
    { player: 'Atrapalho a redação?', reply: 'Atrapalha nada! Tu é notícia. Senta que eu vou te entrevistar.' },
    { player: 'Quanto papel!', reply: 'Arquivo do Jornal Indavírus. Vinte anos de manchete, metade é sobre o Lauro.' },
    { player: 'Essa impressora funciona?', reply: 'Funciona com reza. Antes de imprimir eu acendo uma vela.' }
  ],
  peixinhonabrasa: [
    { player: 'Peixinho, tá em casa!', reply: 'Descansando entre uma pescaria e outra. Quer uma Kaiser?' },
    { player: 'Quantas varas de pesca!', reply: 'Uma pra traíra, uma pra jundiá e uma pra mentir que pegou dourado.' },
    { player: 'Cadê o peixe de hoje?', reply: 'Na caixa térmica, esperando a brasa. Peixe bom não espera muito.' }
  ],
  loligebien: [
    { player: 'Guten Tag, Loli! Posso entrar?', reply: 'Komm rein! Entra, entra. Tira o sapato, que o assoalho é do bisavô.' },
    { player: 'Um barril de chope em casa?', reply: 'Em Pomerode isso é móvel da sala. Igual o sofá.' },
    { player: 'Esses tamancos são teus?', reply: 'São de dançar na Festa Pomerana. Fazem um barulho bonito no salão.' }
  ],
  jayme: [
    { player: 'Seu Jayme, com licença.', reply: 'Entra, moço. A casa de um pajador é feita de livro, de mate e de silêncio.' },
    { player: 'Escrevendo um verso novo?', reply: '“O galpão guarda a memória, o fogo guarda o calor; quem chega de mão estendida leva da casa o melhor.”' },
    { player: 'Quanto livro!', reply: 'Cada livro é uma tropeada. A gente sai de um jeito e volta de outro.' }
  ]
};

// Personagens menores (sem casa): fregueses e torcedores que andam pelas ruas.
const MINOR_TALK = {
  all: [
    { player: 'Buenas!', reply: 'Buenas, bodegueiro! Dia bonito pra uma prosa, hein?' },
    { player: 'Tudo certo por aí?', reply: 'Tudo nos conformes. Só falta passar na tua bodega pra um xis caprichado.' },
    { player: 'Indo pra onde?', reply: 'Vou ali no Armazém buscar uma muda de bergamota. A minha secou na geada.' },
    { player: 'Que calorão, hein?', reply: 'Bah, nem me fala. Hoje é dia de mate gelado e sombra de umbu.' },
    { player: 'Passa na bodega hoje?', reply: 'Passo! Me guarda um maço e uma cerveja bem gelada, que eu chego de tarde.' },
    { player: 'Viu o Valter por aí?', reply: 'Vi sim, tava proseando na frente de casa. Esse aí conhece cada boi da Fronteira pelo nome.' },
    { player: 'E a lavoura?', reply: 'Choveu na hora certa. Se Deus quiser, a safra vem boa e eu pago o fiado em dia.' },
    { player: 'Bonito o dia!', reply: 'Céu de brigadeiro! Dia de laçar, de plantar e de tomar um trago no fim da tarde.' }
  ],
  gremio: [
    { player: 'E o Grêmio, hein?', reply: 'Tricolor imortal, tchê! Quarta tem jogo e eu vejo na TV da tua bodega.' },
    { player: 'Vai ver o jogo onde?', reply: 'Na bodega do Sadi, claro! Só peço uma coisa: TV no canal certo e cerveja gelada.' }
  ],
  inter: [
    { player: 'E o Inter, hein?', reply: 'Colorado de coração! Domingo tem jogo e eu quero ver com um xis na mão.' },
    { player: 'Vai ver o jogo onde?', reply: 'Na tua bodega, que lá tem TV e o Valter torce junto. Colorado é família!' }
  ]
};
// De visita em outra região: a resposta para "o que tu tá fazendo pelas bandas de cá?".
const WANDER_TALK = {
  vila: ['Desci pra Fronteira pra ver o rio Uruguai e tomar um mate na beira do trapiche.', 'Vim conhecer de perto a bodega do Sadi, que todo mundo comenta!', 'Vim atrás de erva da Fronteira. Moída grossa, do jeito que eu gosto.', 'Vim ver as ruínas das Missões. Coisa linda, vivente, dá até arrepio.'],
  serra: ['Subi a Serra pra provar o vinho da colônia e ver os parreirais.', 'Vim ver a Maria Fumaça passar. Apito de trem é música, tchê!', 'Vim comprar salame na colônia. O da nona do Badin não tem igual.', 'Vim pro baile do salão da comunidade. Galeto, cuca e vanerão!'],
  sc: ['Vim pra Pomerode ver as casas de enxaimel. Parece cartão-postal, ja!', 'Subi pra Santa Catarina atrás de cuca e de chope gelado.', 'Vim ver a canchinha do Lauro. Dizem que ele não erra uma bocha!', 'Vim passear no Vale Europeu. Tudo limpinho e florido, até dá vergonha da minha horta.']
};
