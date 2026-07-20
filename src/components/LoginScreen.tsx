import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function LoginScreen({ onLogin }: { onLogin: (user: { id: string; name: string; email: string; phone?: string }) => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const cleanEmail = email.trim().toLowerCase();
      
      let supabaseWorked = false;
      
      try {
        if (isSignUp) {
          const { data, error } = await supabase
            .from('custom_users')
            .insert([
              { email: cleanEmail, password, full_name: fullName, phone: phoneNumber }
            ])
            .select()
            .single();
          
          if (error) {
            if (error.code === '23505') throw new Error('An account with this email already exists.');
            throw error;
          }
          
          if (data) {
            supabaseWorked = true;
            onLogin({ id: data.id, name: data.full_name, email: data.email, phone: data.phone });
            return;
          }
        } else {
          const { data, error } = await supabase
            .from('custom_users')
            .select('*')
            .eq('email', cleanEmail)
            .eq('password', password)
            .single();

          if (error || !data) {
            // Check if it's a network error vs an invalid credential error
            if (error?.message?.includes('Failed to fetch') || error?.code === 'PGRST301') {
               throw error; // Let outer catch handle fallback
            }
            throw new Error('Invalid email or password.');
          }
          
          supabaseWorked = true;
          onLogin({ id: data.id, name: data.full_name, email: data.email, phone: data.phone });
          return;
        }
      } catch (supabaseError: any) {
        // If it's a legitimate invalid credential error, throw it to the user
        if (supabaseError.message === 'Invalid email or password.' || supabaseError.message === 'An account with this email already exists.') {
          throw supabaseError;
        }
        console.warn('Supabase connection failed, using local offline storage fallback.', supabaseError);
        // Continue to fallback below
      }

      // LOCAL STORAGE FALLBACK (Offline Mode)
      if (!supabaseWorked) {
        const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
        
        if (isSignUp) {
          if (users.find((u: any) => u.email === cleanEmail)) {
            throw new Error('An account with this email already exists.');
          }
          const newUser = { id: Date.now().toString(), name: fullName, email: cleanEmail, phone: phoneNumber, password };
          users.push(newUser);
          localStorage.setItem('mock_users', JSON.stringify(users));
          onLogin({ id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone });
        } else {
          const user = users.find((u: any) => u.email === cleanEmail && u.password === password);
          if (!user) {
            if (cleanEmail === 'test@apoggee.com' && password === 'password') {
              onLogin({ id: 'demo123', name: 'Test User', email: 'test@apoggee.com', phone: '1234567890' });
              return;
            }
            throw new Error('Invalid email or password.');
          }
          onLogin({ id: user.id, name: user.name, email: user.email, phone: user.phone });
        }
      }
      
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#0B0F17] flex items-center justify-center overflow-hidden text-white">
      {/* Background with milky way */}
      <Image src="/images/milky_way.png" alt="Milky Way" fill className="object-cover absolute inset-0 z-0 opacity-40 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/80 to-transparent z-10" />
      
      {/* Ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D9A441]/20 blur-[100px] rounded-full z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#A855F7]/20 blur-[100px] rounded-full z-10"></div>

      <div className="relative z-20 w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-[#D9A441] flex items-center justify-center glow-amber-strong mb-4 md:mb-6 border-[4px] border-[#0B0F17]">
            <Sparkles size={32} className="text-black md:w-10 md:h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-center mb-2">APOGEE</h1>
          <p className="text-[#A2A9B3] text-center text-xs md:text-sm tracking-wide">YOUR PERSONAL ASTROPHOTOGRAPHY GUIDE</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D9A441] to-transparent"></div>
          
          <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          
          <div className="flex flex-col gap-4 mb-8">
            {isSignUp && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A2A9B3]" size={20} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-[#A2A9B3] focus:outline-none focus:border-[#D9A441]/50 focus:bg-white/10 transition-all"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A2A9B3]" size={20} />
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    required={isSignUp}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-[#A2A9B3] focus:outline-none focus:border-[#D9A441]/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A2A9B3]" size={20} />
              <input 
                type="email" 
                placeholder="Email address" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-[#A2A9B3] focus:outline-none focus:border-[#D9A441]/50 focus:bg-white/10 transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A2A9B3]" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3.5 text-white placeholder:text-[#A2A9B3] focus:outline-none focus:border-[#D9A441]/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl flex items-start gap-2 mb-6">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !email || !password || (isSignUp && (!fullName || !phoneNumber))}
            className="w-full bg-[#D9A441] text-black font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:bg-[#E5B55C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group mb-4"
          >
            {isLoading ? (
              <span className="animate-pulse">{isSignUp ? 'Creating account...' : 'Authenticating...'}</span>
            ) : (
              <>
                <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-[#A2A9B3]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              type="button" 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
              }}
              className="text-[#D9A441] font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Create one'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
