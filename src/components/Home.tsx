import { useEffect, useState } from "react"
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
  Button,
  ListGroupItem,
} from "react-bootstrap"
import {io} from "socket.io-client"
import {User, Message} from "../types"

const socket = io(`${process.env.REACT_APP_BE_URL}`, { transports: ['websocket'] })

const Home = () => {
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  useEffect(() => {
    socket.on("welcome", msg =>  {
      console.log(msg)
      socket.on("loggedIn", users => {
        setOnlineUsers(users)
      })
      socket.on("setUsername", users => {
        setOnlineUsers(users)
      })
      socket.on("newMessage", msg => {       
        setChatHistory(chatHistory => [...chatHistory, msg.message])
      })
    })
  }, [])

  const submitUsername = () => {
    socket.emit("setUsername", {username})
  }

  const sendMessage = () => {
    const msg = {
      sender: username,
      text: message,
      createdAt: new Date().toString()
    }
    socket.emit("sendMessage", {message: msg})
    setChatHistory([...chatHistory, msg])
  }
  return (
    <Container fluid>
      <Row style={{ height: "95vh" }} className="my-3">
        <Col md={9} className="d-flex flex-column justify-content-between">
          {/* LEFT COLUMN */}
          {/* TOP AREA: USERNAME INPUT FIELD */}
          {!loggedIn && (
          <Form
            onSubmit={e => {
              e.preventDefault()
              submitUsername()
              setLoggedIn(true)
            }}
          >
            <FormControl
              placeholder="Set your username here"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </Form>
          )}
          {/* MIDDLE AREA: CHAT HISTORY */}
          <ListGroup>
            {chatHistory.map((message, i) => <ListGroupItem key={i}><strong>{message.sender}</strong> | {message.text}</ListGroupItem>)}
          </ListGroup>
          {/* BOTTOM AREA: NEW MESSAGE */}
          <Form
            onSubmit={e => {
              e.preventDefault()
              if (message.length > 0) {
                sendMessage()
                setMessage("")
              }
            }}
          >
            <FormControl
              placeholder="Write your message here"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={!loggedIn}
            />
          </Form>
        </Col>
        <Col md={3}>
          {/* ONLINE USERS SECTION */}
          <div className="mb-3">Connected users:</div>
          <ListGroup>
            {onlineUsers.map(user => <ListGroupItem key={user.socketId}>{user.username}</ListGroupItem>)}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
