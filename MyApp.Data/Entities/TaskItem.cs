using MyApp.Data.Entities.Common;

namespace MyApp.Data.Entities;

public class TaskItem : AuditableEntity
{
    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsCompleted { get; set; }
}
