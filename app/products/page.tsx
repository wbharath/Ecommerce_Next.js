import ProductsContainer from '@/components/products/ProductsContainer'

async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<{ layout?: string; search?: string }>
}) {
  const params = await searchParams
  const layout = params.layout || 'grid'
  const search = params.search || ''

  // console.log('Search Params:', JSON.stringify(params))
  return <ProductsContainer layout={layout} search={search} />
}

export default ProductsPage
