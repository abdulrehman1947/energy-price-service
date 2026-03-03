# Energy Market Service

Small Node.js + TypeScript service that fetches energy market data (energy-charts format), stores it in MySQL, and exposes a small API.

Endpoints
- POST /energy/sync -> triggers manual sync, returns { processed, inserted, updated, skipped, executionTimeMs }
- GET /energy/prices?energyType=ELECTRICITY|GAS[&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD] -> returns array of { date, category, value }

Quick start
1. Copy `.env.example` to `.env` and set MySQL and API URLs.
2. Run DB migration (execute `migrations/001_create_table.sql`).
3. Build and run with Docker Compose (see project `docker-compose.yaml`) or run locally:

```bash
npm install
npm run build
PORT=3000 node dist/index.js
```

Docker
The service is included in the repo `docker-compose.yaml` as `energy-market-service`. Ensure your MySQL endpoint is reachable (or add a mysql service) and set env variables.
