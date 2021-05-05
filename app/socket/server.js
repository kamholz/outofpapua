import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer);

io.on('connection', (client) => {
  client.on('message', (data) => {
    console.log(data);
  });
});

httpServer.listen(process.env.PORT || 4000);