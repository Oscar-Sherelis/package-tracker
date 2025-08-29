using Microsoft.EntityFrameworkCore;
using Server.Models;
using Server.Models.Enums;

namespace Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Package> Packages => Set<Package>();
        public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Package entity config
            modelBuilder.Entity<Package>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.HasIndex(p => p.TrackingNumber).IsUnique();
                entity.Property(p => p.TrackingNumber).IsRequired().HasMaxLength(20);
                entity.Property(p => p.SenderName).IsRequired().HasMaxLength(100);
                entity.Property(p => p.SenderAddress).IsRequired().HasMaxLength(200);
                entity.Property(p => p.SenderPhone).IsRequired().HasMaxLength(20);
                entity.Property(p => p.RecipientName).IsRequired().HasMaxLength(100);
                entity.Property(p => p.RecipientAddress).IsRequired().HasMaxLength(200);
                entity.Property(p => p.RecipientPhone).IsRequired().HasMaxLength(20);
                entity.Property(p => p.CreatedAt).HasDefaultValue(DateTime.UtcNow);
            });

            // StatusHistory entity config
            modelBuilder.Entity<StatusHistory>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.Status).IsRequired();
                entity.Property(h => h.ChangedAt).HasDefaultValue(DateTime.UtcNow);
                entity.HasOne(h => h.Package)
                      .WithMany(p => p.StatusHistory)
                      .HasForeignKey(h => h.PackageId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        // Manually seed data
        public async Task SeedDataAsync()
        {
            // Check if database is already seeded
            if (await Packages.AnyAsync())
                return;

            var packages = new List<Package>();
            var statusHistories = new List<StatusHistory>();

            // Create 5 dummy packages with different statuses (reduced for simplicity)
            for (int i = 1; i <= 5; i++)
            {
                var packageId = Guid.NewGuid();
                var statusValues = Enum.GetValues<PackageStatus>();
                var status = statusValues[(i - 1) % statusValues.Length];

                var package = new Package
                {
                    Id = packageId,
                    TrackingNumber = $"TRK{10000 + i}",
                    SenderName = $"Sender {i}",
                    SenderAddress = $"{i} Main St, City {i}",
                    SenderPhone = $"+1-555-{1000 + i:0000}",
                    RecipientName = $"Recipient {i}",
                    RecipientAddress = $"{i} Oak St, Town {i}",
                    RecipientPhone = $"+1-555-{2000 + i:0000}",
                    Status = status,
                    CreatedAt = DateTime.UtcNow.AddDays(-i)
                };
                packages.Add(package);

                // Add initial status history
                statusHistories.Add(new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = packageId,
                    Status = PackageStatus.Created,
                    ChangedAt = package.CreatedAt,
                    Description = "Package created"
                });

                // Add status change if not Created
                if (status != PackageStatus.Created)
                {
                    statusHistories.Add(new StatusHistory
                    {
                        Id = Guid.NewGuid(),
                        PackageId = packageId,
                        Status = status,
                        ChangedAt = package.CreatedAt.AddHours(2),
                        Description = $"Status updated to {status}"
                    });
                }
            }

            // Add special returned package case
            var returnedPackageId = Guid.NewGuid();
            var returnedPackage = new Package
            {
                Id = returnedPackageId,
                TrackingNumber = "TRK20001",
                SenderName = "Online Store",
                SenderAddress = "123 E-commerce Street, Digital City",
                SenderPhone = "+1-800-SHOP-NOW",
                RecipientName = "John Doe",
                RecipientAddress = "456 Home Street, Residential Town",
                RecipientPhone = "+1-555-0123",
                Status = PackageStatus.Returned,
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            };
            packages.Add(returnedPackage);

            statusHistories.AddRange(new[]
            {
                new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = returnedPackageId,
                    Status = PackageStatus.Created,
                    ChangedAt = DateTime.UtcNow.AddDays(-3),
                    Description = "Package created successfully"
                },
                new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = returnedPackageId,
                    Status = PackageStatus.Sent,
                    ChangedAt = DateTime.UtcNow.AddDays(-2),
                    Description = "Package shipped via standard delivery"
                },
                new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = returnedPackageId,
                    Status = PackageStatus.Returned,
                    ChangedAt = DateTime.UtcNow.AddDays(-1),
                    Description = "Package returned - recipient unavailable"
                }
            });

            // Add to context and save
            await Packages.AddRangeAsync(packages);
            await StatusHistories.AddRangeAsync(statusHistories);
            await SaveChangesAsync();
        }

    }
}