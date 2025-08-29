using Server.Data;
using Microsoft.EntityFrameworkCore;
using Server.Services;
using DotNetEnv;
using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;


// Load environment variables from .env file
Env.Load();
var builder = WebApplication.CreateBuilder(args);

// Add logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Load environment variables - .env takes precedence over appsettings
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
                 ?? builder.Configuration["FRONTEND_URL"]
                 ?? "http://localhost:5173";

// EF Core InMemory
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("PackageDb")
    .EnableSensitiveDataLogging() // Debugging
    .LogTo(Console.WriteLine, LogLevel.Information)); // Logging

builder.Services.AddControllers()
.AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Package Tracker API",
        Version = "v1",
        Description = "API for managing package tracking system"
    });
});
builder.Services.AddScoped<IPackageService, PackageService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(frontendUrl) // React dev server
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Ensuring database is created...");
        context.Database.EnsureCreated();
        logger.LogInformation("Database created successfully");

        // Manual seeding
        logger.LogInformation("Seeding data...");
        await context.SeedDataAsync();
        // Check for packages
        var packageCount = context.Packages.CountAsync();
        var historyCount = await context.StatusHistories.CountAsync();
        logger.LogInformation($"Seeding completed: {packageCount} packages, {historyCount} history entries");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred creating the database");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();
