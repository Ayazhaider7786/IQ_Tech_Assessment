using Mapster;

namespace MyApp.Services.Mapping;

public class ServiceMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Register entity → service model mappings here once property names
        // differ or custom logic is needed — Mapster handles identical names
        // automatically, so nothing is registered yet.
    }
}
