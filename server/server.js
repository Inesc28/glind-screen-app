const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('requestScreenShare', () => {
    socket.broadcast.emit('screenShareRequest', socket.id);
  });

  socket.on('acceptScreenShare', (fromSocketId) => {
    socket.to(fromSocketId).emit('screenShareAccepted', socket.id);
  });

  socket.on('declineScreenShare', (fromSocketId) => {
    socket.to(fromSocketId).emit('screenShareDeclined');
  });

  socket.on('screenData', (data) => {
    socket.broadcast.emit('screenUpdate', data);
  });

  socket.on('locationUpdate', (data) => {
    socket.broadcast.emit('locationUpdate', data);
  });

  socket.on('textAndLocationUpdate', (data) => {
      console.log('Texto y ubicación recibidos:', data);
      socket.broadcast.emit('textAndLocationUpdate', data); 
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
