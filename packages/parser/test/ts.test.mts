import { compile } from 'compile.mjs';
import type { Expr } from 'expression-types.mjs';
import { createFollowPositionsMap } from 'follow-positions-map.mjs';
import { showFollowPositionsMap } from 'show.mjs';
import { createTreeWithEndNode } from 'tree-builder.mjs';

const _declaration: Expr<string> = [
  { _or: ['var', 'const'] },
  { _any: true },
  { _opt: [':', { _any: true }] },
  '=',
  { _any: true },
];

const _function: Expr<string> = [
  { _opt: ['async'] },
  'function',
  { _any: true },
  {
    // _joined: [{ _any: true }],
    // _joined: [{ _any: true }, { _opt: [':', { _any: true }] }],
    start: ['('],
    sep: [','],
    end: [')'],
  },
  { _opt: [':', { _any: true }] },
  { _opt: ['{', { _any: true }, '}'] },
];

const _statement: Expr<string> = { _or: [_declaration, _function] };

describe('declaration', () => {
  it.skip('matches declaration', () => {
    const { tree } = createTreeWithEndNode(_statement);
    const followPositionsMap = createFollowPositionsMap(tree);
    console.log(tree.toString());
    showFollowPositionsMap(followPositionsMap);
    const match = compile(_statement);
    const statement = 'async function abc(ab): par';
    const tokens = statement
      .split(/(\s+|[:;,()])/g)
      .filter((token) => token.trim() !== '');
    console.log(tokens);
    expect(match(tokens)).toBe(true);
  });
});
