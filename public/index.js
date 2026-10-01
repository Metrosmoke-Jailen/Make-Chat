$(document).ready(() => {

  const socket = io.connect();

  let currentUser;


  // ==========================================
  // GET INITIAL DATA
  // ==========================================

  socket.emit('get online users');

  socket.emit('get channels');


  // ==========================================
  // LOGIN
  // ==========================================

  $('#create-user-btn').click((e) => {

    e.preventDefault();

    let username = $('#username-input').val().trim();

    if (username.length > 0) {

      currentUser = username;

      socket.emit(
        'new user',
        username
      );

      $('.username-form').hide();

      $('.main-container').css(
        'display',
        'flex'
      );

      // Join General
      socket.emit(
        'user changed channel',
        'General'
      );

    }

  });


  // ==========================================
  // CREATE CHANNEL
  // ==========================================

  $('#new-channel-btn').click((e) => {

    e.preventDefault();

    let newChannel = $('#new-channel-input')
      .val()
      .trim();

    if (newChannel.length > 0) {

      console.log(
        'Creating channel:',
        newChannel
      );

      socket.emit(
        'new channel',
        newChannel
      );

      $('#new-channel-input').val('');

    }

  });


  // ==========================================
  // CLICK CHANNEL
  // ==========================================

  $(document).on(
    'click',
    '.channel',
    (e) => {

      let newChannel = $(e.currentTarget)
        .text()
        .trim();

      console.log(
        'Changing channel to:',
        newChannel
      );

      socket.emit(
        'user changed channel',
        newChannel
      );

    }
  );


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  $('#send-chat-btn').click((e) => {

    e.preventDefault();

    let channel = $('.channel-current')
      .text()
      .trim();

    let message = $('#chat-input')
      .val()
      .trim();

    if (
      message.length > 0 &&
      channel.length > 0
    ) {

      socket.emit(
        'new message',
        {
          sender: currentUser,
          message: message,
          channel: channel
        }
      );

      $('#chat-input').val('');

    }

  });


  // ==========================================
  // GET ONLINE USERS
  // ==========================================

  socket.on(
    'get online users',
    (onlineUsers) => {

      $('.users-online').empty();

      for (
        let username in onlineUsers
      ) {

        $('.users-online').append(`
          <div class="user-online">
            ${username}
          </div>
        `);

      }

    }
  );


  // ==========================================
  // NEW USER
  // ==========================================

  socket.on(
    'new user',
    (username) => {

      $('.users-online').append(`
        <div class="user-online">
          ${username}
        </div>
      `);

    }
  );


  // ==========================================
  // USER LEFT
  // ==========================================

  socket.on(
    'user has left',
    (onlineUsers) => {

      $('.users-online').empty();

      for (
        let username in onlineUsers
      ) {

        $('.users-online').append(`
          <div class="user-online">
            ${username}
          </div>
        `);

      }

    }
  );


  // ==========================================
  // GET EXISTING CHANNELS
  // ==========================================

  socket.on(
    'get channels',
    (channels) => {

      console.log(
        'Received channels:',
        channels
      );

      // Remove dynamically-created channels
      $('.channels .channel').remove();

      // Add every channel except General
      for (
        let channel in channels
      ) {

        if (channel !== 'General') {

          $('.channels').append(`
            <div class="channel">
              ${channel}
            </div>
          `);

        }

      }

    }
  );


  // ==========================================
  // NEW CHANNEL
  // ==========================================

  socket.on(
    'new channel',
    (newChannel) => {

      console.log(
        'Received new channel:',
        newChannel
      );

      // Add the channel to the sidebar
      $('.channels').append(`
        <div class="channel">
          ${newChannel}
        </div>
      `);

    }
  );


  // ==========================================
  // USER CHANGED CHANNEL
  // ==========================================

  socket.on(
    'user changed channel',
    (data) => {

      console.log(
        'Changed channel:',
        data.channel
      );

      // Turn current channel back into normal channel
      $('.channel-current')
        .addClass('channel')
        .removeClass('channel-current');

      // Find selected channel
      $('.channel')
        .filter(function () {
          return $(this).text().trim() === data.channel;
        })
        .addClass('channel-current')
        .removeClass('channel');


      // Remove old messages
      $('.message').remove();


      // Load saved messages
      data.messages.forEach((message) => {

        $('.message-container').append(`
          <div class="message">

            <p class="message-user">
              ${message.sender}:
            </p>

            <p class="message-text">
              ${message.message}
            </p>

          </div>
        `);

      });

    }
  );


  // ==========================================
  // NEW MESSAGE
  // ==========================================

  socket.on(
    'new message',
    (data) => {

      let currentChannel = $('.channel-current')
        .text()
        .trim();

      if (
        currentChannel === data.channel
      ) {

        $('.message-container').append(`
          <div class="message">

            <p class="message-user">
              ${data.sender}:
            </p>

            <p class="message-text">
              ${data.message}
            </p>

          </div>
        `);

      }

    }
  );


  // ==========================================
  // LOGOUT
  // ==========================================

  $('#logout-btn').click((e) => {

    e.preventDefault();

    socket.emit('logout');

    currentUser = null;

    $('#username-input').val('');
    $('#chat-input').val('');

    $('.message').remove();

    $('.users-online').empty();

    $('.main-container').hide();

    $('.username-form').show();

  });

});