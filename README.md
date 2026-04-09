# Raaya India - Ecommerce + Marketplace Backend

Production-ready Django + DRF backend designed for a future multi-vendor marketplace.

## Apps
- `users`
- `products`
- `categories`
- `cart`
- `orders`
- `payments`
- `vendors`
- `reviews`
- `admin_panel`

## Tech Stack
- Django
- Django REST Framework
- JWT auth (`djangorestframework-simplejwt`)
- PostgreSQL (`DATABASE_URL`)

## Setup
1. Create virtual environment and activate it.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Copy env file:
   - `cp .env.example .env`
4. Update `DATABASE_URL` and other environment values in `.env`.
5. Run migrations:
   - `python manage.py makemigrations`
   - `python manage.py migrate`
6. Create superuser:
   - `python manage.py createsuperuser`
7. Run server:
   - `python manage.py runserver`

## Core API Routes
- Auth: `/api/v1/auth/register/`, `/api/v1/auth/login/`
- Products: `/api/v1/products/`, `/api/v1/products/<slug>/`
- Cart: `/api/v1/cart/`, `/api/v1/cart/add/`
- Orders: `/api/v1/orders/checkout/`, `/api/v1/orders/`
- Reviews: `/api/v1/reviews/`, `/api/v1/reviews/product/<product_id>/`
- Admin panel stats: `/api/v1/admin-panel/dashboard/stats/`
- OpenAPI schema: `/api/v1/schema/`
- Swagger UI: `/api/v1/docs/`

## Notes
- Payment module includes Razorpay-ready placeholder structures.
- Product model is vendor-linked from day one for marketplace scale.
- Admin includes product/order/vendor management and bulk upload API.
- API responses are standardized as `{ success, message, data }` for all v1 endpoints.
- Caching is Redis-ready via `REDIS_URL` (falls back to local memory cache).

## Production Deployment
- Gunicorn startup is configured via `Procfile`.
- Render example config is available at `render.yaml`.
- Full backend/frontend/domain deployment steps are documented in `DEPLOYMENT_GUIDE.md`.
