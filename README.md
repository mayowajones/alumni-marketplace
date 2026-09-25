# Command Ojo '98 Alumni Marketplace

A full-stack e-commerce platform where the alumni association admin lists
and sells items on behalf of members (cars, clothing, electronics, etc.).

## Stack
- **Frontend:** React 18 + Vite + React Router + Tailwind CSS
- **Backend:** Node.js + Express (layered: routes → controllers → middleware → models)
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt password hashing

## Brand palette
| Name | Hex | Use |
|---|---|---|
| Forest Green | `#16332B` | Primary — nav, headers, hero |
| Gold | `#D9A94F` | Accent — CTAs, buttons, highlights |
| Cream | `#FAF7F0` | Neutral — background, cards |

## Architecture overview

```
alumni-marketplace/
├── server/                  # Express API
│   ├── config/db.js         # Mongo connection
│   ├── models/              # User, Category, Product, Order (Mongoose schemas)
│   ├── middleware/          # auth.js (JWT verify + role guard), errorMiddleware.js
│   ├── controllers/         # business logic — one file per resource
│   ├── routes/              # thin route definitions, wire controller + middleware
│   ├── utils/generateToken.js
│   ├── seed.js              # creates first admin + starter categories
│   └── index.js             # server entry point
└── client/                  # React app
    └── src/
        ├── index.jsx        # app entry (ReactDOM.createRoot)
        ├── App.jsx          # route table
        ├── api/axios.js     # API client, auto-attaches JWT
        ├── context/         # AuthContext, CartContext (global state)
        ├── components/      # Navbar, Hero, ProductCard, Footer, ProtectedRoute
        └── pages/           # Home, Products, ProductDetail, Cart, Checkout,
                              # Login, Register, admin/AdminDashboard, admin/ProductForm
```

## How the pieces connect (the request lifecycle)

1. **Route** receives the HTTP request (`routes/productRoutes.js`)
2. **Middleware** runs first — `protect` verifies the JWT, `adminOnly` checks the role
3. **Controller** runs the actual logic (validate input, talk to the model, return JSON)
4. **Model** (Mongoose) reads/writes MongoDB, and enforces schema rules (e.g. password hashing happens automatically in a `pre("save")` hook on `User`)
5. Errors thrown anywhere flow to `errorMiddleware.js`, which returns a consistent JSON error shape

## Product approval workflow

Since you chose **single-admin-manages-everything + approval workflow**, every
product is created with `status: "pending"`. It is invisible on the public
storefront (`GET /api/products` only returns `status: "published"`) until the
admin explicitly hits **Publish** in the dashboard, which calls
`PATCH /api/products/:id/publish`. This gives you a review gate even though
you're the one creating the listings — useful for catching typos/pricing
mistakes before they go live.

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas connection string) and JWT_SECRET
npm run dev
```

### 2. Seed initial data (admin account + categories)
```bash
node seed.js
```
Default admin login: `admin@commandojo98.org` / `ChangeMe123!` — **change this password immediately after first login.**

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
Visit `http://localhost:5173`. The Vite dev server proxies `/api` calls to `http://localhost:5000`.

## Payment flow (Paystack) — now wired up

1. Buyer fills in shipping details on `/checkout` → `POST /api/orders` creates the order (`isPaid: false`, stock decremented)
2. Frontend calls `POST /api/payments/initialize` with the `orderId` — the backend reads the **order's stored total**, not anything sent by the browser, and asks Paystack for a checkout session
3. Buyer is redirected to Paystack's hosted page (`window.location.href = authorizationUrl`)
4. Paystack redirects back to `/payment/verify?reference=...`
5. That page calls `GET /api/payments/verify/:reference`, which re-confirms the transaction with Paystack directly (server-to-server) and cross-checks the **amount paid** against the order total before marking it paid — this stops someone from paying ₦100 and claiming they bought a ₦2,000,000 item

**To go live:** get your keys from the [Paystack dashboard](https://dashboard.paystack.com/#/settings/developer), set `PAYSTACK_SECRET_KEY` in `server/.env`, and switch from `sk_test_...` to `sk_live_...` when ready. To use Stripe instead, swap `paymentController.js` for the Stripe SDK equivalent (`stripe.checkout.sessions.create`) — the order model already supports `paymentMethod: "stripe"`.

## Image uploads — now wired up

Admin's product form uploads real files via `multer` (`server/middleware/upload.js`) to `server/uploads/`, served statically at `/uploads/<filename>`. Limits: 5 images per product, 5MB each, JPEG/PNG/WebP only (checked by both extension and MIME type).

**For production**, local disk storage won't survive a redeploy on most hosts (Render, Railway, etc. wipe the filesystem). Swap the multer `diskStorage` for `multer-storage-cloudinary` or an S3-compatible bucket before going live — the controller's response shape (`{ urls: [...] }`) stays the same either way, so nothing else in the app needs to change.

## Still stubbed for you to finish

- **Email notifications** — order confirmations aren't emailed yet; consider Nodemailer or a transactional service like Resend.
- **Paystack webhook** — the current flow verifies payment when the buyer is redirected back, which works for the happy path. For production robustness, also add a webhook endpoint (`POST /api/payments/webhook`) so payments are confirmed even if the buyer closes the tab before the redirect completes.

## Engineering principles applied here (for your learning)

- **Separation of concerns:** routes never contain business logic; controllers never touch `req`/`res` beyond reading input and sending a response; models never know about HTTP.
- **Never trust the client:** order totals are recalculated server-side from the database, not taken from what the browser sends — this is the #1 e-commerce security mistake to avoid.
- **Fail loudly in dev, fail safely in prod:** `errorMiddleware.js` includes stack traces only outside production.
- **One password rule:** passwords are hashed via a Mongoose `pre("save")` hook, so it's structurally impossible to save a user without hashing — no controller can "forget" to do it.
# alumni-marketplace
