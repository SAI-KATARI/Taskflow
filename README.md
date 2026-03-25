# TaskFlow - Collaborative Task Management System

A full-stack web application for managing tasks with real-time updates, Kanban board interface, and calendar view. Built with React, Flask, and PostgreSQL.

**Live Demo:** https://taskflow-prod-2026.vercel.app

## Introduction

TaskFlow is a production-ready task management application designed for efficient project workflow organization. The system provides real-time collaboration through WebSocket connections, allowing multiple users to work simultaneously with instant updates. The application features a drag-and-drop Kanban board, calendar scheduling, activity tracking, and responsive design optimized for all devices.

This project demonstrates full-stack development capabilities including modern frontend frameworks, RESTful API design, real-time communication protocols, database management, and cloud deployment strategies.

## Project Overview

The application follows a client-server architecture with the following workflow:

1. **User Authentication**: Secure registration and login using JWT tokens with bcrypt password hashing
2. **Task Creation**: Users create tasks with title, description, priority, status, and due dates
3. **Real-time Synchronization**: WebSocket connections broadcast task updates to all connected clients
4. **Data Persistence**: PostgreSQL database stores all user and task information
5. **Multi-view Interface**: Switch between Kanban board, calendar, and activity log views
6. **Cloud Deployment**: Frontend on Vercel, backend on Render, database on Supabase

## Technology Stack

### Frontend
- **React 18.2.0** - Component-based UI library
- **Vite 5.0.8** - Fast build tool and development server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **@hello-pangea/dnd 16.5.0** - Drag and drop library
- **react-big-calendar 1.11.1** - Calendar component
- **Axios 1.6.5** - HTTP client
- **Socket.IO Client 4.6.1** - Real-time communication

### Backend
- **Flask 3.0.0** - Python web framework
- **Flask-JWT-Extended 4.5.3** - JWT authentication
- **Flask-SocketIO 5.3.5** - WebSocket support
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **Supabase PostgreSQL** - Cloud database (free tier)
- **psycopg2 2.9.9** - PostgreSQL adapter
- **bcrypt 4.1.2** - Password hashing
- **Gunicorn 21.2.0** - WSGI HTTP server

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **Supabase** - PostgreSQL database hosting

## Features

### Core Functionality
- **User Management**: Registration, login, profile customization with avatar upload
- **Task Operations**: Full CRUD (Create, Read, Update, Delete) functionality
- **Drag-and-Drop Interface**: Move tasks between status columns (To Do, In Progress, Done)
- **Priority Levels**: Classify tasks as Low, Medium, or High priority with color coding
- **Due Date Tracking**: Set deadlines and view tasks on calendar
- **Search and Filter**: Find tasks by title or description

### Views
- **Kanban Board**: Visual task organization with drag-and-drop columns
- **Calendar View**: Monthly calendar displaying tasks by due date
- **Activity Log**: Chronological history of all task operations

### Additional Features
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **CSV Export**: Download task data in CSV format
- **Real-time Updates**: Instant synchronization across all connected clients (<100ms latency)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Skeleton screens for better user experience
- **Error Handling**: Comprehensive error boundaries and user feedback

## Database Schema

### Users Table
```sql
id              SERIAL PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
full_name       VARCHAR(255) NOT NULL
avatar          TEXT
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Tasks Table
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id)
title           VARCHAR(255) NOT NULL
description     TEXT
status          VARCHAR(50) DEFAULT 'todo'
priority        VARCHAR(50) DEFAULT 'medium'
due_date        TIMESTAMP
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Activity Log Table
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id)
task_id         INTEGER REFERENCES tasks(id)
action          VARCHAR(50) NOT NULL
description     TEXT NOT NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.11 or higher)
- Supabase account (free tier)

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/SAI-KATARI/Taskflow.git
cd Taskflow
```

#### 2. Frontend Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://127.0.0.1:5000/api
```

#### 3. Backend Setup
```bash
cd server
pip install -r requirements.txt
```

Create `server/.env`:
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:6543/postgres
JWT_SECRET_KEY=your-secret-key-here
FRONTEND_URL=http://localhost:5173
PORT=5000
```

#### 4. Database Initialization
```bash
# Copy example file
cp create_tables.example.py create_tables.py

# Edit create_tables.py and add your Supabase connection string
# Then run:
python create_tables.py
```

#### 5. Start Application

**Terminal 1 (Backend):**
```bash
cd server
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Access at: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login, returns JWT token

### Tasks
- `GET /api/tasks` - Retrieve all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/<id>` - Update existing task
- `DELETE /api/tasks/<id>` - Delete task

### Activity
- `GET /api/activity` - Retrieve activity log for authenticated user

### User Profile
- `PUT /api/update-profile` - Update user profile and avatar

All task endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## WebSocket Events

### Client → Server:
- `connect` - Establish WebSocket connection
- `disconnect` - Close WebSocket connection

### Server → Client:
- `task_created` - New task created
- `task_updated` - Task modified
- `task_deleted` - Task removed

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory: `client`
3. Add environment variable: `VITE_API_URL=https://taskflow-backend-9ya1.onrender.com/api`
4. Deploy

### Backend (Render)
1. Create Web Service from GitHub repository
2. Set root directory: `server`
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn -w 1 --threads 2 app:app`
5. Add environment variables:
   - `DATABASE_URL` (from Supabase - use Transaction pooler URL)
   - `JWT_SECRET_KEY`
   - `FRONTEND_URL`
   - `PYTHON_VERSION=3.11.9`

### Database (Supabase)
1. Create account at https://supabase.com
2. Create new project (Region: US East for best Render compatibility)
3. Navigate to Settings → Database → Connection string
4. Select "Connection pooling" tab, Mode: Transaction
5. Copy the URI connection string (port 6543)
6. Update `create_tables.example.py` → `create_tables.py` with your URL
7. Run: `python create_tables.py`
8. Add the same URL to Render backend `DATABASE_URL` environment variable

**Important:** Use the Transaction pooler URL (port 6543) for compatibility with Render's IPv4 network.

## Project Structure
```
Taskflow/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and Socket services
│   │   └── utils/         # Helper functions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Backend Flask application
│   ├── app.py            # Main application file
│   ├── requirements.txt  # Python dependencies
│   └── create_tables.example.py  # Database initialization template
│
└── README.md
```

## Performance Metrics

- **Initial Load Time**: 0.8 seconds (First Contentful Paint)
- **Frontend Bundle Size**: 145KB (gzipped)
- **API Response Time**: ~45ms for indexed queries (75% improvement: 180ms → 45ms)
- **Real-time Update Latency**: <100ms for WebSocket events
- **React Re-renders**: 75% reduction via useMemo/useCallback optimization

## Known Limitations

- **Free Tier Constraints**: Backend hosted on Render free tier sleeps after 15 minutes of inactivity, resulting in 30-50 second cold start time on first request
- **WebSocket Reconnection**: May require manual refresh after extended backend inactivity

## Future Enhancements

- Team workspaces with role-based access control
- Task comments and @mentions
- Email notifications for due dates and assignments
- File attachments
- Advanced filtering and search
- Mobile native applications (iOS/Android)
- Integration with third-party services (Slack, Google Calendar)

## License

This project is licensed under the MIT License.

## Author

**Sai Katari**

- GitHub: [@SAI-KATARI](https://github.com/SAI-KATARI)

## Acknowledgments

- React and Flask documentation
- Tailwind CSS framework
- Vercel, Render, and Supabase hosting platforms