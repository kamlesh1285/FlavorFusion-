# FlavorFusion

A full-stack food ordering platform — customers browse a menu, order,
and pay; restaurant staff manage the menu, inventory, and fulfil orders
from an admin dashboard.

## Tech stack

**Backend** — NestJS 11 (TypeScript), PostgreSQL via TypeORM, JWT
authentication (Passport), class-validator for request validation,
Multer for file uploads, Swagger for API docs.

**Frontend** — Next.js 16 (App Router, TypeScript, React 19), Tailwind
CSS v4, no external state-management library (React Context for auth
and cart state).

There's no build step tying the two together — they're independent
apps that talk over HTTP. The frontend calls the backend's REST API
directly (`NEXT_PUBLIC_API_URL`).

## How it works

**Auth.** Register/login return a JWT. The frontend stores it in
`localStorage` and attaches it as a `Bearer` token on every
authenticated request. Route access is enforced on the backend by two
guards: `JwtAuthGuard` (must be logged in) and `RolesGuard` (must have
one of a route's allowed roles — `CUSTOMER`, `ADMIN`, `KITCHEN`, or
`DELIVERY`). The frontend also redirects unauthenticated users away
from pages that need a login, but that's a UX convenience — the real
enforcement is server-side.

**Ordering.** Browsing the menu (`/foods`, `/categories`) is public.
Adding to cart, checkout, and order history require login. Checkout
(`POST /orders/checkout`) takes the customer's current cart, checks
stock, creates the order + order items, decrements inventory, and
clears the cart — all in one service call.

**Payments.** There's no payment gateway (no Stripe/Razorpay account
behind this). Three methods are supported:
- **Cash on delivery** — order is created with `paymentStatus: PENDING`;
  staff mark it `PAID` after delivery.
- **UPI** — a real `upi://pay` deep link and QR code are generated
  from the restaurant's own UPI ID (set in `backend/.env`). The
  customer's UPI app opens it and pays directly into that account.
  Because there's no gateway, there's no automatic confirmation — the
  order stays `PENDING` until an admin manually marks it `PAID` after
  checking their UPI app.
- **Card** — simulated/mock only. It always "succeeds" instantly so
  the checkout flow can be demoed end to end. Wiring up a real card
  processor would mean swapping the mock branch in
  `backend/src/payments/payments.service.ts` for an actual gateway
  call — the rest of the app doesn't need to change.

**Roles.** `CUSTOMER` is the default on registration. `ADMIN` gets
access to `/admin` on the frontend and to management endpoints on the
backend (create/edit/delete menu items and categories, adjust
inventory, view and update all orders, upload images). `KITCHEN` and
`DELIVERY` roles exist in the backend's permission model but don't
have a dedicated frontend view yet — they can currently do what an
admin's staff-level permissions allow (e.g. viewing all orders),
without the rest of the admin UI.

## Project structure

```
FlavorFusion-/
├── backend/                     NestJS API (port 3001)
│   ├── src/
│   │   ├── auth/                Register, login, JWT strategy, guards
│   │   ├── users/                User profiles, self-service updates
│   │   ├── categories/           Menu categories (CRUD, admin-only writes)
│   │   ├── foods/                 Menu items (CRUD, admin-only writes)
│   │   ├── inventory/             Stock adjustment log (admin/kitchen only)
│   │   ├── cart/                  Per-user cart
│   │   ├── orders/                Checkout, order history, fulfilment
│   │   ├── payments/               COD / UPI / mock-card charge logic
│   │   ├── uploads/                Image upload endpoint (admin only)
│   │   ├── database/seed.ts        Demo data: users, categories, foods
│   │   └── main.ts                 App bootstrap, CORS, static file serving
│   └── .env                        DB credentials, JWT secret, UPI ID
│
└── frontend/                    Next.js app (port 3000)
    ├── app/
    │   ├── page.tsx                 Home — menu browsing
    │   ├── login/, register/         Auth pages
    │   ├── cart/                      Cart + checkout
    │   ├── orders/                     Order history
    │   ├── profile/                     Account settings
    │   └── admin/                       Orders / menu / categories / inventory
    ├── components/                 Shared UI (cards, nav, forms, QR display)
    ├── lib/
    │   ├── api.ts                    Typed client for every backend endpoint
    │   ├── auth-context.tsx           Global auth state (React Context)
    │   └── cart-context.tsx           Global cart state
    └── .env.local                  Points the frontend at the backend URL
```

Each backend feature folder follows the same NestJS pattern:
`*.controller.ts` (routes + guards), `*.service.ts` (business logic),
`dto/` (request validation), `entities/` (database tables).

## Running it locally

**Prerequisites:** Node.js, PostgreSQL running locally.

```bash
# 1. Database
createdb flavorfusion

# 2. Backend
cd backend
npm install
# edit .env if your Postgres username/password differ from the defaults
npm run seed     # creates demo categories, foods, and 3 accounts
npm run start     # http://localhost:3001

# 3. Frontend (separate terminal)
cd frontend
npm install
npm run dev        # http://localhost:3000
```

**Demo accounts** (created by `npm run seed`):

| Role     | Email                       | Password       |
|----------|------------------------------|-----------------|
| Admin    | admin@flavorfusion.com       | Admin@123       |
| Customer | customer@flavorfusion.com    | Customer@123    |
| Kitchen  | kitchen@flavorfusion.com     | Kitchen@123     |

**To accept real UPI payments**, set `UPI_ID` and `UPI_PAYEE_NAME` in
`backend/.env` to your real UPI ID before generating QR codes for
actual customers — the seeded default is a placeholder.

## API overview

All endpoints are prefixed with the backend's base URL
(`http://localhost:3001` by default). Full interactive docs (Swagger)
are available at `/api` while the backend is running.

| Area | Public | Requires login | Admin/staff only |
|---|---|---|---|
| Menu (`/foods`, `/categories`) | Browse (GET) | — | Create/edit/delete |
| Cart (`/cart`) | — | All actions | — |
| Orders (`/orders`) | — | Checkout, own order history | View/update all orders |
| Users (`/users`) | — | Own profile (`/users/me`) | List/create users |
| Inventory (`/inventory`) | — | — | All actions |
| Uploads (`/uploads`) | — | — | All actions |

## Known limitations

- Card payment is a simulation, not a real gateway integration.
- UPI payment confirmation is manual (no gateway means no webhook).
- KITCHEN and DELIVERY roles have backend permissions but no
  dedicated frontend dashboard yet.
- No automated test coverage beyond the NestJS boilerplate specs.
- No CI/CD or deployment configuration — this is set up for local
  development only.
