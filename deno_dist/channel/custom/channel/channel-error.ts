import { ErrBase } from '../../../common/mod.ts';

/**
 * The abstract base class/type for Channel Errors.
 */
export abstract class ChannelError extends ErrBase.CustomError {}

/**
 * Error indicating that a timeout has occurred during a Channel operation.
 */
export class TimeoutError extends ChannelError {
  constructor() {
    super('The operation timed out.');
  }
}

/**
 * Error indicating that a Channel operation was aborted.
 */
export class OperationAbortedError extends ChannelError {
  constructor() {
    super('The operation was aborted.');
  }
}

/**
 * Error indicating that a Channel is closed when performing an operation.
 */
export class ChannelClosedError extends ChannelError {
  constructor() {
    super('The channel is closed.');
  }
}

/**
 * Error indicating that a Channel is exhausted when performing an operation.
 */
export class ChannelExhaustedError extends ChannelError {
  constructor() {
    super('The channel is exhausted.');
  }
}

/**
 * Error indicating that a Channel message has an incorrect type.
 */
export class InvalidMessageTypeError extends ChannelError {
  constructor(readonly messageData: any) {
    super('The channel message has an invalid type.');
  }
}

/**
 * Error indicating that an attempt to send to a Channel failed because a send is already ongoing.
 */
export class AlreadyBusySendingError extends ChannelError {
  constructor() {
    super('Attempt to send while already busy sending.');
  }
}

/**
 * Error indicating that an attempt to read from a Channel failed because a read is already ongoing.
 */
export class AlreadyBusyReceivingError extends ChannelError {
  constructor() {
    super('Attempt to receive while already busy receiving.');
  }
}

/**
 * Error indicating that a Channel handshake failed.
 */
export class HandshakeError extends ChannelError {
  constructor() {
    super('Could not perform handshake.');
  }
}

/**
 * Returns true if the given object is an instance of a `ChannelError`.
 * @param obj - the value to test
 */
export function isChannelError(obj: any): obj is ChannelError {
  return obj instanceof ChannelError;
}
