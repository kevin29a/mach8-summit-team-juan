# GEMINI.md - Context & Instructions

This project is a full-stack, Docker-orchestrated application featuring a **Django (REST Framework)** backend, a **React (Vite)** frontend, and a **PostgreSQL** database. It uses secure, session-based authentication.

## Project Overview

- **Architecture**: Decoupled Frontend and Backend services coordinated via Docker Compose.
- **Backend**: Django 4.2+ with Django REST Framework (DRF).
- **Frontend**: React 19 (Vite) + TanStack Query (v5) + Axios.
- **Database**: PostgreSQL 15.
- **Authentication**: Native Django HTTP-only sessions.
- **Service Communication**: Vite proxies `/api` requests to the Django container (`http://backend:8000`).

## Building and Running

### Prerequisites
- Docker and Docker Compose installed.

### Initial Setup
1. **Start Services**:
   ```bash
   docker-compose up -d --build
   ```
2. **Apply Migrations**:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
3. **Create Test User**:
   ```bash
   docker-compose exec backend python create_user.py
   ```
   *Default: admin / admin*

### Development Workflow
- **Logs**: `docker-compose logs -f [service_name]`
- **Stopping**: `docker-compose down` (Add `-v` to wipe database volumes).
- **Frontend**: Accessible at `http://localhost:5173`.
- **Backend API**: Internal port 8000, mapped to `8001` on host for direct access/debugging.
- **Database**: Internal port 5432, mapped to `5433` on host.

## Development Conventions

### Backend (Django/DRF)
- **Style**: Follow PEP 8 guidelines.
- **Authentication**: Uses `SessionAuthentication`. Ensure `DEFAULT_PERMISSION_CLASSES` are respected (typically `IsAuthenticated`).
- **CSRF**: CSRF protection is enabled. The frontend must include the `X-CSRFToken` header for state-changing requests (POST, PUT, DELETE, PATCH).

### Frontend (React/Vite)
- **Data Fetching**: Use **TanStack Query** for all server-side state.
- **HTTP Client**: Use **Axios**. All instances should be configured with `withCredentials: true` to support session cookies.
- **Components**: Prefer functional components and hooks.
- **Routing/Proxy**: All API calls must start with `/api` to be correctly caught by the Vite proxy.

### Security
- **Credentials**: Never commit `.env` files or hardcode secrets in `settings.py`.
- **CORS/CSRF**: Settings in `backend/core/settings.py` are configured for local development (`localhost:5173`). Update `CSRF_TRUSTED_ORIGINS` if the domain changes.

## Key Files
- `docker-compose.yml`: Service definitions and environment variables.
- `backend/core/settings.py`: Django configuration including CORS/CSRF.
- `frontend/vite.config.js`: Proxy configuration for `/api`.
- `backend/create_user.py`: Convenience script for initializing development users.
