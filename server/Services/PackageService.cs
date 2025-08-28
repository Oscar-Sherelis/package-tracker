using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Models.Enums;

namespace Server.Services
{
    public class PackageService : IPackageService
    {
        private readonly AppDbContext _context;

        public PackageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Package>> GetAllAsync()
        {
            return await _context.Packages
                .Include(p => p.History)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Package?> GetByIdAsync(Guid id)
        {
            return await _context.Packages
                .Include(p => p.History)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Package> CreateAsync(Package package)
        {
            // Generate tracking number
            package.TrackingNumber = $"TRK{DateTime.UtcNow.Ticks % 1_000_000_000:D9}";

            // Always start as Created
            package.Status = PackageStatus.Created;
            package.CreatedAt = DateTime.UtcNow;

            // Add initial status history
            package.History.Add(new StatusHistory
            {
                PackageId = package.Id,
                Status = PackageStatus.Created,
                ChangedAt = DateTime.UtcNow
            });

            _context.Packages.Add(package);
            await _context.SaveChangesAsync();

            return package;
        }

        public async Task<Package?> UpdateStatusAsync(Guid id, PackageStatus newStatus)
        {
            var package = await _context.Packages
                .Include(p => p.History)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (package == null)
                return null;

            if (!IsValidTransition(package.Status, newStatus))
                throw new InvalidOperationException($"Invalid transition: {package.Status} → {newStatus}");

            package.Status = newStatus;

            package.History.Add(new StatusHistory
            {
                PackageId = package.Id,
                Status = newStatus,
                ChangedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return package;
        }

        private bool IsValidTransition(PackageStatus current, PackageStatus next)
        {
            return current switch
            {
                PackageStatus.Created => next is PackageStatus.Sent or PackageStatus.Canceled,
                PackageStatus.Sent => next is PackageStatus.Accepted or PackageStatus.Returned or PackageStatus.Canceled,
                PackageStatus.Returned => next is PackageStatus.Sent or PackageStatus.Canceled,
                PackageStatus.Accepted => false, // final
                PackageStatus.Canceled => false, // final
                _ => false
            };
        }
    }
}
