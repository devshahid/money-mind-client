import { useSelector } from 'react-redux'

import type { RootState } from '../../../store'

export const useAuth = (): { isAuthenticated: boolean } => {
  const accessToken = useSelector((state: RootState) => state.auth.userData.accessToken)
  return { isAuthenticated: !!accessToken }
}
