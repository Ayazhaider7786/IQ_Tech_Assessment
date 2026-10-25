namespace MyApp.Server.Model.Responses.Auth;

public class UserResponse
{
    public Guid Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public IReadOnlyList<string> Roles { get; set; } = [];
}
