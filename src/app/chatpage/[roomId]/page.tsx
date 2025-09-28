'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
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
  messageId?: number
  content?: string
  senderId?: number
  senderName?: string
  senderEmail?: string
  message?: string
  timestamp?: string
  messageType?: string
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
  const { checkAuth } = useAuth()

  const connectWebsocket = () => {
    if (stompClient?.connected) {
      console.log('Already connected')
      return
    }

    console.log('Connecting to WebSocket...', `${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`)
    
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => {
        return new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`)
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('Connected to STOMP:', frame)
        
        const subscription = client.subscribe(
          `/topic/chat/${roomId}`,
          (message) => {
            console.log('Received message:', message)
            try {
              const parseMessage = JSON.parse(message.body)
              console.log('Parsed message:', parseMessage)
              setMessages(prev => [...prev, parseMessage])
              scrollToBottom()
            } catch (e) {
              console.error('Failed to parse message:', e)
            }
          },
          {
            Authorization: `Bearer ${token}`
          }
        )
        console.log('Subscribed to room:', roomId)
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'])
        console.error('Error details:', frame.body)
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event)
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP')
      }
    })
    
    client.activate()
    setStompClient(client)
  }

  const disconnectWebSocket = async () => {
    try {
      await api.post(`/chat/room/${roomId}/read`)
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
    
    if (stompClient?.connected) {
      console.log('Disconnecting WebSocket...')
      stompClient.deactivate()
    }
  }

  const sendMessage = () => {
    if (newMessage.trim() === '' || !stompClient) {
      console.log('Cannot send message: empty or no client')
      return
    }

    if (!stompClient.connected) {
      console.error('WebSocket is not connected')
      alert('연결이 끊어졌습니다. 페이지를 새로고침해주세요.')
      return
    }

    const message = {
      messageType: 'CHAT',
      roomId: parseInt(roomId),
      content: newMessage,
      token: token
    }

    console.log('Sending message:', message)
    
    try {
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(message)
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('메시지 전송에 실패했습니다.')
    }
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
        const response = await api.get(`/chat/history/${roomId}`)
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
                      textAlign: (msg.senderEmail || msg.senderName) === senderEmail ? 'right' : 'left'
                    }}
                  >
                    <strong>{msg.senderEmail || msg.senderName}:</strong> {msg.message || msg.content}
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