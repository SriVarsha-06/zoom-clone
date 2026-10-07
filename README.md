# Zoom Workplace Clone

A full-stack Zoom Workplace web application built using Next.js, FastAPI, and SQLite. Features a responsive Zoom UI, dynamic room generation, schedule management, persistent authentication, and seamless real-time meeting routing.

---

## Live Demo & Deployment

* Frontend App (Vercel): https://zoom-clone-by-varsha.vercel.app/
* **Backend API (Render)**: https://zoom-clone-backend-spf4.onrender.com/docs
* **GitHub Repository**: https://github.com/SriVarsha-06/zoom-clone

---

## Tech Stack

### Frontend
* **Framework**: Next.js 14+ (App Router)
* **Library**: React, Tailwind CSS
* **Icons**: Lucide React
* **Deployment**: Vercel

### Backend
* **Framework**: FastAPI (Python)
* **Server**: Uvicorn / ASGI
* **Database**: SQLite / SQLAlchemy
* **Deployment**: Render

---

## Features

1. **Authentication Flow**:
   * Forced modal login/signup on first access.
   * Persistent user sessions stored locally with explicit Sign Out controls.

2. **Meeting Management**:
   * **Instant Meetings**: Generate unique room IDs dynamically and enter immediately.
   * **Scheduled Meetings**: Create upcoming meetings mapped to selected dates and times.
   * **Meeting Tabs & Calendar**: Interactive schedule viewer filtering upcoming, recent, and recorded sessions.

3. **Direct Room Joining**:
   * Join specific rooms directly via URL (e.g., `/meeting/[id]`).
   * Join existing meetings using the **Join Meeting** ID prompt on the dashboard.

4. **Responsive Zoom UI**:
   * Pixel-accurate Zoom navigation sidebar, header controls, date pickers, side panels, and responsive mobile layout.

---

## Repository Structure

```text
zoom-clone/
├── frontend/             # Next.js React frontend
│   ├── app/              # Next.js App Router pages (/meeting, /dashboard, etc.)
│   ├── components/       # UI Components (Sidebar, Header, Modals)
│   ├── public/           # Static assets
│   ├── package.json
│   └── next.config.js
├── backend/              # FastAPI Python backend
│   ├── main.py           # FastAPI entry point & REST endpoints
│   ├── database.py       # SQLite connection & schema setup
│   ├── requirements.txt  # Python dependencies
│   └── models.py         # SQLAlchemy database models
├── render.yaml           # Render deployment configuration
└── README.md
```

## Local Setup & Development
### Prerequisites
* **Node.js**: v18 or higher
* **Python**: v3.10 or higher
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/SriVarsha-06/zoom-clone.git
cd zoom-clone
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The API will be live at http://localhost:8000 and docs at http://localhost:8000/docs.

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local
npm run dev
```
The app will be running live at http://localhost:3000.

### 4.Assumptions & Notes
* Monorepo Architecture: Frontend and backend reside within frontend/ and backend/ directories inside a single repository.   
* Authentication: Simplified persistent login using client-side storage for immediate testing and prototyping.
* Data Persistence: Uses lightweight SQLite for backend meeting state management.
* Direct Route Protection: Accessing dynamic meeting links directly automatically forces sign-in before allowing users into the room.

### 5. Click the green **Commit changes...** button at the top right.
Your GitHub homepage will now render every single heading, code block, list, and line break consistently!
