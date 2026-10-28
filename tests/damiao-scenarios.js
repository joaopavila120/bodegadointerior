(() => {
  const results = [], check = (ok, message) => { if (!ok) throw Error(message); results.push(message); };
  action('new'); sceneSkip(); closeDialog(true); skipWorldTalk();
  G.prologue.done = true; G.tutorial.complete = true; G.phase = 'prep'; G.day = 30;
  G.regions = { serra: true, sc: true }; G.valterQueue = []; G.teachQueue = [];
  G.missions = {}; for (const m of storyChapters()) if (m.chapter < 15) G.missions[m.id] = { status: 'done', day: 1 };
  started = true; paused = false; scene = null; talkState = null;
  const i = PEOPLE.findIndex(p => p.id === 'damiao'), p = PEOPLE[i];
  check(i === PEOPLE.length - 1 && !isSpecial(i) && !p.worldOnly, 'Damião é um freguês comum, sem reordenar os personagens antigos');
  check(visitorPool().includes(i) && minorPeople().includes(i), 'participa das visitas e das caminhadas comuns');
  check(customDialogues.damiao?.length === 16 && personalizedProse(i)?.id.startsWith('person:damiao:'), '16 falas do TXT disponíveis na bodega');
  const oldLines = customDialogues.damiao;
  customDialogues.damiao = [{ player: 'Buenas!', reply: 'Uma prosa nova, tchê.' }];
  worldOut = { map: 'vila', x: 500, y: 500 };
  worldTalk({ person: i, x: 500, y: 500 });
  check(JSON.stringify(rpgBoxes.worldTalk).includes('Uma prosa nova, tchê.'), 'edição manual substitui as falas na estrada');
  skipWorldTalk(); worldOut = null;
  delete customDialogues.damiao;
  check(WORLD_TALK.damiao.length === 16 && personalizedProse(i), 'falas padrão continuam disponíveis sem TXT');
  customDialogues.damiao = oldLines;

  const before = JSON.parse(JSON.stringify(G)); before.friends[0] = 37;
  for (const field of ['friends', 'regulars', 'talkCooldown', 'conversations', 'storyCursor']) before[field].pop();
  normalizeSave(before);
  check(before.friends[0] === 37 && before.friends[i] === 0 && before.regulars[i] === 0, 'save antigo mantém os valores e inicializa o novo morador');

  for (const map of ['vila', 'serra', 'sc']) {
    const M = WORLD_MAPS[map]; let seen = 0, first = 0;
    worldOut = { map, x: 100, y: 100, dx: 0, dy: 1, walk: false };
    for (let day = 2; day <= 180; day++) {
      G.day = day;
      if (minorsToday(M).includes(i)) { seen++; first ||= day; }
    }
    check(seen > 0 && seen < 179, 'aparece em dias variados no mapa ' + map);
    G.day = first; spawnWalkers(M);
    const w = worldWalkers.find(w => w.person === i);
    check(w && worldWalkers.filter(w => w.person === i).length === 1, 'encontro único e real no mapa ' + map);
    w.wait = 0; const x = w.x, y = w.y;
    frameClock += .1; walkersTick(.1);
    check(Math.hypot(w.x - x, w.y - y) > 0, 'anda pelas rotas do mapa ' + map);
    worldTalk(w);
    check(!$('worldTalkUI').classList.contains('hidden') && rpgBoxes.worldTalk.parts.some(part => part.name === 'Damião'), 'conversa acessível no mapa ' + map);
    skipWorldTalk();
  }

  worldOut = null; G.day = 30; G.phase = 'open';
  const group = spawnGroup({ person: i, size: 1 });
  check(group?.members.includes(i), 'Damião entra na bodega e faz pedido como os demais');
  check(!visitorAvailable(i) && !minorPeople().includes(i), 'não aparece duplicado na rua enquanto está na bodega');
  G.groups = []; G.tables.forEach(t => t.group = null);
  check(visitorAvailable(i) && minorPeople().includes(i), 'volta a poder passear após a visita');
  check(portraitHTML(i).includes('damiao-v1.png'), 'retrato usa a arte nova');
  check(personHeight(0, true) === 130 && personHeight(p.sprite, false) === 124, 'proporções da bodega preservadas');
  personDraw(p.sprite, 400, 400, false, false, -1, true);
  worldOut = { map: 'vila', x: 100, y: 100 };
  for (const [dx, dy, direction] of [[0, 1, 0], [1, 0, 1], [-1, 0, 1], [0, -1, 2]]) {
    secondaryTracks.length = 0;
    const spec = worldCharacterSpec(p.sprite, 500, 500, true, dx, dy);
    check(spec.index >= direction * 4 && spec.index < direction * 4 + 4 && spec.height === 124, 'caminhada proporcional em ' + dx + ',' + dy);
    personDraw(p.sprite, 500, 500, true, false, dx, false, 0, dy);
  }
  check(worldCharacterSpec(p.sprite, 500, 500, false, -1, 0).index === 0 && SECONDARY_POSES.get(p.sprite).idle === 0, 'parado fica de frente, com os dois pés no chão');
  check(folkPortrait('lanceiro').includes('actions/lanceiro-v1.png'), 'retrato do Lanceiro acompanha o sprite corrigido');
  paused = true;
  return results;
})()
