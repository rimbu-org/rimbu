import { Stream } from '@rimbu/stream/mod.ts';

import { Method } from '~/doc-model.ts';
import { link } from '~/utils.ts';

import { generateTypeParams } from './type-parameters.ts';

export function genMethod(source: Method) {
  return `\
<details>
  <summary>

### \`${source.name}\`

${source.doc.brief}

  </summary>

#### Definition${source.overloads.length > 1 ? 's' : ''}

${Stream.from(source.overloads).join({
  valueToString: (o) => `\
<code>

${o.codeTokens()}

</code>`,
  sep: '\n',
})}

${generateTypeParams(source.overloads[0].typeParams, '####')}

${Stream.from(source.overloads[0].params).join({
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
${Stream.from(source.doc.other).join({
  valueToString: ([tag, text]) => `:::note ${tag}

${text}

:::
`,
})}
${Stream.from(source.sources).join({
  valueToString: (v) => link(`${v.ownerName}.${v.name}`, v.link),
  start: `\
#### Overrides

`,
  end: '\n',
  sep: ', ',
  ifEmpty: '',
})}\

</details>
`;
}
