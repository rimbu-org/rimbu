export async function closeIters(
  ...iters: (AsyncIterator<any> | undefined | null)[]
): Promise<void> {
  await Promise.all(
    iters.map((i) => {
      i?.return?.();
    })
  );
}
