import { writeOutput } from '~/write-output.ts';
import { loadModel } from '~/load-model.ts';
import { parseArgs, showVersion } from '~/parse-args.ts';
import { cleanOutputDir } from '~/clean-output-dir.ts';

const { input, output } = parseArgs();

showVersion();

cleanOutputDir(output);

const model = await loadModel(input);

writeOutput(output, model);
