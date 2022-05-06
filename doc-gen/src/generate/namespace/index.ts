import { Namespace } from '~/doc-model.ts';

import { generateNamespaceContents } from '../common/namespace-contents.ts';

export function generateNamespace(source: Namespace, name = source.name) {
  const result = `\
---
title: '${source.name} (namespace)'
slug: '${source.slug}'
---

# \`namespace ${name}\`

${generateNamespaceContents(source)}
`;

  return result;
}
