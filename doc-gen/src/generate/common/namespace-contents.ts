import { Stream } from '@rimbu/stream/mod.ts';

import { Namespace } from '~/doc-model.ts';
import { link } from '~/utils.ts';

import { genFunction } from './function.ts';
import { genMethod } from './method.ts';

export function generateNamespaceContents(source: Namespace) {
  const result = `\
${source.description}
${Stream.from(source.docBlocks).join({
  valueToString: ([tag, text]) => `:::note ${tag}

${text}

:::
`,
})}
${
  source.companion
    ? `**Companion ${
        source.companion.kind === 'interface' ? 'interface' : 'type'
      }:** ${link(
        `\`${source.companion.nameWithParams}\``,
        source.companion.slug
      )}`
    : ''
}

${source.interfaces
  .buildMapValues(
    (intf) =>
      `| ${link(`\`${intf.nameWithParams}\``, intf.slug)} | ${
        intf.description
      } |`
  )
  .streamValues()
  .join({
    start: `
## Interfaces

| Name | Description |
| ---- | ----------- |
`,
    sep: '\n',
    end: '\n',
    ifEmpty: '',
  })}\
${source.namespaces
  .buildMapValues(
    (subnsp, name) =>
      `| ${link(`\`${name}\``, subnsp.slug)} | ${subnsp.description} |`
  )
  .streamValues()
  .join({
    start: `
## Namespaces

| Name | Description |
| ---- | ----------- |
`,
    sep: '\n',
    end: '\n',
    ifEmpty: '',
  })}
${source.classes
  .buildMapValues(
    (intf, name) =>
      `| ${link(`\`${name}\``, intf.slug)} | ${intf.description} |`
  )
  .streamValues()
  .join({
    start: `
## Classes

| Name | Description |
| ---- | ----------- |
`,
    sep: '\n',
    end: '\n',
    ifEmpty: '',
  })}\
${source.functions
  .buildMapValues(genFunction)
  .streamValues()
  .join({
    start: `
## Functions

`,
    sep: '\n',
    end: '\n',
    ifEmpty: '',
  })}\
${source.methods
  .buildMapValues(genMethod)
  .streamValues()
  .join({
    start: `\
## Static Methods

`,
    sep: '\n',
    end: '\n\n',
    ifEmpty: '',
  })}\
${source.variables
  .buildMapValues((variable, name) => `| ${name} | ${variable.description} |`)
  .streamValues()
  .join({
    start: `
## Constants

| Name | Description |
| ---- | ----------- |
`,
    sep: '\n',
    end: '\n',
    ifEmpty: '',
  })}
`;

  return result;
}
