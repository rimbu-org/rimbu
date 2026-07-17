import { useState, lazy, Suspense } from 'react';

/**
 * Small hydrated control rendered beneath a static code block. It shows a Run
 * button and, when clicked, lazy-loads and expands the Sandpack player in place.
 * The heavy Sandpack bundle is a separate chunk fetched only on Run.
 */
const SandpackPlayer = lazy(() => import('./SandpackPlayer.js'));

export interface RunExampleControlProps {
  code: string;
  packages?: string[];
  typeChecks?: boolean;
}

export default function RunExampleControl({
  code,
  packages = [],
  typeChecks = true,
}: RunExampleControlProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rimbu-runnable__control">
      <div className="rimbu-runnable__toolbar">
        <button
          type="button"
          className="rimbu-runnable__btn rimbu-runnable__btn--run"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '▨ Hide' : '▶ Run'}
        </button>
        {!typeChecks && (
          <span
            className="rimbu-runnable__warn"
            title="This example did not pass the type-check gate and may not run correctly."
          >
            ⚠ may not compile
          </span>
        )}
      </div>
      {open && (
        <div className="rimbu-runnable__player">
          <Suspense
            fallback={<div className="rimbu-runnable__loading">Loading playground…</div>}
          >
            <SandpackPlayer code={code} packages={packages} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
