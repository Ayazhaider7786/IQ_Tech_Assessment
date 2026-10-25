using Mapster;
using Microsoft.Extensions.Options;
using MyApp.Services.Model.SeedData;

namespace MyApp.Services.Services.SeedData;

public interface ISeedDataService
{
    IReadOnlyList<SeedUserModel> GetSeedUsers();
}

public class SeedDataService(IOptions<SeedDataOptions> seedDataOptions) : ISeedDataService
{
    private readonly SeedDataOptions options = seedDataOptions.Value;

    public IReadOnlyList<SeedUserModel> GetSeedUsers() =>
        [.. options.Users.Select(user => user.Adapt<SeedUserModel>())];
}
