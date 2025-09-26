'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const doLogin = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      const loginData = { email, password }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/doLogin`,
        loginData
      )
      console.log(response)

      const token = response.data.token
      const decoded = jwtDecode(token) as any
      console.log(decoded)

      const role = decoded.role
      const userEmail = decoded.sub

      localStorage.setItem('role', role)
      localStorage.setItem('email', userEmail)
      localStorage.setItem('token', token)

      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box display="flex" justifyContent="center">
        <Box sx={{ width: '100%', maxWidth: '500px' }}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3 }}>
                로그인
              </Typography>
              <Box component="form" onSubmit={doLogin}>
                <TextField
                  label="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ 
                    py: 1.5,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500
                  }}
                >
                  로그인
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  )
}