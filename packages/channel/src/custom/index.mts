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

export * from './utils/utils.mjs';

import * as ChannelError from './channel/channel-error.mjs';
export { ChannelError };
export * from './channel/channel.mjs';
export * from './channel/channel-impl.mjs';

import * as SemaphoreError from './sync/semaphore-error.mjs';
export { SemaphoreError };
export * from './sync/mutex.mjs';
export * from './sync/semaphore.mjs';
export * from './sync/semaphore-impl.mjs';

export * from './sync/wait-group.mjs';
export * from './sync/wait-group-impl.mjs';

export * from './cross-channel/cross-channel.mjs';

export * from './remote-channel/remote-channel.mjs';
export * from './remote-channel/remote-channel-impl.mjs';

export * from './remote-channel-server/remote-channel-server.mjs';
export * from './remote-channel-server/remote-channel-server-impl.mjs';

export * from './remote-channel-client/remote-channel-client.mjs';
export * from './remote-channel-client/remote-channel-client-impl.mjs';

import * as RpcProxyError from './rpc-proxy/rpc-proxy-error.mjs';
export { RpcProxyError };
export * from './rpc-proxy/rpc-proxy.mjs';
export * from './rpc-proxy/rpc-proxy-impl.mjs';

import * as RemoteObjectError from './remote-object/remote-object-error.mjs';
export { RemoteObjectError };
export * from './remote-object/remote-object.mjs';
export * from './remote-object/remote-object-impl.mjs';
