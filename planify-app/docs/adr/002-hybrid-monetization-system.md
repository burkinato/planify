# ADR 002: Hybrid Subscription & Credit System

## Status
Implemented

## Context
Standard SaaS subscriptions ($/mo) often don't match the sporadic usage of fire safety experts. A more flexible monetization model was needed.

## Decision
We implemented a **Hybrid Model**:
1. **Subscription (Pro)**: $5/month. Provides:
   - "Pro" badge.
   - 1 free project per month (credits granted on renewal).
   - Filigree-free exports.
2. **Micro-Credits**: Projects are "bought" with credits.
   - Project creation costs 50 credits.
   - Credits can be purchased in bundles via PayTR.
3. **Security**: Credit deductions are handled via a Supabase RPC function `deduct_credits_secure` to prevent client-side tampering.
4. **RLS Boundaries**: Row Level Security ensures users can only see their own credit balance and transaction history.

## Consequences
- Complex state management between `useSubscriptionStore` and `useCreditStore`.
- Need for explicit user feedback when credits are low.
- Reliable webhook handling for PayTR to grant credits/subscriptions.
