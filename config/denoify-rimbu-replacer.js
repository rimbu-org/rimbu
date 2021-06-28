const {
  makeThisModuleAnExecutableReplacer,
  ParsedImportExportStatement,
} = require('denoify');

const replaceImportArgument = (parsedImportExportStatement, url) => {
  return ParsedImportExportStatement.stringify({
    ...parsedImportExportStatement,
    parsedArgument: {
      type: 'URL',
      url,
    },
  });
};

const urlBase = 'https://deno.land/x/rimbu';

makeThisModuleAnExecutableReplacer(async ({ parsedImportExportStatement }) => {
  const { nodeModuleName, specificImportPath } =
    parsedImportExportStatement.parsedArgument;

  if (nodeModuleName === '@rimbu') {
    // const package = require(`../packages/${specificImportPath}/package.json`);
    // const { version } = package;

    if (specificImportPath === 'core') {
      return replaceImportArgument(
        parsedImportExportStatement,
        `${urlBase}/mod.ts`
      );
    }

    return replaceImportArgument(
      parsedImportExportStatement,
      `${urlBase}/${specificImportPath}/mod.ts`
    );
  }

  return undefined;
});
