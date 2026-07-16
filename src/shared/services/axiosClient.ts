import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1500

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retryCount?: number
}

/**
 * Check if an error is a network error that should be retried
 * Covers: ERR_NETWORK_CHANGED, ERR_NETWORK, ERR_CONNECTION_RESET, timeouts
 */
function isRetryableError(error: AxiosError): boolean {
  // No response at all = network-level failure (ERR_NETWORK_CHANGED, Wi-Fi drop, VPN reconnect)
  // Axios maps all browser network errors (including ERR_NETWORK_CHANGED) to code: 'ERR_NETWORK'
  if (!error.response) {
    return true
  }
  // Also retry on 502/503/504 (gateway errors from Lambda cold starts or overload)
  if ([502, 503, 504].includes(error.response.status)) {
    return true
  }
  return false
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s timeout for AI endpoints
})

axiosClient.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) config.headers.accessToken = `${accessToken}`
    return config
  },
  error => Promise.reject(error instanceof Error ? error : new Error(String(error)))
)

axiosClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined

    if (error.response?.status === 401) {
      console.error('Unauthorized! Logging out...')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userData')
      return Promise.reject(error)
    }

    // Retry logic for network errors
    if (config && isRetryableError(error)) {
      config._retryCount = config._retryCount || 0

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1
        const backoff = RETRY_DELAY_MS * Math.pow(2, config._retryCount - 1)
        console.warn(`[Retry ${config._retryCount}/${MAX_RETRIES}] ${error.code} - retrying in ${backoff}ms...`)
        await delay(backoff)
        return axiosClient(config)
      }
    }

    return Promise.reject(error)
  }
)

export { axiosClient }
