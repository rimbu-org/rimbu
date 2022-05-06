import { Stream } from '@rimbu/stream/mod.ts';

import { TypeAlias } from '~/doc-model.ts';
import { link } from '~/utils.ts';

export function generateTypeAlias(source: TypeAlias) {
  const result = `\
---
title: '${source.name}'
slug: '${source.slug}'
---

# \`type ${source.nameWithParams}\`

${source.description}

${
  source.companion
    ? `**Companion namespace:** ${link(
        source.companion.name,
        source.companion.slug
      )}`
    : ''
}

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
