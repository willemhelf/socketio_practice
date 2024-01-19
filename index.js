import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io'

const app = express();
// initialize app to be function handler you cna supply to HTTP server
const server = createServer(app);
const io = new Server(server)

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
});
// load html file on request

io.on('connection', (socket) => {
    console.log('a user connected');
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
// listen on port 3000