using System.Text;
using FluentValidation;
using Mapster;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using MyApp.Data.Abstractions;
using MyApp.Data.Data;
using MyApp.Data.Entities;
using MyApp.SeedData;
using MyApp.SeedData.Seeders;
using MyApp.Services.Model.Auth;
using MyApp.Services.Model.SeedData;
using MyApp.Services.Services.Auth;
using MyApp.Services.Services.SeedData;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();

builder.Services.AddProblemDetails();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

// Database — plain connection string from appsettings (no Docker required).
// Requires Docker Desktop: comment the line below and uncomment this one
// instead to let Aspire run SQL Server as a container and supply the
// connection string via the "sqldata" resource reference:
// builder.AddSqlServerDbContext<ApplicationDbContext>("sqldata");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity — AddIdentityCore, not AddIdentity: this is a token API, and
// AddIdentity would register cookie schemes that compete with JWT as the
// default authentication scheme.
builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireUppercase = true;
    options.Password.RequireDigit = true;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
    .AddRoles<ApplicationRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// JWT bearer auth. Jwt:SigningKey ships empty — fail loudly at startup rather
// than silently issuing unsigned-looking tokens.
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.Configure<JwtOptions>(jwtSection);

var jwtSigningKey = jwtSection["SigningKey"];
if (string.IsNullOrWhiteSpace(jwtSigningKey))
{
    throw new InvalidOperationException(
        "Jwt:SigningKey must be configured (via user-secrets in Development, environment variables in production) before the app can start.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// CORS — the matching list for origins that aren't proxied through Vite/Aspire.
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(corsOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// FluentValidation — request models are validated automatically before the
// controller action runs.
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// Mapster — scan this assembly and MyApp.Services for IRegister implementations.
TypeAdapterConfig.GlobalSettings.Scan(typeof(Program).Assembly, typeof(AuthService).Assembly);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MyApp API",
        Version = "v1",
        Description = "MyApp backend API.",
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter a valid JWT access token.",
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        },
    });
});

// App services — all DI registration lives here and nowhere else.
builder.Services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISeedDataService, SeedDataService>();

builder.Services.Configure<SeedDataOptions>(builder.Configuration.GetSection("SeedData"));

builder.Services.AddScoped<RoleSeeder>();
builder.Services.AddScoped<UserSeeder>();
builder.Services.AddScoped<DatabaseSeeder>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "MyApp API v1");
        options.DocumentTitle = "MyApp API Docs";
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.UseFileServer();

// Seeding runs at startup inside a scoped service scope, Development only.
// DatabaseSeeder.SeedAsync wraps itself in try/catch — an un-migrated database
// must not stop the host from starting.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

await app.RunAsync();
