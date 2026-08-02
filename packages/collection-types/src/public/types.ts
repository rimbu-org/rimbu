export declare namespace Op {
	export type WithResult<Col, Result, HasResult extends boolean = boolean> = {
		collection: Col;
		hasResult: HasResult;
		result: Result;
		hasChanged: boolean;
	};

	export type DynamicResult<
		ColNoResult,
		NoResult,
		Result = NoResult,
		ColWithResult = ColNoResult,
	> =
		| WithResult<ColNoResult, NoResult, false>
		| WithResult<ColWithResult, Result, true>;
}
