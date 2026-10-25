namespace MyApp.Data.Abstractions;

public interface ICurrentUserProvider
{
    Guid? UserId { get; }
}
