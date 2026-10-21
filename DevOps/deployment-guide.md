# Deploy iDOCS with GitHub Actions, Vercel, Render, and Docker

This repository has a Vite/React frontend in `Frontend` and an Express + Socket.IO API in `Backend`. MongoDB must be provided by a managed service such as MongoDB Atlas; the API and browser application should not store production data in the container filesystem.

## 1. One-time account and project setup

1. Push this repository to GitHub and use `main` as the production branch. The CI workflow runs on pushes to `main`/`master` and pull requests. Production deploys run only on `main` or manually from the Actions tab.
2. Create a MongoDB Atlas database. Add the Render service's outbound access (or temporarily allow `0.0.0.0/0` while learning), create a database user, and copy the connection string. Keep the password URL-encoded if it contains reserved characters.
3. In Render, create a Blueprint instance from this repo using the root `render.yaml`. Set `MONGO_URI` and `JWT_SECRET` for the `idocs-api` service. Generate a long random JWT secret, for example with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. After the first deploy, copy the public API URL, for example `https://idocs-api.onrender.com`.
4. In Vercel, import this same GitHub repo as a project and set **Root Directory** to `Frontend`. The project uses Vite; framework/build settings can be detected automatically (`npm run build`, output `dist`). Add `VITE_API_URL` with the Render API URL (no trailing slash) to the Vercel Production environment, then redeploy once to establish the production URL. This variable is public and is embedded in the frontend bundle; never put secrets in a `VITE_*` variable.
5. Add these GitHub repository Actions secrets under **Settings → Secrets and variables → Actions**:
   - `VERCEL_TOKEN`: a Vercel access token.
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`: values from the Vercel project's linked `.vercel/project.json` (create/link the project locally with `vercel link` if needed). These are used by the Vercel CLI workflow; save them as secrets even though they are IDs.
   - `VITE_API_URL`: the production Render API URL, matching the value in Vercel.
   - `RENDER_DEPLOY_HOOK_URL`: create a deploy hook on the Render service and copy its URL. Treat it like a password.

The first Vercel and Render deploys are easiest to create from their dashboards. Subsequent pushes to `main` run `.github/workflows/deploy.yml`; Render deploy hooks trigger the API deployment and GitHub Actions builds/deploys the Vercel frontend. `.github/workflows/ci.yml` runs independently for PR checks. Add branch protection to require CI before merging to `main`.

## 2. Verify the deployed app

Open the Vercel URL, create an account, sign in, and create a document. Check browser DevTools → Network for API calls to the Render URL, then reload a nested route and verify it serves the SPA. Test collaboration on two browser sessions to confirm Socket.IO upgrades work through Render. Render's free instance may sleep when idle, so its first request can take time.

## 3. Run both containers locally

Create a root `.env` file (it is ignored by Git):

```dotenv
MONGO_URI=mongodb+srv://USER:PASSWORD@YOUR_CLUSTER/interactive-docs
JWT_SECRET=replace-with-a-long-random-value
VITE_API_URL=http://localhost:5000
```

Then run from the repository root:

```sh
docker compose up --build
```

Visit `http://localhost:8080`; the API health/root response is at `http://localhost:5000/`. Stop with `Ctrl+C`, or run `docker compose down`. For a frontend container pointed at a deployed API, set `VITE_API_URL` to that public API URL before rebuilding; Vite embeds it at build time.

## What is included

- `.github/workflows/ci.yml`: clean installs, frontend lint/build, backend JavaScript syntax check.
- `.github/workflows/deploy.yml`: production Vercel deployment and Render deploy-hook trigger after pushes to `main`.
- `render.yaml`: Render Blueprint definition for the Node API.
- `Frontend/vercel.json`: SPA fallback for client-side routes.
- `Frontend/Dockerfile`, `Frontend/nginx.conf`, `Backend/Dockerfile`, and `docker-compose.yml`: production-style containers and local full-stack orchestration.

Never commit `.env`, access tokens, database credentials, or deploy-hook URLs. Rotate any secret that is accidentally committed.
