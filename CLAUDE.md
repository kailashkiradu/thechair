# TheChair — Salon Booking Platform

## Project Overview
Two-sided marketplace: customers book salon appointments, owners manage their salon, admin approves salons.

## Stack
- **Backend**: Spring Boot 3.4.x, Java 24, Maven 4
- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS
- **DB (dev)**: H2 in-memory (H2Dialect)
- **DB (prod)**: PostgreSQL
- **Auth**: JWT (jjwt 0.12.x), Spring Security

## Package Structure
`com.thechair.{config,controller,dto,entity,enums,exception,repository,security,service}`

## Backend Conventions
- Layered: controller → service → repository
- DTOs for all request/response — never expose entities directly
- Lombok: `@Data`, `@Builder`, `@RequiredArgsConstructor`
- Validation via `jakarta.validation` on request DTOs
- Custom exceptions in `com.thechair.exception`
- Global exception handler with `@RestControllerAdvice`
- UUIDs as primary keys (`GenerationType.UUID`)
- `created_at`, `updated_at` on every entity via `@PrePersist`/`@PreUpdate`

## Frontend Conventions
- TanStack Query v5 for all API calls
- Zustand for auth state
- React Router v6 for navigation
- `src/api/` → axios instances per domain
- `src/types/index.ts` → all TypeScript types
- Dark theme: bg `#0a0a0a`, card `#1e1e1e`, accent amber `#f59e0b`
- Toast notifications via react-hot-toast

## Running Locally
```bash
# Backend
cd backend && mvn spring-boot:run
# Opens on http://localhost:9090
# H2 console: http://localhost:9090/h2-console
# Swagger: http://localhost:9090/swagger-ui.html

# Frontend
cd frontend && npm install && npm run dev
# Opens on http://localhost:5173
```

## Default Admin Credentials
- Email: `admin@thechair.com`
- Password: `admin123`

## API Base URL
`http://localhost:8080/api`

## Roles
- `CUSTOMER` — browse salons, book appointments
- `OWNER` — manage their salon, services, slots, view bookings
- `ADMIN` — approve/reject salons, view all users and bookings
