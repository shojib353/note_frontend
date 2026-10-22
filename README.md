# AegisNotes Frontend &mdash; Modern Vanilla HTML5 & CSS3 Dashboard

A responsive frontend dashboard built using **semantic HTML5**, **modern Vanilla CSS** (design system tokens, dark glassmorphism, glowing micro-animations), and modular **Vanilla JavaScript**.

Connects directly to the **Secure Note-Taking & MongoDB Aggregations API** (`http://localhost:5000`).

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC) Notes Vault** (`/api/notes`):
   - **Regular Users (Alice, Bob, Charlie)**: Strict user-isolation view backed by compound index `{ author: 1, createdAt: -1 }`.
   - **Admin (admin@example.com)**: Unrestricted access to view and manage all notes across the platform with author filtering.
   - Complete CRUD: Create note, view note modal, edit note, and delete note confirmation.

2. **Public Community Posts Feed** (`/api/posts`):
   - Public feed with author cards, formatted timestamps, and indexing on `createdAt: -1`.
   - Create post card for logged-in members.
   - One-click **"View via $lookup"** relational jump to inspect user posts in MongoDB.

3. **Live MongoDB Aggregations Visualizer** (`/api/aggregations`):
   - **Scenario 1: Group by Interests**: Single `collection.aggregate()` pipeline (`$unwind` &rarr; `$group` &rarr; `$sort` &rarr; `$project`) supported by multikey index `{ interests: 1 }`.
   - **Scenario 2: User Posts ($lookup)**: Single pipeline relational join retrieving user data + all authored public posts via a `$lookup` stage.
   - Integrated pipeline code inspector showing the exact MongoDB query stages.

4. **User Management Console** (`/api/users`):
   - Protected for `admin` role with automatic RBAC lock guard for non-admin accounts.
   - User table with role pills, interests tags, pagination, and user creation/editing/deletion.

5. **Quick Demo Account Switcher**:
   - 1-click login chips in the top navigation:
     - 👑 **Admin**: `admin@example.com` / `password123`
     - 👤 **Alice**: `alice@example.com` / `password123`
     - 👤 **Bob**: `bob@example.com` / `password123`
     - 👤 **Charlie**: `charlie@example.com` / `password123`

6. **Real-time Diagnostics & Swagger Integration**:
   - Live backend `/api/health` polling with latency meter and animated status pulse.
   - One-click access to interactive Swagger UI documentation at `/api/docs`.

---

## 🚀 Running the Frontend

### Option 1: Built-in Dev Server (Active on Port 5173)
```bash
cd frontend
node serve.js
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Option 2: Open Directly in Browser
You can open `frontend/index.html` directly in Google Chrome, Microsoft Edge, or Firefox! Because the backend includes CORS headers (`app.use(cors())`), it communicates seamlessly.
