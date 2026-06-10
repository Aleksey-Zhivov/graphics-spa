const canvas = document.querySelector("#scene");
const context = canvas.getContext("2d");
const energyInput = document.querySelector("#energy");
const densityInput = document.querySelector("#density");
const energyValue = document.querySelector("#energyValue");
const densityValue = document.querySelector("#densityValue");
const pauseButton = document.querySelector("#pause");
const pauseLabel = pauseButton.querySelector("span");
const pauseIcon = pauseButton.querySelector(".pause-icon");

const palettes = {
  acid: ["#d7ff38", "#91b724", "#f3f1e8"],
  ember: ["#ff6433", "#ffb000", "#ffe1a6"],
  ice: ["#4de8ff", "#376dff", "#e4faff"],
  mono: ["#f3f1e8", "#8e8e88", "#424440"],
};

const state = {
  mode: "orbit",
  palette: "acid",
  energy: 52,
  density: 70,
  paused: false,
  time: 0,
  pointer: { x: 0, y: 0, active: false },
  particles: [],
};

let width = 0;
let height = 0;
let pixelRatio = 1;
let animationFrame = 0;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createParticle(index) {
  const angle = Math.random() * Math.PI * 2;
  return {
    angle,
    orbit: randomBetween(80, Math.max(160, Math.min(width, height) * 0.54)),
    offset: randomBetween(-0.32, 0.32),
    phase: Math.random() * Math.PI * 2,
    size: randomBetween(0.7, 2.5),
    speed: randomBetween(0.002, 0.008) * (index % 2 ? 1 : -1),
    color: index % palettes[state.palette].length,
  };
}

function syncParticles() {
  const target = Math.round(state.density * 2.2);
  while (state.particles.length < target) {
    state.particles.push(createParticle(state.particles.length));
  }
  state.particles.length = target;
}

function resize() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  syncParticles();
}

function positionFor(particle, index) {
  const energy = state.energy / 100;
  const centerX = width * 0.62;
  const centerY = height * 0.5;
  const t = state.time;
  let x;
  let y;

  if (state.mode === "flow") {
    const travel = (particle.phase * 110 + t * (24 + energy * 70)) % (width + 300);
    x = travel - 150;
    y =
      centerY +
      Math.sin(particle.phase * 2 + t * 0.7 + x * 0.006) * particle.orbit * 0.46 +
      particle.offset * height;
  } else if (state.mode === "pulse") {
    const pulse = 1 + Math.sin(t * (1.2 + energy * 2.2) + particle.phase) * 0.22;
    x = centerX + Math.cos(particle.angle) * particle.orbit * pulse;
    y = centerY + Math.sin(particle.angle) * particle.orbit * 0.55 * pulse;
  } else {
    const angle = particle.angle + t * particle.speed * (25 + energy * 100);
    x = centerX + Math.cos(angle) * particle.orbit;
    y =
      centerY +
      Math.sin(angle) * particle.orbit * 0.52 +
      Math.sin(angle * 3 + particle.phase) * 22 * energy;
  }

  if (state.pointer.active) {
    const dx = x - state.pointer.x;
    const dy = y - state.pointer.y;
    const distance = Math.hypot(dx, dy);
    const reach = 180;
    if (distance < reach && distance > 0) {
      const force = (reach - distance) / reach;
      x += (dx / distance) * force * 56;
      y += (dy / distance) * force * 56;
    }
  }

  return { x, y, index };
}

function drawBackground() {
  context.fillStyle = "rgba(9, 10, 10, 0.22)";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(243, 241, 232, 0.035)";
  context.lineWidth = 1;
  const gap = 72;
  for (let x = width % gap; x < width; x += gap) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = height % gap; y < height; y += gap) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function draw() {
  drawBackground();
  const colors = palettes[state.palette];
  const positions = state.particles.map(positionFor);

  context.globalCompositeOperation = "lighter";
  positions.forEach((position, index) => {
    const particle = state.particles[index];
    const next = positions[(index + 7) % positions.length];
    const distance = Math.hypot(position.x - next.x, position.y - next.y);

    if (distance < 100) {
      context.beginPath();
      context.moveTo(position.x, position.y);
      context.lineTo(next.x, next.y);
      context.strokeStyle = `${colors[particle.color]}18`;
      context.lineWidth = 0.6;
      context.stroke();
    }

    context.beginPath();
    context.arc(position.x, position.y, particle.size, 0, Math.PI * 2);
    context.fillStyle = colors[particle.color];
    context.globalAlpha = 0.35 + (particle.size / 2.5) * 0.65;
    context.fill();
  });

  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
}

function animate() {
  if (!state.paused) {
    state.time += 0.008;
    draw();
  }
  animationFrame = requestAnimationFrame(animate);
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".mode").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
}

function setPalette(palette) {
  state.palette = palette;
  document.documentElement.style.setProperty("--acid", palettes[palette][0]);
  document.querySelectorAll(".swatch").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.palette === palette);
  });
}

document.querySelectorAll(".mode").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

document.querySelectorAll(".swatch").forEach((button) => {
  button.addEventListener("click", () => setPalette(button.dataset.palette));
});

energyInput.addEventListener("input", () => {
  state.energy = Number(energyInput.value);
  energyValue.value = state.energy;
});

densityInput.addEventListener("input", () => {
  state.density = Number(densityInput.value);
  densityValue.value = state.density;
  syncParticles();
});

pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseLabel.textContent = state.paused ? "Resume field" : "Pause field";
  pauseIcon.textContent = state.paused ? "▶" : "Ⅱ";
});

document.querySelector("#randomize").addEventListener("click", () => {
  const modes = ["orbit", "flow", "pulse"];
  const paletteNames = Object.keys(palettes);
  setMode(modes[Math.floor(Math.random() * modes.length)]);
  setPalette(paletteNames[Math.floor(Math.random() * paletteNames.length)]);

  state.energy = Math.round(randomBetween(20, 95));
  state.density = Math.round(randomBetween(35, 115));
  energyInput.value = state.energy;
  densityInput.value = state.density;
  energyValue.value = state.energy;
  densityValue.value = state.density;
  state.particles = [];
  syncParticles();
});

window.addEventListener("pointermove", (event) => {
  state.pointer.x = event.clientX;
  state.pointer.y = event.clientY;
  state.pointer.active = true;
});

document.documentElement.addEventListener("pointerleave", () => {
  state.pointer.active = false;
});

window.addEventListener("resize", resize);
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));

resize();
context.fillStyle = "#090a0a";
context.fillRect(0, 0, width, height);
animate();
