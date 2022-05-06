import { dirname } from '@std/path/mod.ts';

import { canonicalToFileName, packagePath } from '~/utils.ts';
import { generateInterface } from '~/generate/interface/index.ts';
import { generateNamespace } from '~/generate/namespace/index.ts';
import { generatePackage } from '~/generate/package/index.ts';
import { generateClass } from '~/generate/class/index.ts';
import { generateTypeAlias } from '~/generate/typealias/index.ts';
import { generateVariable } from '~/generate/variable/index.ts';
import { Model, Namespace, Package } from '~/doc-model.ts';

export function writeOutput(output: string, model: Model) {
  function write(ref: string, contents: string, subPackage?: string) {
    const filename = `${output}/${canonicalToFileName(ref, subPackage)}`;

    console.log(`writing ${filename}`);
    try {
      Deno.mkdirSync(dirname(filename), { recursive: true });
    } catch {}

    Deno.writeTextFileSync(filename, contents);
  }

  function writeNamespaceOrPackageContents(source: Namespace, subPackage = '') {
    source.namespaces.forEach(([, member]) => {
      writeNamespace(member, subPackage);
    });

    source.interfaces.forEach(([, member]) => {
      write(member.canonicalReference, generateInterface(member), subPackage);
    });

    source.classes.forEach(([, member]) => {
      write(member.canonicalReference, generateClass(member), subPackage);
    });

    source.types.forEach(([, member]) => {
      write(member.canonicalReference, generateTypeAlias(member), subPackage);
    });

    source.variables.forEach(([, member]) => {
      write(member.canonicalReference, generateVariable(member), subPackage);
    });
  }

  function writeNamespace(source: Namespace, subPackage = '') {
    write(
      source.canonicalReference,
      generateNamespace(source, source.name),
      subPackage
    );

    const categoryFileName = canonicalToFileName(
      source.canonicalReference,
      subPackage
    ).replace('/index.mdx', '/_category_.json');
    Deno.writeTextFileSync(
      `${output}/${categoryFileName}`,
      JSON.stringify({
        label: `${source.name} (namespace)`,
      })
    );

    writeNamespaceOrPackageContents(source, subPackage);
  }

  function writePackage(source: Package) {
    write(source.id, generatePackage(source));

    const [pkg] = source.id.split('!');
    const categoryPath = packagePath(pkg);

    Deno.writeTextFileSync(
      `${output}/${categoryPath}/_category_.json`,
      JSON.stringify({
        label: source.name,
      })
    );

    writeNamespaceOrPackageContents(source.namespace, source.subPackage);
  }

  model.packages.forEach(([, pkg]) => {
    writePackage(pkg);
  });
}
