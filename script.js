const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");
const countEl = document.getElementById("count");
const latestEl = document.getElementById("latest");
const factEl = document.getElementById("fact");

const palette = ["#ffb547", "#ff6b6b", "#7ad7f0", "#b48cff", "#6ee7a8", "#f7a4d8", "#ffe08a"];
const syllables = ["zor", "ka", "lume", "vex", "ori", "tal", "neb", "quo", "rin", "sol", "yth", "mar", "pex", "ula"];
const facts = [
  "A day on Venus is longer than its year.",
  "Neutron stars can spin around 600 times every second.",
  "There are more stars in the universe than grains of sand on all of Earth's beaches.",
  "Saturn would float if you could find a bathtub big enough.",
  "Footprints on the Moon could last millions of years, since there is no wind to erase them.",
  "One million Earths could fit inside the Sun.",
  "Space is completely silent, because sound needs air to travel.",
  "Jupiter's Great Red Spot is a storm bigger than Earth.",
  "Light from the Sun takes about 8 minutes to reach us.",
  "Mars has the tallest volcano known, Olympus Mons, nearly three times the height of Everest."
];

let stars = [];
let planets = [];
let sun = { x: 0, y: 0 };
let lastFact = -1;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  sun = { x: innerWidth * 0.68, y: innerHeight * 0.5 };
  stars = Array.from({ length: Math.round((innerWidth * innerHeight) / 2600) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.3 + 0.2,
    phase: Math.random() * Math.PI * 2
  }));
}

function randomName() {
  const n = 2 + Math.floor(Math.random() * 2);
  let name = "";
  for (let i = 0; i < n; i++) name += syllables[Math.floor(Math.random() * syllables.length)];
  return name[0].toUpperCase() + name.slice(1) + " " + Math.ceil(Math.random() * 99);
}

function addPlanet(x, y) {
  const dx = x - sun.x;
  const dy = y - sun.y;
  const radius = Math.max(40, Math.hypot(dx, dy));
  const planet = {
    orbit: radius,
    angle: Math.atan2(dy, dx),
    speed: (0.6 + Math.random() * 0.8) * (30 / radius),
    size: 4 + Math.random() * 10,
    color: palette[Math.floor(Math.random() * palette.length)],
    ring: Math.random() < 0.25,
    name: randomName(),
    born: performance.now()
  };
  planets.push(planet);
  countEl.textContent = planets.length;
  latestEl.textContent = planet.name;
}

function drawSun(t) {
  const pulse = 1 + Math.sin(t / 900) * 0.05;
  const g = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, 90 * pulse);
  g.addColorStop(0, "rgba(255, 220, 140, 1)");
  g.addColorStop(0.25, "rgba(255, 170, 70, 0.9)");
  g.addColorStop(1, "rgba(255, 120, 40, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sun.x, sun.y, 90 * pulse, 0, Math.PI * 2);
  ctx.fill();
}

function frame(t) {
  ctx.fillStyle = "#05060f";
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  for (const s of stars) {
    ctx.globalAlpha = 0.4 + Math.sin(t / 700 + s.phase) * 0.35;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const p of planets) {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, p.orbit, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawSun(t);

  for (const p of planets) {
    p.angle += p.speed * 0.01;
    const grow = Math.min(1, (t - p.born) / 500);
    const x = sun.x + Math.cos(p.angle) * p.orbit;
    const y = sun.y + Math.sin(p.angle) * p.orbit;
    const size = p.size * grow;

    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (p.ring) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 1.9, size * 0.6, -0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  requestAnimationFrame(frame);
}

function showFact() {
  let i;
  do { i = Math.floor(Math.random() * facts.length); } while (i === lastFact && facts.length > 1);
  lastFact = i;
  factEl.classList.remove("show");
  setTimeout(() => {
    factEl.textContent = facts[i];
    factEl.classList.add("show");
  }, 150);
}

canvas.addEventListener("click", (e) => addPlanet(e.clientX, e.clientY));

addEventListener("keydown", (e) => {
  if (e.code !== "Space" || e.target.tagName === "BUTTON") return;
  e.preventDefault();
  const angle = Math.random() * Math.PI * 2;
  const r = 60 + Math.random() * Math.min(innerWidth, innerHeight) * 0.4;
  addPlanet(sun.x + Math.cos(angle) * r, sun.y + Math.sin(angle) * r);
});

document.getElementById("fact-btn").addEventListener("click", showFact);
document.getElementById("clear-btn").addEventListener("click", () => {
  planets = [];
  countEl.textContent = "0";
  latestEl.textContent = "none yet";
});

addEventListener("resize", resize);
resize();
for (let i = 0; i < 3; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 80 + i * 70;
  addPlanet(sun.x + Math.cos(a) * r, sun.y + Math.sin(a) * r);
}
requestAnimationFrame(frame);
