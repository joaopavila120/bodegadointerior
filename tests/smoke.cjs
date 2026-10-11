// Node 22+ e Chrome/Edge/Chromium instalado. Sem dependências de npm.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const browserPath = [process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].find(p => p && fs.existsSync(p));

async function waitUntil(check, message) {
  for (let i = 0; i < 150; i++) { try { if (await check()) return; } catch (error) { if (!/context.*destroyed|Cannot find context/i.test(error.message||'')) throw error; } await delay(100); }
  throw new Error(message);
}

async function main() {
  assert(browserPath, 'Instale Chrome/Edge ou defina BROWSER_PATH para o executável.');
  const entries = ['index.html', 'bodega-do-interior.html'];
  const scriptLists = entries.map(entry => {
    const html = fs.readFileSync(path.join(root, entry), 'utf8');
    const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
    for (const file of scripts) {
      const check = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
      assert.equal(check.status, 0, check.stderr);
    }
    return scripts;
  });
  assert.deepEqual(scriptLists[0], scriptLists[1], 'As duas entradas devem carregar os mesmos scripts.');
  assert.equal(scriptLists[0].at(-1), 'js/core/bootstrap.js');

  let blockedPath = null, dialogueOverride = null;
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg' };
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + pathname);
    if(pathname==='/dialogos.txt'&&dialogueOverride!==null){res.setHeader('Content-Type','text/plain; charset=utf-8');res.end(dialogueOverride);return;}
    if (pathname === blockedPath || !file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end('Arquivo ausente'); return;
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    const stream=fs.createReadStream(file);
    res.on('close',()=>stream.destroy());
    stream.pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bodega-smoke-'));
  const browser = spawn(browserPath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profile, 'about:blank'],
    { stdio: 'ignore', windowsHide: true });
  let ws, send;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    await waitUntil(() => fs.existsSync(portFile), 'O navegador não iniciou.');
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const pages = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
    ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
    const pending = new Map(), errors = [];
    let next = 0;
    ws.addEventListener('message', event => {
      const m = JSON.parse(event.data);
      if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p.reject(m.error); else p.resolve(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    });
    send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async expression => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    };
    const click = async selector => {
      const point = await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)throw Error('Botão indisponível');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
      await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
    };
    const key = async (k, duration = 0) => {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k===' '?'Space':'Key' + k.toUpperCase() });
      if (duration) await delay(duration);
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k===' '?'Space':'Key' + k.toUpperCase() });
    };
    const load = async url => {
      await send('Page.navigate', { url });
      await waitUntil(() => evaluate(`document.documentElement?.dataset.gameReady==='true'`), 'A bodega não ficou pronta: ' + url);
      await evaluate('window.NO_SCENES=true');
    };
    await send('Runtime.enable'); await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    for (const entry of entries) for (const protocol of ['file', 'http']) {
      await load(protocol === 'file' ? pathToFileURL(path.join(root, entry)).href : base + '/' + entry);
      assert(await evaluate(`G.day===1&&W===1600&&H===900&&canWalk(G.player.x,G.player.y)&&$('startLogo').naturalWidth>0`));
      assert(await evaluate(`[roomArt,peopleArt,furnitureArt].every(i=>i.complete&&i.naturalWidth>0)`));
      assert(await evaluate(`(lightGraphics?canvas.width===canvas.clientWidth:canvas.width>=canvas.clientWidth*1.49)&&camera.zoom===1`), 'Desktop inicia sem zoom com resolução interna maior');
      await evaluate(`action('zoomIn');draw()`);
      assert(await evaluate(`Math.abs(camera.zoom-1.2)<.01&&$('viewZoom').textContent==='120%'`), 'Controle de zoom amplia e atualiza a indicação');
      await evaluate(`action('zoomOut');draw()`);
      const itemArtResults = await evaluate(fs.readFileSync(path.join(__dirname, 'item-art-scenarios.js'), 'utf8'));
      assert(itemArtResults.length >= 50, 'Todos os itens têm sprites no cenário e na interface');
      const worldArtResults = await evaluate(fs.readFileSync(path.join(__dirname, 'world-art-scenarios.js'), 'utf8'));
      for (const result of worldArtResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
      const tourismResults = await evaluate(fs.readFileSync(path.join(__dirname, 'tourism-scenarios.js'), 'utf8'));
      for (const result of tourismResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
      const animationResults = await evaluate(fs.readFileSync(path.join(__dirname, 'player-animation-scenarios.js'), 'utf8'));
      for (const result of animationResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
      const penaltyResults = await evaluate(fs.readFileSync(path.join(__dirname, 'penalty-scenarios.js'), 'utf8'));
      for (const result of penaltyResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
      await evaluate('localStorage.clear()');
      await click('#start [data-act="new"]'); assert(await evaluate('scene?.id==="intro"&&document.body.classList.contains("intro-playing")'), 'Jogo novo começa com a introdução da história'); await click('#sceneSkip'); await click('#overlay [data-act="close"]');
      await waitUntil(() => evaluate('AudioEngine.tracks.every(t=>!t.audio.error&&t.audio.duration>0)'), 'As músicas externas não carregaram');
      const x = await evaluate('G.player.x'); await key('d', 160);
      assert(await evaluate('G.player.x') > x, 'Movimento real do teclado');
      await key('c'); assert(await evaluate('phoneOpen')); await key('c');
      await evaluate('save()');
      await load(protocol === 'file' ? pathToFileURL(path.join(root, entry)).href : base + '/' + entry);
      await click('#continue'); await click('#overlay [data-act="close"]');
      assert(await evaluate('started&&!G.testMode&&prologueActive()&&G.stock.pao_xis===0&&G.stock.erva===0&&hortaState().trees[0]?.crop==="erva"&&G.herd===1'), 'Jogo novo começa pelo prólogo da roça, com a bodega vazia');
      console.log('PASS iniciar, andar, abrir celular e continuar: ' + protocol + ' / ' + entry);
    }

    // O TXT é carregado automaticamente, também ao abrir o HTML sem servidor.
    await load(pathToFileURL(path.join(root, 'index.html')).href);
    await evaluate('localStorage.clear()');
    await click('#start [data-act="new"]');await click('#sceneSkip');await click('#overlay [data-act="close"]');
    assert(await evaluate('G.room===1&&!$("startingRooms")'));
    assert(await evaluate(`(()=>{const c=canvas.getBoundingClientRect(),s=$('gameSidebar').getBoundingClientRect();return c.right<=s.left+1;})()`));
    assert(await evaluate(`customDialogues.badin?.length>0&&!document.querySelector('[data-act="importDialogues"]')&&!$('dialogueFile')`));
    await evaluate(`localStorage.setItem('bodega-dialogues-txt',${JSON.stringify('[badin]\nAntiga | Fala antiga de teste')})`);
    await load(pathToFileURL(path.join(root, 'index.html')).href);
    assert(await evaluate(`customDialogues.badin.length>0&&customDialogues.badin[0].reply!=='Fala antiga de teste'&&readSave().room===1`));
    dialogueOverride='[badin]\nComo vai? | Fala nova editada no TXT';
    await load(base+'/index.html');assert(await evaluate(`nextProse(6).reply==='Fala nova editada no TXT'`));
    dialogueOverride=null;
    await load(base+'/index.html');assert(await evaluate(`nextProse(6).reply!=='Fala nova editada no TXT'`));
    assert(await evaluate(`(()=>{const acts=Object.entries(SPORT_ACTIONS).flatMap(([t,l])=>l.map(a=>t+'.'+a));return [...ALWAYS_TALK].every(id=>acts.every(a=>(customDialogues[id+'.'+a]||[]).length>=10));})()`),'Cada especial deve ter 10 falas por ação de bocha e truco');
    console.log('PASS cada especial tem pelo menos 10 falas em cada ação de bocha e truco');
    console.log('PASS TXT automático por file:// e HTTP, sem botão e sem cache de falas antigas');

    const sports = await evaluate(fs.readFileSync(path.join(__dirname, 'sports-scenarios.js'), 'utf8'));
    for (const result of sports) console.log('PASS ' + result);
    const dialogue = await evaluate(fs.readFileSync(path.join(__dirname, 'dialogue-scenarios.js'), 'utf8'));
    for (const result of dialogue) console.log('PASS ' + result);
    const tournament = await evaluate(fs.readFileSync(path.join(__dirname, 'tournament-scenarios.js'), 'utf8'));
    for (const result of tournament) console.log('PASS ' + result);
    const prologue = await evaluate(fs.readFileSync(path.join(__dirname, 'prologue-scenarios.js'), 'utf8'));
    for (const result of prologue) console.log('PASS ' + result);
    const missions = await evaluate(fs.readFileSync(path.join(__dirname, 'missions-scenarios.js'), 'utf8'));
    for (const result of missions) console.log('PASS ' + result);
    const tutorial = await evaluate(fs.readFileSync(path.join(__dirname, 'tutorial-scenarios.js'), 'utf8'));
    for (const result of tutorial) console.log('PASS ' + result);
    const interfaceReturns = await evaluate(fs.readFileSync(path.join(__dirname, 'interface-returns-scenarios.js'), 'utf8'));
    for (const result of interfaceReturns) console.log('PASS ' + result);
    const expanded = await evaluate(fs.readFileSync(path.join(__dirname, 'expansion-scenarios.js'), 'utf8'));
    for (const result of expanded) console.log('PASS ' + result);
    const social = await evaluate(fs.readFileSync(path.join(__dirname, 'social-scenarios.js'), 'utf8'));
    for (const result of social) console.log('PASS ' + result);
    const progression = await evaluate(fs.readFileSync(path.join(__dirname, 'progression-scenarios.js'), 'utf8'));
    for (const result of progression) console.log('PASS ' + result);
    const campo = await evaluate(fs.readFileSync(path.join(__dirname, 'campo-scenarios.js'), 'utf8'));
    for (const result of campo) console.log('PASS ' + result);
    const difficulty = await evaluate(fs.readFileSync(path.join(__dirname, 'difficulty-scenarios.js'), 'utf8'));
    for (const result of difficulty) console.log('PASS ' + result);
    await load(base + '/index.html');
    const gameplay = await evaluate(fs.readFileSync(path.join(__dirname, 'scenarios.js'), 'utf8'));
    for (const result of gameplay) console.log('PASS ' + result);
    // A interação final é feita pelo teclado real, após o teste preparar a mesa.
    await key('y'); assert.equal(await evaluate('modal'), 'cards');
    await evaluate(`$('trucoWager').value='25'`); await click('[data-act="startTruco"]');
    assert(await evaluate(`G.game?.wager===25&&modal==='game'`));
    const elapsed = await evaluate('G.elapsed'); await delay(250);
    assert.equal(await evaluate('G.elapsed'), elapsed);
    await evaluate(`finishTrucoHand(0,6);showCards()`);
    await click('[data-act="leaveCards"]');
    assert(await evaluate('!G.game&&!modal'));
    console.log('PASS Y, aposta, pausa durante o truco e retorno ao atendimento');

    const bocce=await evaluate(fs.readFileSync(path.join(__dirname,'bocce-scenarios.js'),'utf8'));
    for(const result of bocce)console.log('PASS '+result);
    const bx=await evaluate('G.bocce.playerX');await key('d',150);
    assert(await evaluate('G.bocce.playerX')>bx);
    await key('e');assert.equal(await evaluate('G.bocce.phase'),'power');
    await delay(500);await key('e');assert.equal(await evaluate('G.bocce.used[0]'),1);
    await evaluate('save()');await load(base+'/index.html');await click('#continue');
    assert(await evaluate(`G.bocce?.used[0]===1&&G.bocce.paused&&!$('bocceScreen').classList.contains('hidden')`));
    await click('#bocceConfirm');assert(await evaluate('!G.bocce.paused'));
    await evaluate('settleBocce(0)');await click('#bocceExit');await click('#overlay [data-act="close"]');
    assert(await evaluate(`!G.bocce&&G.phase==='closed'`));
    console.log('PASS teclado (E trava e lança), lançamento em duas etapas e retomada real da bocha após recarregar');

    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await evaluate(`enterCancha(true)`);
    await evaluate('G.contacts={...(G.contacts||{}),manolima:1}');await evaluate('canchaOptions()');await click('#overlay [data-act="bocce"]');await click('[data-act="startBocce"]');
    await waitUntil(()=>evaluate(`G.bocce.phase==='direction'`),'O bolim não chegou no celular');
    await click('#bocceConfirm');assert(await evaluate(`G.bocce.phase==='power'`));
    assert(await evaluate(`(()=>{const r=$('bocceConfirm').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})()`));
    await delay(300);await click('#bocceConfirm');assert(await evaluate('G.bocce.used[0]===1'));
    await evaluate('settleBocce(0)');await click('#bocceExit');assert(await evaluate('worldOut?.map==="cancha"'), 'Fim da partida volta para dentro da cancha');await click('#canchaExitButton');assert(await evaluate('worldOut?.map==="vila"'), 'Saída da cancha leva ao pátio');await evaluate('goInside()');
    await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
    console.log('PASS cancha e lançamentos por botões no celular');

    assert(await evaluate(`$('testModes').classList.contains('hidden')`), 'Modos de teste não aparecem na tela inicial normal');
    await evaluate('G.testMode=true;G.testRules=TEST_RULES;G.cash=0;save()');
    await send('Page.navigate', { url: base + '/teste/index.html' });
    await waitUntil(() => evaluate(`location.search==='?teste'&&document.documentElement?.dataset.gameReady==='true'`), 'O endereço /teste não abriu o jogo');
    await evaluate('window.NO_SCENES=true');
    assert(await evaluate(`!$('testModes').classList.contains('hidden')`), 'Pelo endereço /teste os modos de teste aparecem');
    await click('#start [data-act="test"]'); await click('#overlay [data-act="close"]');
    assert(await evaluate('G.testMode&&hasCash(999999)&&G.cash===0'));
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await load(base + '/index.html?teste');
    assert(await evaluate(`(()=>{const r=$('startLogo').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})()`));
    await click('#start [data-act="test"]'); await click('#overlay [data-act="close"]');
    assert(await evaluate(`(()=>{const r=$('interactButton').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})()`));
    console.log('PASS modo de testes, persistência e controles em tela móvel');
    assert.deepEqual(errors, [], 'Erros de execução no navegador');

    // Verifica diagnóstico de distribuição incompleta, sem alterar arquivos do projeto.
    blockedPath = '/js/mechanics/card-game.js';
    await send('Page.navigate', { url: base + '/index.html' });
    await waitUntil(() => evaluate(`document.documentElement?.dataset.gameReady==='error'`), 'Faltou diagnóstico de script ausente');
    assert(await evaluate(`$('startupStatus').textContent.includes('card-game.js')&&document.querySelector('#start [data-act="new"]').disabled`));
    blockedPath = '/assets/images/room2.webp';
    await send('Page.navigate', { url: base + '/index.html' });
    await waitUntil(() => evaluate(`document.documentElement?.dataset.gameReady==='error'`), 'Faltou diagnóstico de imagem ausente');
    assert(await evaluate(`$('startupStatus').textContent.includes('room2.webp')`));
    console.log('PASS arquivos ausentes mostram diagnóstico em vez de botões sem ação');
  } finally {
    if (send) { try { await Promise.race([send('Browser.close'),delay(2000)]); } catch (_) {} }
    ws?.close();
    if (browser.exitCode === null) await Promise.race([new Promise(resolve => browser.once('exit', resolve)), delay(3000)]);
    // No Windows, matar só o processo principal deixa filhos do Chrome vivos (inclusive o de áudio).
    if (browser.exitCode === null) { if (process.platform === 'win32') spawnSync('taskkill', ['/T', '/F', '/PID', String(browser.pid)], { stdio: 'ignore' }); else browser.kill(); }
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    // O perfil é exclusivo deste teste e fica estritamente dentro do diretório temporário.
    const absolute = path.resolve(profile), temp = path.resolve(os.tmpdir());
    if (absolute.startsWith(temp + path.sep) && path.basename(absolute).startsWith('bodega-smoke-')) {
      try {
        await fs.promises.rm(absolute, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (error) {
        // O Chrome no Windows pode manter um arquivo do perfil aberto após encerrar.
        if (!['EBUSY', 'ENOTEMPTY', 'EPERM'].includes(error.code)) throw error;
        console.warn('Perfil temporário ainda em uso pelo navegador: ' + absolute);
      }
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
