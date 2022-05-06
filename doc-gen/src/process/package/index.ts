import { LoadedPackage } from '~/load-package.ts';
import { Model, Package } from '~/doc-model.ts';
import { canonicalToSlug } from '~/utils.ts';

import { processNamespaceLike } from '../common/namespace-like.ts';
import { parseDocComment } from '../common/parse-doc-comment.ts';

export function processPackage(source: LoadedPackage, model: Model) {
  const entryPoint = source.apiPackage.members[0];

  if (entryPoint.kind !== 'EntryPoint') return undefined;

  const result: Package = {
    kind: 'package',
    slug: canonicalToSlug(entryPoint.canonicalReference),
    id: source.id,
    name: source.name,
    rootPackage: source.rootPackage,
    subPackage: source.subPackage,
    namespace: processNamespaceLike('', entryPoint, source.subPackage, model),
  };

  const doc = parseDocComment(source.apiPackage.docComment);

  result.namespace.description = doc.brief;
  result.namespace.docBlocks = doc.other;

  model.packages.set(source.id, result);
}
