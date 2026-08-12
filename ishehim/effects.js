const intro = document.getElementById("intro");
const stage = document.getElementById("stage");
const profile = document.getElementById("profile");
const username = document.getElementById("username");
const verse = document.getElementById("verse");
const views = document.getElementById("profile-views");
const viewsCount = document.getElementById("profile-views-count");
const dustCanvas = document.getElementById("dust");
const discordCopy = document.getElementById("discord-copy");
const toast = document.getElementById("toast");
const music = document.getElementById("background-music");
let started = false;
let toastTimer;

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

function startMusic() {
    if (!music) return;
    music.volume = 0;
    music.play().then(() => {
        const startedAt = performance.now();
        const fadeDuration = 2000;
        const targetVolume = .26;

        function fadeIn(now) {
            const progress = Math.min((now - startedAt) / fadeDuration, 1);
            music.volume = targetVolume * progress;
            if (progress < 1) requestAnimationFrame(fadeIn);
        }

        requestAnimationFrame(fadeIn);
    }).catch(() => {});
}

async function typeText(element, text, speed) {
    if (!element) return;
    element.textContent = "";
    for (let index = 1; index <= text.length; index += 1) {
        element.textContent = text.slice(0, index);
        await wait(speed);
    }
}

async function loopVerse() {
    if (!verse) return;
    const text = verse.dataset.text || "";

    while (true) {
        verse.textContent = "";
        for (let index = 1; index <= text.length; index += 1) {
            verse.textContent = text.slice(0, index);
            await wait(25);
        }

        await wait(2400);

        for (let index = text.length - 1; index >= 0; index -= 1) {
            verse.textContent = text.slice(0, index);
            await wait(13);
        }

        await wait(850);
    }
}

async function hydrateViews() {
    if (!views || !viewsCount) return;
    try {
        const response = await fetch(`/api/views?user=${encodeURIComponent(views.dataset.user)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Views unavailable");
        const data = await response.json();
        viewsCount.textContent = (typeof data.views === "number" ? data.views : 0).toLocaleString();
    } catch {
        viewsCount.textContent = "0";
    }
}

function startDust() {
    if (!dustCanvas) return;
    const context = dustCanvas.getContext("2d");
    const particles = [];

    function resize() {
        dustCanvas.width = window.innerWidth;
        dustCanvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let index = 0; index < 34; index += 1) {
        particles.push({
            x: Math.random() * dustCanvas.width,
            y: Math.random() * dustCanvas.height,
            radius: Math.random() * 1.2 + .2,
            speed: Math.random() * .16 + .04,
            opacity: Math.random() * .18 + .025
        });
    }

    function draw() {
        context.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
        for (const particle of particles) {
            particle.y -= particle.speed;
            if (particle.y < -4) {
                particle.y = dustCanvas.height + 4;
                particle.x = Math.random() * dustCanvas.width;
            }
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(255,255,255,${particle.opacity})`;
            context.fill();
        }
        requestAnimationFrame(draw);
    }

    draw();
}

intro?.addEventListener("click", async () => {
    if (started) return;
    started = true;
    intro.classList.add("is-gone");
    stage?.classList.add("is-ready");
    startMusic();
    hydrateViews();
    startDust();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (verse) verse.textContent = verse.dataset.text || "";
        return;
    }

    if (username) await typeText(username, username.dataset.text || "ishehim", 105);
    await wait(260);
    loopVerse();
});

async function copyText(value) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return;
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    document.execCommand("copy");
    field.remove();
}

discordCopy?.addEventListener("click", async () => {
    try {
        await copyText(discordCopy.dataset.copy || "");
        if (toast) toast.textContent = "Discord copied";
    } catch {
        if (toast) toast.textContent = "Couldn't copy automatically";
    }

    if (toast) {
        const bounds = discordCopy.getBoundingClientRect();
        toast.style.setProperty("--toast-x", `${bounds.left + bounds.width / 2}px`);
        toast.style.setProperty("--toast-y", `${bounds.top - 9}px`);
    }

    toast?.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast?.classList.remove("show"), 1600);
});

if (profile && window.matchMedia("(pointer: fine)").matches) {
    profile.addEventListener("pointermove", (event) => {
        const bounds = profile.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        profile.style.setProperty("--rx", `${(.5 - y) * 3.5}deg`);
        profile.style.setProperty("--ry", `${(x - .5) * 4.5}deg`);
        profile.style.setProperty("--gx", `${x * 100}%`);
        profile.style.setProperty("--gy", `${y * 100}%`);
    });

    profile.addEventListener("pointerleave", () => {
        profile.style.setProperty("--rx", "0deg");
        profile.style.setProperty("--ry", "0deg");
        profile.style.setProperty("--gx", "50%");
        profile.style.setProperty("--gy", "30%");
    });
}
