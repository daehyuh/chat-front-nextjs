'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Box
} from '@mui/material'
import axios from '@/utils/axios'

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
    const fetchMyChats = async () => {
      const response = await axios.get('/chat/my/rooms')
      setChatList(response.data)
    }
    fetchMyChats()
  }, [])

  const enterChatRoom = (roomId: string) => {
    router.push(`/chatpage/${roomId}`)
  }

  const leaveChatRoom = async (roomId: string) => {
    await axios.delete(`/chat/room/group/${roomId}/leave`)
    setChatList(chatList.filter(chat => chat.roomId !== roomId))
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            내 채팅 목록
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>채팅방 이름</TableCell>
                  <TableCell>읽지않은 메시지</TableCell>
                  <TableCell>액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chatList.map((chat) => (
                  <TableRow key={chat.roomId}>
                    <TableCell>{chat.roomName}</TableCell>
                    <TableCell>{chat.unReadCount}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => enterChatRoom(chat.roomId)}
                        >
                          입장
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          disabled={chat.isGroupChat === 'N'}
                          onClick={() => leaveChatRoom(chat.roomId)}
                        >
                          나가기
                        </Button>
                      </Box>
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