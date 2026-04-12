const intro = document.getElementById("intro");
const main = document.getElementById("main");
const particlesCanvas = document.getElementById("particles");
const cursorLight = document.getElementById("cursor-light");
const backgroundMusic = document.getElementById("bgmusic");
const profileViews = document.getElementById("profile-views");
const profileViewsCount = document.getElementById("profile-views-count");
const discordAction = document.getElementById("discord-action");
const audioToggle = document.getElementById("audio-toggle");
const audioToggleIcon = document.getElementById("audio-toggle-icon");
const centerOrb = document.getElementById("center-orb");
const status = document.getElementById("status");
const expandableCards = Array.from(document.querySelectorAll(".spotify-card, .youtube-card"));

let started = false;
let particlesStarted = false;
let audioPrimed = false;
let audioMuted = false;
let discordTooltipTimeout;
let statusAnimationStarted = false;

function fadeInAudio(audio, targetVolume = 0.28, duration = 2200) {
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 0;
    audio.play().then(() => {
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            audio.volume = targetVolume * progress;

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }).catch(() => {
        /* ignore blocked playback attempts */
    });
}

function primeAudio(audio) {
    if (!audio || audioPrimed) return;

    audioPrimed = true;
    audio.muted = true;
    audio.volume = 0;
    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
    }).catch(() => {
        audio.muted = false;
    });
}

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
}

function showDiscordTooltip() {
    if (!discordAction) return;

    discordAction.classList.add("show-tooltip");
    window.clearTimeout(discordTooltipTimeout);
    discordTooltipTimeout = window.setTimeout(() => {
        discordAction.classList.remove("show-tooltip");
    }, 1600);
}

function typeStatus(element, speed = 72) {
    if (!element) return;

    const text = element.dataset.text || "";

    if (!text || statusAnimationStarted) {
        return;
    }

    statusAnimationStarted = true;
    element.textContent = "";
    element.classList.remove("typing-complete");

    let index = 0;
    let deleting = false;

    function tick() {
        if (!deleting) {
            element.classList.remove("typing-complete");
            index += 1;
            element.textContent = text.slice(0, index);

            if (index === text.length) {
                element.classList.add("typing-complete");
                window.setTimeout(() => {
                    element.classList.remove("typing-complete");
                    deleting = true;
                    tick();
                }, 2000);
                return;
            }

            window.setTimeout(tick, speed);
            return;
        }

        index -= 1;
        element.textContent = text.slice(0, Math.max(index, 0));

        if (index === 0) {
            deleting = false;
            window.setTimeout(tick, 950);
            return;
        }

        window.setTimeout(tick, 42);
    }

    window.setTimeout(tick, 220);
}

async function hydrateProfileViews(container, countElement) {
    if (!container || !countElement) return;

    const user = container.dataset.user;
    if (!user) return;

    try {
        const response = await fetch(`/api/views?user=${encodeURIComponent(user)}`, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Views request failed with ${response.status}`);
        }

        const data = await response.json();
        const count = typeof data.views === "number" ? data.views : 0;
        countElement.textContent = count.toLocaleString();
    } catch (error) {
        countElement.textContent = "0";
    }
}

function toggleAudioState() {
    if (!backgroundMusic) return;

    audioMuted = !audioMuted;
    backgroundMusic.muted = audioMuted;
    audioToggle.classList.toggle("is-muted", audioMuted);

    if (audioToggleIcon) {
        audioToggleIcon.src = audioMuted ? "./fent/assets/play.png" : "./fent/assets/pause.png";
        audioToggleIcon.alt = audioMuted ? "Play audio" : "Pause audio";
    }
}

function syncMainScrollState() {
    const hasOpenCard = expandableCards.some((card) => card.classList.contains("is-open"));
    main.classList.toggle("is-scrollable", hasOpenCard);
}

document.addEventListener(
    "click",
    () => {
        if (started) return;
        started = true;
        primeAudio(backgroundMusic);

        intro.style.opacity = "0";

        setTimeout(() => {
            intro.style.display = "none";
            main.style.opacity = "1";
            particlesCanvas.style.display = "block";
            cursorLight.style.display = "block";

            fadeInAudio(backgroundMusic);
            hydrateProfileViews(profileViews, profileViewsCount);
            typeStatus(status);

            if (!particlesStarted) {
                particlesStarted = true;
                startParticles();
            }
        }, 700);
    },
    { once: true }
);

document.addEventListener("mousemove", (event) => {
    if (!cursorLight) return;
    cursorLight.style.left = `${event.clientX}px`;
    cursorLight.style.top = `${event.clientY}px`;
});

if (discordAction) {
    discordAction.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            await navigator.clipboard.writeText("fenteds");
        } catch (error) {
            fallbackCopyText("fenteds");
        }

        showDiscordTooltip();
    });
}

if (audioToggle) {
    audioToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleAudioState();
    });
}

document.addEventListener("selectstart", (event) => {
    event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

for (const card of expandableCards) {
    card.addEventListener("click", () => {
        const isOpen = card.classList.contains("is-open");
        const iframe = card.querySelector("iframe");
        const embedUrl = card.dataset.embed;

        for (const otherCard of expandableCards) {
            if (otherCard !== card) {
                otherCard.classList.remove("is-open");
            }
        }

        if (isOpen) {
            card.classList.remove("is-open");
            syncMainScrollState();
            return;
        }

        if (iframe && embedUrl && !iframe.src) {
            iframe.src = embedUrl;
        }

        card.classList.add("is-open");
        syncMainScrollState();
    });
}

function startParticles() {
    const canvas = particlesCanvas;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const dots = [];
    const count = 32;

    for (let i = 0; i < count; i += 1) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vy: Math.random() * 0.22 + 0.08,
            size: Math.random() * 2.1 + 0.3,
            alpha: Math.random() * 0.22 + 0.05
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const particle of dots) {
            particle.y += particle.vy;

            if (particle.y > canvas.height + 8) {
                particle.y = -8;
                particle.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,231,214,${particle.alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
}
