# RozgarSetu

Job portal for connecting clients with blue-collar and pink-collar workers (electricians, maids, drivers, cooks, and similar roles). Stack: **MongoDB**, **Express**, **React** (Vite), **Node.js**, with an optional **RS-bot** service for assistant features.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended) and npm
- A MongoDB database ([MongoDB Atlas](https://www.mongodb.com/atlas) connection string works)

## Backend

From the repository root:

```bash
cd website/BE_Proj-main/backend
```

1. Copy `.env.example` to `.env`.
2. Set at least:
   - `MONGO_URI` — your MongoDB connection string
   - `SECRET_KEY` — a long random string for JWT signing
   - `HOST=0.0.0.0` (optional; default is fine for local dev)
   - **`PORT=8000`** — required so the Vite dev server proxy (`/api/v1` → `http://127.0.0.1:8000`) matches the API. If `PORT` is omitted, the server defaults to **3000** and the frontend proxy will not reach the API.

Optional:

- `CORS_ORIGINS` — comma-separated extra origins if you host the frontend on a custom domain.
- **Cloudinary** (for image uploads): `CLOUD_NAME`, `API_KEY`, `API_SECRET` — see `backend/utils/cloudinary.js`.

Install and run:

```bash
npm install
npm run dev
```

The API listens on `http://localhost:8000` (when `PORT=8000`).

## Frontend

From the repository root:

```bash
cd website/BE_Proj-main/frontend
```

1. Copy `.env.example` to `.env` only if you need custom API or bot URLs (e.g. production). For local development, the Vite dev server proxies `/api/v1` to the backend and `/rs-bot-proxy` to the bot service; leave those unset unless your setup differs.
2. Install and start the dev server:

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. API calls use the Vite proxy to the backend on port **8000**.

## Optional: RS-bot

The `RS-bot/` folder contains a separate service. For setup and usage, see [RS-bot/README.md](RS-bot/README.md). When running locally on port **8001**, the frontend can reach it via the Vite proxy path `/rs-bot-proxy` (see `frontend/vite.config.js`).

## License

See the repository for license information.
