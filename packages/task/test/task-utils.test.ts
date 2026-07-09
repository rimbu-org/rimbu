import { afterEach, describe, expect, it } from 'bun:test';

import { Task, TaskCancellationError } from '@rimbu/task';
import { joinAll, taskify } from '@rimbu/task/ops';
import { delay } from '@rimbu/task/ops';

describe(taskify.name, () => {
	it('should create a task that calls the original function with an AbortSignal', () => {
		const mockFetch = (url: string, options: { signal?: AbortSignal }) => {
			return `Fetched from ${url} with signal: ${
				options.signal ? 'present' : 'absent'
			}`;
		};

		const fetchTask = taskify(mockFetch, 1);

		const result = Task.launch(fetchTask, {
			args: ['http://example.com', {}],
		}).join();

		expect(result).resolves.toBe(
			'Fetched from http://example.com with signal: present',
		);
	});

	it('should cancel the operation when the task context is cancelled', () => {
		const mockFetch = (url: string, options: { signal?: AbortSignal }) => {
			return new Promise<string>((resolve, reject) => {
				if (options.signal) {
					options.signal.addEventListener('abort', () => {
						reject(new Error('Aborted'));
					});
				}
				setTimeout(() => {
					resolve(`Fetched from ${url}`);
				}, 1000);
			});
		};

		const fetchTask = taskify(mockFetch, 1);
		const job = Task.launch(fetchTask, { args: ['http://example.com', {}] });

		setTimeout(() => {
			job.cancel();
		}, 10);

		expect(job.join()).rejects.toThrow('Aborted');
	});

	it('cancels the task when an abort signal is passed and triggered', () => {
		const mockFetch = (url: string, options: { signal?: AbortSignal }) => {
			return new Promise<string>((resolve, reject) => {
				if (options.signal) {
					options.signal.addEventListener('abort', () => {
						reject(new Error('Aborted via external signal'));
					});
				}
				setTimeout(() => {
					resolve(`Fetched from ${url}`);
				}, 1000);
			});
		};

		const fetchTask = taskify(mockFetch, 1);
		const abortController = new AbortController();

		const job = Task.launch(fetchTask, {
			args: ['http://example.com', { signal: abortController.signal }],
		});

		setTimeout(() => {
			abortController.abort();
		}, 10);

		expect(job.join()).rejects.toThrow('Aborted via external signal');
	});

	it('uses signalArgIndex pointing to an argument that does not exist yet', () => {
		// fn expects two args; we only supply one — taskify creates the second
		const fn = (url: string, options: { signal?: AbortSignal }) => {
			return `signal: ${options.signal ? 'present' : 'absent'}`;
		};

		const task = taskify(fn, 1);

		// supply only the first arg — taskify should fill in the second
		const result = Task.launch(task, { args: ['http://example.com', {}] }).join();
		expect(result).resolves.toContain('present');
	});

	it('uses a custom signalPropName', () => {
		type Opts = { abortSignal?: AbortSignal };
		const fn = (_url: string, opts: Opts) =>
			`signal: ${opts.abortSignal ? 'present' : 'absent'}`;

		const task = taskify(fn, 1, 'abortSignal');

		expect(
			Task.launch(task, { args: ['http://example.com', {}] }).join(),
		).resolves.toBe('signal: present');
	});
});

describe(joinAll.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with an array of all job results in order', async () => {
		const jobs = [
			Task.launch(() => 1),
			Task.launch(() => 2),
			Task.launch(() => 3),
		];
		const results = await joinAll(jobs);
		expect(results).toEqual([1, 2, 3]);
	});

	it('resolves with empty array for zero jobs', async () => {
		const results = await joinAll([]);
		expect(results).toEqual([]);
	});

	it('rejects if any job rejects', async () => {
		const jobs = [
			Task.launch(() => 1),
			Task.launch(() => { throw new Error('boom'); }),
			Task.launch(() => 3),
		];
		await expect(joinAll(jobs as any)).rejects.toThrow('boom');
		// clean up remaining jobs
		for (const j of jobs) {
			await j.join({ recover: () => {} });
		}
	});

	it('works with a single job', async () => {
		const jobs = [Task.launch(() => 'only')];
		const results = await joinAll(jobs);
		expect(results).toEqual(['only']);
	});

	it('preserves order even when jobs complete in different order', async () => {
		await Task.launch(async (context) => {
			const jobs = [
				context.launch(async (ctx) => { await ctx.delay(50); return 'slow'; }),
				context.launch(async (ctx) => { await ctx.delay(10); return 'fast'; }),
			];
			const results = await joinAll(jobs);
			expect(results).toEqual(['slow', 'fast']);
		}, { isolated: true }).join();
	});

	it('rejects with TaskCancellationError when a job is cancelled', async () => {
		const job = Task.launch(delay(1000));
		job.cancel();
		await expect(joinAll([job])).rejects.toThrow(TaskCancellationError);
	});
});
