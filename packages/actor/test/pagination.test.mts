import { Actor, createPagination } from '@rimbu/actor';

describe('Pagination', () => {
  it('starts with expected initial state', () => {
    const paginationSlice = createPagination();

    const actor = Actor.configure(paginationSlice).build();

    expect(actor.state).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: undefined,
      lastPage: undefined,
    });
  });
});
