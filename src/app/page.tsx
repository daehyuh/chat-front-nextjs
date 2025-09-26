'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Typography, Box } from '@mui/material'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <Container>
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Chat Service
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Welcome to Chat Application
        </Typography>
      </Box>
    </Container>
  )
}
