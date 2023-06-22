import {
  Extractor,
  ExtractorConfig,
  ExtractorResult,
} from '@microsoft/api-extractor';

const apiExtractorJsonPath = process.argv[2];

if (apiExtractorJsonPath === undefined) {
  console.error('Should provide api extractor json config file as first param');
  process.exit(1);
}

// Needed as long as api-extractor does not have standard support for .mts files
ExtractorConfig.hasDtsFileExtension = (filePath: string): boolean => {
  const dtsRegex = /\.d\.[mc]?ts$/i;
  return dtsRegex.test(filePath);
};

// Load and parse the api-extractor.json file
const extractorConfig: ExtractorConfig =
  ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);

// Invoke API Extractor
const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
  localBuild: true,
  showVerboseMessages: true,
});

if (extractorResult.succeeded) {
  console.log(`API Extractor completed successfully`);
  process.exitCode = 0;
} else {
  console.error(
    `API Extractor completed with ${extractorResult.errorCount} errors` +
      ` and ${extractorResult.warningCount} warnings`
  );
  process.exitCode = 1;
}
