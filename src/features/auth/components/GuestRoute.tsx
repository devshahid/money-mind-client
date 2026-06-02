import { JSX } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { isAuthenticated } from '../utils/auth'
import { AppRoute } from '../../../routes'

export const GuestRoute = (): JSX.Element => {
  if (isAuthenticated()) {
    return (
      <Navigate
        to={AppRoute.Root}
        replace
      />
    )
  }

  return <Outlet />
}
