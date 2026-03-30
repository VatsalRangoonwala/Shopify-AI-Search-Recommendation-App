export function buildSortingQuery(sortConfig, selectedSort) {
  const sort = sortConfig.find(s => s.name === selectedSort);

  if (!sort) return { createdAt: "desc" };

  return {
    [sort.field]: sort.order,
  };
}