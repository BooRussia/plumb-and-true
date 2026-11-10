/* ================= lib: shared model pieces and the hinged-door family ================= */

/* A door slab built from stiles, rails and recessed panels or glass. Origin: bottom-left, centred in thickness. */
function makeSlab(w, h, t, o = {}) {
  const g = new THREE.Group(), m = o.mat || MT.door, mp = o.panel || MT.doorPanel, z0 = -t / 2, z1 = t / 2;
  if (!o.rows) { g.add(bx(0, w, 0, h, z0, z1, m)); return g; }
  const sw = o.stile ?? 4.5, tr = o.top ?? 4.5, br = o.bottom ?? 8, mr = o.rail ?? 4.5, mu = o.mull ?? 4;
  g.add(bx(0, sw, 0, h, z0, z1, m), bx(w - sw, w, 0, h, z0, z1, m), bx(sw, w - sw, h - tr, h, z0, z1, m), bx(sw, w - sw, 0, br, z0, z1, m));
  const innerH = h - tr - br - mr * (o.rows.length - 1);
  let y = h - tr;
  o.rows.forEach((r, i) => {
    const rh = innerH * r.f, y0 = y - rh, cols = r.cols || 1, cw = (w - 2 * sw - mu * (cols - 1)) / cols;
    for (let c = 0; c < cols; c++) {
      const x0 = sw + c * (cw + mu), x1 = x0 + cw;
      if (r.glass) {
        g.add(bx(x0, x1, y0, y, -0.1, 0.1, MT.glass));
        const [lc, lr] = r.lites || [1, 1];
        for (let a = 1; a < lc; a++) { const xm = x0 + cw * a / lc; g.add(bx(xm - 0.4, xm + 0.4, y0, y, z0 + 0.3, z1 - 0.3, m)); }
        for (let b = 1; b < lr; b++) { const ym = y0 + rh * b / lr; g.add(bx(x0, x1, ym - 0.4, ym + 0.4, z0 + 0.3, z1 - 0.3, m)); }
      } else {
        g.add(bx(x0, x1, y0, y, z0 + 0.32, z1 - 0.32, mp));
        if (o.raised) g.add(bx(x0 + 1.4, x1 - 1.4, y0 + 1.4, y - 1.4, z0 + 0.14, z1 - 0.14, m));
      }
      if (c < cols - 1) g.add(bx(x1, x1 + mu, y0, y, z0, z1, m));
    }
    y = y0;
    if (i < o.rows.length - 1) { g.add(bx(sw, w - sw, y - mr, y, z0, z1, m)); y -= mr; }
  });
  return g;
}

/* lever lockset centred on the bore; latch edge is at +2⅜″ */
function leverSet(t, m) {
  const one = () => grp(at(cyl(1.2, 0.3, m, 'z'), 0, 0, 0.15), at(cyl(0.38, 1.5, m, 'z'), 0, 0, 0.9), bx(-4.3, 0.45, -0.32, 0.32, 1.35, 1.85, m));
  const f = one(); f.position.z = t / 2;
  const b = one(); b.position.z = -t / 2; b.scale.z = -1;
  return grp(f, b, bx(2.375, 2.85, -0.33, 0.33, -0.3, 0.3, m), bx(2.36, 2.41, -1.1, 1.1, -0.5, 0.5, m));
}
function deadbolt(t, m, inSide) {
  return grp(at(cyl(1.15, 0.35, m, 'z'), 0, 0, t / 2 + 0.17), at(cyl(1.15, 0.35, m, 'z'), 0, 0, -t / 2 - 0.17),
    bx(-0.22, 0.22, -0.7, 0.7, inSide * (t / 2 + 0.35), inSide * (t / 2 + 0.95), m), bx(2.375, 3.3, -0.4, 0.4, -0.3, 0.3, m));
}

/* a 4-ft box level; set(t) moves the plumb bubbles, setL(t) the centre bubble */
function makeLevel(len) {
  const g = new THREE.Group(); g.add(bx(0, 2.3, -len / 2, len / 2, -0.5, 0.5, MT.level));
  const vial = (y, horiz) => {
    g.add(horiz ? bx(0.3, 2.0, y - 0.32, y + 0.32, -0.53, 0.53, MT.vial) : bx(0.83, 1.47, y - 0.85, y + 0.85, -0.53, 0.53, MT.vial));
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 8), MT.bubble);
    b.position.set(1.15, y, 0); b.scale.set(horiz ? 1.5 : 1, horiz ? 1 : 1.5, 2.2); g.add(b); return b;
  };
  const a = vial(len / 2 - 4.5, true), c = vial(0, false), b = vial(-len / 2 + 4.5, true);
  return {
    g,
    set(t) { const d = clamp(t * 1.7, -0.55, 0.55); a.position.x = b.position.x = 1.15 + d; },
    setL(t) { c.position.y = clamp(t * 1.7, -0.55, 0.55); }
  };
}

function shimPair(x, y, gap, flat) {
  const a = new THREE.Mesh(wedgeGeo(9.5, 1.4, 0.04, gap * 1.5), MT.shim); a.position.z = 1.6;
  const b = new THREE.Mesh(wedgeGeo(9.5, 1.4, gap * 1.5, 0.04), MT.shim); b.position.z = -1.6;
  const g = grp(a, b); g.position.set(x, y, 0); if (flat) g.rotation.z = Math.PI / 2;
  return g;
}
const shimCut = (x, y, gap, flat) => flat ? bx(x - 0.7, x + 0.7, y - gap / 2, y + gap / 2, -2.2, 2.2, MT.shim) : bx(x - gap / 2, x + gap / 2, y - 0.7, y + 0.7, -2.2, 2.2, MT.shim);
/* fastener driven along x; `into` is the direction of travel (−1 or +1); head sits at x */
function fastener(x, y, z, into, len, m, r) {
  r = r || 0.07;
  return grp(at(cyl(r, len, m, 'x', 10), x + into * len / 2, y, z), at(cyl(r * 2.3, 0.08, m, 'x', 12), x - into * 0.03, y, z));
}
function casingSet(side, inL, inR, yH, y0) {
  const zf = side * 2.25, zo = side * 2.97, a = Math.min(zf, zo), b = Math.max(zf, zo), w = 3.5, rv = 0.19, m = MT.trim;
  return grp(bx(inL - rv - w, inL - rv, y0 || 0, yH + rv, a, b, m), bx(inR + rv, inR + rv + w, y0 || 0, yH + rv, a, b, m),
    bx(inL - rv - w - 0.6, inR + rv + w + 0.6, yH + rv, yH + rv + 4.6, Math.min(zf, side * 3.12), Math.max(zf, side * 3.12), m));
}

/* ---------- stud wall with a rough opening ---------- */
function buildWall(P, o) {
  const z0 = -1.75, z1 = 1.75, H = o.H || 96, cx = o.cx || 0, roW = o.roW, roH = o.roH, hh = o.hh ?? 5.5;
  const L = cx - roW / 2, R = cx + roW / 2, half = o.W ? o.W / 2 : Math.ceil((roW / 2 + 26) / 8) * 8;
  const xa = -half, xb = half, e = o.ext ? o.e : 0, pn = MT.pine, p2 = MT.pine2;
  P.add('plate', grp(bx(xa, L, 0, 1.5, z0, z1, p2), bx(R, xb, 0, 1.5, z0, z1, p2), bx(xa, xb, H - 3, H - 1.5, z0, z1, p2), bx(xa, xb, H - 1.5, H, z0, z1, pn)),
    { label: 'Plates', desc: 'Bottom plate, cut out of the opening, and the doubled top plate.' });
  P.add('king', grp(bx(L - 3, L - 1.5, 1.5, H - 3, z0, z1, pn), bx(R + 1.5, R + 3, 1.5, H - 3, z0, z1, pn)),
    { label: 'King studs', desc: 'Full-height studs on each side of the opening.' });
  P.add('trimmer', grp(bx(L - 1.5, L, 1.5, roH, z0, z1, pn), bx(R, R + 1.5, 1.5, roH, z0, z1, pn)),
    { label: 'Trimmer (jack) studs', desc: 'Carry the header. The jambs are shimmed and fastened to these.' });
  P.add('header', bx(L - 1.5, R + 1.5, roH, roH + hh, z0, z1, p2), { label: 'Header', desc: 'Spans the opening and sets the rough-opening height.' });
  const studs = [];
  for (let x = xa; x < xb - 1.6; x += 16) {
    if (x + 1.5 <= L - 3.01 || x >= R + 3.01) studs.push(bx(x, x + 1.5, 1.5, H - 3, z0, z1, pn));
    else if (x > L && x + 1.5 < R && roH + hh < H - 4) studs.push(bx(x, x + 1.5, roH + hh, H - 3, z0, z1, pn));
  }
  studs.push(bx(xb - 1.5, xb, 1.5, H - 3, z0, z1, pn));
  if (roH + hh < H - 4) studs.push(bx(L - 1.5, L, roH + hh, H - 3, z0, z1, pn), bx(R, R + 1.5, roH + hh, H - 3, z0, z1, pn));
  P.add('stud', grp(studs), { label: 'Studs and cripples', desc: 'Common studs at 16″ on centre, with short cripples above the header.' });
  const sheet = (side, m, a, b) => grp(bx(xa, L, 0, H, side * a, side * b, m), bx(R, xb, 0, H, side * a, side * b, m), bx(L, R, roH, H, side * a, side * b, m));
  const dry = { xray: true, label: 'Drywall', desc: 'Half-inch drywall. A 2×4 wall finishes at 4½″ thick, which is why stock jambs are 4 9/16″ wide.' };
  if (e) {
    P.add('dwI', sheet(-e, MT.drywall, 1.75, 2.25), dry);
    P.add('sheath', grp(sheet(e, MT.osb, 1.75, 2.19), sheet(e, MT.wrap, 2.19, 2.25)), { label: 'Sheathing and housewrap', desc: 'The weather barrier. Every piece of flashing laps over the piece below it, like shingles.' });
    const zi = [Math.min(e * 1.75, -e * 56), Math.max(e * 1.75, -e * 56)], zx = [Math.min(e * 1.75, e * 46), Math.max(e * 1.75, e * 46)];
    P.add('floor', grp(bx(xa - 4, xb + 4, -1, 0, zi[0], zi[1], MT.floor), bx(xa - 4, xb + 4, -3, -1.5, zx[0], zx[1], MT.concrete)), { anat: false, noShadow: true });
  } else {
    P.add('dwF', sheet(1, MT.drywall, 1.75, 2.25), dry);
    P.add('dwB', sheet(-1, MT.drywall, 1.75, 2.25), { xray: true });
    P.add('floor', bx(xa - 4, xb + 4, -1, 0, -46, 56, MT.floor), { anat: false, noShadow: true });
  }
  return { L, R, roW, roH, H, xa, xb, e };
}
function dimParts(P, W, step, z) {
  z = z == null ? 2.5 : z; const t = 0.16, m = MT.dim, y = Math.min(52, W.roH * 0.6), x = W.L + (W.R - W.L) * 0.3;
  P.add('dimW', grp(bx(W.L, W.R, y - t, y + t, z, z + 0.1, m), bx(W.L, W.L + 0.3, y - 2, y + 2, z, z + 0.1, m), bx(W.R - 0.3, W.R, y - 2, y + 2, z, z + 0.1, m)), { step, only: true, anat: false, noShadow: true });
  P.add('dimH', grp(bx(x - t, x + t, 0, W.roH, z, z + 0.1, m), bx(x - 2, x + 2, 0, 0.3, z, z + 0.1, m), bx(x - 2, x + 2, W.roH - 0.3, W.roH, z, z + 0.1, m)), { step, only: true, anat: false, noShadow: true });
}

/* ---------- exterior weather details ---------- */
function sillPan(P, W, e, step) {
  const L = W.L, R = W.R, zi = -e * 2.25, zo = e * 2.9, a = Math.min(zi, zo), b = Math.max(zi, zo), m = MT.pan;
  P.add('sillPan', grp(bx(L, R, 0, 0.07, a, b, m), bx(L, R, 0, 0.6, Math.min(zi, zi + e * 0.07), Math.max(zi, zi + e * 0.07), m),
    bx(L, L + 0.07, 0, 6, a, b, m), bx(R - 0.07, R, 0, 6, a, b, m), bx(L - 1.5, R + 1.5, -2.4, 0.07, Math.min(zo, zo - e * 0.07), Math.max(zo, zo - e * 0.07), m)),
    { step, from: [0, 0, e * 14], label: 'Sill pan', desc: 'A tray under the sill with a back dam and end dams. Water that gets past the door drains out instead of into the subfloor.' });
}
function sealant(P, W, e, step, xo, yo) {
  const beads = [0.9, -0.4, -1.6].map(z => at(cyl(0.2, W.roW - 1, MT.seal, 'x', 8), (W.L + W.R) / 2, 0.2, -e * z));
  const zs = e * 2.27, t = 0.22, zz = [Math.min(zs, zs + e * 0.1), Math.max(zs, zs + e * 0.1)];
  P.add('sealant', grp(beads, bx(W.L - xo, W.L - xo + t, 0, W.roH + yo, zz[0], zz[1], MT.seal), bx(W.R + xo - t, W.R + xo, 0, W.roH + yo, zz[0], zz[1], MT.seal),
    bx(W.L - xo, W.R + xo, W.roH + yo - t, W.roH + yo, zz[0], zz[1], MT.seal)),
    { step, from: [0, 0, e * 6], noShadow: true, label: 'Sealant beads', desc: 'Continuous beads on the sill and behind the exterior trim or nailing fin. No gaps at the corners.' });
}
function exteriorFlash(P, o) {
  const e = o.e, zs = e * 2.25, z = (a, b) => [Math.min(zs + e * a, zs + e * b), Math.max(zs + e * a, zs + e * b)];
  const [s0, s1] = z(o.lift || 0, (o.lift || 0) + 0.06);
  P.add('flashSides', grp(bx(o.xL - 4, o.xL + (o.lap || 0), -1, o.yTop + 2, s0, s1, MT.tape), bx(o.xR - (o.lap || 0), o.xR + 4, -1, o.yTop + 2, s0, s1, MT.tape)),
    { step: o.st, from: [0, 0, e * 10], noShadow: true, label: 'Side flashing tape', desc: 'Goes on after the sill and before the head, so each layer sheds water onto the one below.' });
  const [c0, c1] = z(0, o.capD), [d0, d1] = z(o.capD - 0.06, o.capD), [v0, v1] = z(0, 0.06);
  P.add('dripCap', grp(bx(o.xL - 0.5, o.xR + 0.5, o.yTop, o.yTop + 0.07, c0, c1, MT.metal), bx(o.xL - 0.5, o.xR + 0.5, o.yTop - 0.5, o.yTop, d0, d1, MT.metal), bx(o.xL - 0.5, o.xR + 0.5, o.yTop, o.yTop + 2.6, v0, v1, MT.metal)),
    { step: o.st, from: [0, 8, e * 8], label: 'Drip cap', desc: 'Z-shaped metal over the head trim. It kicks water out past the face of the door.' });
  const [h0, h1] = z(0.07, 0.14);
  P.add('flashHead', bx(o.xL - 6, o.xR + 6, o.yTop + 0.6, o.yTop + 4.6, h0, h1, MT.tape),
    { step: o.st, from: [0, 10, e * 12], noShadow: true, label: 'Head flashing tape', desc: 'Last piece on. It covers the drip-cap flange and laps over both side tapes.' });
}

/* finished-wall cladding, shown only outside of the install and troubleshooting views */
function siding(P, W, e, xL, xR, yTop) {
  const zs = e * 2.25, a = Math.min(zs + e * 0.16, zs + e * 0.7), b = Math.max(zs + e * 0.16, zs + e * 0.7), bs = [];
  const bx0 = bx, clap = (x0, x1, y0, y1) => { const me = bx0(x0, x1, y0, y1, a, b, MT.siding), p = me.geometry.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0 && p.getZ(i) * e > 0) p.setZ(i, p.getZ(i) - e * 0.36); me.geometry.computeVertexNormals(); return me; };
  for (let y = 0; y < W.H - 0.5; y += 6) {
    const y1 = Math.min(W.H, y + 6);
    if (y >= yTop) bs.push(clap(W.xa, W.xb, y, y1));
    else { const t = Math.min(y1, yTop); bs.push(clap(W.xa, xL, y, t), clap(xR, W.xb, y, t)); if (y1 > yTop + 0.5) bs.push(clap(W.xa, W.xb, yTop, y1)); }
  }
  P.add('siding', grp(bs), { xray: true, when: (s, mode) => mode === 'view', label: 'Siding', desc: 'Covers the flashing. Everything that keeps water out is behind it, so it has to be right before the siding goes on.', anat: false });
}

/* ---------- one hinge jamb with its door leaf ---------- */
function hingeSide(P, o) {
  const pre = o.pre || '', zJ = o.jd / 2, jH = o.jTop - o.y0, hw = o.hw;
  const hs = new THREE.Group(); hs.position.set(o.x, o.y0, 0); o.parent.add(hs);
  const tilt = new THREE.Group(); hs.add(tilt);
  const zs1 = zJ - o.dt - 0.04, zs0 = o.ext ? -zJ : zs1 - 1.25, stT = o.ext ? 0.5 : 0.4;
  const jm = grp(bx(-o.jt, 0, 0, jH, -zJ, zJ, MT.jamb), bx(0, stT, 0, jH - o.jt, zs0, zs1, MT.jamb));
  if (o.ext) jm.add(bx(0.06, stT, 1.1, jH - o.jt, zs1 - 0.03, zs1 + 0.03, MT.rubber));
  P.add(pre + 'jambH', jm, { parent: tilt, step: o.step, label: o.jambLabel || 'Hinge jamb', desc: 'The side that carries the door. Get this one plumb first and everything else follows from it.', anat: !pre });
  const yT = o.yB + o.dh, yTH = yT - 8.75, yBH = o.yB + 12.75, yMH = (yTH + yBH) / 2, px = 0.04, pz = zJ + 0.26;
  const hg = new THREE.Group();
  [yTH, yMH, yBH].forEach(y => hg.add(at(cyl(0.27, 3.5, hw, 'y'), px, y - o.y0, pz), at(cyl(0.19, 3.9, hw, 'y'), px, y - o.y0, pz), bx(0, 0.05, y - o.y0 - 1.75, y - o.y0 + 1.75, zJ - 1.5, zJ, hw)));
  P.add(pre + 'hinges', hg, { parent: tilt, step: o.step, label: 'Hinges', desc: 'Three 3½″ butt hinges. The top one takes most of the pull, so it gets the long screw.', anat: !pre });
  const stage = new THREE.Group(); tilt.add(stage);
  const leaf = new THREE.Group(); leaf.position.set(px, -o.y0, pz);
  const sagG = new THREE.Group(); sagG.position.y = yBH; leaf.add(sagG);
  const body = new THREE.Group(); body.position.y = -yBH; sagG.add(body);
  const ex = G - px;
  body.add(at(makeSlab(o.dw, o.dh, o.dt, o.slab), ex, o.yB, -0.26 - o.dt / 2));
  [yTH, yMH, yBH].forEach(y => body.add(bx(ex - 0.05, ex, y - 1.75, y + 1.75, -0.26 - 1.5, -0.26, hw)));
  P.add(pre + 'door', leaf, { parent: stage, step: o.doorStep ?? o.step, label: o.doorLabel || 'Door slab', desc: o.doorDesc || 'Click it to swing it open or shut.', anat: !pre });
  return { hs, tilt, stage, leaf, sagG, body, yTH, yBH, yMH, px, pz, zJ, ex, zs0, zs1, stT };
}

/* ---------- single hinged door: interior prehung, exterior inswing/outswing, slab-in-old-jamb ---------- */
function buildSwing(P, o) {
  const ext = o.kind === 'in' || o.kind === 'out', slabJob = o.kind === 'slab', e = o.kind === 'out' ? 1 : -1;
  const dw = o.dw, dt = ext ? 1.75 : 1.375, jt = ext ? 0.75 : 0.625, jd = 4.56, zJ = jd / 2;
  const yB = ext ? 1.25 : 0.75, dh = ext ? 79.25 : 80, yT = yB + dh, yHd = yT + G, jTop = yHd + jt;
  const inL = -dw / 2 - G, inR = dw / 2 + G, gapS = ext ? 0.375 : 0.25, S = o.st, hw = ext ? MT.black : MT.nickel;
  const roW = dw + 2 * G + 2 * jt + 2 * gapS, roH = 82.5;
  const W = buildWall(P, { roW, roH, ext, e, W: o.W });
  if (S.dims != null) dimParts(P, W, S.dims, ext ? e * 2.5 : 2.5);
  const unit = new THREE.Group(); P.root.add(unit);
  const HS = hingeSide(P, { parent: unit, x: inL, y0: 0, jTop, dw, dh, dt, yB, jt, jd, ext, hw, step: S.unit, doorStep: S.door, slab: o.slab });
  const lat = new THREE.Group(); lat.position.set(inR, 0, 0); unit.add(lat);
  const latIn = new THREE.Group(); lat.add(latIn);
  const jl = grp(bx(0, jt, 0, jTop, -zJ, zJ, MT.jamb), bx(-HS.stT, 0, 0, jTop - jt, HS.zs0, HS.zs1, MT.jamb));
  if (ext) jl.add(bx(-HS.stT, -0.06, 1.1, jTop - jt, HS.zs1 - 0.03, HS.zs1 + 0.03, MT.rubber));
  P.add('jambL', jl, { parent: latIn, step: S.unit, label: 'Latch jamb', desc: 'Also called the strike jamb. It is adjusted last, to match the edge of the door.' });
  P.add('jambHd', grp(bx(inL, inR, yHd, jTop, -zJ, zJ, MT.jamb), bx(inL + HS.stT, inR - HS.stT, yHd - HS.stT, yHd, HS.zs0, HS.zs1, MT.jamb)),
    { parent: unit, step: S.unit, label: 'Head jamb', desc: 'Its gap to the top of the door tells you whether the hinge jamb is plumb and the floor is level.' });
  const fz = ext ? e : 1;

  /* lockset, strike */
  const lk = leverSet(dt, hw); lk.position.set(HS.ex + dw - 2.375, 36, -0.26 - dt / 2);
  P.add('lockset', lk, { parent: HS.body, step: S.lock, from: [0, 0, 5], label: 'Lockset', desc: 'Latch centred 36″ off the floor, at a 2⅜″ or 2¾″ backset.' });
  if (ext) { const db = deadbolt(dt, hw, -e); db.position.set(HS.ex + dw - 2.375, 42, -0.26 - dt / 2); P.add('deadbolt', db, { parent: HS.body, step: S.lock, from: [0, 0, 5], label: 'Deadbolt', desc: 'Needs a full 1″ throw into the jamb and 3″ strike screws that reach the trimmer stud.' }); }
  const strike = bx(-0.05, 0, 34.9, 37.1, zJ - dt - 0.2, zJ - 0.15, hw);
  P.add('strike', strike, { parent: latIn, step: S.lock, from: [-4, 0, 0], label: 'Strike plate', desc: 'Where the latch lands. Its position sets how tightly the door sits against the stop.' });

  /* shims and fasteners */
  const xsL = inL - jt - gapS / 2, xsR = inR + jt + gapS / 2, hy = [HS.yTH, HS.yMH, HS.yBH], ly = [HS.yTH, 36, HS.yBH];
  const fm = ext ? MT.screw : MT.steel, fl = ext ? 3 : 2.4, fr = ext ? 0.09 : 0.06;
  P.add('shimsH', grp(hy.map(y => shimPair(xsL, y - 2.6, gapS))), { step: S.hinge, until: S.trim, from: [0, 0, 7], label: 'Hinge-side shims', desc: 'Opposing pairs, one from each side of the wall, set right behind each hinge.' });
  P.add('nailsH', grp(hy.map(y => [fastener(inL, y - 2.6, 1.3, -1, fl, fm, fr), fastener(inL, y - 2.6, -1.5, -1, fl, fm, fr)])), { step: S.hinge, from: [5, 0, 0], label: ext ? 'Jamb screws' : 'Finish nails', desc: 'Always driven through the shims, never through an unsupported gap.' });
  P.add('shimsL', grp(ly.map(y => shimPair(xsR, y - (y === 36 ? 3 : 2.6), gapS))), { step: S.latch, until: S.trim, from: [0, 0, 7], label: 'Latch-side shims', desc: 'Top, bottom and just above or below the strike. These set the reveal.' });
  P.add('nailsL', grp(ly.map(y => [fastener(inR, y - (y === 36 ? 3 : 2.6), 1.3, 1, fl, fm, fr), fastener(inR, y - (y === 36 ? 3 : 2.6), -1.5, 1, fl, fm, fr)])), { step: S.latch, from: [-5, 0, 0], anat: false });
  P.add('shimsCut', grp(hy.map(y => shimCut(xsL, y - 2.6, gapS)), ly.map(y => shimCut(xsR, y - (y === 36 ? 3 : 2.6), gapS))), { step: S.trim, anat: false });
  P.add('longScrew', fastener(inL + 0.05, HS.yTH + 0.6, zJ - 0.75, -1, 3, MT.screw, 0.09), {
    from: [6, 0, 0], when: (s, mode, k) => s.longScrew > 0.5 && (mode !== 'install' || k >= S.screw),
    label: '3″ hinge screw', desc: 'Replaces one short screw in the top hinge and ties the jamb, shims and trimmer stud together.'
  });
  P.add('hingeShim', bx(inL, inL + 0.04, HS.yBH - 1.75, HS.yBH + 1.75, zJ - 1.5, zJ, MT.shim), { anat: false, when: s => s.hingeShim > 0.5 });

  /* trim */
  const cz = ext ? -e : 1;
  P.add('casingF', casingSet(cz, inL, inR, yHd), { step: S.casing, from: [0, 0, cz * 12], hideInFix: true, label: 'Casing', desc: 'Set back 3/16″ from the inside edge of the jamb. That step is called the reveal.' });
  if (!ext) P.add('casingB', casingSet(-1, inL, inR, yHd), { step: S.casing, from: [0, 0, -12], anat: false });

  /* exterior-only parts */
  let cap = null, light = null;
  if (ext) {
    const xo = jt + 1.6;
    sillPan(P, W, e, S.pan); sealant(P, W, e, S.seal, 1.1 - gapS, jTop + 1.1 - roH);
    const za = Math.min(e * 3.9, -e * 2.25), zb = Math.max(e * 3.9, -e * 2.25);
    const sill = grp(bx(inL - jt, inR + jt, 0.07, 0.6, za, zb, MT.alu));
    if (e > 0) sill.add(bx(inL, inR, 0.6, 1.55, -zJ, HS.zs1, MT.alu), bx(inL, inR, 1.1, 1.5, HS.zs1 - 0.03, HS.zs1 + 0.03, MT.rubber));
    P.add('sill', sill, { parent: unit, step: S.unit, label: e > 0 ? 'Outswing sill' : 'Inswing sill', desc: e > 0 ? 'The door closes against a raised bump on the inside edge, so wind pushes it tighter against the seal.' : 'Slopes to the outside. The adjustable cap under the door seals against the sweep.' });
    cap = bx(inL, inR, 0.6, 1.05, zJ - dt - 0.25, zJ + 0.1, MT.doorWood);
    P.add('cap', grp(cap), { parent: unit, step: S.unit, label: 'Adjustable threshold cap', desc: 'Four or five screws raise or lower it until the sweep just seals.' });
    HS.body.add(bx(HS.ex, HS.ex + dw, yB - 0.2, yB, -0.26 - dt, -0.26, MT.rubber));
    light = bx(inL, inR, 1.05, 1.06, zJ - dt, zJ, MT.light); light.visible = false; unit.add(light);
    const zs = e * 2.25, ma = Math.min(zs, zs + e * 1.25), mb = Math.max(zs, zs + e * 1.25);
    P.add('brickmould', grp(bx(inL - xo, inL - 0.12, 0.6, jTop + 1.6, ma, mb, MT.trim), bx(inR + 0.12, inR + xo, 0.6, jTop + 1.6, ma, mb, MT.trim), bx(inL - 0.12, inR + 0.12, yHd + 0.12, jTop + 1.6, ma, mb, MT.trim)),
      { parent: unit, step: S.unit, label: 'Brickmould', desc: 'Factory exterior trim. It bridges the gap between the frame and the sheathing and gets caulked behind.' });
    exteriorFlash(P, { e, xL: inL - xo, xR: inR + xo, yTop: jTop + 1.6, capD: 1.6, st: S.flash });
    siding(P, W, e, inL - xo, inR + xo, jTop + 1.6);
    const fz0 = Math.min(-e * 0.3, -e * 2.1), fz1 = Math.max(-e * 0.3, -e * 2.1);
    P.add('foam', grp(bx(W.L, inL - jt, 0.6, jTop, fz0, fz1, MT.foam), bx(inR + jt, W.R, 0.6, jTop, fz0, fz1, MT.foam), bx(W.L, W.R, jTop, roH, fz0, fz1, MT.foam)),
      { step: S.foam, noShadow: true, label: 'Low-expansion foam', desc: 'Door-and-window foam only. The high-expansion kind bows the jambs inward until the door binds.' });
  }

  /* level, rub markers */
  const lv = makeLevel(48); lv.g.position.set(0, 42, -1.5);
  P.add('level', lv.g, { parent: HS.tilt, when: s => s.lvl > 0.5, anat: false, label: 'Level', desc: 'Read the vial at the top. Centred bubble means plumb.' });
  const rub = { t: bx(inR - 0.07, inR + 0.02, yT - 9, yT - 0.4, zJ - dt, zJ + 0.06, MT.rub), b: bx(inR - 0.07, inR + 0.02, yB + 0.4, yB + 9, zJ - dt, zJ + 0.06, MT.rub),
    h: bx(inR - 10, inR - 0.4, yHd - 0.05, yHd + 0.04, zJ - dt, zJ + 0.06, MT.rub), f: bx(inR - 10, inR - 0.4, yB - 0.25, yB + 0.05, zJ - dt, zJ + 0.06, MT.rub) };
  Object.values(rub).forEach(r => { r.visible = false; unit.add(r); });

  let v = 0, tt = 0;
  const hsp = HS.yTH - HS.yBH, gapB = ext ? 0 : yB;
  function update(s, dt2, c) {
    tt += dt2;
    (slabJob ? HS.stage : unit).position.z = s.stage * 34 * fz;
    if (slabJob) HS.stage.position.x = s.stage * 6;
    unit.rotation.z = -s.rack / dh;
    const tw = s.lean / dh, to = s.leanOut / dh, lo = s.hingeBind * 7 * D2R + Math.max(0, -s.strikeZ) * 1.2 * D2R * 8;
    let th = s.swing * D2R;
    if (!c.tw.has('swing') && !c.hold) {
      let tq = 130 * (-Math.sin(th) * tw + Math.cos(th) * to);
      const fr = 0.05 + s.pinBend * 1.3;
      if (Math.abs(v) < 0.01 && Math.abs(tq) <= fr) v = 0;
      else { tq -= Math.sign(v || tq) * fr * 0.7; v += tq * dt2; v *= Math.exp(-dt2 * 0.9); th += v * dt2; }
      if (th < lo) { th += (lo - th) * Math.min(1, dt2 * 6); v = 0; }
      if (th > 112 * D2R) { th = 112 * D2R; v = -v * 0.2; }
      s.swing = th / D2R;
    } else v = 0;
    const rattle = s.strikeZ > 0.03 && th < 0.02 ? (s.strikeZ / dw) * (0.5 + 0.5 * Math.sin(tt * 19)) : 0;
    HS.tilt.rotation.z = -tw; HS.tilt.rotation.x = to;
    HS.leaf.rotation.y = -(th + rattle);
    const a2 = (s.sag - s.botShim) / hsp;
    HS.sagG.rotation.z = -a2; HS.sagG.position.x = s.botShim;
    HS.body.scale.x = 1 + s.swell / dw;
    latIn.rotation.z = -(s.latchTop - s.latchBot) / dh; latIn.position.x = s.latchBot; latIn.rotation.x = -s.latchZ / dh; latIn.position.z = s.latchZ;
    lv.set(-(s.lean + s.rack) * 2);
    const dxT = tw * yT + a2 * (yT - HS.yBH) + s.botShim, dxB = tw * yB + a2 * (yB - HS.yBH) + s.botShim, drop = tw * (G + dw) + a2 * dw;
    const gH = G + drop, gT = G + s.latchTop - dxT - s.swell, gBt = G + s.latchBot - dxB - s.swell, gF = gapB - drop - s.thresh;
    const closed = th < 0.12;
    rub.t.visible = closed && gT < 0.02; rub.b.visible = closed && gBt < 0.02; rub.h.visible = closed && gH < 0.02; rub.f.visible = closed && !ext && gF < 0.05;
    const st = g => g < 0.02 ? 'bad' : g < 0.07 || g > 0.2 ? 'warn' : 'ok', tx = g => g < 0.02 ? 'Rubbing' : frac(g);
    const out = [['Head gap at latch side', tx(gH), st(gH)], ['Latch gap, top', tx(gT), st(gT)], ['Latch gap, bottom', tx(gBt), st(gBt)]];
    if (ext) {
      if (cap) cap.position.y = 0.825 + s.thresh;
      if (light) light.visible = closed && gF > 0.03;
      out.push(['Threshold seal', gF > 0.03 ? 'Daylight, ' + frac(gF) : gF < -0.05 ? 'Dragging' : 'Sealed', Math.abs(gF) > 0.05 || gF > 0.03 ? 'bad' : 'ok']);
    } else out.push(['Floor gap at latch side', gF < 0.05 ? 'Dragging' : frac(gF), gF < 0.05 ? 'bad' : gF < 0.3 ? 'warn' : 'ok']);
    const mis = Math.abs(-drop - s.strikeY);
    out.push(['Latch', mis > 0.19 ? 'Hits the strike plate' : s.hingeBind > 0.2 ? 'Door springs back open' : s.strikeZ > 0.03 ? 'Catches, but rattles' : s.strikeZ < -0.03 ? 'Needs a shove' : 'Catches cleanly',
      mis > 0.19 || s.hingeBind > 0.2 ? 'bad' : Math.abs(s.strikeZ) > 0.03 ? 'warn' : 'ok']);
    const pl = Math.max(Math.abs(s.lean), Math.abs(s.leanOut));
    out.push(['Hinge jamb', pl < 0.03 ? 'Plumb' : frac(pl) + ' out of plumb', pl < 0.03 ? 'ok' : pl < 0.13 ? 'warn' : 'bad']);
    if (Math.abs(s.latchZ) > 0.02) out.push(['Door against stop', 'Gap of ' + frac(Math.abs(s.latchZ)) + ' at one end', 'bad']);
    return out;
  }
  return {
    update, W,
    defaults: { swing: 0, stage: 0, rack: 0, lean: 0, leanOut: 0, sag: 0, botShim: 0, latchTop: 0, latchBot: 0, latchZ: 0, swell: 0, strikeY: 0, strikeZ: 0, hingeBind: 0, pinBend: 0, longScrew: 1, hingeShim: 0, thresh: 0, lvl: 0 },
    params: {
      swing: ['Swing the door', 0, 110, 1, '°'], rack: ['Whole unit leaning in the opening', -0.5, 0.5, 1 / 32, 'in'],
      lean: ['Hinge jamb lean, side to side', -0.5, 0.5, 1 / 32, 'in'], leanOut: ['Hinge jamb lean, in or out of the wall', -0.5, 0.5, 1 / 32, 'in'],
      sag: ['Top hinge pulled away from the stud', -0.06, 0.25, 1 / 64, 'in'], botShim: ['Shim behind the bottom hinge', 0, 0.125, 1 / 64, 'in'],
      latchTop: ['Latch jamb, top shim', -0.19, 0.25, 1 / 64, 'in'], latchBot: ['Latch jamb, bottom shim', -0.19, 0.25, 1 / 64, 'in'],
      latchZ: ['Latch jamb twisted out of the wall plane', -0.375, 0.375, 1 / 32, 'in'],
      swell: ['Door swollen with humidity', 0, 0.19, 1 / 64, 'in'], strikeY: ['Strike plate height', -0.375, 0.375, 1 / 32, 'in'],
      strikeZ: ['Strike plate distance from the stop', -0.125, 0.19, 1 / 64, 'in'], hingeBind: ['Hinge mortise cut too deep', 0, 1, 0.05, ''],
      pinBend: ['Bend in the hinge pin', 0, 1, 0.05, ''], thresh: ['Threshold cap height', -0.25, 0.19, 1 / 64, 'in']
    },
    pose: 'swing',
    click(part, api) { if (part === 'door' || part === 'lockset' || part === 'deadbolt') api.set({ swing: api.S.swing > 20 ? 0 : 88 }); }
  };
}

/* ---------- double (French) doors ---------- */
function buildDouble(P, o) {
  const dw = o.dw, dt = 1.375, jt = 0.625, jd = 4.56, zJ = jd / 2, yB = 0.75, dh = 80, yT = yB + dh, yHd = yT + G, jTop = yHd + jt, gm = G;
  const inL = -(dw + G + gm / 2), inR = -inL, roW = 2 * dw + 2, gapS = (roW - 2 * dw - 2 * G - gm - 2 * jt) / 2, S = o.st, hw = MT.brass;
  const W = buildWall(P, { roW, roH: 82.5, W: 128 });
  dimParts(P, W, S.dims);
  const unit = new THREE.Group(); P.root.add(unit);
  const mir = new THREE.Group(); mir.scale.x = -1; unit.add(mir);
  const side = { dw, dh, dt, yB, jt, jd, hw, jTop, y0: 0, x: inL, step: S.unit, slab: o.slab };
  const A = hingeSide(P, Object.assign({ parent: unit, doorLabel: 'Active door', doorDesc: 'The leaf you use every day. It closes against the astragal on the other door.' }, side));
  const B = hingeSide(P, Object.assign({ parent: mir, pre: 'R_', doorLabel: 'Passive door' }, side));
  P.map.get('R_door').label = 'Passive door'; P.map.get('R_door').desc = 'Held shut by flush bolts top and bottom. Open the active door first.'; P.map.get('R_door').anat = true;
  const head = new THREE.Group(); unit.add(head);
  P.add('jambHd', grp(bx(inL, inR, yHd, jTop, -zJ, zJ, MT.jamb), bx(inL + A.stT, inR - A.stT, yHd - A.stT, yHd, A.zs0, A.zs1, MT.jamb)),
    { parent: head, step: S.unit, label: 'Head jamb', desc: 'On a pair it is long enough to sag. Shim and fasten it at the centre.' });
  const ast = bx(B.ex + dw - 0.9, B.ex + dw + 0.95, yB, yT, -0.26 - dt - 0.4, -0.26 - dt, (o.slab && o.slab.mat) || MT.door);
  P.add('astragal', ast, { parent: B.body, step: S.unit, label: 'Astragal', desc: 'A moulding fixed to the passive door that covers the gap where the two doors meet.' });
  const bolts = grp(at(cyl(0.17, 2.2, hw, 'y'), B.ex + dw - 0.5, yT - 0.6, -0.26 - dt / 2), at(cyl(0.17, 2.2, hw, 'y'), B.ex + dw - 0.5, yB + 0.4, -0.26 - dt / 2),
    bx(B.ex + dw - 0.04, B.ex + dw + 0.01, yT - 9, yT - 3, -0.26 - dt / 2 - 0.4, -0.26 - dt / 2 + 0.4, hw), bx(B.ex + dw - 0.04, B.ex + dw + 0.01, yB + 3, yB + 9, -0.26 - dt / 2 - 0.4, -0.26 - dt / 2 + 0.4, hw));
  P.add('bolts', bolts, { parent: B.body, step: S.lock, from: [0, 0, 5], label: 'Flush bolts', desc: 'Slide up into the head jamb and down into the floor to pin the passive door.' });
  const lk = leverSet(dt, hw); lk.position.set(A.ex + dw - 2.375, 36, -0.26 - dt / 2);
  P.add('lockset', lk, { parent: A.body, step: S.lock, from: [0, 0, 5], label: 'Lockset', desc: 'On the active door. The latch lands in a strike on the passive door’s edge.' });
  const xsL = inL - jt - gapS / 2, hy = [A.yTH, A.yMH, A.yBH];
  P.add('shimsH', grp(hy.map(y => shimPair(xsL, y - 2.6, gapS))), { step: S.hingeL, until: S.casing, from: [0, 0, 7], label: 'Shims', desc: 'Behind every hinge on both sides, plus one pair at the centre of the head.' });
  P.add('nailsH', grp(hy.map(y => [fastener(inL, y - 2.6, 1.3, -1, 2.4, MT.steel, 0.06), fastener(inL, y - 2.6, -1.5, -1, 2.4, MT.steel, 0.06)])), { step: S.hingeL, from: [5, 0, 0], anat: false });
  P.add('shimsR', grp(hy.map(y => shimPair(-xsL, y - 2.6, gapS))), { step: S.hingeR, until: S.casing, from: [0, 0, 7], anat: false });
  P.add('nailsR', grp(hy.map(y => [fastener(inR, y - 2.6, 1.3, 1, 2.4, MT.steel, 0.06), fastener(inR, y - 2.6, -1.5, 1, 2.4, MT.steel, 0.06)])), { step: S.hingeR, from: [-5, 0, 0], anat: false });
  P.add('shimsHd', shimPair(0, (jTop + 82.5) / 2, 82.5 - jTop, true), { step: S.head, until: S.casing, from: [0, 0, 7], label: 'Head shims', desc: 'Keep the head jamb straight and give the top flush bolt something solid to lock into.' });
  P.add('shimsCut', grp(hy.map(y => [shimCut(xsL, y - 2.6, gapS), shimCut(-xsL, y - 2.6, gapS)]), shimCut(0, (jTop + 82.5) / 2, 82.5 - jTop, true)), { step: S.casing, anat: false });
  P.add('legShim', bx(inR, inR + jt, -0.02, 0.26, -zJ, zJ, MT.shim), { anat: false, when: (s, mode, k) => mode === 'install' ? k >= S.level : s.legDrop < 0.03, label: 'Leg shim' });
  P.add('longScrew', grp(fastener(inL + 0.05, A.yTH + 0.6, zJ - 0.75, -1, 3, MT.screw, 0.09), fastener(inR - 0.05, A.yTH + 0.6, zJ - 0.75, 1, 3, MT.screw, 0.09)),
    { from: [0, 0, 6], when: (s, mode, k) => mode === 'install' ? k >= S.screw : true, label: '3″ hinge screws', desc: 'One in each top hinge, into the trimmer studs.' });
  P.add('casingF', casingSet(1, inL, inR, yHd), { step: S.casing, from: [0, 0, 12], hideInFix: true, label: 'Casing', desc: 'Hides the shims and the gap between jamb and drywall.' });
  P.add('casingB', casingSet(-1, inL, inR, yHd), { step: S.casing, from: [0, 0, -12], anat: false });
  const lv = makeLevel(48); lv.g.rotation.z = Math.PI / 2; lv.g.position.set(0, 0.2, 8);
  P.add('level', lv.g, { anat: false, when: s => s.lvl > 0.5 });
  const rubC = bx(-9, 9, yHd - 0.05, yHd + 0.04, zJ - dt, zJ + 0.06, MT.rub), rubM = bx(-0.12, 0.12, yT - 12, yT - 0.4, zJ - dt, zJ + 0.07, MT.rub);
  rubC.visible = rubM.visible = false; unit.add(rubC, rubM);
  let tt = 0;
  function update(s, dt2) {
    tt += dt2;
    unit.position.z = s.stage * 34;
    A.leaf.rotation.y = -s.swing * D2R;
    const rat = s.bolt < 0.5 && s.swingR < 1 ? 0.004 * (0.5 + 0.5 * Math.sin(tt * 17)) : 0;
    B.leaf.rotation.y = -(s.swingR * D2R + rat);
    B.hs.position.y = -s.legDrop;
    B.tilt.rotation.z = -s.leanR / dh; B.tilt.rotation.x = -s.cross / dh; B.tilt.position.z = s.cross;
    head.position.y = -s.headSag;
    bolts.children[0].position.y = yT - 0.6 + (s.bolt > 0.5 ? 0.9 : -0.6);
    bolts.children[1].position.y = yB + 0.4 - (s.bolt > 0.5 ? 0.9 : -0.6);
    lv.setL(-s.legDrop * 3);
    const gTop = gm - s.leanR * (yT / dh), gBot = gm, gHd = G - s.headSag + s.legDrop * 0.5, closed = s.swing < 2 && s.swingR < 2;
    rubC.visible = closed && gHd < 0.02; rubM.visible = closed && gTop < 0.02;
    const st = g => g < 0.02 ? 'bad' : g < 0.07 || g > 0.2 ? 'warn' : 'ok', tx = g => g < 0.02 ? 'Rubbing' : frac(g);
    return [
      ['Door tops where they meet', s.legDrop < 0.03 ? 'Even' : 'Passive door ' + frac(s.legDrop) + ' low', s.legDrop < 0.03 ? 'ok' : 'bad'],
      ['Meeting gap, top', tx(gTop), st(gTop)], ['Meeting gap, bottom', tx(gBot), st(gBot)],
      ['Faces where they meet', Math.abs(s.cross) < 0.03 ? 'Flush' : frac(Math.abs(s.cross)) + ' out of flush', Math.abs(s.cross) < 0.03 ? 'ok' : 'bad'],
      ['Head gap at centre', tx(gHd), st(gHd)],
      ['Passive door', s.bolt > 0.5 ? 'Bolted top and bottom' : 'Loose, rattles', s.bolt > 0.5 ? 'ok' : 'bad']
    ];
  }
  return {
    update, W,
    defaults: { swing: 0, swingR: 0, stage: 0, legDrop: 0, leanR: 0, cross: 0, headSag: 0, bolt: 1, lvl: 0 },
    params: {
      swing: ['Swing the active door', 0, 110, 1, '°'], swingR: ['Swing the passive door', 0, 110, 1, '°'],
      legDrop: ['Floor low under the passive jamb', 0, 0.375, 1 / 32, 'in'], leanR: ['Passive hinge jamb lean toward centre', -0.19, 0.25, 1 / 64, 'in'],
      cross: ['Passive jamb out of the wall plane', -0.375, 0.375, 1 / 32, 'in'], headSag: ['Head jamb sag at centre', 0, 0.19, 1 / 64, 'in'],
      bolt: ['Flush bolts engaged', 0, 1, 1, '']
    },
    pose: 'swing',
    click(part, api) {
      if (part === 'door' || part === 'lockset') api.set({ swing: api.S.swing > 20 ? 0 : 88 });
      if (part === 'R_door' || part === 'astragal' || part === 'bolts') api.set(api.S.swingR > 20 ? { swingR: 0 } : { swingR: 88, swing: Math.max(api.S.swing, 88) });
    }
  };
}
