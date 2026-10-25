# CivicCare Frontend

React + Vite frontend for the Smart Civic Grievance Management System. The existing page styling has been retained while demo form submissions and sample complaint lists have been replaced with backend API calls.

## Local setup

1. Install Node.js 20.19+ or 22.12+ (Vite 8 requirement).
2. Run `npm install`.
3. Copy `.env.example` to `.env` in this project root.
4. Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` to your own project values. Never put a Supabase service-role key in the frontend.
5. Start the backend on port 5000 and configure its own environment separately.
6. Run `npm run dev`; verify the backend health endpoint at `/api/health`.
7. Run `npm run build` before deploying.

## Current integration boundary

- Login and signup use Supabase Auth. The backend requires a matching `profiles` row with role `citizen`, `staff`, or `admin`; the database signup trigger must create that row.
- Complaint submission calls `POST /api/complaints`; optional evidence is uploaded first to `POST /api/images`.
- Citizen and admin pages request live complaint data from the backend.
- The backend's `USE_MOCK_AI=true` mode returns mock AI results. The uploaded Python pipeline currently describes a separate background-worker/database contract; the backend API contract says direct AI service integration is still provisional. Therefore the frontend only displays AI fields returned by the backend and does not claim the full pipeline is connected.
- Complaint category labels must exactly match names configured in the Supabase `categories` table. If the database uses different labels, update the dropdown to match.

## Deploying to Vercel

Import the frontend repository into Vercel, set the three `VITE_` environment variables in Project Settings, and deploy. `vercel.json` includes a single-page-app rewrite for React Router. The backend and Python AI worker must be deployed separately and have their own environment variables configured.
