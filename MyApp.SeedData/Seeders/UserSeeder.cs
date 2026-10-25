using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MyApp.Data.Constants;
using MyApp.Data.Entities;
using MyApp.Services.Model.SeedData;

namespace MyApp.SeedData.Seeders;

public class UserSeeder(
    UserManager<ApplicationUser> userManager,
    IOptions<SeedDataOptions> seedDataOptions)
{
    private readonly SeedDataOptions options = seedDataOptions.Value;

    public async Task SeedAsync()
    {
        foreach (var seedUser in options.Users)
        {
            var existing = await userManager.FindByEmailAsync(seedUser.Email);
            if (existing is not null)
            {
                continue;
            }

            var user = new ApplicationUser
            {
                UserName = seedUser.Email,
                Email = seedUser.Email,
                FullName = seedUser.FullName,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
            };

            var result = await userManager.CreateAsync(user, seedUser.Password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, RoleNames.Admin);
            }
        }
    }
}
