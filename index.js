import express from 'express';
import { createServer } from 'node:http';

const app = express();
// initialize app to be function handler you cna supply to HTTP server
const server = createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});
// define route handler (/) that gets called when website home is hit

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
// listen on port 3000