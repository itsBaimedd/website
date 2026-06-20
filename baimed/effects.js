const intro = document.getElementById("intro");
const welcomeSplash = document.getElementById("welcome-splash");
const main = document.getElementById("main");
const particlesCanvas = document.getElementById("particles");
const cursorLight = document.getElementById("cursor-light");
const socialCard = document.getElementById("social-card");
const backgroundMusic = document.getElementById("bgmusic");
const welcomeSound = document.getElementById("welcome-sound");
const username = document.getElementById("username");
const status = document.getElementById("status");
const discordIcon = document.getElementById("discord-icon");
const discordIconImage = document.getElementById("discord-icon-image");
const discordIconFallback = document.getElementById("discord-icon-fallback");
const discordTitle = document.getElementById("discord-title");
const discordSubtext = document.getElementById("discord-subtext");
const joined = document.getElementById("joined");
const profileViews = document.getElementById("profile-views");
const profileViewsCount = document.getElementById("profile-views-count");
const discordCopy = document.getElementById("discord-copy");
const tiktokLink = document.getElementById("tiktok-link");
const instagramLink = document.getElementById("instagram-link");
const profileWrap = document.getElementById("profile-wrap");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let started = false;
let particlesStarted = false;
let usernameAnimationStarted = false;
let statusAnimationStarted = false;
let discordRedirecting = false;
let audioPrimed = false;
let discordTooltipTimeout;
let tiktokTooltipTimeout;
let instagramTooltipTimeout;
let lastCursorParticleAt = 0;
let welcomeSplashTimeout;
let introRevealTimeout;
let particlesAnimationFrameId;
const cursorTrailParticles = [];
const cursorTrailShapes = ["heart", "star", "note", "dot"];

function fadeInAudio(audio, targetVolume = 0.45, duration = 2200, startAt = 1) {
    if (!audio) return;

    audio.currentTime = startAt;
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

function playOneShotAudio(audio, volume = 0.82) {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;
    audio.play().catch(() => {
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
        /* ignore blocked playback attempts */
    });
}

function resetInitialState() {
    started = false;
    particlesStarted = false;
    usernameAnimationStarted = false;
    statusAnimationStarted = false;
    discordRedirecting = false;
    lastCursorParticleAt = 0;
    cursorTrailParticles.length = 0;

    window.clearTimeout(welcomeSplashTimeout);
    window.clearTimeout(introRevealTimeout);

    if (particlesAnimationFrameId) {
        cancelAnimationFrame(particlesAnimationFrameId);
        particlesAnimationFrameId = null;
    }

    if (intro) {
        intro.style.display = "flex";
        intro.style.opacity = "1";
        intro.style.transform = "scale(1)";
    }

    if (welcomeSplash) {
        welcomeSplash.classList.remove("show");
        welcomeSplash.style.animation = "none";
        const welcomeText = welcomeSplash.querySelector("span");

        if (welcomeText) {
            welcomeText.style.animation = "none";
        }

        welcomeSplash.offsetHeight;
        welcomeSplash.style.animation = "";

        if (welcomeText) {
            welcomeText.style.animation = "";
        }
    }

    if (main) {
        main.style.opacity = "0";
    }

    if (particlesCanvas) {
        particlesCanvas.style.display = "none";
    }

    if (cursorLight) {
        cursorLight.style.display = "none";
        cursorLight.style.opacity = "0.44";
    }

    resetProfileTilt();

    if (username) {
        username.textContent = "";
        username.classList.remove("typing-complete", "typewriter-finish");
    }

    if (status) {
        status.textContent = "";
        status.classList.remove("typing-complete");
    }

    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        backgroundMusic.volume = 0;
        backgroundMusic.muted = false;
    }

    if (welcomeSound) {
        welcomeSound.pause();
        welcomeSound.currentTime = 0;
        welcomeSound.volume = 0.82;
    }
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

function typeStatus(element, speed = 80) {
    if (!element) return;

    const text = element.dataset.text || "";
    element.textContent = "";
    element.classList.remove("typing-complete");

    if (!text || statusAnimationStarted) {
        return;
    }

    statusAnimationStarted = true;

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
                }, 2200);
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

        window.setTimeout(tick, 34);
    }

    window.setTimeout(tick, 500);
}

function typeDocumentTitle(text = "Baimed", speed = 175) {
    if (!text) return;

    let index = 0;
    let deleting = false;

    function tick() {
        if (!deleting) {
            index += 1;
            document.title = text.slice(0, index);

            if (index === text.length) {
                window.setTimeout(() => {
                    deleting = true;
                    tick();
                }, 2200);
                return;
            }

            window.setTimeout(tick, speed);
            return;
        }

        index -= 1;
        document.title = text.slice(0, Math.max(index, 0));

        if (index === 0) {
            deleting = false;
            window.setTimeout(tick, 1260);
            return;
        }

        window.setTimeout(tick, 115);
    }

    document.title = "";
    window.setTimeout(tick, 180);
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
    if (!discordCopy) return;

    discordCopy.classList.add("show-tooltip");
    window.clearTimeout(discordTooltipTimeout);
    discordTooltipTimeout = window.setTimeout(() => {
        discordCopy.classList.remove("show-tooltip");
    }, 1600);
}

function showDiscordRedirectTooltip() {
    if (!socialCard) return;

    socialCard.classList.add("show-tooltip");
    window.clearTimeout(discordTooltipTimeout);
    discordTooltipTimeout = window.setTimeout(() => {
        socialCard.classList.remove("show-tooltip");
    }, 1400);
}

function showInstagramTooltip() {
    if (!instagramLink) return;

    instagramLink.classList.add("show-tooltip");
    window.clearTimeout(instagramTooltipTimeout);
    instagramTooltipTimeout = window.setTimeout(() => {
        instagramLink.classList.remove("show-tooltip");
    }, 1400);
}

function showTiktokTooltip() {
    if (!tiktokLink) return;

    tiktokLink.classList.add("show-tooltip");
    window.clearTimeout(tiktokTooltipTimeout);
    tiktokTooltipTimeout = window.setTimeout(() => {
        tiktokLink.classList.remove("show-tooltip");
    }, 1400);
}

function updateProfileTilt(event) {
    if (!profileWrap || !started) return;

    const rect = profileWrap.getBoundingClientRect();
    const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

    if (isInside) {
        resetProfileTilt();
        return;
    }

    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = offsetX * 10;
    const rotateX = offsetY * -10;
    const translateX = offsetX * 8;
    const translateY = offsetY * 6;

    profileWrap.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0)`;
}

function resetProfileTilt() {
    if (!profileWrap) return;
    profileWrap.style.transform = "rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)";
}

function updateJoinedText(element) {
    if (!element) return;

    const joinedDateText = element.dataset.joinedDate;

    if (!joinedDateText) return;

    const joinedDate = new Date(`${joinedDateText}T00:00:00`);

    if (Number.isNaN(joinedDate.getTime())) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(joinedDate.getFullYear(), joinedDate.getMonth(), joinedDate.getDate());

    if (start > today) {
        element.textContent = "Joined just now";
        return;
    }

    const dayDiff = Math.floor((today - start) / 86400000);

    if (dayDiff === 0) {
        element.textContent = "Joined today";
        return;
    }

    if (dayDiff === 1) {
        element.textContent = "Joined 1 day ago";
        return;
    }

    if (dayDiff < 30) {
        element.textContent = `Joined ${dayDiff} days ago`;
        return;
    }

    let months =
        (today.getFullYear() - start.getFullYear()) * 12 +
        (today.getMonth() - start.getMonth());

    if (today.getDate() < start.getDate()) {
        months -= 1;
    }

    if (months < 12) {
        const safeMonths = Math.max(months, 1);
        element.textContent = `Joined ${safeMonths} month${safeMonths === 1 ? "" : "s"} ago`;
        return;
    }

    let years = today.getFullYear() - start.getFullYear();

    if (
        today.getMonth() < start.getMonth() ||
        (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())
    ) {
        years -= 1;
    }

    const safeYears = Math.max(years, 1);
    element.textContent = `Joined ${safeYears} year${safeYears === 1 ? "" : "s"} ago`;
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

async function hydrateDiscordCard(card) {
    if (!card || !discordTitle || !discordSubtext || !discordIcon) return;

    const widgetUrl = card.dataset.widgetUrl;
    const fallbackInvite = card.dataset.fallbackInvite;

    if (!widgetUrl) return;

    try {
        const response = await fetch(widgetUrl, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Discord widget request failed with ${response.status}`);
        }

        const data = await response.json();
        const memberCount = Array.isArray(data.members) ? data.members.length : 0;
        const onlineCount = typeof data.presence_count === "number" ? data.presence_count : 0;

        if (data.name) {
            discordTitle.textContent = data.name;
            if (discordIconFallback) {
                discordIconFallback.textContent = data.name.charAt(0).toUpperCase();
            }
        }

        discordSubtext.innerHTML = `
            <span class="dot"></span>
            <span>${onlineCount} Online</span>
            <span class="separator">&bull;</span>
            <span>${memberCount} Members</span>
        `;

        if (data.instant_invite) {
            card.href = data.instant_invite;
        } else if (fallbackInvite) {
            card.href = fallbackInvite;
        }
    } catch (error) {
        if (fallbackInvite) {
            card.href = fallbackInvite;
        }
    }
}

if (discordIconImage && discordIconFallback) {
    discordIconImage.addEventListener("load", () => {
        discordIconFallback.style.display = "none";
    });

    discordIconImage.addEventListener("error", () => {
        discordIconImage.style.display = "none";
        discordIconFallback.style.display = "flex";
    });
}

function startExperience() {
    if (started) return;
    started = true;
    fadeInAudio(backgroundMusic);

    if (welcomeSplash) {
        welcomeSplash.classList.remove("show");
        welcomeSplash.offsetHeight;
        welcomeSplash.classList.add("show");
        playOneShotAudio(welcomeSound);
        window.clearTimeout(welcomeSplashTimeout);
        welcomeSplashTimeout = window.setTimeout(() => {
            welcomeSplash.classList.remove("show");
        }, 2700);
    }

    intro.style.opacity = "0";
    intro.style.transform = "scale(1.015)";

    window.clearTimeout(introRevealTimeout);
    introRevealTimeout = window.setTimeout(() => {
        intro.style.display = "none";
        main.style.opacity = "1";

        if (!prefersReducedMotion) {
            particlesCanvas.style.display = "block";
            cursorLight.style.display = "block";
        }

        typeUsername(username);
        typeStatus(status);
        typeDocumentTitle();
        updateJoinedText(joined);
        hydrateProfileViews(profileViews, profileViewsCount);
        hydrateDiscordCard(socialCard);

        if (!particlesStarted && !prefersReducedMotion) {
            particlesStarted = true;
            startParticles();
        }
    }, 700);
}

resetInitialState();

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        resetInitialState();
    }
});

document.addEventListener("click", startExperience);

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startExperience();
    }
});

/* cursor light follow */
document.addEventListener("mousemove", (e) => {
    if (prefersReducedMotion) return;

    cursorLight.style.left = `${e.clientX}px`;
    cursorLight.style.top = `${e.clientY}px`;
    emitCursorTrail(e.clientX, e.clientY);
    updateProfileTilt(e);
});

/* hide cursor light over the middle box */
if (socialCard) {
    socialCard.addEventListener("mouseenter", () => {
        cursorLight.style.opacity = "0";
    });

    socialCard.addEventListener("mouseleave", () => {
        cursorLight.style.opacity = "0.44";
    });
}

document.addEventListener("mouseleave", resetProfileTilt);

if (discordCopy) {
    discordCopy.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            await navigator.clipboard.writeText("Baimed");
        } catch (error) {
            fallbackCopyText("Baimed");
        }

        showDiscordTooltip();
    });
}

if (socialCard) {
    socialCard.addEventListener("click", (event) => {
        if (discordRedirecting) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        discordRedirecting = true;
        showDiscordRedirectTooltip();

        window.setTimeout(() => {
            window.open(socialCard.href, "_blank", "noopener,noreferrer");
            socialCard.classList.remove("show-tooltip");
            discordRedirecting = false;
        }, 1000);
    });
}

if (instagramLink) {
    instagramLink.addEventListener("click", (event) => {
        event.preventDefault();
        showInstagramTooltip();

        window.setTimeout(() => {
            window.open(instagramLink.href, "_blank", "noopener,noreferrer");
            instagramLink.classList.remove("show-tooltip");
        }, 1000);
    });
}

if (tiktokLink) {
    tiktokLink.addEventListener("click", (event) => {
        event.preventDefault();
        showTiktokTooltip();

        window.setTimeout(() => {
            window.open(tiktokLink.href, "_blank", "noopener,noreferrer");
            tiktokLink.classList.remove("show-tooltip");
        }, 1000);
    });
}

function emitCursorTrail(x, y) {
    if (!started || !particlesStarted) return;

    const now = performance.now();

    if (now - lastCursorParticleAt < 18) return;

    lastCursorParticleAt = now;

    cursorTrailParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.58,
        vy: -0.54 - Math.random() * 0.72,
        size: 9 + Math.random() * 8,
        age: 0,
        life: 820 + Math.random() * 360,
        alpha: 0.50 + Math.random() * 0.24,
        rotation: (Math.random() - 0.5) * 0.8,
        spin: (Math.random() - 0.5) * 0.024,
        shape: cursorTrailShapes[Math.floor(Math.random() * cursorTrailShapes.length)]
    });

    if (cursorTrailParticles.length > 110) {
        cursorTrailParticles.splice(0, cursorTrailParticles.length - 110);
    }
}

/* subtle particles */
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
    const count = 42;
    const shapes = ["dot", "star", "heart", "petal"];

    for (let i = 0; i < count; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.16,
            vy: Math.random() * 0.12 + 0.025,
            size: Math.random() * 2.4 + 1.2,
            alpha: Math.random() * 0.30 + 0.12,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.006
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of dots) {
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.spin;

            if (p.x < -5) p.x = canvas.width + 5;
            if (p.x > canvas.width + 5) p.x = -5;
            if (p.y > canvas.height + 8) p.y = -8;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();

            if (p.shape === "heart") {
                ctx.fillStyle = "rgba(255,125,188,1)";
                ctx.font = `${p.size * 4}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("\u2661", 0, 0);
                ctx.restore();
                continue;
            }

            if (p.shape === "star") {
                ctx.fillStyle = "rgba(185,155,255,1)";
                ctx.font = `${p.size * 4}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("\u2726", 0, 0);
                ctx.restore();
                continue;
            }

            if (p.shape === "petal") {
                ctx.ellipse(0, 0, p.size * 0.72, p.size * 1.8, 0, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,183,216,1)";
                ctx.fill();
                ctx.restore();
                continue;
            }

            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.fill();
            ctx.restore();
        }

        for (let i = cursorTrailParticles.length - 1; i >= 0; i--) {
            const p = cursorTrailParticles[i];
            p.age += 16.67;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.006;
            p.rotation += p.spin;

            const progress = Math.min(p.age / p.life, 1);
            const fade = 1 - progress;

            if (progress >= 1) {
                cursorTrailParticles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha * fade;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "rgba(255, 125, 188, 0.46)";
            ctx.shadowBlur = 14;

            if (p.shape === "heart") {
                ctx.fillStyle = "rgba(255, 111, 181, 1)";
                ctx.font = `${p.size}px serif`;
                ctx.fillText("\u2661", 0, 0);
            } else if (p.shape === "star") {
                ctx.fillStyle = "rgba(212, 178, 255, 1)";
                ctx.font = `${p.size}px serif`;
                ctx.fillText("\u2726", 0, 0);
            } else if (p.shape === "note") {
                ctx.fillStyle = "rgba(216, 63, 145, 1)";
                ctx.font = `${p.size}px serif`;
                ctx.fillText("\u266a", 0, 0);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size * 0.22, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 1)";
                ctx.fill();
            }

            ctx.restore();
        }

        particlesAnimationFrameId = requestAnimationFrame(animate);
    }

    animate();
}
