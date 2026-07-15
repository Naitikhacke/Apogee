import React, { useEffect, useState } from 'react';
import { Search, Filter, ScanLine, Telescope, Compass, Crosshair, Clock } from 'lucide-react';
import Image from 'next/image';

export default function SkyMapScreen() {
  const [mapUrl, setMapUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: 0, lon: 0, loaded: false });
  const [selectedTarget, setSelectedTarget] = useState('Zenith');

  // Live Real-Time Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS Location & Map Initialization
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon, loaded: true });
          
          // Initialize observatory-grade live map
          setMapUrl(`https://virtualsky.lco.global/embed/index.html?longitude=${lon}&latitude=${lat}&projection=stereo&constellations=true&constellationlabels=true&meteorshowers=true&showplanets=true&live=true&az=0&keyboard=false&mouse=true&color=0B0F17&starcolor=ffffff&showdate=false&showposition=false`);
        },
        (error) => {
          console.warn('Location blocked, using default coordinates.');
          setMapUrl(`https://virtualsky.lco.global/embed/index.html?longitude=0&latitude=0&projection=stereo&constellations=true&constellationlabels=true&live=true&color=0B0F17`);
        }
      );
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white relative overflow-hidden">
      
      {/* Live Planetarium Backend */}
      <div className="absolute inset-0 z-0">
        {isLoading && (
          <div className="absolute inset-0 z-0 flex items-center justify-center flex-col gap-4 bg-[#0B0F17]">
            <div className="w-8 h-8 border-4 border-[#D9A441] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#A2A9B3] text-sm animate-pulse">Synchronizing Real-Time Astronomical Data...</p>
          </div>
        )}
        {mapUrl && (
          <iframe 
            src={mapUrl}
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 1s ease-in' }}
            className="absolute inset-0"
          ></iframe>
        )}
      </div>

      {/* Real-Time HUD Overlay (Pointer events none so map can be dragged) */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
        
        {/* Top HUD */}
        <div className="px-6 pt-14 md:pt-8 w-full max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Live Telemetry Bar */}
          <div className="flex justify-between items-start w-full">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-[#4ADE80]/30 bg-[#0B0F17]/60 backdrop-blur-md">
              <Clock size={16} className="text-[#4ADE80]" />
              <div className="flex flex-col">
                <span className="text-xs font-mono text-[#4ADE80]">LIVE / REAL-TIME</span>
                <span className="text-sm font-bold tracking-wider">{time.toLocaleTimeString('en-US', { hour12: false })}</span>
              </div>
            </div>

            {location.loaded && (
              <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-white/10 bg-[#0B0F17]/60 backdrop-blur-md text-right">
                <div className="flex flex-col">
                  <span className="text-xs text-[#A2A9B3]">GPS LINKED</span>
                  <span className="text-sm font-mono">{Math.abs(location.lat).toFixed(4)}° {location.lat >= 0 ? 'N' : 'S'}</span>
                </div>
                <Crosshair size={16} className="text-[#D9A441]" />
              </div>
            )}
          </div>

          {/* Search & Filters */}
          <div className="flex gap-3 pointer-events-auto max-w-md mt-2">
            <div className="flex-1 glass rounded-full flex items-center px-4 py-3 border border-white/10 hover:border-white/30 transition-colors bg-[#0B0F17]/70 backdrop-blur-md focus-within:border-[#D9A441]">
              <Search size={18} className="text-[#A2A9B3] mr-3" />
              <input 
                type="text" 
                placeholder="Search targets..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-[#A2A9B3]"
              />
            </div>
            <button className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 bg-[#0B0F17]/70 backdrop-blur-md">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Side Controls */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
          <button className="w-12 h-12 rounded-full glass flex flex-col items-center justify-center gap-0.5 border border-[#4ADE80]/30 bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 transition-colors group relative">
            <ScanLine size={18} className="text-[#4ADE80] group-hover:scale-110 transition-transform" />
            <span className="absolute left-14 text-xs font-semibold bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">AR View</span>
          </button>
          <button className="w-12 h-12 rounded-full glass flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 transition-colors group border border-white/10 bg-[#0B0F17]/70 backdrop-blur-md relative">
            <Compass size={18} className="text-white group-hover:scale-110 transition-transform" />
            <span className="absolute left-14 text-xs font-semibold bg-white/10 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Recenter</span>
          </button>
        </div>

        {/* Bottom Interactive Target Card */}
        <div className="px-6 pb-28 md:pb-8 w-full pointer-events-auto flex justify-center md:justify-start">
          <div className="glass-panel rounded-3xl p-5 w-full max-w-[400px] border border-white/10 bg-[#0B0F17]/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:border-white/30 transition-colors cursor-pointer">
            
            <div className="absolute top-0 right-0 p-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 shadow-lg border border-white/10">
                 <Image src="/images/andromeda.png" alt="Target" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-lg">Andromeda Galaxy</h4>
                </div>
                <p className="text-[#A2A9B3] text-sm mt-0.5">M31 • Spiral Galaxy</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-[#A2A9B3]">RA: 00h 42m</span>
                  <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-[#A2A9B3]">DEC: +41° 16'</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-4 py-2.5 rounded-xl bg-[#D9A441] text-black font-bold text-sm hover:bg-white transition glow-amber flex items-center justify-center gap-2">
              <Telescope size={16} />
              Align Telescope to Target
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
