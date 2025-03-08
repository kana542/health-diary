# Complete Health Diary API Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Diary Entries](#diary-entries)
5. [Error Handling](#error-handling)
6. [Data Formats](#data-formats)
7. [Middleware Protection](#middleware-protection)
8. [Testing the API](#testing-the-api)
9. [Security Considerations](#security-considerations)

---

## Introduction
The Health Diary API is a RESTful API that allows users to track their health metrics including mood, weight, sleep hours, and notes. The API provides authentication, user management, and diary entry management endpoints.

**Base URL:** `http://localhost:3000/api`

---

## Authentication
All API requests (except for registration and login) require authentication using a JSON Web Token (JWT).

### Headers
For protected endpoints, include the token in the Authorization header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Flow
1. User registers an account via `POST /users`
2. User logs in via `POST /auth/login` to receive JWT token
3. User includes token in subsequent requests
4. If token expires, user must login again

### Token Properties
- **Expiration:** 24 hours by default (configurable via `JWT_EXPIRES_IN` in `.env`)
- **Payload:** Contains `user_id`, `username`, `email`, and `user_level`

### Authentication Endpoints
#### Login
Authenticates a user and returns a JWT token.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response:**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "user_level": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Error Responses:**
- `400 Bad Request`: `{"message": "Username and password are required."}`
- `401 Unauthorized`: `{"message": "Bad username/password."}`
- `500 Internal Server Error`: `{"message": "Server error"}`

#### Get Current User
Returns information about the currently authenticated user.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response:**
```json
{
  "user_id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "user_level": "user"
}
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Invalid token. Please provide a valid token."}`
- `500 Internal Server Error`: `{"message": "Server error"}`

---

## User Management
### Register User
Creates a new user account.

- **URL:** `/users`
- **Method:** `POST`
- **Auth Required:** No
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Success Response:**
```json
{
  "message": "User added.",
  "user_id": 5
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `400 Bad Request`: `{"message": "Username is already in use"}`
- `400 Bad Request`: `{"message": "Email address is already in use"}`
- `500 Internal Server Error`: `{"message": "Error registering user"}`

---

## Diary Entries
### Get All Entries
Retrieves all diary entries for the authenticated user.

- **URL:** `/entries`
- **Method:** `GET`
- **Auth Required:** Yes

**Success Response:**
```json
[
  {
    "entry_id": 1,
    "user_id": 2,
    "entry_date": "2023-03-14",
    "mood": "Happy",
    "weight": 75.5,
    "sleep_hours": 8,
    "notes": "Had a great day!",
    "created_at": "2023-03-14T20:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing."}`
- `500 Internal Server Error`: `{"message": "Error fetching entries"}`

---

## Error Handling
### Standard Error Response Format
```json
{
  "message": "Human-readable error message",
  "errors": [
    {
      "field": "Field name that caused the error",
      "message": "Specific error message for this field"
    }
  ]
}
```

---

## Data Formats
- **Date Format:** `YYYY-MM-DD`
- **Mood Values:** `"Sad", "Tired", "Neutral", "Satisfied", "Happy"`
- **Weight:** Decimal with up to 2 places
- **Sleep Hours:** Integer or decimal (e.g., `7` or `7.5`)

---

## Middleware Protection
### Authentication Middleware
Validates the JWT token and attaches user information to the request.

### Authorization Middleware
- **`isOwner`**: Ensures users can only access their own resources
- **`isAdmin`**: Ensures only admin users can access certain endpoints

---

## Testing the API
**Login Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Considerations
- **Passwords are hashed using bcrypt**
- **JWT tokens expire after 24 hours**
- **CORS is configured to allow only specific origins**
