using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Server.Model.Requests.Tasks;
using MyApp.Server.Model.Responses.Tasks;
using MyApp.Services.Model.Tasks;
using MyApp.Services.Services.Tasks;

namespace MyApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class TasksController(ITaskService taskService, ILogger<TasksController> logger) : ControllerBase
{
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(List<TaskResponse>), StatusCodes.Status200OK)]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            logger.LogInformation("Fetching tasks for the current user.");
            var tasks = await taskService.GetAllAsync();
            return Ok(tasks.Adapt<List<TaskResponse>>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while fetching tasks.");
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        try
        {
            logger.LogInformation("Creating a task titled {Title}.", request.Title);
            var model = request.Adapt<CreateTaskModel>();
            var task = await taskService.CreateAsync(model);
            return Ok(task.Adapt<TaskResponse>());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while creating a task.");
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [HttpPut("{taskId:guid}")]
    public async Task<IActionResult> Update(Guid taskId, [FromBody] UpdateTaskRequest request)
    {
        try
        {
            if (taskId == Guid.Empty)
            {
                logger.LogWarning("Invalid task ID supplied for update.");
                return Problem(detail: "Task ID must be provided.", statusCode: StatusCodes.Status400BadRequest);
            }

            logger.LogInformation("Updating task {TaskId}.", taskId);
            var model = request.Adapt<UpdateTaskModel>();
            var updated = await taskService.UpdateAsync(taskId, model);

            if (!updated)
            {
                logger.LogWarning("Task {TaskId} was not found.", taskId);
                return Problem(detail: $"Task with ID {taskId} was not found.", statusCode: StatusCodes.Status404NotFound);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while updating task {TaskId}.", taskId);
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ObjectResult), StatusCodes.Status404NotFound)]
    [HttpDelete("{taskId:guid}")]
    public async Task<IActionResult> Delete(Guid taskId)
    {
        try
        {
            if (taskId == Guid.Empty)
            {
                logger.LogWarning("Invalid task ID supplied for delete.");
                return Problem(detail: "Task ID must be provided.", statusCode: StatusCodes.Status400BadRequest);
            }

            logger.LogInformation("Deleting task {TaskId}.", taskId);
            var deleted = await taskService.DeleteAsync(taskId);

            if (!deleted)
            {
                logger.LogWarning("Task {TaskId} was not found.", taskId);
                return Problem(detail: $"Task with ID {taskId} was not found.", statusCode: StatusCodes.Status404NotFound);
            }

            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting task {TaskId}.", taskId);
            return Problem(detail: "An unexpected error occurred.", statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
