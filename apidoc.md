# Complete Health Diary API Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Diary Entries](#diary-entries)
5. [Error Handling](#error-handling)
6. [Data Models](#data-models)
7. [Middleware Protection](#middleware-protection)
8. [Testing the API](#testing-the-api)
9. [Security Considerations](#security-considerations)
10. [Environment Variables](#environment-variables)

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
    "user_level": "regular"
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
  "user_level": "regular"
}
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Invalid token. Please provide a valid token."}`
- `500 Internal Server Error`: `{"message": "Server error"}`

---

## User Management

### Get All Users
Retrieves a list of all users (admin only).

- **URL:** `/users`
- **Method:** `GET`
- **Auth Required:** Yes (Admin only)

**Success Response:**
```json
[
  {
    "user_id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "created_at": "2023-03-10T12:00:00Z",
    "user_level": "admin"
  },
  {
    "user_id": 2,
    "username": "user1",
    "email": "user1@example.com",
    "created_at": "2023-03-11T10:30:00Z",
    "user_level": "regular"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Admin access required"}`
- `500 Internal Server Error`: `{"message": "Error retrieving users: [error details]"}`

### Get User by ID
Retrieves a specific user by ID.

- **URL:** `/users/:id`
- **Method:** `GET`
- **Auth Required:** Yes
- **URL Parameters:** `id=[integer]` (User ID)

**Success Response:**
```json
{
  "user_id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "created_at": "2023-03-10T12:00:00Z",
  "user_level": "admin"
}
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `404 Not Found`: `{"message": "User not found"}`
- `500 Internal Server Error`: `{"message": "Error retrieving user: [error details]"}`

### Create User (Register)
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

**Validation:**
- `username`: 3-20 characters, alphanumeric
- `password`: 8-120 characters
- `email`: Valid email format

**Success Response:**
```json
{
  "message": "User added.",
  "user_id": 3
}
```

**Error Responses:**
- `400 Bad Request`: 
```json
{
  "message": "Bad Request",
  "errors": [
    {"field": "username", "message": "Username must be alphanumeric"},
    {"field": "password", "message": "Password must be at least 8 characters long"}
  ]
}
```
- `500 Internal Server Error`: `{"message": "Error registering user: [error details]"}`

### Update User
Updates a user's information (only the user themselves can update their account).

- **URL:** `/users/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (only account owner)
- **URL Parameters:** `id=[integer]` (User ID)
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "string", // optional
  "email": "string", // optional
  "password": "string" // optional
}
```

**Success Response:**
```json
{
  "message": "User updated."
}
```

**Error Responses:**
- `400 Bad Request`: 
```json
{
  "message": "Bad Request",
  "errors": [
    {"field": "username", "message": "Username must be alphanumeric"}
  ]
}
```
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Not authorized"}`
- `404 Not Found`: `{"message": "User not found"}`
- `500 Internal Server Error`: `{"message": "Error updating user: [error details]"}`

### Delete User
Deletes a user account (admin access required).

- **URL:** `/users/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (Admin only)
- **URL Parameters:** `id=[integer]` (User ID)

**Success Response:**
```json
{
  "message": "User deleted."
}
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Admin access required"}`
- `404 Not Found`: `{"message": "User not found"}`
- `500 Internal Server Error`: `{"message": "Error deleting user: [error details]"}`

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
    "entry_date": "2023-03-05",
    "mood": "Happy",
    "weight": 70.5,
    "sleep_hours": 8,
    "notes": "Felt great today!",
    "created_at": "2023-03-05T12:00:00Z"
  },
  {
    "entry_id": 2,
    "user_id": 2,
    "entry_date": "2023-03-06",
    "mood": "Tired",
    "weight": 70.3,
    "sleep_hours": 6,
    "notes": "Busy day at work.",
    "created_at": "2023-03-06T12:00:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `500 Internal Server Error`: `{"message": "Error fetching entries: [error details]"}`

### Get Entry by ID
Retrieves a specific diary entry by ID.

- **URL:** `/entries/:id`
- **Method:** `GET`
- **Auth Required:** Yes (only owner of the entry)
- **URL Parameters:** `id=[integer]` (Entry ID)

**Success Response:**
```json
{
  "entry_id": 1,
  "user_id": 2,
  "entry_date": "2023-03-05",
  "mood": "Happy",
  "weight": 70.5,
  "sleep_hours": 8,
  "notes": "Felt great today!",
  "created_at": "2023-03-05T12:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Not authorized"}`
- `404 Not Found`: `{"message": "Entry not found"}`
- `500 Internal Server Error`: `{"message": "Error fetching entry: [error details]"}`

### Create Entry
Creates a new diary entry.

- **URL:** `/entries`
- **Method:** `POST`
- **Auth Required:** Yes
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "entry_date": "2023-03-10", // Format: YYYY-MM-DD
  "mood": "Satisfied",
  "weight": 71.2,
  "sleep_hours": 7.5,
  "notes": "Productive day with good exercise."
}
```

**Validation:**
- `entry_date`: Required, valid date in YYYY-MM-DD format
- `mood`: Required, 3-25 characters
- `weight`: Valid number between 2-200
- `sleep_hours`: Valid number between 0-24
- `notes`: Optional text

**Success Response:**
```json
{
  "message": "Entry created successfully",
  "entry_id": 3
}
```

**Error Responses:**
- `400 Bad Request`: 
```json
{
  "message": "Bad Request",
  "errors": [
    {"field": "mood", "message": "Mood must be between 3 and 25 characters"},
    {"field": "weight", "message": "Weight must be between 2 and 200"}
  ]
}
```
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `500 Internal Server Error`: `{"message": "Error creating entry: [error details]"}`

### Update Entry
Updates an existing diary entry.

- **URL:** `/entries/:id`
- **Method:** `PUT`
- **Auth Required:** Yes (only owner of the entry)
- **URL Parameters:** `id=[integer]` (Entry ID)
- **Content-Type:** `application/json`

**Request Body:**
```json
{
  "entry_date": "2023-03-10", // optional
  "mood": "Happy", // optional
  "weight": 71.0, // optional
  "sleep_hours": 8, // optional
  "notes": "Updated notes for the day." // optional
}
```

**Success Response:**
```json
{
  "message": "Entry updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: 
```json
{
  "message": "Bad Request",
  "errors": [
    {"field": "sleep_hours", "message": "Sleep hours must be between 0 and 24"}
  ]
}
```
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Not authorized"}`
- `404 Not Found`: `{"message": "Entry not found"}`
- `500 Internal Server Error`: `{"message": "Error updating entry: [error details]"}`

### Delete Entry
Deletes a diary entry.

- **URL:** `/entries/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (only owner of the entry)
- **URL Parameters:** `id=[integer]` (Entry ID)

**Success Response:**
```json
{
  "message": "Entry deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: `{"message": "Authentication token missing. Please provide a valid token."}`
- `403 Forbidden`: `{"message": "Not authorized"}`
- `404 Not Found`: `{"message": "Entry not found"}`
- `500 Internal Server Error`: `{"message": "Error deleting entry: [error details]"}`

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

The `errors` array is only included for validation errors (400 status code).

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200         | OK - The request was successful |
| 201         | Created - The resource was successfully created |
| 400         | Bad Request - The request contained invalid parameters |
| 401         | Unauthorized - Authentication is required or failed |
| 403         | Forbidden - The user does not have permission to access the resource |
| 404         | Not Found - The requested resource could not be found |
| 500         | Internal Server Error - Something went wrong on the server |

---

## Data Models

### User Model

```json
{
  "user_id": "number", // Unique identifier for the user
  "username": "string", // 3-20 characters, alphanumeric
  "email": "string", // Valid email address
  "password": "string", // Stored as a bcrypt hash, not returned in responses
  "created_at": "string", // ISO date format
  "user_level": "string" // "regular" or "admin"
}
```

### Entry Model

```json
{
  "entry_id": "number", // Unique identifier for the entry
  "user_id": "number", // Reference to the user
  "entry_date": "string", // YYYY-MM-DD format
  "mood": "string", // One of: "Happy", "Satisfied", "Neutral", "Tired", "Sad"
  "weight": "number", // Weight in kg, between 2-200
  "sleep_hours": "number", // Hours of sleep, between 0-24
  "notes": "string", // Optional text notes
  "created_at": "string" // ISO date format
}
```

---

## Middleware Protection

### Authentication Middleware
- **Purpose**: Verifies the JWT token in the Authorization header and attaches user data to the request
- **Location**: `/middlewares/authentication.js`
- **Functionality**: 
  - Extracts the token from the Authorization header
  - Verifies the token using the JWT_SECRET
  - Attaches the decoded user information to the request object
  - Handles token expiration and validation errors

### Authorization Middleware
- **Location**: `/middlewares/authorization.js`
- **Components**:
  - **isOwner**: Ensures users can only access or modify their own resources
  - **isAdmin**: Ensures only admin users can access certain endpoints

### Validation Middleware
- **Location**: `/middlewares/error-handler.js`
- **Functionality**:
  - Uses express-validator to validate request data
  - Formats validation errors in a consistent way

---

## Testing the API

### Sample Requests

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

#### Get Entries
```bash
curl -X GET http://localhost:3000/api/entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Entry
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"entry_date":"2023-03-10","mood":"Happy","weight":72.5,"sleep_hours":8,"notes":"Great day!"}'
```

---

## Security Considerations

1. **Password Security**: All passwords are hashed using bcrypt before storage.
2. **Token Security**: JWTs are signed with a secret key and expire after 24 hours.
3. **Input Validation**: All inputs are validated to prevent injection attacks.
4. **Authorization**: Resources are protected by ownership and role validation.
5. **CORS Protection**: API restricts cross-origin requests to approved origins.

---

## Environment Variables

The API requires the following environment variables:

- `PORT`: Port number (default: 3000)
- `DB_HOST`: Database host
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time (default: "24h")
- `FRONTEND_URL`: Frontend URL for CORS configuration (default: "http://localhost:5000")

Example `.env` file:
```
PORT=3000
DB_HOST=localhost
DB_USER=dbuser
DB_PASSWORD=dbpassword
DB_NAME=healthdiary
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5000
```

---
