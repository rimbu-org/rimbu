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
      {/*
        SandpackLayout is a flex row by default (editor left, console right).
        Force a column so the console sits *below* the editor. In a column the
        children have no intrinsic height and collapse, so give each an explicit
        height (editor ~10 lines, console ~3 lines).
      */}
      <SandpackLayout style={{ flexDirection: 'column' }}>
        <SandpackCodeEditor
          showLineNumbers
          showRunButton
          wrapContent
          style={{ width: '100%', height: '200px' }}
        />
        {/*
          `standalone` makes the console mount its own Sandpack client (iframe),
          which runs the bundler and evaluates the code. Without it, the console
          only listens to a SandpackPreview — and since Rimbu examples are
          console-only (no UI to preview), we'd otherwise get an empty console.
        */}
        <SandpackConsole
          standalone
          showHeader
          showSyntaxError
          resetOnPreviewRestart
          style={{ width: '100%', height: '80px' }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
