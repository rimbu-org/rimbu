import { Stream } from '@rimbu/stream/mod.ts';

import { TypeParam } from '~/doc-model.ts';

export function generateTypeParams(
  typeParameters: TypeParam[],
  headerLevel: string
) {
  const hasTypeConstraints = typeParameters.some((v) => v.constraint?.());
  const hasTypeDefaults = typeParameters.some((v) => v.defaultType?.());

  return Stream.from(typeParameters).join({
    valueToString: (param) =>
      `| ${param.name}${
        hasTypeConstraints ? ` | ${param.constraint?.()}` : ''
      }${hasTypeDefaults ? ` | ${param.defaultType?.()} ` : ''} | ${
        param.description
      } |`,
    start: `\
${headerLevel} Type parameters

| Name${hasTypeConstraints ? ` | Constraints` : ''}${
      hasTypeDefaults ? ` | Default` : ''
    } | Description |
| ----${hasTypeConstraints ? ` | ----` : ''}${
      hasTypeDefaults ? ` | ----` : ''
    } | ---- |
`,
    sep: '\n',
    end: '\n\n',
    ifEmpty: '',
  });
}
