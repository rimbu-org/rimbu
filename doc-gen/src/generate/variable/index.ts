import { Stream } from '@rimbu/stream/mod.ts';

import { Variable } from '~/doc-model.ts';
import { link } from '~/utils.ts';

export function generateVariable(source: Variable) {
  const result = `\
---
title: '${source.name}'
slug: '${source.slug}'
---

# \`type ${source.name}\`

${source.description}

${Stream.from(source.docBlocks).join({
  valueToString: ([tag, text]) => `:::note ${tag}

${text}

:::
`,
})}
## Definition

${source.codeTokens()}
`;

  return result;
}
