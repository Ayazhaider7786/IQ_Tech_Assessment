using Mapster;
using Microsoft.EntityFrameworkCore;
using MyApp.Data.Abstractions;
using MyApp.Data.Data;
using MyApp.Data.Entities;
using MyApp.Services.Model.Tasks;

namespace MyApp.Services.Services.Tasks;

public interface ITaskService
{
    Task<IReadOnlyList<TaskModel>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TaskModel> CreateAsync(CreateTaskModel model, CancellationToken cancellationToken = default);

    Task<bool> UpdateAsync(Guid taskId, UpdateTaskModel model, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid taskId, CancellationToken cancellationToken = default);
}

public class TaskService(ApplicationDbContext dbContext, ICurrentUserProvider currentUserProvider) : ITaskService
{
    public async Task<IReadOnlyList<TaskModel>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var tasks = await dbContext.Tasks
            .AsNoTracking()
            .Where(task => task.UserId == currentUserProvider.UserId && task.IsActive)
            .OrderByDescending(task => task.CreatedAt)
            .ToListAsync(cancellationToken);

        return [.. tasks.Select(task => task.Adapt<TaskModel>())];
    }

    public async Task<TaskModel> CreateAsync(CreateTaskModel model, CancellationToken cancellationToken = default)
    {
        var task = model.Adapt<TaskItem>();
        task.UserId = currentUserProvider.UserId!.Value;

        dbContext.Tasks.Add(task);
        await dbContext.SaveChangesAsync(cancellationToken);

        return task.Adapt<TaskModel>();
    }

    public async Task<bool> UpdateAsync(Guid taskId, UpdateTaskModel model, CancellationToken cancellationToken = default)
    {
        var task = await dbContext.Tasks
            .SingleOrDefaultAsync(
                t => t.Id == taskId && t.UserId == currentUserProvider.UserId && t.IsActive,
                cancellationToken);

        if (task is null)
        {
            return false;
        }

        task.Title = model.Title;
        task.Description = model.Description;
        task.IsCompleted = model.IsCompleted;

        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var task = await dbContext.Tasks
            .SingleOrDefaultAsync(
                t => t.Id == taskId && t.UserId == currentUserProvider.UserId && t.IsActive,
                cancellationToken);

        if (task is null)
        {
            return false;
        }

        task.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
