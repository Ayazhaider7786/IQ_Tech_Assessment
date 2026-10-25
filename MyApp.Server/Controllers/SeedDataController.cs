using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Server.Model.Responses.SeedData;
using MyApp.Services.Services.SeedData;

namespace MyApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class SeedDataController(
    ISeedDataService seedDataService,
    IWebHostEnvironment environment,
    ILogger<SeedDataController> logger) : ControllerBase
{
    [AllowAnonymous]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(List<SeedUserResponse>), StatusCodes.Status200OK)]
    [HttpGet("users")]
    public IActionResult GetSeedUsers()
    {
        try
        {
            if (!environment.IsDevelopment())
            {
                logger.LogWarning("Seed data endpoint requested outside Development.");
                return NotFound();
            }

            logger.LogInformation("Fetching seed users for the login screen.");

            var users = seedDataService.GetSeedUsers();
            return Ok(users.Adapt<List<SeedUserResponse>>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while fetching seed users.");
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
