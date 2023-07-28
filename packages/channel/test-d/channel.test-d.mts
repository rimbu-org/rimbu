import { expectNever, expectNotAssignable, expectType } from 'tsd';

import { Channel, CrossChannel } from '@rimbu/channel';

expectType<Channel>(Channel.create());
expectType<CrossChannel>(Channel.create());
expectType<Channel<void>>(Channel.create());
expectType<CrossChannel<void>>(Channel.create());
expectNotAssignable<Channel>(Channel.create<string>());
expectNotAssignable<CrossChannel>(Channel.create<string>());
expectType<Channel<string>>(Channel.create<string>());
expectType<CrossChannel<string>>(Channel.create<string>());
expectType<CrossChannel<string, string>>(Channel.create<string>());

expectType<Channel>(CrossChannel.createPair()[0]);
expectType<CrossChannel>(CrossChannel.createPair()[0]);
expectType<Channel<void>>(CrossChannel.createPair()[0]);
expectType<CrossChannel<void>>(CrossChannel.createPair()[0]);
expectNotAssignable<Channel>(CrossChannel.createPair<string>()[0]);
expectNotAssignable<CrossChannel>(CrossChannel.createPair<string>()[0]);
expectType<Channel<string>>(CrossChannel.createPair<string>()[0]);
expectType<CrossChannel<string>>(CrossChannel.createPair<string>()[0]);
expectType<CrossChannel<string, string>>(CrossChannel.createPair<string>()[0]);
expectType<CrossChannel<string, number>>(
  CrossChannel.createPair<string, number>()[0]
);

const ch = CrossChannel.createPair<number, string>()[0];

expectType<undefined | Channel.Error>(await ch.send(1));
expectType<void>(await ch.send(1, { catchChannelErrors: undefined }));
expectType<void>(await ch.send(1, { catchChannelErrors: false }));
expectType<undefined | Channel.Error>(
  await ch.send(1, { catchChannelErrors: true })
);
expectType<undefined | Channel.Error>(
  await ch.send(1, { catchChannelErrors: 1 as any as boolean })
);

expectType<string>(await ch.receive());
expectType<string>(await ch.receive({ recover: undefined }));
expectType<string | boolean>(await ch.receive({ recover: () => true }));

expectType<Channel.Read<string>>(ch.readable());
expectType<Channel.Write<number>>(ch.writable());

expectType<CrossChannel<string, number>>(
  CrossChannel.combine(Channel.create<string>(), Channel.create<number>())
);

const ch2 = CrossChannel.createPair<boolean, symbol>()[0];

expectNever(await Channel.select([]));

expectType<string>(await Channel.select([ch]));
expectType<string>(await Channel.select([ch], { recover: undefined }));
expectType<string | boolean>(
  await Channel.select([ch], { recover: () => true })
);

expectType<string | symbol>(await Channel.select([ch, ch2]));
expectType<string | symbol>(
  await Channel.select([ch, ch2], { recover: undefined })
);
expectType<string | symbol | boolean>(
  await Channel.select([ch, ch2], { recover: () => true })
);

expectNever(await Channel.selectMap({}));
expectNever(await Channel.selectMap({ recover: undefined }));
expectType<boolean>(await Channel.selectMap({ recover: () => true }));

expectType<string>(await Channel.selectMap({}, [ch, (v) => v]));
expectType<boolean>(await Channel.selectMap({}, [ch, () => true]));
expectType<string | symbol>(
  await Channel.selectMap({}, [ch, (v) => v], [ch2, (v) => v])
);
expectType<boolean | number>(
  await Channel.selectMap({}, [ch, (v) => true], [ch2, (v) => 5])
);
expectType<boolean | number>(
  await Channel.selectMap(
    { recover: undefined },
    [ch, (v) => true],
    [ch2, (v) => 5]
  )
);
expectType<boolean | number | string>(
  await Channel.selectMap(
    { recover: () => 'a' },
    [ch, (v) => true],
    [ch2, (v) => 5]
  )
);
