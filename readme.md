# VIT VOICE Sadhana Application

A full-stack MERN application designed for members of VIT VOICE to track their daily spiritual practices (sadhana), view progress reports, and connect with their counsellors for guidance.

## Features

- **User Authentication:** Secure registration with OTP email verification and JWT-based login.
- **Role-Based Access Control:**
  - **Counsilli:** Can submit daily sadhana cards and view their own monthly progress reports.
  - **Counsellor:** Can view a list of their assigned counsillis and check their detailed monthly reports.
- **Sadhana Tracking:** A simple form for counsillis to submit their daily spiritual activities.
- **Monthly Reports:** A calendar-based view showing daily submission status for any given month.
- **Responsive UI:** A clean and modern user interface built with React and Tailwind CSS.
- **RESTful API:** A robust backend built with Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend:**
  - React
  - React Router
  - Tailwind CSS
  - Axios
  - Recharts (for graphs)
  - Vite (for development and bundling)
- **Backend:**
  - Node.js
  - Express
  - MongoDB (with Mongoose)
  - JSON Web Tokens (JWT) for authentication
  - Nodemailer for sending OTP emails
  - Bcrypt.js for password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm
- A MongoDB database (local or cloud-based like MongoDB Atlas)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```env
    PORT=3000
    MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>
    JWT_SECRET=<YOUR_JWT_SECRET>
    EMAIL_USER=<YOUR_GMAIL_ADDRESS>
    EMAIL_PASS=<YOUR_GMAIL_APP_PASSWORD>
    FRONTEND_URL=http://localhost:5173
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```
    The server will be running at `http://localhost:3000`.

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

---

## API Documentation

### Base URLs

- Health Check: `/`
- Auth endpoints: `/api/auth`
- Counsilli endpoints: `/api/counsilli`
- Counsellor endpoints: `/api/counsellor`

---

### Health Check Endpoint

#### 1. Check API Status

**GET** `/`

Returns a simple message to confirm the API is running.

**Response:**

```json
{
  "message": "VIT VOICE Sadhana API is working!"
}
```

---

### Auth Endpoints

#### 1. Register User

**POST** `/api/auth/register`

Registers a new user (Counsellor or Counsilli) and sends an OTP to their email.

**Request Body:**

For Counsellor:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "counsellor"
}
```

For Counsilli:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "counsilli",
  "counsellorName": "COUNSELLOR_NAME"
}
```

**Response:**

- Success:
  ```json
  { "message": "Registered. OTP sent to email." }
  ```
- Error:
  ```json
  { "message": "Email already registered" }
  ```

---

#### 2. Verify OTP

**POST** `/api/auth/verify-otp`

Verifies the OTP sent to the user's email during registration.

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**

- Success:
  ```json
  { "message": "OTP verified. Registration complete." }
  ```
- Error:
  ```json
  { "message": "Invalid OTP" }
  ```

---

#### 3. Login

**POST** `/api/auth/login`

Logs in a user with email and password (OTP must be verified).

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

- Success:
  ```json
  { "message": "Login successful", "token": "JWT_TOKEN" }
  ```
- Error:
  ```json
  { "message": "Invalid credentials or OTP not verified" }
  ```

---

#### 4. Logout

**POST** `/api/auth/logout`

Logs out the user (clears auth cookie).

**Response:**

- Success:
  ```json
  { "message": "Logged out successfully" }
  ```

---

### Counsilli Endpoints

All endpoints require authentication (JWT token in cookie or `Authorization` header).

#### 1. Get Dashboard

**GET** `/api/counsilli/dashboard`

Returns the counsilli's profile and recent sadhana cards.

**Response:**

```json
{
  "user": {
    /* user info */
  },
  "recentSadhana": [
    /* last 7 sadhana cards */
  ]
}
```

---

#### 2. Add Sadhana Card

**POST** `/api/counsilli/sadhana/add`

Submit a daily/weekly sadhana card.

**Request Body:**

```json
{
  "date": "2025-08-07",
  "wakeUp": "3:45 AM",
  "japaCompleted": "8:58 PM",
  "dayRest": "2 hr",
  "hearing": "40 min",
  "reading": "0 min",
  "study": "4 hr",
  "timeToBed": "10:30 PM",
  "seva": "0 min",
  "concern": "sick today"
}
```

**Response:**

- Success:
  ```json
  {
    "message": "Sadhana card added",
    "sadhana": {
      /* card data */
    }
  }
  ```
- Error:
  ```json
  { "message": "Failed to add sadhana card" }
  ```

---

#### 3. Get Monthly Sadhana Report

**GET** `/api/counsilli/sadhana/monthly/:month`

Returns all sadhana cards for the specified month (`month` format: `YYYY-MM`).

**Response:**

```json
{
  "month": "2025-08",
  "sadhanaCards": [
    /* cards for the month */
  ]
}
```

---

### Counsellor Endpoints

All endpoints require authentication (JWT token in cookie or `Authorization` header).

#### 1. Get Dashboard

**GET** `/api/counsellor/dashboard`

Returns the counsellor's profile and count of assigned counsillis.

**Response:**

```json
{
  "user": {
    /* user info */
  },
  "assignedCounsilliCount": 5
}
```

---

#### 2. List Assigned Counsillis

**GET** `/api/counsellor/counsillis`

Returns all counsillis assigned to the counsellor.

**Response:**

```json
{
  "counsillis": [
    { /* counsilli user info */ },
    ...
  ]
}
```

---

#### 3. Get Counsilli's Full Sadhana Report

**GET** `/api/counsellor/counsilli/:id/sadhana`

Returns all sadhana cards for a specific counsilli.

**Response:**

```json
{
  "counsilliId": "USER_ID",
  "sadhanaCards": [
    { /* sadhana card */ },
    ...
  ]
}
```

---

#### 4. Get Counsilli's Monthly Sadhana Report

**GET** `/api/counsellor/counsilli/:id/sadhana/:month`

Returns sadhana cards for a specific counsilli and month (`month` format: `YYYY-MM`).

**Response:**

```json
{
  "counsilliId": "USER_ID",
  "month": "2025-08",
  "sadhanaCards": [
    { /* sadhana card */ },
    ...
  ]
}
```

---

## Notes

- Registration requires OTP verification before login.
- Role must be either `"counsellor"` or `"counsilli"`.
- All endpoints accept and return JSON.
- JWT token is returned on successful login and set as an HTTP-only cookie.
- All dashboard/report endpoints require authentication.

---
