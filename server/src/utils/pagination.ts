export interface PaginationParams {
  page: number;
  perPage: number;
  offset: number;
}

export function parsePagination(query: Record<string, any>, defaultPerPage = 20): PaginationParams {
  const page    = Math.max(1, Number(query.page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(query.per_page) || defaultPerPage));
  return { page, perPage, offset: (page - 1) * perPage };
}

export function paginationMeta(total: number, page: number, perPage: number) {
  return {
    total,
    per_page: perPage,
    current_page: page,
    last_page: Math.max(1, Math.ceil(total / perPage)),
    from: total === 0 ? 0 : (page - 1) * perPage + 1,
    to: Math.min(total, page * perPage),
  };
}
