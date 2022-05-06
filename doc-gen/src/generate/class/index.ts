import { Stream } from '@rimbu/stream/mod.ts';

import { Class } from '~/doc-model.ts';
import { link } from '~/utils.ts';

import { genMethod } from '../common/method.ts';
import { genProperty } from '../common/property.ts';
import { generateTypeParams } from '../common/type-parameters.ts';

export function generateClass(source: Class) {
  const result = `\
---
title: '${source.nameWithParams}'
slug: '${source.slug}'
---

# \`${source.isAbstract ? 'abstract ' : ''}class ${source.nameWithParams}\`

${source.description}
${
  typeof source.extends === 'string'
    ? `\n**Extends:** \`${source.extends}\``
    : source.extends === undefined
    ? ''
    : `\n**Extends:** ${link(
        `\`${source.extends.nameWithParams}\``,
        source.extends.slug
      )}`
}
${Stream.from(source.implements).join({
  valueToString: (base) => {
    if (typeof base === 'string') {
      return base;
    }
    return link(`\`${base.nameWithParams}\``, base.slug);
  },
  start: `
**Implements:** `,
  sep: ', ',
  end: '\n',
  ifEmpty: '',
})}
${Stream.from(source.extendedBy).join({
  valueToString: (base) => link(`\`${base.nameWithParams}\``, base.slug),
  start: `
**Extended by:** `,
  sep: ', ',
  end: '\n',
  ifEmpty: '',
})}
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
    start: `
## Methods

`,
    sep: '\n',
    end: '\n',
    ifEmpty: '',
  })}
`;

  return result;
}
