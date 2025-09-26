'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material'

export default function MemberCreate() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const memberCreate = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      const data = {
        name,
        email,
        password
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/create`,
        data
      )
      
      router.push('/')
    } catch (error) {
      console.error('Member creation failed:', error)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box display="flex" justifyContent="center">
        <Box sx={{ width: '100%', maxWidth: '500px' }}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ mb: 3 }}>
                회원가입
              </Typography>
              <Box component="form" onSubmit={memberCreate}>
                <TextField
                  label="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  margin="normal"
                  size="small"
                  sx={{ mb: 2 }}
                />
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
                  등록
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  )
}