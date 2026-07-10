import p5 from 'p5';

const params = {
  feed: 0.036,
  kill: 0.06,
  dA: 0.8,
  dB: 0.35,
  stepsPerFrame: 4,
  letterSize: 144,
};

const targetPixels = 36000;
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let letterIdx = 0;
let gridW = 0;
let gridH = 0;
let a, b, a2, b2;
let textBuffer;

function computeDims() {
  const aspect = windowWidth / windowHeight;
  return {
    w: Math.round(Math.sqrt(targetPixels * aspect)),
    h: Math.round(Math.sqrt(targetPixels / aspect)),
  };
}

function resetBuffers() {
  a = new Float32Array(gridW * gridH);
  b = new Float32Array(gridW * gridH);
  a2 = new Float32Array(gridW * gridH);
  b2 = new Float32Array(gridW * gridH);
  textBuffer = createGraphics(gridW, gridH);
  textBuffer.pixelDensity(1);
}

function seedLetter(ch) {
  for (let i = 0; i < gridW * gridH; i++) {
    a[i] = 1;
    b[i] = 0;
  }
  const scale = Math.min(gridW, gridH) / 180;
  textBuffer.background(0);
  textBuffer.fill(255);
  textBuffer.noStroke();
  textBuffer.textStyle(BOLD);
  textBuffer.textSize(params.letterSize * scale);
  textBuffer.textAlign(CENTER, CENTER);
  textBuffer.text(ch, gridW / 2, gridH / 2);
  textBuffer.loadPixels();
  for (let i = 0; i < gridW * gridH; i++) {
    if (textBuffer.pixels[i * 4] > 128) b[i] = 1;
  }
}

function reactionStep() {
  const { feed, kill, dA, dB } = params;
  const decay = kill + feed;
  for (let y = 0; y < gridH; y++) {
    const yp = (y - 1 + gridH) % gridH;
    const yn = (y + 1) % gridH;
    const ypW = yp * gridW;
    const yW = y * gridW;
    const ynW = yn * gridW;
    for (let x = 0; x < gridW; x++) {
      const xp = (x - 1 + gridW) % gridW;
      const xn = (x + 1) % gridW;
      const i = yW + x;
      const av = a[i];
      const bv = b[i];
      const la =
        a[ypW + xp] * 0.05 + a[ypW + x] * 0.2 + a[ypW + xn] * 0.05 +
        a[yW + xp] * 0.2 + av * -1 + a[yW + xn] * 0.2 +
        a[ynW + xp] * 0.05 + a[ynW + x] * 0.2 + a[ynW + xn] * 0.05;
      const lb =
        b[ypW + xp] * 0.05 + b[ypW + x] * 0.2 + b[ypW + xn] * 0.05 +
        b[yW + xp] * 0.2 + bv * -1 + b[yW + xn] * 0.2 +
        b[ynW + xp] * 0.05 + b[ynW + x] * 0.2 + b[ynW + xn] * 0.05;
      const rxn = av * bv * bv;
      a2[i] = av + dA * la - rxn + feed * (1 - av);
      b2[i] = bv + dB * lb + rxn - decay * bv;
    }
  }
  [a, a2] = [a2, a];
  [b, b2] = [b2, b];
}

function setup() {
  ({ w: gridW, h: gridH } = computeDims());
  createCanvas(gridW, gridH).parent('sketch');
  pixelDensity(1);
  cursor('pointer');
  resetBuffers();
  seedLetter(letters[letterIdx]);
}

function windowResized() {
  ({ w: gridW, h: gridH } = computeDims());
  resizeCanvas(gridW, gridH);
  resetBuffers();
  seedLetter(letters[letterIdx]);
}

function draw() {
  for (let s = 0; s < params.stepsPerFrame; s++) reactionStep();
  loadPixels();
  const px = pixels;
  for (let i = 0; i < gridW * gridH; i++) {
    const v = constrain(a[i] - b[i], 0, 1);
    const c = ((1 - v) * 255) | 0;
    const j = i * 4;
    px[j] = px[j + 1] = px[j + 2] = c;
    px[j + 3] = 255;
  }
  updatePixels();
}

function keyPressed(event) {
  seedLetter(event.key);
}

// ES module 內的函式不會自動變成全域，要手動掛到 window 讓 p5 global mode 找到
window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.keyPressed = keyPressed;
new p5();
