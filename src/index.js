const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')


const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

let count = 0
io.on('connection', (socket) => {
    console.log('New web socket connected..')


//connection created event
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Wellcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

//message sending event
    socket.on('sendMessage', (message, callback) => {
        
        const user=getUser(socket.id)
        const filter = new Filter()  // if message contain slag language
        if (filter.isProfane(message)) {
            return callback('Error: Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })

//location sending event
    socket.on('sendLocation', (location, callback) => {
        const user=getUser(socket.id)

        let latitude = location.latitude
        let longitude = location.longitude
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude} `))
        callback()
    })

//user disconnect event
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(port, (req, res) => {
    console.log('Server listining at port..' + port)
})