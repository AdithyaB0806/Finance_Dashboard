# 💰 Finance Dashboard API

Hey 👋
This is a **backend project I built to practice real-world API development** using FastAPI.

The goal was simple:
1) Build a system where users can manage their finances
2) Add proper authentication
3) And control access based on roles (like real companies do)

---

##  What this project does

* Users can **register and login**
* Secure authentication using **JWT tokens**
* Different roles:

  * **Admin** → full control
  * **Analyst** → view + analytics
  * **Viewer** → read-only
* Manage transactions:

  * Add income/expense
  * Update/delete records
* Dashboard features:

  * Total income & expenses
  * Category-wise breakdown
  * Monthly trends
  * Recent activity

---

## 🛠 Tech Stack

* **FastAPI** – for building APIs
* **PostgreSQL** – database
* **SQLAlchemy** – ORM
* **JWT** – authentication
* **bcrypt** – password security

---

##  How to run this


### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create `.env` file

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/finance_dashboard
SECRET_KEY=your_secret_key
```

### 4. Run the server

```bash
uvicorn main:app --reload
```

Open this in browser:
👉 http://127.0.0.1:8000/docs

---

## 🔐 How authentication works (simple)

1. Register a user
2. Login → you get a token
3. Use that token in requests:

```bash
Authorization: Bearer YOUR_TOKEN
```

That’s it — backend verifies everything.

---

## 📌 Important endpoints

### Auth

* `POST /auth/register`
* `POST /auth/login`

### Users

* `GET /users/me`
* `POST /users/` (admin only)

### Transactions

* `POST /transactions/`
* `GET /transactions/`

### Dashboard

* `GET /dashboard/summary`
* `GET /dashboard/monthly`

---

## 📸 Screenshots

## 📸 Screenshots

### 🔹 Login Page
![Login](./screenshots/Login.png)

### 🔹 Dashboard
![Dashboard](./screenshots/Dashboard.png)

### 🔹 Add User
![Add User](./screenshots/Adding users.png)

### 🔹 Transactions
![Transactions](./screenshots/Transactions.png)

### 🔹 Users
![Users](./screenshots/Users.png)  

---

## 💡 What I learned

* JWT authentication in real backend
* Role-based authorization
* Structuring FastAPI projects
* Debugging real issues (DB, auth, headers 😅)

---

## 🚀 Next improvements

* Add frontend (React)
* Add refresh tokens
* Improve UI/UX
* Deploy to cloud

---

## 🙌 Final Note

This project is part of my journey to becoming a **full-stack + AI engineer**.
Still learning, improving, and building 🚀
