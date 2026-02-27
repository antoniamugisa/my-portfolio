# Supabase blog likes setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run:

```sql
-- Table: one row per like (post_id + fingerprint = one like per browser per post)
create table blog_likes (
  post_id text not null,
  fingerprint text not null,
  primary key (post_id, fingerprint)
);

-- Enable RLS
alter table blog_likes enable row level security;

-- Allow anyone to read (so the app can show counts)
create policy "Allow read" on blog_likes for select using (true);

-- Insert/delete via RPC only (avoids permissive INSERT/DELETE policies)
create or replace function insert_blog_like(p_post_id text, p_fingerprint text)
returns void language sql security definer set search_path = public as $$
  insert into blog_likes (post_id, fingerprint) values (p_post_id, p_fingerprint)
  on conflict (post_id, fingerprint) do nothing;
$$;

create or replace function delete_my_blog_like(p_post_id text, p_fingerprint text)
returns void language sql security definer set search_path = public as $$
  delete from blog_likes where post_id = p_post_id and fingerprint = p_fingerprint;
$$;

grant execute on function insert_blog_like(text, text) to anon;
grant execute on function delete_my_blog_like(text, text) to anon;
```

If you already created the table with the old "Allow insert" / "Allow delete" policies, run this to switch to RPC-only and clear security warnings:

```sql
drop policy if exists "Allow insert" on blog_likes;
drop policy if exists "Allow delete" on blog_likes;

create or replace function insert_blog_like(p_post_id text, p_fingerprint text)
returns void language sql security definer set search_path = public as $$
  insert into blog_likes (post_id, fingerprint) values (p_post_id, p_fingerprint)
  on conflict (post_id, fingerprint) do nothing;
$$;

create or replace function delete_my_blog_like(p_post_id text, p_fingerprint text)
returns void language sql security definer set search_path = public as $$
  delete from blog_likes where post_id = p_post_id and fingerprint = p_fingerprint;
$$;

grant execute on function insert_blog_like(text, text) to anon;
grant execute on function delete_my_blog_like(text, text) to anon;
```

3. In **Settings → API**, copy **Project URL** and **anon public** key.
4. Add to `.env` (see `.env.example`):

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Add the same variables in your host (e.g. Netlify) environment for production.

**View totals:** Table Editor → `blog_likes`, or run:

```sql
select post_id, count(*) from blog_likes group by post_id;
```
