import { Stream } from '@rimbu/stream/mod.ts';

import { ApiItem, DocComment } from '~/json-model/index.ts';

const regexp = {
  docParam: /^@param\s+(?<name>\w+)\s+-\s+(?<doc>.+)$/,
  docTypeParam: /^@typeparam\s+(?<name>\w+)\s+-\s+(?<doc>.+)$/,
  otherTag: /^@(?<tag>\w+)\s*(?<doc>.*)$/,
  returnsTag: /^@returns\s+(?<doc>.+)$/,
};

export function getItemDocComment(item?: ApiItem): DocComment {
  if (!item || !(`docComment` in item)) {
    return parseDocComment();
  }

  return parseDocComment(item.docComment, item.canonicalReference);
}

export function parseDocComment(docComment?: string, ref = ''): DocComment {
  const result: DocComment = {
    brief: 'undocumented',
    summary: '',
    params: new Map(),
    typeParams: new Map(),
    other: [],
  };

  if (!docComment) {
    return result;
  }

  const empty: string[] = [];

  const lines = Stream.from(docComment.split('\n').slice(1, -2)).flatMap(
    (s) => {
      const result = s.trim().replace(/^\s*\*\s*/g, '');

      if (result.length === 0) return empty;

      const noteIndex = result.indexOf('@note');

      if (noteIndex > 0) {
        return [result.substring(0, noteIndex), result.substring(noteIndex)];
      }

      return [result];
    }
  );

  let currentTag:
    | 'summary'
    | 'returns'
    | 'param'
    | 'typeparam'
    | 'other'
    | 'none' = 'summary';
  let paramName: string | undefined;
  let content = '';

  function setCurrent() {
    if (currentTag === 'summary') {
      result.summary = content.replace(/\<br\/>/g, '\n');
    } else if (currentTag === 'param' && paramName) {
      result.params.set(paramName, content);
    } else if (currentTag === 'typeparam' && paramName) {
      result.typeParams.set(paramName, content);
    } else if (currentTag === 'other' && paramName) {
      if (paramName === 'example') {
        if (!content.startsWith('```ts')) {
          console.log(ref, content);
          throw Error('example does not start with code block');
        }
        if (!content.endsWith('```')) {
          console.log(ref, content);
          throw Error('example does not properly end code block');
        }
      }

      if (paramName !== 'packagedocumentation') {
        result.other.push([paramName, content]);
      }
    } else if (currentTag === 'returns') {
      result.returns = content.replace(/\<br\/>/g, '\n');
    }

    currentTag = 'none';
    paramName = undefined;
    content = '';
  }

  for (const line of lines) {
    const docParam = regexp.docParam.exec(line);
    if (docParam && docParam.groups) {
      setCurrent();
      const { name, doc } = docParam.groups;
      currentTag = 'param';
      paramName = name;
      content = doc;
      if (content.includes('@')) {
        console.log(docComment);
        throw Error('line contains tag');
      }
      continue;
    }
    const typeDocParam = regexp.docTypeParam.exec(line);
    if (typeDocParam && typeDocParam.groups) {
      setCurrent();
      currentTag = 'typeparam';
      const { name, doc } = typeDocParam.groups;
      paramName = name;
      content = doc;
      continue;
    }
    const returnsTag = regexp.returnsTag.exec(line);
    if (returnsTag && returnsTag.groups) {
      const { doc } = returnsTag.groups;
      currentTag = 'returns';
      content = doc;
      continue;
    }
    const otherTag = regexp.otherTag.exec(line);
    if (otherTag && otherTag.groups) {
      setCurrent();
      currentTag = 'other';
      const { tag, doc } = otherTag.groups;
      paramName = tag.toLowerCase();
      content = doc;
      continue;
    }

    if (content.length > 0) {
      content = content.concat('\n', line);
    } else {
      content = line;
    }
  }

  setCurrent();

  if (result.summary.length > 0) {
    result.brief = result.summary;
  } else if (result.returns) {
    result.brief = `Returns ${result.returns}`;
  }

  return result;
}
