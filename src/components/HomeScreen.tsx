import React, { useState, useEffect } from 'react';
import { MapPin, Bell, Star, Sparkles, Moon, Loader2, Info } from 'lucide-react';
import Image from 'next/image';
import { getAstronomyData } from '@/utils/astronomy';

export default function HomeScreen({ onNavigate }: { onNavigate?: (screen: string) => void }) {
  const [locationName, setLocationName] = useState('Locating...');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  
  // Real-time weather data states
  const [clearSkiesPercent, setClearSkiesPercent] = useState(0);
  const [sunrise, setSunrise] = useState('--:--');
  const [sunset, setSunset] = useState('--:--');
  const [temperature, setTemperature] = useState('--');
  const [weatherDesc, setWeatherDesc] = useState('Weather');
  const [hourlyClearSkies, setHourlyClearSkies] = useState<number[]>([0,0,0,0,0,0,0]);
  const [hourlyLabels, setHourlyLabels] = useState<string[]>(['','','','','','','']);

  // Real-Time Recommendations
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [moonData, setMoonData] = useState({ illum: 0, age: '--', rise: '--:--', set: '--:--' });

  useEffect(() => {
    const requestLocation = () => {
      setIsLoadingLocation(true);

      const processLocationData = async (latitude: number, longitude: number, fallbackCity?: string, fallbackRegion?: string) => {
        try {
          // 1. Fetch location name
          let city = fallbackCity;
          let region = fallbackRegion;
          
          if (!city) {
            const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoResponse.json();
            city = geoData.city || geoData.locality;
            region = geoData.principalSubdivision || geoData.countryCode;
          }
          
          if (city && region) {
            setLocationName(`${city}, ${region}`);
          } else if (city) {
            setLocationName(city);
          } else {
            setLocationName(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
          }

          // 2. Local Astronomy Engine Data (Real-time Moon & Planets)
          const astroData = getAstronomyData(latitude, longitude);
          setMoonData({
            illum: astroData.moon.illumination,
            age: astroData.moon.age,
            rise: astroData.moon.rise,
            set: astroData.moon.set
          });

          // Fetch REAL Target Recommendations from Backend
          try {
            const recRes = await fetch(`/api/astronomy?latitude=${latitude}&longitude=${longitude}`);
            if (recRes.ok) {
              const recData = await recRes.json();
              if (recData.recommendations) {
                setRecommendations(recData.recommendations);
              }
            }
          } catch (e) {
            console.error("Failed to fetch recommendations", e);
          }

          // 3. Fetch real-time weather/astronomy data from Open-Meteo
          const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=cloud_cover,temperature_2m,weather_code&hourly=cloud_cover&daily=sunrise,sunset&timezone=auto`);
          const weatherData = await weatherResponse.json();

          if (weatherData && weatherData.current) {
            // Invert cloud cover to get clear skies percentage
            const currentCloud = weatherData.current.cloud_cover;
            setClearSkiesPercent(100 - currentCloud);
            
            // Weather Code Mapping
            const code = weatherData.current.weather_code;
            let desc = 'Clear';
            if (code > 0 && code <= 3) desc = 'Cloudy';
            else if (code > 3 && code <= 48) desc = 'Fog';
            else if (code > 48 && code <= 57) desc = 'Drizzle';
            else if (code > 57 && code <= 67) desc = 'Rain';
            else if (code > 67 && code <= 77) desc = 'Snow';
            else if (code > 77 && code <= 82) desc = 'Showers';
            else if (code > 82) desc = 'Stormy';
            
            setWeatherDesc(desc);
            setTemperature(Math.round(weatherData.current.temperature_2m).toString());

            // Format times
            const formatTime = (isoString: string) => {
              if (!isoString) return '--:--';
              const date = new Date(isoString);
              return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            };
            
            if (weatherData.daily?.sunrise?.[0]) {
              setSunrise(formatTime(weatherData.daily.sunrise[0]));
            }
            if (weatherData.daily?.sunset?.[0]) {
              setSunset(formatTime(weatherData.daily.sunset[0]));
            }

            // Get next 7 hours of clear skies
            const currentHourStr = weatherData.current.time;
            const currentIndex = weatherData.hourly.time.findIndex((t: string) => t >= currentHourStr);
            
            if (currentIndex !== -1) {
              const next7HoursCloud = weatherData.hourly.cloud_cover.slice(currentIndex, currentIndex + 7);
              setHourlyClearSkies(next7HoursCloud.map((c: number) => 100 - c));
              
              const next7Times = weatherData.hourly.time.slice(currentIndex, currentIndex + 7);
              setHourlyLabels(next7Times.map((t: string) => {
                const date = new Date(t);
                return date.toLocaleTimeString([], { hour: 'numeric', hour12: true }).replace(/ [AP]M/i, (m) => m[0].toLowerCase() + m[1].toLowerCase());
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching real-time data:", error);
          setLocationName('Location Error');
        } finally {
          setIsLoadingLocation(false);
        }
      };

      const handleFallback = async () => {
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.latitude && ipData.longitude) {
              await processLocationData(ipData.latitude, ipData.longitude, ipData.city, ipData.region);
              return;
            }
          }
          
          // Secondary fallback
          const altRes = await fetch('http://ip-api.com/json/');
          if (altRes.ok) {
             const altData = await altRes.json();
             if (altData.lat && altData.lon) {
                await processLocationData(altData.lat, altData.lon, altData.city, altData.regionName);
                return;
             }
          }
        } catch (ipError) {
          console.error("IP fallback also failed", ipError);
        }
        setLocationName('Location Unavailable');
        setIsLoadingLocation(false);
      };

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            processLocationData(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            console.error("Error getting location, trying fallback:", error);
            handleFallback();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        handleFallback();
      }
    };

    requestLocation();
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white overflow-y-auto pb-24 md:pb-8 no-scrollbar relative">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-12 md:pt-8 pb-4">
          <div className="md:hidden">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-wide">APOGEE</h1>
              <span className="bg-[#D9A441] text-black text-[10px] font-bold px-2 py-0.5 rounded-sm">PRO</span>
            </div>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-[#A2A9B3] text-sm bg-white/5 px-3 py-1.5 rounded-full">
              {isLoadingLocation ? (
                <Loader2 size={14} className="mr-2 animate-spin text-[#D9A441]" />
              ) : (
                <MapPin size={14} className="mr-2 text-[#D9A441]" />
              )}
              <span className="max-w-[120px] md:max-w-none truncate">{locationName}</span>
            </div>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center relative hover:bg-white/10 transition">
              <Bell size={20} className="text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#D9A441] rounded-full border-2 border-[#101827]"></span>
            </button>
          </div>
        </div>

        <div className="px-6 flex flex-col gap-5">
          {/* Hero Card */}
          <div className="relative rounded-3xl overflow-hidden h-[320px] md:h-[400px] flex flex-col justify-end p-6 md:p-10 border border-white/5 shadow-2xl">
            <Image src="/images/milky_way.png" alt="Night Sky" fill className="object-cover absolute inset-0 z-0" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/70 to-transparent z-10" />
            <div className="relative z-20 w-full max-w-3xl">
              <div className="flex items-center gap-1 text-[#D9A441] text-xs md:text-sm font-semibold mb-3 md:mb-4 bg-[#D9A441]/20 w-max px-3 py-1.5 rounded-md border border-[#D9A441]/30">
                <Star size={14} fill="#D9A441" />
                {isLoadingLocation ? 'Analyzing sky conditions...' : clearSkiesPercent > 70 ? 'Excellent conditions tonight' : clearSkiesPercent > 30 ? 'Fair conditions tonight' : 'Poor conditions tonight'}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight max-w-[90%] tracking-wide">Tonight's Sky Overview</h2>
              <div className="flex justify-between items-center w-full">
                <button onClick={() => onNavigate?.('planner')} className="bg-[#D9A441] text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 glow-amber hover:scale-105 transition-transform">
                  <Moon size={18} fill="black" />
                  Plan Session
                </button>
                <span className="text-sm md:text-base text-gray-300 font-medium hidden md:block">
                  {isLoadingLocation ? '--' : clearSkiesPercent}% Clear Skies
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left Column (Desktop) */}
            <div className="md:col-span-2 flex flex-col gap-5">
              {/* Quick Stats */}
              <div className="flex justify-between glass-panel rounded-2xl p-4 px-6 md:px-10">
                <div className="flex flex-col items-center">
                  <span className="text-lg md:text-2xl font-bold">{isLoadingLocation ? '--:--' : sunset.split(' ')[0]} <span className="text-xs md:text-sm font-normal">{sunset.split(' ')[1] || 'PM'}</span></span>
                  <span className="text-[#A2A9B3] text-xs md:text-sm">Sunset</span>
                </div>
                <div className="w-px h-10 md:h-12 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-lg md:text-2xl font-bold">{isLoadingLocation ? '--' : temperature}°<span className="text-xs md:text-sm font-normal">C</span></span>
                  <span className="text-[#A2A9B3] text-xs md:text-sm">{isLoadingLocation ? 'Loading' : weatherDesc}</span>
                </div>
                <div className="w-px h-10 md:h-12 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-lg md:text-2xl font-bold">{isLoadingLocation ? '--:--' : sunrise.split(' ')[0]} <span className="text-xs md:text-sm font-normal">{sunrise.split(' ')[1] || 'AM'}</span></span>
                  <span className="text-[#A2A9B3] text-xs md:text-sm">Sunrise</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
                {/* Moon Phase */}
                <div className="glass-panel rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
                  <div className="flex justify-between relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Moon size={18} className="text-[#D9A441]" />
                        <h3 className="font-semibold text-lg">Moon Phase</h3>
                      </div>
                      <p className="text-[#A2A9B3] text-sm">Real-time Data</p>
                      
                      <div className="mt-8">
                        <div className="relative w-16 h-16 rounded-full border-[4px] border-[#D9A441] flex items-center justify-center">
                          <span className="text-base font-bold">{moonData.illum}%</span>
                        </div>
                        <div className="text-xs text-[#A2A9B3] mt-2 text-center w-16 font-medium">ILLUM.</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 md:pr-4 relative z-10">
                      <div className="flex flex-col justify-center items-end bg-[#0B0F17]/70 backdrop-blur-md rounded-lg p-2 border border-white/5">
                        <span className="text-sm font-semibold">{moonData.age}d</span>
                        <span className="text-[10px] text-[#A2A9B3] uppercase font-bold">Age</span>
                      </div>
                      <div className="flex flex-col justify-center items-end bg-[#0B0F17]/70 backdrop-blur-md rounded-lg p-2 border border-white/5">
                        <span className="text-sm font-semibold">{moonData.rise}</span>
                        <span className="text-[10px] text-[#A2A9B3] uppercase font-bold">Rise</span>
                      </div>
                      <div className="flex flex-col justify-center items-end bg-[#0B0F17]/70 backdrop-blur-md rounded-lg p-2 border border-white/5">
                        <span className="text-sm font-semibold">{moonData.set}</span>
                        <span className="text-[10px] text-[#A2A9B3] uppercase font-bold">Set</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-[-40px] bottom-[-20px] md:bottom-0 md:top-auto top-auto w-48 md:w-56 h-48 md:h-56 opacity-40 pointer-events-none z-0">
                     <Image src="/images/moon.png" alt="Moon" fill className="object-contain" />
                  </div>
                </div>

                {/* Sky Conditions */}
                <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Star size={18} className="text-[#D9A441]" />
                      <h3 className="font-semibold text-lg">Sky Conditions</h3>
                    </div>
                    <span className="text-[#A2A9B3] text-xs">Live API data</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6 md:mb-8">
                    {isLoadingLocation ? (
                       <Loader2 size={32} className="animate-spin text-white mb-2" />
                    ) : (
                      <>
                        <span className="text-4xl md:text-5xl font-bold">{clearSkiesPercent}%</span>
                        <span className="text-[#A2A9B3] text-sm md:text-base">clear skies</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-auto pt-2">
                    {hourlyClearSkies.map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-5 md:w-7 lg:w-8 bg-[#161D2B] rounded-full flex items-end justify-center h-16 md:h-20 relative hover:bg-[#1c2436] transition-colors cursor-pointer group">
                          <div 
                            className="w-full bg-[#D9A441] rounded-full absolute bottom-0 group-hover:glow-amber transition-shadow" 
                            style={{height: isLoadingLocation ? '10%' : `${h}%`}}
                          ></div>
                        </div>
                        <span className="text-[10px] md:text-xs text-[#A2A9B3] whitespace-nowrap">
                          {isLoadingLocation ? '--' : hourlyLabels[i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Desktop) */}
            <div className="md:col-span-1">
              {/* AI Recommendations */}
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#A855F7]" />
                    <div>
                      <h3 className="font-semibold text-lg">AI Recommendations</h3>
                      <p className="text-[#A2A9B3] text-xs">Tailored to your gear & sky</p>
                    </div>
                  </div>
                  <button onClick={() => onNavigate?.('ai-assistant')} className="text-[#4ADE80] text-sm font-medium hover:underline">
                    View all
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {isLoadingLocation ? (
                    <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#A2A9B3]" /></div>
                  ) : recommendations.length > 0 ? (
                    recommendations.slice(0, 2).map((rec, idx) => (
                      <div key={rec.id} className={`glass-panel rounded-3xl p-5 flex items-center md:items-start lg:items-center gap-4 border ${rec.rating > 70 ? 'border-[#4ADE80]/30 hover:border-[#4ADE80]/60' : 'border-white/10 hover:border-white/30'} relative overflow-hidden group transition-colors cursor-pointer ${idx === 1 ? 'hidden md:flex' : ''}`}>
                        {rec.rating > 70 && <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/5 blur-2xl rounded-full group-hover:bg-[#A855F7]/10 transition-colors"></div>}
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden relative shrink-0 bg-[#161D2B] flex items-center justify-center">
                           {rec.img ? <Image src={rec.img} alt={rec.name} fill className="object-cover" /> : <Star size={24} className="text-[#A2A9B3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-[15px] md:text-base truncate">{rec.name}</h4>
                            <span className={`${rec.rating > 70 ? 'text-[#4ADE80] bg-[#4ADE80]/10' : 'text-[#D9A441] bg-[#D9A441]/10'} text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap`}>
                              Score: {rec.rating}
                            </span>
                          </div>
                          <p className="text-[#A2A9B3] text-xs md:text-sm mt-1 mb-1">{rec.type}</p>
                          <p className="text-[#A2A9B3] text-xs leading-relaxed flex flex-col">
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${rec.isVisible ? 'bg-[#4ADE80]' : 'bg-[#EF4444]'}`}></span>
                              {rec.isVisible ? 'Visible Tonight' : 'Not Visible'}
                            </span>
                            <span className="ml-3 mt-0.5 truncate text-[10px] md:text-xs text-white/60">~ {rec.equipment}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-[#A2A9B3] text-sm py-8 glass-panel rounded-2xl border border-white/5">No optimal targets right now.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
