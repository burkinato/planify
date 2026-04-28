# Planify Deployment Notes

## Server
- SSH alias: `planify-server`
- Project root: `/var/www/planify`
- App root: `/var/www/planify/planify-app`
- PM2 app: `planify`
- Nginx routes `planify.pixorasoft.com` to `localhost:3000`.

## Normal Deploy Flow
From the server app root:

```bash
cd /var/www/planify/planify-app
npm run lint
npm run build
pm2 restart planify
```

Then verify:

```bash
pm2 status planify
curl -I http://127.0.0.1:3000/
curl -I https://planify.pixorasoft.com/
```

## Database
- Supabase migrations live in `planify-app/supabase/migrations/`.
- Migration helper scripts in `planify-app/scripts/` use `pg`.
- Treat database credentials as sensitive. Do not echo them in summaries.
- For one-off SQL migration work, prefer adding a migration file first, then
  running it once on the server.

## Git / Worktree
- The live worktree may be dirty with uncommitted server edits.
- Never reset or checkout user changes.
- Commit only when the user explicitly asks.

## Build Caveats
- Next.js 16 requires `useSearchParams` client usage to be wrapped in Suspense
  when it can affect prerendered pages.
- React 19 lint rejects synchronous `setState` inside effects; defer with
  callbacks/microtasks or derive state where possible.
