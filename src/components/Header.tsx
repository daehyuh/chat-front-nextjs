'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AppBar,
  Toolbar,
  Container,
  Button,
  Typography,
  Box
} from '@mui/material'

export default function Header() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

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
    <AppBar position="fixed" sx={{ backgroundColor: '#212121', zIndex: 1201 }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                component={Link} 
                href="/member/list"
                sx={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                회원목록
              </Button>
              <Button 
                color="inherit" 
                component={Link} 
                href="/groupchatting/list"
                sx={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                채팅방목록
              </Button>
            </Box>
            
            <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <Button 
                color="inherit" 
                component={Link} 
                href="/"
                sx={{ fontSize: '1rem', fontWeight: 500 }}
              >
                CHAT서비스
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isLogin && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  href="/my/chat/page"
                  sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                >
                  MyChatPage
                </Button>
              )}
              {!isLogin && (
                <>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    href="/member/create"
                    sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                  >
                    회원가입
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    href="/login"
                    sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                  >
                    로그인
                  </Button>
                </>
              )}
              {isLogin && (
                <>
                  <Typography 
                    variant="body2" 
                    sx={{ color: 'white', mx: 1 }}
                  >
                    {email}
                  </Typography>
                  <Button 
                    color="inherit" 
                    onClick={doLogout}
                    sx={{ fontSize: '0.875rem', fontWeight: 500 }}
                  >
                    로그아웃
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}