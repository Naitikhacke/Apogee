import React, { useEffect, useState } from 'react';
import { Search, Filter, ScanLine, Telescope, Compass, Crosshair, Clock, Star, X } from 'lucide-react';
import Image from 'next/image';

export default function SkyMapScreen() {
  const [mapUrl, setMapUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState({ lat: 0, lon: 0, loaded: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTargetData, setActiveTargetData] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('Zenith');

  // Telescope Connection States
  const [isTelescopeConnected, setIsTelescopeConnected] = useState(false);
  const [isConnectingTelescope, setIsConnectingTelescope] = useState(false);
  const [selectedMountType, setSelectedMountType] = useState('ASCOM Universal Mount');
  const [showTelescopeModal, setShowTelescopeModal] = useState(false);
  
  // Slewing / Alignment states
  const [isAligning, setIsAligning] = useState(false);
  const [slewProgress, setSlewProgress] = useState(0);
  const [telemetryRa, setTelemetryRa] = useState(0);
  const [telemetryDec, setTelemetryDec] = useState(90);
  const [slewLogs, setSlewLogs] = useState<string[]>([]);

  // Live Real-Time Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // GPS Location & Map Initialization
  useEffect(() => {
    const handleLocation = (lat: number, lon: number) => {
      setLocation({ lat, lon, loaded: true });
      setMapUrl(`https://virtualsky.lco.global/embed/index.html?longitude=${lon}&latitude=${lat}&projection=stereo&constellations=true&constellationlabels=true&meteorshowers=true&showplanets=true&live=true&az=0&keyboard=false&mouse=true&color=0B0F17&starcolor=ffffff&showdate=false&showposition=false`);
    };

    const handleFallback = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          handleLocation(ipData.latitude, ipData.longitude);
          return;
        }
      } catch (ipError) {
        console.error("IP fallback also failed", ipError);
      }
      console.warn('Location blocked or failed, using default coordinates.');
      setMapUrl(`https://virtualsky.lco.global/embed/index.html?longitude=0&latitude=0&projection=stereo&constellations=true&constellationlabels=true&live=true&color=0B0F17`);
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Location blocked, trying IP fallback.');
          handleFallback();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      handleFallback();
    }
  }, []);

  // Load default target Andromeda
  useEffect(() => {
    if (location.loaded) {
      fetch(`/api/astronomy?latitude=${location.lat}&longitude=${location.lon}&target=andromeda`)
        .then(res => res.json())
        .then(data => {
          if (data && data.target) {
            setActiveTargetData(data.target);
          }
        });
    }
  }, [location.loaded, location.lat, location.lon]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !location.loaded) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/astronomy?latitude=${location.lat}&longitude=${location.lon}&target=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.target) {
          setActiveTargetData(data.target);
          
          // Update iframe to center on searched target using RA & Dec degrees (and highlighting the object)
          const targetObj = data.target.name;
          const targetRa = data.target.ra;
          const targetDec = data.target.dec;
          setMapUrl(`https://virtualsky.lco.global/embed/index.html?longitude=${location.lon}&latitude=${location.lat}&projection=stereo&constellations=true&constellationlabels=true&meteorshowers=true&showplanets=true&live=true&keyboard=false&mouse=true&color=0B0F17&starcolor=ffffff&showdate=false&showposition=false&object=${encodeURIComponent(targetObj)}&ra=${targetRa}&dec=${targetDec}`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnectTelescope = () => {
    setIsConnectingTelescope(true);
    setTimeout(() => {
      setIsConnectingTelescope(false);
      setIsTelescopeConnected(true);
      setTelemetryRa(120.45);
      setTelemetryDec(45.22);
    }, 2000);
  };

  const handleDisconnectTelescope = () => {
    setIsTelescopeConnected(false);
    setTelemetryRa(0);
    setTelemetryDec(90);
  };

  const handleAlignTelescope = () => {
    if (!isTelescopeConnected) {
      setShowTelescopeModal(true);
      return;
    }
    
    if (!activeTargetData) return;
    
    setIsAligning(true);
    setSlewProgress(0);
    setSlewLogs([
      '[COMMAND] Initiating GOTO slewing sequence...', 
      `[TARGET] ${activeTargetData.name} (RA: ${activeTargetData.ra.toFixed(2)}°, DEC: ${activeTargetData.dec.toFixed(2)}°)`
    ]);
    
    const targetRa = activeTargetData.ra;
    const targetDec = activeTargetData.dec;
    const duration = 3000;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const startRa = telemetryRa;
    const startDec = telemetryDec;
    
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(100, Math.round((currentStep / steps) * 100));
      const factor = currentStep / steps;
      
      const currentRa = startRa + (targetRa - startRa) * factor;
      const currentDec = startDec + (targetDec - startDec) * factor;
      
      setTelemetryRa(currentRa);
      setTelemetryDec(currentDec);
      setSlewProgress(progress);
      
      if (currentStep === 5) {
        setSlewLogs(prev => [...prev, '[SYSTEM] Releasing clutches and activating motor encoders...']);
      } else if (currentStep === 15) {
        setSlewLogs(prev => [...prev, `[MOTOR] Slew speed maximum (RA: +3.5°/s, DEC: ${currentDec > startDec ? '+' : '-'}2.8°/s)...`]);
      } else if (currentStep === 25) {
        setSlewLogs(prev => [...prev, '[SYSTEM] Decelerating motors, approaching target coordinates...']);
      }
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setTelemetryRa(targetRa);
        setTelemetryDec(targetDec);
        setIsAligning(false);
        setSlewLogs(prev => [...prev, `[SUCCESS] Target acquired! Alignment completed. Locked on ${activeTargetData.name}.`]);
        
        // Ensure map is centered
        setMapUrl(`https://virtualsky.lco.global/embed/index.html?longitude=${location.lon}&latitude=${location.lat}&projection=stereo&constellations=true&constellationlabels=true&meteorshowers=true&showplanets=true&live=true&keyboard=false&mouse=true&color=0B0F17&starcolor=ffffff&showdate=false&showposition=false&object=${encodeURIComponent(activeTargetData.name)}&ra=${targetRa}&dec=${targetDec}`);
      }
    }, stepTime);
  };

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
          <form onSubmit={handleSearch} className="flex gap-3 pointer-events-auto max-w-md mt-2 w-full">
            <div className="flex-1 glass rounded-full flex items-center px-4 py-3 border border-white/10 hover:border-white/30 transition-colors bg-[#0B0F17]/70 backdrop-blur-md focus-within:border-[#D9A441]">
              <Search size={18} className="text-[#A2A9B3] mr-3" />
              <input 
                type="text" 
                placeholder="Search planets/DSOs (e.g. Orion, Jupiter)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-[#A2A9B3]"
              />
            </div>
            <button type="submit" className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 bg-[#0B0F17]/70 backdrop-blur-md shrink-0">
              {isSearching ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Search size={20} />}
            </button>
          </form>
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
          <button 
            onClick={() => setShowTelescopeModal(true)}
            className={`w-12 h-12 rounded-full glass flex flex-col items-center justify-center gap-0.5 transition-colors group relative border ${isTelescopeConnected ? 'border-[#D9A441]/40 bg-[#D9A441]/10 hover:bg-[#D9A441]/20' : 'border-white/10 bg-[#0B0F17]/70 hover:bg-white/10'}`}
          >
            <Telescope size={18} className={isTelescopeConnected ? 'text-[#D9A441] animate-pulse' : 'text-white'} />
            <span className={`absolute w-2 h-2 rounded-full top-0.5 right-0.5 border border-black ${isTelescopeConnected ? 'bg-[#4ADE80]' : 'bg-red-500'}`}></span>
            <span className="absolute left-14 text-xs font-semibold bg-white/10 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Telescope</span>
          </button>
        </div>

        {/* Bottom Interactive Target Card */}
        {activeTargetData && (
          <div className="px-6 pb-28 md:pb-8 w-full pointer-events-auto flex justify-center md:justify-start">
            <div className="glass-panel rounded-3xl p-5 w-full max-w-[400px] border border-white/10 bg-[#0B0F17]/85 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:border-white/30 transition-colors cursor-pointer">
              
              <div className="absolute top-0 right-0 p-3">
                <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 shadow-lg border border-white/10 bg-[#161D2B] flex items-center justify-center">
                  <Star size={24} className="text-[#D9A441]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-lg">{activeTargetData.name}</h4>
                  </div>
                  <p className="text-[#A2A9B3] text-xs mt-0.5">{activeTargetData.type} • {activeTargetData.equipment}</p>
                  <p className="text-[#4ADE80] text-xs font-semibold mt-1">Best Window: {activeTargetData.bestWindow}</p>
                </div>
              </div>
              
              {activeTargetData.recommendedLocations && activeTargetData.recommendedLocations.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-3">
                  <h5 className="text-[10px] font-bold text-[#D9A441] mb-2 uppercase tracking-widest">Nearby Observatories (OSM)</h5>
                  <div className="flex flex-col gap-2">
                    {activeTargetData.recommendedLocations.map((spot: any) => (
                      <div key={spot.id} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors px-3 py-2 rounded-xl text-[11px]">
                        <div>
                          <p className="font-semibold text-white/95">{spot.name}</p>
                          <p className="text-[9px] text-[#A2A9B3]">{spot.region}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#4ADE80]">{spot.bortle !== 'N/A' ? `Bortle ${spot.bortle}` : 'Observatory'}</p>
                          <p className="text-[9px] text-[#A2A9B3]">{spot.distance} km away</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleAlignTelescope}
                disabled={isAligning}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#D9A441] text-black font-bold text-sm hover:bg-white transition glow-amber flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Telescope size={16} />
                {isAligning ? 'Slewing...' : 'Align Telescope to Target'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Telescope Control Center Modal */}
      {showTelescopeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="glass-panel w-full max-w-md border border-white/10 bg-[#0B0F17]/90 rounded-3xl p-6 shadow-2xl relative animate-in fade-in-50 zoom-in-95 duration-200">
            <button 
              onClick={() => setShowTelescopeModal(false)}
              className="absolute top-4 right-4 text-[#A2A9B3] hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Telescope size={24} className="text-[#D9A441]" />
              <div>
                <h3 className="font-bold text-lg text-white">Telescope Control Center</h3>
                <p className="text-[10px] text-[#A2A9B3] uppercase tracking-wider font-semibold">GOTO Mount Connection Manager</p>
              </div>
            </div>

            {/* Connection Status Card */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="text-xs text-[#A2A9B3]">Current Status</p>
                <p className={`text-sm font-bold ${isTelescopeConnected ? 'text-[#4ADE80]' : 'text-red-400'} flex items-center gap-1.5 mt-0.5`}>
                  <span className={`w-2 h-2 rounded-full ${isTelescopeConnected ? 'bg-[#4ADE80] animate-pulse' : 'bg-red-500'}`}></span>
                  {isTelescopeConnected ? 'Connected & Tracking' : 'Offline / Disconnected'}
                </p>
              </div>
              {isTelescopeConnected && (
                <div className="text-right">
                  <p className="text-[10px] text-[#A2A9B3] font-mono">TELEMETRY</p>
                  <p className="text-xs font-mono text-[#D9A441]">RA: {telemetryRa.toFixed(2)}°</p>
                  <p className="text-xs font-mono text-[#D9A441]">DEC: {telemetryDec.toFixed(2)}°</p>
                </div>
              )}
            </div>

            {!isTelescopeConnected ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-[#A2A9B3] font-semibold uppercase tracking-wider block mb-2">Select Mount Driver</label>
                  <select 
                    value={selectedMountType}
                    onChange={(e) => setSelectedMountType(e.target.value)}
                    className="w-full bg-[#101827] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D9A441] cursor-pointer"
                  >
                    <option value="ASCOM Universal Mount">ASCOM Universal Mount Driver</option>
                    <option value="Celestron NexStar Mount">Celestron NexStar Hand Controller</option>
                    <option value="Meadow LX200 GOTO">Meadow LX200 Protocol Link</option>
                    <option value="Stellarium GoTo Emulation">Stellarium Direct IP Emulation</option>
                  </select>
                </div>

                <button
                  onClick={handleConnectTelescope}
                  disabled={isConnectingTelescope}
                  className="w-full mt-2 py-3 rounded-xl bg-[#D9A441] text-black font-bold hover:bg-white transition flex items-center justify-center gap-2 glow-amber disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isConnectingTelescope ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      Linking Hardware Mount...
                    </>
                  ) : (
                    <>
                      <Telescope size={18} />
                      Establish Connection
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-[#101827] border border-white/5 rounded-2xl p-4 text-xs flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-[#A2A9B3]">Active Driver:</span>
                    <span className="font-semibold text-white">{selectedMountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A2A9B3]">Baud Rate:</span>
                    <span className="font-mono text-white">9600 bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A2A9B3]">Hardware Port:</span>
                    <span className="font-mono text-white">COM4 (USB Serial)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A2A9B3]">Coord Sync:</span>
                    <span className="text-[#4ADE80] font-semibold">GPS Matched</span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnectTelescope}
                  className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold hover:bg-red-500/20 transition"
                >
                  Disconnect Telescope
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Holographic Slewing Overlay */}
      {isAligning && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-[110] p-6">
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            {/* Spinning reticle */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 border border-dashed border-[#D9A441]/40 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-3 border-2 border-double border-[#D9A441]/60 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
              <div className="absolute inset-8 border border-t-[#4ADE80] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute w-full h-[1px] bg-[#D9A441]/20"></div>
              <div className="absolute h-full w-[1px] bg-[#D9A441]/20"></div>
              <Telescope size={36} className="text-[#D9A441] animate-[pulse_1.5s_infinite]" />
            </div>

            <div className="text-center flex flex-col gap-1.5">
              <h3 className="font-bold text-xl tracking-widest text-[#D9A441] animate-pulse">SLEWING TELESCOPE</h3>
              <p className="text-xs text-[#A2A9B3] uppercase tracking-wider">Aligning GOTO mount axes...</p>
            </div>

            {/* Coordinates / Telemetry progress */}
            <div className="w-full bg-[#101827]/80 border border-white/10 rounded-2xl p-4 font-mono text-xs flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-[#A2A9B3]">TARGET OBJECT:</span>
                <span className="font-semibold text-white">{activeTargetData?.name}</span>
              </div>
              <div className="flex justify-between text-[#D9A441]">
                <span>TELESCOPE RA:</span>
                <span className="font-bold">{telemetryRa.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between text-[#D9A441]">
                <span>TELESCOPE DEC:</span>
                <span className="font-bold">{telemetryDec.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between text-[#4ADE80]">
                <span>SLEW RATE:</span>
                <span className="font-semibold">3.8° / sec</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[#A2A9B3] text-[10px]">PROGRESS:</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden animate-pulse">
                  <div className="h-full bg-[#D9A441]" style={{ width: `${slewProgress}%` }}></div>
                </div>
                <span className="text-[#D9A441] text-[10px] font-bold">{slewProgress}%</span>
              </div>
            </div>

            {/* Slewing Logs console */}
            <div className="w-full bg-[#05070B] border border-white/5 rounded-2xl p-4 font-mono text-[10px] text-[#A2A9B3] h-28 overflow-y-auto no-scrollbar flex flex-col gap-1">
              {slewLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('[SUCCESS]') ? 'text-[#4ADE80]' : log.startsWith('[COMMAND]') || log.startsWith('[TARGET]') ? 'text-[#D9A441]' : 'text-[#A2A9B3]'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
