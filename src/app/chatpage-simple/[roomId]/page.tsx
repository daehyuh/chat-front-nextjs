'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import api from '@/lib/api'
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

export default function SimpleChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const chatBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load chat history
    const loadHistory = async () => {
      try {
        const response = await api.get(`/chat/history/${roomId}`)
        setMessages(response.data)
      } catch (error) {
        console.error('Failed to load chat history:', error)
      }
    }
    
    loadHistory()

    // Connect WebSocket
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('email')
    
    if (!token) {
      router.push('/login')
      return
    }

    const client = new Client({
      webSocketFactory: () => {
        return new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`)
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('Connected!')
        setIsConnected(true)
        
        client.subscribe(`/topic/chat/${roomId}`, (message) => {
          const msg = JSON.parse(message.body)
          setMessages(prev => [...prev, msg])
        })
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
        setIsConnected(false)
      }
    })
    
    client.activate()
    setStompClient(client)

    return () => {
      if (client.connected) {
        client.deactivate()
      }
    }
  }, [roomId, router])

  const sendMessage = () => {
    if (!newMessage.trim() || !stompClient?.connected) return

    stompClient.publish({
      destination: `/app/chat/${roomId}`,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        messageType: 'CHAT',
        roomId: parseInt(roomId),
        content: newMessage
      })
    })
    
    setNewMessage('')
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">채팅방 {roomId}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: isConnected ? '#4caf50' : '#f44336'
              }} />
              <Typography variant="caption">
                {isConnected ? '연결됨' : '연결 끊김'}
              </Typography>
            </Box>
          </Box>
          
          <Box
            ref={chatBoxRef}
            sx={{
              height: 400,
              overflowY: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 2,
              mb: 2
            }}
          >
            {messages.map((msg, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {msg.senderEmail || msg.senderName}
                </Typography>
                <Typography>{msg.content || msg.message}</Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="메시지 입력..."
              size="small"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!isConnected}
            >
              전송
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}