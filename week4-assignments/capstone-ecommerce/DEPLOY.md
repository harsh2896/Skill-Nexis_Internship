# Deployment guide: MongoDB Atlas + Render (backend) + Vercel (frontend)

Do the steps in this order. First push the project to GitHub (the `server` and `client` folders must be inside the repo).

## 1. MongoDB Atlas (database)
1. Sign up at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access**: add a database user with a username and password (avoid special characters in the password, or URL-encode them).
3. **Network Access**: add IP address `0.0.0.0/0` (allows Render to connect).
4. **Connect, Drivers**: copy the connection string and put the database name before the `?`:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ecommerce_db?retryWrites=true&w=majority`

## 2. Create the admin and sample products (run once, from your computer)
```bash
cd server
# put the Atlas string in .env as MONGO_URI, and set ADMIN_EMAIL and ADMIN_PASSWORD
npm run seed
```

## 3. Backend on Render
1. render.com, **New, Web Service**, connect your GitHub repo.
2. **Root Directory**: the path to the server folder in your repo (for example `week4/capstone-ecommerce/server`).
3. **Build Command** `npm install`, **Start Command** `npm start`, instance type **Free**.
4. **Environment variables**: `MONGO_URI` (Atlas string), `JWT_SECRET` (long random text), `JWT_EXPIRES_IN` = `7d`. Leave `CLIENT_URL` for step 5.
5. Deploy. Open `https://<your-service>.onrender.com/api/health`, it should show `{"status":"ok"}`.

The free Render service sleeps when idle, so the first request after a break can take about a minute.

## 4. Frontend on Vercel
1. vercel.com, **Add New, Project**, import the same repo.
2. **Root Directory**: the path to the client folder (for example `week4/capstone-ecommerce/client`). Framework preset: Vite (auto).
3. **Environment variable**: `VITE_API_URL` = your Render URL, for example `https://my-shop-api.onrender.com` (no trailing slash, no `/api`).
4. Deploy. `vercel.json` in the client folder makes page refresh on routes like `/cart` work.

## 5. Allow the frontend to call the backend
In Render, add `CLIENT_URL` = your Vercel URL (for example `https://my-shop.vercel.app`, no trailing slash) and let the service redeploy. Without this, the browser blocks API calls (CORS error).

## 6. Check and submit
- Open the Vercel URL, sign up, place an order, log in as admin and check /admin.
- Put the live links at the top of `README.md`, commit and push.
- Submit the **GitHub repository link** (and the live links) as the final project.

## Common problems
- **Network error / CORS error**: `CLIENT_URL` on Render is missing or has a trailing slash; or `VITE_API_URL` on Vercel is wrong. After changing a Vercel variable, redeploy.
- **MongoDB connection failed in Render logs**: wrong password in `MONGO_URI`, or Network Access does not allow `0.0.0.0/0`.
- **First request is very slow**: Render free instance was asleep, wait and retry.
- **404 on refresh in Vercel**: `vercel.json` is missing from the client folder.
