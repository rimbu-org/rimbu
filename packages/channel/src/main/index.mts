/**
 * @packageDocumentation
 *
 * The `@rimbu/channel` package provides various channel implementations in the spirit of Go. Channels are ways to exechange synchronous messages
 * in an asynchronous context.<br/>
 * <br/>
 * See the [Rimbu docs Channel API page](/api/rimbu/channel) for more information.
 */

export {
  Channel,
  CrossChannel,
  Mutex,
  RemoteChannel,
  RemoteChannelClient,
  RemoteChannelServer,
  RemoteObject,
  RpcProxy,
  Semaphore,
  WaitGroup,
  type ChannelError,
  type RemoteObjectError,
  type RpcProxyError,
  type SemaphoreError,
} from '../custom/index.mjs';
