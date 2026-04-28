# Planify Developer Guide

## Development & Deployment
- **Local App Root**: `/var/www/planify/planify-app`
- **PM2 Process**: `planify`
- **Deploy Flow**:
  1. `npm run lint`
  2. `npm run build`
  3. `pm2 restart planify`

## Testing Credentials
- **Email**: `isilgin2026@outlook.com`
- **Password**: `Sifre123$$`
> [!IMPORTANT]
> Do not expose these credentials in public logs or summaries.

## Database Management
- Migrations: `planify-app/supabase/migrations/`
- Helper scripts: `planify-app/scripts/` using `pg`
- Prefer adding migration files for any schema changes.

## Working Rules
- **Serious UI**: Keep the design professional, official, and dense. Avoid playful or overly decorative layouts.
- **Preserve Changes**: The server worktree may be dirty; never reset or checkout without explicit user request.
- **Compliance First**: Ensure symbols and routes meet ISO standards.
