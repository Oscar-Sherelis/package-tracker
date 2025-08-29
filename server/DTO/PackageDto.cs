using Server.Models.Enums;

namespace Server.DTO
{
    // Data Transfer Object for Package entity - prevents circular references in API responses
    public class PackageDto
    {
        public Guid Id { get; set; }
        public string TrackingNumber { get; set; } = default!;
        public string SenderName { get; set; } = default!;
        public string SenderAddress { get; set; } = default!;
        public string SenderPhone { get; set; } = default!;
        public string RecipientName { get; set; } = default!;
        public string RecipientAddress { get; set; } = default!;
        public string RecipientPhone { get; set; } = default!;
        public PackageStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<StatusHistoryDto> StatusHistory { get; set; } = new();
    }

    // Data Transfer Object for StatusHistory entity
    public class StatusHistoryDto
    {
        public Guid Id { get; set; }
        public PackageStatus Status { get; set; }
        public DateTime ChangedAt { get; set; }
        public string? Description { get; set; }
    }
}