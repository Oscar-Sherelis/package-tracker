using Server.Models.Enums;

namespace Server.Models
{
    public class StatusHistory
    {
        public Guid Id { get; set; }

        public Guid PackageId { get; set; }
        public PackageStatus Status { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }
        // Navigation property back to Package
        public Package Package { get; set; } = null!;
    }
}