import { Stream } from '@rimbu/stream/mod.ts';

import { Function } from '~/doc-model.ts';

import { generateTypeParams } from './type-parameters.ts';

export function genFunction(source: Function) {
  return `\
<details>
  <summary>

### \`${source.name}\`

${source.description}

  </summary>

#### Definition

<code>

${source.codeTokens()}

</code>

${generateTypeParams(source.typeParams)}

${Stream.from(source.params).join({
  valueToString: ({ name, description, type }) =>
    `| \`${name}\` | ${type()} | ${description} |`,
  start: `\
#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
`,
  sep: '\n',
  end: '\n\n',
  ifEmpty: '',
})}
${Stream.from(source.docBlocks).join({
  valueToString: ([tag, text]) => `:::note ${tag}

${text}

:::
`,
})}

</details>
`;
}
