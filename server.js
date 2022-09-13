const express = require('express');
const app = express();
// this allow us to create a server to be used by socket.io
const server = require('http').Server(app); 
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid')

// how we would render the view engine
app.set('view engine', 'ejs');
// we gonna put all our javascript and css files in the public folder
app.use(express.static('public'));

// get route // this will take a request and send a response
// and this gonna create new room and redirect to that room
app.get('/', (req, res) => {
    // making a random room id --> uuidV4
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})
// this gonna run when a user connects to the server
io.on('connection', socket => {
   // we can set events that we wanna listen to, when a user connects to our room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId) 
        // this gonna send a message to all the users in the room
    //socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.to(roomId).emit('user-connected', userId)
        
        // to make the user disconnect quicker when they leave the room
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })

    })
});  

server.listen(3000)