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
          lastUpdated: Date.now()
        });
      }
    });
  }

  getAllDevices() {
    return this.devices;
  }

  getTotalWattage() {
    return this.devices
      .filter(device => device.status === 'ON')
      .reduce((total, device) => total + device.wattage, 0);
  }

  toggleRandomDevices() {
    const numToToggle = Math.random() < 0.5 ? 1 : 2;
    const toggledDevices = [];
    
    for (let i = 0; i < numToToggle; i++) {
      const randomIndex = Math.floor(Math.random() * this.devices.length);
      const device = this.devices[randomIndex];
      
      // Toggle status
      device.status = device.status === 'ON' ? 'OFF' : 'ON';
      device.lastUpdated = Date.now();
      
      toggledDevices.push(device);
    }
    
    return toggledDevices;
  }
}

module.exports = DeviceStore;
