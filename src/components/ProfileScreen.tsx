import React from 'react';
import { Moon, Telescope, Settings, Hexagon, Image as ImageIcon, Camera } from 'lucide-react';
import Image from 'next/image';

export default function ProfileScreen({ user }: { user?: { name: string, email: string, phone?: string } }) {
  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white overflow-y-auto no-scrollbar pb-24 md:pb-8 relative">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-14 md:pt-8 pb-6 md:pb-10">
          <h2 className="text-xl md:text-3xl font-bold">Profile</h2>
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
            <Settings size={20} className="md:hidden" />
            <Settings size={24} className="hidden md:block" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row px-6 gap-8 md:gap-16 mb-12">
          {/* User Info */}
          <div className="flex flex-col items-center md:items-start shrink-0">
            <div className="relative mb-4 md:mb-6">
              <div className="w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-2 md:border-4 border-[#D9A441] relative bg-[#101827] flex items-center justify-center">
                 {/* Empty state avatar */}
                 <UserAvatar name={user?.name || 'A'} />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <h3 className="text-2xl md:text-4xl font-bold">{user?.name || 'Astrophotographer'}</h3>
              <span className="bg-[#D9A441] text-black text-[10px] md:text-xs font-bold px-2 py-0.5 md:py-1 rounded-sm">PRO</span>
            </div>
            <p className="text-[#A2A9B3] text-sm md:text-base">{user?.email || 'No email provided'}</p>
            {user?.phone && <p className="text-[#A2A9B3] text-xs mt-1">{user.phone}</p>}
            
            <div className="flex gap-4 mt-6">
              <button className="hidden md:block px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium">
                Edit Profile
              </button>
              <button 
                onClick={async () => {
                  const { supabase } = await import('@/lib/supabase');
                  await supabase.auth.signOut();
                }}
                className="px-6 py-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div className="flex flex-col gap-8 md:gap-10">
            {/* Achievements - Locked empty state */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-semibold text-lg md:text-xl">Achievements</h4>
                <button className="text-[#A2A9B3] text-xs md:text-sm hover:text-white transition">View all</button>
              </div>
              <div className="flex justify-between opacity-30 grayscale">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center text-[#D9A441]">
                    <Hexagon size={80} className="hidden md:block absolute" strokeWidth={1} fill="rgba(217,164,65,0.1)" />
                    <Hexagon size={64} className="md:hidden absolute" strokeWidth={1} fill="rgba(217,164,65,0.1)" />
                    <Moon size={24} className="absolute md:w-8 md:h-8" />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium w-16 md:w-20 leading-tight">Moon Master (Locked)</span>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center text-[#A855F7]">
                    <Hexagon size={80} className="hidden md:block absolute" strokeWidth={1} fill="rgba(168,85,247,0.1)" />
                    <Hexagon size={64} className="md:hidden absolute" strokeWidth={1} fill="rgba(168,85,247,0.1)" />
                    <Telescope size={24} className="absolute md:w-8 md:h-8" />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium w-16 md:w-20 leading-tight">Galaxy Hunter (Locked)</span>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center text-[#D9A441]">
                    <Hexagon size={80} className="hidden md:block absolute" strokeWidth={1} fill="rgba(217,164,65,0.1)" />
                    <Hexagon size={64} className="md:hidden absolute" strokeWidth={1} fill="rgba(217,164,65,0.1)" />
                    <Settings size={24} className="absolute md:w-8 md:h-8" />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium w-16 md:w-20 leading-tight">Night Explorer (Locked)</span>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 relative flex items-center justify-center text-[#3B82F6]">
                    <Hexagon size={80} className="hidden md:block absolute" strokeWidth={1} fill="rgba(59,130,246,0.1)" />
                    <Hexagon size={64} className="md:hidden absolute" strokeWidth={1} fill="rgba(59,130,246,0.1)" />
                    <ImageIcon size={24} className="absolute md:w-8 md:h-8" />
                  </div>
                  <span className="text-[10px] md:text-xs text-center font-medium w-16 md:w-20 leading-tight">Deep Sky Seeker (Locked)</span>
                </div>
              </div>
            </div>
            
            {/* List items */}
            <div className="glass-panel rounded-3xl p-2 md:p-4 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A2A9B3]">
                    <Telescope size={20} />
                  </div>
                  <span className="font-medium md:text-lg">Equipment</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-[#A2A9B3] bg-white/5 px-2 py-1 rounded-md">0 items</span>
                  <span className="text-[#A2A9B3] font-bold">&gt;</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 rounded-2xl transition-colors mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A2A9B3]">
                    <Settings size={20} />
                  </div>
                  <span className="font-medium md:text-lg">Settings</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs md:text-sm text-[#A2A9B3]">App preferences</span>
                  <span className="text-[#A2A9B3] font-bold">&gt;</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:gap-10">
            {/* My Observations */}
            <div className="glass-panel p-6 rounded-3xl h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-semibold text-lg md:text-xl">My Observations</h4>
                <button className="text-[#A2A9B3] text-xs md:text-sm hover:text-white transition">View all</button>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center min-h-[250px] opacity-60">
                <Camera size={48} className="mb-4 text-[#A2A9B3]" strokeWidth={1} />
                <p className="text-lg font-medium text-white mb-2">No observations yet</p>
                <p className="text-[#A2A9B3] text-sm text-center mb-6">Your celestial captures will appear here once you start shooting.</p>
                
                <button className="px-6 py-3 bg-white/10 rounded-full font-medium hover:bg-white/20 transition-colors">
                  Add First Observation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper for empty avatar state
function UserAvatar({ name }: { name: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <span className="text-4xl md:text-6xl font-bold text-[#A2A9B3]">{initial}</span>
  );
}
