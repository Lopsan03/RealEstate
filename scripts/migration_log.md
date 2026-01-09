Migration run: Seed properties upsert

- Date: 2026-01-09 (local)
- Action: Upserted 3 seed properties from data/properties_seed.json into Supabase `properties` table.
- Method: Ran `scripts/migrate_seed.mjs` with SUPABASE_SERVICE_ROLE_KEY provided by user.
- Note: This script migrates the repository seed data only. To migrate browser localStorage data, log in as Admin and use the Admin Dashboard "Migrar Datos" button, or run the browser console snippet to POST the `prosper_properties` localStorage array to `/api/migrate` with the admin header (`x-admin-pass`).
