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

export class ReducerClosedError extends ErrBase.CustomError {
	constructor() {
		super('A closed async reducer cannot perform more actions');
	}
}

export class ReducerNotInitializedError extends ErrBase.CustomError {
	constructor() {
		super('The async reducer instance was not yet initialized');
	}
}
