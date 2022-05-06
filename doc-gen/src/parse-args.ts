import { parse } from '@std/flags/mod.ts';

import { version } from '~/version.ts';

const title = `\nRimbu Doc-Gen v${version}\n`;

export function showVersion() {
  console.log(title);
}

function showHelp() {
  console.log(`${title}
An API documentation generator developed specifically for Rimbu.

Example usage:
  deno run --import-map import_map.json --allow-read --allow-write --no-check src/main.js -i <input> -o <output>

Options:
  -i, --input: the input directory containing the Api Extractor json files
  -o, --output: the output directory where to write the .mdx files
  -h, --help: show help
  -v, --version: show version
`);
}

export function parseArgs() {
  const args = parse(Deno.args, {
    alias: {
      h: 'help',
      i: 'input',
      o: 'output',
      v: 'version',
    },
    string: ['input', 'output'],
    boolean: ['help'],
    unknown: (name) => {
      showVersion();
      console.log(`error: unknown flag ${name}\n`);
      console.log(`Run with -h or --help for help\n`);
      Deno.exit(1);
    },
  });

  if (args.help) {
    showHelp();
    Deno.exit(0);
  }

  return args;
}
