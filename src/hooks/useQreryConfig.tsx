import { ProductListConfig } from 'src/types/product.type'
import useQueryParams from './useQueryParams'
import { isUndefined, omitBy } from 'lodash'
export type QueryConfig = {
  [key in keyof ProductListConfig]: string
}
export default function useQreryConfig() {
  const queryParams: QueryConfig = useQueryParams()
  // chỉ lấy những acsi này từ query params thôi
  // phòng trường hợp ng dùng nhập bừa

  const queryConfig: QueryConfig = omitBy(
    {
      page: queryParams.page || '1',
      limit: queryParams.limit || '10',
      sort_by: queryParams.sort_by,
      exclude: queryParams.exclude,
      name: queryParams.name,
      order: queryParams.order,
      price_max: queryParams.price_max,
      price_min: queryParams.price_min,
      rating_filter: queryParams.rating_filter,
      category: queryParams.category
    },
    isUndefined
  )
  return queryConfig
}
