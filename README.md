# Staff Leave Management System

Django 5 + DRF + SimpleJWT backend, React (Vite) frontend.

## Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # then edit values if needed
python manage.py migrate
python manage.py seed_demo   # creates departments, leave types, admin + employee demo users
python manage.py runserver
```

By default the backend uses SQLite for local development (`DB_ENGINE=sqlite` in `.env`).
To use PostgreSQL instead, set `DB_ENGINE=postgres` and fill in `DB_NAME`, `DB_USER`,
`DB_PASSWORD`, `DB_HOST`, `DB_PORT` in `.env`, then re-run `migrate`.

Demo accounts (created by `seed_demo`):
- Admin/HR: `admin` / `Admin@1234`
- Employee: `employee1` / `Employee@1234`

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://127.0.0.1:8000/api` by default (see `frontend/.env`,
`VITE_API_URL`).

## API overview

See the project spec for the full endpoint list. Key routes:
- `POST /api/auth/login/`, `POST /api/auth/refresh/`
- `GET/PATCH /api/auth/me/`, `POST /api/auth/change-password/`
- `GET /api/leave-types/`, `GET /api/balances/`
- `GET/POST /api/leaves/`, `PATCH/POST .../cancel/`
- `GET /api/leaves/all/`, `POST .../approve/`, `POST .../reject/` (admin)
- `GET/POST /api/users/`, `PATCH /api/users/{id}/` (admin)
- `GET /api/reports/summary/`, `/by-department/`, `/export/` (admin)
