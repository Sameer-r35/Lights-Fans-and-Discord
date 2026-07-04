import { useState, useEffect } from 'react';

export function useDeviceStream() {
  const [devices, setDevices] = useState([]);
  const [metrics, setMetrics] = useState({ totalPower: 0, roomPower: {} });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Connect to the SSE endpoint we built
    const eventSource = new EventSource('http://localhost:5000/api/stream');

    eventSource.onmessage = (event) => {
      // EventSource handles the initial raw connection but we need to check data
      if (event.data) {
        try {
          const data = JSON.parse(event.data);
          setDevices(data.devices || []);
          setMetrics(data.metrics || { totalPower: 0, roomPower: {} });
          setAlerts(data.alerts || []);
        } catch (err) {
          console.error("Error parsing SSE data", err);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      // EventSource automatically attempts to reconnect
    };

    // Cleanup when component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return { devices, metrics, alerts };
}
