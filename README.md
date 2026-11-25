# Support Ticket Management System (Helpdesk)

Mini helpdesk application where users raise support tickets and admins manage and resolve them.

Built for the Full Stack Developer technical assignment.

## Tech stack

| Layer | Choice |
|-------|--------|
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Bearer), bcrypt password hashing |
| Frontend | React (Vite) + React Router |
| Events | Node EventEmitter → activity logs + notifications |

## Features

### Authentication & roles
- Register / login with JWT
- Roles: `user` and `admin`
- Route and API-level authorization

### User ticket management
- Create, view, edit, delete own tickets
- Track status and priority
- Add comments on own tickets
- Search, filter, pagination

### Admin management
- View all tickets with status/priority filters
- Update status and priority
- Dashboard with ticket statistics
- Full activity log

### Event-driven workflow
Events emitted on important actions:

| Event | Action |
|-------|--------|
| `TICKET_CREATED` | Activity log + notify admins |
| `TICKET_UPDATED` | Activity log |
| `STATUS_CHANGED` | Activity log + notify ticket owner |
| `TICKET_RESOLVED` | Activity log + notify owner |
| `COMMENT_ADDED` | Activity log + notify counterpart |

## Project structure

```
support-ticket-system/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers
│   │   ├── events/          # Event bus + handlers
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # REST routes
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles.css
│   └── package.json
├── docs/DATABASE.md
├── postman/Support-Ticket-API.postman_collection.json
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)

### 1. Install dependencies

```bash
cd support-ticket-system
npm run install:all
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit MONGODB_URI and JWT_SECRET if needed
```

Default `backend/.env`:

```
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/support-ticket-system
JWT_SECRET=support_ticket_dev_secret_change_in_production_2026
JWT_EXPIRES_IN=7d
```

> Note: Port `5050` is used because macOS often reserves `5000` for AirPlay Receiver.

### 3. Seed demo data (optional)

```bash
npm run seed
```

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@helpdesk.com | admin123 |
| User | user@helpdesk.com | user123 |

### 4. Run

Terminal 1 — API:

```bash
npm run dev:backend
```

Terminal 2 — UI:

```bash
npm run dev:frontend
```

- Frontend: http://localhost:5173  
- API: http://localhost:5050/api  
- Health: http://localhost:5050/api/health  

## API overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Current user |
| POST | `/api/tickets` | User | Create ticket |
| GET | `/api/tickets` | User | List my tickets |
| GET | `/api/tickets/:id` | Owner/Admin | Ticket + comments |
| PUT | `/api/tickets/:id` | Owner | Update ticket |
| DELETE | `/api/tickets/:id` | Owner/Admin | Delete ticket |
| POST | `/api/tickets/:id/comments` | Owner/Admin | Add comment |
| GET | `/api/admin/tickets` | Admin | All tickets + filters |
| PATCH | `/api/admin/tickets/:id` | Admin | Update status/priority |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/activity` | Admin | Activity logs |
| GET | `/api/notifications` | Auth | User notifications |

Full Postman collection: [`postman/Support-Ticket-API.postman_collection.json`](postman/Support-Ticket-API.postman_collection.json)

Database design: [`docs/DATABASE.md`](docs/DATABASE.md)

## Implementation decisions

1. **Layered Express architecture** — routes → controllers → models, with shared middleware for auth and validation.
2. **JWT in Authorization header** — stateless auth; passwords hashed with bcrypt (cost 12).
3. **Event bus** — decouples side effects (logs, notifications) from request handlers so ticket flows stay readable.
4. **Role checks at controller level** — users cannot access others’ tickets; admins get dedicated `/api/admin` routes.
5. **Lightweight React UI** — Vite + CSS variables, no heavy UI kit; focused on clarity for the assignment demo.
6. **express-validator** — input validation before business logic; centralized error handler for Mongoose/JWT errors.

## Submission checklist

- [x] Complete source code
- [x] README (setup, stack, decisions)
- [x] API docs / Postman collection
- [x] Database design explanation
- [ ] GitHub repository (connect later)
- [ ] Live deployment link (deploy later)
