import { SortedMap } from '@rimbu/sorted/map/index.ts';
import { ArrowGraphHashed } from '@rimbu/graph/mod.ts';

import { LoadedPackage } from '~/load-package.ts';
import { Model } from '~/doc-model.ts';
import { canonicalToSlug } from '~/utils.ts';

import { processNamespaceLike } from './common/namespace-like.ts';
import { parseDocComment } from './common/parse-doc-comment.ts';

export function processLoadedPackages(packages: LoadedPackage[]) {
  const model: Model = {
    packages: SortedMap.builder(),
    items: SortedMap.builder(),
    roots: new Set(),
    namespaces: SortedMap.builder(),
    inheritance: ArrowGraphHashed.builder<string>(),
    slugs: SortedMap.builder(),
  };

  for (const pkg of packages) {
    const entryPoint = pkg.apiPackage.members[0];

    if (entryPoint.kind !== 'EntryPoint') {
      console.log('no entrypoint: ', pkg.name);
      continue;
    }

    const ns = processNamespaceLike('', entryPoint, pkg.subPackage, model);

    if (pkg.apiPackage.docComment) {
      const doc = parseDocComment(pkg.apiPackage.docComment);
      ns.description = doc.brief;
      ns.docBlocks = doc.other;
    }

    model.packages.set(pkg.id, {
      kind: 'package',
      slug: canonicalToSlug(pkg.id),
      id: pkg.id,
      name: pkg.name,
      rootPackage: pkg.rootPackage,
      subPackage: pkg.subPackage,
      namespace: ns,
    });
  }

  return model;
}
