import { useQuery } from '@tanstack/react-query'
import SortProductList from './components/SortProductList'
import AsideFilter from './components/asideFilter'
import Product from './components/product'
import productApi from 'src/apis/product.api'
import Pagination from 'src/components/paginate'
import { ProductListConfig } from 'src/types/product.type'
import categoryApi from 'src/apis/category.api'
import useQreryConfig from 'src/hooks/useQreryConfig'
import { Helmet } from 'react-helmet'

export default function ProductList() {
  // chỉ lấy những acsi này từ query params thôi
  // phòng trường hợp ng dùng nhập bừa
  const queryConfig = useQreryConfig()

  const { data: productData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    keepPreviousData: true,
    //khi mà tìm áo thun rồi => ấn vào 1 cái để ra detail
    // xong lại tìm các cái lq => lại gọi lại api lần nữa => ko nên
    // tăng stale time lên
    staleTime: 3 * 60 * 1000
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      return categoryApi.getCategories()
    }
  })
  return (
    <div className='py-6 bg-gray-200'>
      <Helmet>
        <title>Trang chủ ShopeeClone</title>
        <meta name='description' content='Trang chủ ShopeeClone' />
      </Helmet>
      <div className='container'>
        {productData && (
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-3'>
              <AsideFilter queryConfig={queryConfig} categories={categoriesData?.data.data || []}></AsideFilter>
            </div>
            <div className='col-span-9'>
              <SortProductList
                queryConfig={queryConfig}
                pageSize={productData.data.data.pagination.page_size}
              ></SortProductList>
              <div className='grid grid-cols-2 gap-3 mt-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
                {productData.data.data.products.map((product) => (
                  <div className='col-span-1' key={product._id}>
                    <Product product={product}></Product>
                  </div>
                ))}
              </div>
              <Pagination queryConfig={queryConfig} pageSize={productData.data.data.pagination.page_size} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
