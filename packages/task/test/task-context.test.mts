import { Task } from '@rimbu/task';

describe('Task.Context', () => {
  it('correctly maintains context values and parent child relation for launch', async () => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
    expect([...Task.rootContext.children]).toEqual([]);

    await Task.launch(async (context) => {
      expect(context.parent).toBe(Task.rootContext);
      expect(context.hasChildren).toBe(false);
      expect(context.isCancelled).toBe(false);
      expect([...context.children]).toEqual([]);

      expect(Task.rootContext.hasChildren).toBe(true);
      expect(Task.rootContext.isCancelled).toBe(false);
      expect([...Task.rootContext.children]).toEqual([context]);
    }).join();

    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
    expect([...Task.rootContext.children]).toEqual([]);
  });
});
