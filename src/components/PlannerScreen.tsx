import React from 'react';
import { Calendar as CalendarIcon, Moon, CloudSun, Star, Map } from 'lucide-react';
import Image from 'next/image';

export default function PlannerScreen() {
  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white overflow-y-auto no-scrollbar pb-24 md:pb-8 relative">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-14 md:pt-8 pb-6 md:pb-10">
          <h2 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <CalendarIcon size={24} className="text-[#D9A441] md:w-8 md:h-8" />
            Photography Planner
          </h2>
          <button className="hidden md:flex px-6 py-2.5 rounded-full bg-[#D9A441] text-black font-semibold items-center gap-2 glow-amber hover:scale-105 transition-transform">
            <span>+ New Plan</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row px-6 gap-8 md:gap-10">
          <div className="flex-1 flex flex-col gap-8 md:gap-10">
            {/* Calendar Week/Month */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex justify-between items-end mb-6">
                <h3 className="font-semibold text-lg md:text-xl">June 2026</h3>
                <span className="text-[#A2A9B3] text-xs md:text-sm">Mon - Sun</span>
              </div>
              <div className="flex justify-between items-center">
                {[
                  { d: 'SUN', n: '8' },
                  { d: 'MON', n: '9' },
                  { d: 'TUE', n: '10' },
                  { d: 'WED', n: '11' },
                  { d: 'THU', n: '12', active: true },
                  { d: 'FRI', n: '13' },
                  { d: 'SAT', n: '14' },
                ].map((day, i) => (
                  <div key={i} className={`flex flex-col items-center justify-center w-11 h-14 md:w-16 md:h-20 rounded-full cursor-pointer transition-transform hover:scale-110 ${day.active ? 'bg-[#D9A441] text-black glow-amber' : 'text-[#A2A9B3] hover:bg-white/10'}`}>
                    <span className={`text-[10px] md:text-xs font-semibold mb-1 ${day.active ? 'text-black/70' : 'text-[#A2A9B3]'}`}>{day.d}</span>
                    <span className={`text-lg md:text-2xl font-bold ${day.active ? 'text-black' : 'text-white'}`}>{day.n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {/* Moon Phase */}
              <div className="glass-panel rounded-3xl p-5 md:p-6 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-colors border border-transparent">
                <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">Moon Phase</h4>
                <div className="flex gap-2 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-xl md:text-3xl font-bold">78%</span>
                    <span className="text-[10px] md:text-xs text-[#A2A9B3] mt-1">Waning<br/>Gibbous</span>
                  </div>
                  <div className="absolute right-[-20px] md:right-[-10px] top-0 w-16 h-16 md:w-20 md:h-20 group-hover:scale-110 transition-transform">
                     <Image src="/images/moon.png" alt="Moon" fill className="object-contain" />
                  </div>
                </div>
              </div>

              {/* Weather */}
              <div className="glass-panel rounded-3xl p-5 md:p-6 group cursor-pointer hover:border-white/20 transition-colors border border-transparent">
                <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">Weather</h4>
                <div className="flex items-center gap-3 md:gap-4">
                  <CloudSun size={28} className="text-white md:w-10 md:h-10" />
                  <div className="flex flex-col">
                    <span className="text-xl md:text-3xl font-bold">21°C</span>
                    <span className="text-[10px] md:text-xs text-[#A2A9B3] mt-1">Clear<br/>Wind 6 mph</span>
                  </div>
                </div>
              </div>
              
              {/* Bortle Class */}
              <div className="glass-panel rounded-3xl p-5 md:p-6 col-span-2 md:col-span-1 group cursor-pointer hover:border-white/20 transition-colors border border-transparent">
                <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-center md:text-left">Bortle Class</h4>
                <div className="flex flex-row md:flex-col items-center justify-center md:justify-start gap-4 md:gap-0">
                  <div className="flex items-center justify-center relative w-16 h-8 md:w-full md:h-12 md:mb-4">
                     <div className="w-16 md:w-24 h-8 md:h-12 border-t-[4px] md:border-t-[6px] border-l-[4px] md:border-l-[6px] border-r-[4px] md:border-r-[6px] border-[#4ADE80] rounded-t-full relative">
                        <div className="absolute bottom-[-10px] md:bottom-[-15px] left-1/2 -translate-x-1/2 text-xl md:text-3xl font-bold">2</div>
                     </div>
                  </div>
                  <div className="text-left md:text-center">
                    <span className="text-[10px] md:text-xs text-[#A2A9B3]">Very Dark<br/>Skies</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="flex-[0.8] xl:flex-[0.6] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-lg md:text-xl">Upcoming Events</h4>
              <button className="text-[#A2A9B3] text-xs md:text-sm hover:text-white transition">View all</button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border border-[#4ADE80]/30 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
                 <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-[#4ADE80]"></div>
                <div className="flex items-center gap-4 ml-2">
                  <div className="w-12 h-12 rounded-full bg-[#161D2B] flex items-center justify-center border border-white/10 text-[#D9A441] group-hover:scale-110 transition-transform">
                    <Star size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm md:text-base mb-1">Milky Way Core Peak</span>
                    <span className="text-xs text-[#A2A9B3]">Tonight • 11:30 PM - 2:30 AM</span>
                  </div>
                </div>
                <span className="text-[#4ADE80] text-xs md:text-sm font-semibold bg-[#4ADE80]/10 px-3 py-1 rounded-full">Excellent</span>
              </div>

              <div className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border border-[#D9A441]/30 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-[#D9A441]"></div>
                <div className="flex items-center gap-4 ml-2">
                  <div className="w-12 h-12 rounded-full bg-[#161D2B] flex items-center justify-center border border-white/10 text-[#D9A441] group-hover:scale-110 transition-transform">
                    <Map size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm md:text-base mb-1">ISS Flyover</span>
                    <span className="text-xs text-[#A2A9B3]">Tomorrow • 9:11 PM</span>
                  </div>
                </div>
                <span className="text-[#D9A441] text-xs md:text-sm font-semibold bg-[#D9A441]/10 px-3 py-1 rounded-full">Good</span>
              </div>

              <div className="glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border border-[#4ADE80]/30 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-[#4ADE80]"></div>
                <div className="flex items-center gap-4 ml-2">
                  <div className="w-12 h-12 rounded-full bg-[#161D2B] flex items-center justify-center border border-white/10 text-[#A855F7] group-hover:scale-110 transition-transform">
                    <Star size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm md:text-base mb-1">Perseid Meteor Shower</span>
                    <span className="text-xs text-[#A2A9B3]">Aug 12 - Aug 13</span>
                  </div>
                </div>
                <span className="text-[#4ADE80] text-xs md:text-sm font-semibold bg-[#4ADE80]/10 px-3 py-1 rounded-full">Great</span>
              </div>
              
              {/* Additional desktop item */}
              <div className="hidden md:flex glass-panel rounded-2xl p-4 md:p-5 items-center justify-between border border-white/10 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-white/30"></div>
                <div className="flex items-center gap-4 ml-2">
                  <div className="w-12 h-12 rounded-full bg-[#161D2B] flex items-center justify-center border border-white/10 text-white group-hover:scale-110 transition-transform">
                    <Moon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm md:text-base mb-1">New Moon Phase</span>
                    <span className="text-xs text-[#A2A9B3]">Next week • Deep sky ideal</span>
                  </div>
                </div>
                <span className="text-white text-xs md:text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
