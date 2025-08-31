using Server.DTO;
using Server.Models;
using Server.Models.Enums;

namespace Server.Services
{
    public interface IPackageService
    {
        Task<IEnumerable<PackageDto>> GetAllAsync(string? searchTerm, int page, int pageSize);
        Task<int> GetCountAsync(string? searchTerm);
        Task<PackageDto?> GetByIdAsync(Guid id);
        Task<PackageDto> CreateAsync(Package package);
        Task<PackageDto?> UpdateStatusAsync(Guid id, PackageStatus newStatus);
    }
}