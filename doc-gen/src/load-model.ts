import { AsyncStream } from '@rimbu/stream/mod.ts';

import { loadPackage } from '~/load-package.ts';
import { processLoadedPackages } from '~/process/loaded-package.ts';
import { Class, Interface, Namespace } from '~/doc-model.ts';

export async function loadModel(input: string) {
  const inputFiles = Deno.readDirSync(input);

  const packages = await AsyncStream.from(inputFiles)
    .collect((file, _, skip) => {
      if (!file.isFile) return skip;

      return loadPackage(input, file.name);
    })
    .toArray();

  const model = processLoadedPackages(packages);

  const inheritance = model.inheritance.build();

  function processInheritance(src: Class | Interface) {
    const connections = inheritance.getConnectionStreamFrom(
      src.canonicalReference
    );

    for (const [source, target] of connections) {
      addInheritance(source, target);
    }
  }

  function addInheritance(src: string, trg: string) {
    const source = model.items.get(src);
    const target = model.items.get(trg);

    if (!source) {
      if (!target) {
        return;
      }

      if (target.kind === 'interface') {
        target.extends.add(src);
      } else if (target.kind === 'class') {
        target.extends = src;
      }
      return;
    }

    if (!target) {
      if (source.kind === 'interface') {
        source.extends.add(trg);
      } else if (source.kind === 'class') {
        source.extends = trg;
      }

      return;
    }

    if (source.kind === 'interface') {
      if (target.kind === 'interface') {
        target.extends.add(source);
        source.implementedBy.add(target);
      } else {
        target.implements.add(source);
        source.implementedBy.add(target);
      }
    } else if (target.kind === 'class') {
      target.extends = source;
      source.extendedBy.add(target);
    }

    source.methods.forEach(([name, method]) => {
      const targetMethod = target.methods.get(name);

      if (targetMethod) {
        if (!targetMethod.sources.find((m) => m.link === method.link)) {
          targetMethod.sources.push(method);
        }
      } else {
        const sources = [...method.sources];
        if (!sources.some((s) => s.link === method.link)) {
          sources.push(method);
        }
        let doc = method.doc;
        for (const src of method.sources) {
          if (doc.brief !== 'undocumented') break;
          doc = src.doc;
        }
        target.methods.set(name, {
          ...method,
          doc,
          sources,
        });
      }
    });

    source.properties.forEach(([name, prop]) => {
      const targetProp = target.properties.get(name);

      if (targetProp) {
        if (!targetProp.sources.find((p) => p.link === prop.link)) {
          targetProp.sources.push(prop);
        }
      } else {
        const sources = [...prop.sources];
        if (!sources.some((s) => s.link === prop.link)) {
          sources.push(prop);
        }
        let description = prop.description;
        for (const src of prop.sources) {
          if (description !== 'undocumented') break;
          description = src.description;
        }

        target.properties.set(name, {
          ...prop,
          description,
          sources,
        });
      }
    });
  }

  // process the roots first
  for (const ref of model.roots) {
    const item = model.items.get(ref)!;
    processInheritance(item);
  }

  // repeat a couple of times, should be a beter way to traverse inheritance tree
  for (let i = 0; i <= 4; i++) {
    model.items.forEach(([, item]) => {
      processInheritance(item);
    });
  }

  function addVarsToNamespace(ns: Namespace) {
    ns.variables.build().forEach(([name, variable]) => {
      const targetNs = ns.namespaces.get(name);

      if (targetNs) {
        const varType = model.items.get(variable.typeRef!);

        if (varType?.kind === 'interface' || varType?.kind === 'class') {
          ns.variables.removeKey(name);
          varType.methods.forEach(([mName, method]) => {
            targetNs.methods.set(mName, method);
          });
        }
      }
    });
  }

  model.packages.forEach(([, pkg]) => {
    addVarsToNamespace(pkg.namespace);
  });

  return model;
}
