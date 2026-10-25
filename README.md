# NovaShop E-Commerce — Supabase + Vercel + Resend Production Setup

This document provides complete instructions to configure and deploy the NovaShop e-commerce platform with **Supabase Authentication**, **Custom SMTP (Resend) Email Verification**, **Row Level Security (RLS)**, and **Vercel Production Deployment**.

---

## 1. Environment Variables Configuration

### Frontend (Vercel & Local)
Add the following variables to:
- **Local:** `frontend/.env`
- **Vercel:** Project Settings &rarr; Environment Variables (configure for *Production*, *Preview*, and *Development*)

| Variable Name | Environment | Description / Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | All | Your Supabase Project URL (`https://xyzcompany.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | All | Supabase Public / Anon Key (`eyJhbGciOi...`) |
| `VITE_SITE_URL` | Local | `http://localhost:5173` |
| `VITE_SITE_URL` | Production | `https://your-production-app.vercel.app` (your actual Vercel domain) |
| `VITE_API_URL` | All | `/api` (routes through Vite dev proxy or Vercel rewrites) |

> **Important Security Notice:**
> Never place the Supabase `service_role` key, Resend API key, or SMTP passwords in `VITE_` variables. Frontend variables are exposed to the browser bundle.

### Backend (Express API & Database)
Configured in `backend/.env`:

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API Server Port | `5000` |
| `NODE_ENV` | Environment Mode | `production` / `development` |
| `MONGO_URI` | MongoDB Connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/novashop` |
| `JWT_SECRET` | Secret key for JWT verification | `your_32_character_super_secret` |
| `CLIENT_URL` | Allowed client origin for CORS | `https://your-production-app.vercel.app` |
| `SERVER_URL` | API base domain | `https://your-production-app.vercel.app` |

---

## 2. Supabase Configuration (Step-by-Step)

### Step 2.1: Run Database Schema & RLS Policies
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project &rarr; Navigate to **SQL Editor** &rarr; Click **New query**.
3. Copy and paste the entire contents of [schema.sql](file:///d:/Code/TRY/supabase/schema.sql).
4. Click **Run**.
   - This creates the `profiles` table linked to `auth.users` with automated triggers.
   - Creates `categories`, `brands`, `products`, `orders`, `order_items`, `cart_items`, `wishlist_items`, `reviews`, `coupons`, and `addresses`.
   - Enables **Row Level Security (RLS)** on all tables with strict, non-permissive security policies.
   - Configures the `product-images` storage bucket with public read and admin-only upload/delete access.

### Step 2.2: Populate Live Products, Categories, Brands & Users (Seed Data)
1. In the Supabase **SQL Editor**, open another **New query**.
2. Copy and paste the entire contents of [seed.sql](file:///d:/Code/TRY/supabase/seed.sql).
3. Click **Run**.
   - Populates **6 Category departments** (`Electronics & Audio`, `Fashion`, `Home & Living`, `Beauty`, `Fitness`, `Workspaces`).
   - Populates **7 Global Brands** (`Sony`, `Apple`, `Nike`, `Samsung`, `Dyson`, `Logitech`, `Adidas`).
   - Creates **4 Authenticated Users** (`admin@ecommerce.com` as Store Admin, and 3 customer profiles) with confirmed email state.
   - Populates **22 Flagship Products** with specifications, variants, multi-angle images, ratings, and stock.
   - Populates **6 Promotional Coupons** (`NOVAFIRST`, `SAVE20`, `FLAT50`, `SUMMER10`, `FLAT10`, `VIPFREESHIP`).
   - Inserts verified customer reviews and addresses.

### Step 2.3: Enable Email Confirmation
1. In Supabase Dashboard, go to **Authentication** &rarr; **Providers** &rarr; **Email**.
2. Ensure **Enable Email provider** is **ON**.
3. Ensure **Confirm email** is **ON** (do NOT disable email confirmation).
4. Save changes.

### Step 2.4: Configure Allowed Redirect URLs
In Supabase Dashboard, go to **Authentication** &rarr; **URL Configuration**:
1. **Site URL:**
   - Set to your production Vercel URL (e.g. `https://your-app.vercel.app`).
2. **Redirect URLs:**
   Add the following patterns:
   - `http://localhost:5173/**`
   - `http://localhost:5173/auth/confirm`
   - `http://localhost:5173/reset-password`
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/confirm`
   - `https://your-app.vercel.app/reset-password`
   - `https://*-your-team.vercel.app/**` *(supports Vercel preview branch deployments)*

---

## 3. Custom SMTP Configuration (Resend)

To ensure high email deliverability and avoid Supabase default rate limits, connect a custom SMTP provider:

1. Create a free account at [Resend.com](https://resend.com).
2. Go to **API Keys** &rarr; Create an API key with sending permissions.
3. In Supabase Dashboard &rarr; Go to **Project Settings** &rarr; **Authentication** &rarr; Scroll down to **SMTP Settings**:
   - **Enable Custom SMTP:** `ON`
   - **Sender Email:** `onboarding@resend.dev` *(or your verified custom domain, e.g. `no-reply@yourdomain.com`)*
   - **Sender Name:** `NovaShop`
   - **Host:** `smtp.resend.com`
   - **Port:** `465` (with SSL) or `587` (with TLS)
   - **Username:** `resend`
   - **Password:** `<YOUR_RESEND_API_KEY>` *(starts with `re_`)*
4. Click **Save Changes**.

---

## 4. Branded Email Templates

Supabase allows customizing the HTML emails sent to users. The production-designed, branded email templates are located in `supabase/email-templates/`:

1. In Supabase Dashboard, go to **Authentication** &rarr; **Email Templates**:
2. **Confirm Signup:**
   - **Subject:** `Confirm Your NovaShop Account`
   - **Body:** Copy and paste the contents of `supabase/email-templates/confirm-signup.html`
3. **Reset Password:**
   - **Subject:** `Reset Your NovaShop Password`
   - **Body:** Copy and paste the contents of `supabase/email-templates/reset-password.html`
4. **Change Email Address:**
   - **Subject:** `Confirm Your New Email Address`
   - **Body:** Copy and paste the contents of `supabase/email-templates/change-email.html`
5. Click **Save** on each template.

---

## 5. Creating and Managing Admin Users

Admins are protected via database-level Row Level Security and cannot be escalated via client-side JavaScript.

To promote an authenticated user to **Administrator**:

### Method A: Via Supabase SQL Editor (Recommended)
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@ecommerce.com';
```

### Method B: Via User Metadata during creation
When using the Supabase Dashboard User Manager:
```json
{
  "name": "Store Admin",
  "role": "admin"
}
```

---

## 6. End-to-End Testing Verification

Follow this checklist to verify your production setup:

| Test # | Flow | Expected Result |
| :--- | :--- | :--- |
| **TEST 1** | User Signup (`/register`) | Enters name, email, password. Success view displays: *"Verify Your Email — We have dispatched a verification link to your email"*. User is **not** logged in automatically. |
| **TEST 2** | Email Dispatch | Branded NovaShop verification email arrives in inbox via Resend SMTP. |
| **TEST 3** | Email Link Verification | Clicking *"Verify Email Address"* redirects to `https://your-app.vercel.app/auth/confirm` and displays *"Email Verified Successfully!"*. |
| **TEST 4** | Verified User Login | User enters credentials &rarr; successfully logs in and accesses cart/orders/wishlist. |
| **TEST 5** | Unverified User Login Protection | Attempting to sign in with an unverified email displays: *"Please verify your email before signing in."* with a one-click *"Resend Verification Email"* CTA. |
| **TEST 6** | Resend Verification | Clicking *"Resend Verification Email"* triggers a 60-second cooldown timer and delivers a fresh email link. |
| **TEST 7** | Forgot Password (`/forgot-password`) | User submits email &rarr; branded reset link is delivered to inbox. |
| **TEST 8** | Reset Password (`/reset-password`) | User clicks email link &rarr; enters new password &rarr; receives success confirmation &rarr; redirects to `/login`. |
| **TEST 9** | Logout | Clicking logout destroys Supabase session and clears stored tokens. |
| **TEST 10** | Session Persistence | Refreshing page maintains authenticated customer state without re-login. |
| **TEST 11** | Admin Authentication | Admin user logs in &rarr; successfully accesses `/admin` console. |
| **TEST 12** | Non-Admin Access Blocking | Regular customer navigating to `/admin` is immediately redirected to `/admin/login`. |
| **TEST 13** | Admin Product Management | Admin can add/edit products; RLS policies prevent non-admins from mutating product tables. |
| **TEST 14** | Vercel Deployment | `npm run build` succeeds cleanly; Vercel routes `/api/*` to backend and `/*` to Vite single-page application. |
