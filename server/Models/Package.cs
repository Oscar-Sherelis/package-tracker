using System.ComponentModel.DataAnnotations;
using Server.Models.Enums;

namespace Server.Models
{
    public class Package
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(20)]
        public string TrackingNumber { get; set; } = default!;

        // Sender Info
        [Required, MaxLength(100)]
        public string SenderName { get; set; } = default!;

        [Required, MaxLength(200)]
        public string SenderAddress { get; set; } = default!;

        [Required, Phone, MaxLength(20)]
        public string SenderPhone { get; set; } = default!;

        // Recipient Info
        [Required, MaxLength(100)]
        public string RecipientName { get; set; } = default!;

        [Required, MaxLength(200)]
        public string RecipientAddress { get; set; } = default!;

        [Required, Phone, MaxLength(20)]
        public string RecipientPhone { get; set; } = default!;

        public PackageStatus Status { get; set; } = PackageStatus.Created;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<StatusHistory> History { get; set; } = new List<StatusHistory>();
    }
}
