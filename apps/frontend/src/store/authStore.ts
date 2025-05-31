// src/store/authStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.SECRET_KEY || 'HSK90+-8,/764Fsdf54@#@!$%&*()_+|'

export type User = {
  id: string
  email: string
  fullName?: string | null
  fullLastName?: string | null
  photoUrl?: string | null
  nationalId?: string | null
  birthDate?: string | null
  primaryPhone?: string | null
  phoneNumbers?: { number: string; type: string }[] | null
  province?: string | null
  canton?: string | null
  district?: string | null
  address?: string | null
  professionalTitle?: string | null
  hireDate?: string | null
  condition?: string | null
  roleIds?: string[] | null
  googleId?: string | null
  status?: string | null
}

type UserStore = {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}

export const useUserContextStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user })
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          }
        }

        return {
          getItem: (name) => {
            const encryptedData = window.localStorage.getItem(name)
            if (!encryptedData) return null
            try {
              const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
              const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
              return JSON.parse(decryptedData)
            } catch {
              return null
            }
          },
          setItem: (name, value) => {
            const data = JSON.stringify(value)
            const encrypted = CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
            window.localStorage.setItem(name, encrypted)
          },
          removeItem: (name) => {
            window.localStorage.removeItem(name)
          }
        }
      })
    }
  )
)

export default useUserContextStore
