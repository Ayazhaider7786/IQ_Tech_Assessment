var builder = DistributedApplication.CreateBuilder(args);

// Requires Docker Desktop (or another container runtime) to be running —
// uncomment to have Aspire run SQL Server as a container instead of using a
// plain connection string in appsettings.json. Also uncomment the matching
// PackageReference in MyApp.AppHost.csproj and MyApp.Server.csproj, and swap
// MyApp.Server/Program.cs back to builder.AddSqlServerDbContext<T>("sqldata").
// var sql = builder.AddSqlServer("sql").AddDatabase("sqldata");

var server = builder.AddProject<Projects.MyApp_Server>("server")
    // .WithReference(sql)
    // .WaitFor(sql)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddViteApp("webfrontend", "../frontend")
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
