import { JSX } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { isAuthenticated } from '../utils/auth'
import { AppRoute } from '../../../routes'

export const ProtectedRoute = (): JSX.Element => {
  const location = useLocation()

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={AppRoute.Login}
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
