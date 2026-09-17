$(document).ready(() => {

  const socket = io.connect();

  $('#create-user-btn').click((e) => {
    e.preventDefault();

    let username = $('#username-input').val();

    if (username.length > 0) {

      // Send username to server
      socket.emit('new user', username);

      // Remove username form
      $('.username-form').remove();
    }
  });

  // Listen for new users
  socket.on('new user', (username) => {
    console.log(`✋ ${username} has joined the chat! ✋`);
  });

});