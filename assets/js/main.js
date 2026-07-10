import Matter from 'matter-js';

const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

const WALL_THICKNESS = 200;
const DRAG_THRESHOLD = 5; // px，放開前移動超過這距離就當作拖拉，不觸發連結

const engine = Engine.create();
engine.gravity.y = 0; // 零重力，物件只受拖拉與碰撞影響

const world = engine.world;
const records = []; // { item, body, w, h }
let walls = [];

function buildWalls() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const t = WALL_THICKNESS;
  const opts = { isStatic: true };
  return [
    Bodies.rectangle(W / 2, -t / 2, W + t * 2, t, opts), // 上
    Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, opts), // 下
    Bodies.rectangle(-t / 2, H / 2, t, H + t * 2, opts), // 左
    Bodies.rectangle(W + t / 2, H / 2, t, H + t * 2, opts), // 右
  ];
}

function replaceWalls() {
  for (const wall of walls) Composite.remove(world, wall);
  walls = buildWalls();
  Composite.add(world, walls);
}

// 視窗縮小時把跑到牆外的物件拉回畫面內
function clampBodies() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (const { body, w, h } of records) {
    Body.setPosition(body, {
      x: Math.min(Math.max(body.position.x, w / 2), W - w / 2),
      y: Math.min(Math.max(body.position.y, h / 2), H - h / 2),
    });
  }
}

function syncDom() {
  for (const { item, body, w, h } of records) {
    const { x, y } = body.position;
    item.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${body.angle}rad)`;
  }
}

function createItemBody(item) {
  const w = item.offsetWidth;
  const h = item.offsetHeight;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const x = w / 2 + Math.random() * Math.max(W - w, 1);
  const y = h / 2 + Math.random() * Math.max(H - h, 1);
  const body = Bodies.rectangle(x, y, w, h, {
    frictionAir: 0.02,
    restitution: 0.8,
  });
  Body.setAngle(body, Math.random() * Math.PI * 2);
  records.push({ item, body, w, h });
  return body;
}

let downAt = null;
window.addEventListener('mousedown', (e) => {
  downAt = { x: e.clientX, y: e.clientY };
});

function preventClickAfterDrag(e) {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  if (moved > DRAG_THRESHOLD) e.preventDefault();
}

function handleMouseEnter() {
  const video = this.querySelector('video');
  if (video) {
    video.play().catch(() => {});
  }
}

function handleMouseLeave() {
  const video = this.querySelector('video');
  if (video) {
    try {
      video.pause();
    } catch (e) {}
  }
}

// 等影片讀到尺寸再量 work-item 的大小，物理形狀才會準
function whenVideoReady(item) {
  const video = item.querySelector('video');
  if (!video || video.readyState >= 1) return Promise.resolve();
  return new Promise((resolve) => {
    video.addEventListener('loadedmetadata', resolve, { once: true });
    setTimeout(resolve, 2000);
  });
}

async function init() {
  const items = [...document.querySelectorAll('.work-item')];
  await Promise.all(items.map(whenVideoReady));

  for (const item of items) {
    item.style.left = '0';
    item.style.top = '0';
    Composite.add(world, createItemBody(item));

    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('click', preventClickAfterDrag);
      link.addEventListener('dragstart', (e) => e.preventDefault());
    }
    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
  }

  syncDom();

  walls = buildWalls();
  Composite.add(world, walls);

  const mouse = Mouse.create(document.body);
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.1, damping: 0.1 },
  });
  Composite.add(world, mouseConstraint);

  Events.on(engine, 'afterUpdate', syncDom);
  Runner.run(Runner.create(), engine);

  window.addEventListener('resize', () => {
    replaceWalls();
    clampBodies();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
