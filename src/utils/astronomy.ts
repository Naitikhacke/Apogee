export function getAstronomyData(latitude: number, longitude: number) {
  const date = new Date();
  
  // 1. Calculate approximate Moon Phase & Age without external libraries
  // Known reference new moon: Jan 6, 2000, 18:14 UTC
  const referenceNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0)).getTime();
  const lunarCycle = 29.53058867 * 24 * 60 * 60 * 1000; // lunar cycle in milliseconds
  
  const timeDiff = date.getTime() - referenceNewMoon;
  const cycleModulo = timeDiff % lunarCycle;
  
  // Age in days
  const age = cycleModulo / (24 * 60 * 60 * 1000);
  
  // Phase in radians (0 to 2*PI)
  const phase = (age / 29.53058867) * 2 * Math.PI;
  
  // Illumination %: 50 * (1 - cos(phase))
  const illum = 50 * (1 - Math.cos(phase));

  // 2. Simple mock times for rise/set based on phase (approximate)
  // New moon rises near sunrise, full moon rises near sunset
  const riseHour = (6 + (age / 29.53) * 24) % 24;
  const setHour = (riseHour + 12) % 24;
  
  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    let hour = Math.floor(h) % 12;
    if (hour === 0) hour = 12;
    const mins = Math.floor((h % 1) * 60);
    return `${hour}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // 3. Mock Jupiter rise time dynamically based on the current hour to always be "upcoming"
  const currentHour = date.getHours() + date.getMinutes() / 60;
  const jupiterRiseHour = (currentHour + 2.5) % 24;

  return {
    moon: {
      illumination: Math.round(illum),
      age: age.toFixed(1),
      rise: formatHour(riseHour),
      set: formatHour(setHour)
    },
    jupiter: {
      rise: formatHour(jupiterRiseHour)
    }
  };
}
