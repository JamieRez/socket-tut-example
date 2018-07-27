module.exports = (io, socket, connectedUsers, channels) => {

  socket.on('new user', (username) => {
    socket["username"] = username;
    connectedUsers[username] = socket.id;
    socket.join('General');
    io.emit('new user', username);
  })

  socket.on('get online users', () => {
    socket.emit('get online users', connectedUsers);
  })

  socket.on('new message', (data) => {
    channels[data.channel].push({sender : data.sender, message : data.message});
    io.to(data.channel).emit('new message', data);
  })

  socket.on('new direct message', (data) => {
    if(connectedUsers[data.receiver]){
      let receiverId = connectedUsers[data.receiver];
      //Send to Receiver
      socket.broadcast.to(receiverId).emit('new direct message', data);
    }
  })

  socket.on('user changed channel', (newChannel) => {
    socket.join(newChannel);
    socket.emit('user changed channel', channels[newChannel]);
  })

  socket.on('new channel', (newChannel) => {
    channels[newChannel] = [];
    socket.join(newChannel);
    socket.broadcast.emit('new channel', newChannel);
    socket.emit('user changed channel', channels[newChannel]);
  })

  socket.on('disconnect', () => {
    delete connectedUsers[socket.username]
    io.emit('user has left', connectedUsers);
  });

}
