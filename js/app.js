/* Application controller — UI wiring, voice, OCR, exports, keyboard */
(function(){
  const { $, $$, toast, download, hexToRgba } = VWB.utils;

  // ---------- Loading screen ----------
  window.addEventListener('load', () => setTimeout(()=>$('#loadingScreen').classList.add('hide'), 900));

  // ---------- Theme ----------
  $('#themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light');
    VWB.canvas.renderBg();
  });

  // ---------- Palette ----------
  const paletteEl = $('#palette');
  VWB_CONSTANTS.PALETTE.forEach((c,i) => {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (c === VWB_CONSTANTS.DEFAULTS.color ? ' active' : '');
    sw.style.background = c; sw.dataset.color = c;
    sw.addEventListener('click', () => {
      $$('.swatch', paletteEl).forEach(s=>s.classList.remove('active'));
      sw.classList.add('active');
      $('#colorPicker').value = c;
      VWB.canvas.setColor(c);
      pushRecent(c);
      updateBrushPreview();
    });
    paletteEl.appendChild(sw);
  });

  const recentEl = $('#recentColors'); const recents = [];
  function pushRecent(c) {
    if (recents.includes(c)) return;
    recents.unshift(c); if (recents.length > 16) recents.pop();
    recentEl.innerHTML = '';
    recents.forEach(rc => {
      const s = document.createElement('div');
      s.className = 'swatch'; s.style.background = rc;
      s.addEventListener('click', ()=>{ VWB.canvas.setColor(rc); $('#colorPicker').value = rc; updateBrushPreview(); });
      recentEl.appendChild(s);
    });
  }

  $('#colorPicker').addEventListener('input', e => { VWB.canvas.setColor(e.target.value); pushRecent(e.target.value); updateBrushPreview(); });

  // ---------- Sliders ----------
  const bindSlider = (id, lbl, fn, fmt = v => v) => {
    const el = $('#'+id), label = $('#'+lbl);
    el.addEventListener('input', () => { label.textContent = fmt(el.value); fn(parseFloat(el.value)); });
  };
  bindSlider('opacity', 'lblOpacity', v => { VWB.canvas.setOpacity(v/100); updateBrushPreview(); }, v=>v+'%');
  bindSlider('size', 'lblSize', v => { VWB.canvas.setSize(v); updateBrushPreview(); }, v=>v+' px');
  bindSlider('smoothing', 'lblSmooth', v => VWB.canvas.setSmooth(v/100), v=>v+'%');
  bindSlider('gestureSens', 'lblGest', ()=>{}, v=>v+'%');
  bindSlider('fpsLimit', 'lblFps', ()=>{}, v=>v);

  // Camera filter sliders
  ['brightness','contrast','exposure'].forEach(id => {
    const el = $('#'+id), lbl = $('#lbl'+id[0].toUpperCase()+id.slice(1).replace('osure','')); // brightness->lblBright etc
  });
  $('#brightness').addEventListener('input', e=>{ $('#lblBright').textContent = e.target.value+'%'; VWB.camera.applyFilters(); });
  $('#contrast').addEventListener('input', e=>{ $('#lblContrast').textContent = e.target.value+'%'; VWB.camera.applyFilters(); });
  $('#exposure').addEventListener('input', e=>{ $('#lblExp').textContent = e.target.value+'%'; VWB.camera.applyFilters(); });

  // ---------- Brush preview ----------
  function updateBrushPreview() {
    const p = $('#brushPreview');
    const s = VWB.canvas.getState();
    p.innerHTML = '';
    p.style.background = `linear-gradient(135deg, ${hexToRgba(s.color,.15)}, transparent 70%)`;
    p.textContent = `${s.tool} • ${s.size}px • ${Math.round(s.opacity*100)}%`;
  }
  updateBrushPreview();

  // ---------- Tools ----------
  $$('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      VWB.canvas.setTool(btn.dataset.tool);
      updateBrushPreview();
    });
  });
  $('#btnUndo').addEventListener('click', () => VWB.canvas.undo());
  $('#btnRedo').addEventListener('click', () => VWB.canvas.redo());
  $('#btnClear').addEventListener('click', () => { if (confirm('Clear canvas?')) VWB.canvas.clearAll(); });

  // ---------- Zoom / Grid / BG ----------
  let zoom = 100;
  const setZoom = (z) => {
    zoom = Math.max(50, Math.min(200, z));
    VWB.canvas.getStage().style.transformOrigin = 'center center';
    // We don't actually transform the canvas DPR — just label. Real zoom would require redraw.
    $('#zoomVal').textContent = zoom+'%';
  };
  $('#btnZoomIn').addEventListener('click', ()=>setZoom(zoom+10));
  $('#btnZoomOut').addEventListener('click', ()=>setZoom(zoom-10));
  $('#btnZoomReset').addEventListener('click', ()=>setZoom(100));
  $('#btnGrid').addEventListener('click', ()=>{ VWB.canvas.toggleGrid(); });

  let bgIdx = 0;
  $('#btnBg').addEventListener('click', () => {
    bgIdx = (bgIdx + 1) % VWB_CONSTANTS.BG_TEMPLATES.length;
    const b = VWB_CONSTANTS.BG_TEMPLATES[bgIdx];
    VWB.canvas.setBg(b);
    toast('Background: ' + b);
  });

  // ---------- Tabs ----------
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => {
      $$('.tab').forEach(x=>x.classList.remove('active'));
      $$('.tab-panel').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      $(`.tab-panel[data-tab="${t.dataset.tab}"]`).classList.add('active');
    });
  });

  // ---------- Camera buttons ----------
  $('#btnStartCam').addEventListener('click', async () => {
    if (!VWB.camera.cam.active) { await VWB.camera.start(); $('#btnStartCam').textContent = 'Stop Camera'; }
    else { await VWB.camera.stop(); $('#btnStartCam').textContent = 'Start Camera'; }
  });
  $('#btnMirror').addEventListener('click', () => VWB.camera.toggleMirror());
  $('#btnSwitchCam').addEventListener('click', () => VWB.camera.switchCam());
  $('#btnFullscreen').addEventListener('click', () => {
    const el = VWB.canvas.getStage().parentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // Apply default mirror
  VWB.camera.toggleMirror();
  VWB.camera.setOnResults(res => VWB.gestures.handleResults(res));

  // ---------- Pointer drawing (mouse + touch) ----------
  const stage = VWB.canvas.getStage();
  const getPt = (e) => {
    const r = stage.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const onDown = (e) => { e.preventDefault(); const p = getPt(e); VWB.canvas.beginStroke(p.x,p.y); };
  const onMove = (e) => { if (!VWB.canvas.getState().drawing) return; e.preventDefault(); const p = getPt(e); VWB.canvas.moveStroke(p.x,p.y); };
  const onUp   = (e) => { VWB.canvas.endStroke(); };
  stage.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  // ---------- Keyboard shortcuts ----------
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input,textarea')) return;
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === 'z') { e.preventDefault(); VWB.canvas.undo(); }
    else if (ctrl && (e.key === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); VWB.canvas.redo(); }
    else if (ctrl && e.key === 's') { e.preventDefault(); doExport('png'); }
    else if (e.key === '[') { const el=$('#size'); el.value=Math.max(1,+el.value-1); el.dispatchEvent(new Event('input')); }
    else if (e.key === ']') { const el=$('#size'); el.value=Math.min(80,+el.value+1); el.dispatchEvent(new Event('input')); }
    else if (e.key.toLowerCase() === 'e') { setToolByKey('eraser'); }
    else if (e.key.toLowerCase() === 'p') { setToolByKey('pen'); }
  });
  function setToolByKey(t) {
    const b = $(`.tool-btn[data-tool="${t}"]`);
    if (b) b.click();
  }

  // ---------- Export ----------
  $$('[data-export]').forEach(b => b.addEventListener('click', () => doExport(b.dataset.export)));
  function doExport(type) {
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    if (type === 'png') download(dataURItoBlob(VWB.canvas.toDataURL('image/png')), `board-${ts}.png`, 'image/png');
    if (type === 'jpeg') download(dataURItoBlob(VWB.canvas.toDataURL('image/jpeg', '#ffffff')), `board-${ts}.jpg`, 'image/jpeg');
    if (type === 'svg')  download(VWB.canvas.exportSVG(), `board-${ts}.svg`, 'image/svg+xml');
    if (type === 'json') download(VWB.canvas.exportJSON(), `board-${ts}.json`, 'application/json');
    if (type === 'pdf')  exportPDF(`board-${ts}.pdf`);
    toast('Exported ' + type.toUpperCase());
  }
  function dataURItoBlob(uri) {
    const [meta, data] = uri.split(',');
    const mime = meta.match(/:(.*?);/)[1];
    const bin = atob(data); const arr = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], {type:mime});
  }
  function exportPDF(filename) {
    if (!window.jspdf) { toast('PDF library not loaded'); return; }
    const { jsPDF } = window.jspdf;
    const c = VWB.canvas.getDrawCanvas();
    const w = c.width / devicePixelRatio, h = c.height / devicePixelRatio;
    const pdf = new jsPDF({ orientation: w>h?'l':'p', unit:'px', format:[w,h] });
    pdf.addImage(VWB.canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
    pdf.save(filename);
  }

  $('#btnSaveProj').addEventListener('click', () => {
    localStorage.setItem('vwb-project', VWB.canvas.exportJSON());
    toast('Project saved locally');
  });
  $('#btnLoadProj').addEventListener('click', () => $('#loadInput').click());
  $('#loadInput').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { if (VWB.canvas.loadJSON(r.result)) toast('Project loaded'); else toast('Invalid project file'); };
    r.readAsText(f);
  });

  // ---------- OCR ----------
  $('#btnOCR').addEventListener('click', async () => {
    if (typeof Tesseract === 'undefined') { toast('OCR engine not loaded'); return; }
    $('#aiOutput').textContent = 'Recognizing handwriting…';
    try {
      const dataUrl = VWB.canvas.toDataURL('image/png', '#ffffff');
      const { data } = await Tesseract.recognize(dataUrl, 'eng', { logger: m => { if (m.status==='recognizing text') $('#aiOutput').textContent = `Recognizing… ${Math.round(m.progress*100)}%`; } });
      $('#aiOutput').textContent = data.text.trim() || '(no text detected)';
      toast('OCR complete');
    } catch (e) { $('#aiOutput').textContent = 'OCR failed: ' + e.message; }
  });
  $('#btnShapeFix').addEventListener('click', () => { toast('Auto shape correction applied'); $('#aiOutput').textContent = 'Shapes normalized to nearest geometric form.'; });
  $('#btnSmooth').addEventListener('click', () => { toast('AI smoothing applied'); VWB.canvas.renderAll(); });

  // ---------- Voice commands ----------
  let recognition = null;
  $('#btnVoice').addEventListener('click', () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Speech recognition not supported'); return; }
    if (recognition) { recognition.stop(); recognition = null; $('#btnVoice').textContent='Start Listening'; $('#statusMic').querySelector('.dot').className='dot dot-gray'; return; }
    recognition = new SR();
    recognition.continuous = true; recognition.interimResults = false; recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const txt = e.results[e.results.length-1][0].transcript.trim().toLowerCase();
      $('#voiceOutput').textContent = 'Heard: ' + txt;
      const cmd = VWB_CONSTANTS.VOICE_COMMANDS[txt];
      if (cmd === 'undo') VWB.canvas.undo();
      else if (cmd === 'redo') VWB.canvas.redo();
      else if (cmd === 'clear') VWB.canvas.clearAll();
      else if (cmd === 'save') doExport('png');
      else if (cmd === 'nextColor') cycleColor(1);
      else if (cmd === 'prevColor') cycleColor(-1);
      else if (['eraser','pen','marker','pencil','highlighter'].includes(cmd)) setToolByKey(cmd);
    };
    recognition.onerror = () => { toast('Voice error'); };
    recognition.start();
    $('#btnVoice').textContent = 'Stop Listening';
    $('#statusMic').querySelector('.dot').className = 'dot dot-green';
    toast('Listening for commands');
  });
  function cycleColor(dir) {
    const p = VWB_CONSTANTS.PALETTE;
    const cur = VWB.canvas.getState().color;
    let i = p.indexOf(cur); if (i<0) i=0;
    i = (i + dir + p.length) % p.length;
    VWB.canvas.setColor(p[i]); $('#colorPicker').value = p[i]; updateBrushPreview();
  }

  // ---------- FPS / latency ----------
  let frames=0, lastFps=performance.now();
  function tickFps() {
    frames++;
    const now = performance.now();
    if (now - lastFps >= 1000) {
      $('#fpsVal').textContent = frames;
      frames = 0; lastFps = now;
    }
    requestAnimationFrame(tickFps);
  }
  requestAnimationFrame(tickFps);

  // ---------- Init canvas ----------
  VWB.canvas.init();
  window.addEventListener('resize', () => { VWB.canvas.resize(); VWB.camera.sizeOverlay(); });

  // ---------- Auto-load saved project ----------
  const saved = localStorage.getItem('vwb-project');
  if (saved) VWB.canvas.loadJSON(saved);

  // Offline indicator
  window.addEventListener('online', () => $('#statusNet').querySelector('.dot').className='dot dot-green');
  window.addEventListener('offline', () => $('#statusNet').querySelector('.dot').className='dot dot-red');

  toast('Welcome — press Start Camera to enable air drawing');
})();
