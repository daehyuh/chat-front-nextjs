'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppBar, Toolbar, Container, Button, Box, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function HeaderComponent() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLogin(true)
      setEmail(localStorage.getItem('email'))
    }
  }, [])

  const doLogout = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
            <Button color="inherit" component={Link} href="/member/list">
              회원목록
            </Button>
            <Button color="inherit" component={Link} href="/groupchatting/list">
              채팅방목록
            </Button>
          </Box>
          
          <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
            <Button color="inherit" component={Link} href="/">
              chat서비스
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1, justifyContent: 'flex-end' }}>
            {isLogin && (
              <Button color="inherit" component={Link} href="/my/chat/page">
                MyChatPage
              </Button>
            )}
            {!isLogin && (
              <>
                <Button color="inherit" component={Link} href="/member/create">
                  회원가입
                </Button>
                <Button color="inherit" component={Link} href="/login">
                  로그인
                </Button>
              </>
            )}
            {isLogin && (
              <>
                <Typography variant="body1">{email}</Typography>
                <Button color="inherit" onClick={doLogout}>
                  로그아웃
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}