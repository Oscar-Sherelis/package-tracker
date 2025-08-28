using Microsoft.EntityFrameworkCore;
using Server.Models;

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

            // Package
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

                entity.Property(p => p.CreatedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");
            });

            // StatusHistory
            modelBuilder.Entity<StatusHistory>(entity =>
            {
                entity.HasKey(h => h.Id);

                entity.Property(h => h.Status)
                      .IsRequired();

                entity.Property(h => h.ChangedAt)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(h => h.Package)
                      .WithMany(p => p.History)
                      .HasForeignKey(h => h.PackageId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
