import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import { useSessionStore } from '../modules/auth/sessionStore'
import { Logger } from '@/utils'

// --- INICIO: Lógica para manejar el proceso de refresh ---
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}
// --- FIN: Lógica para manejar el proceso de refresh ---

const triggerLogoutProcedures = () => {
  Logger.log('Triggering logout procedures: clear user state, redirect, etc.')
  useSessionStore.getState().clearSession()
  // La redirección se hará después de intentar el logout en el servidor.
}

class HttpClientClass {
  private instance: AxiosInstance
  private readonly BASE_API_URL = process.env.NEXT_PUBLIC_API_URL
  private readonly REFRESH_TOKEN_URL = `${this.BASE_API_URL}/auth/refresh`
  private readonly LOGOUT_URL = `${this.BASE_API_URL}/auth/logout`

  constructor() {
    this.instance = axios.create({
      baseURL: this.BASE_API_URL,
      timeout: 30000, // Increased from 10s to 30s for better UX
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })

    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && originalRequest.url !== this.REFRESH_TOKEN_URL && !originalRequest._retry) {
          Logger.log(`[HTTP Client] Received 401 from ${originalRequest.url}. Attempting to use refresh token.`)

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            })
              .then(() => {
                return this.instance(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          isRefreshing = true

          Logger.log('[HTTP Client] Attempting to refresh token by calling:', this.REFRESH_TOKEN_URL)
          try {
            const refreshResponse = await this.instance.post<{ accessToken: string }>(this.REFRESH_TOKEN_URL)

            if (refreshResponse.status === 200 || refreshResponse.status === 201) {
              Logger.log('[HTTP Client] Token refreshed successfully.')
              processQueue(null, refreshResponse.data.accessToken)
              return this.instance(originalRequest)
            }
          } catch (refreshError: any) {
            Logger.error('[HTTP Client] Failed to refresh token:', refreshError)
            processQueue(refreshError, null)

            await this.performServerLogout()
            triggerLogoutProcedures()

            const loginUrl = process.env.NEXT_PUBLIC_LOGIN || 'http://localhost:3001'
            if (typeof window !== 'undefined') {
              if (loginUrl) {
                window.location.href = loginUrl
              } else {
                Logger.error('Login URL is not defined. Cannot redirect.')
              }
            }
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private async performServerLogout(): Promise<void> {
    try {
      Logger.log('Attempting to logout from server...')
      await this.instance.get(this.LOGOUT_URL)
      Logger.log('Successfully logged out from server.')
    } catch (logoutError) {
      Logger.error(
        'Failed to logout from server. Cookies might still be cleared by backend on next request or already invalid:',
        logoutError
      )
    }
  }

  async logout(): Promise<void> {
    await this.performServerLogout()
    triggerLogoutProcedures()
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN || '/login'
    if (typeof window !== 'undefined') {
      if (loginUrl) {
        window.location.href = loginUrl
      } else {
        Logger.error('Login URL is not defined for logout. Cannot redirect.')
      }
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config)
  }
}

export const HttpClient = new HttpClientClass()
export default HttpClient
