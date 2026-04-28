# Planify Testing Notes

## Test Account
Use only for development verification.

- Email: `isilgin2026@outlook.com`
- Password: `Sifre123$$`

Do not print these credentials in public summaries, screenshots, commits, or
user-facing logs.

## Local / Live URLs
- Live domain: `https://planify.pixorasoft.com`
- PM2 local target on server: `http://127.0.0.1:3000`

## Required Checks
From `/var/www/planify/planify-app`:

```bash
npm run lint
npm run build
```

After deploy/restart:

```bash
pm2 status planify
curl -I http://127.0.0.1:3000/
curl -I https://planify.pixorasoft.com/
```

## Manual Scenarios
- Login with the test account.
- Dashboard:
  - `Denetim Merkezi` loads without console/runtime errors.
  - Sidebar contains only real top-level pages.
  - Search filters by project, facility, company, or floor.
  - New project opens identity modal, then template modal, then editor.
  - Missing compliance items appear in `Aksiyon Gerekiyor`.
- Editor:
  - Existing projects load.
  - Autosave updates project data.
  - Export modal can generate PDF/PNG.
  - Export creates a `project_exports` record and updates `last_exported_at`.
- Profile:
  - Company and contact fields save.
- Subscription:
  - Upgrade page renders; payment may be not configured.

## Known Operational Notes
- Unauthenticated `/dashboard` should redirect to `/login?next=/dashboard`.
- Old PM2 error logs may contain previous Supabase refresh token errors; check
  timestamp before treating them as new.
