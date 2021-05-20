import { RimbuError } from '../src';

describe('RimbuError', () => {
  it('throwEmptyCollectionAssumedNonEmptyError', () => {
    expect(() => RimbuError.throwEmptyCollectionAssumedNonEmptyError()).toThrow(
      RimbuError.EmptyCollectionAssumedNonEmptyError
    );
  });

  it('throwModifiedBuilderWhileLoopingOverItError', () => {
    expect(() =>
      RimbuError.throwModifiedBuilderWhileLoopingOverItError()
    ).toThrow(RimbuError.ModifiedBuilderWhileLoopingOverItError);
  });

  it('throwInvalidStateError', () => {
    expect(() => RimbuError.throwInvalidStateError()).toThrow(
      RimbuError.InvalidStateError
    );
  });

  it('throwInvalidUsageError', () => {
    expect(() => RimbuError.throwInvalidUsageError('invalid usage')).toThrow(
      RimbuError.InvalidUsageError
    );
  });
});
