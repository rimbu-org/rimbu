import {
  EMPTY_NODE,
  EndNode,
  ExactAmountRepeatNode,
  MatchNode,
  MaxAmountRepeatNode,
  OrNode,
  PredNode,
  SeqNode,
  TreeNode,
  ZeroOrMoreRepeatNode,
} from 'tree-node.mjs';
import {
  ANY_PRED,
  treeBuilder,
  TreeBuilder,
  treeWithEndNodeBuilder,
} from '../src/tree-builder.mjs';
import type { Expr } from '../src/expression-types.mjs';
import { EMPTY_POSITIONS } from 'positions.mjs';

const INIT_STATE: TreeBuilder.State = {
  nextPosition: 10,
  nextRepeatNodeId: 4,
  indexToNodeMap: new Map(),
  endNodePositions: EMPTY_POSITIONS,
};

function createTree(input: Expr<any>) {
  const [state, tree] = treeBuilder(INIT_STATE, input);

  return { tree, indexToNodeMap: state.indexToNodeMap };
}

function expectNode<N extends TreeNode>(
  node: TreeNode,
  clz: { new (...args: any[]): N },
  exec: (node: N) => void
) {
  expect(node).toBeInstanceOf(clz);
  exec(node as N);
}

describe('treeBuilder', () => {
  it('builds empty tree', () => {
    const { tree, indexToNodeMap } = createTree([]);

    expect(tree).toBe(EMPTY_NODE);
    expect(indexToNodeMap.size).toBe(0);
  });

  it('build single any match node', () => {
    const { tree, indexToNodeMap } = createTree({ _any: true });

    expectNode(tree, PredNode, (node) => {
      expect(node.position).toBe(10);
      expect(node.pred).toBe(ANY_PRED);
      expect(node.neg).toBe(false);
      expect(indexToNodeMap.get(node.position)).toBe(node);
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('builds single match node', () => {
    const { tree, indexToNodeMap } = createTree(['a']);

    expectNode(tree, MatchNode, (node) => {
      expect(node.position).toBe(10);
      expect(node.token).toBe('a');
      expect(node.neg).toBe(false);
      expect(indexToNodeMap.get(node.position)).toBe(node);
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('builds single not match node', () => {
    const { tree, indexToNodeMap } = createTree([{ _not: 'a' }]);

    expectNode(tree, MatchNode, (node) => {
      expect(node.position).toBe(10);
      expect(node.token).toBe('a');
      expect(node.neg).toBe(true);
      expect(indexToNodeMap.get(node.position)).toBe(node);
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('builds sequence of match nodes', () => {
    const { tree, indexToNodeMap } = createTree(['a', 'b', 'c']);

    expectNode(tree, SeqNode, (treeNode) => {
      expectNode(treeNode.left, MatchNode, (leftNode) => {
        expect(leftNode.position).toBe(10);
        expect(leftNode.token).toBe('a');
        expect(leftNode.neg).toBe(false);
        expect(indexToNodeMap.get(leftNode.position)).toBe(leftNode);
      });

      expectNode(treeNode.right, SeqNode, (rightNode) => {
        expectNode(rightNode.left, MatchNode, (leftNode) => {
          expect(leftNode.position).toBe(11);
          expect(leftNode.token).toBe('b');
          expect(leftNode.neg).toBe(false);
          expect(indexToNodeMap.get(leftNode.position)).toBe(leftNode);
        });

        expectNode(rightNode.right, MatchNode, (rightNode) => {
          expect(rightNode.position).toBe(12);
          expect(rightNode.token).toBe('c');
          expect(rightNode.neg).toBe(false);
          expect(indexToNodeMap.get(rightNode.position)).toBe(rightNode);
        });
      });
    });

    expect(indexToNodeMap.size).toBe(3);
  });

  it('returns or of match nodes', () => {
    const { tree, indexToNodeMap } = createTree({ _or: ['a', 'b', 'c'] });

    expectNode(tree, OrNode, (treeNode) => {
      expectNode(treeNode.left, MatchNode, (leftNode) => {
        expect(leftNode.position).toBe(10);
        expect(leftNode.token).toBe('a');
        expect(leftNode.neg).toBe(false);
        expect(indexToNodeMap.get(leftNode.position)).toBe(leftNode);
      });

      expectNode(treeNode.right, OrNode, (rightNode) => {
        expectNode(rightNode.left, MatchNode, (leftNode) => {
          expect(leftNode.position).toBe(11);
          expect(leftNode.token).toBe('b');
          expect(leftNode.neg).toBe(false);
          expect(indexToNodeMap.get(leftNode.position)).toBe(leftNode);
        });

        expectNode(rightNode.right, MatchNode, (rightNode) => {
          expect(rightNode.position).toBe(12);
          expect(rightNode.token).toBe('c');
          expect(rightNode.neg).toBe(false);
          expect(indexToNodeMap.get(rightNode.position)).toBe(rightNode);
        });
      });
    });

    expect(indexToNodeMap.size).toBe(3);
  });

  it('returns max amount repeat for opt extpression', () => {
    const { tree, indexToNodeMap } = createTree({ _opt: ['a'] });

    expectNode(tree, MaxAmountRepeatNode, (repeatNode) => {
      expect(repeatNode.min).toBe(0);
      expect(repeatNode.max).toBe(1);
      expect(repeatNode.repeatNodeId).toBe(4);

      expectNode(repeatNode.child, MatchNode, (childNode) => {
        expect(childNode.position).toBe(10);
        expect(childNode.token).toBe('a');
        expect(childNode.neg).toBe(false);
        expect(indexToNodeMap.get(childNode.position)).toBe(childNode);
      });
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('returns max amount repeat', () => {
    const { tree, indexToNodeMap } = createTree({ _repeat: ['a'], max: 5 });

    expectNode(tree, MaxAmountRepeatNode, (repeatNode) => {
      expect(repeatNode.min).toBe(0);
      expect(repeatNode.max).toBe(5);
      expect(repeatNode.repeatNodeId).toBe(4);

      expectNode(repeatNode.child, MatchNode, (childNode) => {
        expect(childNode.position).toBe(10);
        expect(childNode.token).toBe('a');
        expect(childNode.neg).toBe(false);
        expect(indexToNodeMap.get(childNode.position)).toBe(childNode);
      });
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('returns zero or more repeat', () => {
    const { tree, indexToNodeMap } = createTree({ _repeat: ['a'] });

    expectNode(tree, ZeroOrMoreRepeatNode, (repeatNode) => {
      expect(repeatNode.min).toBe(0);
      expect(repeatNode.max).toBe(undefined);
      expect(() => repeatNode.repeatNodeId).toThrow();

      expectNode(repeatNode.child, MatchNode, (childNode) => {
        expect(childNode.position).toBe(10);
        expect(childNode.token).toBe('a');
        expect(childNode.neg).toBe(false);
        expect(indexToNodeMap.get(childNode.position)).toBe(childNode);
      });
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('returns an exact amount repeat', () => {
    const { tree, indexToNodeMap } = createTree({
      _repeat: ['a'],
      min: 5,
      max: 5,
    });

    expectNode(tree, ExactAmountRepeatNode, (repeatNode) => {
      expect(repeatNode.min).toBe(5);
      expect(repeatNode.max).toBe(5);
      expect(repeatNode.repeatNodeId).toBe(4);

      expectNode(repeatNode.child, MatchNode, (childNode) => {
        expect(childNode.position).toBe(10);
        expect(childNode.token).toBe('a');
        expect(childNode.neg).toBe(false);
        expect(indexToNodeMap.get(childNode.position)).toBe(childNode);
      });
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('normalizes min-* amount repeat', () => {
    const { tree, indexToNodeMap } = createTree({ _repeat: ['a'], min: 5 });

    expectNode(tree, SeqNode, (seqNode) => {
      expectNode(seqNode.left, ExactAmountRepeatNode, (repeat1Node) => {
        expect(repeat1Node.min).toBe(5);
        expect(repeat1Node.max).toBe(5);
        expect(repeat1Node.repeatNodeId).toBe(4);

        expectNode(repeat1Node.child, MatchNode, (child1Node) => {
          expect(child1Node.position).toBe(10);
          expect(child1Node.token).toBe('a');
          expect(child1Node.neg).toBe(false);
          expect(indexToNodeMap.get(child1Node.position)).toBe(child1Node);

          expectNode(seqNode.right, ZeroOrMoreRepeatNode, (repeat2Node) => {
            expect(repeat2Node.min).toBe(0);
            expect(repeat2Node.max).toBe(undefined);
            expect(() => repeat2Node.repeatNodeId).toThrow();

            expect(repeat2Node.child).toBe(child1Node);
          });
        });
      });
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('normalizes min-max amount repeat', () => {
    const { tree, indexToNodeMap } = createTree({
      _repeat: ['a'],
      min: 5,
      max: 10,
    });

    expectNode(tree, SeqNode, (seqNode) => {
      expectNode(seqNode.left, ExactAmountRepeatNode, (repeat1Node) => {
        expect(repeat1Node.min).toBe(5);
        expect(repeat1Node.max).toBe(5);
        expect(repeat1Node.repeatNodeId).toBe(4);

        expectNode(repeat1Node.child, MatchNode, (child1Node) => {
          expect(child1Node.position).toBe(10);
          expect(child1Node.token).toBe('a');
          expect(child1Node.neg).toBe(false);
          expect(indexToNodeMap.get(child1Node.position)).toBe(child1Node);

          expectNode(seqNode.right, MaxAmountRepeatNode, (repeat2Node) => {
            expect(repeat2Node.min).toBe(0);
            expect(repeat2Node.max).toBe(5);
            expect(repeat2Node.repeatNodeId).toBe(5);

            expect(repeat2Node.child).toBe(child1Node);
          });
        });
      });
    });
  });

  it('returns child for repeat exactly once', () => {
    const { tree, indexToNodeMap } = createTree({
      _repeat: ['a'],
      min: 1,
      max: 1,
    });

    expectNode(tree, MatchNode, (node) => {
      expect(node.position).toBe(10);
      expect(node.token).toBe('a');
      expect(node.neg).toBe(false);
      expect(indexToNodeMap.get(node.position)).toBe(node);
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('normalizes nested "seq" content', () => {
    const { tree, indexToNodeMap } = createTree([
      ['a', 'b'],
      ['c', 'd'],
    ]);

    expectNode(tree, SeqNode, (seq1) => {
      expectNode(seq1.left, MatchNode, (match1) => {
        expect(match1.position).toBe(10);
        expect(match1.token).toBe('a');
        expect(match1.neg).toBe(false);
        expect(indexToNodeMap.get(match1.position)).toBe(match1);
      });

      expectNode(seq1.right, SeqNode, (seq2) => {
        expectNode(seq2.left, MatchNode, (match2) => {
          expect(match2.position).toBe(11);
          expect(match2.token).toBe('b');
          expect(match2.neg).toBe(false);
          expect(indexToNodeMap.get(match2.position)).toBe(match2);
        });

        expectNode(seq2.right, SeqNode, (seq3) => {
          expectNode(seq3.left, MatchNode, (match3) => {
            expect(match3.position).toBe(12);
            expect(match3.token).toBe('c');
            expect(match3.neg).toBe(false);
            expect(indexToNodeMap.get(match3.position)).toBe(match3);
          });

          expectNode(seq3.right, MatchNode, (match4) => {
            expect(match4.position).toBe(13);
            expect(match4.token).toBe('d');
            expect(match4.neg).toBe(false);
            expect(indexToNodeMap.get(match4.position)).toBe(match4);
          });
        });
      });
    });

    expect(indexToNodeMap.size).toBe(4);
  });

  it('normalizes nested "or" content', () => {
    const { tree, indexToNodeMap } = createTree({
      _or: [{ _or: ['a', 'b'] }, { _or: ['c', 'd'] }],
    });

    expectNode(tree, OrNode, (or1) => {
      expectNode(or1.left, MatchNode, (match1) => {
        expect(match1.position).toBe(10);
        expect(match1.token).toBe('a');
        expect(match1.neg).toBe(false);
        expect(indexToNodeMap.get(match1.position)).toBe(match1);
      });

      expectNode(or1.right, OrNode, (or2) => {
        expectNode(or2.left, MatchNode, (match2) => {
          expect(match2.position).toBe(11);
          expect(match2.token).toBe('b');
          expect(match2.neg).toBe(false);
          expect(indexToNodeMap.get(match2.position)).toBe(match2);
        });

        expectNode(or2.right, OrNode, (or3) => {
          expectNode(or3.left, MatchNode, (match3) => {
            expect(match3.position).toBe(12);
            expect(match3.token).toBe('c');
            expect(match3.neg).toBe(false);
            expect(indexToNodeMap.get(match3.position)).toBe(match3);
          });

          expectNode(or3.right, MatchNode, (match4) => {
            expect(match4.position).toBe(13);
            expect(match4.token).toBe('d');
            expect(match4.neg).toBe(false);
            expect(indexToNodeMap.get(match4.position)).toBe(match4);
          });
        });
      });
    });

    expect(indexToNodeMap.size).toBe(4);
  });

  it('builds empty joined', () => {
    const { tree, indexToNodeMap } = createTree({ _joined: [] });

    expect(tree).toBe(EMPTY_NODE);
    expect(indexToNodeMap.size).toBe(0);
  });

  it('builds empty joined with start end', () => {
    const { tree } = createTree({ _joined: [], start: ['('], end: [')'] });
    const { tree: tree2 } = createTree(['(', ')']);

    expect(tree).toEqual(tree2);
  });

  it('builds empty repeat joined', () => {
    const { tree } = createTree({ _joined: ['a', 'b'], max: 0 });

    expect(tree).toBe(EMPTY_NODE);
  });

  it('builds single joined', () => {
    const { tree } = createTree({ _joined: ['a', 'b'], min: 1, max: 1 });
    const { tree: tree2 } = createTree(['a', 'b']);

    expect(tree).toEqual(tree2);
  });

  it('builds simple repeat joined', () => {
    const { tree } = createTree({ _joined: ['a', 'b'] });

    expectNode(tree, ZeroOrMoreRepeatNode, (repeatNode) => {
      expect(repeatNode.min).toBe(0);
      expect(repeatNode.max).toBe(undefined);
      expect(() => repeatNode.repeatNodeId).toThrow();
      expectNode(repeatNode.child, SeqNode, (seqNode) => {
        expectNode(seqNode.left, MatchNode, (leftNode) => {
          expect(leftNode.position).toBe(10);
          expect(leftNode.token).toBe('a');
          expect(leftNode.neg).toBe(false);
        });
        expectNode(seqNode.right, MatchNode, (rightNode) => {
          expect(rightNode.position).toBe(11);
          expect(rightNode.token).toBe('b');
          expect(rightNode.neg).toBe(false);
        });
      });
    });
  });

  it('builds simple joined with sep', () => {
    const { tree } = createTree({
      _joined: ['a', 'b'],
      sep: ['|'],
    });

    expectNode(tree, SeqNode, (seq1Node) => {
      expectNode(seq1Node.left, MatchNode, (left1Node) => {
        expect(left1Node.position).toBe(10);
        expect(left1Node.token).toBe('a');
        expect(left1Node.neg).toBe(false);
      });

      expectNode(seq1Node.right, SeqNode, (seq2Node) => {
        expectNode(seq2Node.left, MatchNode, (left2Node) => {
          expect(left2Node.position).toBe(11);
          expect(left2Node.token).toBe('b');
          expect(left2Node.neg).toBe(false);
        });

        expectNode(seq2Node.right, ZeroOrMoreRepeatNode, (repeat1Node) => {
          expect(repeat1Node.min).toBe(0);
          expect(repeat1Node.max).toBe(undefined);
          expect(() => repeat1Node.repeatNodeId).toThrow();

          expectNode(repeat1Node.child, SeqNode, (seq3Node) => {
            expectNode(seq3Node.left, MatchNode, (left3Node) => {
              expect(left3Node.position).toBe(12);
              expect(left3Node.token).toBe('|');
              expect(left3Node.neg).toBe(false);
            });

            expectNode(seq3Node.right, SeqNode, (seq4Node) => {
              expect(seq4Node.left).toBe(seq1Node.left);
              expect(seq4Node.right).toBe(seq2Node.left);
            });
          });
        });
      });
    });
  });
});

function createTreeWithEndNode(input: Expr<any>) {
  const [state, tree] = treeWithEndNodeBuilder(INIT_STATE, input);

  return { tree, indexToNodeMap: state.indexToNodeMap };
}

describe('treewithEndNodeBuilder', () => {
  it('builders empty tree with end node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode([]);

    expectNode(tree, EndNode, (endNode) => {
      expect(endNode.position).toBe(10);
      expect(indexToNodeMap.get(endNode.position)).toBe(endNode);
    });

    expect(indexToNodeMap.size).toBe(1);
  });

  it('builds simple tree with end node', () => {
    const { tree, indexToNodeMap } = createTreeWithEndNode(['a', 'b']);

    expectNode(tree, SeqNode, (seqNode) => {
      expectNode(seqNode.left, MatchNode, (leftNode) => {
        expect(leftNode.position).toBe(10);
        expect(leftNode.token).toBe('a');
        expect(leftNode.neg).toBe(false);
        expect(indexToNodeMap.get(leftNode.position)).toBe(leftNode);
      });

      expectNode(seqNode.right, SeqNode, (seqNode2) => {
        expectNode(seqNode2.left, MatchNode, (leftNode) => {
          expect(leftNode.position).toBe(11);
          expect(leftNode.token).toBe('b');
          expect(leftNode.neg).toBe(false);
          expect(indexToNodeMap.get(leftNode.position)).toBe(leftNode);
        });

        expectNode(seqNode2.right, EndNode, (endNode) => {
          expect(endNode.position).toBe(12);
          expect(indexToNodeMap.get(endNode.position)).toBe(endNode);
        });
      });
    });

    expect(indexToNodeMap.size).toBe(3);
  });
});
