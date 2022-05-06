import { Package } from '~/doc-model.ts';

import { generateNamespaceContents } from '../common/namespace-contents.ts';

export function generatePackage(source: Package) {
  const result = `\
---
title: '${source.name}'
slug: '${source.slug}'
---

# \`package ${source.name}\`

${generateNamespaceContents(source.namespace)}
`;

  return result;
}
