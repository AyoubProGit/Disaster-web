const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "http://localhost:5001/static/big.css";
document.head.appendChild(link);

const junk = Array.from({ length: 4096 }, () =>
  "junk".repeat(2048)
).join("");

const leak = [];
setInterval(() => {
  leak.push(junk.slice(0));
  if (leak.length > 128) leak.splice(0, 64);
}, 500);

function burn(ms = 30) {
  const end = performance.now() + ms;
  while (performance.now() < end) Math.sin(Math.random() * 1e6);
}
setInterval(() => burn(), 250);

const listeners = [];
for (let i = 0; i < 500; i++) {
  const fn = () => burn(5);
  document.addEventListener("mousemove", fn);
  document.addEventListener("touchmove", fn);
  listeners.push(fn);
}

function inflateDOM() {
  const root = document.body;
  for (let i = 0; i < 50; i++) {
    const d = document.createElement("div");
    d.className = `bg-${1 + (i % 300)} shadow-fat-${1 + (i % 10)} p-fat-${1 + (i % 5)}`;
    d.style.height = `${64 + (i % 32)}px`;
    d.style.animation = `spin ${5 + (i % 6)}s linear infinite`;
    d.style.position = "absolute";
    d.style.top = "0";
    d.style.left = "0";
    d.style.width = "1px";
    d.style.height = "1px";
    root.appendChild(d);
  }
}
inflateDOM();

async function spam() {
  try {
    await fetch(`http://localhost:5001/api/payload?ts=${Date.now()}`);
  } catch {}
}
setInterval(spam, 3000);

let hue = 0;
setInterval(() => {
  hue = (hue + 3) % 360;
  document.documentElement.style.setProperty("--h", hue.toString());
}, 500);

const giant = [];
for (let i = 0; i < 256_000; i++) {
  giant.push(i ^ (i << 1));
}

function slowSort(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length; j++)
      if (arr[i] < arr[j]) [arr[i], arr[j]] = [arr[j], arr[i]];
}
setTimeout(() => slowSort(giant.slice(0, 8_192)), 3_000);