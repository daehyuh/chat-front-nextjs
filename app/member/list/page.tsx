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
  Paper 
} from '@mui/material'
import axios from '@/utils/axios'

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
    const fetchMembers = async () => {
      setSenderEmail(localStorage.getItem('email'))
      const response = await axios.get('/member/list')
      setMemberList(response.data)
    }
    fetchMembers()
  }, [])

  const startChat = async (otherMemberId: number) => {
    const response = await axios.post(`/chat/room/private/create?otherMemberId=${otherMemberId}`)
    const roomId = response.data
    router.push(`/chatpage/${roomId}`)
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            회원목록
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>email</TableCell>
                  <TableCell>채팅</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {memberList.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.id}</TableCell>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        color="primary"
                        disabled={member.email === senderEmail}
                        onClick={() => startChat(member.id)}
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