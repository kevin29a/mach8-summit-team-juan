# Dockerized Django & React with Session Authentication

This repository contains a full-stack, Docker-orchestrated baseline architecture. It pairs a **Django (REST Framework)** backend with a **React (Vite) + TanStack Query** frontend, securely authenticated using Django's native HTTP-only sessions, and backed by a **PostgreSQL** database.

## Features Included
- **Vite Proxy Bypass Strategy**: In development, Vite smoothly proxies all requests bound for `/api` straight to the Django container. This ensures frontend and backend execute from the exact same domain (`localhost`), preventing CORS or cross-domain cookie rejections.
- **TanStack Query Integrations**: Data fetching and mutations in React are securely handled by `useQuery` and `useMutation`, configured with Axios to automatically push credentials (`withCredentials: true`) and Django's required CSRF tokens.
- **PostgreSQL**: Production-ready robust data containerization.
- **Minimal Configuration**: Requires zero local dependencies outside of Docker to spin up and test.

## How to Run

1. Ensure **Docker Desktop** (or equivalent Docker daemon) is installed and active on your machine.
2. In the terminal, navigate to the root directory where `docker-compose.yml` lives.
3. Build and spin up the environment:
   ```bash
   docker-compose up -d --build
   ```

## Creating a Test User

Because PostgreSQL is run locally in Docker, you will need to apply Django migrations and create a superuser upon your first boot.

1. Tail the logs to ensure the database container (`db`) initializes and the backend spins up cleanly:
   ```bash
   docker-compose logs -f backend
   ```
2. Open a bash shell inside the running backend container to execute commands:
   ```bash
   docker-compose exec backend bash
   ```
3. Inside the container shell, run the migrations and user creation script:
   ```bash
   python manage.py migrate
   python create_user.py
   exit
   ```
   > *Note: By default, `create_user.py` provisions a test user with username `admin` and password `admin`.*

## Verification
- Navigate your browser to `http://localhost:5173`.
- Input the credentials (`admin` / `admin`).
- TanStack Mutation triggers the Vite proxy, authenticates with Django, retrieves an HTTP-Only Session cookie alongside a CSRF cookie, and renders the logged-in dashboard continuously.

## Stopping the Containers
To halt execution, simply run:
```bash
docker-compose down
```
If you ever want to reset the database and volume data completely:
```bash
docker-compose down -v
```
