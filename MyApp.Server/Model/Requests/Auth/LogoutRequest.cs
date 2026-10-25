namespace MyApp.Server.Model.Requests.Auth;

public class LogoutRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
