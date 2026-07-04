import React from 'react';
import { useDeviceStream } from '../hooks/useDeviceStream';
import { Fan, Lightbulb, AlertTriangle, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

export default function Dashboard() {
  const { devices, metrics, alerts } = useDeviceStream();

  // Reusable function to render a room schematic
  const renderRoom = (title, roomName, additionalClasses = "") => {
    const roomDevices = devices.filter(d => d.room === roomName);
    const roomWattage = metrics.roomPower[roomName] || 0;
    
    return (
      <div className={`relative flex flex-col border-2 border-slate-200 bg-slate-50 rounded-xl p-5 overflow-hidden shadow-inner ${additionalClasses}`}>
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}
        ></div>
        
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4 z-10 shrink-0">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-700 tracking-widest uppercase">
              {title}
            </h3>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3" />
              {roomWattage} W
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-200">
            {roomDevices.length} Devices
          </span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-start justify-start flex-1 z-10 content-start overflow-y-auto min-h-0 pr-1">
          {roomDevices.map(device => {
            const isOff = device.status === 'OFF';
            const isFan = device.type === 'fan';
            
            let iconClass = 'w-8 h-8 mb-3 stroke-[1.5] transition-all duration-500 ';
            if (isOff) {
              iconClass += 'text-slate-300 opacity-50';
            } else if (isFan) {
              iconClass += 'animate-spin text-blue-500';
            } else {
              iconClass += 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]';
            }

            return (
              <div 
                key={device.id} 
                className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[5.5rem] transition-all duration-300"
              >
                {isFan ? (
                  <Fan className={iconClass} />
                ) : (
                  <Lightbulb className={iconClass} />
                )}
                <span className={`text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${isOff ? 'text-slate-400' : 'text-slate-700'}`}>
                  {device.name}
                </span>
                <span className={`text-[10px] mt-1 font-semibold ${isOff ? 'text-slate-300' : (isFan ? 'text-blue-400' : 'text-yellow-500')}`}>
                  {device.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-100 flex font-sans overflow-hidden">
      {/* Sidebar (left) - locked to screen height and no internal scrolling on the entire aside */}
      <aside className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm z-20 h-full">
        <div className="flex items-center gap-3 mb-10 mt-2 shrink-0">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smart Office</h1>
        </div>
        
        <Card className="mb-6 border-slate-200 shadow-sm bg-slate-50/50 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-bold uppercase tracking-widest flex items-center justify-between">
              Live Power Consumption
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mt-2">
              <p className="text-5xl font-black text-emerald-600 tracking-tighter">{metrics.totalPower}</p>
              <span className="text-xl font-bold text-slate-400">W</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Updated in real-time</p>
          </CardContent>
        </Card>
        
        <Card className="mb-6 border-slate-200 shadow-sm bg-slate-50/50 shrink-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-bold uppercase tracking-widest">
              Active Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mt-2">
              <p className="text-4xl font-black text-blue-600 tracking-tighter">
                {devices.filter(d => d.status === 'ON').length}
              </p>
              <span className="text-xl font-bold text-slate-400">/ {devices.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts Card - this takes up the rest of the height and handles internal scrolling */}
        <Card className="border-slate-200 shadow-sm bg-white border-2 border-red-100 flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 border-b border-slate-100 shrink-0">
            <CardTitle className="text-sm text-slate-800 font-bold uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          {/* Scrollable container for alerts */}
          <CardContent className="pt-4 flex flex-col gap-3 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <p className="text-sm text-slate-400 font-medium">All systems operating normally.</p>
              </div>
            ) : (
              alerts.map((alertMsg, idx) => (
                <Alert variant="destructive" key={idx} className="bg-red-50/50 shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-bold tracking-wide">System Anomaly</AlertTitle>
                  <AlertDescription className="text-xs font-medium mt-1">
                    {alertMsg}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Main Content (right) */}
      <main className="flex-1 p-10 overflow-auto flex flex-col bg-slate-100 h-full">
        <header className="mb-10 shrink-0">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Floor Plan</h2>
          <p className="text-slate-500 font-medium mt-2">Live architectural schematic</p>
        </header>

        {/* Blueprint Container */}
        <div className="grid grid-cols-2 gap-6 flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 min-h-[850px]">
          {renderRoom("Drawing Room", "Drawing Room", "row-span-2")}
          {renderRoom("Work Room 1", "Work Room 1", "")}
          {renderRoom("Work Room 2", "Work Room 2", "")}
        </div>
      </main>
    </div>
  );
}
