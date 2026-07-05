const params = {
  ballCount: 16,
  radiusMin: 9,
  radiusMax: 60,
  speed: 60,
  threshold: .7,
};

const targetPixels = 360000;
const balls = [];
let gridW = 0;
let gridH = 0;

function computeDims() {
  const aspect = windowWidth / windowHeight;
  return {
    w: Math.round(Math.sqrt(targetPixels * aspect)),
    h: Math.round(Math.sqrt(targetPixels / aspect)),
  };
}

function regenerate() {
  balls.length = 0;
  const rMin = Math.min(params.radiusMin, params.radiusMax);
  const rMax = Math.max(params.radiusMin, params.radiusMax);
  for (let i = 0; i < params.ballCount; i++) {
    balls.push({
      x: random(gridW),
      y: random(gridH),
      vx: random(-1, 1) * params.speed,
      vy: random(-1, 1) * params.speed,
      r: random(rMin, rMax),
    });
  }
}

function setup() {
  ({ w: gridW, h: gridH } = computeDims());
  createCanvas(gridW, gridH).parent('sketch');
  pixelDensity(1);
  regenerate();
}

function windowResized() {
  ({ w: gridW, h: gridH } = computeDims());
  resizeCanvas(gridW, gridH);
  regenerate();
}

function draw() {
  const dt = deltaTime / 1000;
  for (const b of balls) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < b.r) { b.x = b.r; b.vx *= -1; }
    if (b.x > gridW - b.r) { b.x = gridW - b.r; b.vx *= -1; }
    if (b.y < b.r) { b.y = b.r; b.vy *= -1; }
    if (b.y > gridH - b.r) { b.y = gridH - b.r; b.vy *= -1; }
  }

  loadPixels();
  const px = pixels;
  const threshold = params.threshold;
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      let sum = 0;
      for (const b of balls) {
        const dx = x - b.x;
        const dy = y - b.y;
        sum += (b.r * b.r) / (dx * dx + dy * dy + 1);
      }
      const v = sum > threshold ? 255 : 0;
      const i = (y * gridW + x) * 4;
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = 255;
    }
  }
  updatePixels();
}
