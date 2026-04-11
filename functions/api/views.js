function json(data, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set("content-type", "application/json; charset=utf-8");
    headers.set("cache-control", "no-store");

    return new Response(JSON.stringify(data), {
        ...init,
        headers
    });
}

function parseCookies(cookieHeader) {
    const cookies = {};

    if (!cookieHeader) {
        return cookies;
    }

    for (const part of cookieHeader.split(";")) {
        const [rawKey, ...rawValue] = part.trim().split("=");

        if (!rawKey) continue;

        cookies[rawKey] = rawValue.join("=");
    }

    return cookies;
}

function sanitizeUser(value) {
    return (value || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const user = sanitizeUser(url.searchParams.get("user"));

    if (!user) {
        return json({ error: "Missing user parameter" }, { status: 400 });
    }

    if (!env.VIEWS) {
        return json({ views: 0, disabled: true });
    }

    const key = `views:${user}`;
    const cookieName = `viewed_${user}`;
    const cookies = parseCookies(request.headers.get("cookie"));
    let currentViews = Number.parseInt((await env.VIEWS.get(key)) || "0", 10);

    if (Number.isNaN(currentViews)) {
        currentViews = 0;
    }

    const headers = new Headers();

    if (!cookies[cookieName]) {
        currentViews += 1;
        await env.VIEWS.put(key, String(currentViews));

        headers.append(
            "set-cookie",
            `${cookieName}=1; Path=/; HttpOnly; Max-Age=43200; SameSite=Lax; Secure`
        );
    }

    return json({ views: currentViews }, { headers });
}
