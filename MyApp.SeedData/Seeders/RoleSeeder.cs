using Microsoft.AspNetCore.Identity;
using MyApp.Data.Constants;
using MyApp.Data.Entities;

namespace MyApp.SeedData.Seeders;

public class RoleSeeder(RoleManager<ApplicationRole> roleManager)
{
    public async Task SeedAsync()
    {
        foreach (var roleName in RoleNames.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole { Name = roleName });
            }
        }
    }
}
