# Aspire-Forgekit-DotNet-React 

A full-stack starter: ASP.NET Core Web API + React (Vite) frontend, orchestrated
locally with .NET Aspire. Ships with JWT authentication, role-based authorization,
and a dev-only seed-data helper so the login screen can fill itself in with one
click.

Coding conventions for this project (layering, naming, patterns) are documented
in [`.agent/code-structure.md`](.agent/code-structure.md) — that file is the
source of truth for *how* code is written here; this README is about *what's*
here and how to run it.

## Solution layout

```
MyApp/
  MyApp.slnx
  MyApp.AppHost/      ← .NET Aspire orchestrator (dev-time only)
  MyApp.Server/        ← ASP.NET Core Web API (controllers, Program.cs, appsettings)
  MyApp.Data/           ← EF Core entities, ApplicationDbContext, migrations
  MyApp.Services/       ← business logic, service interfaces, service models
  MyApp.SeedData/       ← startup seeders (roles, admin user)
  frontend/              ← React 19 + TypeScript + Vite
```

Project references: `MyApp.Server → MyApp.Services → MyApp.Data` and
`MyApp.Server → MyApp.SeedData → MyApp.Services → MyApp.Data`.

## What's implemented

**Backend**
- ASP.NET Core Identity (`AddIdentityCore`) with a custom `ApplicationUser` /
  `ApplicationRole`, using `Guid` keys.
- JWT access tokens + opaque, hashed refresh tokens (`RefreshToken` entity).
  Refresh is single-use: redeeming one revokes it and issues a new pair.
- Endpoints (`AuthController`): `POST /api/auth/register`, `/login`, `/refresh`,
  `/logout`, and `GET /api/auth/me`.
- Role-based authorization — every registered user is made an `Admin` of their
  own account (`RoleNames.Admin`).
- Audit trail: a plain `AuditableEntity` base (`CreatedAt`/`CreatedBy`/`UpdatedAt`/
  `UpdatedBy`/`IsActive`) stamped automatically by `ApplicationDbContext.SaveChanges`.
  `ApplicationUser` carries the same fields directly (it already extends
  `IdentityUser<Guid>`, so it can't also inherit `AuditableEntity`) and they're
  set by hand in `AuthService`.
- Dev-only seed data: `GET /api/seeddata/users` returns the seeded account(s)
  with their password, gated to return 404 outside `Development`. Backs the
  "Fill with seed data" button on the login page.
- Pagination helpers (`PagedResult<T>` / `PaginationParams` / `PaginationExtensions`)
  ready for the first paged list endpoint.
- FluentValidation (auto-validated request models), Mapster (all entity/model
  mapping), Swagger with a JWT bearer scheme, CORS.

**Frontend**
- React Router pages: Home, About Us, Contact Us, Login, Sign Up, Logout, 404.
- `AuthContext` / `AuthProvider` / `useAuth` — session state lives in React
  context, persisted tokens only (never the user object) via `tokenStorage`.
- `apiClient` (axios): attaches the JWT, and on a 401 does a single-flight
  refresh (concurrent requests share one refresh instead of racing).
- Tailwind v4 with semantic design tokens (`bg-surface`, `text-ink`, `bg-brand`,
  etc.) defined in `src/index.css` — swap the token values to re-brand instead
  of hunting through components.
- UI primitives: `Button`, `TextField`, `TextAreaField`, `Alert`.

## Prerequisites

- .NET SDK matching `net10.0` (projects were built against a `10.0.13`-era patch
  train; a `net11.0` preview SDK with multi-targeting support also works).
- Node.js 20+ and npm.
- A SQL Server instance. By default this points at **LocalDB**
  (`(localdb)\mssqllocaldb`) — no Docker required. Aspire can instead run SQL
  Server as a container if you have Docker; see **Switching to Aspire-hosted SQL
  Server** below.

## First-time setup

1. **Restore and install dependencies**
   ```
   dotnet restore MyApp.slnx
   cd frontend && npm install && cd ..
   ```

2. **Apply the database migration** (the `InitialIdentity` migration already
   exists in `MyApp.Data/Migrations/`; this just applies it to your database):
   ```
   dotnet ef database update --project MyApp.Data --startup-project MyApp.Server
   ```
   See `MyApp.Data/migration.md` for the full set of migration commands
   (add/rollback/remove/script).

3. **Secrets** — `Jwt:SigningKey` and the seed admin password are currently
   committed in `MyApp.Server/appsettings.Development.json` for local
   convenience (not the usual recommended setup — see **Security notes**
   below). If you rotate them, either edit that file directly or move them
   back to user-secrets:
   ```
   cd MyApp.Server
   dotnet user-secrets init
   dotnet user-secrets set "Jwt:SigningKey" "<32+ char key>"
   dotnet user-secrets set "SeedData:Users:0:Password" "<password>"
   ```
   User-secrets (when used) override `appsettings.*.json` for matching keys.

## Running it

**Everything at once (recommended):**
```
dotnet run --project MyApp.AppHost
```
Opens the Aspire dashboard, which starts the API and the Vite dev server
together and wires the frontend's `/api` proxy to the API automatically.

**Separately:**
```
dotnet run --project MyApp.Server   # https://localhost:7303 (Swagger at /swagger)
cd frontend && npm run dev          # http://localhost:5173
```

### Default login (Development only)

The seed-data button on the login page fetches real credentials from
`GET /api/seeddata/users` (404 outside Development). Current seeded account:
`admin@example.com` — password lives in
`MyApp.Server/appsettings.Development.json`.

## Configuration reference

All in `MyApp.Server/appsettings.json` / `appsettings.Development.json`:

| Key | Purpose |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `Jwt:Issuer` / `Jwt:Audience` | JWT claims validated on every request |
| `Jwt:SigningKey` | HMAC signing key — app throws at startup if empty |
| `Jwt:AccessTokenMinutes` / `Jwt:RefreshTokenDays` | Token lifetimes |
| `SeedData:Users` | Accounts seeded at startup (Development only) |
| `Cors:AllowedOrigins` | Allowed origins for non-proxied frontend builds |

## Switching to Aspire-hosted SQL Server

`MyApp.AppHost/AppHost.cs` has an `AddSqlServer` block commented out — it would
have Aspire run SQL Server as a Docker container instead of using the plain
connection string above. To switch:
1. Uncomment the `var sql = builder.AddSqlServer(...)` block and the
   `.WithReference(sql).WaitFor(sql)` lines in `AppHost.cs`.
2. Uncomment the matching `PackageReference` in `MyApp.AppHost.csproj` and
   `MyApp.Server.csproj`.
3. In `MyApp.Server/Program.cs`, swap the `AddDbContext`/`UseSqlServer` call for
   `builder.AddSqlServerDbContext<ApplicationDbContext>("sqldata")`.

Requires Docker Desktop (or another container runtime) running.

## Security notes

- `appsettings.Development.json` currently holds the JWT signing key and the
  seed admin password in plaintext, by deliberate choice (not the convention
  described in `.agent/code-structure.md`, which keeps secrets in user-secrets/
  environment variables only). If this repo is ever pushed somewhere shared,
  rotate both and move them out of that file first.
- Before any production deployment: delete `SeedDataController`,
  `SeedDataService`, the `SeedData` config section, and
  `frontend/src/services/seedDataService.ts`; move all secrets to environment
  variables; set `Cors:AllowedOrigins` to the real frontend origin.
- Run `dotnet list MyApp.slnx package --vulnerable --include-transitive`
  periodically — package versions were last audited and patched on 2026-10-25.
