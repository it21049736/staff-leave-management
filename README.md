# Staff Leave Management System

Spring Boot (Java) + Spring Security/JWT + Spring Data JPA backend, MySQL database,
React (Vite) + Tailwind frontend.

SE2030 Software Engineering group project.

## Backend setup

Requires Java 17+, Maven, and MySQL 8 running locally.

```bash
# create the app database + user (one-time, run in the mysql client as root)
mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS staffleave_db CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'staffleave_app'@'localhost' IDENTIFIED BY 'staffleave_pass';
GRANT ALL PRIVILEGES ON staffleave_db.* TO 'staffleave_app'@'localhost';
FLUSH PRIVILEGES;
"

cd backend-java
mvn spring-boot:run
```

The app connects on first boot, creates the schema automatically (`spring.jpa.hibernate.ddl-auto=update`),
and seeds demo data (departments, leave types, admin + 8 employee accounts, sample leave requests)
if the database is empty.

Demo accounts:
- Admin/HR: `admin` / `Admin@1234`
- Employee: `employee1` / `Employee@1234` (and 7 more, see `DataSeeder.java`)

DB credentials/JWT secret can be overridden via env vars (`DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`)
instead of editing `application.properties` directly.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://127.0.0.1:8000/api` by default (see `frontend/.env`,
`VITE_API_URL`) — this matches the Spring Boot backend's default port.

## Branching workflow

- `master` is the stable, always-runnable branch.
- New work happens on short-lived `feature/*` or `chore/*` branches, opened as a
  pull request and merged back into `master` once it passes a manual review.

## Design patterns

- **Strategy** — `service/validation/LeaveValidationStrategy` and its implementations
  (date-range, overlap, balance checks). Each rule is its own `@Order`ed `@Component`,
  auto-wired into `LeaveService` as a `List<LeaveValidationStrategy>` — so a new rule is
  added by dropping in another implementation, with no change to `LeaveService` itself.
- **Observer** — `event/LeaveStatusChangedEvent` + `LeaveAuditListener`, decoupling the
  approve/reject workflow from side effects like audit logging. `LeaveService` only
  publishes the event; it never knows what (if anything) listens for it.
- **Repository/DAO** — Spring Data JPA repositories abstract all persistence, so services
  depend on query methods rather than JDBC/SQL directly.

## API overview

- `POST /api/auth/login/`, `POST /api/auth/refresh/`
- `GET/PATCH /api/auth/me/`, `POST /api/auth/change-password/`
- `GET /api/leave-types/`, `POST/PATCH/DELETE .../{id}/` (admin)
- `GET /api/balances/`
- `GET/POST /api/leaves/`, `PATCH /api/leaves/{id}/`, `POST .../cancel/`
- `GET /api/leaves/all/`, `POST .../approve/`, `POST .../reject/` (admin)
- `GET/POST /api/users/`, `PATCH /api/users/{id}/` (admin)
- `GET /api/reports/summary/`, `/by-department/`, `/export/` (admin)
- `GET /api/departments/`
