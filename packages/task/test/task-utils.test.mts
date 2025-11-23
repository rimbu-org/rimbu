import { Task } from '@rimbu/task';
import { taskify } from '@rimbu/task/ops';

describe(taskify.name, () => {
  it('should create a task that calls the original function with an AbortSignal', async () => {
    const mockFetch = vi.fn(
      (url: string, options: { signal?: AbortSignal }) => {
        return `Fetched from ${url} with signal: ${
          options.signal ? 'present' : 'absent'
        }`;
      }
    );

    const fetchTask = taskify(mockFetch, 1);

    const result = await Task.launch(fetchTask, {
      args: ['http://example.com', {}],
    }).join();

    expect(result).toBe('Fetched from http://example.com with signal: present');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://example.com',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('should cancel the operation when the task context is cancelled', async () => {
    const mockFetch = vi.fn(
      (url: string, options: { signal?: AbortSignal }) => {
        return new Promise<string>((resolve, reject) => {
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new Error('Aborted'));
            });
          }
          // Simulate a long-running operation
          setTimeout(() => {
            resolve(`Fetched from ${url}`);
          }, 1000);
        });
      }
    );

    const fetchTask = taskify(mockFetch, 1);

    const job = Task.launch(fetchTask, { args: ['http://example.com', {}] });

    // Cancel the task after a short delay
    setTimeout(() => {
      job.cancel();
    }, 10);

    await expect(job.join()).rejects.toThrow('Aborted');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://example.com',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    );
  });

  it('cancels the task when an abort signal is passed and triggered', async () => {
    const mockFetch = vi.fn(
      (url: string, options: { signal?: AbortSignal }) => {
        return new Promise<string>((resolve, reject) => {
          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new Error('Aborted via external signal'));
            });
          }
          // Simulate a long-running operation
          setTimeout(() => {
            resolve(`Fetched from ${url}`);
          }, 1000);
        });
      }
    );

    const fetchTask = taskify(mockFetch, 1);

    const abortController = new AbortController();

    const job = Task.launch(fetchTask, {
      args: ['http://example.com', { signal: abortController.signal }],
    });

    // Trigger the abort signal after a short delay
    setTimeout(() => {
      abortController.abort();
    }, 10);

    await expect(job.join()).rejects.toThrow('Aborted via external signal');
  });
});
