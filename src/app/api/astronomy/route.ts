import { NextResponse } from 'next/server';
import { Observer, Body, Illumination, MoonPhase, SearchRiseSet } from 'astronomy-engine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('latitude');
    const lonStr = searchParams.get('longitude');
    
    if (!latStr || !lonStr) {
      return NextResponse.json({ error: 'Latitude and longitude are required.' }, { status: 400 });
    }
    
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    
    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid latitude or longitude.' }, { status: 400 });
    }
    
    const observer = new Observer(lat, lon, 0);
    const date = new Date();
    
    // Moon Phase and Illumination
    const moonIllum = Illumination(Body.Moon, date);
    const moonPhaseAngle = MoonPhase(date); // 0 to 360 degrees
    const moonPhasePercent = moonIllum.phase_fraction; // 0.0 to 1.0
    
    // Approximate Moon Age in days (lunar cycle is 29.53 days)
    const moonAge = (moonPhaseAngle / 360) * 29.53;
    
    // Rise and Set times for Sun, Moon, and Jupiter
    const formatHour = (d: Date | null) => {
      if (!d) return '--:--';
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      let hour = hours % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    
    // Search for rise and set events within next 24 hours
    const nextSunrise = SearchRiseSet(Body.Sun, observer, 1, date, 1);
    const nextSunset = SearchRiseSet(Body.Sun, observer, -1, date, 1);
    
    const nextMoonrise = SearchRiseSet(Body.Moon, observer, 1, date, 1);
    const nextMoonset = SearchRiseSet(Body.Moon, observer, -1, date, 1);
    
    const nextJupiterRise = SearchRiseSet(Body.Jupiter, observer, 1, date, 1);
    const nextJupiterSet = SearchRiseSet(Body.Jupiter, observer, -1, date, 1);
    
    return NextResponse.json({
      moon: {
        illumination: Math.round(moonPhasePercent * 100),
        age: moonAge.toFixed(1),
        rise: formatHour(nextMoonrise ? nextMoonrise.date : null),
        set: formatHour(nextMoonset ? nextMoonset.date : null)
      },
      jupiter: {
        rise: formatHour(nextJupiterRise ? nextJupiterRise.date : null),
        set: formatHour(nextJupiterSet ? nextJupiterSet.date : null)
      },
      sun: {
        sunrise: formatHour(nextSunrise ? nextSunrise.date : null),
        sunset: formatHour(nextSunset ? nextSunset.date : null)
      }
    });
  } catch (error: any) {
    console.error('Astronomy calculation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
