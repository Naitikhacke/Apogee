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
      if (isSignUp) {
        let query: any = supabase
          .from('custom_users')
          .insert([
            { email: email.toLowerCase(), password, full_name: fullName, phone: phoneNumber }
          ]);
          
        if (typeof query.select === 'function') {
          query = query.select().single();
        }

        const { data, error } = await query;
        const insertedUser = data ? (Array.isArray(data) ? data[0] : data) : null;
        
        if (error) {
          if (error.code === '23505') throw new Error('An account with this email already exists.');
          throw error;
        }
        
        if (insertedUser) {
          onLogin({ id: insertedUser.id, name: insertedUser.full_name, email: insertedUser.email, phone: insertedUser.phone });
        }
      } else {
        // Direct database query for login (Bypass Supabase Auth)
        const { data, error } = await supabase
          .from('custom_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .eq('password', password)
          .single();

        if (error || !data) {
          throw new Error('Invalid email or password.');
        }
        
        onLogin({ id: data.id, name: data.full_name, email: data.email, phone: data.phone });
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
