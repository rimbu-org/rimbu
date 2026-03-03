import type { WithElem } from '@rimbu/collection-types/common';
import type { IndexRange } from '@rimbu/common/index-range';
import type { ListBase } from './list-base';

import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

export interface LeafChildrenOps<Tp extends ListBase.Types = ListBase.Types> {
	readonly _types: Tp;
	get<T, O = never>(
		c: Tp['leafChildren'],
		index: number,
		otherwise?: OptLazy<O>,
	): WithElem<Tp, T>['_T'] | O;
	of<T>(
		...values: Array<WithElem<Tp, T>['_T']>
	): WithElem<Tp, T>['leafChildren'];
	areTheSame(c1: Tp['leafChildren'], c2: Tp['leafChildren']): boolean;
	length(c: Tp['leafChildren']): number;
	stream<T>(
		c: WithElem<Tp, T>['leafChildren'],
		options: { reversed?: boolean },
	): Stream.NonEmpty<WithElem<Tp, T>['_T']>;
	streamRange<T>(
		c: WithElem<Tp, T>['leafChildren'],
		options: { indexRange: IndexRange; reversed?: boolean },
	): Stream<T>;
	toSpliced<T>(
		c: WithElem<Tp, T>['leafChildren'],
		start: number,
		deleteCount: number,
		...items: Array<WithElem<Tp, T>['_T']>
	): WithElem<Tp, T>['leafChildren'];
	prepend<T>(
		c: WithElem<Tp, T>['leafChildren'],
		value: WithElem<Tp, T>['_T'],
	): WithElem<Tp, T>['leafChildren'];
	append<T>(
		c: WithElem<Tp, T>['leafChildren'],
		value: WithElem<Tp, T>['_T'],
	): WithElem<Tp, T>['leafChildren'];
	toReversed<T>(
		c: WithElem<Tp, T>['leafChildren'],
	): WithElem<Tp, T>['leafChildren'];
	with<T>(
		c: WithElem<Tp, T>['leafChildren'],
		index: number,
		value: WithElem<Tp, T>['_T'],
	): WithElem<Tp, T>['leafChildren'];
	map<T, R>(
		c: WithElem<Tp, T>['leafChildren'],
		f: (value: WithElem<Tp, T>['_T'], index: number) => WithElem<Tp, R>['_T'],
		indexOffset?: number | undefined,
	): WithElem<Tp, R>['leafChildren'];
}

class ArrLeafChildrenOps implements LeafChildrenOps<ListBase.Types> {
	declare _types: ListBase.Types;
	get<T, O>(c: T[], index: number, otherwise?: OptLazy<O>): T | O {
		if (index < 0 || index >= c.length) {
			return OptLazy(otherwise!);
		}

		return c[index];
	}
	of = Array.of;
	areTheSame = Object.is;
	length(c: unknown[]) {
		return c.length;
	}
	stream<T>(c: T[], options: { reversed?: boolean }): Stream.NonEmpty<T> {
		return Stream.fromArray(c, options).assumeNonEmpty();
	}
	streamRange<T>(
		c: T[],
		options: { indexRange: IndexRange; reversed?: boolean },
	): Stream<T> {
		return Stream.fromArray(c, options);
	}
	toSpliced<T>(c: T[], start: number, deleteCount: number, ...items: T[]): T[] {
		return c.toSpliced(start, deleteCount, ...items);
	}
	prepend<T>(c: T[], value: T): T[] {
		return c.toSpliced(0, 0, value);
	}
	append<T>(c: T[], value: T): T[] {
		return c.toSpliced(c.length, 0, value);
	}
	toReversed<T>(c: T[]): T[] {
		return c.toReversed();
	}
	with<T>(c: T[], index: number, value: T): T[] {
		return c.with(index, value);
	}
	map<T, R>(c: T[], f: (value: T, index: number) => R, indexOffset = 0): R[] {
		return c.map((v, i) => f(v, i + indexOffset));
	}
}

interface StringTypes extends ListBase.Types {
	readonly leafChildren: string;
}

class StringLeafChildrenOps
	implements LeafChildrenOps<WithElem<StringTypes, string>>
{
	declare _types: WithElem<StringTypes, string>;
	get<T, O = never>(
		c: T & string,
		index: number,
		otherwise?: OptLazy<O>,
	): T | O {
		if (index < 0 || index >= c.length) {
			return OptLazy(otherwise!);
		}

		return c[index] as T;
	}
	of(...values: string[]): string {
		return values.join('');
	}
	areTheSame = Object.is;
	length(c: string) {
		return c.length;
	}
	stream(c: string, options: { reversed?: boolean }): Stream.NonEmpty<any> {
		return Stream.fromString(c, options).assumeNonEmpty();
	}
	streamRange(
		c: string,
		options: { indexRange: IndexRange; reversed?: boolean },
	): Stream<any> {
		return Stream.fromString(c, options);
	}
	toSpliced(
		c: string,
		start: number,
		deleteCount: number,
		...items: string[]
	): string {
		return c.slice(0, start) + items.join('') + c.slice(start + deleteCount);
	}
	prepend(c: string, value: string): string {
		return `${value[0]}${c}`;
	}
	append(c: string, value: string): string {
		return `${c}${value[0]}`;
	}
	toReversed(c: string): string {
		return Stream.fromString(c, { reversed: true }).join();
		// return c.split('').reverse().join('');
	}
	with(c: string, index: number, value: string) {
		return `${c.slice(0, index)}${value[0]}${c.slice(index + 1)}`;
	}
	map<T extends string>(
		c: string,
		f: (value: T & string, index: number) => string,
		indexOffset = 0,
	): string {
		return Stream.fromString(c)
			.map((v, i) => f(v as T, i + indexOffset))
			.join();
	}
}

interface BitTypes extends ListBase.Types {
	readonly leafChildren: bigint;
}

function construct(length: number, value: bigint): bigint {
	return BigInt(length) & (value << 5n);
}

class BitLeafChildrenOps
	implements LeafChildrenOps<WithElem<ListBase.Types, boolean>>
{
	declare _types: WithElem<ListBase.Types, boolean>;
	get<T, O = never>(c: bigint, index: number, otherwise?: OptLazy<O>): T | O {
		const length = this.length(c);
		if (index < 0 || index >= length) {
			return OptLazy(otherwise!);
		}

		const value = c >> 5n;
		return ((value & (1n << BigInt(index))) !== 0n) as T;
	}
	of(...values: boolean[]): bigint {
		let value = 0n;
		for (let i = 0; i < values.length; i++) {
			if (values[i]) {
				value |= 1n << BigInt(i);
			}
		}
		return construct(values.length, value);
	}
	areTheSame = Object.is;
	length(c: bigint): number {
		return Number(c & 31n);
	}
	stream(c: bigint, options: { reversed?: boolean }): Stream.NonEmpty<any> {
		const length = this.length(c);
		const value = c >> 5n;

		const maskStream = options.reversed
			? Stream.unfold(1n << BigInt(length - 1), (cur, index, stop) => {
					if (index >= length) return stop;
					return cur >> 1n;
				})
			: Stream.unfold(1n, (cur, index, stop) => {
					if (index >= length) return stop;
					return cur << 1n;
				});

		return maskStream.map((mask) => (value & mask) !== 0n);
	}
	streamRange(
		c: bigint,
		options: { indexRange: IndexRange; reversed?: boolean },
	): Stream<any> {
		const length = this.length(c);
		const value = c >> 5n;

		const maskStream = options.reversed
			? Stream.unfold(1n << BigInt(length - 1), (cur, index, stop) => {
					if (index >= length) return stop;
					return cur >> 1n;
				})
			: Stream.unfold(1n, (cur, index, stop) => {
					if (index >= length) return stop;
					return cur << 1n;
				});

		return maskStream.map((mask) => (value & mask) !== 0n);
	}
	toSpliced(
		c: bigint,
		start: number,
		deleteCount: number,
		...items: boolean[]
	): bigint {
		const length = this.length(c);
		const value = c >> 5n;

		let newValue = value;

		for (let i = 0; i < deleteCount; i++) {
			newValue &= ~(1n << BigInt(start + i));
		}

		for (let i = 0; i < items.length; i++) {
			if (items[i]) {
				newValue |= 1n << BigInt(start + i);
			} else {
				newValue &= ~(1n << BigInt(start + i));
			}
		}

		return construct(length - deleteCount + items.length, newValue);
	}
	prepend(c: bigint, value: boolean): bigint {
		const length = this.length(c);

		return construct(
			length + 1,
			((value ? 1n : 0n) << BigInt(length)) | (c >> 5n),
		);
	}
	append(c: bigint, value: boolean): bigint {
		const length = this.length(c);

		return construct(length + 1, (c >> 4n) & (value ? 1n : 0n));
	}
	toReversed(c: bigint): bigint {
		const length = this.length(c);
		let value = c >> 5n;

		let reversedValue = 0n;
		for (let i = 0; i < length; i++) {
			reversedValue <<= 1n;
			reversedValue |= value & 1n;
			value >>= 1n;
		}

		return construct(length, reversedValue);
	}
	with(c: bigint, index: number, value: boolean): bigint {
		return c & ((value ? 1n : 0n) << BigInt(index + 5));
	}
	map<T extends boolean>(
		c: bigint,
		f: (value: boolean & T, index: number) => boolean,
		indexOffset = 0,
	): bigint {
		const length = this.length(c);
		const value = c >> 5n;

		let newValue = 0n;
		for (let i = 0; i < length; i++) {
			const bitValue = (value & (1n << BigInt(i))) !== 0n;
			if (f(bitValue as boolean & T, i + indexOffset)) {
				newValue |= 1n << BigInt(i);
			}
		}

		return construct(length, newValue);
	}
}
