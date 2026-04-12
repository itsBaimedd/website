const intro = document.getElementById("intro");
const main = document.getElementById("main");
const particlesCanvas = document.getElementById("particles");
const cursorLight = document.getElementById("cursor-light");
const backgroundMusic = document.getElementById("bgmusic");
const username = document.getElementById("username");
const status = document.getElementById("status");
const profileViews = document.getElementById("profile-views");
const profileViewsCount = document.getElementById("profile-views-count");
const profileWrap = document.getElementById("profile-wrap");
const discordCopy = document.getElementById("discord-copy");
const robloxLink = document.getElementById("roblox-link");
const namemcLink = document.getElementById("namemc-link");

const usernameText = "cloakzu";

let started = false;
let particlesStarted = false;
let audioPrimed = false;
let usernameAnimationStarted = false;
let statusAnimationStarted = false;
let chaosLoopStarted = false;
let discordTooltipTimeout;
let robloxTooltipTimeout;
let namemcTooltipTimeout;

function fadeInAudio(audio, targetVolume = 0.35, duration = 2200) {
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

function typeUsername(element, speed = 175) {
    if (!element) return;

    const text = element.dataset.text || "";
    element.textContent = "";
    element.classList.remove("typing-complete");

    if (!text || usernameAnimationStarted) {
        return;
    }

    usernameAnimationStarted = true;

    let index = 0;
    let deleting = false;
    const finishAnimationDelay = 500;
    const finishAnimationDuration = 1700;
    const holdDuration = finishAnimationDelay + finishAnimationDuration;

    function tick() {
        if (!deleting) {
            element.classList.remove("typing-complete");
            index += 1;
            element.textContent = text.slice(0, index);

            if (index === text.length) {
                element.classList.add("typing-complete");

                window.setTimeout(() => {
                    element.classList.add("typewriter-finish");

                    window.setTimeout(() => {
                        element.classList.remove("typewriter-finish");
                    }, finishAnimationDuration);
                }, finishAnimationDelay);

                window.setTimeout(() => {
                    element.classList.remove("typing-complete");
                    deleting = true;
                    tick();
                }, holdDuration);
                return;
            }

            window.setTimeout(tick, speed);
            return;
        }

        index -= 1;
        element.textContent = text.slice(0, Math.max(index, 0));

        if (index === 0) {
            deleting = false;
            window.setTimeout(tick, 1260);
            return;
        }

        window.setTimeout(tick, 115);
    }

    window.setTimeout(tick, 180);
}

function typeStatus(element, speed = 34) {
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
                }, 2400);
                return;
            }

            window.setTimeout(tick, speed);
            return;
        }

        index -= 1;
        element.textContent = text.slice(0, Math.max(index, 0));

        if (index === 0) {
            deleting = false;
            window.setTimeout(tick, 1100);
            return;
        }

        window.setTimeout(tick, 18);
    }

    window.setTimeout(tick, 260);
}

function showDiscordTooltip() {
    if (!discordCopy) return;

    discordCopy.classList.add("show-tooltip");
    window.clearTimeout(discordTooltipTimeout);
    discordTooltipTimeout = window.setTimeout(() => {
        discordCopy.classList.remove("show-tooltip");
    }, 1600);
}

function showNameMCTooltip() {
    if (!namemcLink) return;

    namemcLink.classList.add("show-tooltip");
    window.clearTimeout(namemcTooltipTimeout);
    namemcTooltipTimeout = window.setTimeout(() => {
        namemcLink.classList.remove("show-tooltip");
    }, 1400);
}

function showRobloxTooltip() {
    if (!robloxLink) return;

    robloxLink.classList.add("show-tooltip");
    window.clearTimeout(robloxTooltipTimeout);
    robloxTooltipTimeout = window.setTimeout(() => {
        robloxLink.classList.remove("show-tooltip");
    }, 1400);
}

function startChaosLoop() {
    if (!profileWrap || chaosLoopStarted) return;

    chaosLoopStarted = true;

    function triggerBurst() {
        document.body.classList.add("chaos-active");
        profileWrap.classList.add("chaos-burst");

        window.setTimeout(() => {
            profileWrap.classList.remove("chaos-burst");
        }, 1100);

        window.setTimeout(() => {
            document.body.classList.remove("chaos-active");
        }, 1800);

        const nextDelay = 2600 + Math.random() * 2800;
        window.setTimeout(triggerBurst, nextDelay);
    }

    window.setTimeout(triggerBurst, 1500);
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
            document.title = usernameText;
            typeUsername(username);
            typeStatus(status);
            hydrateProfileViews(profileViews, profileViewsCount);
            startChaosLoop();

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

if (discordCopy) {
    discordCopy.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            await navigator.clipboard.writeText(usernameText);
        } catch (error) {
            fallbackCopyText(usernameText);
        }

        showDiscordTooltip();
    });
}

if (namemcLink) {
    namemcLink.addEventListener("click", (event) => {
        event.preventDefault();
        showNameMCTooltip();

        window.setTimeout(() => {
            window.open(namemcLink.href, "_blank", "noopener,noreferrer");
            namemcLink.classList.remove("show-tooltip");
        }, 1000);
    });
}

if (robloxLink) {
    robloxLink.addEventListener("click", (event) => {
        event.preventDefault();
        showRobloxTooltip();

        window.setTimeout(() => {
            window.open(robloxLink.href, "_blank", "noopener,noreferrer");
            robloxLink.classList.remove("show-tooltip");
        }, 1000);
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
    const count = 74;

    for (let i = 0; i < count; i += 1) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            xDrift: (Math.random() - 0.5) * 0.12,
            pulse: Math.random() * Math.PI * 2,
            vy: Math.random() * 0.55 + 0.14,
            size: Math.random() * 2.4 + 0.3,
            alpha: Math.random() * 0.34 + 0.03
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const particle of dots) {
            particle.y += particle.vy;
            particle.x += particle.xDrift;
            particle.pulse += 0.02;

            if (particle.y > canvas.height + 8) {
                particle.y = -8;
                particle.x = Math.random() * canvas.width;
            }

            if (particle.x > canvas.width + 8) {
                particle.x = -8;
            } else if (particle.x < -8) {
                particle.x = canvas.width + 8;
            }

            const glowAlpha = particle.alpha + Math.sin(particle.pulse) * 0.04;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${Math.max(glowAlpha, 0.03)})`;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
}
