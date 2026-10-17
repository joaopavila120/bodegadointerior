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
    if(process.env.BODEGA_FOCUS==='roadsCave'){
      await load(base+'/index.html');
      const results=await evaluate(fs.readFileSync(path.join(__dirname,'road-cave-performance-scenarios.js'),'utf8'));
      console.log('PASS roads/cave: '+results.length+' checks');
      await evaluate(`G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.cave={facao:true,floor:11,deepest:11,hp:100,dunstanTaught:true,up:{}};started=true;paused=true;$('start').classList.add('hidden');goOutside();enterCave(11);closeDialog(true);draw();`);
      const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(os.tmpdir(),'bodega-cave-performance.png'),Buffer.from(shot.data,'base64'));
      assert.equal(errors.length,0,errors.join('\n'));return;
    }
    if(process.env.BODEGA_FOCUS==='cavePerf'){
      await load(base+'/index.html');
      console.log(JSON.stringify(await evaluate(`(()=>{
        const original={G,worldOut,ctx,caveRun};const results=[];
        try{G=fresh();G.day=5;G.prologue={done:true};G.cave={floor:10,up:{},hp:100};worldOut={map:'caverna',x:1000,y:800};
          const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=1000;ctx=canvas.getContext('2d');
          for(const floor of [10,11]){G.cave.floor=floor;caveRun=null;const run=caveFloorRun(),times=[];
            for(let frame=0;frame<9;frame++){const start=performance.now();ctx.clearRect(0,0,1440,1000);drawCaveFloor({x:0,y:0,w:1440,h:1000});
              for(let y=0;y<CAVE.rows;y++)for(let x=0;x<CAVE.cols;x++)if(run.grid[y][x])drawCaveWall(x,y,run);
              ctx.getImageData(0,0,1,1);if(frame)times.push(performance.now()-start);}
            times.sort((a,b)=>a-b);results.push({floor,medianMs:times[4],maxMs:times.at(-1)});}
          return results;
        }finally{({G,worldOut,ctx,caveRun}=original);}
      })()`)));return;
    }
    if(process.env.BODEGA_FOCUS==='caveLife'){
      await load(base+'/index.html');
      const results=await evaluate(fs.readFileSync(path.join(__dirname,'cave-life-scenarios.js'),'utf8'));
      console.log('PASS cave life: '+results.length+' checks');
      const art=await evaluate(`(()=>{
        const previous=ctx,c=document.createElement('canvas');c.width=1400;c.height=760;ctx=c.getContext('2d');rect(0,0,c.width,c.height,'#736c52');
        [...OKTO_VISITORS,...ROAD_RIDERS].forEach((p,i)=>{const h=i<2?124:195;txt(p.name,120+i*270,40,20,'#fff');expansionSprite(p.sheet,4,120+i*270,290,h,false,expansionRowHeight(p.sheet,0,12));});
        for(let i=0;i<8;i++)expansionSprite('saci-walk-v2',i,90+i*170,510,130,false,expansionRowHeight('saci-walk-v2',i<4?0:4,4));
        RIVER_FISH.forEach((f,i)=>{expansionSprite('uruguai-fish-v1',i,150+i*340,710,90);txt(f.name,150+i*340,740,18,'#fff');});
        ctx=previous;return c.toDataURL('image/png').split(',')[1];})()`);
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-cave-life-art.png'),Buffer.from(art,'base64'));
      await evaluate(`G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.cave={facao:true,floor:11,deepest:11,hp:100,dunstanTaught:true,up:{}};started=true;paused=true;$('start').classList.add('hidden');goOutside();enterCave(11);closeDialog(true);draw();`);
      for(const [file,expression] of [
        ['bodega-red-cave.png','draw();'],
        ['bodega-dunstan-trade.png',"enterCave(1);closeDialog(true);bagAdd('ametista',4);bagAdd('agata',2);dunstanShop();draw();"],
        ['bodega-cave-defeat.png',"closeDialog(true);enterCave(11);closeDialog(true);beginCaveDefeat();caveDefeatTick(2.5);draw();"]
      ]){await evaluate(expression);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(os.tmpdir(),file),Buffer.from(shot.data,'base64'));}
      await evaluate(`caveDefeatTick(5);closeDialog(true);document.body.insertAdjacentHTML('beforeend','<main id="newCardPreview" style="position:fixed;inset:0;z-index:1000010;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding:20px;background:#30271d">'+['badin','guri','manolima','lauro','teiniagua','onca','saci','dunstano'].map(id=>'<section style="position:relative;height:440px">'+cardFront(cardDef(id))+'</section>').join('')+'</main>')`);
      await waitUntil(()=>evaluate(`[...document.querySelectorAll('#newCardPreview img')].every(i=>i.complete&&i.naturalWidth>0)`),'Retratos das cartas não carregaram');
      const cards=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(os.tmpdir(),'bodega-new-cards.png'),Buffer.from(cards.data,'base64'));
      assert.equal(errors.length,0,errors.join('\n'));return;
    }
    if (process.env.BODEGA_FOCUS === 'missions') {
      await load(base+'/index.html');
      const results=await evaluate(fs.readFileSync(path.join(__dirname,'missions-scenarios.js'),'utf8'));
      console.log('PASS missions: '+results.length+' checks');
      assert.equal(errors.length,0,errors.join('\n'));return;
    }
    if (process.env.BODEGA_FOCUS === 'proportions') {
      await load(base + '/index.html');
      const preview=await evaluate(`(()=>{
        G=fresh();paused=true;worldOut=null;
        const previous=ctx,c=document.createElement('canvas');c.width=1100;c.height=850;ctx=c.getContext('2d');
        rect(0,0,c.width,c.height,'#725238');
        ['lucia','gremio_5','gremio_6','inter_6','gremio2_6'].forEach((id,row)=>{
          const p=PEOPLE.find(p=>p.id===id),a=SECONDARY_POSES.get(p.sprite),y=160+row*165;
          txt(p.name,110,y-138,16,'#fff');rect(25,y+2,1050,1,'#ae9068');
          personDraw(PEOPLE.find(p=>p.id==='manolima').sprite,80,y);
          personDraw(0,210,y);
          personDraw(p.sprite,370,y,false,false,-1,false,0,-1);
          for(let i=0;i<4;i++)expansionSprite(a.key,a.start+i,530+i*145,y,124,false,a.height);
        });
        ctx=previous;return c.toDataURL('image/png').split(',')[1];
      })()`);
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-proportions-preview.png'),Buffer.from(preview,'base64'));
      assert.equal(errors.length,0,errors.join('\n'));console.log('PASS proportions preview');return;
    }
    if (process.env.BODEGA_FOCUS === 'mountain') {
      await load(base + '/index.html');
      const results=await evaluate(fs.readFileSync(path.join(__dirname,'mountain-scenarios.js'),'utf8'));
      console.log('PASS mountain: '+results.length+' checks');
      const movement=await evaluate(fs.readFileSync(path.join(__dirname,'cave-movement-scenarios.js'),'utf8'));
      console.log('PASS cave movement: '+movement.length+' checks');
      await evaluate(`G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.cave={facao:true,floor:1,deepest:1,hp:100,dunstanTaught:true,up:{}};started=true;paused=true;$('start').classList.add('hidden');goOutside();enterCave(1);closeDialog(true);worldOut.x=780;worldOut.y=710;draw();`);
      const shot=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-mountain-preview.png'),Buffer.from(shot.data,'base64'));
      await evaluate(`switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+100});draw();`);
      const mouth=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-cave-mouth-preview.png'),Buffer.from(mouth.data,'base64'));
      const gait=await evaluate(`(()=>{const previous=ctx,c=document.createElement('canvas');c.width=1200;c.height=980;ctx=c.getContext('2d');rect(0,0,1200,980,'#777a60');['lucia','anselmo','rosa','inter_1','gremio_3','gremio2_4','dunstano'].forEach((id,row)=>{const p=PEOPLE.find(p=>p.id===id),a=SECONDARY_POSES.get(p.sprite);txt(p.name,100,row*135+30,16,'#fff');for(let step=0;step<4;step++){const index=a.start+a.steps+secondaryStep(a.steps,step,true);expansionSprite(a.key,index,300+step*230,row*135+125,115,false,a.height);}});ctx=previous;return c.toDataURL('image/png').split(',')[1];})()`);
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-gait-preview.png'),Buffer.from(gait,'base64'));
      const contact = await evaluate(`(()=>{
        const previous=ctx,oldOut=worldOut,c=document.createElement('canvas');c.width=1600;c.height=1000;ctx=c.getContext('2d');
        rect(0,0,1600,1000,'#817d60');
        Object.entries(CAVE_BEAST_ART).forEach(([kind,[sheet,start,h]],i)=>{const x=70+(i%4)*400,y=190+Math.floor(i/4)*230;txt(CAVE_BEASTS[kind].name,x+100,y+30,18,'#fff');expansionSprite(sheet,start,x,y,h,false,expansionRowHeight(sheet,start,4));expansionSprite(sheet,start+3,x+180,y,h,false,expansionRowHeight(sheet,start,4));});
        worldOut={map:'vila',x:500,y:700};mountedPose('sadi-mounted-v1',240,720,1,0,true);mountedPose('olmiro-mounted-v1',650,720,1,0,true);
        expansionSprite('horse-tether-v1',0,1070,720,155);secondaryPose(PEOPLE[PADRE_ROMIO].sprite,1400,720,true,1,0);
        for(let i=0;i<4;i++)expansionSprite('sadi-combat-v1',4+i,180+i*340,970,150,false,expansionRowHeight('sadi-combat-v1',0,12));
        ctx=previous;worldOut=oldOut;return c.toDataURL('image/png').split(',')[1];
      })()`);
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-mountain-sprites.png'),Buffer.from(contact,'base64'));
      await evaluate(`document.body.insertAdjacentHTML('beforeend','<main style="position:fixed;inset:0;z-index:999999;display:grid;grid-template-columns:repeat(11,1fr);align-content:start;gap:8px;padding:16px;background:#30271d">'+CARDS.map(c=>'<section style="height:200px;background:#eee4c4;color:#332414"><div style="position:relative;overflow:hidden;height:165px">'+collectibleArt(c.id)+'</div><div style="font:12px sans-serif;padding:4px">'+c.name+'</div></section>').join('')+'</main>')`);
      await waitUntil(()=>evaluate(`Promise.all(['cards-bodega-v1','cards-history-v1','cards-voices-v1'].map(key=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src='assets/images/expansion/'+key+'.png';}))).then(a=>a.every(Boolean))`),'Cartas não carregaram');
      const cards=await send('Page.captureScreenshot',{format:'png'});
      fs.writeFileSync(path.join(os.tmpdir(),'bodega-mountain-cards.png'),Buffer.from(cards.data,'base64'));
      assert.equal(errors.length,0,errors.join('\n'));return;
    }
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
      await evaluate('Promise.all([worldArtLoaded,walkArtLoaded])');
      const mountainResults=await evaluate(fs.readFileSync(path.join(__dirname,'mountain-scenarios.js'),'utf8'));
      console.log('PASS '+protocol+' / '+entry+': '+mountainResults.length+' verificações da caverna, montaria e personagens');
      const caveMovement=await evaluate(fs.readFileSync(path.join(__dirname,'cave-movement-scenarios.js'),'utf8'));
      console.log('PASS '+protocol+' / '+entry+': '+caveMovement.length+' verificações de colisão e dash');
      const caveLife=await evaluate(fs.readFileSync(path.join(__dirname,'cave-life-scenarios.js'),'utf8'));
      console.log('PASS '+protocol+' / '+entry+': '+caveLife.length+' verificações dos encontros e da progressão da caverna');
      const roadsCave=await evaluate(fs.readFileSync(path.join(__dirname,'road-cave-performance-scenarios.js'),'utf8'));
      console.log('PASS '+protocol+' / '+entry+': '+roadsCave.length+' verificações da distribuição e renderização da caverna');
      const trayResults=await evaluate(fs.readFileSync(path.join(__dirname,'sadi-tray-scenarios.js'),'utf8'));
      console.log('PASS '+protocol+' / '+entry+': '+trayResults.length+' verificações do Sadi com bandeja e galpão');
      const interiorWalkResults = await evaluate(fs.readFileSync(path.join(__dirname, 'interior-walk-scenarios.js'), 'utf8'));
      console.log('PASS '+protocol+' / '+entry+': '+interiorWalkResults.length+' verificações de interiores e caminhada');
      const worldArtResults = await evaluate(fs.readFileSync(path.join(__dirname, 'world-art-scenarios.js'), 'utf8'));
      const ruralArtResults = await evaluate(fs.readFileSync(path.join(__dirname, 'rural-art-scenarios.js'), 'utf8'));
      for(const result of ruralArtResults)console.log('PASS '+protocol+' / '+entry+': '+result);
      for (const result of worldArtResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
      const tourismResults = await evaluate(fs.readFileSync(path.join(__dirname, 'tourism-scenarios.js'), 'utf8'));
      for (const result of tourismResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
      const layoutResults = await evaluate(fs.readFileSync(path.join(__dirname, 'world-layout-scenarios.js'), 'utf8'));
      for (const result of layoutResults) console.log('PASS ' + protocol + ' / ' + entry + ': ' + result);
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
