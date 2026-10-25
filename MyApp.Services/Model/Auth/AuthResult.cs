namespace MyApp.Services.Model.Auth;

public class AuthResult
{
    public bool Succeeded { get; set; }

    public IReadOnlyList<string> Errors { get; set; } = [];

    public UserModel? User { get; set; }

    public string? AccessToken { get; set; }

    public DateTime? AccessTokenExpiresAt { get; set; }

    public string? RefreshToken { get; set; }

    public static AuthResult Fail(params string[] errors) => new() { Succeeded = false, Errors = errors };

    public static AuthResult Success(UserModel user, string accessToken, DateTime accessTokenExpiresAt, string refreshToken) =>
        new()
        {
            Succeeded = true,
            User = user,
            AccessToken = accessToken,
            AccessTokenExpiresAt = accessTokenExpiresAt,
            RefreshToken = refreshToken,
        };
}
