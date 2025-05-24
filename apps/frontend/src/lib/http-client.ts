import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class HttpClientClass {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true // Equivalente a credentials: 'include'
    })

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Agregar token si lo necesitas en el futuro
        // const token = localStorage.getItem('authToken')
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`
        // }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Manejar errores específicos
        if (error.response?.status === 401) {
          // Manejar logout automático si es necesario
          // window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config)
  }
}

export const HttpClient = new HttpClientClass()
export default HttpClient
