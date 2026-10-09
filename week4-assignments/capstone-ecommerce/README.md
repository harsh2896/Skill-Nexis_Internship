# ShopEasy - E-Commerce Web Application (MERN)

Week 4 capstone project. A mini store where customers browse products, add them to a cart, sign up / log in and place orders, and an admin manages products and orders.

**Live links:** Frontend: `<add Vercel URL>` | Backend: `<add Render URL>` | Admin demo login: `<add if you want to share one>`

## Features
- Product listing with search, category filter, sorting and pagination; product detail page
- Cart (kept in the browser, survives refresh), quantity limits based on stock
- Sign up / login with JWT, passwords hashed with bcrypt, protected routes in React
- Checkout with form validation, Cash on Delivery orders, "My orders" page, cancel an order while it is not shipped
- Admin dashboard: add / edit / delete products, see all orders, change order status, basic stats
- Server checks prices and stock when an order is placed (the client is never trusted), stock is restored on cancellation

## Tech stack
React 18 + Vite, React Router, Context API, Axios | Node.js, Express | MongoDB + Mongoose | JWT, bcryptjs

## Run locally
You need Node.js and MongoDB (local or a free MongoDB Atlas URI).
```bash
# terminal 1 - backend
cd server
npm install
cp .env.example .env        # set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                # creates the admin user and 10 sample products
npm run dev                 # http://localhost:5000

# terminal 2 - frontend
cd client
npm install
npm run dev                 # http://localhost:5173
```
Log in with the admin email/password from your `.env` to open `/admin`. New sign-ups are always normal customers.

## API
| Method | URL | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register, /api/auth/login | public | sign up, log in (returns token) |
| GET | /api/auth/me | user | current user |
| GET | /api/products | public | list (`search, category, minPrice, maxPrice, sort, page, limit`) |
| GET | /api/products/categories, /api/products/:id | public | categories, one product |
| POST, PUT, DELETE | /api/products, /api/products/:id | admin | manage products |
| POST | /api/orders | user | place order `{ items:[{productId, quantity}], shippingAddress }` |
| GET | /api/orders/mine | user | my orders |
| PUT | /api/orders/:id/cancel | user | cancel my order (only while "placed") |
| GET | /api/orders | admin | all orders |
| PUT | /api/orders/:id/status | admin | `{ "status": "shipped" }` |

Send `Authorization: Bearer <token>` for protected routes (Postman: Authorization tab, Bearer Token).

## Manual test checklist
1. Sign up a customer, log out, log in again. 2. Search / filter / sort products. 3. Add items to the cart, change quantity, refresh the page (cart stays). 4. Open /checkout while logged out (redirects to login, then comes back). 5. Place an order, see it in My orders, stock decreased. 6. Cancel it, stock comes back. 7. Log in as admin, add / edit / delete a product, move an order to shipped and delivered. 8. As a customer open /admin (redirected away).

## Deploy
See [DEPLOY.md](DEPLOY.md) (MongoDB Atlas, Render, Vercel).
