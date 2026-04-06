# Raaya India Frontend

Premium React + Tailwind + Framer Motion storefront for Raaya India.

## Stack
- React + Vite
- Tailwind CSS
- Framer Motion
- Axios + React Router

## Setup
1. Install dependencies:
   - `npm install`
2. Copy environment file:
   - `cp .env.example .env`
3. Start dev server:
   - `npm run dev`

## Production Build
- `npm run build`
- Output directory: `dist/`

## API Integration
Set backend base URL in `.env`:
- `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1`
- `VITE_RAZORPAY_KEY_ID=<your_public_razorpay_key>`

## Pages
- Home
- Product Listing
- Product Detail
- Cart
- Checkout
- Login/Register
