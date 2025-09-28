import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

export const useAuth = () => {
  const router = useRouter()
  
  const checkAuth = () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      router.push('/login')
      return false
    }
    
    try {
      const decoded = jwtDecode(token) as any
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token')
        localStorage.removeItem('email')
        localStorage.removeItem('role')
        router.push('/login')
        return false
      }
      
      return true
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('email')
      localStorage.removeItem('role')
      router.push('/login')
      return false
    }
  }
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  return { checkAuth }
}