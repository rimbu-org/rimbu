import { SortedMap, Stream } from '@rimbu/mod.ts';

import { HasItemContainer, BaseDocumentedItem } from '~/json-model/base.ts';
import { Model, Namespace, TypeAlias } from '~/doc-model.ts';
import {
  canonicalToSlug,
  findTokenRef,
  getCodeTokenWithLinks,
  wrap,
  getTokenRange,
} from '~/utils.ts';

import { processClass } from '../class/index.ts';
import { processInterface } from '../interface/index.ts';

import { parseDocComment } from './parse-doc-comment.ts';

export function processNamespaceLike(
  name: string,
  source: HasItemContainer & BaseDocumentedItem,
  subPackage = '',
  model: Model
): Namespace {
  const doc = parseDocComment(source.docComment);

  const targetNamespace: Namespace = {
    kind: 'namespace',
    canonicalReference: source.canonicalReference,
    slug: canonicalToSlug(
      source.canonicalReference,
      undefined,
      undefined,
      subPackage
    ),
    name,
    description: doc.brief,
    docBlocks: [],
    namespaces: SortedMap.builder(),
    interfaces: SortedMap.builder(),
    classes: SortedMap.builder(),
    functions: SortedMap.builder(),
    methods: SortedMap.builder(),
    variables: SortedMap.builder(),
    types: SortedMap.builder(),
  };
  model.namespaces.set(name, targetNamespace);
  model.slugs.set(targetNamespace.canonicalReference, targetNamespace.slug);

  for (const member of source.members) {
    switch (member.kind) {
      case 'Variable':
        {
          const doc = parseDocComment(member.docComment);
          const typeRef = findTokenRef(
            member.excerptTokens,
            member.variableTypeTokenRange
          );

          targetNamespace.variables.set(member.name, {
            kind: 'variable',
            name: member.name,
            canonicalReference: member.canonicalReference,
            slug: canonicalToSlug(member.canonicalReference),
            codeTokens: () =>
              getCodeTokenWithLinks(model, member.excerptTokens),
            description: doc.brief,
            docBlocks: doc.other,
            typeRef,
          });
          model.slugs.set(
            member.canonicalReference,
            canonicalToSlug(
              member.canonicalReference,
              undefined,
              undefined,
              subPackage
            )
          );
        }
        break;
      case 'Class': {
        const result = processClass(member.name, member, model, subPackage);
        model.items.set(member.canonicalReference, result);
        targetNamespace.classes.set(member.name, result);
        model.slugs.set(
          member.canonicalReference,
          canonicalToSlug(
            member.canonicalReference,
            undefined,
            undefined,
            subPackage
          )
        );
        break;
      }
      case 'Interface': {
        const result = processInterface(
          `${wrap(name, '', '.', '')}${member.name}`,
          member,
          model,
          subPackage
        );
        model.items.set(member.canonicalReference, result);
        targetNamespace.interfaces.set(member.name, result);

        const companionNamespace = targetNamespace.namespaces.get(member.name);
        if (companionNamespace) {
          result.companion = companionNamespace;
          companionNamespace.companion = result;

          if (companionNamespace.description === 'undocumented') {
            companionNamespace.description = result.description;
          }
        }

        model.slugs.set(
          member.canonicalReference,
          canonicalToSlug(
            member.canonicalReference,
            undefined,
            undefined,
            subPackage
          )
        );
        break;
      }
      case 'Namespace': {
        const result = processNamespaceLike(
          member.name,
          member,
          subPackage,
          model
        );

        targetNamespace.namespaces.set(member.name, result);

        const companionInterface = targetNamespace.interfaces.get(member.name);
        if (companionInterface) {
          result.companion = companionInterface;
          if (!source.docComment) {
            result.description = companionInterface.description;
          }
          companionInterface.companion = result;
        }
        const companionType = targetNamespace.types.get(member.name);
        if (companionType) {
          result.companion = companionType;
          if (!source.docComment) {
            result.description = companionType.description;
          }
          companionType.companion = result;
        }

        model.slugs.set(
          member.canonicalReference,
          canonicalToSlug(
            member.canonicalReference,
            undefined,
            undefined,
            subPackage
          )
        );
        break;
      }
      case 'Function': {
        const doc = parseDocComment(member.docComment);

        targetNamespace.functions.set(member.name, {
          kind: 'function',
          name: member.name,
          description: doc.brief,
          docBlocks: doc.other,
          codeTokens: () => getCodeTokenWithLinks(model, member.excerptTokens),
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
          returnType: () =>
            getCodeTokenWithLinks(
              model,
              member.returnTypeExcerpt?.tokens ?? [],
              member.returnTypeExcerpt?.tokenRange
            ),
        });
        model.slugs.set(
          member.canonicalReference,
          canonicalToSlug(
            member.canonicalReference,
            undefined,
            undefined,
            subPackage
          )
        );
        break;
      }
      case 'TypeAlias': {
        const doc = parseDocComment(member.docComment);
        const slug = canonicalToSlug(
          member.canonicalReference,
          undefined,
          undefined,
          subPackage
        );
        const typeParams = Stream.from(member.typeParameters).join({
          valueToString: (p) => p.typeParameterName,
          start: '<',
          sep: ',',
          end: '>',
          ifEmpty: '',
        });
        const result: TypeAlias = {
          kind: 'typealias',
          name: member.name,
          nameWithParams: `${member.name}${typeParams}`,
          slug,
          canonicalReference: member.canonicalReference,
          description: doc.brief,
          docBlocks: doc.other,
          codeTokens: () => getCodeTokenWithLinks(model, member.excerptTokens),
        };

        targetNamespace.types.set(member.name, result);

        const companionNamespace = targetNamespace.namespaces.get(member.name);
        if (companionNamespace) {
          result.companion = companionNamespace;
          companionNamespace.companion = result;

          if (companionNamespace.description === 'undocumented') {
            companionNamespace.description = result.description;
          }
        }

        model.slugs.set(member.canonicalReference, slug);
        break;
      }
      default:
        console.log(
          'unknown namespace member: ',
          member.kind,
          member.canonicalReference
        );
    }
  }

  return targetNamespace;
}
