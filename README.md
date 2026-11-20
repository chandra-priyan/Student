# Smart Campus Complaint Management System

CampusCare is a local student complaint portal backed by Express, Mongoose, and MongoDB. Students can submit a report and privately track its status using a complaint ID. Administrators can sign in to review, filter, update, and delete complaints.

After a complaint is submitted, the portal navigates to the administrator area. The dashboard remains protected: users without an administrator session are sent to the admin login page and must sign in before viewing it.

Frontend routes: `/` student home and recent activity, `/submit` complaint form, `/track` public complaint tracking, `/admin/login` administrator sign-in, and `/admin` protected dashboard. Recent activity stores only complaint IDs in the current browser and retrieves current status from the API.

## Requirements

- Node.js 20 or newer and npm
- MongoDB Community Server running locally on port `27017`

The backend connects to `mongodb://localhost:27017/smart_campus`. No cloud database is used.

## Setup

### 1. Start MongoDB

On Windows, start the MongoDB service from an elevated PowerShell terminal if it is stopped:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

If MongoDB was installed without a Windows service, start the local server with its configured data directory, for example:

```powershell
mongod --dbpath C:\data\db
```

Create `C:\data\db` first if that is the data directory you choose. Keep the MongoDB process running while using the app.

### 2. Configure and run the backend

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env` and set `JWT_SECRET` to a private, random value of at least 32 characters. For example, generate one in PowerShell:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

The default MongoDB URL already targets `smart_campus`:

```dotenv
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_campus
JWT_SECRET=your-private-random-secret-at-least-32-characters
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://localhost:5173
```

Then install dependencies and start the API:

```powershell
npm install
npm run dev
```

The API is available at [http://localhost:5000](http://localhost:5000). `GET /api/health` reports whether MongoDB is connected.

### 3. Create an administrator

In a second terminal:

```powershell
cd backend
npm run admin:create
```

Enter an administrator email and a unique password of at least 12 characters when prompted. Password characters are not echoed. No default administrator or password is included in the source.

To load the requested example complaints into an empty complaints collection:

```powershell
npm run seed
```

The seed command does nothing if complaints already exist.

### 4. Configure and run the frontend

In a third terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend is served at [http://localhost:5173](http://localhost:5173) and calls `http://localhost:5000/api` by default. Change `VITE_API_URL` in `frontend/.env` if the backend URL changes.

## Administrator sign-in

Visit [http://localhost:5173/admin/login](http://localhost:5173/admin/login) and use the email and password created with `npm run admin:create`. The signed-in token is held in the browser's session storage and is removed when you sign out or the session expires.

## API reference

All responses are JSON. Administrator routes require `Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API and MongoDB health |
| `POST` | `/api/complaints` | Public | Submit a complaint; returns its unique ID |
| `GET` | `/api/complaints/track/:complaintId` | Public | Read status and dates without student details |
| `POST` | `/api/auth/login` | Public, rate-limited | Administrator login |
| `POST` | `/api/auth/logout` | Administrator | Confirm sign-out (JWT is discarded by the client) |
| `GET` | `/api/complaints` | Administrator | List/filter complaints (`q`, `category`, `status`, `page`, `limit`) |
| `GET` | `/api/complaints/stats` | Administrator | Total, pending, in-progress, and resolved counts |
| `GET` | `/api/complaints/:complaintId` | Administrator | Read full complaint details |
| `PATCH` | `/api/complaints/:complaintId/status` | Administrator | Update status |
| `DELETE` | `/api/complaints/:complaintId` | Administrator | Delete a complaint |

Valid statuses are `Pending`, `In Progress`, and `Resolved`. Categories are `Classroom`, `Projector`, `Wi-Fi`, `Drinking Water`, `Laboratory Equipment`, `Washroom`, `Hostel Maintenance`, and `Others`.

## Tests and production build

With MongoDB available at the configured local URI:

```powershell
cd backend
npm test
npm audit
```

Build the frontend:

```powershell
cd frontend
npm run build
```

Backend tests use a separate temporary MongoDB database and drop only that test database when finished.

## Troubleshooting

- **MongoDB connection refused:** Check `Get-Service MongoDB` and start it, or start `mongod` with its configured data directory. Verify `MONGODB_URI` in `backend/.env`.
- **API health says database disconnected:** Confirm the backend started without connection errors and MongoDB is listening on port `27017`.
- **Browser cannot reach the API:** Keep the backend on port `5000`; check `VITE_API_URL` and `CLIENT_ORIGIN` for matching origins.
- **Administrator login fails:** Create an administrator with `npm run admin:create`, verify the email/password, and make sure `JWT_SECRET` is configured before starting the API.
- **Port already in use:** Stop the other process using port `5000` or `5173`, or update the backend `PORT` and frontend dev-server configuration.
