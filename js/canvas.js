/* Canvas drawing engine — handles strokes, shapes, undo/redo, export, BG */
window.VWB = window.VWB || {}; var VWB = window.VWB;
VWB.canvas = (() => {
  const { $, hexToRgba, clamp } = VWB.utils;

  const stage = $('#canvasStage');
  const bg = $('#bgCanvas');
  const draw = $('#drawCanvas');
  const live = $('#liveCanvas');
  const bgCtx = bg.getContext('2d');
  const ctx = draw.getContext('2d');
  const liveCtx = live.getContext('2d');

  const state = {
    tool: VWB_CONSTANTS.DEFAULTS.tool,
    color: VWB_CONSTANTS.DEFAULTS.color,
    size: VWB_CONSTANTS.DEFAULTS.size,
    opacity: VWB_CONSTANTS.DEFAULTS.opacity,
    smoothing: VWB_CONSTANTS.DEFAULTS.smoothing,
    bg: VWB_CONSTANTS.DEFAULTS.bg,
    zoom: 1,
    drawing: false,
    strokes: [],      // committed strokes (vector)
    redoStack: [],
    current: null,
    startPt: null,
    grid: false,
  };

  function resize() {
    const r = stage.getBoundingClientRect();
    [bg, draw, live].forEach(c => {
      c.width = r.width * devicePixelRatio;
      c.height = r.height * devicePixelRatio;
      c.style.width = r.width + 'px';
      c.style.height = r.height + 'px';
      c.getContext('2d').setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    });
    renderBg(); renderAll();
  }

  function renderBg() {
    const w = bg.width / devicePixelRatio, h = bg.height / devicePixelRatio;
    bgCtx.clearRect(0,0,w,h);
    if (state.bg === 'whiteboard') { bgCtx.fillStyle = '#fafbfd'; bgCtx.fillRect(0,0,w,h); }
    else if (state.bg === 'blackboard') { bgCtx.fillStyle = '#0e1116'; bgCtx.fillRect(0,0,w,h); }
    else if (state.bg === 'notebook') {
      bgCtx.fillStyle = '#fffef9'; bgCtx.fillRect(0,0,w,h);
      bgCtx.strokeStyle = 'rgba(80,140,200,.25)'; bgCtx.lineWidth = 1;
      for (let y=28; y<h; y+=28) { bgCtx.beginPath(); bgCtx.moveTo(0,y); bgCtx.lineTo(w,y); bgCtx.stroke(); }
    }
    if (state.grid || state.bg === 'grid') {
      bgCtx.strokeStyle = 'rgba(255,255,255,.06)'; bgCtx.lineWidth = 1;
      for (let x=0; x<w; x+=32) { bgCtx.beginPath(); bgCtx.moveTo(x,0); bgCtx.lineTo(x,h); bgCtx.stroke(); }
      for (let y=0; y<h; y+=32) { bgCtx.beginPath(); bgCtx.moveTo(0,y); bgCtx.lineTo(w,y); bgCtx.stroke(); }
    }
    if (state.bg === 'dots') {
      bgCtx.fillStyle = 'rgba(255,255,255,.18)';
      for (let x=18; x<w; x+=26) for (let y=18; y<h; y+=26) { bgCtx.beginPath(); bgCtx.arc(x,y,1.2,0,Math.PI*2); bgCtx.fill(); }
    }
  }

  function applyBrushStyle(c, s) {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.globalAlpha = s.opacity;
    c.lineWidth = s.size;
    c.strokeStyle = s.color;
    c.fillStyle = s.color;
    c.globalCompositeOperation = 'source-over';
    if (s.tool === 'highlighter') { c.globalAlpha = Math.min(s.opacity, .35); c.lineWidth = s.size*2.2; }
    if (s.tool === 'marker')      { c.lineWidth = s.size*1.4; }
    if (s.tool === 'pencil')      { c.globalAlpha = Math.min(s.opacity, .8); c.lineWidth = Math.max(1, s.size*.6); }
    if (s.tool === 'neon') {
      c.shadowColor = s.color; c.shadowBlur = 16;
      c.strokeStyle = '#ffffff'; c.lineWidth = s.size*0.7;
    } else { c.shadowBlur = 0; }
    if (s.tool === 'eraser') { c.globalCompositeOperation = 'destination-out'; c.strokeStyle = 'rgba(0,0,0,1)'; c.globalAlpha = 1; }
  }

  function drawStroke(c, stroke) {
    const pts = stroke.points;
    if (!pts || pts.length === 0) return;
    applyBrushStyle(c, stroke);
    if (stroke.tool === 'spray') {
      c.fillStyle = stroke.color;
      for (const p of pts) {
        for (let i=0;i<8;i++) {
          const a = Math.random()*Math.PI*2;
          const r = Math.random()*stroke.size;
          c.globalAlpha = stroke.opacity * (Math.random()*.6 + .2);
          c.beginPath(); c.arc(p.x + Math.cos(a)*r, p.y + Math.sin(a)*r, 1, 0, Math.PI*2); c.fill();
        }
      }
      return;
    }
    if (['line','rect','circle','arrow'].includes(stroke.tool) && pts.length >= 2) {
      const a = pts[0], b = pts[pts.length-1];
      c.beginPath();
      if (stroke.tool === 'line') { c.moveTo(a.x,a.y); c.lineTo(b.x,b.y); }
      if (stroke.tool === 'rect') { c.rect(a.x, a.y, b.x-a.x, b.y-a.y); }
      if (stroke.tool === 'circle') {
        const cx=(a.x+b.x)/2, cy=(a.y+b.y)/2, rx=Math.abs(b.x-a.x)/2, ry=Math.abs(b.y-a.y)/2;
        c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
      }
      if (stroke.tool === 'arrow') {
        c.moveTo(a.x,a.y); c.lineTo(b.x,b.y);
        const ang = Math.atan2(b.y-a.y, b.x-a.x), len = 14;
        c.moveTo(b.x,b.y); c.lineTo(b.x-Math.cos(ang-.4)*len, b.y-Math.sin(ang-.4)*len);
        c.moveTo(b.x,b.y); c.lineTo(b.x-Math.cos(ang+.4)*len, b.y-Math.sin(ang+.4)*len);
      }
      c.stroke();
      return;
    }
    if (stroke.tool === 'text') {
      c.font = `${Math.max(14, stroke.size*3)}px 'Inter', sans-serif`;
      c.fillStyle = stroke.color; c.globalAlpha = stroke.opacity;
      c.fillText(stroke.text || '', pts[0].x, pts[0].y);
      return;
    }
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i=1; i<pts.length-1; i++) {
      const mx = (pts[i].x + pts[i+1].x)/2;
      const my = (pts[i].y + pts[i+1].y)/2;
      c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length-1];
    c.lineTo(last.x, last.y);
    c.stroke();
  }

  function renderAll() {
    const w = draw.width/devicePixelRatio, h = draw.height/devicePixelRatio;
    ctx.clearRect(0,0,w,h);
    for (const s of state.strokes) drawStroke(ctx, s);
  }

  function clearLive() {
    const w = live.width/devicePixelRatio, h = live.height/devicePixelRatio;
    liveCtx.clearRect(0,0,w,h);
  }

  function beginStroke(x,y) {
    state.drawing = true;
    state.startPt = {x,y};
    state.current = {
      tool: state.tool, color: state.color, size: state.size,
      opacity: state.opacity, points: [{x,y}], ts: Date.now()
    };
  }
  function moveStroke(x,y) {
    if (!state.drawing || !state.current) return;
    const pts = state.current.points;
    const last = pts[pts.length-1];
    // smoothing: blend new point with last
    const t = 1 - state.smoothing*0.7;
    const nx = last.x + (x-last.x)*t;
    const ny = last.y + (y-last.y)*t;
    pts.push({x:nx, y:ny});
    clearLive();
    drawStroke(liveCtx, state.current);
  }
  function endStroke() {
    if (!state.drawing) return;
    state.drawing = false;
    if (state.current && state.current.points.length) {
      state.strokes.push(state.current);
      state.redoStack = [];
    }
    state.current = null;
    clearLive();
    renderAll();
    updateStrokeCount();
  }
  function cancelStroke() { state.drawing = false; state.current = null; clearLive(); }

  function undo() { if (state.strokes.length) { state.redoStack.push(state.strokes.pop()); renderAll(); updateStrokeCount(); } }
  function redo() { if (state.redoStack.length) { state.strokes.push(state.redoStack.pop()); renderAll(); updateStrokeCount(); } }
  function clearAll() { state.strokes = []; state.redoStack = []; renderAll(); updateStrokeCount(); }

  function updateStrokeCount() { const el = $('#strokeCount'); if (el) el.textContent = state.strokes.length; }

  function setTool(t)  { state.tool = t; $('#hudTool').textContent = t; }
  function setColor(c) { state.color = c; }
  function setSize(s)  { state.size = s; }
  function setOpacity(o){ state.opacity = o; }
  function setSmooth(s){ state.smoothing = s; }
  function setBg(b)    { state.bg = b; renderBg(); }
  function toggleGrid(){ state.grid = !state.grid; renderBg(); return state.grid; }

  function toDataURL(type='image/png', bgFill) {
    const out = document.createElement('canvas');
    out.width = draw.width; out.height = draw.height;
    const oc = out.getContext('2d');
    if (bgFill) { oc.fillStyle = bgFill; oc.fillRect(0,0,out.width,out.height); }
    oc.drawImage(bg, 0, 0);
    oc.drawImage(draw, 0, 0);
    return out.toDataURL(type, 0.95);
  }

  function exportSVG() {
    const w = draw.width/devicePixelRatio, h = draw.height/devicePixelRatio;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
    for (const s of state.strokes) {
      if (['line','rect','circle','arrow','text'].includes(s.tool)) continue;
      if (!s.points.length) continue;
      const d = s.points.map((p,i)=> (i?'L':'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
      svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.size}" stroke-linecap="round" stroke-linejoin="round" opacity="${s.opacity}"/>`;
    }
    svg += '</svg>';
    return svg;
  }
  function exportJSON() { return JSON.stringify({strokes: state.strokes, bg: state.bg}, null, 2); }
  function loadJSON(json) {
    try { const d = JSON.parse(json); state.strokes = d.strokes||[]; state.redoStack = []; state.bg = d.bg||'transparent'; renderBg(); renderAll(); updateStrokeCount(); return true; }
    catch(e){ return false; }
  }

  function getState() { return state; }
  function getDrawCanvas() { return draw; }
  function getStage() { return stage; }

  return {
    init: resize, resize, renderAll, renderBg,
    beginStroke, moveStroke, endStroke, cancelStroke,
    undo, redo, clearAll,
    setTool, setColor, setSize, setOpacity, setSmooth, setBg, toggleGrid,
    toDataURL, exportSVG, exportJSON, loadJSON,
    getState, getDrawCanvas, getStage
  };
})();
