'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
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

interface ChatMessage {
  senderEmail: string
  message: string
}

export default function StompChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [token, setToken] = useState<string>('')
  const [senderEmail, setSenderEmail] = useState<string | null>(null)
  
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const connectWebsocket = () => {
    if (stompClient?.connected) return

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`)
    const client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        client.subscribe(
          `/topic/${roomId}`,
          (message) => {
            console.log(message)
            const parseMessage = JSON.parse(message.body)
            setMessages(prev => [...prev, parseMessage])
            scrollToBottom()
          },
          {
            Authorization: `Bearer ${token}`
          }
        )
      }
    })
    
    client.activate()
    setStompClient(client)
  }

  const disconnectWebSocket = async () => {
    await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/room/${roomId}/read`)
    
    if (stompClient?.connected) {
      stompClient.unsubscribe(`/topic/${roomId}`)
      stompClient.deactivate()
    }
  }

  const sendMessage = () => {
    if (newMessage.trim() === '' || !stompClient) return

    const message = {
      senderEmail,
      message: newMessage
    }

    stompClient.publish({
      destination: `/publish/${roomId}`,
      body: JSON.stringify(message)
    })

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
    const loadInitialData = async () => {
      const email = localStorage.getItem('email')
      const storedToken = localStorage.getItem('token')
      
      setSenderEmail(email)
      setToken(storedToken || '')
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/history/${roomId}`
        )
        setMessages(response.data)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
    
    loadInitialData()
  }, [roomId])

  useEffect(() => {
    if (token && roomId) {
      connectWebsocket()
    }
    
    return () => {
      disconnectWebSocket()
    }
  }, [token, roomId])

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
                  <div
                    key={index}
                    style={{
                      marginBottom: '10px',
                      textAlign: msg.senderEmail === senderEmail ? 'right' : 'left'
                    }}
                  >
                    <strong>{msg.senderEmail}:</strong> {msg.message}
                  </div>
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