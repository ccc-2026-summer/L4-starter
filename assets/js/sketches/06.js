const params = {
  speed: 1,
  direction: 'rl',
  resolution: 240,
};

const MAX_SPEED = 4;
let cam;
let ready = false;
let gfx;
let BW;
let BH;
let N;
let ring;
let head = 0;
let count = 0;

function computeDims() {
  const target = params.resolution;
  const aspect = window.innerWidth / window.innerHeight;
  if (aspect >= 1) return { BW: target, BH: Math.round(target / aspect) };
  return { BW: Math.round(target * aspect), BH: target };
}

function allocate() {
  ({ BW, BH } = computeDims());
  N = Math.max(BW, BH) * MAX_SPEED;
  resizeCanvas(BW, BH);
  gfx = createGraphics(BW, BH);
  gfx.pixelDensity(1);
  ring = Array.from({ length: N }, () => new Uint8Array(BW * BH));
  head = 0;
  count = 0;
  background(0);
}

function setup() {
  createCanvas(10, 10).parent('sketch');
  pixelDensity(1);
  allocate();
  cam = createCapture(VIDEO, () => {
    ready = true;
  });
  cam.hide();
}

function windowResized() {
  allocate();
}

function message(msg) {
  background(0);
  noStroke();
  fill(180);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(msg, BW / 2, BH / 2);
}

function draw() {
  if (!ready) return message('requesting webcam…');
  const cw = cam.width;
  const ch = cam.height;
  if (!cw || !ch) return message('warming up…');

  // capture current frame (cover-fit, grayscale) into the ring
  const scale = Math.max(BW / cw, BH / ch);
  const dw = cw * scale;
  const dh = ch * scale;
  gfx.push();
  gfx.translate(BW, 0);
  gfx.scale(-1, 1);
  gfx.drawingContext.filter = 'grayscale(1)';
  gfx.image(cam, (BW - dw) / 2, (BH - dh) / 2, dw, dh);
  gfx.drawingContext.filter = 'none';
  gfx.pop();
  gfx.loadPixels();
  head = (head + 1) % N;
  const frame = ring[head];
  const gp = gfx.pixels;
  for (let i = 0; i < BW * BH; i++) frame[i] = gp[i * 4];
  count++;

  // compose: each column/row sampled from a different point in time
  const dir = params.direction;
  const speed = params.speed;
  const maxDelay = Math.min(N - 1, count - 1);
  loadPixels();
  const out = pixels;
  for (let y = 0; y < BH; y++) {
    for (let x = 0; x < BW; x++) {
      let step;
      if (dir === 'rl') step = BW - 1 - x;
      else if (dir === 'lr') step = x;
      else if (dir === 'tb') step = y;
      else step = BH - 1 - y;
      let delay = step * speed;
      if (delay > maxDelay) delay = maxDelay;
      const fi = (head - delay + N) % N;
      const v = ring[fi][y * BW + x];
      const o = (y * BW + x) * 4;
      out[o] = out[o + 1] = out[o + 2] = v;
      out[o + 3] = 255;
    }
  }
  updatePixels();
}
