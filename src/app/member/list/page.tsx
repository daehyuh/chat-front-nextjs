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

interface Member {
  id: number
  name: string
  email: string
}

export default function MemberList() {
  const [memberList, setMemberList] = useState<Member[]>([])
  const [senderEmail, setSenderEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      setSenderEmail(localStorage.getItem('email'))
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/member/list`
        )
        setMemberList(response.data)
      } catch (error) {
        console.error('Failed to load member list:', error)
      }
    }
    
    loadData()
  }, [])

  const startChat = async (otherMemberId: number) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/room/private/create?otherMemberId=${otherMemberId}`
      )
      const roomId = response.data
      router.push(`/chatpage/${roomId}`)
    } catch (error) {
      console.error('Failed to start chat:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 0 }}>
          <Typography variant="h5" align="center" sx={{ py: 3, backgroundColor: '#f5f5f5' }}>
            회원목록
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="10%">ID</TableCell>
                  <TableCell width="25%">이름</TableCell>
                  <TableCell width="45%">email</TableCell>
                  <TableCell width="20%" align="center">채팅</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberList.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell align="center">
                      <Button
                        color="primary"
                        variant="contained"
                        disabled={member.email === senderEmail}
                        onClick={() => startChat(member.id)}
                        size="small"
                        sx={{ textTransform: 'none' }}
                      >
                        채팅하기
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