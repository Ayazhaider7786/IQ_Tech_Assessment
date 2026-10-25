using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Server.Model.Requests.Auth;
using MyApp.Server.Model.Responses.Auth;
using MyApp.Services.Model.Auth;
using MyApp.Services.Services.Auth;

namespace MyApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    [AllowAnonymous]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            logger.LogInformation("Registering new user with email {Email}.", request.Email);

            var model = request.Adapt<RegisterModel>();
            var result = await authService.RegisterAsync(model);

            if (!result.Succeeded)
            {
                logger.LogWarning("Registration failed for {Email}: {Errors}", request.Email, string.Join("; ", result.Errors));
                return BadRequest(new { errors = result.Errors });
            }

            logger.LogInformation("User {Email} registered successfully.", request.Email);
            return Ok(result.Adapt<AuthResponse>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while registering {Email}.", request.Email);
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [AllowAnonymous]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            logger.LogInformation("Login attempt for {Email}.", request.Email);

            var model = request.Adapt<LoginModel>();
            var result = await authService.LoginAsync(model);

            if (!result.Succeeded)
            {
                logger.LogWarning("Login failed for {Email}.", request.Email);
                return Unauthorized(new { errors = result.Errors });
            }

            logger.LogInformation("User {Email} logged in successfully.", request.Email);
            return Ok(result.Adapt<AuthResponse>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while logging in {Email}.", request.Email);
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [AllowAnonymous]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                logger.LogWarning("Refresh attempted with an empty refresh token.");
                return Problem(detail: "A refresh token must be provided.", statusCode: StatusCodes.Status400BadRequest);
            }

            logger.LogInformation("Refreshing access token.");

            var model = request.Adapt<RefreshModel>();
            var result = await authService.RefreshAsync(model);

            if (!result.Succeeded)
            {
                logger.LogWarning("Refresh token rejected.");
                return Problem(
                    detail: result.Errors.FirstOrDefault() ?? "Invalid or expired refresh token.",
                    statusCode: StatusCodes.Status401Unauthorized);
            }

            return Ok(result.Adapt<AuthResponse>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while refreshing the access token.");
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                logger.LogWarning("Logout attempted with an empty refresh token.");
                return Problem(detail: "A refresh token must be provided.", statusCode: StatusCodes.Status400BadRequest);
            }

            logger.LogInformation("Logging out — revoking refresh token.");

            var model = request.Adapt<LogoutModel>();
            var revoked = await authService.LogoutAsync(model);

            if (!revoked)
            {
                logger.LogWarning("Logout attempted with an unknown or already-revoked refresh token.");
                return Problem(detail: "The refresh token was not found or already revoked.", statusCode: StatusCodes.Status404NotFound);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while logging out.");
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            logger.LogInformation("Fetching the current user.");

            var user = await authService.GetCurrentUserAsync();
            if (user is null)
            {
                logger.LogWarning("Current user could not be resolved from the access token.");
                return Problem(detail: "User not found.", statusCode: StatusCodes.Status404NotFound);
            }

            return Ok(user.Adapt<UserResponse>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while fetching the current user.");
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
