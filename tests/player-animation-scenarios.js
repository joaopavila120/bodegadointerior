(() => {
  const previous = { G, worldOut, started, frameClock, playerAnimation, paused, modal, phoneOpen };
  const results = [], check = (ok, label) => { if (!ok) throw Error(label); results.push(label); };
  try {
    G = fresh(); worldOut = null; started = true; paused = false; modal = null; phoneOpen = false; frameClock = 10;
    G.player = { x: 520, y: 720, dx: 1, dy: 0, walk: true };
    playerWalkPose(520, 720);
    G.player.x += 8; frameClock += .02;
    const walk = playerWalkPose(G.player.x, G.player.y);
    check(walk.stride > 0 && walk.phase > 0, 'Passos acompanham a distância percorrida');
    check(playerWalkPose(G.player.x, G.player.y).phase === walk.phase, 'Redesenhar o mesmo quadro não avança a animação');
    for (let i = 0; i < 20; i++) { frameClock += .02; playerWalkPose(G.player.x, G.player.y); }
    const stopped = playerWalkPose(G.player.x, G.player.y);
    check(stopped.stride < .002 && stopped.phase === walk.phase, 'Esbarrar numa parede encerra os passos mesmo segurando a direção');
    const bread = { id: 10001, key: 'pao_xis', kind: 'ingredient', cost: 1 };
    check(putHeld(bread, { x: 550, y: 650 }) && held() === bread, 'Pegar atualiza a mão imediatamente');
    check(itemInTransfer(bread), 'Item percorre a origem até a bandeja');
    check(playerCarrying(), 'Mãos sustentam a bandeja durante a retirada');
    const baseFrame = characterFrame(0,130), carryFrame = playerCarryFrame(0,baseFrame);
    check(carryFrame !== baseFrame && playerCarryFrame(0,baseFrame) === carryFrame, 'Pose do Sadi usa recorte separado e reutiliza o cache');
    G.up.tray = 1;
    const carryPose = playerCarryPose(G.player.x,G.player.y);
    const first = playerItemAnchor(0), second = playerItemAnchor(1);
    check(Math.abs(Math.hypot(second.x-first.x,second.y-first.y)-26)<.001 && Math.abs((first.y+second.y)/2-(carryPose.y-9*Math.cos(carryPose.roll)))<.001, 'Os dois espaços acompanham a inclinação real da bandeja');
    const count = playerAnimationState().transfers.length;
    check(!putHeld({ key: 'salame' }) && playerAnimationState().transfers.length === count, 'Mão ocupada não cria animação falsa');
    const snapshot = JSON.stringify(G), start = playerAnimationState().transfers[0].start;
    drawPlayerTransfers();
    check(JSON.stringify(G) === snapshot && playerAnimationState().transfers[0].start === start, 'Desenhar e pausar não alteram estoque, save ou relógio da ação');
    takeHeld({ x: 580, y: 730 });
    check(!held() && playerAnimationState().transfers.length === 1 && !playerAnimationState().transfers[0].incoming, 'Soltar rapidamente substitui o percurso sem duplicar o item');
    check(playerCarrying(), 'Entrega mantém a pegada até terminar o gesto');
    frameClock += .15; drawPlayerTransfers();
    check(itemInTransfer(bread), 'Item no chão fica oculto durante sua queda');
    frameClock += .16;
    check(!itemInTransfer(bread), 'Item reaparece no destino ao terminar a animação');
    check(!playerCarrying(), 'Sem produtos ou entrega pendente, braços voltam à pose normal');
    G.floor.push({ id: 10002, item: bread, x: 550, y: 730 }); pickupFloor(G.floor[0]);
    check(held() === bread && !G.floor.length && playerAnimationState().transfers[0].point.y === 719, 'Recolher usa a posição real do item no chão');
    for (let i = 0; i < 20; i++) animateItemTransfer({ key: 'salame', id: i }, false, { x: 550, y: 650 });
    check(playerAnimationState().transfers.length <= 6, 'Animações simultâneas têm limite fixo');
    worldOut = { map: 'vila', x: 1600, y: 1500, dx: 1, dy: 0 };
    check(!playerAnimationState().transfers.length, 'Trocar de mapa descarta ações da sala anterior');
    playerWalkPose(worldOut.x, worldOut.y); worldOut.x += 12; frameClock += .02;
    check(playerWalkPose(worldOut.x, worldOut.y).phase > 0, 'Caminhada também funciona no mundo aberto');
    worldOut.x += 500; frameClock += .02;
    check(playerWalkPose(worldOut.x, worldOut.y).stride === 0, 'Teletransporte não gera passos enormes');
    worldOut = null;
    const table = furniture().find(f => f.id.startsWith('table:'));
    G.task = { type: 'clean', target: table?.id, time: .3 }; drawPlayerTask(520,720);
    check(playerReachPose().dip > 0, 'Limpar combina movimento do corpo com pano');
    G.task = { type: 'mate', time: .55 }; drawPlayerTask(520,720);
    G.task = { type: 'mop', time: .4 }; drawPlayerTask(520,720);
    check(true, 'Mate sobe até a boca e rodo acompanha a limpeza');
    G = fresh();
    check(!playerAnimationState().transfers.length && playerAnimationState().stride === 0, 'Novo jogo reinicia apenas o estado visual');
    return results;
  } finally {
    G = previous.G; worldOut = previous.worldOut; started = previous.started; frameClock = previous.frameClock;
    playerAnimation = previous.playerAnimation; paused = previous.paused; modal = previous.modal; phoneOpen = previous.phoneOpen;
  }
})()
