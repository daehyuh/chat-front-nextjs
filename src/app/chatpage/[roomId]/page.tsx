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
  const [senderId, setSenderId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const maxReconnectAttempts = 5
  
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

    // localStorage에서 직접 토큰 가져오기
    const currentToken = localStorage.getItem('token')
    if (!currentToken) {
      console.error('No token found')
      router.push('/login')
      return
    }

    // 재연결 시도 횟수 확인
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      alert('연결 실패: 페이지를 새로고침해주세요.')
      return
    }

    console.log(`Connecting to WebSocket... (attempt ${reconnectAttempts + 1})`, `${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`)
    
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => {
        return new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`)
      },
      connectHeaders: {
        Authorization: `Bearer ${currentToken}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        console.log('Connected to STOMP:', frame)
        setIsConnected(true)
        setReconnectAttempts(0) // 연결 성공 시 재연결 횟수 초기화
        
        // 즉시 구독
        try {
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
            }
          )
          console.log('Subscribed to room:', roomId)
          
          // JOIN 메시지 전송 (API 명세서에 따라)
          const userIdFromStorage = localStorage.getItem('userId')
          const joinMessage = {
            messageType: 'JOIN',
            roomId: parseInt(roomId),
            senderId: parseInt(userIdFromStorage || '0'),
            content: '',
            token: currentToken
          }
          
          console.log('Sending JOIN message:', joinMessage)
          client.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify(joinMessage)
          })
          
        } catch (error) {
          console.error('Subscription error:', error)
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message'])
        console.error('Error details:', frame.body)
        console.error('Full frame:', frame)
        console.error('Frame command:', frame.command)
        console.error('All headers:', JSON.stringify(frame.headers))
        setIsConnected(false)
        
        // ExecutorSubscribableChannel 오류는 보통 권한 문제
        if (frame.headers['message']?.includes('ExecutorSubscribableChannel')) {
          console.error('Backend authorization/permission issue detected')
          // 재연결 시도하지 않음 (권한 문제는 재연결로 해결되지 않음)
          return
        }
        
        // 다른 오류의 경우 재연결 시도
        setReconnectAttempts(prev => prev + 1)
        setTimeout(() => {
          console.log('Attempting to reconnect after STOMP error...')
          connectWebsocket()
        }, 3000)
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event)
        setIsConnected(false)
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event)
        setIsConnected(false)
        
        // 재연결 시도
        setReconnectAttempts(prev => prev + 1)
        setTimeout(() => {
          console.log('Attempting to reconnect after close...')
          connectWebsocket()
        }, 3000)
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP')
        setIsConnected(false)
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
      // 자동 재연결 시도
      connectWebsocket()
      alert('연결이 끊어졌습니다. 재연결 중...')
      return
    }

    const currentToken = localStorage.getItem('token')
    if (!currentToken) {
      console.error('No token found')
      alert('로그인이 필요합니다.')
      router.push('/login')
      return
    }

    // 백엔드 API 명세에 따른 메시지 형식
    const message = {
      messageType: 'CHAT',
      roomId: parseInt(roomId),
      senderId: senderId || 0,
      content: newMessage,
      token: currentToken
    }

    console.log('Sending message:', message)
    
    try {
      // 백엔드 API 명세대로 헤더 없이 전송
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
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
      const userId = localStorage.getItem('userId')
      
      // localStorage에서 userId 가져오기 (로그인 시 저장된 값)
      if (userId) {
        setSenderId(parseInt(userId))
      }
      
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
    const currentToken = localStorage.getItem('token')
    if (currentToken && roomId) {
      connectWebsocket()
    }
    
    return () => {
      if (stompClient?.connected) {
        stompClient.deactivate()
      }
    }
  }, [roomId])

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box display="flex" justifyContent="center">
        <Box sx={{ width: '100%' }}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" align="center" sx={{ flex: 1 }}>
                  채팅
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: isConnected ? '#4caf50' : '#f44336'
                  }} />
                  <Typography variant="caption" color="text.secondary">
                    {isConnected ? '연결됨' : '연결 중...'}
                  </Typography>
                </Box>
              </Box>
              
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