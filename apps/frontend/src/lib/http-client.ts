import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserContextStore } from '../store/authStore' // Para el usuario principal y encriptado
import { useUserStore } from '../store/userStore' // Para el otro store de usuario

// --- INICIO: Lógica para manejar el proceso de refresh ---
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token) // El token aquí es el accessToken, pero no lo usamos directamente si auth_token es HttpOnly
    }
  })
  failedQueue = []
}
// --- FIN: Lógica para manejar el proceso de refresh ---

// Define una función global o un emisor de eventos para el logout si es necesario
// para que otros módulos (como tu store de estado) puedan reaccionar.
// Ejemplo simple:
const triggerLogoutProcedures = () => {
  console.log('Triggering logout procedures: clear user state, redirect, etc.')
  // Limpiar el estado del usuario usando los stores
  useUserContextStore.getState().logoutUser() // Limpia authStore (encriptado)
  useUserStore.getState().clearUser() // Limpia userStore (no encriptado)

  // La redirección se hará después de intentar el logout en el servidor.
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const HttpClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
HttpClient.interceptors.request.use(
  (config) => {
    const user = useUserContextStore.getState().currentUser
    if (user) {
      config.headers.Authorization = `Bearer ${user.id}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token refresh
HttpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh token
        const response = await axios.post(`${baseURL}/auth/refresh`, {}, {
          withCredentials: true
        })

        // Update token in store
        if (response.data?.token) {
          useUserContextStore.getState().setToken(response.data.token)
        }

        // Retry original request
        return HttpClient(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

class HttpClientClass {
  private instance: AxiosInstance
  private readonly BASE_API_URL = process.env.NEXT_PUBLIC_API_URL
  private readonly REFRESH_TOKEN_URL = `${this.BASE_API_URL}/auth/refresh`
  private readonly LOGOUT_URL = `${this.BASE_API_URL}/auth/logout` // URL para el endpoint de logout del backend

  constructor() {
    this.instance = axios.create({
      baseURL: this.BASE_API_URL,
      timeout: 10000,
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
          // Puedes agregar tu console.log aquí
          console.log(`[HTTP Client] Received 401 from ${originalRequest.url}. Attempting to use refresh token.`)

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

          // Este console.log ya existente también es útil
          console.log('[HTTP Client] Attempting to refresh token by calling:', this.REFRESH_TOKEN_URL)
          try {
            const refreshResponse = await this.instance.post<{ accessToken: string }>(this.REFRESH_TOKEN_URL)

            if (refreshResponse.status === 200 || refreshResponse.status === 201) {
              console.log('[HTTP Client] Token refreshed successfully.')
              processQueue(null, refreshResponse.data.accessToken)
              return this.instance(originalRequest)
            }
          } catch (refreshError: any) {
            console.error('[HTTP Client] Failed to refresh token:', refreshError)
            processQueue(refreshError, null)

            await this.performServerLogout()
            triggerLogoutProcedures()

            const loginUrl = process.env.NEXT_PUBLIC_LOGIN || 'http://localhost:3001' // Proporciona un fallback
            if (typeof window !== 'undefined') {
              if (loginUrl) {
                // Asegúrate de que loginUrl es truthy (no undefined, no null, no '')
                window.location.href = loginUrl
              } else {
                console.error('Login URL is not defined. Cannot redirect.')
                // Opcionalmente, redirige a una página de error genérica o a la raíz
                // window.location.href = '/auth-error';
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
      console.log('Attempting to logout from server...')
      // El endpoint de logout es GET
      await this.instance.get(this.LOGOUT_URL)
      console.log('Successfully logged out from server.')
    } catch (logoutError) {
      console.error(
        'Failed to logout from server. Cookies might still be cleared by backend on next request or already invalid:',
        logoutError
      )
      // No es necesario rechazar la promesa aquí, ya que el objetivo principal es desloguear al cliente.
      // El backend ya limpia las cookies en su respuesta de logout.
    }
  }

  // Método público para que la UI pueda llamar al logout
  async logout(): Promise<void> {
    await this.performServerLogout()
    triggerLogoutProcedures() // Limpia estado local
    // Redirigir al login
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN || '/login' // Proporciona un fallback
    if (typeof window !== 'undefined') {
      if (loginUrl) {
        // Asegúrate de que loginUrl es truthy (no undefined, no null, no '')
        window.location.href = loginUrl
      } else {
        console.error('Login URL is not defined for logout. Cannot redirect.')
        // Opcionalmente, redirige a una página de error genérica o a la raíz
        // window.location.href = '/auth-error';
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

export default HttpClient
