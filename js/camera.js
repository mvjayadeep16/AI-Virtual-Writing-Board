/* Camera + MediaPipe Hands wrapper */
window.VWB = window.VWB || {}; var VWB = window.VWB;
VWB.camera = (() => {
  const { $, toast } = VWB.utils;
  const video = $('#cameraVideo');
  const overlay = $('#cameraOverlay');
  const overlayCtx = overlay.getContext('2d');
  const stage = video.parentElement;

  const cam = {
    stream: null, facing: 'user', mirror: true,
    hands: null, mpCamera: null, active: false,
    onResults: null
  };

  // Required attributes so iOS/Safari & Chrome autoplay inline
  video.setAttribute('playsinline', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.muted = true;

  function applyFilters() {
    const b = $('#brightness').value, c = $('#contrast').value, e = $('#exposure').value;
    video.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${e}%)`;
  }

  function sizeOverlay() {
    const r = stage.getBoundingClientRect();
    overlay.width = r.width; overlay.height = r.height;
  }

  function preflight() {
    if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      toast('Camera requires HTTPS or localhost. Open via http://localhost (see README).', 6000);
      return false;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Browser does not support getUserMedia. Use latest Chrome/Edge/Firefox.', 6000);
      return false;
    }
    if (location.protocol === 'file:') {
      toast('Cannot access camera from file://. Run a local server (see README).', 7000);
      return false;
    }
    return true;
  }

  async function tryGetStream() {
    // Try ideal facing first, then fall back to any camera.
    const attempts = [
      { video: { facingMode: { ideal: cam.facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
      { video: { facingMode: cam.facing }, audio: false },
      { video: true, audio: false }
    ];
    let lastErr;
    for (const constraints of attempts) {
      try { return await navigator.mediaDevices.getUserMedia(constraints); }
      catch (e) { lastErr = e; }
    }
    throw lastErr;
  }

  async function start() {
    if (cam.active) return;
    if (!preflight()) return;
    try {
      cam.stream = await tryGetStream();
      video.srcObject = cam.stream;
      try { await video.play(); } catch (e) { /* will play on user gesture */ }
      sizeOverlay();
      cam.active = true;
      $('#camChip').textContent = 'Live';
      $('#statusCam').querySelector('.dot').className = 'dot dot-green';
      initHands();
      toast('Camera started');
    } catch (err) {
      console.error('getUserMedia failed:', err);
      const name = err && err.name ? err.name : 'Error';
      let msg = 'Camera error: ' + name;
      if (name === 'NotAllowedError') msg = 'Camera permission denied. Click the lock icon in your address bar and allow camera.';
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') msg = 'No camera found matching constraints.';
      else if (name === 'NotReadableError') msg = 'Camera is in use by another app. Close it and retry.';
      toast(msg, 6000);
      $('#camChip').textContent = 'Error';
      $('#statusCam').querySelector('.dot').className = 'dot dot-red';
    }
  }

  async function stop() {
    if (cam.mpCamera) { try { await cam.mpCamera.stop(); } catch(e){} cam.mpCamera = null; }
    if (cam.stream) cam.stream.getTracks().forEach(t=>t.stop());
    cam.stream = null; cam.active = false;
    video.srcObject = null;
    $('#camChip').textContent = 'Inactive';
    $('#statusCam').querySelector('.dot').className = 'dot dot-amber';
  }

  async function switchCam() {
    cam.facing = cam.facing === 'user' ? 'environment' : 'user';
    await stop();
    await start();
    if (!cam.active) { // fallback if other camera missing
      cam.facing = cam.facing === 'user' ? 'environment' : 'user';
      await start();
    }
  }
  function toggleMirror() { cam.mirror = !cam.mirror; stage.classList.toggle('mirror', cam.mirror); }

  function initHands() {
    if (typeof Hands === 'undefined' || typeof Camera === 'undefined') {
      $('#statusAi').querySelector('.dot').className = 'dot dot-red';
      toast('AI hand-tracking failed to load (network blocked). Drawing still works.', 5000);
      return;
    }
    if (cam.hands) return;
    try {
      cam.hands = new Hands({ locateFile: (f)=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      // selfieMode:false → landmarks stay in raw camera coords so they align
      // with the <video> pixels. The CSS .mirror class then flips video AND
      // overlay together, keeping the skeleton glued to the hand.
      cam.hands.setOptions({
        maxNumHands: 1, modelComplexity: 1,
        minDetectionConfidence: 0.6, minTrackingConfidence: 0.6,
        selfieMode: false
      });
      cam.hands.onResults((res) => {
        drawOverlay(res);
        if (cam.onResults) cam.onResults(res);
      });
      cam.mpCamera = new Camera(video, {
        onFrame: async () => { if (cam.hands && cam.active) { try { await cam.hands.send({ image: video }); } catch(e){} } },
        width: 960, height: 720
      });
      cam.mpCamera.start();
      $('#statusAi').querySelector('.dot').className = 'dot dot-green';
    } catch (e) {
      console.error(e);
      $('#statusAi').querySelector('.dot').className = 'dot dot-red';
    }
  }

  function drawOverlay(res) {
    sizeOverlay();
    overlayCtx.clearRect(0,0,overlay.width,overlay.height);
    if (!res.multiHandLandmarks || !res.multiHandLandmarks.length) {
      $('#confBadge').textContent = 'Hand: --%';
      return;
    }
    const lm = res.multiHandLandmarks[0];
    const conf = Math.round((res.multiHandedness?.[0]?.score || 0)*100);
    $('#confBadge').textContent = `Hand: ${conf}%`;
    overlayCtx.lineWidth = 2; overlayCtx.strokeStyle = '#5ac8fa';
    overlayCtx.fillStyle = '#a06bff';
    const w = overlay.width, h = overlay.height;
    const CONN = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
    overlayCtx.beginPath();
    for (const [a,b] of CONN) {
      const pa = lm[a], pb = lm[b];
      overlayCtx.moveTo(pa.x*w, pa.y*h); overlayCtx.lineTo(pb.x*w, pb.y*h);
    }
    overlayCtx.stroke();
    for (const p of lm) { overlayCtx.beginPath(); overlayCtx.arc(p.x*w, p.y*h, 3, 0, Math.PI*2); overlayCtx.fill(); }
  }

  function setOnResults(fn) { cam.onResults = fn; }

  return { start, stop, switchCam, toggleMirror, applyFilters, setOnResults, sizeOverlay, cam };
})();
