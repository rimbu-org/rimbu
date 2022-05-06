import { Stream } from '@rimbu/stream/mod.ts';

import { ApiInterface, ApiClass, ApiItem } from '~/json-model/api.ts';
import { ExcerptToken, ExcerptTokenRange } from '~/json-model/elements.ts';
import { Model } from '~/doc-model.ts';

export function findTokenRef(
  excerptTokens: ExcerptToken[],
  extendsTokenRange?: ExcerptTokenRange
): string | undefined {
  if (!extendsTokenRange) return undefined;

  return Stream.fromArray(excerptTokens, {
    start: extendsTokenRange.startIndex,
    end: [extendsTokenRange.endIndex, false],
  })
    .collect((v, _, skip, halt) => {
      if (v.kind === 'Reference') {
        if (v.text === 'Omit') return skip;

        halt();
        return v.canonicalReference!;
      }

      return skip;
    })
    .first();
}

export function getTypes(item: ApiInterface | ApiClass, summary = false) {
  return Stream.from(item.typeParameters)
    .map(
      (param) =>
        `${param.typeParameterName}${
          summary
            ? ''
            : getTokenRange(
                item.excerptTokens,
                param.constraintTokenRange,
                ' extends '
              )
        }${
          summary
            ? ''
            : getTokenRange(
                item.excerptTokens,
                param.defaultTypeTokenRange,
                ' = '
              )
        }`
    )
    .join({ start: '<', sep: ', ', end: '>', ifEmpty: '' });
}

export function getTypedName(item: ApiItem, summary = false) {
  switch (item.kind) {
    case 'Class': {
      const types = getTypes(item, summary);
      return `${item.name}${types}`;
    }
    case 'Interface': {
      const types = getTypes(item, summary);

      //   const parent = getParent(item, model);
      //   if (parent && parent.kind === 'Namespace') {
      //     return `${parent.name}.${item.name}${types}`;
      //   }

      return `${item.name}${types}`;
    }
  }

  if (`name` in item) return item.name;
  return item.canonicalReference;
}

export function wrap(
  value: string | undefined,
  start: string,
  end: string,
  ifEmpty = ''
) {
  if (value) return `${start}${value}${end}`;

  return ifEmpty;
}

export function link(title: string, slug: string) {
  return `[${title}](/api${slug})`;
}

export function canonicalToSlug(
  canonicalReference: string,
  lead = '',
  addParentType = '',
  subPackage = ''
) {
  const [pkg, rest] = canonicalReference.split('!');
  const [location, tail] = rest.split('#');
  const [anchor] = (tail ?? '').split(':');

  const pkgResult = pkg.replace('@', '').replaceAll('$', '/');
  const locationResult = location.replaceAll(/[\/!:\.]/g, '/');

  return `${lead}/${pkgResult}${wrap(
    subPackage,
    '/',
    '',
    ''
  )}/${locationResult}${addParentType}${wrap(anchor, '#', '')}`.replace(
    /\/$/g,
    ''
  );
}

export function getCodeTokenWithLinks(
  model: Model,
  tokens: ExcerptToken[],
  range?: ExcerptTokenRange
) {
  return Stream.fromArray(
    tokens,
    undefined === range
      ? undefined
      : {
          start: range.startIndex,
          end: [range.endIndex, false],
        }
  )
    .map((token) => {
      if (token.kind === 'Content') {
        return `\`${token.text}\``;
      }

      if (!model.slugs.get(token.canonicalReference!)) {
        return `\`${token.text}\``;
      }

      return link(
        `\`${token.text}\``,
        model.slugs.get(token.canonicalReference!)!
      );
    })
    .join({ ifEmpty: '' })
    .replaceAll(/\n/g, '`<br/>`')
    .replaceAll(/  /g, '`&nbsp;`')
    .replaceAll(/\|/g, '`<code>&#124;</code>`')
    .replaceAll(/``/g, '');
}

export function getTokenRange(
  tokens: ExcerptToken[],
  range: ExcerptTokenRange | undefined | 'all',
  start = ''
) {
  if (!range) return '';

  return Stream.fromArray(
    tokens,
    range === 'all'
      ? undefined
      : {
          start: range.startIndex,
          end: [range.endIndex, false],
        }
  )
    .map((token) => token.text)
    .join({ start, ifEmpty: '' });
}

export function canonicalToFileName(
  canonicalReference: string,
  subPackage = ''
) {
  const [pkg, rest] = canonicalReference.split('!');

  const path = packagePath(pkg, subPackage);

  const [location, qualifier] = rest.split(':');

  const locationResult = location.replaceAll('.', '/') || 'index';

  if (qualifier === 'namespace') {
    return `${path}/${locationResult}/index.mdx`;
  }

  return `${path}/${locationResult}${wrap(qualifier, '.', '') ?? ''}.mdx`;
}

export function packagePath(pkg: string, subPackage = '') {
  let pkgResult = pkg
    .replace('@', '')
    .replaceAll(/\//g, '_')
    .replaceAll('$', '/');

  if (subPackage !== '') {
    return `${pkgResult}/${subPackage}`;
  }

  return pkgResult;
}
