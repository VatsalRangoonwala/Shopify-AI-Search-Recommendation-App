export function buildFilterQuery(filtersConfig, userFilters) {
  let where = {};

  for (const filter of filtersConfig) {
    const userValue = userFilters[filter.name];

    if (!userValue) continue;

    switch (filter.field) {
      case "tags":
        where.tags = {
          hasSome: Array.isArray(userValue)
            ? userValue
            : [userValue],
        };
        break;

      case "price":
        where.price = {
          lt: parseFloat(userValue),
        };
        break;

      default:
        break;
    }
  }

  return where;
}