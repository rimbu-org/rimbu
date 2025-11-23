/**
 * @packageDocumentation
 *
 * The `@rimbu/channel/custom` entry exposes the internal channel, cross‑channel, remote
 * channel, RPC proxy and synchronization implementations that underlie the main
 * `@rimbu/channel` API, along with their associated error types and utilities.<br/>
 * Use this entry only when you need low‑level building blocks to construct custom
 * channel‑based protocols or concurrency primitives; for normal usage prefer the main
 * `@rimbu/channel` entry.
 */

export * from './utils/utils.ts';

import * as ChannelError from './channel/channel-error.ts';
export { ChannelError };
export * from './channel/channel.ts';
export * from './channel/channel-impl.ts';

import * as SemaphoreError from './sync/semaphore-error.ts';
export { SemaphoreError };
export * from './sync/mutex.ts';
export * from './sync/semaphore.ts';
export * from './sync/semaphore-impl.ts';

export * from './sync/wait-group.ts';
export * from './sync/wait-group-impl.ts';

export * from './cross-channel/cross-channel.ts';

export * from './remote-channel/remote-channel.ts';
export * from './remote-channel/remote-channel-impl.ts';

export * from './remote-channel-server/remote-channel-server.ts';
export * from './remote-channel-server/remote-channel-server-impl.ts';

export * from './remote-channel-client/remote-channel-client.ts';
export * from './remote-channel-client/remote-channel-client-impl.ts';

import * as RpcProxyError from './rpc-proxy/rpc-proxy-error.ts';
export { RpcProxyError };
export * from './rpc-proxy/rpc-proxy.ts';
export * from './rpc-proxy/rpc-proxy-impl.ts';

import * as RemoteObjectError from './remote-object/remote-object-error.ts';
export { RemoteObjectError };
export * from './remote-object/remote-object.ts';
export * from './remote-object/remote-object-impl.ts';
