const express = require('express')
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/socket-joe', () => {
  console.log("Connected to local db");
});

//User Controller
require('./controllers/user.js')(app);

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = {};
let channels = {General : []};
io.on('connection', function (socket) {
  //user sockets
  require('./sockets/user.js')(io, socket, connectedUsers, channels);
});

app.get('/', function (req, res) {
  res.render('index');
});

server.listen(8080, () => {
  console.log("Server is listening");
});
