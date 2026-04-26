import { RouterProvider } from 'react-router-dom'
import { JSX, useEffect } from 'react'

import { setUserData } from './features/auth/store/authSlice'
import { useAppDispatch } from './shared/hooks/slice-hooks'
import { listLabels } from './features/transactions/store/transactionSlice'
import { router } from './router'

export const App = (): JSX.Element => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    const accessToken = localStorage.getItem('accessToken')
    void dispatch(listLabels())
    if (userData && Object.values(userData).length > 0) {
      const parsedObj = JSON.parse(userData) as { fullName: string; email: string; role: string; _id: string }
      dispatch(
        setUserData({
          fullName: parsedObj.fullName,
          email: parsedObj.email,
          role: parsedObj.role,
          _id: parsedObj._id,
          accessToken: accessToken as string,
        })
      )
    }
  }, [dispatch])

  return <RouterProvider router={router} />
}
