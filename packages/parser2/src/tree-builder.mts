import { StateTransformer } from '@rimbu/state-transformer';
import {
  ExprKey,
  isExpr,
  isNestedExpr,
  isSubExpr,
  type Expr,
  type JoinedExpr,
  type RepeatExpr,
  type SubExpr,
} from './expression-types.mjs';
import { EMPTY_POSITIONS, type Index, type Positions } from './positions.mjs';
import {
  createOr,
  createSeq,
  EMPTY_NODE,
  EndNode,
  ExactAmountRepeatNode,
  MatchNode,
  MaxAmountRepeatNode,
  PredNode,
  ZeroOrMoreRepeatNode,
  type PositionNode,
  type TreeNode,
} from './tree-node.mjs';

export type TreeBuilder<I, O> = (
  state: TreeBuilder.State,
  input: I
) => [TreeBuilder.State, O];

export type IndexToNodeMap = Map<Index, PositionNode>;

export namespace TreeBuilder {
  export interface State {
    nextPosition: number;
    nextRepeatNodeId: number;
    indexToNodeMap: IndexToNodeMap;
    endNodePositions: Positions;
  }

  export interface Context<Tp extends TreeBuilder.Types = TreeBuilder.Types>
    extends StateTransformer.Context<Tp> {}

  export interface Types extends StateTransformer.Types {
    _state: TreeBuilder.State;
    _context: TreeBuilder.Context<this>;

    _fn: TreeBuilder<this['_in'], this['_out']>;
  }
}

export const TreeBuilder = StateTransformer.createContext<TreeBuilder.Types>();

export const ANY_PRED = (): true => true;

const getNextPosition: TreeBuilder<any, number> = (state) => [
  { ...state, nextPosition: state.nextPosition + 1 },
  state.nextPosition,
];

const getNextRepeatNodeId: TreeBuilder<any, number> = (state) => [
  { ...state, nextRepeatNodeId: state.nextRepeatNodeId + 1 },
  state.nextRepeatNodeId,
];

const addPositionNodeToMap: TreeBuilder<PositionNode, PositionNode> =
  TreeBuilder.mapState((state, node) => ({
    ...state,
    indexToNodeMap: new Map(state.indexToNodeMap).set(node.position, node),
  }));

const addEndNodePosition: TreeBuilder<PositionNode, PositionNode> =
  TreeBuilder.mapState((state, node) => ({
    ...state,
    endNodePositions: state.endNodePositions | node.positions,
  }));

const matchNodeBuilder: TreeBuilder<
  [matchValue: any, neg: boolean],
  PositionNode
> = TreeBuilder.chain(
  TreeBuilder.combine(
    [getNextPosition],
    ([nextPosition], _, [matchValue, neg]) =>
      new MatchNode(matchValue, nextPosition, neg)
  ),
  addPositionNodeToMap
);

const predNodeBuilder: TreeBuilder<
  [pred: (value: any) => boolean, neg: boolean],
  PositionNode
> = TreeBuilder.chain(
  TreeBuilder.combine(
    [getNextPosition],
    ([nextPosition], _, [pred, neg]) => new PredNode(pred, nextPosition, neg)
  ),
  addPositionNodeToMap
);

const endNodeBuilder: TreeBuilder<any, PositionNode> = TreeBuilder.chain(
  TreeBuilder.combine(
    [getNextPosition],
    ([nextPosition]) => new EndNode(nextPosition)
  ),
  addPositionNodeToMap,
  addEndNodePosition
);

const subExprBuilder = TreeBuilder.decide(
  (
    _,
    [subExpr, combineNodes]: readonly [
      subExpr: SubExpr<any>,
      combine: (node1: TreeNode, node2: TreeNode) => TreeNode,
    ]
  ) => {
    if (subExpr.length <= 1) {
      if (subExpr.length === 0) {
        return TreeBuilder.setValue(EMPTY_NODE);
      }

      // single subexpression
      return TreeBuilder.supply(subExpr[0], treeBuilder);
    }

    const nodeBuilders = subExpr.map((expr: Expr<any>) =>
      isExpr(expr)
        ? TreeBuilder.supply(expr, treeBuilder)
        : TreeBuilder.supply([expr, false], matchNodeBuilder)
    );

    return TreeBuilder.combine(nodeBuilders, (nodes) =>
      nodes.reduce(combineNodes)
    );
  }
);

function createRepeatNodeBuilder(
  min: number,
  max?: number | undefined
): TreeBuilder<TreeNode, TreeNode> {
  if (min < 0) {
    throw new RangeError(`Min must be greater than or equal to 0: ${min}`);
  }

  if (max !== undefined && max < min) {
    throw new RangeError(`Max must be greater than or equal to min: ${max}`);
  }

  if (max === 0) {
    // (0..0) -> empty
    return TreeBuilder.setValue(EMPTY_NODE);
  }

  return TreeBuilder.decide((_, childNode) => {
    if (childNode === EMPTY_NODE) {
      return TreeBuilder.setValue(EMPTY_NODE);
    }

    if (childNode instanceof ZeroOrMoreRepeatNode) {
      return TreeBuilder.setValue(childNode);
    }

    if (min === 0) {
      if (max === undefined) {
        // (0..*)
        return TreeBuilder.setValue(new ZeroOrMoreRepeatNode(childNode));
      }

      // (0..n)
      return TreeBuilder.combine(
        [getNextRepeatNodeId],
        ([repeatNodeId]): TreeNode =>
          new MaxAmountRepeatNode(childNode, max, repeatNodeId)
      );
    }

    if (min === max) {
      if (min === 1) {
        // (1)
        return TreeBuilder.setValue(childNode);
      }

      // (n..n)
      if (childNode instanceof ExactAmountRepeatNode) {
        return TreeBuilder.setValue(
          new ExactAmountRepeatNode(
            childNode.child,
            min * childNode.amount,
            childNode.repeatNodeId
          )
        );
      }

      return TreeBuilder.combine(
        [getNextRepeatNodeId],
        ([repeatNodeId]): TreeNode =>
          new ExactAmountRepeatNode(childNode, min, repeatNodeId)
      );
    }
    if (max === undefined) {
      // (n+ = n + (0..*))
      return TreeBuilder.combine(
        [
          TreeBuilder.supply(childNode, createRepeatNodeBuilder(min, min)),
          TreeBuilder.supply(childNode, createRepeatNodeBuilder(0)),
        ],
        ([repeatNode1, repeatNode2]) => createSeq(repeatNode1, repeatNode2)
      );
    }

    // (n..m) = n + (0..m-n)
    return TreeBuilder.combine(
      [
        TreeBuilder.supply(childNode, createRepeatNodeBuilder(min, min)),
        TreeBuilder.supply(childNode, createRepeatNodeBuilder(0, max - min)),
      ],
      ([repeatNode1, repeatNode2]) => createSeq(repeatNode1, repeatNode2)
    );
  });
}

const repeatBuilder = TreeBuilder.decide(
  (_, repeatExpr: RepeatExpr<any>): TreeBuilder<RepeatExpr<any>, TreeNode> => {
    const { min = 0, max } = repeatExpr;

    if (min < 0) {
      throw new RangeError(`Min must be greater than or equal to 0: ${min}`);
    }

    if (max !== undefined && max < min) {
      throw new RangeError(`Max must be greater than or equal to min: ${max}`);
    }

    if (max === 0) {
      // (0..0) -> empty
      return TreeBuilder.setValue(EMPTY_NODE);
    }

    const childExpr = repeatExpr[ExprKey.Repeat];

    return TreeBuilder.chain(
      TreeBuilder.supply(childExpr, treeBuilder),
      createRepeatNodeBuilder(min, max)
    );
  }
);

function surround(
  contentBuilder: TreeBuilder<unknown, TreeNode>,
  start?: SubExpr<any>,
  end?: SubExpr<any>
): TreeBuilder<unknown, TreeNode> {
  const startBuilder =
    start === undefined
      ? TreeBuilder.setValue(EMPTY_NODE)
      : TreeBuilder.supply(start, treeBuilder);
  const endBuilder =
    end === undefined
      ? TreeBuilder.setValue(EMPTY_NODE)
      : TreeBuilder.supply(end, treeBuilder);

  return TreeBuilder.combine(
    [startBuilder, contentBuilder, endBuilder],
    ([startNode, contentNode, endNode]) =>
      createSeq(startNode, createSeq(contentNode, endNode))
  );
}

const joinedBuilder: TreeBuilder<
  JoinedExpr<any>,
  TreeNode
> = TreeBuilder.decide((_, joinedExpr: JoinedExpr<any>) => {
  const {
    [ExprKey.Joined]: contentExpr,
    start,
    sep,
    end,
    min = 0,
    max,
  } = joinedExpr;

  if (max === 0) {
    return surround(TreeBuilder.setValue(EMPTY_NODE), start, end);
  }

  const contentBuilder = TreeBuilder.supply(contentExpr, treeBuilder);

  if (min === 1 && max === 1) {
    return surround(contentBuilder, start, end);
  }

  if (sep === undefined) {
    const contentRepeatBuilder = TreeBuilder.chain(
      contentBuilder,
      createRepeatNodeBuilder(min, max)
    );

    return surround(contentRepeatBuilder, start, end);
  }

  const sepBuilder =
    sep === undefined
      ? TreeBuilder.setValue(EMPTY_NODE)
      : TreeBuilder.supply(sep, treeBuilder);

  const sepContentRepeatBuilder: TreeBuilder<any, TreeNode> = TreeBuilder.chain(
    TreeBuilder.combine<any, [TreeNode, TreeNode]>([
      contentBuilder,
      sepBuilder,
    ]),
    TreeBuilder.decide<[TreeNode, TreeNode], TreeNode>(
      (_, [contentNode, sepNode]) =>
        TreeBuilder.chain(
          TreeBuilder.setValue<TreeNode>(createSeq(sepNode, contentNode)),
          createRepeatNodeBuilder(
            Math.max(min - 1, 0),
            max === undefined ? undefined : max - 1
          ),
          TreeBuilder.mapValue<TreeNode, TreeNode>((repeatNode) =>
            createSeq(contentNode, repeatNode)
          )
        )
    )
  );

  return surround(sepContentRepeatBuilder, start, end);
});

export const treeBuilder: TreeBuilder<Expr<any>, TreeNode> = TreeBuilder.decide(
  (_, expr): TreeBuilder<Expr<any>, TreeNode> => {
    if (isSubExpr(expr)) {
      return TreeBuilder.supply([expr, createSeq], subExprBuilder);
    } else if (isNestedExpr(expr)) {
      if (ExprKey.Repeat in expr) {
        return repeatBuilder as TreeBuilder<Expr<any>, TreeNode>;
      } else if (ExprKey.Or in expr) {
        const orExpr = expr[ExprKey.Or];
        return TreeBuilder.supply([orExpr, createOr], subExprBuilder);
      } else if (ExprKey.Any in expr) {
        return TreeBuilder.supply([ANY_PRED, false], predNodeBuilder);
      } else if (ExprKey.Opt in expr) {
        const { [ExprKey.Opt]: optExpr } = expr;
        return TreeBuilder.supply({ _repeat: optExpr, max: 1 }, treeBuilder);
      } else if (ExprKey.Not in expr) {
        const { [ExprKey.Not]: notExpr } = expr;
        return TreeBuilder.supply([notExpr, true], matchNodeBuilder);
      } else if (ExprKey.Joined in expr) {
        return joinedBuilder as TreeBuilder<Expr<any>, TreeNode>;
      } else if (ExprKey.Pred in expr) {
        const { [ExprKey.Pred]: predFn, neg = false } = expr;
        return TreeBuilder.supply([predFn, neg], predNodeBuilder);
      }
    }

    return TreeBuilder.supply([expr, false], matchNodeBuilder);
  }
);

const INIT_STATE: TreeBuilder.State = {
  nextPosition: 0,
  nextRepeatNodeId: 0,
  indexToNodeMap: new Map(),
  endNodePositions: EMPTY_POSITIONS,
};

export const treeWithEndNodeBuilder: TreeBuilder<
  Expr<any>,
  TreeNode
> = TreeBuilder.chain(
  TreeBuilder.combine([treeBuilder, endNodeBuilder], ([treeNode, endNode]) =>
    createSeq(treeNode, endNode)
  )
);

export function createTreeWithEndNode(input: Expr<any>): {
  tree: TreeNode;
  indexToNodeMap: IndexToNodeMap;
  endNodePositions: Positions;
} {
  const [state, tree] = treeWithEndNodeBuilder(INIT_STATE, input);

  return {
    tree,
    indexToNodeMap: state.indexToNodeMap,
    endNodePositions: state.endNodePositions,
  };
}
