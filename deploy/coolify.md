# Deploying prava.ge on Coolify

Build pack is **Nixpacks** — no Dockerfile. Coolify detects Next.js, runs `npm ci` and
`npm run build`, starts it with `npm start`, and handles Traefik + Let's Encrypt itself, so
there is no nginx config in this repo either.

## Application settings

| Setting | Value |
|---|---|
| Build Pack | Nixpacks |
| Branch | `main` |
| Install / Build / Start | defaults (`npm ci` / `npm run build` / `npm start`) |
| Ports Exposes | `3000` |
| Domain | `https://prava.ge` (add `www.prava.ge` too if you want it to resolve) |
| Health check path | `/api/health` |

Node 22 and `HOSTNAME=0.0.0.0` are set in `nixpacks.toml`; `npm start` also binds
`0.0.0.0:3000` so Traefik can reach the process. That port is inside this container and
does not clash with NestJS on the host.

## Environment variables

Leave **both** Build Variable and Runtime Variable enabled on all three. `NEXT_PUBLIC_*`
values get compiled into the browser bundle during `next build`, and the server components
read the API URL again at runtime.

| Variable | Value | Why |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.prava.ge` | read first by `getApiBaseUrl()`; every browser API call and the Google login link |
| `NEXT_PUBLIC_SITE_URL` | `https://prava.ge` | pins canonical, `og:url` and sitemap to the real domain |

`getApiBaseUrl()` falls back to `NEXT_PUBLIC_BACKEND_URL` if `NEXT_PUBLIC_API_URL` is unset,
so either name works — just don't set them to different hosts. No trailing slash.

The value has to be reachable **from the visitor's browser**, not only from inside Coolify's
network: it ends up in client-side JavaScript. A container name or `localhost:3000` fails.

After changing any `NEXT_PUBLIC_*` value, **redeploy** rather than restart, and redeploy with
Advanced → *force deploy without cache* if the new value does not show up. A restart only
refreshes runtime variables, and a cached build layer keeps the old one baked into the JS.

### If API calls 404 on prava.ge itself

An empty base URL makes Axios send a relative path, which the locale proxy rewrites — so
`/auth/config` arrives as `https://prava.ge/ka/auth/config` and returns the Next 404 page
as HTML. That means the bundle was built without `NEXT_PUBLIC_API_URL`: it was runtime-only
or the build came from cache. Fix it with a no-cache redeploy, not with app code.

NestJS also has to allow CORS from `https://prava.ge` with credentials. Tickets render on
the Next server and work without it; exam, auth and answer submission run in the browser.

## Indexing

Canonical origin is `https://prava.ge` (`siteMetadata.url`). Optional pin:
`NEXT_PUBLIC_SITE_URL=https://prava.ge`. There are no Vercel host fallbacks.

## Verifying a deploy

```bash
curl -sI https://prava.ge/api/health                                  # 200
curl -s https://prava.ge/ka | grep -o 'name="robots" content="[^"]*"' # must NOT say noindex
curl -s https://prava.ge/ka | grep -o 'og:url[^>]*'                   # https://prava.ge/ka
curl -sI https://prava.ge/ka/opengraph-image                          # 200 image/png
```

Then re-scrape the URL in the Facebook Sharing Debugger; Messenger and WhatsApp cache
failed or stale lookups.
