# Thisha Brand Store

Multi-brand e-commerce for Thisha Organics (skincare) and Thisha Trends (fashion).

## Tech Stack
- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase (database + auth + storage)
- Resend (transactional email)
- Vercel (hosting)

## Local Setup

1. Clone the repo
   git clone https://github.com/bsraghavan93/ThishaBrandStore.git
   cd ThishaBrandStore

2. Install dependencies
   npm install

3. Copy env file
   cp .env.local.example .env.local

4. Fill in your Supabase and Resend credentials in .env.local

5. Run locally
   npm run dev

## Supabase Setup

1. Create a project at supabase.com
2. Go to SQL Editor, paste contents of supabase/migrations/001_init.sql and run it
3. Copy Project URL and anon key into .env.local
4. Create an admin user: Authentication → Users → Invite User → use bsraghavan93@gmail.com

## Vercel Deployment

1. Push to GitHub (already done)
2. Go to vercel.com → New Project → Import ThishaBrandStore
3. Add environment variables from .env.local
4. Deploy → your site is live

## Admin Portal

URL: /admin
Login with your Supabase auth credentials.
Features: add/edit/remove products, toggle stock status, view all products.

## Order Flow

Customer adds items → fills checkout form → clicks Place Order
→ WhatsApp opens pre-filled to +14153738202
→ Order saved to Supabase orders table
→ Email sent to bsraghavan93@gmail.com
→ You call customer to confirm and collect payment
