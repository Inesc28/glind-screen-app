import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.20:3000'; 

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
