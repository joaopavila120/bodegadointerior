// Único ponto de inicialização. Os outros scripts apenas definem dados e funções.
'use strict';

function waitForImage(image, label) {
  return new Promise((resolve, reject) => {
    if (image.complete) {
      if (image.naturalWidth) resolve();
      else reject(new Error('Imagem ausente ou inválida: ' + label));
      return;
    }
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', () => reject(new Error('Não foi possível carregar: ' + label)), { once: true });
  });
}

async function initializeGame() {
  const status = $('startupStatus');
  try {
    if (window.bodegaLoadErrors.length) {
      throw new Error('Scripts ausentes: ' + window.bodegaLoadErrors.join(', '));
    }
    G = fresh();
    try {
      AudioEngine.on = localStorage.getItem('bodega-sound') !== 'false';
      AudioEngine.music = localStorage.getItem('bodega-music') !== 'false';
      AudioEngine.loadVolumes();
    } catch (_) { /* O modo sem persistência ainda permite jogar. */ }

    await Promise.all([
      bodegaArtReady,
      fishingArtReady,
      regionalIdentityReady,
      environmentArtReady,
      sadiArtLoaded,
      expansionArtLoaded,
      ...Object.entries(CAMPEIRA_ART).map(([key,image])=>waitForImage(image,'assets/images/campeira/'+key+'.png')),
      waitForImage(roomArt, ROOM_DATA),
      ...Object.entries(ITEM_ART).map(([key,image])=>waitForImage(image,"assets/images/items/"+key+".png")),
      waitForImage(peopleArt, PEOPLE_DATA),
      waitForImage(furnitureArt, FURNITURE_DATA),
      waitForImage(bocceArt, 'assets/images/bocha.webp'),
      waitForImage(penaltyBackgroundArt, PENALTY_BACKGROUND_DATA),
      waitForImage($('startLogo'), 'assets/images/logo.png'),
      ...DECOR.map(d=>waitForImage(DECOR_ART[d.id],'assets/images/decor/'+d.id+'.png')),
      waitForImage(rainWindowArt, RAIN_WINDOW_DATA),
      ...CAMPO_ART.map(([image,file])=>waitForImage(image,CAMPO_IMG+file)),
      ...Object.entries(CHARACTER_ART).map(([name,im])=>waitForImage(im,name+'.webp'))
    ]);

    await restoreDialogues();
    initializeCharacterChoice();
    refreshHUD();
    draw();
    $('continue').disabled = !readSave();
    document.querySelector('#start [data-act="new"]').disabled = false;
    // Modos de teste (dinheiro infinito, reputação sempre cheia e pular dias) só aparecem pelo endereço /teste
    // (que abre index.html?teste); quem só vai jogar não vê.
    $('testModes').classList.toggle('hidden', !/[?&#]testes?\b/.test(location.search + location.hash) && !/\/teste\/?$/.test(location.pathname));
    document.querySelector('#start [data-act="test"]').disabled = false;
    document.querySelector('#start [data-act="test2"]').disabled = false;
    document.querySelectorAll('#start [data-act="testNew"]').forEach(b => b.disabled = false);
    // Navegador sem aceleração de vídeo: o jogo roda em gráficos leves e avisa como ligar a aceleração.
    if (lightGraphics) { status.innerHTML = '<b>O navegador está sem aceleração de vídeo</b>, por isso o jogo pode ficar lento. Ative em Configurações → Sistema → “Usar aceleração de gráficos quando disponível” e reinicie o navegador.'; status.classList.add('gpu-warning'); }
    else status.classList.add('hidden');
    document.documentElement.dataset.gameReady = 'true';
    lastFrame = performance.now();
    requestAnimationFrame(frame);
  } catch (error) {
    console.error('Falha ao iniciar a bodega:', error);
    document.documentElement.dataset.gameReady = 'error';
    status.textContent = 'Não foi possível iniciar o jogo. ' + error.message + ' Mantenha as pastas js, css e assets junto do HTML e recarregue a página.';
  }
}

initializeGame();
