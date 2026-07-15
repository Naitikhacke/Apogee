"use client";

import React, { useState, useEffect } from 'react';
import { Home, Compass, Camera, Calendar, User, Sparkles } from 'lucide-react';
import HomeScreen from '@/components/HomeScreen';
import SkyMapScreen from '@/components/SkyMapScreen';
import AIAssistantScreen from '@/components/AIAssistantScreen';
import PlannerScreen from '@/components/PlannerScreen';
import ProfileScreen from '@/components/ProfileScreen';
import CameraScreen from '@/components/CameraScreen';
import LoginScreen from '@/components/LoginScreen';
import { supabase } from '@/lib/supabase';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('home');
  const [user, setUser] = useState<{name: string, email: string, phone?: string} | null>(null);

  useEffect(() => {
    const fetchProfile = async (session: any) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      setUser({
        name: data?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
        email: data?.email || session.user.email || '',
        phone: data?.phone || session.user.user_metadata?.phone,
      });
    };

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) {
    return <LoginScreen onLogin={(userData) => setUser(userData)} />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onNavigate={(screen: string) => setActiveScreen(screen)} />;
      case 'skymap':
        return <SkyMapScreen />;
      case 'ai-assistant':
        return <AIAssistantScreen onBack={() => setActiveScreen('home')} />;
      case 'planner':
        return <PlannerScreen />;
      case 'profile':
        return <ProfileScreen user={user} />;
      case 'camera':
        return <CameraScreen onBack={() => setActiveScreen('home')} />;
      default:
        return <HomeScreen onNavigate={(screen: string) => setActiveScreen(screen)} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'skymap', icon: Compass, label: 'Sky Map' },
    { id: 'camera', icon: Camera, label: '', isCenter: true },
    { id: 'planner', icon: Calendar, label: 'Planner' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <main className="w-full h-[100dvh] bg-[#0B0F17] overflow-hidden relative font-sans text-white flex flex-col md:flex-row">
      
      {/* Desktop Sidebar Navigation */}
      {activeScreen !== 'ai-assistant' && activeScreen !== 'camera' && (
        <div className="hidden md:flex flex-col w-64 h-full bg-[#101827]/90 border-r border-white/5 py-8 px-4 z-50">
          <div className="flex items-center gap-2 px-4 mb-12">
            <h1 className="text-2xl font-bold tracking-wide">APOGEE</h1>
            <span className="bg-[#D9A441] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm">PRO</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              
              if (item.isCenter) {
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveScreen('camera')}
                    className="mt-4 mb-4 w-full h-14 rounded-2xl bg-[#D9A441] flex items-center justify-center gap-3 glow-amber-strong border-2 border-transparent hover:scale-105 transition-transform"
                  >
                    <item.icon size={24} className="text-black" />
                    <span className="text-black font-semibold">Open Camera</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-[#D9A441]' : 'text-[#A2A9B3] hover:bg-white/5 hover:text-white'}`}
                >
                  <item.icon size={22} className={isActive ? 'text-[#D9A441]' : ''} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Screen */}
      <div className="flex-1 w-full h-full relative">
        {renderScreen()}
      </div>

      {/* Mobile Bottom Navigation */}
      {activeScreen !== 'ai-assistant' && activeScreen !== 'camera' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-50">
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#101827]/90 backdrop-blur-xl border-t border-white/5 pointer-events-auto rounded-t-3xl flex justify-around items-center px-4 pb-4 pt-2">
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              
              if (item.isCenter) {
                return (
                  <button 
                    key={item.id}
                    onClick={() => setActiveScreen('camera')}
                    className="relative -top-6 w-16 h-16 rounded-full bg-[#D9A441] flex flex-col items-center justify-center glow-amber-strong border-[4px] border-[#0B0F17] shrink-0 transform transition-transform active:scale-95"
                  >
                    <item.icon size={28} className="text-black" />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  className={`flex flex-col items-center justify-center gap-1 w-16 ${isActive ? 'text-[#D9A441]' : 'text-[#A2A9B3] hover:text-white'} transition-colors`}
                >
                  <item.icon size={22} className={isActive ? 'text-[#D9A441]' : ''} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Floating AI Button on Home */}
      {activeScreen === 'home' && (
        <button 
          onClick={() => setActiveScreen('ai-assistant')}
          className="fixed bottom-28 md:bottom-10 right-6 w-14 h-14 rounded-full bg-[#A855F7] text-white flex items-center justify-center glow-purple z-40 transform transition-transform hover:scale-105 active:scale-95 shadow-lg"
        >
          <Sparkles size={24} />
        </button>
      )}
    </main>
  );
}

