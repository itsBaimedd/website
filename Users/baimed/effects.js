const intro = document.getElementById("intro");
const main = document.getElementById("main");
const particlesCanvas = document.getElementById("particles");
const cursorLight = document.getElementById("cursor-light");
const socialCard = document.getElementById("social-card");
const backgroundMusic = document.getElementById("bgmusic");
const username = document.getElementById("username");
const status = document.getElementById("status");
const discordIcon = document.getElementById("discord-icon");
const discordTitle = document.getElementById("discord-title");
const discordSubtext = document.getElementById("discord-subtext");
const joined = document.getElementById("joined");
const discordCopy = document.getElementById("discord-copy");
const tiktokLink = document.getElementById("tiktok-link");
const instagramLink = document.getElementById("instagram-link");
const profileWrap = document.getElementById("profile-wrap");

let started = false;
let particlesStarted = false;
let usernameAnimationStarted = false;
let statusAnimationStarted = false;
let discordRedirecting = false;
let audioPrimed = false;
let discordTooltipTimeout;
let tiktokTooltipTimeout;
let instagramTooltipTimeout;

function fadeInAudio(audio, targetVolume = 0.45, duration = 2200) {
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
        /* ignore blocked playback attempts */
    });
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
            discordIcon.textContent = data.name.charAt(0).toUpperCase();
        }

        discordSubtext.innerHTML = `
            <span class="dot"></span>
            <span>${onlineCount} Online</span>
            <span class="separator">•</span>
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

/* intro click */
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
            typeUsername(username);
            typeStatus(status);
            typeDocumentTitle();
            updateJoinedText(joined);
            hydrateDiscordCard(socialCard);

            if (!particlesStarted) {
                particlesStarted = true;
                startParticles();
            }
        }, 700);
    },
    { once: true }
);

/* cursor light follow */
document.addEventListener("mousemove", (e) => {
    cursorLight.style.left = `${e.clientX}px`;
    cursorLight.style.top = `${e.clientY}px`;
    updateProfileTilt(e);
});

/* hide cursor light over the middle box */
socialCard.addEventListener("mouseenter", () => {
    cursorLight.style.opacity = "0";
});

socialCard.addEventListener("mouseleave", () => {
    cursorLight.style.opacity = "0.32";
});

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
    const count = 26;

    for (let i = 0; i < count; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.10,
            vy: (Math.random() - 0.5) * 0.10,
            size: Math.random() * 1.35 + 0.2,
            alpha: Math.random() * 0.18 + 0.04
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of dots) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -5) p.x = canvas.width + 5;
            if (p.x > canvas.width + 5) p.x = -5;
            if (p.y < -5) p.y = canvas.height + 5;
            if (p.y > canvas.height + 5) p.y = -5;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    animate();
}
