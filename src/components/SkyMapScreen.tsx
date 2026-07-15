import React, { useEffect, useState } from 'react';
import { Search, Filter, ScanLine, Telescope, Compass } from 'lucide-react';
import Image from 'next/image';

export default function SkyMapScreen() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [clickedObject, setClickedObject] = useState<{name: string, type: string, image: string} | null>(null);
  const isInitializing = React.useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    // Dynamically load Aladin Lite V3 (Real Photographic Deep Sky Survey)
    const loadAladin = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="aladin.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.css';
        document.head.appendChild(link);
      }

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js';
      script.charset = 'utf-8';
      script.onload = () => {
        // Initialize Aladin
        const A = (window as any).A;
        if (A) {
          A.init.then(() => {
            const aladin = A.aladin('#aladin-lite-div', {
              survey: 'P/DSS2/color', // True color real photograph survey!
              fov: 60,
              target: '0 0',
              showReticle: false,
              showZoomControl: false,
              showFullscreenControl: false,
              showLayersControl: false,
              showGotoControl: false,
              showShareControl: false,
              showCatalog: true,
              showFrame: false,
              showSimbadPointerControl: true
            });

            // Set to user's location if available (convert to RA/Dec roughly, or just point to a cool galaxy)
            aladin.gotoObject('M 31'); // Default to Andromeda
            setMapLoaded(true);

            // Listen for clicks on objects
            aladin.on('objectClicked', (object: any) => {
              if (object) {
                setClickedObject({
                  name: object.data?.main_id || 'Unknown Object',
                  type: object.data?.otype_txt || 'Star/Galaxy',
                  image: '/images/andromeda.png' // In a real app we'd fetch the exact thumbnail, using generic for now
                });
              } else {
                setClickedObject(null);
              }
            });

            // Save instance to window for buttons to use
            (window as any).aladinInstance = aladin;
          });
        }
      };
      document.body.appendChild(script);
    };

    loadAladin();

    return () => {
      const container = document.getElementById('aladin-lite-div');
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white relative overflow-hidden">
      
      {/* The actual Aladin Lite Photographic Canvas */}
      <div 
        id="aladin-lite-div" 
        className="absolute inset-0 z-0 cursor-move" 
        style={{ width: '100%', height: '100%', opacity: mapLoaded ? 1 : 0, transition: 'opacity 1s ease-in' }}
      ></div>

      {!mapLoaded && (
        <div className="absolute inset-0 z-0 flex items-center justify-center flex-col gap-4 bg-[#0B0F17]">
          <div className="w-8 h-8 border-4 border-[#D9A441] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#A2A9B3] text-sm animate-pulse">Connecting to Telescope Imagery...</p>
        </div>
      )}

      {/* Top Bar - pointer-events-none so you can drag the map underneath */}
      <div className="relative z-10 px-6 pt-14 md:pt-8 pb-4 max-w-2xl mx-auto w-full pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          <div className="flex-1 glass rounded-full flex items-center px-4 py-3 md:py-4 border border-white/10 hover:border-white/30 transition-colors bg-[#0B0F17]/50 backdrop-blur-md focus-within:border-white/50 focus-within:bg-[#0B0F17]/80">
            <Search size={18} className="text-[#A2A9B3] mr-3" />
            <input 
              type="text" 
              placeholder="Search stars, planets, objects..." 
              className="bg-transparent border-none outline-none text-sm md:text-base w-full text-white placeholder-[#A2A9B3]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.currentTarget.value;
                  const A = (window as any).aladinInstance;
                  if (A && val) A.gotoObject(val);
                }
              }}
            />
          </div>
          <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 bg-[#0B0F17]/50 backdrop-blur-md">
            <Filter size={20} />
          </button>
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
      </div>

      {/* Map controls (zoom) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10 pointer-events-auto">
        <button 
          onClick={() => {
            const A = (window as any).aladinInstance;
            if (A) A.setZoom(A.getZoom() * 0.8);
          }} 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xl md:text-2xl font-light hover:bg-white/10 transition-colors border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md hover:scale-105"
        >+</button>
        <button 
          onClick={() => {
            const A = (window as any).aladinInstance;
            if (A) A.setZoom(A.getZoom() * 1.2);
          }} 
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xl md:text-2xl font-light hover:bg-white/10 transition-colors border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md hover:scale-105"
        >-</button>
      </div>

      {/* Bottom Card (Shows either default Andromeda or Clicked Object) */}
      <div className="absolute bottom-28 md:bottom-8 left-6 right-6 md:right-auto md:w-[400px] md:left-6 z-10 pointer-events-auto">
        <div className="glass-panel rounded-3xl p-5 md:p-6 flex flex-col gap-4 border border-white/10 bg-[#0B0F17]/60 backdrop-blur-xl shadow-2xl">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden relative shrink-0 shadow-lg">
               <Image src={clickedObject?.image || "/images/andromeda.png"} alt={clickedObject?.name || "Andromeda"} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg md:text-xl truncate">{clickedObject?.name || 'Andromeda Galaxy'}</h4>
                <span className="text-[#4ADE80] text-sm md:text-base font-bold bg-[#4ADE80]/10 px-2 py-0.5 md:px-3 md:py-1 rounded-md">97%</span>
              </div>
              <p className="text-[#A2A9B3] text-sm md:text-base mt-1 truncate">{clickedObject?.type || 'M31 • Spiral Galaxy'}</p>
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
