import fs from 'fs';
import path from 'path';

const srcDir = `./src`;
const destDir = `./_deno_prepare/src`;

function* traverse(src) {
  const files = fs.readdirSync(src);

  for (const file of files) {
    const fullSrcPath = path.join(src, file);

    if (fs.statSync(fullSrcPath).isDirectory()) {
      yield* traverse(path.join(src, file));
    } else {
      yield path.join(src, file);
    }
  }
}

try {
  fs.rmSync(destDir, { recursive: true, force: true });

  fs.mkdirSync(destDir, { force: true, recursive: true });

  const srcLen = srcDir.length;

  for (const file of traverse(srcDir)) {
    if (file.endsWith('.mts')) {
      const relativePath = file.slice(srcLen - 1);

      const fullDestPath = path.join(
        destDir,
        relativePath.replace('.mts', '.ts')
      );

      try {
        fs.mkdirSync(path.dirname(fullDestPath), {
          force: true,
          recursive: true,
        });
      } catch {
        //
      }

      const contents = fs.readFileSync(file, { encoding: 'utf-8' });
      // This was needed for import maps, but they have been removed.
      // const result = contents.replaceAll(/#(\w+)/g, '@rimbu/$1');

      fs.writeFileSync(fullDestPath, contents, { encoding: 'utf-8' });
      //   fs.copyFileSync(file, fullDestPath);
    }
  }
} catch (err) {
  console.error(err);
}
