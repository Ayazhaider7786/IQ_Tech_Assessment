using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Data.Entities;

// System-emitted record — no AuditableEntity, no duplicated audit fields. Nobody
// "creates" a refresh token by hand; it has its own lifecycle timestamps instead.
public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public DateTime IssuedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    [NotMapped]
    public bool IsActive => RevokedAt is null && ExpiresAt > DateTime.UtcNow;
}
