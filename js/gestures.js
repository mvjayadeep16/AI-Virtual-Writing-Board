/* Hand-gesture recognition → drawing commands (v3: robust marker / eraser / stop) */
window.VWB = window.VWB || {}; var VWB = window.VWB;
VWB.gestures = (() => {
  const { $, dist, clamp } = VWB.utils;
  const laser = $('#laserDot');
  const stage = VWB.canvas.getStage();

  // MediaPipe Hands landmark IDs
  const WRIST = 0;
  const TIP = { thumb:4, index:8, middle:12, ring:16, pinky:20 };
  const DIP = { index:7, middle:11, ring:15, pinky:19 };
  const PIP = { thumb:2, index:6, middle:10, ring:14, pinky:18 };
  const MCP = { thumb:1, index:5, middle:9, ring:13, pinky:17 };

  const smooth = { x: null, y: null };
  const SMOOTH_A = 0.62;
  const MIN_MOVE = 1.35;
  const MAX_JUMP = 115;
  const LOST_FRAMES_TO_RELEASE = 3;

  let activeGesture = 'idle';
  let candidateGesture = 'idle';
  let candidateCount = 0;
  let lostFrames = 0;
  let prevToolBeforeGesture = null;
  let lastNonEraserTool = 'marker';
  let lastDrawPt = null;

  function sensitivity() {
    const el = $('#gestureSens');
    const value = el ? Number(el.value) : 65;
    return clamp(Number.isFinite(value) ? value : 65, 10, 100) / 100;
  }

  function angle(a, b, c) {
    const abx = a.x - b.x, aby = a.y - b.y;
    const cbx = c.x - b.x, cby = c.y - b.y;
    const dot = abx * cbx + aby * cby;
    const mag = Math.hypot(abx, aby) * Math.hypot(cbx, cby) || 1;
    return Math.acos(clamp(dot / mag, -1, 1)) * 180 / Math.PI;
  }

  function handScale(lm) {
    const wrist = lm[WRIST];
    const palm = lm[MCP.middle];
    const base = dist(wrist.x, wrist.y, palm.x, palm.y);
    const span = dist(lm[MCP.index].x, lm[MCP.index].y, lm[MCP.pinky].x, lm[MCP.pinky].y);
    return Math.max(base, span, 0.04);
  }

  function fingerState(lm, name, scale) {
    const tip = lm[TIP[name]], dip = lm[DIP[name]], pip = lm[PIP[name]], mcp = lm[MCP[name]], wrist = lm[WRIST];
    const bend = angle(mcp, pip, tip);
    const dTipW = dist(tip.x, tip.y, wrist.x, wrist.y);
    const dPipW = dist(pip.x, pip.y, wrist.x, wrist.y);
    const dTipMcp = dist(tip.x, tip.y, mcp.x, mcp.y);
    const dDipMcp = dist(dip.x, dip.y, mcp.x, mcp.y);
    const s = sensitivity();

    // Higher sensitivity accepts a little more hand tilt / camera noise.
    const ratioNeed = 1.13 - s * 0.10;       // 1.12 → 1.03
    const angleNeed = 162 - s * 24;          // 160° → 138°
    const extended = bend > angleNeed && dTipW > dPipW * ratioNeed && dTipMcp > dDipMcp * 1.03;
    const curled = bend < 132 || dTipW < dPipW * (1.02 + (1 - s) * 0.10) || dTipMcp < scale * 0.72;
    return { extended, curled, bend, dTipW, dPipW };
  }

  function thumbExtended(lm, scale) {
    const tip = lm[TIP.thumb], ip = lm[PIP.thumb], wrist = lm[WRIST], indexMcp = lm[MCP.index];
    const dTipIndex = dist(tip.x, tip.y, indexMcp.x, indexMcp.y);
    const dIpIndex = dist(ip.x, ip.y, indexMcp.x, indexMcp.y);
    const dTipW = dist(tip.x, tip.y, wrist.x, wrist.y);
    const dIpW = dist(ip.x, ip.y, wrist.x, wrist.y);
    return dTipIndex > dIpIndex * 1.12 && dTipW > dIpW * 1.02 && dTipIndex > scale * 0.62;
  }

  function classify(lm) {
    const scale = handScale(lm);
    const idx = fingerState(lm, 'index', scale);
    const mid = fingerState(lm, 'middle', scale);
    const ring = fingerState(lm, 'ring', scale);
    const pinky = fingerState(lm, 'pinky', scale);
    const thumbUp = thumbExtended(lm, scale);

    const extended = {
      index: idx.extended,
      middle: mid.extended,
      ring: ring.extended,
      pinky: pinky.extended,
      thumb: thumbUp
    };

    const straightCount = [idx, mid, ring, pinky].filter(f => f.extended).length;
    const curledCount = [idx, mid, ring, pinky].filter(f => f.curled).length;
    const fingerSpan = dist(lm[TIP.index].x, lm[TIP.index].y, lm[TIP.pinky].x, lm[TIP.pinky].y);
    const pinchDist = dist(lm[TIP.thumb].x, lm[TIP.thumb].y, lm[TIP.index].x, lm[TIP.index].y);
    const pinch = pinchDist < scale * (0.32 + sensitivity() * 0.18);

    // STOP must win over everything if the hand is closed or in a clear pause pose.
    if (curledCount >= 4) return { name: 'stop', confidence: 0.94, extended, scale };
    if (idx.extended && mid.extended && !ring.extended && !pinky.extended) {
      return { name: 'stop', confidence: 0.90, extended, scale };
    }

    // Open palm = eraser. Accept a normal open hand even when the camera crops the thumb/pinky a bit.
    if (straightCount >= 4 || (idx.extended && mid.extended && ring.extended && thumbUp && fingerSpan > scale * 0.72)) {
      return { name: 'eraser', confidence: 0.94, extended, scale };
    }

    // Pinch is treated as a safe stop/picker gesture; it should never keep drawing.
    if (pinch && !mid.extended && !ring.extended && !pinky.extended) {
      return { name: 'stop', confidence: 0.86, extended, scale };
    }

    // Marker/draw = index pointer only. Thumb can be relaxed or extended because real hands vary.
    if (idx.extended && !mid.extended && !ring.extended && !pinky.extended) {
      return { name: 'marker', confidence: 0.92, extended, scale };
    }

    return { name: 'idle', confidence: 0.70, extended, scale };
  }

  function stableGesture(raw) {
    const framesNeeded = raw.name === 'stop' ? 1 : (sensitivity() > 0.72 ? 2 : 3);
    if (raw.name === candidateGesture) candidateCount++;
    else { candidateGesture = raw.name; candidateCount = 1; }

    if (candidateCount >= framesNeeded && raw.confidence >= 0.78) activeGesture = raw.name;
    return activeGesture;
  }

  function mapToCanvas(nx, ny) {
    const r = stage.getBoundingClientRect();
    const x = (1 - nx) * r.width;
    const y = ny * r.height;
    return { x: clamp(x, 0, r.width), y: clamp(y, 0, r.height) };
  }

  function setBadge(score, gesture) {
    const badge = $('#confBadge');
    if (!badge) return;
    const pct = Math.round(score * 100);
    const label = gesture === 'marker' ? 'Marker' : gesture === 'eraser' ? 'Eraser' : gesture === 'stop' ? 'Stop' : '--';
    badge.textContent = `Hand: ${pct}% • ${label}`;
  }

  function rememberTool() {
    const tool = VWB.canvas.getState().tool;
    if (tool !== 'eraser') lastNonEraserTool = tool;
  }

  function ensureTool(tool) {
    const state = VWB.canvas.getState();
    if (state.tool === tool) return;
    if (prevToolBeforeGesture == null) prevToolBeforeGesture = state.tool;
    VWB.canvas.setTool(tool);
  }

  function restoreTool() {
    if (prevToolBeforeGesture != null) {
      VWB.canvas.setTool(prevToolBeforeGesture);
      if (prevToolBeforeGesture !== 'eraser') lastNonEraserTool = prevToolBeforeGesture;
      prevToolBeforeGesture = null;
    }
  }

  function releaseStroke(restore = true) {
    if (lastDrawPt) VWB.canvas.endStroke();
    lastDrawPt = null;
    if (restore) restoreTool();
  }

  function drawAt(pt, tool) {
    ensureTool(tool);
    if (lastDrawPt === null) {
      VWB.canvas.beginStroke(pt.x, pt.y);
      lastDrawPt = pt;
      return;
    }
    const move = Math.hypot(pt.x - lastDrawPt.x, pt.y - lastDrawPt.y);
    if (move > MAX_JUMP) {
      VWB.canvas.endStroke();
      VWB.canvas.beginStroke(pt.x, pt.y);
      lastDrawPt = pt;
      return;
    }
    if (move >= MIN_MOVE) {
      VWB.canvas.moveStroke(pt.x, pt.y);
      lastDrawPt = pt;
    }
  }

  function resetTracking() {
    smooth.x = smooth.y = null;
    activeGesture = 'idle';
    candidateGesture = 'idle';
    candidateCount = 0;
    lostFrames = 0;
  }

  function handleResults(res) {
    const score = res.multiHandedness?.[0]?.score ?? 0;
    if (!res.multiHandLandmarks || !res.multiHandLandmarks.length || score < 0.45) {
      lostFrames++;
      if (lostFrames >= LOST_FRAMES_TO_RELEASE) {
        releaseStroke(true);
        laser.classList.remove('show');
        resetTracking();
      }
      return;
    }
    lostFrames = 0;

    const lm = res.multiHandLandmarks[0];
    const nx = lm[TIP.index].x, ny = lm[TIP.index].y;
    if (smooth.x == null) { smooth.x = nx; smooth.y = ny; }
    else {
      smooth.x = smooth.x + (nx - smooth.x) * SMOOTH_A;
      smooth.y = smooth.y + (ny - smooth.y) * SMOOTH_A;
    }
    const pt = mapToCanvas(smooth.x, smooth.y);

    laser.style.left = (pt.x - 9) + 'px';
    laser.style.top  = (pt.y - 9) + 'px';
    laser.classList.add('show');

    rememberTool();
    const raw = classify(lm);
    const gesture = stableGesture(raw);
    setBadge(score || raw.confidence, gesture);

    if (gesture === 'marker') {
      drawAt(pt, 'marker');
      return;
    }

    if (gesture === 'eraser') {
      drawAt(pt, 'eraser');
      return;
    }

    // Stop/idle/pinch: immediately release and keep the board cleanly paused.
    releaseStroke(true);
  }

  return { handleResults, _debugClassify: classify };
})();
