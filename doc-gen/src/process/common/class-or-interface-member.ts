import {
  ApiClass,
  ApiInterface,
  ApiMethod,
  ApiMethodSignature,
  ApiProperty,
  ApiPropertySignature,
} from '~/json-model/api.ts';
import { Method, Model, Property } from '~/doc-model.ts';
import {
  getTokenRange,
  canonicalToSlug,
  getCodeTokenWithLinks,
  wrap,
} from '~/utils.ts';

import { parseDocComment } from './parse-doc-comment.ts';

export function processMethod(
  member: ApiMethod | ApiMethodSignature,
  parent: ApiClass | ApiInterface,
  model: Model,
  subPackage: string,
  current?: Method
): Method {
  const doc = parseDocComment(member.docComment);

  const result: Method = current ?? {
    kind: 'method',
    name: member.name,
    ownerName: parent.name,
    doc,
    isAbstract: member.kind === 'MethodSignature',
    sources: [],
    overloads: [],
    link: canonicalToSlug(
      member.canonicalReference,
      undefined,
      `/${parent.kind.toLowerCase()}`,
      subPackage
    ),
  };

  result.overloads[member.overloadIndex - 1] = {
    typeParams: (member.typeParameters ?? []).map((p) => ({
      kind: 'typeparam',
      name: p.typeParameterName,
      description: doc.typeParams.get(p.typeParameterName) ?? '',
      definition: `\`${p.typeParameterName}${getTokenRange(
        member.excerptTokens,
        p.constraintTokenRange
      )}${wrap(
        getTokenRange(member.excerptTokens, p.defaultTypeTokenRange),
        ' = ',
        ''
      )}\``,
      constraint: () =>
        getCodeTokenWithLinks(
          model,
          member.excerptTokens,
          p.constraintTokenRange
        ),
      defaultType: () =>
        getCodeTokenWithLinks(
          model,
          member.excerptTokens,
          p.defaultTypeTokenRange
        ),
    })),
    params: member.parameters.map((p) => ({
      kind: 'param',
      name: p.parameterName,
      description: doc.params.get(p.parameterName) ?? '',
      type: () =>
        getCodeTokenWithLinks(
          model,
          member.excerptTokens,
          p.parameterTypeTokenRange
        ),
    })),
    codeTokens: () => getCodeTokenWithLinks(model, member.excerptTokens),
  };

  return result;
}

export function processProperty(
  member: ApiProperty | ApiPropertySignature,
  parent: ApiClass | ApiInterface,
  subPackage: string,
  model: Model
): Property {
  const doc = parseDocComment(member.docComment);

  return {
    kind: 'property',
    name: member.name,
    ownerName: parent.name,
    description: doc.brief,
    docBlocks: doc.other,
    isAbstract: member.kind === 'PropertySignature',
    sources: [],
    codeTokens: () => getCodeTokenWithLinks(model, member.excerptTokens),
    link: canonicalToSlug(
      member.canonicalReference,
      undefined,
      `/${parent.kind.toLowerCase()}`,
      subPackage
    ),
  };
}
