export const getResultsByPage = (
  results: unknown[],
  page: number,
  limit: number
) => results.slice((page - 1) * limit, page * limit);
