'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Chip
} from '@mui/material'
import axios from '@/utils/axios'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

interface Message {
  senderEmail: string
  message: string
}

export default function StompChatPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [senderEmail, setSenderEmail] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const stompClientRef = useRef<Client | null>(null)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const email = localStorage.getItem('email')
    setSenderEmail(email)
    console.log('Email from localStorage:', email)

    const loadHistory = async () => {
      try {
        console.log('Loading chat history for room:', roomId)
        const response = await axios.get(`/chat/history/${roomId}`)
        console.log('Chat history loaded:', response.data)
        setMessages(response.data)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }

    loadHistory()
    
    // Delay WebSocket connection to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log('Initiating WebSocket connection...')
      connectWebSocket()
    }, 100)

    return () => {
      clearTimeout(timer)
      disconnectWebSocket()
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    if (stompClientRef.current?.active) {
      console.log('WebSocket already connected')
      return
    }

    const token = localStorage.getItem('token')
    console.log('Token:', token ? 'Found' : 'Not found')
    
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    console.log('Connecting to WebSocket at:', `${apiUrl}/connect`)
    
    const socket = new SockJS(`${apiUrl}/connect`)
    const client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket successfully')
        setIsConnected(true)
        console.log('Subscribing to topic:', `/topic/${roomId}`)
        client.subscribe(
          `/topic/${roomId}`,
          (message) => {
            console.log('Received message:', message.body)
            const parseMessage = JSON.parse(message.body)
            setMessages(prev => [...prev, parseMessage])
          },
          {
            Authorization: `Bearer ${token}`
          }
        )
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket')
        setIsConnected(false)
      },
      onStompError: (frame) => {
        console.error('STOMP Error occurred')
        console.error('Error headers:', frame.headers)
        console.error('Error message:', frame.headers['message'])
        console.error('Error details:', frame.body)
        setIsConnected(false)
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error)
      },
      onWebSocketClose: (event) => {
        console.error('WebSocket closed:', event)
      },
      debug: (str) => {
        console.log('STOMP: ' + str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    client.activate()
    stompClientRef.current = client
  }

  const sendMessage = () => {
    if (newMessage.trim() === '') return

    if (!stompClientRef.current?.active) {
      console.error('WebSocket is not connected')
      alert('채팅 서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const message = {
      senderEmail: senderEmail,
      message: newMessage
    }

    try {
      stompClientRef.current.publish({
        destination: `/publish/${roomId}`,
        body: JSON.stringify(message)
      })
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('메시지 전송에 실패했습니다.')
    }
  }

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }

  const disconnectWebSocket = async () => {
    await axios.post(`/chat/room/${roomId}/read`)
    
    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate()
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              채팅
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={isConnected ? '연결됨' : '연결 중...'}
                color={isConnected ? 'success' : 'warning'}
                size="small"
              />
              {!isConnected && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={connectWebSocket}
                >
                  재연결
                </Button>
              )}
            </Box>
          </Box>
          
          <Paper
            ref={chatBoxRef}
            sx={{
              height: 400,
              overflowY: 'auto',
              p: 2,
              mb: 2,
              bgcolor: 'grey.50'
            }}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  mb: 1,
                  textAlign: msg.senderEmail === senderEmail ? 'right' : 'left'
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    display: 'inline-block',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: msg.senderEmail === senderEmail ? 'primary.main' : 'grey.300',
                    color: msg.senderEmail === senderEmail ? 'white' : 'black',
                    maxWidth: '70%'
                  }}
                >
                  <strong>{msg.senderEmail}:</strong> {msg.message}
                </Typography>
              </Box>
            ))}
          </Paper>

          <TextField
            fullWidth
            label="메시지 입력"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                sendMessage()
              }
            }}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={sendMessage}
          >
            전송
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}