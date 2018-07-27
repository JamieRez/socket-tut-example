$(document).ready(() => {

  const socket = io.connect();

  let currentUser;

  socket.emit('user changed channel', "General");

  socket.on('get online users', (users) => {
    $('.userOnline').remove();
    for(username in users){
      $('.usersOnline').append(`<div class="userOnline">${username}</div>`);
    }
  })

  socket.on('new user', (username) => {
    socket.emit('get online users');
  })

  socket.on('user has left', (users) => {
    $('.userOnline').remove();
    for(username in users){
      $('.usersOnline').append(`<div class=userOnline>${username}</div>`);
    }
  });

  socket.on('new message', (data) => {
    $('.messageContainer').append(`
      <div class="message">
        <p class="messageUser">${data.sender}: </p>
        <p class="messageText">${data.message}</p>
      </div>
      `);
  })

  socket.on('new direct message', (data) => {
    $('.messageContainer').append(`
      <div class="message">
        <p class="messageUser">${data.sender} (private): </p>
        <p class="messageText">${data.message}</p>
      </div>
      `);
  })

  socket.on('new channel', (newChannel) => {
    $('.channels').append(`
      <div class="channel">${newChannel}</div>
    `);
  });

  socket.on('user changed channel', (messages) => {
    $('.message').remove();
    messages.forEach((message) => {
      $('.messageContainer').append(`
        <div class="message">
          <p class="messageUser">${message.sender}: </p>
          <p class="messageText">${message.message}</p>
        </div>
      `);
    });
  })

  $('#createUserBtn').click((e)=>{
    e.preventDefault();
    if($('#usernameInput').val().length > 0){
      socket.emit('new user', $('#usernameInput').val());
      currentUser = $('#usernameInput').val();
      $('.usernameForm').remove();
      $('.mainContainer').css('display', 'flex');
    }
  });

  $('#sendChatBtn').click((e) => {
    e.preventDefault();
    if($('#chatInput').val().length > 0){
      let message = $('#chatInput').val();
      if(message[0] == '@'){
        // Direct Message
        let receiver = message.substr(1, message.indexOf(' ') - 1);
        let textMessage = message.substr(message.indexOf(' ') + 1, message.length);
        socket.emit('new direct message', {
          sender : currentUser,
          receiver : receiver,
          message : textMessage
        })
        $('.messageContainer').append(`
          <div class="message">
            <p class="messageUser">${currentUser} (@${receiver}): </p>
            <p class="messageText">${textMessage}</p>
          </div>
          `);
      }
      else{
        //Global Chat
        let channel = $('.channel-current').text();
        socket.emit('new message', {
          sender : currentUser,
          message : message,
          channel : channel
        });
      }
      $('#chatInput').val("");
    }
  });

  $(document).on('click', '.channel', (e)=>{
    let newChannel = e.target.textContent;
    socket.emit('user changed channel', newChannel);
    $('.channel-current').addClass('channel');
    $('.channel-current').removeClass('channel-current');
    $(e.target).addClass('channel-current');
    $(e.target).removeClass('channel');
  });

  $('#newChannelBtn').click(()=>{
    if($('#newChannelInput').val().length > 0){
      let newChannel = $('#newChannelInput').val();
      socket.emit('new channel', newChannel);
      $('.channel-current').addClass('channel');
      $('.channel-current').removeClass('channel-current');
      $('.channels').append(`
        <div class="channel-current">${newChannel}</div>
      `);
      $('#newChannelInput').val("");
    }
  })

})
