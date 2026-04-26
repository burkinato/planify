# Backend Skills (Optimized)

## Supabase Patterns
- **RLS**: Ensure every table has `enable row level security` and appropriate policies for `uid()`.
- **Migrations**: Use SQL files for schema changes; test locally before deployment.
- **Auth Flow**: Register -> Create Profile -> Dashboard.

## Payment Webhooks (PayTR)
- **Hash Verification**: Always verify the `hash` using `merchant_key` and `merchant_salt`.
- **Idempotency**: Check if the transaction (`merchant_oid`) has already been processed.
- **Status Mapping**: Map PayTR `success` to `subscription_tier: 'pro'`.

## API Best Practices
- **Error Handling**: Standardize error responses (e.g., `{ error: 'MESSAGE', code: 'CODE' }`).
- **Validation**: Use Zod or simple type checks for incoming request bodies.
