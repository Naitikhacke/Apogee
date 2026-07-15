import React, { useEffect, useState } from 'react';
import { Search, Filter, ScanLine, Telescope, Compass, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function SkyMapScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load the d3-celestial scripts from CDN
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Important for order
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initMap = async () => {
      try {
        // Load dependencies in exact order
        await loadScript('https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/lib/d3.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/lib/d3.geo.projection.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/celestial.min.js');

        // Add the CSS
        if (!document.querySelector('link[href*="celestial.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/celestial.css';
          document.head.appendChild(link);
        }

        const Celestial = (window as any).Celestial;

        if (Celestial) {
          // Configure the professional dark mode map
          const config = {
            width: window.innerWidth,
            projection: "airy",
            transform: "equatorial",
            center: null,
            adaptable: true,
            interactive: true,
            form: false, // hide the form controls
            location: false, // disable their default location box
            controls: false, // hide default zoom controls
            container: "celestial-map",
            datapath: "https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/",
            stars: {
              show: true,
              limit: 6,
              colors: true,
              style: { fill: "#ffffff", opacity: 1 },
              designation: true,
              designationLimit: 2.5,
              designationStyle: { fill: "#dddddd", font: "10px 'Inter', sans-serif", align: "left", baseline: "bottom" },
              size: 4,
              exponent: -0.28
            },
            dsos: { show: true, limit: 6, names: true, style: { fill: "#cccccc", stroke: "#cccccc", strokeWidth: 1.5, opacity: 1 } },
            constellations: {
              show: true,
              names: true,
              lines: true,
              lineStyle: { stroke: "#cccccc", strokeWidth: 1, opacity: 0.4 },
              bounds: false,
            },
            mw: {
              show: true,
              style: { fill: "#ffffff", opacity: 0.1 } // Milky Way
            },
            lines: {
              graticule: { show: true, stroke: "#333333", width: 1, opacity: 0.6 },
              equatorial: { show: true, stroke: "#D9A441", width: 1.5, opacity: 0.7 },
            },
            background: { fill: "#0B0F17", stroke: "#000000", opacity: 1 }
          };

          Celestial.display(config);
          setMapLoaded(true);

          // Get exact GPS coordinates to rotate the map
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              Celestial.skyview({
                location: [position.coords.latitude, position.coords.longitude],
                date: new Date()
              });
            });
          }
        }
      } catch (err) {
        console.error('Failed to load Sky Map:', err);
      }
    };

    initMap();

    return () => {
      // Cleanup if needed (d3-celestial doesn't have a clean destroy method, so we just empty the container)
      const container = document.getElementById('celestial-map');
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white relative overflow-hidden">
      
      {/* The actual D3-Celestial Canvas Container */}
      <div 
        id="celestial-map" 
        className="absolute inset-0 z-0 cursor-move" 
        style={{ width: '100%', height: '100%', opacity: mapLoaded ? 1 : 0, transition: 'opacity 1s ease-in' }}
      ></div>

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-0 flex items-center justify-center flex-col gap-4 bg-[#0B0F17]">
          <div className="w-8 h-8 border-4 border-[#D9A441] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#A2A9B3] text-sm animate-pulse">Initializing Astronomical Data...</p>
        </div>
      )}

      {/* Top Bar */}
      <div className="relative z-10 px-6 pt-14 md:pt-8 pb-4 max-w-2xl mx-auto w-full pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <div className="flex-1 glass rounded-full flex items-center px-4 py-3 md:py-4 border border-white/10 hover:border-white/30 transition-colors bg-[#0B0F17]/50 backdrop-blur-md focus-within:border-white/50 focus-within:bg-[#0B0F17]/80">
            <Search size={18} className="text-[#A2A9B3] mr-3" />
            <input 
              type="text" 
              placeholder="Search stars, planets, objects..." 
              className="bg-transparent border-none outline-none text-sm md:text-base w-full text-white placeholder-[#A2A9B3]"
            />
          </div>
          <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 bg-[#0B0F17]/50 backdrop-blur-md">
            <Filter size={20} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2 pointer-events-auto">
          <button className="bg-[#D9A441] text-black px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap glow-amber hover:scale-105 transition-transform">Sky</button>
          <button className="glass px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/10 transition-colors bg-[#0B0F17]/50">Planets</button>
          <button className="glass px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/10 transition-colors bg-[#0B0F17]/50">Constellations</button>
          <button className="glass px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/10 transition-colors bg-[#0B0F17]/50">DSO</button>
        </div>
      </div>

      {/* Side Controls */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 pointer-events-auto">
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex flex-col items-center justify-center gap-0.5 border border-[#4ADE80]/30 bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 transition-colors group">
          <ScanLine size={18} className="text-[#4ADE80] md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] md:text-[10px] text-[#4ADE80] font-medium">AR View</span>
        </button>
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 transition-colors group border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md">
          <Telescope size={18} className="text-[#A2A9B3] md:w-6 md:h-6 group-hover:text-white transition-colors group-hover:scale-110" />
          <span className="text-[9px] md:text-[10px] text-[#A2A9B3] group-hover:text-white transition-colors">Telescope</span>
        </button>
        <button 
          onClick={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                const Celestial = (window as any).Celestial;
                if(Celestial) {
                  Celestial.skyview({ location: [position.coords.latitude, position.coords.longitude], date: new Date() });
                }
              });
            }
          }}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 transition-colors group border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md"
        >
          <Compass size={18} className="text-[#A2A9B3] md:w-6 md:h-6 group-hover:text-white transition-colors group-hover:scale-110" />
          <span className="text-[9px] md:text-[10px] text-[#A2A9B3] group-hover:text-white transition-colors">Locate</span>
        </button>
      </div>

      {/* Map controls (zoom) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10 pointer-events-auto">
        <button 
          onClick={() => (window as any).Celestial?.zoomBy(1.2)} 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xl md:text-2xl font-light hover:bg-white/10 transition-colors border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md hover:scale-105"
        >+</button>
        <button 
          onClick={() => (window as any).Celestial?.zoomBy(0.8)} 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xl md:text-2xl font-light hover:bg-white/10 transition-colors border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md hover:scale-105"
        >-</button>
      </div>

      {/* Bottom Card */}
      <div className="absolute bottom-28 md:bottom-8 left-6 right-6 md:right-auto md:w-[400px] md:left-6 z-10 pointer-events-auto">
        <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col gap-4 border border-white/10 bg-[#0B0F17]/60 backdrop-blur-xl shadow-2xl">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden relative shrink-0 shadow-lg">
               <Image src="/images/andromeda.png" alt="Andromeda" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg md:text-xl">Andromeda Galaxy</h4>
                <span className="text-[#4ADE80] text-sm md:text-base font-bold bg-[#4ADE80]/10 px-2 py-0.5 md:px-3 md:py-1 rounded-md">97%</span>
              </div>
              <p className="text-[#A2A9B3] text-sm md:text-base mt-1">M31 • Spiral Galaxy</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t border-white/10 pt-4 md:pt-5 mt-1">
            <div>
              <p className="text-xs md:text-sm text-[#A2A9B3] mb-1">Best window</p>
              <p className="text-sm md:text-base font-semibold">11:40 PM - 2:15 AM</p>
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm text-[#A2A9B3] mb-1">Visibility</p>
              <p className="text-sm md:text-base font-semibold flex items-center justify-end gap-2">
                <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                High
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
