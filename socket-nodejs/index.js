// Setup basic express server
const express = require('express');

const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

var fs = require('fs');
var ss = require('socket.io-stream');

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom
let numUsers = 0;
let arrayChunks = [];

io.on('connection', (socket) => {
  let addedUser = false;


  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  // when the user press alert.. perform this
  socket.on('press alert', () => {

      // echo globally that this client has left
      socket.broadcast.emit('pressed alert', {
        username: socket.username,
      });

  });

  socket.on('start stream', function () {
    arrayChunks =[];
    console.log('start stream');
  });

  socket.on('stream', function (username,buffer,sizebuffer) {
    console.log(username);
    console.log(buffer);
    arrayChunks.push(buffer);
    console.log(sizebuffer);
    console.log(typeof buffer); // its object

    socket.broadcast.emit('get stream',
      buffer
    );

    // var stream = ss.createStream();
    // var filename = __dirname + '/penningen.mp3' ;
    // ss(socket).emit('audio-stream', stream, { name: filename });
    // fs.createReadStream(filename).pipe(stream);
  });

  socket.on('end stream', function () {
    console.log(socket.username);
    console.log("end stream =------------------------");
    console.log(arrayChunks)
    // String string = new String(bytes); in java
  });

  socket.on('byte text', function (byte) {
    console.log(socket.username);
    console.log(byte);
    console.log(bin2string(byte));
    // String string = new String(bytes); in java
  });




});

function bin2string(array){
  var result = "";
  for(var i = 0; i < array.length; ++i){
    result+= (String.fromCharCode(array[i]));
  }
  return result;
}