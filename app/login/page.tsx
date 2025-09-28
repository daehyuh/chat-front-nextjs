'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Box, Card, CardContent, TextField, Button, Typography } from '@mui/material'
import axios from '@/utils/axios'
import { jwtDecode } from 'jwt-decode'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const loginData = { email, password }
      const response = await axios.post('/member/doLogin', loginData)
      console.log(response)

      const token = response.data.token
      
      const decoded: any = jwtDecode(token)
      console.log(decoded)

      const role = decoded.role
      const userEmail = decoded.sub

      localStorage.setItem('role', role)
      localStorage.setItem('email', userEmail)
      localStorage.setItem('token', token)
      
      window.location.href = '/'
    } catch (error: any) {
      console.error('로그인 에러:', error)
      if (error.response) {
        alert(`로그인 실패: ${error.response.data.message || '서버 오류가 발생했습니다.'}`)
      } else if (error.request) {
        alert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.')
      } else {
        alert('로그인 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box display="flex" justifyContent="center">
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              로그인
            </Typography>
            <Box component="form" onSubmit={doLogin} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                로그인
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}