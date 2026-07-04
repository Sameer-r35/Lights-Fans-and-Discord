const express = require('express');
const cors = require('cors');
const DeviceStore = require('./DeviceStore');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const store = new DeviceStore();

// Store active SSE clients
let clients = [];

// REST Endpoint: GET /api/status
app.get('/api/status', (req, res) => {
  res.json({
    devices: store.getAllDevices(),
    totalWattage: store.getTotalWattage()
  });
});

// SSE Endpoint: GET /api/stream
app.get('/api/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send an initial heartbeat to establish connection
  res.write(': heartbeat\n\n');
  
  // Send the current state immediately on connection
  const initialPayload = JSON.stringify({
    devices: store.getAllDevices(),
    totalWattage: store.getTotalWattage()
  });
  res.write(`data: ${initialPayload}\n\n`);

  // Add this client to the active clients list
  clients.push(res);

  // Remove client when connection closes
  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// The Simulator: Toggle 1-2 random devices every 5 seconds
setInterval(() => {
  store.toggleRandomDevices();
  
  // Broadcast the new state to all connected clients
  const payload = JSON.stringify({
    devices: store.getAllDevices(),
    totalWattage: store.getTotalWattage()
  });
  
  clients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
}, 5000);

app.listen(port, () => {
  console.log(`Lights, Fans, Discord backend simulation running on port ${port}`);
});
