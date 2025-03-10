# Health Diary Application Documentation

## Table of Contents
1. [Overview](#1-overview)
3. [Database Structure](#2-database-structure)
4. [Core Functionality](#3-core-functionality)
   - [Authentication and Authorization](#authentication-and-authorization)
   - [Health Diary Management](#health-diary-management)
5. [Frontend Architecture](#4-frontend-architecture)
   - [Core Components](#core-components)
   - [UI Components](#ui-components)
6. [Libraries and Technologies](#5-libraries-and-technologies)
   - [Backend](#backend)
   - [Frontend](#frontend)
7. [Security Measures](#6-security-measures)
   - [Authentication Security](#authentication-security)
   - [API Security](#api-security)
   - [Error Handling and Logging](#error-handling-and-logging)
   - [Frontend Security](#frontend-security)
8. [Installation and Setup](#7-installation-and-setup)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
9. [Database Initialization](#8-database-initialization)
10. [Known Issues](#9-known-issues)
11. [References and Resources](#10-references-and-resources)
    - [Tutorials](#tutorials)
    - [AI](#ai)

## 1. Overview
The Health Diary is a full-stack web application designed to help users track their health-related metrics over time. It provides a clean, intuitive interface for logging daily metrics such as mood, weight, and sleep hours, along with the ability to visualize trends through charts and graphs.

### Key Features
- User authentication (registration, login, session management)
- Daily health entry logging (mood, weight, sleep hours, notes)
- Calendar interface for viewing and accessing entries
- Data visualization with interactive charts
- Mobile-responsive design

![screenshot3](https://github.com/user-attachments/assets/b7674237-99f0-4954-b58f-fb25088ea5af)
![screenshot6](https://github.com/user-attachments/assets/228f43bb-4082-4c3e-b3fb-830a9ef8b26f)
![screenshot5](https://github.com/user-attachments/assets/2697f6a9-72d0-4afb-b7f9-f653e078cec8)
![screenshot1](https://github.com/user-attachments/assets/7cf94218-0589-4d6f-b414-25e505cae042)
![screenshot2](https://github.com/user-attachments/assets/f5c68c2d-078c-49d3-8bcd-ea03b3cbde7a)


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
```

## 9. Known Issues

The following are known issues and limitations in the current implementation of the Health Diary application:
- **Issue**: Entry dates may shift by one day in certain timezones due to UTC conversion issues.
- **Issue**: Responsiveness at certain width.

---

## 10. References and Resources

### Tutorials
- [How To Make A Dynamic Calendar Using HTML CSS & JavaScript](https://openai.com/)
- [Login Form in HTML & CSS](https://youtu.be/hlwlM4a5rxg?si=B0iUEQstZ7BpoSnE)
- [EventBus Pattern: Event-Driven Communication in JS](https://yaron-galperin.medium.com/eventbus-pattern-event-driven-communication-in-js-2f29c3875982)
- [How to Implement an Event Bus in JavaScript](https://dev.to/openhacking/how-to-implement-an-event-bus-in-javascript-15io)
- [Single-page application -arkkitehtuuri](https://www.theseus.fi/bitstream/handle/10024/754107/Single-page%20application%20-arkkitehtuuri.pdf)
- [Web-sovelluskehitys / Web Development](https://github.com/mattpe/hyte-web-dev/tree/main)
- [hyte-server-example-25](https://github.com/mattpe/hyte-server-example-25)


### AI
This project has utilized artificial intelligence as a development aid, for example as code review and improvement suggestions.
- [ChatGPT 4o](https://chatgpt.com/)
- [Claude 3.7 Sonnet (extended)](https://claude.ai)
