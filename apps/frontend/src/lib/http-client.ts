const API_KEY = process.env.REACT_APP_API_KEY || ''
const NEST_API = process.env.NEST_API || ''

const BASE_URL = 'http://localhost:3000/api/v1'

const defaultHeaders = {
  'Content-Type': 'application/json',
  access_token: API_KEY
}

// Request interceptor equivalent
const createRequestConfig = (config: RequestInit = {}): RequestInit => {
  const headers = {
    ...defaultHeaders,
    ...config.headers
  }

  // Ensure access token is present
  if (!headers['access_token']) {
    headers['access_token'] = API_KEY
  }

  return {
    ...config,
    headers
  }
}

// Main HTTP client function
export const HttpClient = {
  async request<T = any>(url: string, config: RequestInit = {}): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
    const requestConfig = createRequestConfig(config)

    try {
      const response = await fetch(fullUrl, requestConfig)

      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      // Response interceptor equivalent - extract data
      return (await response.json()) as T
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // Convenience methods
  get<T = any>(url: string, config: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  },

  post<T = any>(url: string, data?: any, config: RequestInit = {}): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  put<T = any>(url: string, data?: any, config: RequestInit = {}): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  delete<T = any>(url: string, config: RequestInit = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}
