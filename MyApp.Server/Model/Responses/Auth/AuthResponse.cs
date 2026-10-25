namespace MyApp.Server.Model.Responses.Auth;

public class AuthResponse
{
    public UserResponse User { get; set; } = new();

    public string AccessToken { get; set; } = string.Empty;

    public DateTime AccessTokenExpiresAt { get; set; }

    public string RefreshToken { get; set; } = string.Empty;
}
