# Raaya India Deployment Guide

## 1) Prerequisites
- GitHub repo with both backend and frontend code
- MySQL database (Railway/Render managed DB or external)
- Razorpay live keys
- Domain: `raayaindia.com`

---

## 2) Backend Deployment (Railway or Render)

### A. Environment Variables (Backend)
Set these variables in your backend hosting dashboard:

- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=api.raayaindia.com,<render-or-railway-host>`
- `MYSQL_DB`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `REDIS_URL` (optional but recommended)
- `SECURE_SSL_REDIRECT=True`
- `SECURE_HSTS_SECONDS=31536000`
- `CORS_ALLOWED_ORIGINS=https://raayaindia.com,https://www.raayaindia.com`
- `CSRF_TRUSTED_ORIGINS=https://raayaindia.com,https://www.raayaindia.com,https://api.raayaindia.com`

### B. Build & Start Commands
Using `Procfile` / Render config:

- Build:
  - `pip install -r requirements.txt`
  - `python manage.py collectstatic --noinput`
  - `python manage.py migrate`
- Start:
  - `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120`

### C. Health Verification
- Open backend docs: `/api/v1/docs/`
- Test auth + checkout + payment APIs from Postman/frontend

---

## 3) Frontend Deployment (Vercel)

### A. Vercel Project Settings
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### B. Environment Variables (Frontend)
- `VITE_API_BASE_URL=https://api.raayaindia.com/api/v1`
- `VITE_RAZORPAY_KEY_ID=<public_live_key>`
- `VITE_GA_MEASUREMENT_ID=<ga_measurement_id>`
- `VITE_WHATSAPP_NUMBER=<countrycode+number>`

### C. SPA Routing
- `frontend/vercel.json` already added for rewrite to `index.html`

---

## 4) Razorpay Transaction Flow (Live)
1. User checks out (`payment_method=online`) and backend creates local order.
2. Frontend calls `POST /api/v1/payments/razorpay/create-order/`.
3. Razorpay Checkout opens with returned `razorpay_order_id`.
4. On success, frontend calls `POST /api/v1/payments/razorpay/verify/`.
5. Backend verifies signature and updates:
   - `PaymentTransaction.status = success`
   - `Order.payment_status = success`
   - `Order.status = confirmed`

---

## 5) Domain + DNS Setup (`raayaindia.com`)

### Recommended Mapping
- Frontend: `raayaindia.com` and `www.raayaindia.com` -> Vercel
- Backend API: `api.raayaindia.com` -> Railway/Render backend URL

### DNS Records
- `A`/`ALIAS` record for apex (`raayaindia.com`) -> Vercel target
- `CNAME` for `www` -> Vercel provided alias
- `CNAME` for `api` -> backend host (Render/Railway)

After DNS propagation:
- Add custom domains in Vercel and backend platform settings
- Update backend `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
- Update frontend `VITE_API_BASE_URL` to `https://api.raayaindia.com/api/v1`

---

## 6) Security Checklist
- Enforce HTTPS (`SECURE_SSL_REDIRECT=True`)
- Use secure cookies in production
- Keep `DEBUG=False`
- Restrict CORS to production frontend domains only
- Store secrets in host-managed env vars, never in code
- Rotate Razorpay secrets periodically
- Enable monitoring/logging alerts for payment failures

---

## 7) Go-Live Smoke Test
1. Register/login user
2. Add product to cart
3. Checkout with COD (success)
4. Checkout with Razorpay test/live payment (success)
5. Verify order + payment status in admin and DB
6. Verify failure path (cancel modal/signature mismatch)

---

## 8) Replacing Handloom Placeholder Visuals

Placeholder visuals are currently set in:
- `frontend/src/components/HeroBanner.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/components/ProductCard.jsx`

### Recommended replacement flow
1. Upload final campaign images to your CDN or object storage.
2. Replace the placeholder URLs in the files above with production URLs.
3. Keep aspect ratios to preserve layout quality:
   - Hero and full-width banners: `16:9` or wider
   - Category cards: `4:5`
   - Product cards: `4:5`
4. Use compressed WebP/JPEG exports (target ~200-400KB for category/product images).
5. Keep `loading="lazy"` and `sizes` attributes for product/category images to reduce payload on mobile.

### Admin image management
- Product admin now supports inline image previews for faster upload QA.
- Use one primary image per product (`is_primary=True`) for best storefront rendering.
