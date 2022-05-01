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

  const [rootPackage, subPackage] = specificImportPath.split('/');

  if (nodeModuleName === '@rimbu') {
    // const package = require(`../packages/${rootPackage}/package.json`);
    // const name = package.name;

    if (subPackage) {
      return replaceImportArgument(
        parsedImportExportStatement,
        `${url}/${rootPackage}/${subPackage}/index.ts`
      );
    }

    return replaceImportArgument(
      parsedImportExportStatement,
      `${url}/${rootPackage}/mod.ts`
    );
  }

  return undefined;
});
