import { Stream } from '@rimbu/stream/mod.ts';
import { SortedMap } from '@rimbu/sorted/map/index.ts';

import { ApiInterface } from '~/json-model/api.ts';
import { Interface, Model } from '~/doc-model.ts';
import {
  canonicalToSlug,
  findTokenRef,
  getCodeTokenWithLinks,
  wrap,
  getTokenRange,
} from '~/utils.ts';

import { parseDocComment } from '../common/parse-doc-comment.ts';
import {
  processMethod,
  processProperty,
} from '../common/class-or-interface-member.ts';

export function processInterface(
  name: string,
  source: ApiInterface,
  model: Model,
  subPackage = ''
): Interface {
  const doc = parseDocComment(source.docComment);

  const typeParams = Stream.from(source.typeParameters).join({
    valueToString: (p) => p.typeParameterName,
    start: '<',
    sep: ',',
    end: '>',
    ifEmpty: '',
  });

  const targetInterface: Interface = {
    kind: 'interface',
    nameWithParams: `${name}${typeParams}`,
    canonicalReference: source.canonicalReference,
    slug: canonicalToSlug(
      source.canonicalReference,
      undefined,
      undefined,
      subPackage
    ),
    name,
    description: doc.brief,
    typeParameters: [],
    docBlocks: doc.other,
    methods: SortedMap.builder(),
    properties: SortedMap.builder(),
    extends: new Set(),
    implementedBy: new Set(),
  };

  for (const tparam of source.typeParameters ?? []) {
    targetInterface.typeParameters.push({
      kind: 'typeparam',
      name: tparam.typeParameterName,
      description:
        doc.typeParams.get(tparam.typeParameterName) ?? 'undocumented',
      definition: `\`${tparam.typeParameterName}${getTokenRange(
        source.excerptTokens,
        tparam.constraintTokenRange
      )}${wrap(
        getTokenRange(source.excerptTokens, tparam.defaultTypeTokenRange),
        ' = ',
        ''
      )}\``,
      constraint: () =>
        getCodeTokenWithLinks(
          model,
          source.excerptTokens,
          tparam.constraintTokenRange
        ),
      defaultType: () =>
        getCodeTokenWithLinks(
          model,
          source.excerptTokens,
          tparam.defaultTypeTokenRange
        ),
    });
  }

  let isRoot = true;

  for (const range of source.extendsTokenRanges ?? []) {
    const ref = findTokenRef(source.excerptTokens, range);
    if (ref !== undefined) {
      model.inheritance.connect(ref, source.canonicalReference);
      isRoot = false;
    }
  }

  if (isRoot) {
    model.roots.add(source.canonicalReference);
  }

  for (const member of source.members) {
    switch (member.kind) {
      case 'Method':
      case 'MethodSignature': {
        const current = targetInterface.methods.get(member.name);
        const result = processMethod(
          member,
          source,
          model,
          subPackage,
          current
        );
        targetInterface.methods.set(member.name, result);
        break;
      }
      case 'Property':
      case 'PropertySignature': {
        targetInterface.properties.set(
          member.name,
          processProperty(member, source, subPackage, model)
        );
        break;
      }
      default:
        console.log(
          'unknown interface member: ',
          member.kind,
          member.canonicalReference
        );
    }
  }

  return targetInterface;
}
