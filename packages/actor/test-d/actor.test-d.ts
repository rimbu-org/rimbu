import { Actor, Obs } from '../src';
import { expectAssignable, expectNotAssignable, expectType } from 'tsd';

expectType<Actor<number>>(Actor.from(Obs.create(1), {}));
expectAssignable<Actor.Readonly<number>>(Actor.from(Obs.create(1), {}));

expectAssignable<Actor.Readonly<number>>(Obs.create(1));
expectAssignable<Actor<number>>(Obs.create(1));

expectNotAssignable<Actor<number>>(Actor.from(Obs.create(1), {}).obsReadonly);
