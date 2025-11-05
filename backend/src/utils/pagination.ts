// src/utils/pagination.ts
export function getPagination(page: number = 1, limit: number = 20) {
  const take = Math.max(1, Number(limit));
  const skip = Math.max(0, (Number(page) - 1) * take);

  return { skip, take };
}

// برای ساخت متادیتا خروجی API
export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return { total, page, limit, totalPages };
}
