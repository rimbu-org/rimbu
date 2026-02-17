import { expectTypeOf } from 'bun:test';

import { Channel } from '@rimbu/channel';
import { CrossChannel } from '@rimbu/channel/cross-channel';

expectTypeOf(Channel.create()).toEqualTypeOf<Channel>();
expectTypeOf(Channel.create()).toEqualTypeOf<CrossChannel>();
expectTypeOf(Channel.create()).toEqualTypeOf<Channel<void>>();
expectTypeOf(Channel.create()).toEqualTypeOf<CrossChannel<void>>();
expectTypeOf(Channel.create<string>()).not.toExtend<Channel>();
expectTypeOf(Channel.create<string>()).not.toExtend<CrossChannel>();
expectTypeOf(Channel.create<string>()).toEqualTypeOf<Channel<string>>();
expectTypeOf(Channel.create<string>()).toEqualTypeOf<CrossChannel<string>>();
expectTypeOf(Channel.create<string>()).toEqualTypeOf<
	CrossChannel<string, string>
>();

expectTypeOf(CrossChannel.createPair()[0]).toEqualTypeOf<Channel>();
expectTypeOf(CrossChannel.createPair()[0]).toEqualTypeOf<CrossChannel>();
expectTypeOf(CrossChannel.createPair()[0]).toEqualTypeOf<Channel<void>>();
expectTypeOf(CrossChannel.createPair()[0]).toEqualTypeOf<CrossChannel<void>>();
expectTypeOf(CrossChannel.createPair<string>()[0]).not.toExtend<Channel>();
expectTypeOf(CrossChannel.createPair<string>()[0]).not.toExtend<CrossChannel>();
expectTypeOf(CrossChannel.createPair<string>()[0]).toEqualTypeOf<
	Channel<string>
>();
expectTypeOf(CrossChannel.createPair<string>()[0]).toEqualTypeOf<
	CrossChannel<string>
>();
expectTypeOf(CrossChannel.createPair<string>()[0]).toEqualTypeOf<
	CrossChannel<string, string>
>();
expectTypeOf(CrossChannel.createPair<string, number>()[0]).toEqualTypeOf<
	CrossChannel<string, number>
>();

const ch = CrossChannel.createPair<number, string>()[0];

expectTypeOf(await ch.send(1)).toEqualTypeOf<undefined | Channel.Error>();
expectTypeOf(
	await ch.send(1, { catchChannelErrors: undefined }),
).toEqualTypeOf<void>();
expectTypeOf(
	await ch.send(1, { catchChannelErrors: false }),
).toEqualTypeOf<void>();
expectTypeOf(await ch.send(1, { catchChannelErrors: true })).toEqualTypeOf<
	undefined | Channel.Error
>();
expectTypeOf(
	await ch.send(1, { catchChannelErrors: 1 as any as boolean }),
).toEqualTypeOf<undefined | Channel.Error>();

expectTypeOf(await ch.receive()).toEqualTypeOf<string>();
expectTypeOf(await ch.receive({ recover: undefined })).toEqualTypeOf<string>();
expectTypeOf(await ch.receive({ recover: () => true })).toEqualTypeOf<
	string | boolean
>();

expectTypeOf(ch.readable()).toEqualTypeOf<Channel.Read<string>>();
expectTypeOf(ch.writable()).toEqualTypeOf<Channel.Write<number>>();

expectTypeOf(
	CrossChannel.combine(Channel.create<string>(), Channel.create<number>()),
).toEqualTypeOf<CrossChannel<string, number>>();

const ch2 = CrossChannel.createPair<boolean, symbol>()[0];

expectTypeOf(await Channel.select([])).toEqualTypeOf<never>();

expectTypeOf(await Channel.select([ch])).toEqualTypeOf<string>();
expectTypeOf(
	await Channel.select([ch], { recover: undefined }),
).toEqualTypeOf<string>();
expectTypeOf(await Channel.select([ch], { recover: () => true })).toEqualTypeOf<
	string | boolean
>();

expectTypeOf(await Channel.select([ch, ch2])).toEqualTypeOf<string | symbol>();
expectTypeOf(
	await Channel.select([ch, ch2], { recover: undefined }),
).toEqualTypeOf<string | symbol>();
expectTypeOf(
	await Channel.select([ch, ch2], { recover: () => true }),
).toEqualTypeOf<string | symbol | boolean>();

expectTypeOf(await Channel.selectMap({})).toEqualTypeOf<never>();
expectTypeOf(
	await Channel.selectMap({ recover: undefined }),
).toEqualTypeOf<never>();
expectTypeOf(
	await Channel.selectMap({ recover: () => true }),
).toEqualTypeOf<boolean>();

expectTypeOf(
	await Channel.selectMap({}, [ch, (v) => v]),
).toEqualTypeOf<string>();
expectTypeOf(
	await Channel.selectMap({}, [ch, () => true]),
).toEqualTypeOf<boolean>();
expectTypeOf(
	await Channel.selectMap({}, [ch, (v) => v], [ch2, (v) => v]),
).toEqualTypeOf<string | symbol>();
expectTypeOf(
	await Channel.selectMap({}, [ch, (v) => true], [ch2, (v) => 5]),
).toEqualTypeOf<boolean | number>();
expectTypeOf(
	await Channel.selectMap(
		{ recover: undefined },
		[ch, (v) => true],
		[ch2, (v) => 5],
	),
).toEqualTypeOf<boolean | number>();
expectTypeOf(
	await Channel.selectMap(
		{ recover: () => 'a' },
		[ch, (v) => true],
		[ch2, (v) => 5],
	),
).toEqualTypeOf<boolean | number | string>();
