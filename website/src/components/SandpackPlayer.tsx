import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackConsole,
} from '@codesandbox/sandpack-react';

export interface SandpackPlayerProps {
  code: string;
  packages: string[];
}

/**
 * The heavy Sandpack player, code-split so it is only fetched when a user runs
 * an example (see RunnableExample). Uses the vanilla TypeScript template with a
 * console layout — Rimbu examples log their output rather than rendering UI.
 */
export default function SandpackPlayer({ code, packages }: SandpackPlayerProps) {
  // Pin every referenced package to `latest` on the CDN.
  const dependencies: Record<string, string> = {};
  for (const pkg of packages) dependencies[pkg] = 'latest';

  return (
    <SandpackProvider
      template="vanilla-ts"
      theme="auto"
      customSetup={{ dependencies }}
      files={{
        '/index.ts': { code, active: true },
      }}
      options={{ recompileMode: 'delayed', recompileDelay: 500 }}
    >
      <SandpackLayout>
        <SandpackCodeEditor showLineNumbers showRunButton wrapContent />
        <SandpackConsole showHeader resetOnPreviewRestart />
      </SandpackLayout>
    </SandpackProvider>
  );
}
