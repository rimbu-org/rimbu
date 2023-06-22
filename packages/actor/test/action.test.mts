import { Action } from '../src/main';
import crypto from 'crypto';

const mockRandomUUID = jest.fn();

describe('Action', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    crypto.randomUUID = mockRandomUUID;
  });

  it('simple', () => {
    const id = 'abcdef';
    mockRandomUUID.mockReturnValue(id);

    const actionCreator = Action.create({ createTag: mockRandomUUID });

    const action = actionCreator();

    expect(action.payload).toBeUndefined();
    expect(action.tag).toBe(id);
    expect(action.type).toBe(`ANON_${id}`);
  });

  it('typed payload', () => {
    const id = 'abcdef';
    mockRandomUUID.mockReturnValue(id);

    const actionCreator = Action.create<string>({ createTag: mockRandomUUID });

    const payload = 'payload';
    const action = actionCreator(payload);

    expect(action.payload).toBe(payload);
    expect(action.tag).toBe(id);
    expect(action.type).toBe(`ANON_${id}`);
  });

  it('payload creator', () => {
    const id = 'abcdef';
    mockRandomUUID.mockReturnValue(id);

    const actionCreator = Action.create({
      createPayload: (value1: string, value2: number) => ({ value1, value2 }),
      createTag: mockRandomUUID,
    });

    const value1 = 'value1';
    const value2 = 5;

    const action = actionCreator(value1, value2);

    expect(action.payload).toEqual({ value1, value2 });
    expect(action.tag).toBe(id);
    expect(action.type).toBe(`ANON_${id}`);
  });

  it('stores given type', () => {
    const id = 'abcdef';
    mockRandomUUID.mockReturnValue(id);

    const type = 'MY_TYPE';
    const actionCreator = Action.create({ type, createTag: mockRandomUUID });

    const action = actionCreator();

    expect(action.type).toBe(type);
    expect(action.tag).toBe(id);
  });

  it('uses custom tag', () => {
    const id = 'abcdef';
    mockRandomUUID.mockReturnValue(id);

    const customTag = 'customtag';

    const actionCreator = Action.create({ createTag: () => customTag });

    const action = actionCreator();

    expect(action.tag).toBe(customTag);
    expect(action.type).toBe(`ANON_${customTag}`);
  });
});
