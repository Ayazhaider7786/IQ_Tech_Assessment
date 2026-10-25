# EF Core Migration Commands

Run these from the solution root. Claude never runs these commands — this file is
the developer's reference.

## Add a migration

```
dotnet ef migrations add <Name> --project MyApp.Data --startup-project MyApp.Server
```

The first migration to create covers the Identity tables, `RefreshToken`, and the
duplicated audit columns on `ApplicationUser`:

```
dotnet ef migrations add InitialIdentity --project MyApp.Data --startup-project MyApp.Server
```

## Apply migrations to the database

```
dotnet ef database update --project MyApp.Data --startup-project MyApp.Server
```

## Roll back to a specific migration

```
dotnet ef database update <PreviousMigrationName> --project MyApp.Data --startup-project MyApp.Server
```

## Remove the last (unapplied) migration

```
dotnet ef migrations remove --project MyApp.Data --startup-project MyApp.Server
```

## List migrations

```
dotnet ef migrations list --project MyApp.Data --startup-project MyApp.Server
```

## Generate a SQL script (for staging/production deploys)

```
dotnet ef migrations script --project MyApp.Data --startup-project MyApp.Server -o migration.sql
```

Note: `MyApp.Server` doesn't reference `MyApp.Data` directly — it references
`MyApp.Services` and `MyApp.SeedData`, which reference `MyApp.Data` transitively.
That's enough for the EF tools to resolve `ApplicationDbContext` via
`--startup-project`, since transitive project references are included in the build.
