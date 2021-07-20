export async function closeIters(
  ...iters: AsyncIterator<any>[]
): Promise<void> {
  await Promise.all(
    iters.map((i) => {
      i.return?.();
    })
  );
}
