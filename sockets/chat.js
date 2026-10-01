// chat.js

module.exports = (io, socket, onlineUsers, channels) => {

  // ==========================================
  // NEW USER
  // ==========================================

  socket.on('new user', (username) => {

    onlineUsers[username] = socket.id;

    socket.username = username;

    console.log(`✋ ${username} has joined the chat! ✋`);

    io.emit('new user', username);

  });


  // ==========================================
  // GET ONLINE USERS
  // ==========================================

  socket.on('get online users', () => {

    socket.emit(
      'get online users',
      onlineUsers
    );

  });


  // ==========================================
  // GET CHANNELS
  // ==========================================

  socket.on('get channels', () => {

    console.log('Sending channels:', channels);

    socket.emit(
      'get channels',
      channels
    );

  });


  // ==========================================
  // NEW CHANNEL
  // ==========================================

  socket.on('new channel', (newChannel) => {

    console.log('New channel requested:', newChannel);

    // Prevent duplicate channels
    if (channels[newChannel]) {
      console.log(`Channel "${newChannel}" already exists.`);
      return;
    }

    // Create channel
    channels[newChannel] = [];

    console.log('Channels are now:', channels);

    // Join creator to the channel
    socket.join(newChannel);

    socket.currentChannel = newChannel;

    // Tell EVERY connected client
    io.emit(
      'new channel',
      newChannel
    );

    // Tell creator to switch to the new channel
    socket.emit(
      'user changed channel',
      {
        channel: newChannel,
        messages: channels[newChannel]
      }
    );

  });


  // ==========================================
  // CHANGE CHANNEL
  // ==========================================

  socket.on('user changed channel', (newChannel) => {

    console.log(
      `${socket.username || 'Unknown user'} changing to ${newChannel}`
    );

    // Make sure the channel exists
    if (!channels[newChannel]) {
      console.log(`Channel "${newChannel}" does not exist.`);
      return;
    }

    // Leave previous channel
    if (socket.currentChannel) {

      socket.leave(
        socket.currentChannel
      );

    }

    // Save new channel
    socket.currentChannel = newChannel;

    // Join new channel
    socket.join(newChannel);

    // Send channel + messages back to client
    socket.emit(
      'user changed channel',
      {
        channel: newChannel,
        messages: channels[newChannel]
      }
    );

  });


  // ==========================================
  // NEW MESSAGE
  // ==========================================

  socket.on('new message', (data) => {

    if (!channels[data.channel]) {
      console.log(
        `Cannot send message. Channel "${data.channel}" does not exist.`
      );

      return;
    }

    // Save message
    channels[data.channel].push({
      sender: data.sender,
      message: data.message
    });

    console.log(
      `🎤 [${data.channel}] ${data.sender}: ${data.message} 🎤`
    );

    // Send ONLY to users in this channel
    io.to(data.channel).emit(
      'new message',
      data
    );

  });


  // ==========================================
  // LOGOUT
  // ==========================================

  socket.on('logout', () => {

    console.log(
      `👋 ${socket.username} is logging out.`
    );

    socket.disconnect();

  });


  // ==========================================
  // DISCONNECT
  // ==========================================

  socket.on('disconnect', () => {

    if (socket.username) {

      delete onlineUsers[socket.username];

      io.emit(
        'user has left',
        onlineUsers
      );

      console.log(
        `👋 ${socket.username} has left the chat.`
      );

    }

  });

};