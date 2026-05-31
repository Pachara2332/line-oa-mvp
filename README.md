# LINE OA Membership MVP

MVP for 1-3 brands: LINE LIFF member registration, QR source attribution,
basic coupon claims, tenant-aware admin dashboard, and member CSV export.

## Setup

1. Copy `.env.example` to `.env` and update `DATABASE_URL` and `SESSION_SECRET`.
2. Create a PostgreSQL database.
3. Run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Seeded local admin accounts:

| Role | Username | Password |
| --- | --- | --- |
| Super Admin | `admin` | `ChangeMe123!` |
| Brand Admin | `brandadmin` | `ChangeMe123!` |

Change both passwords before deploying.

## Admin login

The admin dashboard uses username and password authentication. Passwords are
stored as bcrypt hashes. LINE Login remains dedicated to the LIFF member flow.

## LIFF configuration

For local UI testing, leave `NEXT_PUBLIC_LIFF_ID` blank and set
`ALLOW_DEMO_LIFF=true`. The QR source link can then be tested in a browser.

For staging and production:

1. Create the LIFF app in LINE Developers.
2. Use an HTTPS endpoint such as `https://member.example.com/liff/join`.
3. Set `NEXT_PUBLIC_LIFF_ID`, `LINE_LIFF_CHANNEL_ID`, and `ALLOW_DEMO_LIFF=false`.
4. Regenerate each QR source URL using its LIFF URL and source code.

The API verifies LINE ID tokens server-side before storing a member.

## MVP boundaries

- Each business record is scoped by `brandId`.
- Brand admins only query their own tenant. Super admins query all brands.
- Coupon claims use a short-lived signed member token.
- Coupon redemption exists as an admin API endpoint.
- CSV export respects the signed-in admin tenant.

Before a production rollout, add PostgreSQL row-level security, rate limits,
audit logs, MFA for super admins, and automated tenant-isolation
tests.
