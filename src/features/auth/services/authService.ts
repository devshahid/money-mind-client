import { axiosClient } from '../../../shared/services/axiosClient'
import { API_ROUTES } from '../../../routes'

type LoginResponse = {
  output: {
    _id: string
    accessToken: string
    role: string
    email: string
    fullName: string
  }
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>(API_ROUTES.user.login, { email, password })
  return response.data
}

export const registerUser = async (email: string, password: string, fullName: string): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>(API_ROUTES.user.register, {
    email,
    password,
    fullName,
  })
  return response.data
}

export const logoutUser = async (): Promise<LoginResponse> => {
  const response = await axiosClient.post<LoginResponse>(API_ROUTES.user.logout)
  return response.data
}
