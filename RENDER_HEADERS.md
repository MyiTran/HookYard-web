# Render Static Site — Security Header Configuration

These response headers must be set in the Render Dashboard. Render Static Sites do not
read header configuration from this repository, so this file documents the exact
settings for manual setup.

Location: **Render Dashboard → HookYard static site → Settings → Custom Response Headers**

Each rule uses a **Path**, **Name**, and **Value**.

## Preserve existing headers

The following headers are already returned by the site and must not be removed:

| Path | Name | Value |
| --- | --- | --- |
| `/*` | `Strict-Transport-Security` | `max-age=315360000; includeSubdomains; preload` |
| `/*` | `X-Content-Type-Options` | `nosniff` |

## Add these headers

### Content-Security-Policy (two-step rollout)

Add the policy in report-only mode first and check the browser console for violations.
After verifying the app renders and functions normally, switch the header name to
`Content-Security-Policy` to enforce it.

**Step 1 — report only:**

| Path | Name | Value |
| --- | --- | --- |
| `/*` | `Content-Security-Policy-Report-Only` | `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data:; font-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://hookyard-api.onrender.com wss://hookyard-api.onrender.com; form-action 'self'; upgrade-insecure-requests` |

**Step 2 — enforce (after browser verification):**

| Path | Name | Value |
| --- | --- | --- |
| `/*` | `Content-Security-Policy` | `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'none'; img-src 'self' data:; font-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://hookyard-api.onrender.com wss://hookyard-api.onrender.com; form-action 'self'; upgrade-insecure-requests` |

CSP rationale:

- `script-src 'self'` — the app ships one self-hosted JavaScript bundle and uses no
  inline scripts or `eval`, so `unsafe-inline`/`unsafe-eval` are not needed.
- `style-src 'self' 'unsafe-inline'` — Tailwind CSS is self-hosted; `unsafe-inline`
  for styles is required by the inline `style` attributes used for dynamic layout
  (`src/components/ui/ContextualHelp.tsx` and `src/components/plan/UsageProgress.tsx`).
- `connect-src 'self' https://hookyard-api.onrender.com wss://hookyard-api.onrender.com`
  — covers the REST API and the ActionCable WebSocket connection.
- `frame-ancestors 'none'` — same protection as `X-Frame-Options: DENY`.

### X-Frame-Options

| Path | Name | Value |
| --- | --- | --- |
| `/*` | `X-Frame-Options` | `DENY` |

### Referrer-Policy

| Path | Name | Value |
| --- | --- | --- |
| `/*` | `Referrer-Policy` | `strict-origin-when-cross-origin` |

### Permissions-Policy

| Path | Name | Value |
| --- | --- | --- |
| `/*` | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()` |

The app uses the Clipboard API for copy actions, so `clipboard-write` is intentionally
not restricted here (it defaults to same-origin).

## Notes

- The `connect-src` directive references the current Render backend host. If the API
  moves to another domain, update both the `https://` and `wss://` sources.
- Report-only violations appear in the browser developer console; no external report
  endpoint is configured.
