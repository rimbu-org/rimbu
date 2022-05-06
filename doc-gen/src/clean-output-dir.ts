export function cleanOutputDir(output: string) {
  console.log(`cleaning ${output}`);
  try {
    const outputDir = Deno.readDirSync(output);

    for (const item of outputDir) {
      if (item.isDirectory) {
        Deno.removeSync(`${output}/${item.name}`, { recursive: true });
      }
    }
  } catch {}

  try {
    Deno.mkdirSync(output, { recursive: true });
  } catch {}
}
