const pages = [...document.querySelectorAll(".page")];
const leavesContainer = document.getElementById("leaves-container");
const bokehContainer = document.getElementById("bokeh-container");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let currentPage = Math.max(0, pages.findIndex(page => page.classList.contains("active")));
let transitionLocked = false;
let transitionTimer = 0;

pages[currentPage]?.prepend(...[bokehContainer, leavesContainer].filter(Boolean));

function resetFinale() {
  const magicButton = document.getElementById("lightsButton");
  if (magicButton) {
    magicButton.disabled = false;
    delete magicButton.dataset.released;
    magicButton.innerHTML = "Release the Magic &#10024;";
  }
  document.querySelectorAll(".birthday-sparkle").forEach(sparkle => sparkle.remove());
  document.querySelectorAll(".wish-firefly").forEach(firefly => firefly.remove());
  document.querySelectorAll(".bokeh.is-awake").forEach(light => light.classList.remove("is-awake"));
}

function showPage(pageId) {
  const nextIndex = pages.findIndex(page => page.id === pageId);
  if (nextIndex < 0 || nextIndex === currentPage || transitionLocked) return;
  const nextPage = pages[nextIndex];
  transitionLocked = true;
  nextPage.prepend(...[bokehContainer, leavesContainer].filter(Boolean));

  pages.forEach((page, index) => {
    const isActive = index === nextIndex;
    page.classList.toggle("active", isActive);
    page.setAttribute("aria-hidden", String(!isActive));
    page.inert = !isActive;
  });
  currentPage = nextIndex;
  if (pageId === "page1") resetFinale();
  nextPage.querySelector("h1, h2")?.focus({ preventScroll: true });
  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => {
    transitionLocked = false;
  }, reducedMotion.matches ? 0 : 780);
}

// One click handler starts music and advances, even if the optional song is missing.
const birthdayMusic = document.getElementById("birthdayMusic");
const musicToggle = document.getElementById("musicToggle");
const startButton = document.getElementById("startButton");

function updateMusicButton(isPlaying) {
  musicToggle?.classList.toggle("playing", isPlaying);
  musicToggle?.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
  musicToggle?.setAttribute("aria-pressed", String(isPlaying));
  if (musicToggle) musicToggle.title = isPlaying ? "Pause background music" : "Play background music";
}

function showMusicError() {
  updateMusicButton(false);
  if (!musicToggle) return;
  musicToggle.title = birthdayMusic?.error
    ? "The song could not be loaded. Check assets/music/song.mp3."
    : "Music could not start. Activate to try again.";
  musicToggle.setAttribute("aria-label", "Music unavailable; activate to try again");
}

async function startMusicFromGesture() {
  if (!birthdayMusic || !birthdayMusic.paused) return;
  birthdayMusic.volume = 0.42;
  try {
    await birthdayMusic.play();
    updateMusicButton(true);
  } catch {
    showMusicError();
  }
}

startButton?.addEventListener("click", () => {
  // Request playback immediately while this click still counts as a user gesture.
  // Then advance the page without waiting for the audio to finish loading.
  void startMusicFromGesture();
  showPage("page2");
});

musicToggle?.addEventListener("click", async () => {
  if (!birthdayMusic) return;
  if (!birthdayMusic.paused) {
    birthdayMusic.pause();
    updateMusicButton(false);
    return;
  }
  await startMusicFromGesture();
});

birthdayMusic?.addEventListener("play", () => updateMusicButton(true));
birthdayMusic?.addEventListener("pause", () => updateMusicButton(false));
birthdayMusic?.addEventListener("error", showMusicError);

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.next));
});
document.getElementById("replayButton")?.addEventListener("click", () => showPage("page1"));

document.addEventListener("keydown", event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowRight" && currentPage < pages.length - 1) showPage(pages[currentPage + 1].id);
  if (event.key === "ArrowLeft" && currentPage > 0) showPage(pages[currentPage - 1].id);
});

// Show real family photos when present; keep the illustrated frame on missing files.
document.querySelectorAll(".photo-placeholder img").forEach(image => {
  const frame = image.closest(".photo-placeholder");
  const showImage = () => {
    if (image.naturalWidth > 0) {
      frame?.classList.add("image-loaded");
      frame?.classList.remove("image-missing");
    } else {
      frame?.classList.add("image-missing");
      frame?.classList.remove("image-loaded");
    }
  };
  image.addEventListener("load", showImage);
  image.addEventListener("error", showImage);
  if (image.complete) showImage();
});

// A restrained field of softly drifting fireflies and bokeh.
if (bokehContainer && !reducedMotion.matches) {
  const count = window.innerWidth < 600 ? 13 : 20;
  for (let index = 0; index < count; index += 1) {
    const light = document.createElement("span");
    const size = 4 + Math.random() * 11;
    light.className = "bokeh";
    light.style.left = `${4 + Math.random() * 92}%`;
    light.style.top = `${8 + Math.random() * 78}%`;
    light.style.width = `${size}px`;
    light.style.height = `${size}px`;
    light.style.setProperty("--blur", `${1 + Math.random() * 4}px`);
    light.style.setProperty("--alpha", `${0.36 + Math.random() * 0.5}`);
    light.style.setProperty("--duration", `${4 + Math.random() * 8}s`);
    light.style.setProperty("--delay", `${Math.random() * -9}s`);
    light.style.setProperty("--drift", `${-24 + Math.random() * 48}px`);
    light.style.setProperty("--rise", `${-15 - Math.random() * 35}px`);
    bokehContainer.append(light);
  }
}

// Natural SVG leaves in three silhouettes; a fixed, modest count avoids DOM churn.
const leafShapes = [
  "M50 96 L50 78 L26 82 L30 72 L6 58 L16 54 L8 26 L30 40 L32 30 L42 44 L50 4 L58 44 L68 30 L70 40 L92 26 L84 54 L94 58 L70 72 L74 82 L50 78 Z",
  "M50 96 L50 84 C40 86 34 80 36 72 C26 74 20 66 26 58 C16 56 14 46 24 42 C16 36 20 24 32 26 C30 16 40 10 46 16 C48 8 52 8 54 16 C60 10 70 16 68 26 C80 24 84 36 76 42 C86 46 84 56 74 58 C80 66 74 74 64 72 C66 80 60 86 50 84 Z",
  "M50 96 C24 80 12 53 24 28 C32 12 45 5 50 4 C55 5 68 12 76 28 C88 53 76 80 50 96 Z"
];
const leafColors = [["#f4d47f", "#9d6a35"], ["#e8ad56", "#98532b"], ["#d98546", "#783e27"], ["#bfa15d", "#6d552f"]];

function createLeaf(index) {
  if (!leavesContainer) return;
  const leaf = document.createElement("span");
  const shape = leafShapes[Math.floor(Math.random() * leafShapes.length)];
  const colors = leafColors[Math.floor(Math.random() * leafColors.length)];
  const depth = Math.random();
  const size = 13 + depth * 24;
  leaf.className = "falling-leaf";
  const mobile = window.innerWidth < 600;
  const leftSide = Math.random() < .5;
  const edgeSpread = mobile ? 8 : 15;
  leaf.style.left = leftSide
    ? `${Math.random() * edgeSpread}%`
    : `${100 - Math.random() * edgeSpread}%`;
  leaf.style.width = `${size}px`;
  leaf.style.height = `${size * 1.14}px`;
  leaf.style.opacity = `${0.28 + depth * 0.48}`;
  leaf.style.filter = `blur(${(1 - depth) * 1.1}px) drop-shadow(0 2px 5px rgba(7, 17, 12, .34))`;
  leaf.style.setProperty("--fall-duration", `${14 + Math.random() * 15}s`);
  leaf.style.setProperty("--fall-delay", `${-Math.random() * 25}s`);
  const sway = mobile ? 16 : 42;
  leaf.style.setProperty("--sway", `${-sway + Math.random() * sway * 2}px`);
  leaf.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="leaf-${index}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><path d="${shape}" fill="url(#leaf-${index})" stroke="${colors[1]}" stroke-width="1.5"/><path d="M50 96 L50 8 M50 62 L24 42 M50 68 L77 44 M50 44 L37 27 M50 49 L65 30" fill="none" stroke="${colors[1]}" stroke-opacity=".65" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  leavesContainer.append(leaf);
}

if (leavesContainer && !reducedMotion.matches) {
  const leafCount = window.innerWidth < 600 ? 10 : 17;
  for (let index = 0; index < leafCount; index += 1) createLeaf(index);
}

// Release a small golden glimmer. Replay resets this button and its temporary effects.
document.getElementById("lightsButton")?.addEventListener("click", event => {
  const button = event.currentTarget;
  if (button.dataset.released) return;
  button.dataset.released = "true";
  button.disabled = true;
  button.textContent = "Your wish is on its way!";
  document.querySelectorAll(".bokeh").forEach(light => light.classList.add("is-awake"));
  if (reducedMotion.matches) return;
  if (bokehContainer) {
    const fireflyBurst = document.createDocumentFragment();
    for (let index = 0; index < 44; index += 1) {
      const firefly = document.createElement("span");
      const size = 5 + Math.random() * 9;
      firefly.className = "bokeh wish-firefly";
      firefly.style.left = `${Math.random() * 100}%`;
      firefly.style.top = `${18 + Math.random() * 82}%`;
      firefly.style.width = `${size}px`;
      firefly.style.height = `${size}px`;
      firefly.style.setProperty("--duration", `${3.2 + Math.random() * 2.2}s`);
      firefly.style.setProperty("--delay", `${Math.random() * .65}s`);
      firefly.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
      firefly.style.setProperty("--rise", `${-100 - Math.random() * 220}px`);
      firefly.addEventListener("animationend", () => firefly.remove(), { once: true });
      fireflyBurst.append(firefly);
    }
    bokehContainer.append(fireflyBurst);
  }
  const colors = ["#f8dc91", "#fff6d9", "#d7a957", "#c6dfc9"];
  const sparkleBurst = document.createDocumentFragment();
  for (let index = 0; index < 24; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "birthday-sparkle";
    sparkle.style.left = `${5 + Math.random() * 90}vw`;
    sparkle.style.top = `${19 + Math.random() * 68}vh`;
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.animationDelay = `${Math.random() * .8}s`;
    sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
    sparkleBurst.append(sparkle);
  }
  document.body.append(sparkleBurst);
});
