module.exports = (io, socket) => {

  socket.on('new user', (username) => {
  console.log(`✋ ${username} has joined the chat! ✋`);

  // Send the username to every connected client
  io.emit('new user', username);
});
};