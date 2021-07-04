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

const urlBase = '..';

makeThisModuleAnExecutableReplacer(async (args) => {
  const { parsedImportExportStatement, destDirPath } = args;
  const { nodeModuleName, specificImportPath } =
    parsedImportExportStatement.parsedArgument;

  // we need to find the file folder level to apply a relative path
  const countSlashes = (destDirPath.match(/\//g) ?? []).length;

  let url = urlBase;

  for (let i = 0; i < countSlashes; i++) {
    url = `${url}/..`;
  }

  if (nodeModuleName === '@rimbu') {
    // const package = require(`../packages/${specificImportPath}/package.json`);
    // const { version } = package;

    if (specificImportPath === 'core') {
      return replaceImportArgument(
        parsedImportExportStatement,
        `${url}/mod.ts`
      );
    }

    return replaceImportArgument(
      parsedImportExportStatement,
      `${url}/${specificImportPath}/mod.ts`
    );
  }

  return undefined;
});
