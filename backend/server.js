const express = require('express');
const cors = require('cors');
const DeviceStore = require('./DeviceStore');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const store = new DeviceStore();

let clients = [];
let simulatedDate = null; // Used for time override in debug
let simulationPausedUntil = 0; // Pause simulator during demo

function evaluateAlerts(devices) {
  const alerts = [];
  const now = Date.now();
  const currentDate = simulatedDate ? new Date(simulatedDate) : new Date();
  
  const timeString = `[${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}]`;

  // Anomaly 1: After-Hours Usage (outside 09:00 - 17:00)
  const hour = currentDate.getHours();
  const isAfterHours = hour < 9 || hour >= 17;
  
  if (isAfterHours) {
    const isAnyDeviceOn = devices.some(d => d.status === 'ON');
    if (isAnyDeviceOn) {
      alerts.push(`${timeString} After-Hours Usage: Devices are active outside working hours.`);
    }
  }

  // Anomaly 2: Continuous Overhead (all 5 devices in a room on for > 2 hours)
  const rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2'];
  rooms.forEach(room => {
    const roomDevices = devices.filter(d => d.room === room);
    if (roomDevices.length === 5) {
      const allRunningLong = roomDevices.every(d => {
        return d.status === 'ON' && d.turnedOnAt && (now - d.turnedOnAt > 7200000); 
      });
      if (allRunningLong) {
        alerts.push(`${timeString} High Usage Warning: All devices in ${room} have been running for over 2 hours.`);
      }
    }
  });

  return alerts; 
}

function buildStatePayload() {
  const devices = store.getAllDevices();
  const metrics = store.getMetrics();
  const alerts = evaluateAlerts(devices);
  return { devices, metrics, alerts };
}

function broadcastState() {
  const payload = JSON.stringify(buildStatePayload());
  clients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
}

// REST Endpoint: GET /api/status
app.get('/api/status', (req, res) => {
  res.json(buildStatePayload());
});

// SSE Endpoint: GET /api/stream
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  res.write(': heartbeat\n\n');
  
  const initialPayload = JSON.stringify(buildStatePayload());
  res.write(`data: ${initialPayload}\n\n`);

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// Task 4: Hackathon Demo Simulation Routes
app.post('/api/debug/force-after-hours', (req, res) => {
  const fakeDate = new Date();
  fakeDate.setHours(20, 0, 0, 0);
  simulatedDate = fakeDate.getTime();
  
  const lights = store.getAllDevices().filter(d => d.type === 'light');
  if (lights.length > 0) {
    const light = lights[0];
    light.status = 'ON';
    light.turnedOnAt = Date.now();
    light.lastUpdated = Date.now();
  }
  
  // Pause simulator random toggles for 20 seconds so the alert stays on screen for the video!
  simulationPausedUntil = Date.now() + 20000;
  
  broadcastState(); // Broadcast immediately!
  res.json({ message: "Simulating after-hours (20:00) and triggered one light ON." });
});

app.post('/api/debug/force-overhead', (req, res) => {
  const { room } = req.body;
  if (!room) return res.status(400).json({ error: "Missing 'room' in JSON body." });

  const devicesInRoom = store.getAllDevices().filter(d => d.room === room);
  if (devicesInRoom.length === 0) return res.status(404).json({ error: "Room not found." });

  devicesInRoom.forEach(device => {
    device.status = 'ON';
    device.turnedOnAt = Date.now() - 10800000; // 3 hours ago
    device.lastUpdated = Date.now();
  });
  
  // Pause simulator random toggles for 20 seconds so the alert stays on screen for the video!
  simulationPausedUntil = Date.now() + 20000;
  
  broadcastState(); // Broadcast immediately!
  res.json({ message: `Triggered continuous overhead in ${room} (devices on for 3 hours).` });
});

setInterval(() => {
  // Only randomize devices if we aren't pausing for a demo recording
  if (Date.now() > simulationPausedUntil) {
    store.toggleRandomDevices();
  }
  
  broadcastState();
}, 5000);

app.listen(port, () => {
  console.log(`Lights, Fans, Discord backend simulation running on port ${port}`);
});
