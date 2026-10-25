using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using MyApp.Data.Abstractions;

namespace MyApp.Services.Services.Auth;

public class CurrentUserProvider(IHttpContextAccessor httpContextAccessor) : ICurrentUserProvider
{
    public Guid? UserId
    {
        get
        {
            var value = httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out var userId) ? userId : null;
        }
    }
}
