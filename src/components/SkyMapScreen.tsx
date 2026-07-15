import React from 'react';
import { Search, Filter, ScanLine, Telescope, Compass } from 'lucide-react';
import Image from 'next/image';

export default function SkyMapScreen() {
  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white relative overflow-hidden">
      {/* Background Star Map (simulated with CSS for now, since we have to mimic it) */}
      <div className="absolute inset-0 z-0 opacity-80" style={{
        background: 'radial-gradient(circle at 50% 50%, #1a233a 0%, #0B0F17 100%)',
      }}>
        {/* Constellation lines and dots would go here, we'll draw a few for Andromeda & Orion */}
        <div className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_2px_rgba(255,255,255,0.8)]"></div>
        <div className="absolute top-[28%] left-[25%] text-xs text-[#A2A9B3]">Andromeda</div>
        
        <div className="absolute top-[50%] left-[60%] w-2 h-2 bg-[#D9A441] rounded-full shadow-[0_0_12px_3px_rgba(217,164,65,0.8)]"></div>
        <div className="absolute top-[53%] left-[58%] text-xs text-[#A2A9B3]">Jupiter</div>
        
        <div className="absolute top-[20%] left-[50%] w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="absolute top-[18%] left-[53%] text-xs text-[#A2A9B3]">Orion</div>
        
        <div className="absolute top-[45%] left-[75%] w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-[47%] left-[78%] text-xs text-[#A2A9B3]">Pleiades</div>
        
        <div className="absolute top-[65%] left-[30%] w-2 h-2 bg-[#A855F7] rounded-full shadow-[0_0_15px_4px_rgba(168,85,247,0.6)]"></div>
        <div className="absolute top-[67%] left-[25%] text-xs text-[#A2A9B3]">Milky Way</div>
        
        <div className="absolute top-[75%] left-[65%] w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="absolute top-[72%] left-[65%] text-xs text-[#A2A9B3]">Vega</div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 px-6 pt-14 md:pt-8 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex gap-3">
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
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
          <button className="bg-[#D9A441] text-black px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap glow-amber hover:scale-105 transition-transform">Sky</button>
          <button className="glass px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/10 transition-colors">Planets</button>
          <button className="glass px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/10 transition-colors">Constellations</button>
          <button className="glass px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-white/10 transition-colors">DSO</button>
        </div>
      </div>

      {/* Side Controls */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex flex-col items-center justify-center gap-0.5 border border-[#4ADE80]/30 bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 transition-colors group">
          <ScanLine size={18} className="text-[#4ADE80] md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] md:text-[10px] text-[#4ADE80] font-medium">AR View</span>
        </button>
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 transition-colors group border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md">
          <Telescope size={18} className="text-[#A2A9B3] md:w-6 md:h-6 group-hover:text-white transition-colors group-hover:scale-110" />
          <span className="text-[9px] md:text-[10px] text-[#A2A9B3] group-hover:text-white transition-colors">Telescope</span>
        </button>
        <button className="w-12 h-12 md:w-14 md:h-14 rounded-full glass flex flex-col items-center justify-center gap-0.5 hover:bg-white/10 transition-colors group border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md">
          <Compass size={18} className="text-[#A2A9B3] md:w-6 md:h-6 group-hover:text-white transition-colors group-hover:scale-110" />
          <span className="text-[9px] md:text-[10px] text-[#A2A9B3] group-hover:text-white transition-colors">Compass</span>
        </button>
      </div>

      {/* Map controls (zoom) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xl md:text-2xl font-light hover:bg-white/10 transition-colors border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md hover:scale-105">+</button>
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xl md:text-2xl font-light hover:bg-white/10 transition-colors border border-white/5 bg-[#0B0F17]/50 backdrop-blur-md hover:scale-105">-</button>
      </div>

      {/* Bottom Card */}
      <div className="absolute bottom-28 md:bottom-8 left-6 right-6 md:right-auto md:w-[400px] md:left-6 z-10">
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
