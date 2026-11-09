# Accounting software

Next.js books for invoices, estimates, customers, and items. Supabase handles auth and Postgres. The interface uses a black-and-white shadcn theme and an MVVM layout:

- `src/models` types, money, and line-item mapping
- `src/views` screens
- `src/viewmodels` document editor state
- `src/controllers` auth and data actions

## Setup

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

The secret key stays on the server. It is used to confirm new accounts and to attach a login to an imported `Useraccount` row with the same email.

```bash
npm install
npm run dev
```

Sign up with an email that already exists in `Useraccount` to open that business. A new email creates an empty business.

On Vercel, add the same three environment variables and deploy. The app uses the Next.js Node runtime.
