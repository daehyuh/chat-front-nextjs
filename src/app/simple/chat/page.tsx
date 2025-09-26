'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material'

export default function SimpleWebsocket() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState('')
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const connectWebsocket = () => {
    const websocket = new WebSocket('ws://localhost:8080/connect')
    
    websocket.onopen = () => {
      console.log('successfully connected')
    }

    websocket.onmessage = (message) => {
      setMessages(prev => [...prev, message.data])
      scrollToBottom()
    }

    websocket.onclose = () => {
      console.log('disconnected')
      setWs(null)
    }

    setWs(websocket)
  }

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close()
      console.log('disconnected!!')
      setWs(null)
    }
  }

  const sendMessage = () => {
    if (newMessage.trim() === '' || !ws) return
    ws.send(newMessage)
    setNewMessage('')
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
      }
    }, 0)
  }

  useEffect(() => {
    connectWebsocket()
    
    return () => {
      disconnectWebSocket()
    }
  }, [])

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box display="flex" justifyContent="center">
        <Box sx={{ width: '100%' }}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>
                채팅
              </Typography>
              
              <Box
                ref={chatBoxRef}
                sx={{
                  height: 300,
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: '#fff',
                  mb: 2,
                  p: 2
                }}
              >
                {messages.map((msg, index) => (
                  <div key={index}>{msg}</div>
                ))}
              </Box>

              <TextField
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                label="메시지 입력"
                fullWidth
                onKeyUp={(e) => {
                  if (e.key === 'Enter') sendMessage()
                }}
                size="small"
                sx={{ mb: 2 }}
              />
              
              <Button
                color="primary"
                variant="contained"
                fullWidth
                onClick={sendMessage}
                size="large"
                sx={{ 
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                전송
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  )
}