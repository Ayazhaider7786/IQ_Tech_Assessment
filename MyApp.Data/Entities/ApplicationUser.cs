using Microsoft.AspNetCore.Identity;

namespace MyApp.Data.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    // Own duplicate audit fields, not inherited from AuditableEntity — this type
    // already extends IdentityUser<Guid> and C# allows only one base class. Set by
    // hand in AuthService; see code-structure.md "Audit Fields & Soft Delete".
    public DateTime CreatedAt { get; set; }

    public Guid? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid? UpdatedBy { get; set; }

    public bool IsActive { get; set; } = true;

    public string FullName { get; set; } = string.Empty;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
