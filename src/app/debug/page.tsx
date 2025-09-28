'use client'

import { useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { Container, Card, CardContent, Button, TextField, Typography, Box } from '@mui/material'

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [stompClient, setStompClient] = useState<Client | null>(null)
  const [roomId, setRoomId] = useState('1')
  const [isConnected, setIsConnected] = useState(false)
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  const checkAuth = () => {
    addLog('=== Checking Authentication ===')
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const email = localStorage.getItem('email')
    
    if (!token) {
      addLog('❌ No token found')
      return false
    }
    
    addLog(`✅ Token found: ${token.substring(0, 20)}...`)
    addLog(`✅ UserId: ${userId}`)
    addLog(`✅ Email: ${email}`)
    
    // Parse JWT to check expiry
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      addLog(`✅ Token payload: ${JSON.stringify(payload)}`)
      
      if (payload.exp) {
        const expiry = new Date(payload.exp * 1000)
        addLog(`✅ Token expiry: ${expiry.toLocaleString()}`)
        if (expiry < new Date()) {
          addLog('❌ Token has expired')
          return false
        }
      }
    } catch (e) {
      addLog(`⚠️ Could not parse token: ${e}`)
    }
    
    return true
  }

  const testConnection = () => {
    addLog('=== Starting Connection Test ===')
    
    if (!checkAuth()) {
      addLog('❌ Authentication check failed')
      return
    }
    
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/connect`
    
    addLog(`Connecting to: ${wsUrl}`)
    
    const client = new Client({
      brokerURL: undefined,
      webSocketFactory: () => {
        addLog('Creating SockJS connection...')
        // SockJS 옵션 추가
        const sock = new SockJS(wsUrl, null, {
          timeout: 15000,
          transports: ['websocket', 'xhr-streaming', 'xhr-polling']
        })
        
        sock.onopen = () => addLog('SockJS: Connection opened')
        sock.onerror = (e) => addLog(`SockJS Error: ${JSON.stringify(e)}`)
        
        return sock
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: (str) => {
        addLog(`STOMP Debug: ${str}`)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: (frame) => {
        addLog('✅ STOMP Connected!')
        addLog(`Frame: ${JSON.stringify(frame.headers)}`)
        setIsConnected(true)
        
        // Test subscription
        try {
          addLog(`Subscribing to /topic/chat/${roomId}...`)
          const subscription = client.subscribe(
            `/topic/chat/${roomId}`,
            (message) => {
              addLog(`📨 Received message: ${message.body}`)
            }
          )
          addLog('✅ Subscription successful')
          
          // Send JOIN message
          const joinMessage = {
            messageType: 'JOIN',
            roomId: parseInt(roomId),
            senderId: parseInt(userId || '0'),
            content: '',
            token: token
          }
          
          addLog(`Sending JOIN message: ${JSON.stringify(joinMessage)}`)
          client.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify(joinMessage)
          })
          addLog('✅ JOIN message sent')
          
        } catch (error) {
          addLog(`❌ Subscription error: ${error}`)
        }
      },
      onStompError: (frame) => {
        addLog('❌ STOMP Error!')
        addLog(`Error message: ${frame.headers['message']}`)
        addLog(`Error body: ${frame.body}`)
        addLog(`Full frame: ${JSON.stringify(frame)}`)
        setIsConnected(false)
      },
      onWebSocketError: (event) => {
        addLog(`❌ WebSocket error: ${event}`)
        setIsConnected(false)
      },
      onWebSocketClose: (event) => {
        addLog(`WebSocket closed: code=${event.code}, reason=${event.reason}`)
        setIsConnected(false)
      },
      onDisconnect: () => {
        addLog('Disconnected from STOMP')
        setIsConnected(false)
      }
    })
    
    client.activate()
    setStompClient(client)
    addLog('Client activation initiated...')
  }

  const sendTestMessage = () => {
    if (!stompClient?.connected) {
      addLog('❌ Not connected')
      return
    }
    
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    
    const message = {
      messageType: 'CHAT',
      roomId: parseInt(roomId),
      senderId: parseInt(userId || '0'),
      content: 'Test message from debug page',
      token: token
    }
    
    addLog(`Sending test message: ${JSON.stringify(message)}`)
    
    try {
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify(message)
      })
      addLog('✅ Message sent')
    } catch (error) {
      addLog(`❌ Send error: ${error}`)
    }
  }

  const disconnect = () => {
    if (stompClient) {
      addLog('Disconnecting...')
      stompClient.deactivate()
      setStompClient(null)
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            WebSocket Debug Tool
          </Typography>
          
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              size="small"
              sx={{ width: 100 }}
            />
            <Button 
              variant="contained" 
              onClick={testConnection}
              disabled={isConnected}
            >
              Connect
            </Button>
            <Button 
              variant="contained" 
              onClick={sendTestMessage}
              disabled={!isConnected}
            >
              Send Test Message
            </Button>
            <Button 
              variant="outlined" 
              onClick={disconnect}
              disabled={!isConnected}
            >
              Disconnect
            </Button>
            <Button 
              variant="outlined" 
              onClick={clearLogs}
            >
              Clear Logs
            </Button>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              ml: 'auto'
            }}>
              <Box sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: isConnected ? '#4caf50' : '#f44336'
              }} />
              <Typography variant="caption">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              backgroundColor: '#1e1e1e',
              color: '#fff',
              p: 2,
              borderRadius: 1,
              height: 500,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}
          >
            {logs.map((log, index) => (
              <div key={index} style={{ 
                marginBottom: 4,
                color: log.includes('✅') ? '#4caf50' : 
                       log.includes('❌') ? '#f44336' :
                       log.includes('⚠️') ? '#ff9800' :
                       log.includes('📨') ? '#2196f3' : '#fff'
              }}>
                {log}
              </div>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}