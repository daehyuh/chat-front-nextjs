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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material'
import axios from '@/utils/axios'

interface ChatRoom {
  roomId: string
  roomName: string
}

export default function GroupChattingList() {
  const [chatRoomList, setChatRoomList] = useState<ChatRoom[]>([])
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  const [newRoomTitle, setNewRoomTitle] = useState('')
  const router = useRouter()

  const loadChatRoom = async () => {
    const response = await axios.get('/chat/room/group/list')
    setChatRoomList(response.data)
  }

  useEffect(() => {
    loadChatRoom()
  }, [])

  const joinChatRoom = async (roomId: string) => {
    await axios.post(`/chat/room/group/${roomId}/join`)
    router.push(`/chatpage/${roomId}`)
  }

  const createChatRoom = async () => {
    await axios.post(`/chat/room/group/create?roomName=${newRoomTitle}`, null)
    setShowCreateRoomModal(false)
    setNewRoomTitle('')
    loadChatRoom()
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2" align="center" sx={{ flexGrow: 1 }}>
              채팅방목록
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowCreateRoomModal(true)}
            >
              채팅방 생성
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>방번호</TableCell>
                  <TableCell>방제목</TableCell>
                  <TableCell>채팅</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chatRoomList.map((chat) => (
                  <TableRow key={chat.roomId}>
                    <TableCell>{chat.roomId}</TableCell>
                    <TableCell>{chat.roomName}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => joinChatRoom(chat.roomId)}
                      >
                        참여하기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={showCreateRoomModal} onClose={() => setShowCreateRoomModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>채팅방 생성</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="방제목"
            fullWidth
            variant="outlined"
            value={newRoomTitle}
            onChange={(e) => setNewRoomTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateRoomModal(false)} color="inherit">
            취소
          </Button>
          <Button onClick={createChatRoom} color="primary" variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}