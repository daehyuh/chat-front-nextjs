'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  Container,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Paper
} from '@mui/material'

interface Chat {
  roomId: string
  roomName: string
  unReadCount: number
  isGroupChat: string
}

export default function MyChatPage() {
  const [chatList, setChatList] = useState<Chat[]>([])
  const router = useRouter()

  useEffect(() => {
    loadMyChats()
  }, [])

  const loadMyChats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/my/rooms`
      )
      setChatList(response.data)
    } catch (error) {
      console.error('Failed to load my chats:', error)
    }
  }

  const enterChatRoom = (roomId: string) => {
    router.push(`/chatpage/${roomId}`)
  }

  const leaveChatRoom = async (roomId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/room/group/${roomId}/leave`
      )
      setChatList(chatList.filter(chat => chat.roomId !== roomId))
    } catch (error) {
      console.error('Failed to leave chat room:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h5" align="center" sx={{ py: 3, backgroundColor: '#f5f5f5' }}>
            내 채팅 목록
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="40%">채팅방 이름</TableCell>
                  <TableCell width="25%" align="center">읽지않은 메시지</TableCell>
                  <TableCell width="35%" align="center">액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chatList.map((chat) => (
                  <TableRow key={chat.roomId}>
                    <TableCell>{chat.roomName}</TableCell>
                    <TableCell align="center">{chat.unReadCount}</TableCell>
                    <TableCell align="center">
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => enterChatRoom(chat.roomId)}
                        size="small"
                        sx={{ mr: 1, textTransform: 'none' }}
                      >
                        입장
                      </Button>
                      <Button
                        variant="contained"
                        disabled={chat.isGroupChat === 'N'}
                        onClick={() => leaveChatRoom(chat.roomId)}
                        size="small"
                        sx={{ 
                          backgroundColor: '#757575',
                          '&:hover': { backgroundColor: '#616161' },
                          textTransform: 'none'
                        }}
                      >
                        나가기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  )
}