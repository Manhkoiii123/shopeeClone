import { useContext } from 'react'
import Popover from '../popover'
import { AppContext } from 'src/context/app.context'
import { Link } from 'react-router-dom'
import path from 'src/constants/path'
import authApi from 'src/apis/auth.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { purchasesStatus } from 'src/constants/purchase'
import { getAvatarUrl } from 'src/utils/utils'
import { useTranslation } from 'react-i18next'
import { locales } from 'src/i18n/i18n'
export default function NavHeader() {
  const { i18n } = useTranslation()
  const currentLanguage = locales[i18n.language as keyof typeof locales]
  // console.log(currentLanguage)
//lấy được cái vi en => tạo obj để hiển thị rõ tên vitnam hay english => bên file i18n.ts
  const changeLanguage = (lng: 'en' | 'vi') => {
    i18n.changeLanguage(lng)
  }
  const { setIsAuthenticate, isAuthenticate, setProfile, profile } = useContext(AppContext)
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setProfile(null)
      setIsAuthenticate(false)
      queryClient.removeQueries({
        queryKey: ['purchases', { status: purchasesStatus.inCart }]
      })
    }
  })
  const handleLogout = () => {
    logoutMutation.mutate()
  }
  return (
    <div className='flex justify-end'>
      <Popover
        renderPopover={
          <div className='relative bg-white border border-gray-200 rounded-sm shadow-md z-1'>
            <div className='flex flex-col px-3 py-2 text-black'>
              <button className='px-3 py-2 text-left hover:text-orange' onClick={() => changeLanguage('vi')}>
                Tiếng Việt
              </button>
              <button className='px-3 py-2 mt-2 text-left hover:text-orange' onClick={() => changeLanguage('en')}>
                English
              </button>
            </div>
          </div>
        }
        className='flex items-center py-1 text-white cursor-pointer hover:text-gray-300'
      >
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
            d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418'
          />
        </svg>
        <span className='mx-1'>{currentLanguage}</span>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='w-5 h-5'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
        </svg>
      </Popover>

      {isAuthenticate && (
        <Popover
          renderPopover={
            <div className='relative text-black bg-white border border-gray-200 rounded-sm shadow-md'>
              <Link
                to={path.profile}
                className='block w-full px-4 py-3 text-left bg-white hover:bg-slate-100 hover:text-cyan-500'
              >
                Tài khoản của tôi
              </Link>
              <Link
                to={path.historyPurchase}
                className='block w-full px-4 py-3 text-left bg-white hover:bg-slate-100 hover:text-cyan-500'
              >
                Đơn mua
              </Link>
              <button
                onClick={handleLogout}
                className='block w-full px-4 py-3 text-left bg-white hover:bg-slate-100 hover:text-cyan-500'
              >
                Đăng xuất
              </button>
            </div>
          }
          className='flex items-center py-1 ml-6 text-white cursor-pointer hover:text-gray-300'
        >
          <div className='flex-shrink-0 w-5 h-5 mr-2'>
            <img src={getAvatarUrl(profile?.avatar)} alt='avatar' className='object-cover w-full h-full rounded-full' />
          </div>
          <div className='text-white'>{profile?.email}</div>
        </Popover>
      )}
      {!isAuthenticate && (
        <div className='flex items-center'>
          <Link to={path.register} className='mx-3 text-white capitalize hover:opacity-70'>
            Đăng Kí
          </Link>
          <div className='border-r-[1px] border-r-white/40 h-4 '></div>
          <Link to={path.login} className='mx-3 text-white capitalize hover:opacity-70'>
            Đăng Nhập
          </Link>
        </div>
      )}
    </div>
  )
}
