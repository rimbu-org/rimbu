import fs from 'fs';
import path from 'path';

if (process.argv.length <= 2) {
  console.log(`\
bunnify: utility to generate source code from a "verbatimModuleSyntax" project that
is compatible with other frameworks or suitable for compilation to other frameworks

usage: bunnify <options>

available options:
-mode bun                 sets default values to create bun-compatible code
-mode cjs                 sets default values to create cjs-compilation compatible code
-src <folder>             (default: './src') the source path of the code
-dest <folder>            (default: './dist') the target path of the code
-fileSourceExt <ext>      (default: '.mts' )the file extension for the source files
-fileTargetExt            (default: '.mts') the file extension for the target files
-sourceImportExt          (default: '.mjs') the extension of the imports in the code
-sourceTargetExt          (default: '.mjs') the target extension of the imports in the code
-removePrivate            (default: 'false') replace private identifiers by non-private ones
`);
  process.exit(1);
}

let args = process.argv.slice(2);

let options = {};

while (args.length > 0) {
  const [option, value] = args;
  options[option.slice(1)] = value;
  args = args.slice(2);
}

if (options.mode) {
  if (options.mode === 'bun') {
    options = {
      src: './src',
      dest: './dist/bun',
      fileSourceExt: '.mts',
      fileTargetExt: '.mts',
      sourceImportExt: '.mjs',
      sourceTargetExt: '.mts',
      removePrivate: 'false',
      ...options,
    };
  } else if (options.mode === 'cjs') {
    options = {
      src: './src',
      dest: './_cjs_prepare',
      fileSourceExt: '.mts',
      fileTargetExt: '.cts',
      sourceImportExt: '.mjs',
      sourceTargetExt: '.cjs',
      removePrivate: 'true',
      ...options,
    };
  } else {
    console.log(
      'bunnify: unknown options supplied to -mode. options are `bun` or `cjs`'
    );
    process.exit(1);
  }
}

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
  fs.rmSync(options.dest, { recursive: true, force: true });

  fs.mkdirSync(options.dest, { force: true, recursive: true });

  const srcLen = options.src.length;

  for (const file of traverse(options.src)) {
    if (file.endsWith(options.fileSourceExt)) {
      const relativePath = file.slice(srcLen - 1);

      const fullDestPath = path.join(
        options.dest,
        relativePath.replace(options.fileSourceExt, options.fileTargetExt)
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
      let result = contents.replaceAll(
        options.sourceImportExt,
        options.sourceTargetExt
      );

      if (options.removePrivate === 'true') {
        result = result.replaceAll(/#(\w+)/g, '___$1');
      }

      fs.writeFileSync(fullDestPath, result, { encoding: 'utf-8' });
    }
  }
} catch (err) {
  console.error(err);
}
