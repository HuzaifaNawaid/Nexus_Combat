import * as THREE from 'three';
import { useGameStore } from '@/store/useGameStore';
import { CHARS, BASE_WEP, VT, LEVELS } from './constants';
import { sfx, playBGM, stopBGM, BGM_CONFIGS, MENU_BGM, audioEnabled } from './audio';

let R: THREE.WebGLRenderer;
let scene: THREE.Scene;
let cam: THREE.PerspectiveCamera;
let c3d: HTMLCanvasElement;
let xc: HTMLCanvasElement;
let xctx: CanvasRenderingContext2D;

let xhx = window.innerWidth / 2;
let xhy = window.innerHeight / 2;
let xhfl = 0;
let xhcr = false;

let weaps: any[] = [];
let sObj: any[] = [];
let partSys: THREE.Points | null = null;
let enemies: any[] = [];
let ePrjs: any[] = [];
let pPrjs: any[] = [];
let vilQueue: any[] = [];
let vilIdx = 0;
let fr = 0;
let reqId: number;

const K: Record<string, boolean> = {};
let mleft = false;
let locked = false;

const P = {
  hp: 100, maxHp: 100, shield: 100, maxShield: 100,
  pos: new THREE.Vector3(0, .65, 10), vel: new THREE.Vector3(),
  yaw: Math.PI, pitch: 0, onGround: true,
  gunIdx: 0, fireCd: 0, reloading: false, reloadT: 0,
  special: 0, maxSpecial: 100, spRdy: false,
  alive: true, inv: 0, shRegen: 0, dmgMult: 1, spdMult: 1,
};

let lastSpScore = 0;

export function initEngine(canvas3d: HTMLCanvasElement, canvasCrosshair: HTMLCanvasElement) {
  c3d = canvas3d;
  xc = canvasCrosshair;
  xctx = xc.getContext('2d')!;
  
  R = new THREE.WebGLRenderer({ canvas: c3d, antialias: true });
  R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  R.setSize(window.innerWidth, window.innerHeight);
  R.shadowMap.enabled = true;
  R.shadowMap.type = THREE.PCFSoftShadowMap;
  
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, .05, 350);
  
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('mousemove', onMouseMove);
  c3d.addEventListener('click', onClickCanvas);
  
  cam.position.set(0, 2, 5);
  cam.lookAt(0, 0, 0);
  
  loop();
}

export function stopEngine() {
  window.removeEventListener('resize', onResize);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('mousedown', onMouseDown);
  window.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('pointerlockchange', onPointerLockChange);
  document.removeEventListener('mousemove', onMouseMove);
  c3d.removeEventListener('click', onClickCanvas);
  cancelAnimationFrame(reqId);
}

function onResize() {
  R.setSize(window.innerWidth, window.innerHeight);
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
  xc.width = window.innerWidth;
  xc.height = window.innerHeight;
}

function onKeyDown(e: KeyboardEvent) {
  K[e.code] = true;
  const state = useGameStore.getState();
  if (e.code === 'Digit1') swGun(0);
  if (e.code === 'Digit2') swGun(1);
  if (e.code === 'Digit3') swGun(2);
  if (e.code === 'Digit4') swGun(3);
  if (e.code === 'Digit5' && state.screen === 'hud' && P.alive) shoot();
  if (e.code === 'KeyR' && !P.reloading) startReload();
  if (e.code === 'KeyF') useSpecial();
}

function onKeyUp(e: KeyboardEvent) {
  K[e.code] = false;
}

function onMouseDown(e: MouseEvent) {
  if (e.button === 0) {
    mleft = true;
    const state = useGameStore.getState();
    if (state.screen === 'hud' && P.alive) shoot();
  }
  const state = useGameStore.getState();
  if (state.screen === 'hud' && !locked && !state.showPause) {
    c3d.requestPointerLock();
  }
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 0) mleft = false;
}

function onPointerLockChange() {
  locked = document.pointerLockElement === c3d;
  if (locked) {
    document.body.style.cursor = 'none';
  } else {
    document.body.style.cursor = 'auto';
  }
}

function onMouseMove(e: MouseEvent) {
  const state = useGameStore.getState();
  if (locked && state.screen === 'hud') {
    P.yaw -= e.movementX * .0022;
    P.pitch = Math.max(-1.2, Math.min(.55, P.pitch - e.movementY * .0022));
    xhx = window.innerWidth / 2;
    xhy = window.innerHeight / 2;
  } else {
    xhx = e.clientX;
    xhy = e.clientY;
    if (state.screen === 'hud') {
      P.yaw = -(e.clientX / window.innerWidth - .5) * 2 * Math.PI;
      P.pitch = Math.max(-1.2, Math.min(.55, -(e.clientY / window.innerHeight - .5) * .9));
    }
  }
}

function onClickCanvas() {
  const state = useGameStore.getState();
  if (state.screen === 'hud' && !state.showPause) {
    c3d.requestPointerLock();
  }
}

export function startLevel(lvlIdx: number) {
  const store = useGameStore.getState();
  store.setLevel(lvlIdx);
  store.setScore(0);
  store.setScreen('hud');
  store.setShowPause(false);
  
  if (document.pointerLockElement !== c3d) {
    c3d.requestPointerLock();
  }
  
  store.setAnnouncement(`LEVEL ${lvlIdx + 1}\n${LEVELS[lvlIdx].name}`, '#ff9900');
  sfx.levelStart();
  if (audioEnabled) setTimeout(() => playBGM(BGM_CONFIGS[lvlIdx] || BGM_CONFIGS[0]), 400);
  
  buildLevel(lvlIdx);
}

function clearScene() {
  sObj.forEach(o => scene.remove(o));
  sObj = [];
  if (partSys) { scene.remove(partSys); partSys = null; }
  enemies = []; ePrjs = []; pPrjs = []; vilQueue = []; vilIdx = 0;
}

function buildLevel(lvlIdx: number) {
  clearScene();
  const L = LEVELS[lvlIdx];
  R.setClearColor(L.sky);
  scene.fog = new THREE.Fog(L.fog, L.fN, L.fF);
  
  const amb = new THREE.AmbientLight(L.amb, L.aI); scene.add(amb); sObj.push(amb);
  const sun = new THREE.DirectionalLight(L.sun, L.sI);
  sun.position.set(25, 45, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -55; sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -55; sun.shadow.camera.far = 130;
  scene.add(sun); sObj.push(sun);
  
  if (lvlIdx === 4) {
    for (let i = 0; i < 5; i++) {
      const l = new THREE.PointLight(0xff3300, 2, 16);
      l.position.set(Math.cos(i / 5 * Math.PI * 2) * 18, .5, Math.sin(i / 5 * Math.PI * 2) * 18);
      scene.add(l); sObj.push(l);
    }
  }
  if (lvlIdx === 5) {
    const l = new THREE.PointLight(0x8800ff, 3, 50);
    l.position.set(0, 4, 0); scene.add(l); sObj.push(l);
  }
  
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ color: L.gnd, roughness: lvlIdx === 2 ? .45 : .97, metalness: lvlIdx === 5 ? .18 : 0 }));
  gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd); sObj.push(gnd);
  
  const grid = new THREE.GridHelper(90, 28, 0x111122, 0x0a0a16); grid.position.y = .01; scene.add(grid); sObj.push(grid);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(260, 14, 10), new THREE.MeshBasicMaterial({ color: L.sky, side: THREE.BackSide })); scene.add(sky); sObj.push(sky);
  
  buildArena(L, lvlIdx);
  buildParticles(L);

  vilQueue = L.villainIds.map(i => {
    const v = { ...VT[i] };
    if (lvlIdx === 5) { v.hp = Math.floor(v.hp * 1.5); v.spd = v.spd * 1.2; v.rate = Math.floor(v.rate * .75); v.dmgPerHit = v.dmgPerHit + 5; v.phase = `RETURNS — ${i + 1}/6`; }
    return v;
  });

  L.minis.forEach((m, i) => {
    const a = (i / L.minis.length) * Math.PI * 2;
    spawnEnemy({ ...m, isMini: true, phase: 'MINION', reward: 50, icon: '💀', atkRange: 20 }, Math.cos(a) * 13, Math.sin(a) * 13 - 6);
  });

  spawnNextVillain();

  const store = useGameStore.getState();
  const C = CHARS[store.charIdx];
  const UPG = store.upgrades;
  
  P.maxHp = C.hp; P.hp = P.maxHp;
  P.maxShield = C.shield + ((UPG.shield || 0) * 15); P.shield = P.maxShield;
  P.dmgMult = 1 + ((UPG.dmg || 0) * .1);
  P.spdMult = C.spd * (1 + (UPG.speed || 0) * .08);
  P.pos.set(0, .65, 13); P.yaw = Math.PI; P.pitch = 0; P.vel.set(0, 0, 0);
  P.alive = true; P.reloading = false; P.fireCd = 0; P.special = 0; P.spRdy = false; P.inv = 0; P.shRegen = 0;
  weaps = BASE_WEP.map(w => ({ ...w, curAmmo: w.maxAmmo })); P.gunIdx = 0;
  
  updateAllHUD();
}

function buildArena(L: any, lvlIdx: number) {
  const pm = new THREE.MeshStandardMaterial({ color: new THREE.Color(L.gnd).multiplyScalar(.6), roughness: .95 });
  const bm = new THREE.MeshStandardMaterial({ color: new THREE.Color(L.gnd).multiplyScalar(.38), roughness: .98 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, r = 24;
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.85, 1.1, 6, 8), pm);
    p.position.set(Math.cos(a) * r, 3, Math.sin(a) * r); p.castShadow = true; scene.add(p); sObj.push(p);
  }
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2, r = 9 + Math.random() * 13, s = .7 + Math.random() * .7;
    const b = new THREE.Mesh(new THREE.BoxGeometry(s * 1.6, s, s * 1.6), bm);
    b.position.set(Math.cos(a) * r, s / 2, Math.sin(a) * r); b.rotation.y = Math.random() * Math.PI; b.castShadow = true; b.receiveShadow = true; scene.add(b); sObj.push(b);
  }
  if (lvlIdx === 5) {
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(8 + i * 7, .1, 8, 40), new THREE.MeshBasicMaterial({ color: 0x8800ff, transparent: true, opacity: .35 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = .05; scene.add(ring); sObj.push(ring);
    }
  }
}

function buildParticles(L: any) {
  const cnt = L.part === 'rain' ? 650 : 320;
  const geo = new THREE.BufferGeometry();
  const pa = new Float32Array(cnt * 3), va = new Float32Array(cnt * 3);
  for (let i = 0; i < cnt; i++) {
    pa[i * 3] = (Math.random() - .5) * 65; pa[i * 3 + 1] = Math.random() * 22; pa[i * 3 + 2] = (Math.random() - .5) * 65;
    va[i * 3] = (Math.random() - .5) * .055; va[i * 3 + 1] = -(0.07 + Math.random() * .14); va[i * 3 + 2] = (Math.random() - .5) * .055;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  geo.userData.v = va;
  partSys = new THREE.Points(geo, new THREE.PointsMaterial({ color: L.pc, size: L.part === 'rain' ? .05 : L.part === 'snow' ? .12 : .08, transparent: true, opacity: .6, sizeAttenuation: true }));
  scene.add(partSys);
}

function spawnNextVillain() {
  if (vilIdx >= vilQueue.length) return;
  const vd = vilQueue[vilIdx++];
  const a = Math.random() * Math.PI * 2;
  spawnEnemy(vd, Math.cos(a) * 18, Math.sin(a) * 18 - 6);
  const store = useGameStore.getState();
  store.addKillfeed(`${vd.icon || '👹'} ${vd.phase}: ${vd.name} APPEARS!`, '#ff2200');
  store.setAnnouncement(`${vd.icon || '👹'} ${vd.name}`, '#ff4400');
}

function spawnEnemy(vd: any, x: number, z: number) {
  const grp = new THREE.Group();
  const s = vd.size || 1, t = vd.shapeType || 'slim';
  const bc = vd.col || 0xff0000, ec = vd.emis || 0x440000;
  const bm = new THREE.MeshStandardMaterial({ color: bc, emissive: ec, emissiveIntensity: .5, roughness: .65, metalness: .2 });
  const dm = new THREE.MeshStandardMaterial({ color: new THREE.Color(bc).multiplyScalar(.4), emissive: ec, emissiveIntensity: .3, roughness: .5, metalness: .45 });
  const M = (g: any, m: any) => { const ms = new THREE.Mesh(g, m); ms.castShadow = true; return ms; };

  if (t === 'mini') {
    const body = M(new THREE.CylinderGeometry(.3 * s, .38 * s, 1.4 * s, 7), bm); body.position.y = .7 * s; grp.add(body);
    const head = M(new THREE.SphereGeometry(.28 * s, 7, 6), bm); head.position.y = 1.6 * s; grp.add(head);
  } else if (t === 'slim') {
    const body = M(new THREE.CylinderGeometry(.33 * s, .48 * s, 2.6 * s, 8), bm); body.position.y = 1.3 * s; grp.add(body);
    const fin = M(new THREE.BoxGeometry(.07 * s, 1.7 * s, .65 * s), bm); fin.position.set(0, 1.8 * s, -.38 * s); grp.add(fin);
    const head = M(new THREE.SphereGeometry(.44 * s, 8, 6), bm); head.position.y = 3.0 * s; grp.add(head);
    for (let i = 0; i < 5; i++) { const sp = M(new THREE.ConeGeometry(.07 * s, .4 * s, 5), bm); sp.position.set(Math.cos(i / 5 * Math.PI * 2) * .33 * s, 3.42 * s, Math.sin(i / 5 * Math.PI * 2) * .33 * s); grp.add(sp); }
  } else if (t === 'tall') {
    const body = M(new THREE.CylinderGeometry(.38 * s, .58 * s, 3.1 * s, 7), bm); body.position.y = 1.55 * s; grp.add(body);
    const head = M(new THREE.SphereGeometry(.48 * s, 7, 6), bm); head.position.y = 3.4 * s; grp.add(head);
    for (let i = 0; i < 4; i++) { const br = M(new THREE.CylinderGeometry(.055 * s, .09 * s, .88 * s, 5), bm); br.rotation.z = (i % 2 === 0 ? 1 : -1) * .72; br.position.set((i < 2 ? 1 : -1) * .58 * s, 2.1 * s + (i * .2 * s), 0); grp.add(br); }
    const lroot = M(new THREE.CylinderGeometry(.08 * s, .14 * s, .6 * s, 6), bm); lroot.position.set(0, .35 * s, .3 * s); lroot.rotation.x = .4; grp.add(lroot);
  } else if (t === 'wide') {
    const body = M(new THREE.BoxGeometry(1.35 * s, 1.75 * s, 1.15 * s), bm); body.position.y = .88 * s; grp.add(body);
    const head = M(new THREE.BoxGeometry(1.05 * s, .95 * s, .95 * s), bm); head.position.y = 2.3 * s; grp.add(head);
    for (let i = 0; i < 6; i++) { const sp = M(new THREE.ConeGeometry(.11 * s, .55 * s, 5), bm); sp.position.set(Math.cos(i / 6 * Math.PI * 2) * .75 * s, 2.65 * s, Math.sin(i / 6 * Math.PI * 2) * .75 * s); grp.add(sp); }
    [-1, 1].forEach(side => { const sh = M(new THREE.BoxGeometry(.52 * s, .52 * s, .68 * s), dm); sh.position.set(side * .92 * s, 1.75 * s, 0); grp.add(sh); });
  } else if (t === 'armored') {
    const body = M(new THREE.CylinderGeometry(.52 * s, .66 * s, 2.3 * s, 6), bm); body.position.y = 1.15 * s; grp.add(body);
    const chest = M(new THREE.BoxGeometry(1.25 * s, .85 * s, .68 * s), dm); chest.position.y = 1.75 * s; grp.add(chest);
    const head = M(new THREE.BoxGeometry(.82 * s, 1.15 * s, .82 * s), bm); head.position.y = 3.05 * s; grp.add(head);
    const crown = M(new THREE.CylinderGeometry(.14 * s, .58 * s, .75 * s, 4), bm); crown.position.y = 3.78 * s; grp.add(crown);
    for (let i = 0; i < 3; i++) { const cp = M(new THREE.BoxGeometry(.24 * s, .75 * s, .06 * s), dm); cp.position.set((i - 1) * .28 * s, .88 * s, -.58 * s); grp.add(cp); }
    [-1, 1].forEach(side => { const sp = M(new THREE.ConeGeometry(.1 * s, .5 * s, 5), bm); sp.position.set(side * .5 * s, 2.95 * s, 0); sp.rotation.z = side * -.25; grp.add(sp); });
  } else if (t === 'demon') {
    const body = M(new THREE.CylinderGeometry(.68 * s, .88 * s, 2.75 * s, 10), bm); body.position.y = 1.38 * s; grp.add(body);
    [-1, 1].forEach(side => {
      const sh = M(new THREE.BoxGeometry(.62 * s, .52 * s, .88 * s), dm); sh.position.set(side * 1.0 * s, 2.18 * s, 0); grp.add(sh);
      const wing = M(new THREE.BoxGeometry(.09 * s, 1.55 * s, 1.55 * s), dm); wing.position.set(side * 1.48 * s, 2.38 * s, 0); wing.rotation.z = side * .38; grp.add(wing);
      const wt = M(new THREE.ConeGeometry(.12 * s, .5 * s, 5), bm); wt.position.set(side * 1.55 * s, 3.2 * s, -.5 * s); wt.rotation.z = side * .6; wt.rotation.x = .3; grp.add(wt);
    });
    const head = M(new THREE.SphereGeometry(.62 * s, 9, 7), bm); head.position.y = 3.45 * s; grp.add(head);
    [-1, 1].forEach(side => { const h = M(new THREE.ConeGeometry(.14 * s, .88 * s, 5), bm); h.position.set(side * .38 * s, 4.05 * s, 0); h.rotation.z = side * -.28; grp.add(h); });
    const tail = M(new THREE.CylinderGeometry(.07 * s, .18 * s, 1.15 * s, 6), bm); tail.rotation.x = -.9; tail.position.set(0, .48 * s, .78 * s); grp.add(tail);
    const tailtip = M(new THREE.ConeGeometry(.12 * s, .35 * s, 5), bm); tailtip.rotation.x = -.9; tailtip.position.set(0, .05 * s, 1.4 * s); grp.add(tailtip);
  } else if (t === 'kraken') {
    const body = M(new THREE.SphereGeometry(1.05 * s, 10, 8), bm); body.position.y = 1.75 * s; grp.add(body);
    const head = M(new THREE.SphereGeometry(.88 * s, 9, 7), bm); head.position.y = 3.4 * s; grp.add(head);
    const crest = M(new THREE.ConeGeometry(.5 * s, .7 * s, 6), bm); crest.position.y = 4.18 * s; grp.add(crest);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = 1.18 * s; const ten = M(new THREE.CylinderGeometry(.07 * s, .2 * s, 1.75 * s, 6), bm); ten.rotation.z = Math.cos(a) * .78; ten.rotation.x = Math.sin(a) * .78; ten.position.set(Math.cos(a) * r, .78 * s, Math.sin(a) * r); grp.add(ten); }
  }

  [-1, 1].forEach(side => {
    const eyeY = t === 'wide' ? 2.42 * s : t === 'slim' ? 3.04 * s : t === 'kraken' ? 3.48 * s : t === 'armored' ? 3.06 * s : t === 'demon' ? 3.48 * s : t === 'mini' ? 1.65 * s : 3.0 * s;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.09 * s, 5, 5), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    eye.position.set(side * .2 * s, eyeY, .48 * s); grp.add(eye);
    const el = new THREE.PointLight(0xff0000, 1.1, 3.5 * s); el.position.copy(eye.position); grp.add(el);
  });

  if (t !== 'mini') {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.11 * s, .17 * s, 1.35 * s, 6), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: ec, emissiveIntensity: .2, roughness: .4, metalness: .75 }));
    arm.rotation.z = -Math.PI / 2.2; arm.position.set(-1.05 * s, 1.55 * s, .1 * s); arm.castShadow = true; grp.add(arm);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.065 * s, .065 * s, .5 * s, 5), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .18, metalness: .92 }));
    barrel.rotation.z = -Math.PI / 2; barrel.position.set(-1.7 * s, 1.55 * s, .1 * s); grp.add(barrel);
    [-1, 1].forEach(side => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(.23 * s, .19 * s, 1.05 * s, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(bc).multiplyScalar(.5), roughness: .78 })); leg.position.set(side * .3 * s, .52 * s, 0); grp.add(leg); });
  }

  const glow = new THREE.PointLight(ec || bc, 2.5, 10 * s); glow.position.y = 2 * s; grp.add(glow);

  grp.position.set(x, 0, z);
  grp.userData = { alive: true, isMini: vd.isMini || false, hp: vd.hp, maxHp: vd.hp, spd: vd.spd || .025, fireCd: Math.floor(Math.random() * 50) + 10, fireRate: vd.rate || 100, atkRange: vd.atkRange || 22, projCol: vd.projCol || 0xff4400, projSpd: vd.projSpd || .36, dmgPerHit: vd.dmgPerHit || 8, bobT: Math.random() * Math.PI * 2, hitFlash: 0, name: vd.name, icon: vd.icon || '👹', phase: vd.phase || '', reward: vd.reward || 50, def: vd };
  scene.add(grp); enemies.push(grp);
  updateBossHUD();
  return grp;
}

function updateBossHUD() {
  const main = enemies.filter(e => e.userData.alive && !e.userData.isMini);
  const minis = enemies.filter(e => e.userData.alive && e.userData.isMini);
  const store = useGameStore.getState();
  
  if (main.length === 0 && minis.length === 0) {
    store.updateHUD({ bossName: 'ALL CLEAR', bossColor: '#44ff88', bossHpPct: 0, bossPhase: '', bossIcon: '' });
    return;
  }
  
  if (main.length > 0) {
    const e = main[0];
    const pct = Math.max(0, e.userData.hp / e.userData.maxHp * 100);
    const col = pct > 60 ? '#ff4400' : pct > 30 ? '#ffaa00' : '#ff2200';
    store.updateHUD({
      bossName: e.userData.name,
      bossIcon: e.userData.icon,
      bossColor: col,
      bossHpPct: pct,
      bossPhase: e.userData.phase + (minis.length > 0 ? ` | MINIONS: ${minis.length}` : '')
    });
  } else {
    store.updateHUD({
      bossName: `MINIONS: ${minis.length}`,
      bossIcon: '💀',
      bossColor: '#ff8800',
      bossHpPct: 100,
      bossPhase: 'DEFEAT ALL MINIONS'
    });
  }
}

function updPlayer() {
  if (!P.alive) return;
  const sprint = K.ShiftLeft || K.ShiftRight;
  const spd = (sprint ? .14 : .08) * P.spdMult;
  const d = new THREE.Vector3();
  if (K.KeyW || K.ArrowUp) d.z -= 1; if (K.KeyS || K.ArrowDown) d.z += 1;
  if (K.KeyA || K.ArrowLeft) d.x -= 1; if (K.KeyD || K.ArrowRight) d.x += 1;
  if (d.length() > 0) { d.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), P.yaw); P.vel.x = d.x * spd; P.vel.z = d.z * spd; }
  else { P.vel.x *= .76; P.vel.z *= .76; }
  if (K.Space && P.onGround) { P.vel.y = .18; P.onGround = false; }
  P.vel.y -= .012; P.pos.add(P.vel);
  if (P.pos.y <= .65) { P.pos.y = .65; P.vel.y = 0; P.onGround = true; }
  const B = 40; P.pos.x = Math.max(-B, Math.min(B, P.pos.x)); P.pos.z = Math.max(-B, Math.min(B, P.pos.z));
  if (P.inv > 0) P.inv--; P.shRegen++;
  if (P.shRegen > 130 && P.shield < P.maxShield) P.shield = Math.min(P.maxShield, P.shield + .22);
  if (P.fireCd > 0) P.fireCd--;
  cam.position.copy(P.pos); cam.position.y += .38;
  cam.rotation.order = 'YXZ'; cam.rotation.y = P.yaw; cam.rotation.x = P.pitch;
}

export function shoot() {
  const store = useGameStore.getState();
  if (store.screen !== 'hud' || !P.alive || store.showPause) return;
  const g = weaps[P.gunIdx];
  if (P.reloading || P.fireCd > 0) return;
  if (g.curAmmo <= 0) { startReload(); return; }
  P.fireCd = g.rate; g.curAmmo--; updateWepBar();
  sfx.shoot(P.gunIdx);
  for (let b = 0; b < g.burst; b++) {
    const sx = (Math.random() - .5) * g.spread * 2, sy = (Math.random() - .5) * g.spread * 2;
    let dir;
    if (locked) { dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(P.pitch + sy, P.yaw + sx, 0, 'YXZ')).normalize(); }
    else { const nx = (xhx / window.innerWidth) * 2 - 1, ny = -((xhy / window.innerHeight) * 2 - 1); dir = new THREE.Vector3(nx + sx, ny + sy, -1).unproject(cam).sub(cam.position).normalize(); }
    const orig = cam.position.clone().addScaledVector(dir, .55);
    const col = g.color || 0xffcc44;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(g.size || .09, 6, 4), new THREE.MeshBasicMaterial({ color: col }));
    mesh.position.copy(orig); const pl = new THREE.PointLight(col, 1.4, 3); mesh.add(pl); scene.add(mesh);
    pPrjs.push({ mesh, dir: dir.clone(), spd: g.spd || 1, dmg: (g.dmg || 8) * P.dmgMult, life: 0, maxLife: 170, explosive: g.explosive || false, col });
  }
  xhfl = 8; xhcr = false;
}

export function startReload() {
  const g = weaps[P.gunIdx]; if (g.curAmmo === g.maxAmmo || P.reloading) return;
  P.reloading = true; P.reloadT = 0;
  useGameStore.getState().updateHUD({ reloading: true, reloadPct: 0 });
  sfx.reload();
}

function updReload() {
  if (!P.reloading) return;
  const store = useGameStore.getState();
  const g = weaps[P.gunIdx];
  const rt = g.reload * (1 - (store.upgrades.reload || 0) * .08);
  P.reloadT++;
  store.updateHUD({ reloadPct: (P.reloadT / rt) * 100 });
  if (P.reloadT >= rt) {
    P.reloading = false;
    g.curAmmo = g.maxAmmo;
    updateWepBar();
    store.updateHUD({ reloading: false });
  }
}

export function swGun(i: number) {
  if (i === P.gunIdx || P.reloading) return;
  P.gunIdx = i; P.fireCd = 0;
  updateWepBar();
}

function chargeSp(dmg: number) {
  if (P.spRdy) return;
  const store = useGameStore.getState();
  const milestone = Math.floor(store.score / 400);
  const lastMilestone = Math.floor(lastSpScore / 400);
  if (milestone > lastMilestone) { P.special = P.maxSpecial; P.spRdy = true; lastSpScore = store.score; updSpBar(); return; }
  P.special = Math.min(P.maxSpecial, P.special + dmg * .08);
  if (P.special >= P.maxSpecial) { P.spRdy = true; lastSpScore = store.score; }
  updSpBar();
}

export function useSpecial() {
  const store = useGameStore.getState();
  if (!P.spRdy || store.screen !== 'hud' || !P.alive || store.showPause) return;
  P.special = 0; P.spRdy = false; lastSpScore = store.score; updSpBar();
  const C = CHARS[store.charIdx];
  
  // Visual effect
  const sov = document.getElementById('sov');
  if (sov) { sov.style.opacity = '1'; setTimeout(() => sov.style.opacity = '0', 600); }
  
  store.setAnnouncement(`⚡ ${C.special}!`, C.color);
  store.addKillfeed(`⚡ ${C.special} ACTIVATED!`, C.color);
  sfx.special();
  
  const bd = 180 * (1 + (store.upgrades.special || 0) * .22);
  if (C.id === 0) {
    let shots = 0; const iv = setInterval(() => {
      if (shots >= 10 || useGameStore.getState().screen !== 'hud') { clearInterval(iv); return; }
      const sa = (Math.random() - .5) * .07;
      const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(P.pitch, P.yaw + sa, 0, 'YXZ')).normalize();
      const orig = cam.position.clone().addScaledVector(dir, .5);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(.16, 6, 4), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
      mesh.position.copy(orig); const pl = new THREE.PointLight(0x00ffff, 2, 4); mesh.add(pl); scene.add(mesh);
      pPrjs.push({ mesh, dir: dir.clone(), spd: 2.2, dmg: bd / 10, life: 0, maxLife: 180, explosive: false, col: 0x00ffff });
      shots++;
    }, 45);
  } else if (C.id === 1) {
    enemies.forEach(e => { if (!e.userData.alive) return; const d = P.pos.distanceTo(e.position); if (d < 28) hitEnemy(e, bd * (1.2 - d / 30), true); });
    explFX(P.pos.clone(), 5, 0xff6600); explFX(P.pos.clone(), 3, 0xffaa00);
  } else if (C.id === 2) {
    const alv = enemies.filter(e => e.userData.alive).sort((a, b) => a.position.distanceTo(P.pos) - b.position.distanceTo(P.pos));
    if (alv.length) { const tgt = alv[0]; P.pos.copy(tgt.position).addScaledVector(new THREE.Vector3(0, 0, 1), 3.5); for (let i = 0; i < 5; i++)setTimeout(() => { if (tgt.userData.alive) hitEnemy(tgt, bd / 5, true); }, i * 80); }
  } else if (C.id === 3) {
    enemies.forEach((e, i) => { if (!e.userData.alive) return; setTimeout(() => { if (e.userData.alive) hitEnemy(e, bd * .75, true); }, i * 60); lightFX(P.pos.clone(), e.position.clone()); });
  }
}

function explFX(pos: THREE.Vector3, r: number, col: number) {
  for (let i = 0; i < 18; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(.13, 4, 4), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1 }));
    s.position.copy(pos);
    const v = new THREE.Vector3((Math.random() - .5) * r, Math.random() * r * .8, (Math.random() - .5) * r);
    scene.add(s);
    let l = 0;
    const a = () => {
      s.position.add(v); v.y -= .035; l++; s.material.opacity = 1 - l / 22;
      if (l < 22) requestAnimationFrame(a); else scene.remove(s);
    };
    a();
  }
}

function lightFX(from: THREE.Vector3, to: THREE.Vector3) {
  const len = from.distanceTo(to);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.023, .023, len, 4), new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: .82 }));
  const mid = from.clone().add(to).multiplyScalar(.5); mid.y += .4;
  mesh.position.copy(mid); mesh.lookAt(to); mesh.rotateX(Math.PI / 2);
  scene.add(mesh); setTimeout(() => scene.remove(mesh), 280);
}

function updEnemies() {
  enemies.forEach(e => {
    if (!e.userData.alive) return;
    const U = e.userData;
    const dx = P.pos.x - e.position.x, dz = P.pos.z - e.position.z, dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 5) { e.position.x += dx / dist * U.spd; e.position.z += dz / dist * U.spd; }
    e.rotation.y = Math.atan2(dx, dz);
    U.bobT += .026; e.position.y = Math.sin(U.bobT) * .14 * (U.def.size || 1);
    if (U.hitFlash > 0) { e.traverse((c: any) => { if (c.isMesh && c.material && c.material.emissiveIntensity !== undefined) c.material.emissiveIntensity = 2.2; }); U.hitFlash--; }
    else { e.traverse((c: any) => { if (c.isMesh && c.material && c.material.emissiveIntensity > 1.5) c.material.emissiveIntensity = .5; }); }
    U.fireCd--;
    if (U.fireCd <= 0 && dist < U.atkRange) {
      U.fireCd = U.fireRate;
      const orig = e.position.clone(); orig.y += 2.2 * (U.def.size || 1);
      const playerTarget = P.pos.clone(); playerTarget.y += 0.65;
      const dir = new THREE.Vector3().subVectors(playerTarget, orig).normalize();
      dir.x += (Math.random() - .5) * .06; dir.z += (Math.random() - .5) * .06; dir.normalize();
      const col = U.projCol || 0xff4400;
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(.16, 6, 4), new THREE.MeshBasicMaterial({ color: col }));
      mesh.position.copy(orig);
      const pl = new THREE.PointLight(col, 1.5, 5); mesh.add(pl); scene.add(mesh);
      ePrjs.push({ mesh, dir, spd: (U.projSpd || .36) * 1.35, dmg: U.dmgPerHit || 8, life: 0, maxLife: 220 });
    }
  });
}

function updProjectiles() {
  for (let i = pPrjs.length - 1; i >= 0; i--) {
    const p = pPrjs[i]; p.mesh.position.addScaledVector(p.dir, p.spd); p.life++;
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j]; if (!e.userData.alive) continue;
      if (p.mesh.position.distanceTo(e.position) < 1.65 * (e.userData.def.size || 1)) {
        hitEnemy(e, p.dmg * (p.explosive ? 2 : 1), false); if (p.explosive) explFX(p.mesh.position.clone(), 2.2, 0xff4400); hit = true; break;
      }
    }
    if (hit || p.life > p.maxLife) { scene.remove(p.mesh); pPrjs.splice(i, 1); }
  }
  for (let i = ePrjs.length - 1; i >= 0; i--) {
    const p = ePrjs[i]; p.mesh.position.addScaledVector(p.dir, p.spd); p.life++;
    if (p.mesh.position.distanceTo(P.pos) < .8 && P.alive && P.inv <= 0) { dmgPlayer(p.dmg); scene.remove(p.mesh); ePrjs.splice(i, 1); continue; }
    if (p.life > p.maxLife) { scene.remove(p.mesh); ePrjs.splice(i, 1); }
  }
}

function hitEnemy(e: any, dmg: number, isCrit: boolean) {
  if (!e.userData.alive) return;
  e.userData.hp -= dmg; e.userData.hitFlash = 5;
  const store = useGameStore.getState();
  store.setScore(store.score + Math.round(dmg));
  chargeSp(dmg);
  xhfl = 10; xhcr = isCrit;
  
  const wp = e.position.clone(); wp.y += 3 * (e.userData.def.size || 1);
  const sv2 = wp.clone().project(cam);
  const sx = (sv2.x * .5 + .5) * window.innerWidth, sy = (1 - (sv2.y * .5 + .5)) * window.innerHeight;
  const el = document.createElement('div'); el.className = 'fixed font-bebas pointer-events-none z-25 animate-dfa';
  el.style.cssText = `left:${Math.round(sx)}px;top:${Math.round(sy)}px;font-size:${isCrit ? 34 : 21}px;color:${isCrit ? '#ff2200' : dmg > 40 ? '#ffaa00' : '#ffee44'};text-shadow: 0 0 10px currentColor;`;
  el.textContent = (isCrit ? '⚡' : '') + Math.round(dmg);
  document.body.appendChild(el);
  setTimeout(() => { try { if (el.parentNode) el.parentNode.removeChild(el); } catch (_) { } }, 1050);
  
  updateBossHUD();
  if (e.userData.hp <= 0) {
    e.userData.alive = false;
    store.addKillfeed(`☠ ${e.userData.name} DESTROYED! +${e.userData.reward}`, '#ffaa00');
    store.setScore(store.score + e.userData.reward);
    explFX(e.position.clone(), (e.userData.def.size || 1) * 2.5, e.userData.projCol || 0xff4400);
    sfx.enemyDie();
    scene.remove(e);
    const idx = enemies.indexOf(e); if (idx >= 0) enemies.splice(idx, 1);
    
    if (!e.userData.isMini) {
      setTimeout(() => {
        if (vilIdx < vilQueue.length) { spawnNextVillain(); }
        else { const alive = enemies.filter(ex => ex.userData.alive); if (alive.length === 0) setTimeout(levelComplete, 1200); }
        updateBossHUD();
      }, 900);
    } else {
      const alive = enemies.filter(ex => ex.userData.alive);
      if (alive.length === 0 && vilIdx >= vilQueue.length) setTimeout(levelComplete, 1200);
      updateBossHUD();
    }
  }
}

function dmgPlayer(dmg: number) {
  P.shRegen = 0; P.inv = 28;
  if (P.shield > 0) { const abs = Math.min(P.shield, dmg); P.shield -= abs; dmg -= abs; }
  if (dmg > 0) P.hp = Math.max(0, P.hp - dmg);
  updVitals();
  
  const vgn = document.getElementById('vgn');
  if (vgn) { vgn.style.opacity = '1'; setTimeout(() => vgn.style.opacity = '0', 140); }
  
  sfx.playerHit();
  if (P.hp <= 0) { P.alive = false; setTimeout(showDeath, 1000); }
}

function updParticles() {
  if (!partSys) return;
  const pa = partSys.geometry.attributes.position as THREE.BufferAttribute;
  const va = partSys.geometry.userData.v;
  for (let i = 0; i < pa.count; i++) {
    pa.array[i * 3] += va[i * 3]; pa.array[i * 3 + 1] += va[i * 3 + 1]; pa.array[i * 3 + 2] += va[i * 3 + 2];
    if (pa.array[i * 3 + 1] < 0) {
      pa.array[i * 3] = P.pos.x + (Math.random() - .5) * 55;
      pa.array[i * 3 + 1] = 18 + Math.random() * 4;
      pa.array[i * 3 + 2] = P.pos.z + (Math.random() - .5) * 55;
    }
  }
  pa.needsUpdate = true;
}

function updateAllHUD() { updVitals(); updSpBar(); updateWepBar(); updateBossHUD(); }

function updVitals() {
  useGameStore.getState().updateHUD({ hp: P.hp, maxHp: P.maxHp, shield: P.shield, maxShield: P.maxShield });
}

function updSpBar() {
  useGameStore.getState().updateHUD({ special: P.special, maxSpecial: P.maxSpecial, spRdy: P.spRdy });
}

function updateWepBar() {
  useGameStore.getState().updateHUD({ weapons: weaps, gunIdx: P.gunIdx });
}

function drawXH() {
  xctx.clearRect(0, 0, xc.width, xc.height);
  const state = useGameStore.getState();
  if (state.screen !== 'hud' || state.showPause) return;
  const x = xhx, y = xhy, g = 8, l = 13;
  const col = xhfl > 0 ? (xhcr ? 'rgba(255,50,50,.95)' : 'rgba(255,100,60,.95)') : 'rgba(255,200,60,.85)';
  xctx.strokeStyle = col; xctx.lineWidth = 2; xctx.lineCap = 'round'; xctx.shadowColor = col; xctx.shadowBlur = xhfl > 0 ? 12 : 4;
  [[x - g - l, y, x - g, y], [x + g, y, x + g + l, y], [x, y - g - l, x, y - g], [x, y + g, x, y + g + l]].forEach(([x1, y1, x2, y2]) => { xctx.beginPath(); xctx.moveTo(x1, y1); xctx.lineTo(x2, y2); xctx.stroke(); });
  xctx.fillStyle = xhfl > 0 ? '#ff4422' : '#ffcc44'; xctx.shadowBlur = 8;
  xctx.beginPath(); xctx.arc(x, y, 2.5, 0, Math.PI * 2); xctx.fill();
  xctx.shadowBlur = 0; if (xhfl > 0) xhfl--;
}

function levelComplete() {
  document.exitPointerLock();
  const store = useGameStore.getState();
  if (store.level + 1 < LEVELS.length) {
    store.setUnlocked(Math.max(store.unlocked, store.level + 2));
  }
  stopBGM(); sfx.victory();
  store.setScreen('victory');
  if (store.level + 1 < LEVELS.length) setTimeout(() => store.setShowUpgrade(true), 500);
}

function showDeath() {
  document.exitPointerLock();
  stopBGM(); sfx.playerDie();
  useGameStore.getState().setScreen('death');
}

export function handleTouchMove(nx: number, ny: number) {
  const threshold = 0.28;
  K['KeyW'] = ny < -threshold;
  K['KeyS'] = ny > threshold;
  K['KeyA'] = nx < -threshold;
  K['KeyD'] = nx > threshold;
}

export function handleTouchAim(dx: number, dy: number) {
  const state = useGameStore.getState();
  if (state.screen === 'hud' && !state.showPause) {
    P.yaw -= dx * 0.005;
    P.pitch = Math.max(-1.2, Math.min(.55, P.pitch - dy * 0.005));
    xhx = window.innerWidth / 2;
    xhy = window.innerHeight / 2;
  }
}

export function handleTouchJump() {
  K['Space'] = true;
  setTimeout(() => K['Space'] = false, 120);
}

function loop() {
  reqId = requestAnimationFrame(loop);
  fr++;
  const state = useGameStore.getState();
  if (state.screen === 'hud' && !state.showPause) {
    updPlayer(); updReload(); updEnemies(); updProjectiles(); updParticles();
    if (mleft && weaps[P.gunIdx]?.auto && P.fireCd <= 0) shoot();
    if (fr % 2 === 0) { updVitals(); updSpBar(); }
  }
  drawXH();
  R.render(scene, cam);
}

// Global CSS for damage numbers
const style = document.createElement('style');
style.innerHTML = `
@keyframes dfa {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-65px); }
}
.animate-dfa { animation: dfa 1s ease forwards; }
`;
document.head.appendChild(style);
