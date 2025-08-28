using Server.Models;
using Server.Models.Enums;

namespace Server.Services
{
    public interface IPackageService
    {
        Task<IEnumerable<Package>> GetAllAsync();
        Task<Package?> GetByIdAsync(Guid id);
        Task<Package> CreateAsync(Package package);
        Task<Package?> UpdateStatusAsync(Guid id, PackageStatus newStatus);
    }
}
