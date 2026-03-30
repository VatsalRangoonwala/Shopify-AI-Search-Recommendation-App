export async function fetchProductsBatch(admin, cursor = null) {
  const query = `
    query ($cursor: String) {
      products(first: 50, after: $cursor) {
        edges {
          cursor
          node {
            id
            title
            description
            tags
            variants(first: 1) {
              edges {
                node {
                  price
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  const response = await admin.graphql(query, {
    variables: { cursor },
  });

  const data = await response.json();

  const edges = data.data.products.edges;

  return {
    products: edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      tags: edge.node.tags,
      price: parseFloat(
        edge.node.variants.edges[0]?.node.price || 0
      ),
    })),
    nextCursor: edges.length ? edges[edges.length - 1].cursor : null,
    hasNextPage: data.data.products.pageInfo.hasNextPage,
  };
}