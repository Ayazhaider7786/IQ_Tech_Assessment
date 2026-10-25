using Microsoft.Extensions.Logging;
using MyApp.SeedData.Seeders;

namespace MyApp.SeedData;

public class DatabaseSeeder(RoleSeeder roleSeeder, UserSeeder userSeeder, ILogger<DatabaseSeeder> logger)
{
    public async Task SeedAsync()
    {
        try
        {
            await roleSeeder.SeedAsync();
            await userSeeder.SeedAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Seeding failed — the database may not be migrated yet.");
        }
    }
}
