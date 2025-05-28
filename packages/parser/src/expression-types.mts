export type Expr<T> = NestedExpr<T> | SubExpr<T>;

export type NestedExpr<T> =
  | OrExpr<T>
  | RepeatExpr<T>
  | AnyExpr
  | PredExpr<T>
  | OptExpr<T>
  | NotExpr<T>
  | JoinedExpr<T>;

export type SubExpr<T> = Array<T | Expr<T>>;

export enum ExprKey {
  Repeat = '_repeat',
  Pred = '_pred',
  Not = '_not',
  Or = '_or',
  Opt = '_opt',
  Any = '_any',
  Joined = '_joined',
}

export interface RepeatExpr<T> {
  [ExprKey.Repeat]: SubExpr<T>;
  min?: number | undefined;
  max?: number | undefined;
}

export interface PredExpr<T> {
  [ExprKey.Pred]: (value: T) => boolean;
  neg?: boolean | undefined;
}

export interface NotExpr<T> {
  [ExprKey.Not]: T;
}

export interface OrExpr<T> {
  [ExprKey.Or]: SubExpr<T>;
}

export interface OptExpr<T> {
  [ExprKey.Opt]: SubExpr<T>;
}

export interface AnyExpr {
  [ExprKey.Any]: true;
}

export interface JoinedExpr<T> {
  [ExprKey.Joined]: SubExpr<T>;
  start?: SubExpr<T> | undefined;
  sep?: SubExpr<T> | undefined;
  end?: SubExpr<T> | undefined;
  min?: number | undefined;
  max?: number | undefined;
}

export function isNestedExpr(input: any): input is NestedExpr<any> {
  if (typeof input !== 'object') {
    return false;
  }

  for (const exprKey of Object.values(ExprKey)) {
    if (exprKey in input) {
      return true;
    }
  }

  return false;
}

export function isSubExpr(input: any): input is SubExpr<any> {
  return Array.isArray(input);
}

export function isExpr(input: any): input is Expr<any> {
  return isSubExpr(input) || isNestedExpr(input);
}
