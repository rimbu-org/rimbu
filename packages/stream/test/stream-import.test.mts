import { StreamFactory } from '#stream/factory';
import { Stream } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

console.log(
  Reducer.createMono(
    () => 1,
    (a, v: number) => v
  )
);
console.log(StreamFactory().isEmptyStreamSourceInstance(1 as any));
console.log(Stream.empty());
