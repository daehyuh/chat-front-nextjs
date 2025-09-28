'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Box, Card, CardContent, TextField, Button, Typography } from '@mui/material'
import axios from '@/utils/axios'

export default function MemberCreate() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const memberCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name,
      email,
      password
    }
    await axios.post('/member/create', data)
    router.push('/')
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box display="flex" justifyContent="center">
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              회원가입
            </Typography>
            <Box component="form" onSubmit={memberCreate} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                required
              />
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
                등록
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}