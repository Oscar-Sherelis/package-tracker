using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.Models;
using Server.Models.Enums;
using Server.DTO;

namespace Server.Services
{
    public class PackageService : IPackageService
    {
        private readonly AppDbContext _context;

        public PackageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PackageDto>> GetAllAsync()
        {
            var packages = await _context.Packages
                .Include(p => p.StatusHistory)
                .AsNoTracking()
                .ToListAsync();

            return packages.Select(MapToDto).ToList();
        }

        public async Task<PackageDto?> GetByIdAsync(Guid id)
        {
            var package = await _context.Packages
                .Include(p => p.StatusHistory)
                .FirstOrDefaultAsync(p => p.Id == id);

            return package != null ? MapToDto(package) : null;
        }

        public async Task<PackageDto> CreateAsync(Package package)
        {
            // Generate tracking number
            package.TrackingNumber = $"TRK{DateTime.UtcNow.Ticks % 1_000_000_000:D9}";

            // Always start as Created
            package.Status = PackageStatus.Created;
            package.CreatedAt = DateTime.UtcNow;

            // Add initial status history
            package.StatusHistory.Add(new StatusHistory
            {
                PackageId = package.Id,
                Status = PackageStatus.Created,
                ChangedAt = DateTime.UtcNow,
                Description = "Package created"
            });

            _context.Packages.Add(package);
            await _context.SaveChangesAsync();

            return MapToDto(package);
        }

        public async Task<PackageDto?> UpdateStatusAsync(Guid id, PackageStatus newStatus)
        {
            var package = await _context.Packages
                .Include(p => p.StatusHistory)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (package == null)
                return null;

            if (!IsValidTransition(package.Status, newStatus))
                throw new InvalidOperationException($"Invalid transition: {package.Status} → {newStatus}");

            package.Status = newStatus;

            package.StatusHistory.Add(new StatusHistory
            {
                PackageId = package.Id,
                Status = newStatus,
                ChangedAt = DateTime.UtcNow,
                Description = $"Status changed to {newStatus}"
            });

            await _context.SaveChangesAsync();
            return MapToDto(package);
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

        private PackageDto MapToDto(Package package)
        {
            return new PackageDto
            {
                Id = package.Id,
                TrackingNumber = package.TrackingNumber,
                SenderName = package.SenderName,
                SenderAddress = package.SenderAddress,
                SenderPhone = package.SenderPhone,
                RecipientName = package.RecipientName,
                RecipientAddress = package.RecipientAddress,
                RecipientPhone = package.RecipientPhone,
                Status = package.Status,
                CreatedAt = package.CreatedAt,
                StatusHistory = package.StatusHistory?.Select(h => new StatusHistoryDto
                {
                    Id = h.Id,
                    Status = h.Status,
                    ChangedAt = h.ChangedAt,
                    Description = h.Description
                }).ToList() ?? new List<StatusHistoryDto>()
            };
        }
    }
}
