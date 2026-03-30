# DATABASE_URL Reference

**Do not commit real passwords or full connection strings.** Use Vercel env vars and local `.env.local` only (gitignored).

## Supabase pooler format (example)

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Get the live string from **Supabase → Project Settings → Database → Connection string** (Transaction pooler, URI).

## Where to set the value

1. **Vercel:** Project → Settings → Environment Variables → `DATABASE_URL`
2. **Local:** `.env.local` in the project root (create if needed; never commit)

## If the password changes

1. Reset in Supabase (Database settings) and update `DATABASE_URL` in Vercel and `.env.local`.
2. Redeploy Vercel.
