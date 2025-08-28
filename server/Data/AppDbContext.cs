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

                entity.Property(p => p.TrackingNumber)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(p => p.SenderName).IsRequired().HasMaxLength(100);
                entity.Property(p => p.SenderAddress).IsRequired().HasMaxLength(200);
                entity.Property(p => p.SenderPhone).IsRequired().HasMaxLength(20);

                entity.Property(p => p.RecipientName).IsRequired().HasMaxLength(100);
                entity.Property(p => p.RecipientAddress).IsRequired().HasMaxLength(200);
                entity.Property(p => p.RecipientPhone).IsRequired().HasMaxLength(20);

                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // StatusHistory entity config
            modelBuilder.Entity<StatusHistory>(entity =>
            {
                entity.HasKey(h => h.Id);

                entity.Property(h => h.Status).IsRequired();

                entity.Property(h => h.ChangedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(h => h.Package)
                      .WithMany(p => p.History)
                      .HasForeignKey(h => h.PackageId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ✅ SEED DATA
            var package1Id = Guid.NewGuid();
            var package2Id = Guid.NewGuid();

            modelBuilder.Entity<Package>().HasData(
                new Package
                {
                    Id = package1Id,
                    TrackingNumber = "TRK10001",
                    SenderName = "Alice Smith",
                    SenderAddress = "123 Main St, New York, USA",
                    SenderPhone = "+1-555-1234",
                    RecipientName = "Bob Johnson",
                    RecipientAddress = "456 Market St, San Francisco, USA",
                    RecipientPhone = "+1-555-5678",
                    Status = PackageStatus.Created,
                    CreatedAt = DateTime.UtcNow
                },
                new Package
                {
                    Id = package2Id,
                    TrackingNumber = "TRK10002",
                    SenderName = "Charlie Brown",
                    SenderAddress = "12 Baker St, London, UK",
                    SenderPhone = "+44-20-1234-5678",
                    RecipientName = "Diana Prince",
                    RecipientAddress = "77 Queen St, London, UK",
                    RecipientPhone = "+44-20-8765-4321",
                    Status = PackageStatus.Sent,
                    CreatedAt = DateTime.UtcNow
                }
            );

            modelBuilder.Entity<StatusHistory>().HasData(
                new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = package1Id,
                    Status = PackageStatus.Created,
                    ChangedAt = DateTime.UtcNow
                },
                new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = package2Id,
                    Status = PackageStatus.Created,
                    ChangedAt = DateTime.UtcNow.AddMinutes(-30)
                },
                new StatusHistory
                {
                    Id = Guid.NewGuid(),
                    PackageId = package2Id,
                    Status = PackageStatus.Sent,
                    ChangedAt = DateTime.UtcNow
                }
            );
        }
    }
}
