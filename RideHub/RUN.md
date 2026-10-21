# Running RideHub locally

## You need
- Node.js 18+ (https://nodejs.org)
- MongoDB, either:
  - installed locally (https://www.mongodb.com/try/download/community), or
  - via Docker: `docker compose up -d` (uses the included docker-compose.yml), or
  - a free MongoDB Atlas cluster: paste its URI into `DB_CONNECT` in `Backend/.env`

## Steps
```bash
npm run setup        # installs root, Backend and frontend deps (run `npm install` in this folder first)
npm run dev          # starts API on :4000 and the web app on :5173
```
Or run them separately: `cd Backend && npm run dev` and `cd frontend && npm run dev`.

Open http://localhost:5173

## Trying the ride flow
1. Open the app in a normal window and sign up as a **user**.
2. Open a second window (incognito) and sign up as a **captain**.
3. As the user, enter pickup/destination, choose a vehicle and request the ride.
4. The captain gets the request, accepts it, enters the OTP shown to the user, and finishes the ride.

## Google Maps (optional)
With `GOOGLE_MAPS_API` and `VITE_GOOGLE_MAPS_API_KEY` empty the app runs in **demo mode**:
fake address suggestions, fake distance/fare, and a placeholder instead of the map.
To use real data, put a key (Geocoding, Distance Matrix, Places, Maps JavaScript APIs enabled) in
`Backend/.env` and `frontend/.env`, then restart.

## Config files
- `Backend/.env`: PORT, DB_CONNECT, JWT_SECRET, GOOGLE_MAPS_API
- `frontend/.env`: VITE_BASE_URL, VITE_API_URL, VITE_GOOGLE_MAPS_API_KEY
