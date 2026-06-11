# 🏆 FocusArena

**FocusArena** is a real-time competitive coding platform designed to enhance focus, fair play, and learning through multiplayer coding battles. The platform combines coding contests, AI assistance, tab-switch monitoring, and admin oversight to create a distraction-free competitive environment.

---

## 🚀 Live Demo

### Frontend

```text
https://focus-arena-nine.vercel.app
```

### Backend

```text
https://focusarena.duckdns.org
```

### Admin Panel

```text
https://focusarena.duckdns.org/admin
```

---

# 📌 Features

## 🔐 Authentication & Security

* User Registration & Login
* JWT Authentication using HttpOnly Cookies
* Google OAuth Login
* Forgot Password via Email
* Session Management
* Logout from Current Device
* Logout from All Devices
* Rate Limiting Protection
* User Blocking & Unblocking

---

## 🏟️ Coding Battle Arena

* Create Coding Rooms
* Join Rooms via Invitation Code
* Multiplayer Coding Competitions
* Difficulty-Based Challenges
* Real-Time Contest Tracking
* Submission Evaluation
* Leaderboard Ranking

---

## 🤖 AI Integration

Powered by **Groq AI**

* AI Coding Assistance
* Solution Guidance
* Learning Support
* Competitive Programming Help

---

## 👀 Focus Monitoring System

* Tab Switch Detection
* Violation Tracking
* Fair Play Monitoring
* Admin Visibility of Violations
* Contest Integrity Enforcement

---

## 📊 Dashboard & Analytics

### User Dashboard

* Contest Statistics
* Problems Solved
* Competition Wins
* Global Ranking
* Contest History

### Admin Dashboard

* User Management
* Contest Monitoring
* Challenge Management
* Submission Review
* System Analytics

---

## 📧 Notification System

* SMTP Email Integration
* Account Notifications
* Password Reset Emails
* User Status Notifications
* Block/Unblock Notifications

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router
* Axios
* Framer Motion
* Tailwind CSS
* Lucide Icons
* Google OAuth

## Backend

* Django
* Django REST Framework
* Django Channels
* JWT Authentication
* PostgreSQL
* Redis

## Deployment

* AWS EC2
* Docker
* Nginx
* Certbot SSL
* Vercel

---

# 🏗️ Architecture

```text
React Frontend (Vercel)
          │
          ▼
      Nginx + SSL
          │
          ▼
   Django REST API
          │
 ┌────────┴────────┐
 ▼                 ▼
PostgreSQL       Redis
(Database)      (Realtime)
```

---

# 📂 Project Structure

```text
FocusArena
│
├── frontend
│   ├── src
│   ├── public
│   ├── components
│   ├── pages
│   └── services
│
├── backend
│   ├── accounts
│   ├── rooms
│   ├── administration
│   ├── dashboard
│   ├── ai
│   ├── core
│   └── manage.py
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Ashika-K-S/FocusArena.git

cd FocusArena
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create superuser:

```bash
python manage.py createsuperuser
```

Start server:

```bash
python manage.py runserver
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

# 🐳 Docker Deployment

Build containers:

```bash
docker compose build
```

Run containers:

```bash
docker compose up -d
```

Check status:

```bash
docker ps
```

---

# 🔑 Environment Variables

### Backend (.env)

```env
SECRET_KEY=your_secret_key

DEBUG=False

DB_NAME=focusarena

DB_USER=postgres

DB_PASSWORD=your_password

DB_HOST=db

DB_PORT=5432

EMAIL_HOST_USER=your_email

EMAIL_HOST_PASSWORD=your_password

GOOGLE_CLIENT_ID=your_google_client_id

GROQ_API_KEY=your_groq_api_key
```

---

# 🎯 Future Enhancements

* GitHub Actions CI/CD
* Gunicorn Production Server
* WebSocket Live Leaderboard
* Contest Replay System
* Advanced AI Code Review
* Docker Health Monitoring
* Automated Database Backups

---

# 👨‍💻 Author

**Ashik K S**

Full Stack Developer

GitHub:

```text
https://github.com/Ashika-K-S
```

LinkedIn:

```text
https://www.linkedin.com/in/ashikaks/
```

---

## ⭐ Project Status

**FocusArena is successfully deployed and running in production with Docker, AWS EC2, Nginx, HTTPS, PostgreSQL, Redis, Google OAuth, AI Integration, and Admin Monitoring features.** 🚀
# 🏆 FocusArena

**FocusArena** is a real-time competitive coding platform designed to enhance focus, fair play, and learning through multiplayer coding battles. The platform combines coding contests, AI assistance, tab-switch monitoring, and admin oversight to create a distraction-free competitive environment.

---

## 🚀 Live Demo

### Frontend

```text
https://focus-arena-nine.vercel.app
```

### Backend

```text
https://focusarena.duckdns.org
```

### Admin Panel

```text
https://focusarena.duckdns.org/admin
```

---

# 📌 Features

## 🔐 Authentication & Security

* User Registration & Login
* JWT Authentication using HttpOnly Cookies
* Google OAuth Login
* Forgot Password via Email
* Session Management
* Logout from Current Device
* Logout from All Devices
* Rate Limiting Protection
* User Blocking & Unblocking

---

## 🏟️ Coding Battle Arena

* Create Coding Rooms
* Join Rooms via Invitation Code
* Multiplayer Coding Competitions
* Difficulty-Based Challenges
* Real-Time Contest Tracking
* Submission Evaluation
* Leaderboard Ranking

---

## 🤖 AI Integration

Powered by **Groq AI**

* AI Coding Assistance
* Solution Guidance
* Learning Support
* Competitive Programming Help

---

## 👀 Focus Monitoring System

* Tab Switch Detection
* Violation Tracking
* Fair Play Monitoring
* Admin Visibility of Violations
* Contest Integrity Enforcement

---

## 📊 Dashboard & Analytics

### User Dashboard

* Contest Statistics
* Problems Solved
* Competition Wins
* Global Ranking
* Contest History

### Admin Dashboard

* User Management
* Contest Monitoring
* Challenge Management
* Submission Review
* System Analytics

---

## 📧 Notification System

* SMTP Email Integration
* Account Notifications
* Password Reset Emails
* User Status Notifications
* Block/Unblock Notifications

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router
* Axios
* Framer Motion
* Tailwind CSS
* Lucide Icons
* Google OAuth

## Backend

* Django
* Django REST Framework
* Django Channels
* JWT Authentication
* PostgreSQL
* Redis

## Deployment

* AWS EC2
* Docker
* Nginx
* Certbot SSL
* Vercel

---

# 🏗️ Architecture

```text
React Frontend (Vercel)
          │
          ▼
      Nginx + SSL
          │
          ▼
   Django REST API
          │
 ┌────────┴────────┐
 ▼                 ▼
PostgreSQL       Redis
(Database)      (Realtime)
```

---

# 📂 Project Structure

```text
FocusArena
│
├── frontend
│   ├── src
│   ├── public
│   ├── components
│   ├── pages
│   └── services
│
├── backend
│   ├── accounts
│   ├── rooms
│   ├── administration
│   ├── dashboard
│   ├── ai
│   ├── core
│   └── manage.py
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Ashika-K-S/FocusArena.git

cd FocusArena
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Create superuser:

```bash
python manage.py createsuperuser
```

Start server:

```bash
python manage.py runserver
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

---

# 🐳 Docker Deployment

Build containers:

```bash
docker compose build
```

Run containers:

```bash
docker compose up -d
```

Check status:

```bash
docker ps
```

---

# 🔑 Environment Variables

### Backend (.env)

```env
SECRET_KEY=your_secret_key

DEBUG=False

DB_NAME=focusarena

DB_USER=postgres

DB_PASSWORD=your_password

DB_HOST=db

DB_PORT=5432

EMAIL_HOST_USER=your_email

EMAIL_HOST_PASSWORD=your_password

GOOGLE_CLIENT_ID=your_google_client_id

GROQ_API_KEY=your_groq_api_key
```

---

# 🎯 Future Enhancements

* GitHub Actions CI/CD
* Gunicorn Production Server
* WebSocket Live Leaderboard
* Contest Replay System
* Advanced AI Code Review
* Docker Health Monitoring
* Automated Database Backups

---

# 👨‍💻 Author

**Ashik K S**

Full Stack Developer

GitHub:

```text
https://github.com/Ashika-K-S
```

LinkedIn:

```text
https://www.linkedin.com/in/ashikaks/
```

---

## ⭐ Project Status

**FocusArena is successfully deployed and running in production with Docker, AWS EC2, Nginx, HTTPS, PostgreSQL, Redis, Google OAuth, AI Integration, and Admin Monitoring features.** 🚀
