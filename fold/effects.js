const intro = document.getElementById("intro");
const stage = document.getElementById("stage");
const profile = document.getElementById("profile");
const toast = document.getElementById("toast");
const music = document.getElementById("background-music");
const profileViews = document.getElementById("profile-views");
const profileViewsCount = document.getElementById("profile-views-count");
let toastTimer;

async function hydrateProfileViews() {
    if (!profileViews || !profileViewsCount) return;
    const user = profileViews.dataset.user;
    if (!user) return;

    try {
        const response = await fetch(`/api/views?user=${encodeURIComponent(user)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Views request failed");
        const data = await response.json();
        const count = typeof data.views === "number" ? data.views : 0;
        profileViewsCount.textContent = count.toLocaleString();
    } catch {
        profileViewsCount.textContent = "0";
    }
}

function startMusic() {
    if (!music) return;
    music.volume = 0;
    music.play().then(() => {
        const startedAt = performance.now();
        const fadeDuration = 1800;
        const targetVolume = .24;

        function fadeIn(now) {
            const progress = Math.min((now - startedAt) / fadeDuration, 1);
            music.volume = targetVolume * progress;
            if (progress < 1) requestAnimationFrame(fadeIn);
        }

        requestAnimationFrame(fadeIn);
    }).catch(() => {});
}

intro?.addEventListener("click", () => {
    intro.classList.add("is-gone");
    stage?.classList.add("is-ready");
    startMusic();
    hydrateProfileViews();
});

if (profile && window.matchMedia("(pointer: fine)").matches) {
    profile.addEventListener("pointermove", (event) => {
        const bounds = profile.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        profile.style.setProperty("--rx", `${(.5 - y) * 4}deg`);
        profile.style.setProperty("--ry", `${(x - .5) * 5}deg`);
        profile.style.setProperty("--gx", `${x * 100}%`);
        profile.style.setProperty("--gy", `${y * 100}%`);
    });

    profile.addEventListener("pointerleave", () => {
        profile.style.setProperty("--rx", "0deg");
        profile.style.setProperty("--ry", "0deg");
        profile.style.setProperty("--gx", "18%");
        profile.style.setProperty("--gy", "12%");
    });
}

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

document.querySelectorAll(".copy-social").forEach((social) => {
    social.addEventListener("click", async () => {
        try {
            await copyText(social.dataset.copy || "");
            if (toast) toast.textContent = `${social.dataset.platform} copied`;
        } catch {
            if (toast) toast.textContent = "Couldn't copy automatically";
        }

        if (toast) {
            const bounds = social.getBoundingClientRect();
            toast.style.setProperty("--toast-x", `${bounds.left + bounds.width / 2}px`);
            toast.style.setProperty("--toast-y", `${bounds.top - 10}px`);
        }

        toast?.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast?.classList.remove("show"), 1600);
    });
});
