const User = require('../models/user.js');
module.exports = (io, socket, connectedUsers) => {


  socket.on('new user', (username) => {
    socket["username"] = username;
    connectedUsers[username] = socket.id;
    console.log(connectedUsers);
    User.findOne({username : username}).then((user) => {
      //User Found
      user.isOnline = true;
    }).catch((err) => {
      //No User Found
      let user = new User({username : username});
      user.isOnline = true;
      user.save();
    })
    io.emit('new user', username);
  })

  socket.on('get online users', () => {
    socket.emit('get online users', connectedUsers);
  })

  socket.on('new global message', (data) => {
    io.emit('new global message', data);
  })

  socket.on('new direct message', (data) => {
    console.log(`${data.sender}: ${data.message}`);
    console.log(connectedUsers);
    console.log(data.receiver);
    if(connectedUsers.hasOwnProperty(data.receiver)){
      let receiverId = connectedUsers[data.receiver];
      //Send to Receiver
      console.log("WE HERE");
      socket.broadcast.to(receiverId).emit('new direct message', data);
      // Send to Self
      socket.emit('new direct message', data);
    }else{
      console.log("NO WE NOT");
      User.findOne({username : data.receiver}).then((user) => {
        user.incomingMsgs.push(`${data.sender}: ${data.message}`);
        user.save();
      })
    }
  })

  socket.on('disconnect', () => {
    User.findOne({username : socket.username}).then((user) => {
      user.isOnline = false;
      user.save().then(() => {
        delete connectedUsers[socket.username]
        io.emit('user has left', connectedUsers);
      })
    })
  });

}
