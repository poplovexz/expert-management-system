import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, requireAuth, router])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    isAdmin: (session as any)?.user?.role === 'admin'
  }
}

export function useRequireAuth() {
  return useAuth(true)
}

export function useRequireAdmin() {
  const auth = useAuth(true)
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated && !auth.isAdmin) {
      router.push('/')
    }
  }, [auth.isAuthenticated, auth.isAdmin, router])

  return auth
}
