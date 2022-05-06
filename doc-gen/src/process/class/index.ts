import { Stream } from '@rimbu/stream/mod.ts';
import { SortedMap } from '@rimbu/sorted/map/index.ts';

import { ApiClass } from '~/json-model/api.ts';
import { Model, Class } from '~/doc-model.ts';
import {
  canonicalToSlug,
  findTokenRef,
  getCodeTokenWithLinks,
  wrap,
  getTokenRange,
} from '~/utils.ts';

import { parseDocComment } from '../common/parse-doc-comment.ts';
import {
  processProperty,
  processMethod,
} from '../common/class-or-interface-member.ts';

export function processClass(
  name: string,
  source: ApiClass,
  model: Model,
  subPackage = ''
): Class {
  const doc = parseDocComment(source.docComment);

  let isRoot = true;

  if (source.extendsTokenRange) {
    const ref = findTokenRef(source.excerptTokens, source.extendsTokenRange);
    if (ref !== undefined) {
      model.inheritance.connect(ref, source.canonicalReference);
      isRoot = false;
    }
  }
  for (const range of source.implementsTokenRanges) {
    const ref = findTokenRef(source.excerptTokens, range);
    if (ref !== undefined) {
      model.inheritance.connect(ref, source.canonicalReference);
      isRoot = false;
    }
  }

  if (isRoot) {
    model.roots.add(source.canonicalReference);
  }

  const typeParams = Stream.from(source.typeParameters).join({
    valueToString: (p) => p.typeParameterName,
    start: '<',
    sep: ',',
    end: '>',
    ifEmpty: '',
  });

  const targetClass: Class = {
    kind: 'class',
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
    docBlocks: doc.other,
    methods: SortedMap.builder(),
    properties: SortedMap.builder(),
    typeParameters: [],
    implements: new Set(),
    extendedBy: new Set(),
    isAbstract: false,
  };

  for (const tparam of source.typeParameters ?? []) {
    targetClass.typeParameters.push({
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

  if (source.excerptTokens[0].text.includes(' abstract ')) {
    targetClass.isAbstract = true;
  }

  for (const member of source.members) {
    switch (member.kind) {
      case 'Method':
      case 'MethodSignature': {
        const current = targetClass.methods.get(member.name);
        const result = processMethod(
          member,
          source,
          model,
          subPackage,
          current
        );
        targetClass.methods.set(member.name, result);
        break;
      }
      case 'Property':
      case 'PropertySignature': {
        targetClass.properties.set(
          member.name,
          processProperty(member, source, subPackage, model)
        );
        break;
      }
      case 'Constructor':
        break;
      default:
        console.log(
          'unknown class member: ',
          member.kind,
          member.canonicalReference
        );
    }
  }

  return targetClass;
}
