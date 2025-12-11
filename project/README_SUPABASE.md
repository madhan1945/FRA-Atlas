Supabase Setup

1. Create a project at supabase.com and get your URL and anon key.

2. Create a Storage bucket:
   - Name: `claims-attachments`
   - Public: true (or use RLS-signed URLs if preferred)

3. Run SQL in the Supabase SQL editor to create the claims table:

```sql
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  claim_id text not null,
  claimant_name text not null,
  village text,
  district text,
  state text,
  tribe text,
  land_area_ha numeric,
  status text check (status in ('Approved','Pending','Rejected','Under Review')) default 'Pending',
  claim_type text,
  submission_date date,
  last_updated date,
  authorization_score numeric,
  ocr_preview text,
  attachments jsonb default '[]'::jsonb
);

create index on public.claims (state);
create index on public.claims (status);
```

4. Create a `.env` file (or set env in Vite) with:

```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart dev server.


