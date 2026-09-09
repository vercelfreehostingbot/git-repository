# CLMS Fullstack — Original Frontend + Backend

This package combines the original frontend and backend into one deployable application. The original frontend UI/components are kept as-is; only the API base is changed to same-origin `/api/v1` so no Render/Railway API URL is hardcoded into the frontend.

## Architecture
- Frontend: Vite/React (built into `backend/public`)
- Backend: NestJS
- Database: PostgreSQL/Neon through backend only
- API: same-origin `/api/v1`
- No bank API or payment gateway is included.

## Render
Build Command:
```
npm ci && npm run build
```
Start Command:
```
npm start
```

Required backend environment variables are listed in `.env.example` and `backend/.env.example`. Keep all secrets in Render Environment Variables.

The build runs Prisma migrations and the idempotent admin seed, then installs the Puppeteer headless shell.
