# iDOCS

Full-stack collaborative docs app with a React/Vite frontend and Express, Socket.IO, and MongoDB backend.

## Deploy and DevOps

See [DevOps/deployment-guide.md](DevOps/deployment-guide.md) for the GitHub Actions CI/CD setup with Vercel and Render, required account configuration and secrets, production verification steps, and local Docker Compose instructions.

Deployment files:

- `.github/workflows/ci.yml` — pull request and branch checks
- `.github/workflows/deploy.yml` — production deployments after checks pass
- `render.yaml` — Render backend Blueprint
- `docker-compose.yml` — local full-stack containers
