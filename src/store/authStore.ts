import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  email: string | null
  role: string | null
  setAuth: (token: string, email: string, role: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      email: null,
      role: null,
      setAuth: (token, email, role) => set({ token, email, role }),
      clearAuth: () => set({ token: null, email: null, role: null }),
      isAuthenticated: () => !!get().token
    }),
    {
      name: 'auth-storage'
    }
  )
)