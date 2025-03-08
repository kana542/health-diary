# Health Diary Application Documentation

## Table of Contents
1. [Overview](#1-overview)
2. [Database Structure](#2-database-structure)
3. [Core Functionality](#3-core-functionality)
   - [Authentication and Authorization](#authentication-and-authorization)
   - [Health Diary Management](#health-diary-management)
4. [Frontend Architecture](#4-frontend-architecture)
   - [Core Components](#core-components)
   - [UI Components](#ui-components)
5. [Libraries and Technologies](#5-libraries-and-technologies)
   - [Backend](#backend)
   - [Frontend](#frontend)
6. [Security Measures](#6-security-measures)
   - [Authentication Security](#authentication-security)
   - [API Security](#api-security)
   - [Error Handling and Logging](#error-handling-and-logging)
   - [Frontend Security](#frontend-security)
7. [Installation and Setup](#7-installation-and-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
8. [Database Initialization](#8-database-initialization)

## 1. Overview
The Health Diary is a full-stack web application designed to help users track their health-related metrics over time. It provides a clean, intuitive interface for logging daily metrics such as mood, weight, and sleep hours, along with the ability to visualize trends through charts and graphs.

### Key Features
- User authentication (registration, login, session management)
- Daily health entry logging (mood, weight, sleep hours, notes)
- Calendar interface for viewing and accessing entries
- Data visualization with interactive charts
- Mobile-responsive design

## 2. Database Structure
The application uses a MySQL database with the following structure:

![sql](https://github.com/user-attachments/assets/ff1c7b25-4695-4df7-8cc8-3613f8b31dc4)

## 3. Core Functionality

### Authentication and Authorization
- **User Registration**: Validates and creates new user accounts with hashed passwords.
- **User Authentication**: Issues JWT tokens upon successful login, with local storage persistence.
- **Role-Based Authorization**: User-level permissions (regular user vs admin), resource ownership checks, and middleware for route protection.

### Health Diary Management
- **Entry Creation and Management**: Users can create, update, and delete daily diary entries with health metrics.
- **Data Validation**: Uses express-validator for server-side validation and client-side validation for security.
- **Data Visualization**: Provides calendar views and interactive charts for trend analysis.

## 4. Frontend Architecture

### Core Components
- **Router**: Client-side routing with history API and authentication guards.
- **Auth Service**: Manages login, registration, token storage, and authentication state.
- **HTTP Client**: Centralized API communication with automatic token inclusion and error handling.
- **Event Bus**: Implements publisher-subscriber pattern for cross-component communication.

### UI Components
- **Calendar Component**: Interactive calendar for viewing and selecting entries.
- **Chart Component**: Visualizes health metrics over time.
- **Entry Form**: Allows users to create and edit entries with validation.
- **Entries List**: Displays entries for a selected date with edit and delete options.

## 5. Libraries and Technologies

### Backend
- **Express.js**: Routing, middleware, and API handling
- **MySQL with mysql2**: Database interaction and connection pooling
- **Security Libraries**:
  - bcryptjs: Password hashing
  - jsonwebtoken: JWT authentication
  - express-validator: Input validation
- **Utilities**:
  - dotenv: Environment configuration
  - cors: Cross-origin resource sharing

### Frontend
- **Visualization**:
  - Chart.js: Interactive charts and graphs
  - Boxicons: Icon library for UI elements
- **Network and State Management**:
  - Custom HTTP client
  - EventBus for state management
  - LocalStorage for authentication persistence
- **UI/UX**:
  - Custom CSS with responsive design
  - CSS variables for theming
  - Flexbox and Grid for layout structuring

## 6. Security Measures

### Authentication Security
- Password hashing with bcrypt (10 rounds)
- JWT tokens with expiration
- Secure token storage practices

### API Security
- Route protection with authentication middleware
- Resource ownership verification
- Input validation and sanitization
- CORS configuration

### Error Handling and Logging
- Centralized error handling middleware
- Custom error types and status codes
- Structured logging with different log levels
- Obscuring sensitive information in logs

### Frontend Security
- Form validation
- XSS prevention
- Secure token handling

## 7. Installation and Setup

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/health-diary.git
   ```
2. Navigate to the backend directory:
   ```bash
   cd health-diary/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd health-diary/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 8. Database Initialization

Create a database user with appropriate privileges:
```sql
CREATE USER 'healthdiary_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON `HealthDiary`.* TO 'healthdiary_user'@'localhost';
FLUSH PRIVILEGES;
```

Create the database:
```sql
DROP DATABASE IF EXISTS HealthDiary;
CREATE DATABASE HealthDiary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE HealthDiary;
```

Create the Users table:
```sql
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_level ENUM('user', 'admin') DEFAULT 'user'
);
```

Create the DiaryEntries table:
```sql
CREATE TABLE DiaryEntries (
    entry_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    entry_date DATE NOT NULL,
    mood ENUM('Sad', 'Tired', 'Neutral', 'Satisfied', 'Happy'),
    weight DECIMAL(5,2),
    sleep_hours DECIMAL(4,1),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT unique_user_date UNIQUE (user_id, entry_date)
);
