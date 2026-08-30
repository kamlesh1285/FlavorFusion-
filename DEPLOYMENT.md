# Deploying FlavorFusion

This deploys the backend + database to **Render** and the frontend to
**Vercel** (built by the Next.js team, zero-config for Next.js apps).
Both let you start with no credit card.

**Before you start:** make sure everything in this guide has actually
landed in your GitHub repo (`git push`) — both platforms deploy
directly from GitHub, not from your laptop.

## 1. Database on Render

1. Go to [render.com](https://render.com) and sign up/log in with
   GitHub.
2. **New** → **PostgreSQL**. Give it a name (e.g. `flavorfusion-db`),
   pick the **Free** plan, create it.
3. Once it's up, open it and copy the **Internal Database URL** shown
   on its page — you'll paste this into the backend service in step
   2.6 below. Keep this tab open.

**Know before you rely on this long-term:** Render's free Postgres
expires after a fixed number of days and gets deleted unless you
upgrade — check the current window at
[render.com/docs/free](https://render.com/docs/free). Fine for a demo
or portfolio piece; if you need this to stay up indefinitely, plan to
either upgrade before it expires or re-create it periodically.

## 2. Backend on Render

1. From your Render dashboard: **New** → **Web Service**.
2. Connect your GitHub account if you haven't, then select
   `kamlesh1285/FlavorFusion-`, branch `backend_kamlesh`.
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Instance Type:** Free
4. Under **Environment Variables**, add:
   ```
   DATABASE_URL=<paste the Internal Database URL from step 1.3>
   DATABASE_SSL=true
   JWT_SECRET=<a long random string - do NOT reuse your local dev one>
   JWT_EXPIRES_IN=7d
   UPI_ID=<your real UPI ID>
   UPI_PAYEE_NAME=FlavorFusion
   ```
   Render sets `PORT` automatically — you don't need to add it.
5. **Create Web Service.** Render builds and deploys. Once live,
   you'll get a URL like `flavorfusion-backend.onrender.com` — copy
   it, you need it for the frontend next.
6. **Seed the database once** (optional — you can also just register
   a fresh account through the live site instead): in the service's
   **Shell** tab in Render's dashboard, run:
   ```
   npm run seed
   ```

**Free-tier behavior to know:** free web services spin down after 15
minutes with no traffic, and the next request wakes it back up —
taking 30-60 seconds. That first request after idle time will feel
slow; everything after it is normal speed. This is a free-tier
tradeoff, not a bug.

### About uploaded images

Uploaded dish photos are saved to local disk (`backend/uploads/`).
Render's filesystem is **ephemeral** — anything written to disk is
lost on redeploy. For a demo this is usually fine (images survive
until your next deploy); if you want them to persist permanently, add
a **Persistent Disk** in the service's settings, mounted at
`/opt/render/project/src/backend/uploads` (Render's paid disks start
at a small monthly cost — check current pricing before enabling one).

## 3. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in with
   GitHub.
2. **Add New** → **Project** → import `kamlesh1285/FlavorFusion-`,
   branch `backend_kamlesh`.
3. Set **Root Directory** to `frontend`. Vercel auto-detects Next.js —
   no build command changes needed.
4. Add an environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://<your-render-backend-url>
   ```
   (from step 2.5, no trailing slash).
5. **Deploy.** You'll get a live URL like `flavorfusion.vercel.app`
   within a minute or two.

## 4. Lock down CORS (recommended, once both are live)

The backend currently allows requests from any origin
(`app.enableCors()` with no options) — fine to get things working, but
looser than necessary. Once you have your real Vercel URL, tighten it
in `backend/src/main.ts`:

```ts
app.enableCors({
  origin: 'https://your-actual-vercel-url.vercel.app',
});
```

Commit, push, and Render will auto-redeploy.

## 5. Verify it's actually working

- Visit your Vercel URL — the menu should load (confirms the frontend
  can reach the backend). Remember the backend may take up to a
  minute to wake up on the very first request.
- Register an account, add something to cart, check out.
- Promote a real account to `ADMIN` by connecting to the Render
  Postgres database (via the **Connect** button on its dashboard page,
  or a client like TablePlus/pgAdmin using the External Database URL)
  and running:
  ```sql
  UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
  ```
  then check `/admin`.

## Costs to know about

- **Render's Free** compute and Postgres plans are $0, no credit card.
  Real limits apply (RAM, spin-down, database expiry) — see
  [render.com/pricing](https://render.com/pricing) and
  [render.com/docs/free](https://render.com/docs/free) for current
  numbers, since these change over time.
- **Vercel's** free (Hobby) tier is generous for personal projects,
  with no time limit — just fair-use bandwidth/build limits. Check
  [vercel.com/pricing](https://vercel.com/pricing) for current terms.
