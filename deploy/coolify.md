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
| `NEXT_PUBLIC_BACKEND_URL` | public URL of the NestJS API | used by `getApiBaseUrl()` and the Google login link in `AuthForm` |
| `NEXT_PUBLIC_SITE_URL` | `https://prava.ge` | pins canonical, `og:url` and sitemap to the real domain |
| `NEXT_PUBLIC_API_URL` | optional | only if it should differ from `NEXT_PUBLIC_BACKEND_URL` |

`NEXT_PUBLIC_BACKEND_URL` has to be reachable **from the visitor's browser**, not just from
inside Coolify's network — it ends up in client-side JavaScript. A container name or
`localhost:3000` will not work.

After changing any `NEXT_PUBLIC_*` value, **redeploy** rather than restart. A restart only
refreshes runtime variables; the old value stays baked into the JS bundle. If the new value
still does not appear, redeploy once with Advanced → *force deploy without cache*.

## Indexing

`getMetadataBaseUrl()` falls back to `https://prava.ge` when neither `NEXT_PUBLIC_SITE_URL`
nor the Vercel variables are present, so indexing switches on by itself here — nothing to
revert from the Vercel setup. Setting the variable explicitly still matters, otherwise
Coolify's temporary `*.sslip.io` domain becomes the canonical host on the first deploy. Full
picture in `.cursor/rules/seo-hosting.mdc`.

Once prava.ge serves from here, set `NEXT_PUBLIC_SITE_URL=https://prava.ge` on the old Vercel
project too, or delete it, so only one host is canonical.

## Verifying a deploy

```bash
curl -sI https://prava.ge/api/health                                  # 200
curl -s https://prava.ge/ka | grep -o 'name="robots" content="[^"]*"' # must NOT say noindex
curl -s https://prava.ge/ka | grep -o 'og:url[^>]*'                   # https://prava.ge/ka
curl -sI https://prava.ge/ka/opengraph-image                          # 200 image/png
```

Then re-scrape the URL in the Facebook Sharing Debugger; Messenger and WhatsApp cached the
failed lookups from the Vercel preview.
