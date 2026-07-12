import { throwInvalidUsageError } from '@rimbu/base/rimbu-error';

export type ModifyOptions<T> = {
	ifNew?:
		| { set: T; create?: never }
		| {
				set?: never;
				create: <SKIP extends symbol>(skip: SKIP) => T | typeof skip;
		  };
	ifExists?:
		| { set: T; update?: never }
		| {
				set?: never;
				update: <REMOVE extends symbol>(
					current: T,
					remove: REMOVE,
				) => T | REMOVE;
		  };
};

export function checkEmptyModifyOptions(options: {
	ifNew?: { set?: any; create?: any };
	ifExists?: { set?: any; update?: any };
}): boolean {
	const { ifNew, ifExists } = options;
	if (undefined === ifNew) {
		if (undefined === ifExists) {
			return true;
		} else if ('set' in ifExists === 'update' in ifExists) {
			throwInvalidUsageError(
				'modifyAt: if provided, ifExists must have either set or update defined',
			);
		}
	} else if ('set' in ifNew === 'create' in ifNew) {
		throwInvalidUsageError(
			'modifyAt: if provided, ifNew must have either set or create defined',
		);
	}

	return false;
}

export type VariantModifyOptions<T> = {
	ifNew?:
		| { set: T; create?: never }
		| {
				set?: never;
				create: <SKIP extends symbol>(skip: SKIP) => T | typeof skip;
		  };
	ifExists?:
		| { set: T; update?: never }
		| {
				set?: never;
				update: <REMOVE extends symbol, T2 extends T = T>(
					current: T | T2,
					remove: REMOVE,
				) => T | REMOVE;
		  };
};

export type VariantUpdate<T> = <T2 extends T>(value: T & T2) => T;
