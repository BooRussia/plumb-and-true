/* ================= core: helpers, materials, parts registry, stage ================= */
const V3 = THREE.Vector3;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const G = 0.125; // the standard 1/8" reveal

/* inches -> carpenter's fraction, nearest 1/32 */
function frac(v) {
  const neg = v < -1 / 64; v = Math.abs(v);
  let n = Math.round(v * 32); const whole = Math.floor(n / 32); n %= 32;
  if (!n) return (neg ? '−' : '') + whole + '″';
  let d = 32; while (n % 2 === 0) { n /= 2; d /= 2; }
  const glyph = { '1/2': '½', '1/4': '¼', '3/4': '¾', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞' }[n + '/' + d];
  return (neg ? '−' : '') + (whole ? whole + (glyph ? '' : ' ') : '') + (glyph || n + '/' + d) + '″';
}

/* ---------- materials ---------- */
const mk = (color, o = {}) => new THREE.MeshStandardMaterial({
  color, roughness: o.r ?? 0.78, metalness: o.m ?? 0, transparent: o.a != null, opacity: o.a ?? 1
});
const MT = {
  pine: mk(0xdfc392, { r: 0.9 }), pine2: mk(0xd2b27c, { r: 0.9 }), ply: mk(0xcdb38a, { r: 0.9 }),
  osb: mk(0xc4a468, { r: 0.95 }), wrap: mk(0xe7edf1, { r: 0.7 }), drywall: mk(0xedeae3, { r: 0.96 }),
  floor: mk(0xb99a72, { r: 0.7 }), concrete: mk(0xb4b2ab, { r: 0.95 }),
  jamb: mk(0xf4f2ec, { r: 0.55 }), trim: mk(0xf1efe9, { r: 0.55 }),
  door: mk(0x2c6168, { r: 0.5 }), doorPanel: mk(0x25545a, { r: 0.55 }),
  doorWood: mk(0x9a6a3c, { r: 0.6 }), doorWoodPanel: mk(0x87592f, { r: 0.65 }),
  doorWhite: mk(0xf2f0ea, { r: 0.5 }), doorWhitePanel: mk(0xe4e1d9, { r: 0.55 }),
  nickel: mk(0xc2c6ca, { m: 0.85, r: 0.32 }), brass: mk(0xcaa24a, { m: 0.85, r: 0.35 }),
  black: mk(0x2a2c30, { m: 0.5, r: 0.5 }), steel: mk(0x8c9299, { m: 0.8, r: 0.4 }), screw: mk(0xd9b23c, { m: 0.8, r: 0.4 }),
  shim: mk(0xc88c4e, { r: 0.92 }), glass: mk(0xa8d3e6, { a: 0.3, r: 0.05, m: 0.1 }),
  rubber: mk(0x2b2b2f, { r: 0.9 }), tape: mk(0x2f3640, { r: 0.55 }), pan: mk(0x7f93a3, { m: 0.25, r: 0.5 }),
  metal: mk(0xb9bfc5, { m: 0.75, r: 0.38 }), foam: mk(0xf0d98a, { r: 1 }), caulk: mk(0xfbfbf8, { r: 0.6 }), seal: mk(0x56626e, { r: 0.5 }), siding: mk(0x93a7a6, { r: 0.85 }),
  alu: mk(0xd6dadf, { m: 0.7, r: 0.35 }), frame: mk(0x3a4047, { m: 0.35, r: 0.5 }),
  level: mk(0xf2b90f, { r: 0.5 }), vial: mk(0xb9ef76, { a: 0.55, r: 0.2 }), bubble: mk(0xffffff, { r: 0.3 }),
  dim: new THREE.MeshBasicMaterial({ color: 0x1d6fb8 }),
  rub: new THREE.MeshBasicMaterial({ color: 0xe5392d, transparent: true, opacity: 0.9 }),
  light: new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.9 })
};

/* ---------- geometry helpers ---------- */
function bx(x0, x1, y0, y1, z0, z1, m) {
  const me = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), m);
  me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return me;
}
function cyl(r, len, m, axis, seg) {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg || 20), m);
  if (axis === 'x') me.rotation.z = Math.PI / 2;
  if (axis === 'z') me.rotation.x = Math.PI / 2;
  return me;
}
function at(o, x, y, z) { o.position.set(x, y, z); return o; }
function grp() {
  const g = new THREE.Group();
  for (const c of Array.from(arguments).flat(3)) if (c) g.add(c);
  return g;
}
/* tapered shim: length along z, width along y, thickness along x from t0 (−z end) to t1 (+z end) */
function wedgeGeo(len, wid, t0, t1) {
  const g = new THREE.BoxGeometry(1, wid, len), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (p.getZ(i) < 0 ? t0 : t1));
  g.computeVertexNormals();
  return g;
}

/* ---------- parts registry: every named piece of the model, with the step it arrives on ---------- */
class Parts {
  constructor(root) { this.root = root; this.list = []; this.map = new Map(); }
  add(name, obj, o = {}) {
    const p = {
      name, obj, step: o.step ?? 0, until: o.until ?? Infinity, only: !!o.only, when: o.when || null,
      from: new V3(...(o.from || [0, 0, 0])), label: o.label || '', desc: o.desc || '', xray: !!o.xray,
      hideInFix: !!o.hideInFix, anat: o.anat !== false && !!o.label, t: 0, home: obj.position.clone(), mats: [], meshes: []
    };
    obj.traverse(m => {
      if (!m.isMesh) return;
      m.material = m.material.clone();
      m.userData.part = name;
      const tr = m.material.transparent;
      m.castShadow = !tr && !o.noShadow; m.receiveShadow = !tr;
      if (m.material.emissive) { m.material.emissive.setHex(0xffa400); m.material.emissiveIntensity = 0; }
      p.mats.push({ m: m.material, o: m.material.opacity, tr }); p.meshes.push(m);
    });
    (o.parent || this.root).add(obj);
    this.list.push(p); this.map.set(name, p);
    return obj;
  }
  /* raw, always-visible helper geometry (not a part) */
  tick(dt, c) {
    for (const p of this.list) {
      let on;
      if (p.when) on = p.when(c.S, c.mode, c.k);
      else if (c.mode === 'install') on = p.step <= c.k && c.k < p.until && (!p.only || p.step === c.k);
      else on = !p.only && p.until === Infinity && !(c.mode === 'fix' && p.hideInFix);
      const tg = on ? 1 : 0;
      if (p.t !== tg) p.t = RM || c.snap ? tg : tg > p.t ? Math.min(1, p.t + dt / 0.75) : Math.max(0, p.t - dt / 0.4);
      const vis = p.t > 0.001;
      p.obj.visible = vis;
      if (!vis) continue;
      const e = easeOut(p.t);
      p.obj.position.copy(p.home).addScaledVector(p.from, 1 - e);
      const a = e * (p.xray ? c.xr : 1), glow = c.hl.has(p.name) ? c.pulse : 0;
      if (p.xray) { const cast = c.xr > 0.6; if (p.meshes[0].castShadow !== cast) for (const m of p.meshes) m.castShadow = cast; }
      for (const q of p.mats) {
        const op = q.o * a, tr = q.tr || op < 0.995;
        q.m.opacity = op;
        if (q.m.transparent !== tr) { q.m.transparent = tr; q.m.needsUpdate = true; }
        q.m.depthWrite = op > 0.6;
        if (q.m.emissive) q.m.emissiveIntensity = glow;
      }
    }
  }
  dispose() {
    this.root.traverse(m => { if (m.isMesh) { m.geometry.dispose(); m.material.dispose(); } });
    if (this.root.parent) this.root.parent.remove(this.root);
  }
}

/* ---------- stage: renderer, lights, orbit camera, picking ---------- */
const Stage = (() => {
  const wrap = $('#stage'), canvas = $('#gl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 2, 3000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb9a88f, 2.1));
  const key = new THREE.DirectionalLight(0xfff4e2, 2.5);
  key.position.set(80, 170, 130); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -130, right: 130, top: 130, bottom: -40, near: 20, far: 520 });
  key.shadow.bias = -0.0006; key.shadow.normalBias = 0.35;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight(0xdbe8ff, 0.9); fill.position.set(-90, 60, -120); scene.add(fill);

  const cam = { az: 0.45, el: 0.17, d: 200, t: new V3(0, 44, 0) };
  let goal = null, mirrored = false, fit = 1;
  const apply = () => {
    const ce = Math.cos(cam.el);
    camera.position.set(cam.t.x + cam.d * ce * Math.sin(cam.az), cam.t.y + cam.d * Math.sin(cam.el), cam.t.z + cam.d * ce * Math.cos(cam.az));
    camera.lookAt(cam.t);
  };
  function to(spec, instant) {
    let [az, el, d, x, y, z] = spec;
    if (mirrored) { az = -az; x = -x; }
    goal = { az: az * D2R, el: el * D2R, d: d * fit, t: new V3(x, y, z) };
    if (instant || RM) { cam.az = goal.az; cam.el = goal.el; cam.d = goal.d; cam.t.copy(goal.t); goal = null; apply(); }
  }
  function resize() {
    const w = wrap.clientWidth, hh = wrap.clientHeight; if (!w || !hh) return;
    renderer.setSize(w, hh, false);
    camera.aspect = w / hh; camera.updateProjectionMatrix();
    fit = clamp(1.25 / camera.aspect, 1, 2.3);
  }
  new ResizeObserver(resize).observe(wrap); resize();

  /* pointer: drag orbits, shift/right-drag pans, wheel or pinch zooms */
  const pts = new Map(); let moved = 0, downAt = 0, pinch = 0;
  const cb = { click: null, hover: null, user: null };
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY, b: e.button, sh: e.shiftKey });
    moved = 0; downAt = performance.now(); pinch = 0;
  });
  const pan = (dx, dy) => {
    const r = new V3().setFromMatrixColumn(camera.matrix, 0), u = new V3().setFromMatrixColumn(camera.matrix, 1), k = cam.d * 0.0013;
    cam.t.addScaledVector(r, -dx * k).addScaledVector(u, dy * k);
  };
  canvas.addEventListener('pointermove', e => {
    const p = pts.get(e.pointerId);
    if (!p) { cb.hover && cb.hover(e); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 4) { goal = null; cb.user && cb.user(); }
    if (pts.size === 2) {
      const [a, b] = [...pts.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) cam.d = clamp(cam.d * pinch / dist, 22, 520);
      pinch = dist; pan(dx / 2, dy / 2);
    } else if (p.b === 2 || p.sh) pan(dx, dy);
    else { cam.az -= dx * 0.0062; cam.el = clamp(cam.el + dy * 0.0062, -0.25, 1.52); }
  });
  const up = e => {
    const p = pts.get(e.pointerId); if (!p) return;
    pts.delete(e.pointerId); pinch = 0;
    if (moved < 6 && performance.now() - downAt < 450 && cb.click) cb.click(e);
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', e => pts.delete(e.pointerId));
  canvas.addEventListener('pointerleave', () => cb.hover && cb.hover(null));
  canvas.addEventListener('wheel', e => { e.preventDefault(); goal = null; cam.d = clamp(cam.d * Math.exp(e.deltaY * 0.0011), 22, 520); }, { passive: false });

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e, root) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    for (const hit of ray.intersectObject(root, true)) {
      let o = hit.object, ok = o.material.opacity > 0.4 || o.userData.pickAlways;
      while (ok && o && o !== root) { ok = o.visible; o = o.parent; }
      if (ok && hit.object.userData.part) return hit.object.userData.part;
    }
    return null;
  }
  const box = new THREE.Box3(), v = new V3();
  function project(obj, out) {
    box.setFromObject(obj); if (box.isEmpty()) return false;
    box.getCenter(v); v.project(camera);
    out.x = (v.x * 0.5 + 0.5) * wrap.clientWidth; out.y = (-v.y * 0.5 + 0.5) * wrap.clientHeight;
    return v.z < 1 && v.z > -1;
  }
  function frame(dt) {
    if (goal) {
      const k = 1 - Math.exp(-dt * 4.2);
      let da = goal.az - cam.az; da = Math.atan2(Math.sin(da), Math.cos(da));
      cam.az += da * k; cam.el += (goal.el - cam.el) * k; cam.d += (goal.d - cam.d) * k; cam.t.lerp(goal.t, k);
      if (Math.abs(da) < 0.002 && Math.abs(goal.d - cam.d) < 0.2 && cam.t.distanceTo(goal.t) < 0.1) goal = null;
    }
    apply();
    const lz = camera.position.z < cam.t.z ? -130 : 130;
    key.position.z += (lz - key.position.z) * Math.min(1, dt * 5);
    renderer.render(scene, camera);
  }
  return { scene, camera, to, frame, pick, project, cb, wrap, canvas, setMirror: m => { mirrored = m; }, get mirrored() { return mirrored; } };
})();
