import classNames from 'classnames'
import { Link, createSearchParams } from 'react-router-dom'
import path from 'src/constants/path'
import { QueryConfig } from 'src/hooks/useQreryConfig'

// import { Link } from 'react-router-dom'
interface Props {
  queryConfig: QueryConfig
  pageSize: number
}
export default function Pagination({ queryConfig, pageSize }: Props) {
  const page = Number(queryConfig.page)
  const range = 2
  const renderPagination = () => {
    let dotAfter = false
    let dotBefore = false
    const renderDotBefore = (index: number) => {
      if (!dotBefore) {
        dotBefore = true
        return (
          <span key={index} className='flex items-center justify-center px-3 py-2 mx-2 bg-white '>
            ...
          </span>
        )
      }
    }
    const renderDotAfter = (index: number) => {
      if (!dotAfter) {
        dotAfter = true
        return (
          <span key={index} className='flex items-center justify-center px-3 py-2 mx-2 bg-white '>
            ...
          </span>
        )
      }
    }
    return Array(pageSize)
      .fill(0)
      .map((_, index) => {
        const pageNumber = index + 1
        if (page <= range * 2 + 1 && pageNumber > page + range && pageNumber < pageSize - range + 1) {
          return renderDotAfter(index)
        } else if (page > range * 2 + 1 && page < pageSize - 2 * range) {
          if (range < pageNumber && pageNumber < page - range) {
            return renderDotBefore(index)
          }
          if (page + range < pageNumber && pageNumber < pageSize - range + 1) {
            return renderDotAfter(index)
          }
        } else if (page > pageSize - 2 * range - 1 && range < pageNumber && pageNumber < page - range) {
          return renderDotBefore(index)
        }
        return (
          <Link
            to={{
              pathname: path.home,
              //là cái query string => search
              // search: "?page=1&sort"
              search: createSearchParams({
                ...queryConfig,
                page: pageNumber.toString()
              }).toString()
            }}
            key={index}
            className={classNames('flex items-center justify-center px-3 py-2 mx-2 bg-white cursor-pointer border', {
              'border-cyan-500': pageNumber === page,
              'border-transparent': pageNumber !== page
            })}
            // onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </Link>
        )
      })
  }
  return (
    <div className='flex flex-wrap justify-center mt-6'>
      {page === 1 ? (
        <span className='flex items-center justify-center px-3 py-2 mx-2 border bg-white/60 '>Prev</span>
      ) : (
        <Link
          to={{
            pathname: path.home,
            search: createSearchParams({
              ...queryConfig,
              page: (page - 1).toString()
            }).toString()
          }}
          className='flex items-center justify-center px-3 py-2 mx-2 bg-white border cursor-pointer'
        >
          Prev
        </Link>
      )}

      {renderPagination()}
      {page === pageSize ? (
        <span className='flex items-center justify-center px-3 py-2 mx-2 border bg-white/60 '>Next</span>
      ) : (
        <Link
          to={{
            pathname: path.home,
            search: createSearchParams({
              ...queryConfig,
              page: (page + 1).toString()
            }).toString()
          }}
          className='flex items-center justify-center px-3 py-2 mx-2 bg-white border cursor-pointer'
        >
          Next
        </Link>
      )}
    </div>
  )
}
