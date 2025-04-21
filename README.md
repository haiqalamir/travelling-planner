# Travel Planner

A full-stack **Travel Planner** application that allows users to register, log in, plan trips, view and manage their itineraries, and see enriched country details via the [REST Countries API](https://restcountries.com/).

---

## 🚀 Features

- **User Authentication**: Register & login with encrypted passwords and session management.
- **Plan a Trip**: Choose date/time, country, language preferences, number of travelers, and indicate local language suitability.
- **View & Manage Trips**: See a list of your planned trips, delete/cancel plans with confirmation.
- **Trip Details**: Click a trip to see region, subregion, capital, currency, maps, and current local time.
- **Invoice Generation**: (If enabled) Export or view trip invoices.
- **Responsive UI**: Built with Next.js, Ant Design, and custom CSS for a clean, modern look.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Ant Design, Axios, Moment.js
- **Backend**: Node.js, Express, MongoDB, Mongoose, bcrypt (password hashing), express-session / JWT
- **External API**: REST Countries API
- **Styling**: CSS modules under `styles/`

---

## 📥 Prerequisites

- **Node.js** v14+ (tested on v20)
- **MongoDB** (Local or Atlas)
- **Git** for version control

---

## 🏗️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/haiqalamir/travelling-planner.git
   cd travelling-planner
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Create a .env file in /backend with the following variables:
   MONGODB_URI=<your-mongodb-connection-string>
   SESSION_SECRET=<your-session-secret>
   JWT_SECRET=<your-jwt-secret>
   PORT=3001

   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install

   # Create a .env.local file in /frontend with:
   NEXT_PUBLIC_API_URL=http://localhost:3001/api

   npm run dev
   ```

- Backend will run on `http://localhost:3001`
- Frontend will run on `http://localhost:3000`

---

## 🚦 Usage

1. Open your browser to `http://localhost:3000`.
2. **Register** a new account, then **log in**.
3. Navigate to **Plan a Trip** to create a new itinerary.
4. Visit **My Trips** to view, click into details, or cancel plans.
5. Optionally, check **Invoice** for trip billing (if implemented).
6. **Logout** using the header button when finished.

---

## 🔧 Environment Variables

### Backend (`/backend/.env`)
```dotenv
MONGODB_URI=mongodb://localhost:27017/travelplanner
SESSION_SECRET=ReplaceWithYourSecret
JWT_SECRET=ReplaceWithYourJWTSecret
PORT=3001
```

### Frontend (`/frontend/.env.local`)
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 📁 Project Structure

```
travelling-planner/
├─ backend/
│  ├─ server.js                # Express server entrypoint
│  ├─ routes/                  # API route handlers
│  ├─ models/                  # Mongoose schemas
│  ├─ controllers/             # Business logic
│  ├─ middlewares/             # Auth, error handlers
│  └─ package.json
│
├─ frontend/
│  ├─ pages/                   # Next.js pages (Index, planTrip, viewPlans, etc.)
│  ├─ components/              # Shared React components
│  ├─ styles/                  # CSS modules and globals
│  └─ package.json
│
└─ README.md                   # This file
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m "feat: add YourFeature"
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

Please follow the existing code style and include relevant tests.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

*Happy planning!* 🎒✈️

