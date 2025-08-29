using Server.Models.Enums;

namespace Server.Models
{
    public class StatusHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid PackageId { get; set; }
        public PackageStatus Status { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? Description { get; set; }

        public Package Package { get; set; } = null!;
    }
}