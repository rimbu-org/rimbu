import { expectNever, expectNotAssignable, expectType } from 'tsd';

import { Channel, DualChannel } from '@rimbu/channel';

expectType<Channel>(Channel.create());
expectType<DualChannel>(Channel.create());
expectType<Channel<void>>(Channel.create());
expectType<DualChannel<void>>(Channel.create());
expectNotAssignable<Channel>(Channel.create<string>());
expectNotAssignable<DualChannel>(Channel.create<string>());
expectType<Channel<string>>(Channel.create<string>());
expectType<DualChannel<string>>(Channel.create<string>());
expectType<DualChannel<string, string>>(Channel.create<string>());

expectType<Channel>(DualChannel.create());
expectType<DualChannel>(DualChannel.create());
expectType<Channel<void>>(DualChannel.create());
expectType<DualChannel<void>>(DualChannel.create());
expectNotAssignable<Channel>(DualChannel.create<string>());
expectNotAssignable<DualChannel>(DualChannel.create<string>());
expectType<Channel<string>>(DualChannel.create<string>());
expectType<DualChannel<string>>(DualChannel.create<string>());
expectType<DualChannel<string, string>>(DualChannel.create<string>());
expectType<DualChannel<string, number>>(DualChannel.create<string, number>());

const ch = DualChannel.create<number, string>();

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

expectType<DualChannel<string, number>>(
  DualChannel.combine(Channel.create<string>(), Channel.create<number>())
);

const ch2 = DualChannel.create<boolean, symbol>();

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
