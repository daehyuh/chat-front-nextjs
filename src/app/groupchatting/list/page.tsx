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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material'

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
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/room/group/list`
      )
      setChatRoomList(response.data)
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
    }
  }

  const joinChatRoom = async (roomId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/room/group/${roomId}/join`
      )
      router.push(`/chatpage/${roomId}`)
    } catch (error) {
      console.error('Failed to join chat room:', error)
    }
  }

  const createChatRoom = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/room/group/create?roomName=${newRoomTitle}`,
        null
      )
      setShowCreateRoomModal(false)
      setNewRoomTitle('')
      loadChatRoom()
    } catch (error) {
      console.error('Failed to create chat room:', error)
    }
  }

  useEffect(() => {
    loadChatRoom()
  }, [])

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 3, px: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h5">
              채팅방목록
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowCreateRoomModal(true)}
              sx={{ 
                backgroundColor: '#757575',
                '&:hover': { backgroundColor: '#616161' },
                textTransform: 'none'
              }}
            >
              채팅방 생성
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="20%">방번호</TableCell>
                  <TableCell width="60%">방제목</TableCell>
                  <TableCell width="20%" align="center">채팅</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chatRoomList.map((chat) => (
                  <TableRow key={chat.roomId}>
                    <TableCell>{chat.roomId}</TableCell>
                    <TableCell>{chat.roomName}</TableCell>
                    <TableCell align="center">
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => joinChatRoom(chat.roomId)}
                        size="small"
                        sx={{ textTransform: 'none' }}
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

      <Dialog
        open={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>채팅방 생성</DialogTitle>
        <DialogContent>
          <TextField
            label="방제목"
            value={newRoomTitle}
            onChange={(e) => setNewRoomTitle(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setShowCreateRoomModal(false)}>
            취소
          </Button>
          <Button color="primary" variant="contained" onClick={createChatRoom}>
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}