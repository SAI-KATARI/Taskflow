# 🚀 TaskFlow - Collaborative Task Management System

<div align="center">

![TaskFlow Logo](https://img.shields.io/badge/TaskFlow-Task_Management-5046e5?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A production-grade, real-time collaborative task management application with Kanban board, calendar view, and activity tracking.**

[Live Demo](https://taskflow-prod-2026.vercel.app) • [Report Bug](https://github.com/SAI-KATARI/Taskflow/issues) • [Request Feature](https://github.com/SAI-KATARI/Taskflow/issues)

</div>

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 Overview

TaskFlow is a full-stack collaborative task management application designed to streamline project workflows and team collaboration. Built with modern web technologies, it provides real-time updates, intuitive drag-and-drop interfaces, and comprehensive task tracking capabilities.

### Why TaskFlow?

- ⚡ **Real-time Collaboration** - WebSocket-powered live updates across all connected clients
- 🎨 **Intuitive UI** - Clean, modern interface with dark mode support
- 📱 **Fully Responsive** - Seamless experience across desktop, tablet, and mobile devices
- 🔐 **Secure** - JWT-based authentication with bcrypt password hashing
- 📊 **Multiple Views** - Kanban board, calendar view, and activity timeline
- 🚀 **Production Ready** - Deployed and tested in production environments

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication**
  - Secure registration and login with JWT tokens
  - Password hashing with bcrypt
  - Persistent sessions with localStorage
  
- ✅ **Task Management**
  - Create, read, update, and delete tasks (CRUD)
  - Drag-and-drop tasks between columns (To Do, In Progress, Done)
  - Set task priority (Low, Medium, High)
  - Add due dates with date picker
  - Rich text descriptions

- ✅ **Multiple Views**
  - **Kanban Board** - Visual task organization with drag-and-drop
  - **Calendar View** - See tasks by due date on an interactive calendar
  - **Activity Log** - Track all task changes and user actions

- ✅ **Real-time Updates**
  - Live synchronization across all connected clients
  - WebSocket-powered instant updates
  - No page refresh needed

- ✅ **User Experience**
  - Dark/Light theme toggle
  - Loading skeletons for better UX
  - Error boundaries for graceful error handling
  - Mobile-responsive design
  - Avatar upload and profile management

- ✅ **Data Export**
  - Export tasks to CSV format
  - Includes all task details and metadata

### Advanced Features
- 🔍 **Search & Filter** - Find tasks quickly by title or description
- 📊 **Statistics Dashboard** - Visual representation of task distribution
- 🎯 **Task Prioritization** - Color-coded priority levels
- 📅 **Due Date Management** - Never miss a deadline
- 👤 **User Profiles** - Personalized avatars and settings

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.1
- **Drag & Drop**: @hello-pangea/dnd 16.5.0
- **Calendar**: react-big-calendar 1.11.1
- **HTTP Client**: Axios 1.6.5
- **Routing**: React Router DOM 6.21.3
- **WebSocket**: socket.io-client 4.6.1
- **Icons**: Lucide React 0.309.0

### Backend
- **Framework**: Flask 3.0.0
- **Authentication**: Flask-JWT-Extended 4.5.3
- **WebSocket**: Flask-SocketIO 5.3.5
- **CORS**: Flask-CORS 4.0.0
- **Database**: PostgreSQL (via psycopg2-binary 2.9.9)
- **Password Hashing**: bcrypt 4.1.2
- **WSGI Server**: Gunicorn 21.2.0

### Deployment & Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: PostgreSQL 18 (Render)
- **Version Control**: Git & GitHub
- **CI/CD**: Automated deployment via Git push

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite)                                    │   │
│  │  - Components (Dashboard, Calendar, Activity)        │   │
│  │  - State Management (React Hooks)                    │   │
│  │  - Real-time Updates (Socket.IO Client)              │   │
│  │  - Routing (React Router)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
                    HTTPS / WebSocket
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Flask REST API                                      │   │
│  │  - JWT Authentication                                │   │
│  │  - RESTful Endpoints                                 │   │
│  │  - WebSocket Events (Flask-SocketIO)                 │   │
│  │  - CORS Configuration                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ ↑
                      SQL Queries
                           ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL                                          │   │
│  │  - Users Table                                       │   │
│  │  - Tasks Table                                       │   │
│  │  - Activity Log Table                                │   │
│  │  - Indexes & Foreign Keys                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Action** → React Component
2. **API Call** → Axios HTTP Request
3. **Authentication** → JWT Validation
4. **Database Operation** → PostgreSQL Query
5. **WebSocket Broadcast** → Real-time Update
6. **UI Update** → React State Change

---

## 📸 Screenshots

### Dashboard - Kanban Board View
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)
*Drag-and-drop Kanban board with task cards*

### Calendar View
![Calendar](https://via.placeholder.com/800x400?text=Calendar+Screenshot)
*Interactive calendar with task scheduling*

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x400?text=Dark+Mode+Screenshot)
*Elegant dark theme for reduced eye strain*

### Mobile Responsive
![Mobile](https://via.placeholder.com/400x600?text=Mobile+Screenshot)
*Fully responsive design for all devices*

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/SAI-KATARI/Taskflow.git
cd Taskflow
```

#### 2. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your backend URL
```

#### 3. Backend Setup
```bash
cd server

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your database credentials
```

### Environment Variables

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://127.0.0.1:5000/api
```

#### Backend (`server/.env`)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/taskflow
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Running Locally

#### 1. Start the Database
```bash
# Create PostgreSQL database
createdb taskflow

# Run the table creation script
cd server
python create_tables.py
```

#### 2. Start the Backend
```bash
cd server
python app.py
# Backend runs on http://127.0.0.1:5000
```

#### 3. Start the Frontend
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "avatar": null
  }
}
```

### Task Endpoints

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {access_token}

Response: 200 OK
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the TaskFlow project",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2026-03-20T00:00:00",
      "created_at": "2026-03-13T10:00:00",
      "updated_at": "2026-03-13T15:00:00"
    }
  ]
}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "due_date": "2026-03-25"
}

Response: 201 Created
{
  "message": "Task created successfully",
  "task": { /* task object */ }
}
```

#### Update Task
```http
PUT /api/tasks/{task_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "done"
}

Response: 200 OK
{
  "message": "Task updated successfully",
  "task": { /* updated task object */ }
}
```

#### Delete Task
```http
DELETE /api/tasks/{task_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Task deleted successfully"
}
```

### Activity Endpoints

#### Get Activity Log
```http
GET /api/activity
Authorization: Bearer {access_token}

Response: 200 OK
{
  "activities": [
    {
      "id": 1,
      "action": "created",
      "description": "Created task: Complete project",
      "created_at": "2026-03-13T10:00:00"
    }
  ]
}
```

### WebSocket Events

#### Task Created
```javascript
socket.on('task_created', (data) => {
  // data contains the new task object
});
```

#### Task Updated
```javascript
socket.on('task_updated', (data) => {
  // data contains the updated task object
});
```

#### Task Deleted
```javascript
socket.on('task_deleted', (data) => {
  // data contains { task_id: number }
});
```

---

## 🌐 Deployment

### Frontend (Vercel)

1. **Push to GitHub**
```bash
   git push origin main
```

2. **Deploy on Vercel**
   - Connect your GitHub repository
   - Set Root Directory: `client`
   - Add Environment Variable: `VITE_API_URL`
   - Deploy!

### Backend (Render)

1. **Create Web Service**
   - Connect your GitHub repository
   - Root Directory: `server`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 1 --threads 2 app:app`

2. **Add Environment Variables**
   - `DATABASE_URL` (from Render PostgreSQL)
   - `JWT_SECRET_KEY`
   - `FRONTEND_URL`
   - `PYTHON_VERSION=3.11.9`

3. **Create PostgreSQL Database**
   - Create a PostgreSQL instance on Render
   - Run `create_tables.py` to initialize schema

### Database Migration
```bash
# Connect to production database
python create_tables.py
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Activity Log Table
```sql
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    task_id INTEGER,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Contact

**Sai Katari**

- GitHub: [@SAI-KATARI](https://github.com/SAI-KATARI)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/your-profile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Render](https://render.com/)
- [Vercel](https://vercel.com/)

---

<div align="center">

**Made with ❤️ for efficient task management**

[⬆ Back to Top](#-taskflow---collaborative-task-management-system)

</div>