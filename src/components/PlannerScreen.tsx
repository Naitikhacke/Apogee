import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Moon, CloudSun, Star, Map, Plus, X } from 'lucide-react';
import Image from 'next/image';

interface Plan {
  id: string;
  title: string;
  date: string; // ISO date string
  time: string;
  type: string;
}

export default function PlannerScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  // New Plan Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('22:00');
  const [newType, setNewType] = useState('Deep Sky');

  useEffect(() => {
    // Generate current week starting from Sunday
    const getWeek = () => {
      const days = [];
      const current = new Date();
      current.setDate(current.getDate() - current.getDay()); // Sunday
      for (let i = 0; i < 7; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      return days;
    };
    setWeekDays(getWeek());

    // Load from local storage
    const saved = localStorage.getItem('apoggee_plans');
    if (saved) {
      try {
        setPlans(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse plans');
      }
    } else {
      // Default dummy data if empty
      setPlans([
        { id: '1', title: 'Milky Way Core Peak', date: new Date().toISOString().split('T')[0], time: '23:30', type: 'Deep Sky' },
        { id: '2', title: 'Perseid Meteor Shower', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], time: '01:00', type: 'Event' }
      ]);
    }
  }, []);

  const handleSavePlan = () => {
    if (!newTitle.trim()) return;
    const newPlan: Plan = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      time: newTime,
      type: newType
    };
    const updated = [...plans, newPlan].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setPlans(updated);
    localStorage.setItem('apoggee_plans', JSON.stringify(updated));
    setIsModalOpen(false);
    setNewTitle('');
  };

  const getDayName = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const getMonthName = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white overflow-y-auto no-scrollbar pb-24 md:pb-8 relative">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-14 md:pt-8 pb-6 md:pb-10">
          <h2 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <CalendarIcon size={24} className="text-[#D9A441] md:w-8 md:h-8" />
            Photography Planner
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-[#D9A441] text-black font-semibold items-center gap-2 glow-amber hover:scale-105 transition-transform"
          >
            <Plus size={18} />
            <span className="hidden md:inline">New Plan</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row px-6 gap-8 md:gap-10">
          <div className="flex-1 flex flex-col gap-8 md:gap-10">
            {/* Calendar Week/Month */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex justify-between items-end mb-6">
                <h3 className="font-semibold text-lg md:text-xl">{getMonthName(selectedDate)}</h3>
                <span className="text-[#A2A9B3] text-xs md:text-sm">Sun - Sat</span>
              </div>
              <div className="flex justify-between items-center">
                {weekDays.map((day, i) => {
                  const active = isSameDay(day, selectedDate);
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDate(day)}
                      className={`flex flex-col items-center justify-center w-11 h-14 md:w-16 md:h-20 rounded-full cursor-pointer transition-transform hover:scale-110 ${active ? 'bg-[#D9A441] text-black glow-amber' : 'text-[#A2A9B3] hover:bg-white/10'}`}
                    >
                      <span className={`text-[10px] md:text-xs font-semibold mb-1 ${active ? 'text-black/70' : 'text-[#A2A9B3]'}`}>{getDayName(day)}</span>
                      <span className={`text-lg md:text-2xl font-bold ${active ? 'text-black' : 'text-white'}`}>{day.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {/* Moon Phase */}
              <div className="glass-panel rounded-3xl p-5 md:p-6 relative overflow-hidden group cursor-pointer hover:border-white/20 transition-colors border border-transparent">
                <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">Moon Phase</h4>
                <div className="flex gap-2 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-xl md:text-3xl font-bold">Realtime</span>
                    <span className="text-[10px] md:text-xs text-[#A2A9B3] mt-1">Updates nightly</span>
                  </div>
                  <div className="absolute right-[-20px] md:right-[-10px] top-0 w-16 h-16 md:w-20 md:h-20 group-hover:scale-110 transition-transform">
                     <Image src="/images/moon.png" alt="Moon" fill className="object-contain" />
                  </div>
                </div>
              </div>

              {/* Weather */}
              <div className="glass-panel rounded-3xl p-5 md:p-6 group cursor-pointer hover:border-white/20 transition-colors border border-transparent">
                <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4">Condition</h4>
                <div className="flex items-center gap-3 md:gap-4">
                  <CloudSun size={28} className="text-white md:w-10 md:h-10" />
                  <div className="flex flex-col">
                    <span className="text-xl md:text-3xl font-bold">Clear</span>
                    <span className="text-[10px] md:text-xs text-[#A2A9B3] mt-1">Est. forecast</span>
                  </div>
                </div>
              </div>
              
              {/* Bortle Class */}
              <div className="glass-panel rounded-3xl p-5 md:p-6 col-span-2 md:col-span-1 group cursor-pointer hover:border-white/20 transition-colors border border-transparent">
                <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-center md:text-left">GPS Location</h4>
                <div className="flex flex-row md:flex-col items-center justify-center md:justify-start gap-4 md:gap-0">
                  <div className="flex items-center justify-center relative w-16 h-8 md:w-full md:h-12 md:mb-4">
                     <Map size={24} className="text-[#4ADE80]" />
                  </div>
                  <div className="text-left md:text-center">
                    <span className="text-[10px] md:text-xs text-[#A2A9B3]">Local<br/>Coordinates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="flex-[0.8] xl:flex-[0.6] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-lg md:text-xl">Your Plans</h4>
              <span className="text-[#D9A441] text-xs md:text-sm font-medium">{plans.length} total</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {plans.length === 0 ? (
                <div className="text-center text-[#A2A9B3] py-10 glass-panel rounded-2xl">
                  No plans yet. Click 'New Plan' to start.
                </div>
              ) : (
                plans.map(plan => {
                  const planDate = new Date(plan.date);
                  const isToday = isSameDay(planDate, new Date());
                  
                  let Icon = Star;
                  let color = '#4ADE80';
                  if (plan.type === 'Planets') { Icon = Moon; color = '#A855F7'; }
                  if (plan.type === 'Event') { Icon = Map; color = '#D9A441'; }

                  return (
                    <div key={plan.id} className={`glass-panel rounded-2xl p-4 md:p-5 flex items-center justify-between border relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors`} style={{ borderColor: `${color}40` }}>
                      <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5" style={{ backgroundColor: color }}></div>
                      <div className="flex items-center gap-4 ml-2">
                        <div className="w-12 h-12 rounded-full bg-[#161D2B] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform" style={{ color: color }}>
                          <Icon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm md:text-base mb-1">{plan.title}</span>
                          <span className="text-xs text-[#A2A9B3]">{isToday ? 'Today' : planDate.toLocaleDateString()} • {plan.time}</span>
                        </div>
                      </div>
                      <span className="text-xs md:text-sm font-semibold px-3 py-1 rounded-full" style={{ color: color, backgroundColor: `${color}15` }}>{plan.type}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="glass-panel p-6 md:p-8 rounded-3xl w-full max-w-md border border-white/20 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#A2A9B3] hover:text-white transition"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-6 text-white">Create Astrophotography Plan</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-[#A2A9B3] mb-1 block">Target / Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Orion Nebula, Jupiter Transit..." 
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D9A441] transition"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-[#A2A9B3] mb-1 block">Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D9A441] transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#A2A9B3] mb-1 block">Time</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D9A441] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#A2A9B3] mb-1 block">Category</label>
                <select 
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full bg-[#161D2B] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#D9A441] transition appearance-none"
                >
                  <option>Deep Sky</option>
                  <option>Planets</option>
                  <option>Event</option>
                </select>
              </div>

              <button 
                onClick={handleSavePlan}
                className="w-full mt-4 py-3 rounded-xl bg-[#D9A441] text-black font-bold text-lg hover:bg-white transition glow-amber"
              >
                Save to Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
