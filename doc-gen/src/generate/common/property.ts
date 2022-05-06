import { Stream } from '@rimbu/stream/mod.ts';

import { Property } from '~/doc-model.ts';
import { link } from '~/utils.ts';

export function genProperty(source: Property) {
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

${Stream.from(source.docBlocks).join({
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
  ifEmpty: '',
})}\

</details>
`;
}
