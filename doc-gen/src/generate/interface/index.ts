import { Stream } from '@rimbu/stream/mod.ts';

import { Interface } from '~/doc-model.ts';
import { link } from '~/utils.ts';

import { genMethod } from '../common/method.ts';
import { genProperty } from '../common/property.ts';
import { generateTypeParams } from '../common/type-parameters.ts';

export function generateInterface(source: Interface) {
  const result = `\
---
title: '${source.nameWithParams}'
slug: '${source.slug}'
---

# \`interface ${source.nameWithParams}\`

${source.description}

${
  source.companion
    ? `**Companion namespace:** ${link(
        source.companion.name,
        source.companion.slug
      )}`
    : ''
}

${Stream.from(source.extends).join({
  valueToString: (base) => {
    if (typeof base === 'string') {
      return base;
    }

    return link(`\`${base.nameWithParams}\``, base.slug);
  },
  start: `\
**Extends:** `,
  sep: ', ',
  end: '\n\n',
  ifEmpty: '',
})}\
${Stream.from(source.implementedBy).join({
  valueToString: (base) => link(`\`${base.nameWithParams}\``, base.slug),
  start: `\
**Implemented by:** `,
  sep: ', ',
  end: '\n\n',
  ifEmpty: '',
})}\
${generateTypeParams(source.typeParameters)}
${Stream.from(source.docBlocks).join({
  valueToString: ([tag, text]) => `:::note ${tag}

${text}

:::
`,
})}
${source.properties
  .buildMapValues(genProperty)
  .streamValues()
  .join({
    start: `\
## Properties

`,
    sep: '\n',
    end: '\n\n',
    ifEmpty: '',
  })}\
${source.methods
  .buildMapValues(genMethod)
  .streamValues()
  .join({
    start: `\
## Methods

`,
    sep: '\n',
    end: '\n\n',
    ifEmpty: '',
  })}\
`;

  return result;
}
