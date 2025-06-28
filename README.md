# 📊 Financial Analytics Dashboard – Full Stack Assignment

A full-stack financial analytics dashboard application with secure authentication, dynamic data visualizations, advanced filtering, and configurable CSV export features.

---

## 🚀 Features

- ✅ **JWT Authentication** (Signup / Login / Secure Routes)
- 📈 **Interactive Dashboard** with Revenue vs Expense Line Graph
- 📊 **Transaction Listing** with Filtering, Searching, and Pagination
- 🧾 **Configurable CSV Export** with Auto Download
- 📁 **Profile Management** (View User Details)
- 📦 **Fully Responsive UI** with modern design
- 🔐 **Protected API Routes** with token validation

---

## 🌐 Deployed URLs

| Service    | URL                                                                  |
|------------|----------------------------------------------------------------------|
| 🔗 Frontend | [`https://penta-financial-analytics.vercel.app/`](https://penta-financial-analytics.vercel.app/) |
| 🔗 Backend  | [`https://penta-financial-analytics.onrender.com/`](https://penta-financial-analytics.onrender.com/) |
| 🛢️ Database | `mongodb+srv://vrushabhpatil4801:Finappdb123@finappdb.gxyuw51.mongodb.net/FinAppDB?retryWrites=true&w=majority` |

---

## 🧠 API Endpoints

| Method | Endpoint         | Description                              | Auth Required |
|--------|------------------|------------------------------------------|---------------|
| POST   | `/auth/signup`   | Create a new user account                | ❌            |
| POST   | `/auth/login`    | Authenticate user and return JWT token   | ❌            |
| GET    | `/analytics`     | Get financial analytics summary          | ✅            |
| GET    | `/transactions`  | Fetch paginated and filtered transactions | ✅           |
| GET    | `/profile`       | Fetch logged-in user's profile info      | ✅            |
| POST   | `/profile`       | Update logged-in user's profile info     | ✅            |

> Use the JWT token from `/auth/login` in the `Authorization` header for all protected requests:  
> `Authorization: Bearer <your_token>`

---
## 🌐 Deployment
1.Backend: Render
2.Frontend: Vercel
3. DB: MongoDB Atlas


## ⚙️ Setup Instructions

### 🧩 Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/financial-analytics-dashboard.git
cd financial-analytics-dashboard

# 2. Navigate to the backend folder
cd backend

# 3. Install dependencies
npm install

# 4. Create a .env file and add the following:
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"

# 5. Build and run the server
tsc -b && node dist/index.js
```

### Frontend Setup

```bash
# 6. Navigate to the frontend folder
cd ../frontend

# 7. Install dependencies
npm install

# 8. Create a .env file and add:
VITE_REACT_APP_API="https://penta-financial-analytics.onrender.com"

# 9. Start the development server
npm run dev
```
## Notes
1. The Application is completely Deployed
2. Database is Pre-Populated from the provided transactions.json data file.

