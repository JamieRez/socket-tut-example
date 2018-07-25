$(document).ready(() => {

  const socket = io.connect();

  let currentUser;

  socket.emit('get online users');

  socket.on('get online users', (users) => {
    for(username in users){
      $('.usersOnline').append(`<p>${username}</p>`);
    }
  })

  socket.on('new user', (username) => {
    console.log(`${username} has joined the chat`);
    $('.usersOnline').append(`<p>${username}</p>`);
  })

  socket.on('user has left', (users) => {
    $('.usersOnline').empty();
    for(username in users){
      $('.usersOnline').append(`<p>${username}</p>`);
    }
  });

  socket.on('new global message', (data) => {
    $('.messageContainer').append(`
      <div class="message">
        <p id="messageUser">${data.sender}: </p>
        <p id="messageText">${data.message}</p>
      </div>
      `);
  })

  socket.on('new direct message', (data) => {
    console.log(`${data.sender}: ${data.message}`);
  })

  $('#createUserButton').click((e)=>{
    e.preventDefault();
    socket.emit('new user', $('#usernameInput').val());
    currentUser = $('#usernameInput').val();
    $('.usernameForm').remove();
    $('.chatBox').css('display', 'block');
    $('.messageContainer').css('display', 'block');
  });

  $('#sendChatBtn').click((e) => {
    e.preventDefault();
    let message = $('#chatInput').val();
    if(message[0] == '@'){
      // Direct Message
      let receiver = message.substr(1, message.indexOf(' '));
      let textMessage = message.substr(message.indexOf(' ') + 1, message.length);
      socket.emit('new direct message', {
        sender : currentUser,
        receiver : receiver,
        message : textMessage
      })
    }
    else{
      //Global Chat
      socket.emit('new global message', {
        sender : currentUser,
        message : message
      });
      $('#chatInput').val("");
    }
  })

})
