import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import ProductList from './pages/productList'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterLayout from './layout/registerLayout'
import MainLayout from './layout/mainLayout'
import { useContext } from 'react'
import { AppContext } from './context/app.context'
import path from './constants/path'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import CardLayout from './layout/CardLayout'
import UserLayout from './pages/user/Layout/UserLayout'
import Profile from './pages/user/pages/profile'
import ChangePassword from './pages/user/pages/changePassword'
import HistoryPurchases from './pages/user/pages/historyPurchases'

function ProtectedRoute() {
  const { isAuthenticate } = useContext(AppContext)
  return isAuthenticate ? <Outlet></Outlet> : <Navigate to='/login' />
}
// login rồi thì ko vào lại trang login nữa => dùng ở login và resgister
function RejectedRoute() {
  const { isAuthenticate } = useContext(AppContext)
  return !isAuthenticate ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElement() {
  const routeElements = useRoutes([
    {
      path: '',
      index: true,
      element: (
        <MainLayout>
          <ProductList></ProductList>
        </MainLayout>
      )
    },
    {
      path: '',
      element: <ProtectedRoute></ProtectedRoute>,
      children: [
        {
          path: path.cart,
          element: (
            <CardLayout>
              <Cart></Cart>
            </CardLayout>
          )
        },
        {
          path: path.user,
          element: (
            <MainLayout>
              <UserLayout></UserLayout>
            </MainLayout>
          ),
          children: [
            {
              path: path.profile,
              element: <Profile></Profile>
            },
            {
              path: path.changePassword,
              element: <ChangePassword></ChangePassword>
            },
            {
              path: path.historyPurchase,
              element: <HistoryPurchases></HistoryPurchases>
            }
          ]
        }
      ]
    },
    {
      path: '',
      element: <RejectedRoute />,
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login></Login>
            </RegisterLayout>
          )
        },
        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register></Register>
            </RegisterLayout>
          )
        }
      ]
    },
    {
      path: path.productDetail,
      element: (
        <MainLayout>
          <ProductDetail></ProductDetail>
        </MainLayout>
      )
    }
  ])
  return routeElements
}
