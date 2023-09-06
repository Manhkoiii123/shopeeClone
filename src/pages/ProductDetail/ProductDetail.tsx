import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import productApi from 'src/apis/product.api'
import ProductRating from 'src/components/ProductRating'
import { formatCurrency, formatNumberToSocialStyle, getIdFromNameId, rateSale } from 'src/utils/utils'
import DOMPurify from 'dompurify'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Product as ProductType, ProductListConfig } from 'src/types/product.type'
import Product from '../productList/components/product'
import QuantityController from 'src/components/quantityController'
import purchaseApi from 'src/apis/purchase.api'
import { purchasesStatus } from 'src/constants/purchase'
import { toast } from 'react-toastify'
import path from 'src/constants/path'
import { Helmet } from 'react-helmet'
export default function ProductDetail() {
  const queryClient = useQueryClient()
  const { nameId } = useParams()
  const id = getIdFromNameId(nameId as string)
  const { data: productDetailData } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductDetail(id as string)
  })

  const product = productDetailData?.data.data
  const queryConfig = { limit: '10', page: '1', category: product?.category._id }
  const { data: productData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => {
      return productApi.getProducts(queryConfig as ProductListConfig)
    },
    enabled: Boolean(product),
    staleTime: 3 * 60 * 1000
  })
  const [currentIndexImages, setCurrentIndexImages] = useState([0, 5])

  const [activeImage, setActiveImage] = useState('')

  const currentImages = useMemo(
    () => (product ? product.images.slice(...currentIndexImages) : []),
    [product, currentIndexImages]
  )

  useEffect(() => {
    if (product && product.images.length > 0) {
      setActiveImage(product.images[0])
    }
  }, [product])

  //hover vào ảnh nào thì set cái ảnh đó active
  const chooseActive = (img: string) => {
    setActiveImage(img)
  }

  // next
  const next = () => {
    if (currentIndexImages[1] < (product as ProductType)?.images.length) {
      setCurrentIndexImages((prev) => [prev[0] + 1, prev[1] + 1])
    }
  }
  const prev = () => {
    if (currentIndexImages[0] > 0) {
      setCurrentIndexImages((prev) => [prev[0] - 1, prev[1] - 1])
    }
  }
  const imageRef = useRef<HTMLImageElement>(null)
  const handleZoom = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const image = imageRef.current as HTMLImageElement
    // lấy gt nguyên bản ra
    const { naturalHeight, naturalWidth } = image
    //lấy ra thông số của thẻ div bọc ngoài
    const rect = e.currentTarget.getBoundingClientRect()
    //làm sao để tính được top và left
    const { offsetY, offsetX } = e.nativeEvent
    // console.log(offsetX, offsetY)
    const top = offsetY * (1 - naturalHeight / rect.height)
    const left = offsetX * (1 - naturalWidth / rect.width)
    // đău về gt nguyên bản
    image.style.width = naturalWidth + 'px'
    image.style.height = naturalHeight + 'px'
    image.style.top = top + 'px'
    image.style.left = left + 'px'

    // cái chiều rộng nó bị giới hạn => bỏ cái maxW đi
    image.style.maxWidth = 'unset'
    //lại to quá ngoài cái relavtive => over hidden
    //di chuyển vị trí sao cho đúng là ok
    //di chuyển top về âm để cho nó chạy lên
    // tương tụ với cái left
  }
  const handleRemoveZoom = () => {
    imageRef.current?.removeAttribute('style')
  }

  // quantity controller
  const [buyCount, setBuyCount] = useState(1)
  const handleBuyCount = (value: number) => {
    setBuyCount(value)
  }

  // add to cart
  const addToCartMutation = useMutation(purchaseApi.addTocart)
  const addToCart = () => {
    addToCartMutation.mutate(
      { buy_count: buyCount, product_id: product?._id as string },
      {
        onSuccess: (data) => {
          toast.success(data.data.message, { autoClose: 2000 })
          queryClient.invalidateQueries({ queryKey: ['purchases', { status: purchasesStatus.inCart }] })
        }
      }
    )
  }

  // mua ngay
  const navigate = useNavigate()
  const buyNow = async () => {
    const res = await addToCartMutation.mutateAsync({ buy_count: buyCount, product_id: product?._id as string })
    const purchases = res.data.data
    navigate(path.cart, {
      state: {
        purchasesId: purchases._id
      }
    })
  }

  if (!product) return null
  return (
    <div className='py-6 bg-gray-200'>
      <Helmet>
        <title>{product.name} | ShopeeClone</title>
        <meta name='description' content='chi tiết sản phẩm' />
      </Helmet>
      <div className='container'>
        <div className='p-4 bg-white shadow'>
          <div className='grid grid-cols-12 gap-9'>
            <div className='col-span-5'>
              {/* pt[100%] để cho ảnh luôn có 2 cạnh bằng nhau */}
              <div
                className='relative w-full pt-[100%] shadow overflow-hidden cursor-zoom-in'
                onMouseMove={handleZoom}
                onMouseLeave={handleRemoveZoom}
              >
                <img
                  src={activeImage}
                  alt={product.name}
                  ref={imageRef}
                  className='absolute top-0 left-0 object-cover w-full h-full bg-white pointer-events-none'
                />
              </div>

              <div className='relative grid grid-cols-5 gap-1 mt-4'>
                <button
                  onClick={prev}
                  className='absolute left-0 z-10 w-5 text-white -translate-y-1/2 bg-black top-1/2 h-9 opacity-20'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
                  </svg>
                </button>
                {currentImages.map((img) => {
                  const isActive = img === activeImage
                  return (
                    <div className='relative w-full pt-[100%] ' key={img} onMouseEnter={() => chooseActive(img)}>
                      <img
                        src={img}
                        alt={product.name}
                        className='absolute top-0 left-0 object-cover w-full h-full bg-white cursor-pointer'
                      />
                      {isActive && <div className='absolute inset-0 border-2 border-orange'></div>}
                    </div>
                  )
                })}
                <button
                  onClick={next}
                  className='absolute right-0 z-10 w-5 text-white -translate-y-1/2 bg-black top-1/2 h-9 opacity-20'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                  </svg>
                </button>
              </div>
            </div>
            <div className='col-span-7'>
              <h1 className='text-xl font-medium uppercase'>{product.name}</h1>
              <div className='flex items-center mt-8'>
                <div className='flex items-center'>
                  <span className='mr-1 border-b border-b-orange text-orange'>{product.rating}</span>
                  <ProductRating
                    rating={product.rating}
                    activeClassname='fill-orange text-orange h-4 w-4'
                    nonActiveClassname='fill-current text-gray-300 h-4 w-4'
                  ></ProductRating>
                </div>
                <div className='mx-4 h-4 w-[1px] bg-gray-300'></div>
                <div>
                  <span>{formatNumberToSocialStyle(product.sold)}</span>
                  <span className='ml-1 text-gray-500'>Đã bán</span>
                </div>
              </div>
              <div className='flex items-center px-5 py-4 mt-8 bg-gray-50'>
                <div className='text-gray-500 line-through'>đ{formatCurrency(product.price_before_discount)}</div>
                <div className='ml-3 text-3xl font-medium text-orange'>đ{formatCurrency(product.price)}</div>
                <div className='ml-4 rounded-sm bg-orange px-1 py-[2px] text-xs font-semibold uppercase text-white '>
                  {rateSale(product.price_before_discount, product.price)} giảm
                </div>
              </div>
              <div className='flex items-center mt-8'>
                <div className='mr-5 text-gray-500 capitalize'>Số Lượng</div>
                <QuantityController
                  onDecrease={handleBuyCount}
                  onIncrease={handleBuyCount}
                  onType={handleBuyCount}
                  value={buyCount}
                  max={product.quantity}
                ></QuantityController>
                <div className='ml-6 text-sm text-gray-500'>{product.quantity} Sản phẩm có sẵn</div>
              </div>
              <div className='flex items-center mt-8'>
                <button
                  onClick={addToCart}
                  className='h-12 px-5 border rounded-sm shadow-sm bg-orange/10 border-orange hover:bg-orange/5'
                >
                  <div className='flex items-center justify-center text-orange '>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='w-5 h-5'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z'
                      />
                    </svg>
                    <span className='ml-2'> Thêm vào giỏ hàng</span>
                  </div>
                </button>
                <button
                  onClick={buyNow}
                  className='ml-4 flex h-12 min-w-[5rem] items-center justify-center rounded-sm bg-orange px-5 capitalize text-white shadow-sm outline-none hover:bg-orange/90'
                >
                  Mua Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* chi tiết sp */}
      <div className='container'>
        <div className='p-4 mt-8 bg-white shadow'>
          <div className='p-4 text-lg capitalize rounded bg-gray-50 text-slate-700'>Mô tả sản phẩm</div>
          <div className='mx-4 mt-12 mb-4 text-sm leading-loose'>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(product.description)
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className='mt-8'>
        <div className='container'>
          <div className='text-gray-400 uppercase'>Có thể bạn cũng thích</div>
          {productData && (
            <div className='grid grid-cols-2 gap-3 mt-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {productData.data.data.products.map((product) => (
                <div className='col-span-1' key={product._id}>
                  <Product product={product}></Product>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
