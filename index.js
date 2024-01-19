import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io'
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { availableParallelism } from 'node:os';
import cluster from 'node:cluster';
import { createAdapter, setupPrimary} from '@socket.io/cluster-adapter';

const db = await open({
    filename: 'chat.db',
    driver: sqlite3.Database
})

await db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_offset TEXT UNIQUE,
        context TEXT
    )
`)

if (cluster.isPrimary) {
    const numCPUs = availableParallelism()
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork({
            PORT: 3000+i
        })
    }
    setupPrimary()
} else {
    const app = express();
    // initialize app to be function handler you cna supply to HTTP server
    const server = createServer(app);
    const io = new Server(server, {
        connectionStateRecovery: {} // recover chat after disconnect
    })
}

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'))
});
// load html file on request

io.on('connection', async (socket) => {
  socket.on('chat message', async (msg, clientOffset, callback) => {
    let result;
    try {
      result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
    } catch (e) {
      if (e.errno === 19 /* SQLITE_CONSTRAINT */ ) {
        // the message was already inserted, so we notify the client
        callback();
      } else {
        // nothing to do, just let the client retry
      }
      return;
    }
    io.emit('chat message', msg, result.lastID);
    // acknowledge the event
    callback();
  });

  if(!socket.recovered) {
    try {
        await dbd.each('SELECT id, content FROM messages WHERE id > ?')
        [socket.handshake.auth.serverOffset || 0]
        (_err, row => {
            socket.emit('chat message', row.content, row.id)
        })
    } catch(e) {
        console.log("ruh roh!")
    }
  }
})

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
// listen on port 3000