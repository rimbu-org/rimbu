import { List } from '@rimbu/list';
import { createSerializer } from '../src';

describe('createSerializer', () => {
  it('works', () => {
    const ser = createSerializer();

    const c = List.createContext({ blockSizeBits: 2 });

    const s = ser.serialize(c.of(1, 2, 3));

    console.log(s);

    const d = ser.deserialize(s);

    console.log(d);
  });
});
