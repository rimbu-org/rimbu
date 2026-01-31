import { ErrBase } from '@rimbu/common/err';

export class InvalidCombineShapeError extends ErrBase.CustomError {
  constructor() {
    super('Invalid reducer combine shape supplied');
  }
}

export class ReducerHaltedError extends ErrBase.CustomError {
  constructor() {
    super('A halted reducer cannot receive more values');
  }
}
