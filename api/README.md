Supabase API endpoints

Environment variables required (set in Vercel):
- SUPABASE_URL  -> your Supabase project URL (e.g., https://xxxx.supabase.co)
- SUPABASE_ANON_KEY -> your publishable anon key (optional for client)
- SUPABASE_SERVICE_ROLE_KEY -> Supabase service_role key (used server-side) (keep secret)
- ADMIN_PASSWORD -> admin password to protect write endpoints (set a strong secret)

Endpoints:
- GET /api/properties
- POST /api/properties  (requires header 'x-admin-pass')
- GET /api/properties/:id
- PUT /api/properties/:id (requires 'x-admin-pass')
- DELETE /api/properties/:id (requires 'x-admin-pass')
- POST /api/migrate (body: array of properties) (requires 'x-admin-pass')
- POST /api/auth/login (body: { password }) — validates password against server `ADMIN_PASSWORD` and returns 200 on success

Example login (client):

```js
fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: '••••' }) })
  .then(r => r.ok ? console.log('ok') : console.error('invalid'))
```

Notes:
- The serverless functions use @supabase/supabase-js and the SUPABASE_SERVICE_ROLE_KEY to perform upserts and deletes.
- For initial migration, use POST /api/migrate with the array taken from localStorage 'prosper_properties' and set header x-admin-pass to your ADMIN_PASSWORD.
