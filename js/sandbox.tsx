import React from 'react';

export interface SandBoxProps {
  path: string;
}

const defaultOptions = {
  previewwindow: 'console',
  view: 'split',
  editorsize: '60',
  codemirror: '1',
  moduleview: '1',
};

function convertParams(params: Record<string, string>) {
  let result = '';
  let sep = '';

  for (const key in params) {
    result += `${sep}${key}=${params[key]}`;
    sep = '&';
  }

  if (result === '') return '';
  return `?${result}`;
}

export function SandBox(props: SandBoxProps) {
  const params = {
    ...defaultOptions,
    module: `/src/${props.path}`,
  };

  const paramString = convertParams(params);

  const embedUrl = `https://codesandbox.io/embed/github/vitoke/rimbu-sandbox/tree/main${paramString}`;
  const openUrl = `https://codesandbox.io/s/github/vitoke/rimbu-sandbox/tree/main${paramString}`;

  return (
    <>
      <a
        target="_blank"
        className="button button--secondary"
        href={openUrl}
        style={{ marginBottom: 10 }}
      >
        Open file below in new window with full type-check
      </a>
      <iframe
        src={embedUrl}
        className="codesandbox-iframe"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
      ></iframe>
    </>
  );
}
