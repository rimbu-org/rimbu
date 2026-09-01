class A<T> {
	a(): [number, T] {
		return 0 as any;
	}
}

function withB<Q, TBase extends new (...args: any[]) => A<Q>>(
	Base: TBase,
): TBase & (new (...args: any[]) => { b(value: any): Q }) {
	return class A extends Base {
		b(): Q {
			return 1 as any;
		}
	};
}

const AB = withB(A);

const ab = new AB();
ab.a();
ab.b();

const c = withB<boolean, typeof A<boolean>>(A);

const d = new c();
d.a();
d.b('abc');
