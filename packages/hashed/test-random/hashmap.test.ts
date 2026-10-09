import { HashMap } from '@rimbu/hashed/map';
import { runMapRandomTestsWith } from '@rimbu/collection-types/test-utils/map/map-random';

// `HashMap.Context` does not declare `merge` / `mergeEach` / `mergeWith` /
// `mergeEachWith` / `collectionContext`, although `HashMapContext` implements
// every one of them (`internal/map/context.ts`) and the harness's
// `KeyedContextApi` requires them. So each context needs an `as any` here.
// Untyped `merge` family — not legacy `RMap`.
//
// The default case additionally needs a suppression: once the context is `any`,
// an explicit type argument is rejected (TS2347, "untyped function calls may
// not accept type arguments"). `@ts-expect-error` rather than `@ts-ignore` so
// this line fails if the underlying gap is ever fixed.
// @ts-expect-error untyped context cannot take an explicit type argument
runMapRandomTestsWith('HashMap default', (HashMap as any).createContext<number>({}));

runMapRandomTestsWith(
	'HashMap blocksize 2',
	(HashMap as any).createContext({ blockSizeBits: 2 }),
);

runMapRandomTestsWith(
	'HashMap blocksize 3',
	(HashMap as any).createContext({ blockSizeBits: 3 }),
);
