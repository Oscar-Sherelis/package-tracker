using Server.Data;
using Microsoft.EntityFrameworkCore;
using Server.Services;
using DotNetEnv; // Add this namespace

// Load environment variables from .env file
Env.Load();
var builder = WebApplication.CreateBuilder(args);

// Load environment variables - .env takes precedence over appsettings
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
                 ?? builder.Configuration["FRONTEND_URL"]
                 ?? "http://localhost:5173";

// EF Core InMemory
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("PackageDb"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IPackageService, PackageService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(frontendUrl) // React dev server
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // If using cookies/auth
        });
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Log the CORS origin for debugging
    Console.WriteLine($"CORS allowed origin: {frontendUrl}");
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.UseCors("AllowFrontend");
app.MapControllers();

app.Run();
