/* Helper utilities */
window.VWB = window.VWB || {}; var VWB = window.VWB;
VWB.utils = (() => {
  const $ = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const lerp = (a,b,t) => a + (b-a)*t;
  const dist = (x1,y1,x2,y2) => Math.hypot(x2-x1,y2-y1);

  const toast = (msg, ms=2200) => {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(()=>el.classList.remove('show'), ms);
  };

  const download = (data, filename, type='application/octet-stream') => {
    const blob = data instanceof Blob ? data : new Blob([data], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1500);
  };

  const hexToRgba = (hex, a=1) => {
    const h = hex.replace('#','');
    const v = h.length===3 ? h.split('').map(c=>c+c).join('') : h;
    const n = parseInt(v,16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  };

  const throttle = (fn, ms) => {
    let last=0, timer=null, lastArgs;
    return (...args) => {
      const now = Date.now(); lastArgs = args;
      const remaining = ms - (now-last);
      if (remaining<=0) { last = now; fn(...args); }
      else if (!timer) { timer = setTimeout(()=>{ last=Date.now(); timer=null; fn(...lastArgs); }, remaining); }
    };
  };

  return { $, $$, clamp, lerp, dist, toast, download, hexToRgba, throttle };
})();
