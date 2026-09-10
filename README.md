# AdmissionFlow V3 — Multi-tenant admissions CRM + public enquiry pages

This build uses the live Supabase project configured in `index.html` and is not a localStorage demo.

## What is live
- Multi-tenant institutes: each tenant has its own slug, branding, catalogue, staff membership and leads.
- Public enquiry page: `https://YOUR-DOMAIN/<institute-slug>`.
- Server-side lead submission RPC: validates and stores the enquiry in Postgres.
- Staff login via Supabase Auth.
- Owner onboarding: authenticated user becomes the institute owner.
- Tenant isolation: staff access is restricted by Postgres RLS to their own institute.
- Lead pipeline: New → Contacted → Interested → Demo booked → Joined / Not interested.
- Follow-up date can be set from the dashboard.
- CSV export.
- Per-institute settings: name, slug, logo URL, phone, WhatsApp, address, website, primary color and tagline.
- Per-institute courses and batches.
- Server-side counsellor invitation Edge Function: `admissionflow-invite-staff`.

## What is NOT falsely claimed
WhatsApp/SMS/email lead notifications are not bundled as working outbound messaging because those require a real provider/API account and credentials. The staff invite function uses Supabase Auth invitation infrastructure, so actual email delivery depends on the project's Auth email configuration.

## Routes
- `/onboarding` create institute
- `/login` staff login
- `/dashboard` staff dashboard
- `/<slug>` public enquiry page

## Deployment
This is a static SPA. Vercel is configured with a rewrite so application routes serve `index.html`.

Never put a Supabase secret/service-role key in this HTML. The browser only uses the publishable key. The invite Edge Function keeps the server key on Supabase.
