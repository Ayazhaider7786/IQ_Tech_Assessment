using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MyApp.Data.Abstractions;
using MyApp.Data.Entities;
using MyApp.Data.Entities.Common;

namespace MyApp.Data.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentUserProvider currentUser)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options)
{
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasOne(token => token.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(token => token.TokenHash).IsUnique();
            entity.HasIndex(token => token.UserId);
        });
    }

    // Override the two-argument overloads, not the convenience ones: every other
    // SaveChanges signature funnels into these, so nothing can bypass the stamp.
    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyAuditInformation();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ApplyAuditInformation();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyAuditInformation()
    {
        var timestamp = DateTime.UtcNow;
        var userId = currentUser.UserId;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = timestamp;
                entry.Entity.CreatedBy = userId;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = timestamp;
                entry.Entity.UpdatedBy = userId;
            }
        }
    }
}
