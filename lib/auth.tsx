'use client'

import * as React from 'react'

export interface AuthUser {
  id: string
  username: string
  email: string
  displayName?: string
  role: string
}

export interface AuthState {
  authenticated: boolean
  user: AuthUser | null
  loading: boolean
}

const AuthContext = React.createContext<AuthState & {
  login: () => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}>({
  authenticated: false,
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  checkAuth: async () => {},
})

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.fakhrads.dev'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  })

  const checkAuth = React.useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/v1/auth/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setState({
            authenticated: true,
            user: {
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              displayName: data.user.display_name || data.user.displayName,
              role: data.user.role,
            },
            loading: false,
          })
          return
        }
      }
      setState({ authenticated: false, user: null, loading: false })
    } catch {
      setState({ authenticated: false, user: null, loading: false })
    }
  }, [])

  React.useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = () => {
    const nextUrl = typeof window !== 'undefined' ? window.location.href : 'https://tools.fakhrads.dev'
    window.location.href = `${AUTH_BASE_URL}/login?next=${encodeURIComponent(nextUrl)}`
  }

  const logout = async () => {
    try {
      await fetch(`${AUTH_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.error(e)
    } finally {
      setState({ authenticated: false, user: null, loading: false })
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return React.useContext(AuthContext)
}
