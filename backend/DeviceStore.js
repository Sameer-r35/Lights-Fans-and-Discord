class DeviceStore {
  constructor() {
    this.devices = [];
    this.initializeDevices();
  }

  initializeDevices() {
    const rooms = ['Drawing Room', 'Work Room 1', 'Work Room 2'];
    let idCounter = 1;

    rooms.forEach(room => {
      // 2 Fans (60W)
      for (let i = 1; i <= 2; i++) {
        this.devices.push({
          id: idCounter++,
          name: `Fan ${i}`,
          type: 'fan',
          room: room,
          status: 'OFF',
          wattage: 60,
          turnedOnAt: null,
          lastUpdated: Date.now()
        });
      }
      // 3 Lights (15W)
      for (let i = 1; i <= 3; i++) {
        this.devices.push({
          id: idCounter++,
          name: `Light ${i}`,
          type: 'light',
          room: room,
          status: 'OFF',
          wattage: 15,
          turnedOnAt: null,
          lastUpdated: Date.now()
        });
      }
    });
  }

  getAllDevices() {
    return this.devices;
  }

  getMetrics() {
    let totalPower = 0;
    const roomPower = {
      "Drawing Room": 0,
      "Work Room 1": 0,
      "Work Room 2": 0
    };

    this.devices.forEach(device => {
      if (device.status === 'ON') {
        totalPower += device.wattage;
        if (roomPower[device.room] !== undefined) {
          roomPower[device.room] += device.wattage;
        }
      }
    });

    return { totalPower, roomPower };
  }

  toggleRandomDevices() {
    const numToToggle = Math.random() < 0.5 ? 1 : 2;
    const toggledDevices = [];
    
    for (let i = 0; i < numToToggle; i++) {
      const randomIndex = Math.floor(Math.random() * this.devices.length);
      const device = this.devices[randomIndex];
      
      // Toggle status
      device.status = device.status === 'ON' ? 'OFF' : 'ON';
      device.turnedOnAt = device.status === 'ON' ? Date.now() : null;
      device.lastUpdated = Date.now();
      
      toggledDevices.push(device);
    }
    
    return toggledDevices;
  }
}

module.exports = DeviceStore;
