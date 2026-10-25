using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MyApp.Data.Abstractions;
using MyApp.Data.Constants;
using MyApp.Data.Data;
using MyApp.Data.Entities;
using MyApp.Services.Model.Auth;

namespace MyApp.Services.Services.Auth;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterModel model, CancellationToken cancellationToken = default);

    Task<AuthResult> LoginAsync(LoginModel model, CancellationToken cancellationToken = default);

    Task<AuthResult> RefreshAsync(RefreshModel model, CancellationToken cancellationToken = default);

    Task<bool> LogoutAsync(LogoutModel model, CancellationToken cancellationToken = default);

    Task<UserModel?> GetCurrentUserAsync(CancellationToken cancellationToken = default);
}

public class AuthService(
    UserManager<ApplicationUser> userManager,
    RoleManager<ApplicationRole> roleManager,
    ApplicationDbContext dbContext,
    IJwtTokenService jwtTokenService,
    ICurrentUserProvider currentUserProvider,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    private readonly JwtOptions options = jwtOptions.Value;

    public async Task<AuthResult> RegisterAsync(RegisterModel model, CancellationToken cancellationToken = default)
    {
        var existing = await userManager.FindByEmailAsync(model.Email);
        if (existing is not null)
        {
            return AuthResult.Fail("A user with this email already exists.");
        }

        var user = model.Adapt<ApplicationUser>();
        user.UserName = model.Email;
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = true;

        var createResult = await userManager.CreateAsync(user, model.Password);
        if (!createResult.Succeeded)
        {
            return AuthResult.Fail([.. createResult.Errors.Select(error => error.Description)]);
        }

        if (!await roleManager.RoleExistsAsync(RoleNames.Admin))
        {
            await roleManager.CreateAsync(new ApplicationRole { Name = RoleNames.Admin });
        }

        await userManager.AddToRoleAsync(user, RoleNames.Admin);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResult> LoginAsync(LoginModel model, CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(model.Email);
        if (user is null || !user.IsActive)
        {
            return AuthResult.Fail("Invalid email or password.");
        }

        var passwordValid = await userManager.CheckPasswordAsync(user, model.Password);
        if (!passwordValid)
        {
            return AuthResult.Fail("Invalid email or password.");
        }

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResult> RefreshAsync(RefreshModel model, CancellationToken cancellationToken = default)
    {
        var tokenHash = jwtTokenService.HashRefreshToken(model.RefreshToken);

        var storedToken = await dbContext.RefreshTokens
            .Include(token => token.User)
            .SingleOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || !storedToken.IsActive || storedToken.User is null || !storedToken.User.IsActive)
        {
            return AuthResult.Fail("Invalid or expired refresh token.");
        }

        // Redeeming a refresh token revokes it — a new one is issued below, so
        // concurrent requests can never spend the same token twice.
        storedToken.RevokedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return await IssueTokensAsync(storedToken.User, cancellationToken);
    }

    public async Task<bool> LogoutAsync(LogoutModel model, CancellationToken cancellationToken = default)
    {
        var tokenHash = jwtTokenService.HashRefreshToken(model.RefreshToken);

        var storedToken = await dbContext.RefreshTokens
            .SingleOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);

        if (storedToken is null || storedToken.RevokedAt is not null)
        {
            return false;
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<UserModel?> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        if (currentUserProvider.UserId is not Guid userId)
        {
            return null;
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null || !user.IsActive)
        {
            return null;
        }

        var roles = await userManager.GetRolesAsync(user);

        var userModel = user.Adapt<UserModel>();
        userModel.Roles = [.. roles];
        return userModel;
    }

    private async Task<AuthResult> IssueTokensAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var roles = await userManager.GetRolesAsync(user);
        var accessToken = jwtTokenService.GenerateAccessToken(user, roles);

        var refreshTokenValue = jwtTokenService.GenerateRefreshTokenValue();
        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            TokenHash = jwtTokenService.HashRefreshToken(refreshTokenValue),
            IssuedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(options.RefreshTokenDays),
        };

        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var userModel = user.Adapt<UserModel>();
        userModel.Roles = [.. roles];

        return AuthResult.Success(userModel, accessToken.Token, accessToken.ExpiresAt, refreshTokenValue);
    }
}
