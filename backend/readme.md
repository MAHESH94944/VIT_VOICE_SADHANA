# VIT VOICE Sadhana Backend API

This backend provides authentication and sadhana tracking endpoints for the VIT VOICE Sadhana MERN application.

## Base URLs

- Auth endpoints: `/api/auth`
- Counsilli endpoints: `/api/counsilli`
- Counsellor endpoints: `/api/counsellor`

---

## Auth Endpoints

### 1. Register User

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

### 2. Verify OTP

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

### 3. Login

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

### 4. Logout

**POST** `/api/auth/logout`

Logs out the user (clears auth cookie).

**Response:**

- Success:
  ```json
  { "message": "Logged out successfully" }
  ```

---

## Counsilli Endpoints

All endpoints require authentication (JWT token in cookie or `Authorization` header).

### 1. Get Dashboard

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

### 2. Add Sadhana Card

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

### 3. Get Monthly Sadhana Report

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

## Counsellor Endpoints

All endpoints require authentication (JWT token in cookie or `Authorization` header).

### 1. Get Dashboard

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

### 2. List Assigned Counsillis

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

### 3. Get Counsilli's Full Sadhana Report

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

### 4. Get Counsilli's Monthly Sadhana Report

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
