# IQ Technologies

Full-stack starter: ASP.NET Core Web API + React (Vite), orchestrated locally
with .NET Aspire. JWT auth, role-based authorization, task management, and a
dev-only seed-data helper for one-click login.

Coding conventions live in [`.agent/code-structure.md`](.agent/code-structure.md).
This README is about what's here and how to run it.

## Layout

```
MyApp.AppHost/   .NET Aspire orchestrator (dev-time only)
MyApp.Server/    ASP.NET Core Web API
MyApp.Data/      EF Core entities, DbContext, migrations
MyApp.Services/  business logic, service models
MyApp.SeedData/  startup seeders (roles, admin user)
frontend/        React 19 + TypeScript + Vite
```
`MyApp.Server → MyApp.Services → MyApp.Data`, `MyApp.Server → MyApp.SeedData → MyApp.Services`.

## Features

**Backend** — ASP.NET Core Identity with JWT access + hashed refresh tokens
(`AuthController`: register/login/refresh/logout/me); role-based auth (every
user is `Admin` of their own account); audit trail via `AuditableEntity`; task
CRUD (`TasksController`, user-scoped, complete/reopen); dev-only
`GET /api/seeddata/users`; pagination helpers; FluentValidation, Mapster,
Swagger (JWT bearer), CORS.

**Frontend** — pages: Home, Login, Sign Up, Logout, Tasks, Task History, 404.
Tasks page (add/edit modal, complete/delete) and Task History (reopen) share
state via the `useTasks` hook. `AuthContext`/`useAuth` for session state,
`apiClient` with JWT attach + single-flight refresh-on-401, Tailwind v4 with
semantic tokens (`src/index.css`), UI primitives (`Button`, `TextField`,
`TextAreaField`, `Alert`).

## API Integration

**API used:** [official-joke-api](https://official-joke-api.appspot.com/) —
`GET https://official-joke-api.appspot.com/random_joke`. No API key required,
and it returns `Access-Control-Allow-Origin: *`, so it's called directly from
the browser with no backend proxy.

**Short explanation of implementation:** the URL lives in
`frontend/src/config/jokeApi.ts`; `frontend/src/services/jokeService.ts` calls
it with a plain `axios.get()` (not the app's `apiClient`, since that instance
is wired to our own API's base URL and attaches a JWT header — both wrong for
an unrelated public API). `components/pages/ApiIntegrationPage.tsx` renders
the `/api-integration` route: a "Give me a joke" button (or pressing Enter)
fetches and shows the joke's `setup` text, a "Show Punchline" button then
reveals the `punchline`, and a "Next Joke" button appears alongside it to
fetch another. Errors go through the same `extractApiError` + `Alert` pattern
used everywhere else in the app.

## Setup

```
dotnet restore MyApp.slnx
cd frontend && npm install && cd ..
dotnet ef database update --project MyApp.Data --startup-project MyApp.Server
```

Requires: .NET SDK for `net10.0`, Node 20+, a SQL Server instance (defaults to
LocalDB — see `ConnectionStrings:DefaultConnection`, no Docker needed).

Secrets: `Jwt:SigningKey` and the seed password currently live in
`appsettings.Development.json` for convenience (see **Security notes**). To
move them to user-secrets instead:
```
cd MyApp.Server
dotnet user-secrets init
dotnet user-secrets set "Jwt:SigningKey" "<32+ char key>"
dotnet user-secrets set "SeedData:Users:0:Password" "<password>"
```

## Running it

```
dotnet run --project MyApp.AppHost
```
Starts the API + Vite dev server together via the Aspire dashboard, proxy
wired automatically. Or run separately:
```
dotnet run --project MyApp.Server   # https://localhost:7303 (Swagger at /swagger)
cd frontend && npm run dev          # http://localhost:5173
```

Default dev login: `admin@example.com` — password in
`MyApp.Server/appsettings.Development.json`, or click "Fill with seed data" on
the login page (Development only).

## Configuration

All in `MyApp.Server/appsettings*.json`:

| Key | Purpose |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:Issuer` / `Jwt:Audience` / `Jwt:SigningKey` | JWT validation + signing (app throws at startup if key is empty) |
| `Jwt:AccessTokenMinutes` / `Jwt:RefreshTokenDays` | Token lifetimes |
| `SeedData:Users` | Accounts seeded at startup (Development only) |
| `Cors:AllowedOrigins` | Allowed origins for non-proxied builds |

## Docker-based SQL Server (optional)

`MyApp.AppHost/AppHost.cs` has a commented-out `AddSqlServer` block to run SQL
Server as a container instead of the plain connection string. Uncomment it plus
the matching `PackageReference` entries, and swap `Program.cs` back to
`builder.AddSqlServerDbContext<ApplicationDbContext>("sqldata")`. Requires
Docker.

## Security notes

- The JWT signing key and seed password are committed in plaintext in
  `appsettings.Development.json` by deliberate choice — rotate and move them
  out before sharing this repo anywhere.
- Before production: delete `SeedDataController`/`SeedDataService`/the
  `SeedData` config/`seedDataService.ts`; move secrets to environment
  variables; set `Cors:AllowedOrigins` to the real frontend origin.
- Run `dotnet list MyApp.slnx package --vulnerable --include-transitive`
  periodically (last audited 2026-10-25).
