import type { Deep } from '@rimbu/deep';

import { type Actor, Slice } from './internal.mjs';

export interface PaginationState {
  page: number;
  pageSize: number;
  lastPage?: number | undefined;
  totalItems?: number | undefined;
}

export interface InitPaginationState {
  page?: number | undefined;
  pageSize?: number | undefined;
  totalItems?: number | undefined;
}

function getLastPage(
  totalItems: number | undefined,
  pageSize: number
): number | undefined {
  if (totalItems === undefined) {
    return undefined;
  }
  return Math.ceil(totalItems / pageSize);
}

export function createPagination(initState?: InitPaginationState): Slice<
  PaginationState,
  Actor.Actions<{
    nextPage: () => void;
    previousPage: () => void;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
    setTotalItems: (totalItems?: number | undefined) => void;
    reset: () => void;
  }>
> {
  return Slice.create({
    initState: () => {
      const { page = 1, pageSize = 10, totalItems } = initState ?? {};

      return {
        page,
        pageSize,
        totalItems,
        lastPage: getLastPage(totalItems, pageSize),
      } as PaginationState;
    },
    actions: {
      nextPage: (state) => {
        if (state.lastPage !== undefined && state.page >= state.lastPage) {
          return state;
        }
        return { ...state, page: state.page + 1 };
      },
      previousPage: (state) => {
        if (state.page <= 1) {
          return state;
        }
        return { ...state, page: state.page - 1 };
      },
      setPage: (state, page: number) => {
        if (
          page === state.page ||
          page < 1 ||
          page > (state.lastPage ?? page)
        ) {
          return state;
        }
        return { ...state, page };
      },
      setPageSize: (state, pageSize: number) => {
        if (pageSize < 1) {
          return state;
        }

        const lastPage = getLastPage(state.totalItems, pageSize);

        return {
          ...state,
          pageSize,
          page: Math.min(state.page, lastPage ?? state.page),
          lastPage,
        };
      },
      setTotalItems: (
        state,
        totalItems?: number | undefined
      ): PaginationState => {
        return {
          ...state,
          totalItems,
          lastPage: getLastPage(totalItems, state.pageSize),
        };
      },
      reset: (
        _,
        initState?: InitPaginationState | undefined
      ): PaginationState => {
        const { page = 1, pageSize = 10, totalItems } = initState ?? {};
        return {
          page,
          pageSize,
          totalItems,
          lastPage: getLastPage(totalItems, pageSize),
        };
      },
    },
  });
}

export const PaginationDerivedSelector = {
  isFirstPage: (state): boolean => state.page <= 1,
  isLastPage: (state): boolean =>
    state.lastPage !== undefined && state.page >= state.lastPage,
} satisfies Deep.Selector<PaginationState>;
