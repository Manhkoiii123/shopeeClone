import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import purchaseApi from 'src/apis/purchase.api'
import Button from 'src/components/button'
import QuantityController from 'src/components/quantityController'
import path from 'src/constants/path'
import { purchasesStatus } from 'src/constants/purchase'
import { Purchase } from 'src/types/purchase.type'
import { formatCurrency, generateNameId } from 'src/utils/utils'
import { produce } from 'immer'
import { keyBy } from 'lodash'
import { toast } from 'react-toastify'
import { AppContext } from 'src/context/app.context'
import noproduct from 'src/assets/image/no-product.png'
import { Helmet } from 'react-helmet'

export default function Cart() {
  const { extendedPurchases, setExtendedPurchases } = useContext(AppContext)
  const { data: purchaseInCartData, refetch } = useQuery({
    queryKey: ['purchases', { status: purchasesStatus.inCart }],
    queryFn: () => {
      return purchaseApi.getPurchases({ status: purchasesStatus.inCart })
    }
  })
  const purchasesInCart = purchaseInCartData?.data.data

  // mua ngay
  const location = useLocation()

  const choosenPurchaseIdFromLocation = (location.state as { purchasesId: string } | null)?.purchasesId
  useEffect(() => {
    setExtendedPurchases((prev) => {
      const extendedPurchasesObject = keyBy(prev, '_id')
      return (
        purchasesInCart?.map((purchase) => {
          const isChoosenPurchaseFromLocation = choosenPurchaseIdFromLocation === purchase._id
          return {
            ...purchase,
            disabled: false,
            checked: isChoosenPurchaseFromLocation || Boolean(extendedPurchasesObject[purchase._id]?.checked)
          }
        }) || []
      )
    })
  }, [choosenPurchaseIdFromLocation, purchasesInCart, setExtendedPurchases])

  // f5 laij
  useEffect(() => {
    return () => {
      history.replaceState(null, '')
    }
  }, [])

  // console.log(extendedPurchases)
  const handleChecked = (purchaseIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].checked = e.target.checked
      })
    )
  }

  // chọn all
  const isAllChecked = useMemo(() => extendedPurchases.every((purchase) => purchase.checked), [extendedPurchases])
  const handleCheckAll = () => {
    setExtendedPurchases((prev) =>
      prev.map((p) => ({
        ...p,
        checked: !isAllChecked
      }))
    )
  }

  //update
  const updatePurchasesMutation = useMutation({
    mutationFn: purchaseApi.updatePurchase,
    onSuccess: () => {
      refetch()
    }
  })

  const handleQuantity = (purchaseIndex: number, value: number, enable: boolean) => {
    if (enable) {
      const purchase = extendedPurchases[purchaseIndex]
      setExtendedPurchases(
        produce((draft) => {
          draft[purchaseIndex].disabled = true
        })
      )
      updatePurchasesMutation.mutate({ product_id: purchase.product._id, buy_count: value })
    }
  }
  const handleTypeQuantity = (purchaseIndex: number) => (value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].buy_count = value
      })
    )
  }

  // xóa
  const deletePurchasesMutation = useMutation({
    mutationFn: purchaseApi.deletePurchase,
    onSuccess: () => {
      refetch()
    }
  })
  const handleDelete = (purchaseIndex: number) => {
    const purchaseId = extendedPurchases[purchaseIndex]._id
    deletePurchasesMutation.mutate([purchaseId])
  }
  const checkedPerchases = useMemo(() => extendedPurchases.filter((p) => p.checked), [extendedPurchases])
  const checkedPerchasesCount = checkedPerchases.length

  const handleDeleteManyPurchase = () => {
    const perchaseIds = checkedPerchases.map((p) => p._id)
    deletePurchasesMutation.mutate(perchaseIds)
  }

  //tính giá tiền
  const totalCheckedPerchasesPrice = useMemo(
    () =>
      checkedPerchases.reduce((res, current) => {
        return res + current.product.price * current.buy_count
      }, 0),
    [checkedPerchases]
  )
  //tính cái tieest kiệm
  const totalCheckedPerchasesSavingPrice = useMemo(
    () =>
      checkedPerchases.reduce((res, current) => {
        return res + (current.product.price_before_discount - current.product.price) * current.buy_count
      }, 0),
    [checkedPerchases]
  )
  //mua hang
  const buyProductMutation = useMutation({
    mutationFn: purchaseApi.buyProducts,
    onSuccess: (data) => {
      refetch()
      toast.success(data.data.message, {
        position: 'top-center',
        autoClose: 1000
      })
    }
  })
  const handleBuyProduct = () => {
    if (checkedPerchases.length > 0) {
      const body = checkedPerchases.map((p) => ({
        product_id: p.product._id,
        buy_count: p.buy_count
      }))
      buyProductMutation.mutate(body)
    }
  }

  return (
    <div className='py-16 bg-neutral-100'>
      <Helmet>
        <title>Giỏ hàng</title>
        <meta name='description' content='Giỏ hàng' />
      </Helmet>
      <div className='container'>
        {extendedPurchases.length > 0 ? (
          <>
            <div className='overflow-auto'>
              <div className='min-w-[1000px]'>
                <div className='grid grid-cols-12 py-5 text-sm text-gray-500 capitalize bg-white rounded-sm shadow px-9'>
                  <div className='col-span-6 '>
                    <div className='flex items-center'>
                      <div className='flex items-center justify-center flex-shrink-0 pr-3'>
                        <input
                          type='checkbox'
                          className='w-5 h-5 accent-orange'
                          checked={isAllChecked}
                          onChange={handleCheckAll}
                        />
                      </div>
                      <div className='flex-grow text-black'>Sản Phẩm</div>
                    </div>
                  </div>
                  <div className='col-span-6'>
                    <div className='grid grid-cols-5 text-center'>
                      <div className='col-span-2'>Đơn giá</div>
                      <div className='col-span-1'>Số lượng</div>
                      <div className='col-span-1'>Số tiền</div>
                      <div className='col-span-1'>Thao tác</div>
                    </div>
                  </div>
                </div>

                {extendedPurchases.length > 0 && (
                  <div className='p-5 my-3 bg-white rounded-sm shadow-sm'>
                    {extendedPurchases?.map((purchase, index) => (
                      <div
                        key={purchase._id}
                        className='grid items-center grid-cols-12 px-4 py-5 mt-5 text-sm text-left text-gray-500 bg-white border border-gray-200 rounded-sm first:mt-0'
                      >
                        <div className='col-span-6'>
                          <div className='flex'>
                            <div className='flex items-center justify-center flex-shrink-0 pr-3'>
                              <input
                                type='checkbox'
                                className='w-5 h-5 accent-orange'
                                checked={purchase.checked}
                                onChange={handleChecked(index)}
                              />
                            </div>
                            <div className='flex-grow'>
                              <div className='flex'>
                                <Link
                                  className='flex-shrink-0 w-20 h-20'
                                  to={`${path.home}${generateNameId({
                                    name: purchase.product.name,
                                    id: purchase.product._id
                                  })}`}
                                >
                                  <img
                                    alt={purchase.product.name}
                                    className='object-cover w-full h-full'
                                    src={purchase.product.image}
                                  />
                                </Link>
                                <div className='flex-grow px-5 pt-1 pb-2'>
                                  <Link
                                    to={`${path.home}${generateNameId({
                                      name: purchase.product.name,
                                      id: purchase.product._id
                                    })}`}
                                    className='line-clamp-2'
                                  >
                                    {purchase.product.name}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className='col-span-6'>
                          <div className='grid items-center grid-cols-5'>
                            <div className='col-span-2'>
                              <div className='flex items-center justify-center'>
                                <span className='text-gray-300 line-through'>
                                  đ{formatCurrency(purchase.product.price_before_discount)}
                                </span>
                                <span className='ml-3'>{formatCurrency(purchase.product.price)}</span>
                              </div>
                            </div>
                            <div className='col-span-1'>
                              <QuantityController
                                max={purchase.product.quantity}
                                value={purchase.buy_count}
                                classNameWrapper='flex items-center'
                                onIncrease={(value) => handleQuantity(index, value, value <= purchase.product.quantity)}
                                onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                                disabled={purchase.disabled}
                                onType={handleTypeQuantity(index)}
                                onFocusOut={(value) =>
                                  handleQuantity(
                                    index,
                                    value,
                                    value >= 1 &&
                                      value <= purchase.product.quantity &&
                                      value !== (purchasesInCart as Purchase[])[index].buy_count
                                  )
                                }
                              ></QuantityController>
                            </div>
                            <div className='flex justify-center col-span-1'>
                              <span className='text-orange'>
                                đ{formatCurrency(purchase.product.price * purchase.buy_count)}
                              </span>
                            </div>
                            <div className='flex justify-center col-span-1'>
                              <button
                                className='text-black transition-colors bg-none hover:text-orange'
                                onClick={() => handleDelete(index)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className='sticky bottom-0 z-10 flex flex-col p-5 mt-10 bg-white border border-gray-100 rounded-sm shadow sm:items-center sm:flex-row'>
              <div className='flex items-center'>
                <div className='flex items-center justify-center pr-3 flex-shink-0'>
                  <input
                    type='checkbox'
                    className='w-5 h-5 accent-orange'
                    checked={isAllChecked}
                    onChange={handleCheckAll}
                  />
                </div>
                <button className='mx-3 border-none bg-none ' onClick={handleCheckAll}>
                  Chọn tất cả ({extendedPurchases.length})
                </button>
                <button className='mx-3 border-none bg-none' onClick={handleDeleteManyPurchase}>
                  Xóa
                </button>
              </div>
              <div className='flex flex-col mt-5 sm:ml-auto sm:flex-row sm:items-center sm:mt-0'>
                <div>
                  <div className='flex items-center sm:justify-end'>
                    <div>Tổng thanh toán ({checkedPerchasesCount} sản phẩm) : </div>
                    <div className='ml-2 text-2xl text-orange'>đ{formatCurrency(totalCheckedPerchasesPrice)}</div>
                  </div>
                  <div className='flex items-center text-sm sm:justify-end'>
                    <div className='text-gray-500'>Tiết kiệm</div>
                    <div className='ml-6 text-orange'>đ{formatCurrency(totalCheckedPerchasesSavingPrice)}</div>
                  </div>
                </div>
                <Button
                  className='flex items-center justify-center h-10 mt-5 text-sm text-center text-white uppercase bg-red-500 rounded sm:mt-0 w-52 hover:bg-red-600 sm:ml-4'
                  onClick={handleBuyProduct}
                  disabled={buyProductMutation.isLoading}
                >
                  Mua hàng
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className='text-center'>
            <img src={noproduct} alt='no product' className='w-24 h-24 mx-auto' />
            <div className='mt-5 font-bold text-gray-600'>Giỏ hàng của bạn còn trống</div>
            <div className='mt-5 text-center'>
              <Link className='px-8 py-3 text-white uppercase bg-orange' to={path.home}>
                Mua Ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
