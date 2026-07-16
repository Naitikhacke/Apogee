import { NextResponse } from 'next/server';
import { Observer, Body, Illumination, MoonPhase, SearchRiseSet, Equator, Horizon, MakeTime } from 'astronomy-engine';

// List of Deep Sky Objects (DSOs)
const deepSkyObjects = [
  { id: 'andromeda', name: 'Andromeda Galaxy', type: 'Galaxy', catalog: 'M31', ra: 0.7118, dec: 41.27, eq: 'Telephoto or 50mm+ lens', img: '/images/andromeda.png' },
  { id: 'orion', name: 'Orion Nebula', type: 'Nebula', catalog: 'M42', ra: 5.5867, dec: -5.38, eq: '200mm+ lens', img: '/images/orion.png' },
  { id: 'pleiades', name: 'Pleiades Cluster', type: 'Star Cluster', catalog: 'M45', ra: 3.7833, dec: 24.1, eq: '50mm-200mm lens', img: '/images/pleiades.png' },
  { id: 'hercules', name: 'Hercules Cluster', type: 'Globular Cluster', catalog: 'M13', ra: 16.695, dec: 36.46, eq: '300mm+ lens', img: '/images/hercules.png' },
  { id: 'lagoon', name: 'Lagoon Nebula', type: 'Nebula', catalog: 'M8', ra: 18.06, dec: -24.38, eq: '200mm+ lens', img: '/images/lagoon.png' },
  { id: 'ring', name: 'Ring Nebula', type: 'Planetary Nebula', catalog: 'M57', ra: 18.88, dec: 33.03, eq: '400mm+ lens', img: '/images/ring.png' }
];

// List of Planets
const planetaryObjects = [
  { id: 'jupiter', name: 'Jupiter', type: 'Planet', body: Body.Jupiter, eq: 'Any telephoto lens', img: '/images/jupiter.png' },
  { id: 'saturn', name: 'Saturn', type: 'Planet', body: Body.Saturn, eq: '300mm+ lens', img: '/images/saturn.png' },
  { id: 'mars', name: 'Mars', type: 'Planet', body: Body.Mars, eq: '300mm+ lens', img: '/images/mars.png' },
  { id: 'venus', name: 'Venus', type: 'Planet', body: Body.Venus, eq: 'Telephoto lens', img: '/images/venus.png' }
];

// Pre-configured Dark Sky Spots for Location Recommendations (Feature B)
const darkSkySpots = [
  { id: 'hanle', name: "Hanle Dark Sky Reserve", lat: 32.7794, lon: 78.9754, bortle: 1, region: "Ladakh, India" },
  { id: 'spiti', name: "Kibber Dark Sky Village", lat: 32.2461, lon: 78.0349, bortle: 2, region: "Spiti, India" },
  { id: 'manas', name: "Manas National Park", lat: 26.1400, lon: 91.7300, bortle: 3, region: "Assam, India" },
  { id: 'coorg', name: "Mandalpatti Peak", lat: 12.4244, lon: 75.7382, bortle: 4, region: "Karnataka, India" },
  { id: 'jaisalmer', name: "Thar Desert stargazing", lat: 26.9157, lon: 70.9083, bortle: 3, region: "Rajasthan, India" },
  { id: 'death_valley', name: "Death Valley National Park", lat: 36.5323, lon: -116.9325, bortle: 1, region: "California, US" },
  { id: 'joshua_tree', name: "Joshua Tree Dark Sky Spot", lat: 33.8734, lon: -115.9010, bortle: 3, region: "California, US" },
  { id: 'cherry_springs', name: "Cherry Springs State Park", lat: 41.6501, lon: -77.8163, bortle: 2, region: "Pennsylvania, US" },
  { id: 'mauna_kea', name: "Mauna Kea Observatory", lat: 19.8206, lon: -155.4681, bortle: 1, region: "Hawaii, US" },
  { id: 'galloway', name: "Galloway Forest Park", lat: 55.0740, lon: -4.4363, bortle: 3, region: "Scotland, UK" },
  { id: 'aoraki', name: "Aoraki Mackenzie Reserve", lat: -43.7342, lon: 170.0963, bortle: 1, region: "South Island, NZ" },
  { id: 'warrumbungle', name: "Warrumbungle National Park", lat: -31.2748, lon: 149.0069, bortle: 1, region: "Coonabarabran, AU" }
];

// Distance calculation using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

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
    const time = MakeTime(date);

    // MODE C: Calendar Range Calculations (Feature C)
    const daysParam = searchParams.get('days');
    if (daysParam) {
      const days = parseInt(daysParam);
      const startParam = searchParams.get('startDate');
      const startDate = startParam ? new Date(startParam) : new Date();
      
      const calendarDays = [];
      for (let i = 0; i < days; i++) {
        const currentLoopDate = new Date(startDate);
        currentLoopDate.setDate(startDate.getDate() + i);
        const loopTime = MakeTime(currentLoopDate);
        
        // Moon Phase Info
        const moonIllum = Illumination(Body.Moon, currentLoopDate);
        const moonPhaseAngle = MoonPhase(currentLoopDate);
        const moonAge = (moonPhaseAngle / 360) * 29.53;
        
        // Calculate Sunrise/Sunset for that day
        const sunriseEvent = SearchRiseSet(Body.Sun, observer, 1, currentLoopDate, 1);
        const sunsetEvent = SearchRiseSet(Body.Sun, observer, -1, currentLoopDate, 1);
        
        const formatTime = (d: Date | null) => {
          if (!d) return '--:--';
          return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        };
        
        // Stargazing Index (Bortle/Moon-adjusted score: 0 to 100)
        // 0% moon illumination gives 100 score, 100% moon gives 0 score.
        const skyScore = Math.round((1 - moonIllum.phase_fraction) * 100);
        let skyQuality = 'Excellent';
        if (skyScore < 40) skyQuality = 'Poor';
        else if (skyScore < 80) skyQuality = 'Good';
        
        calendarDays.push({
          date: currentLoopDate.toISOString().split('T')[0],
          dayName: currentLoopDate.toLocaleDateString('en-US', { weekday: 'short' }),
          moon: {
            illumination: Math.round(moonIllum.phase_fraction * 100),
            age: moonAge.toFixed(1)
          },
          sun: {
            sunrise: formatTime(sunriseEvent ? sunriseEvent.date : null),
            sunset: formatTime(sunsetEvent ? sunsetEvent.date : null)
          },
          skyScore,
          skyQuality
        });
      }
      return NextResponse.json({ days: calendarDays });
    }

    // MODE B: Search Target Details (Feature B)
    const targetParam = searchParams.get('target');
    if (targetParam) {
      const searchId = targetParam.toLowerCase();
      
      // Look up target in planets or DSOs
      const dso = deepSkyObjects.find(d => d.id === searchId || d.name.toLowerCase().includes(searchId));
      const planet = planetaryObjects.find(p => p.id === searchId || p.name.toLowerCase().includes(searchId));
      
      if (!dso && !planet) {
        return NextResponse.json({ error: 'Target not found' }, { status: 404 });
      }
      
      const targetName = dso ? dso.name : planet!.name;
      const targetType = dso ? dso.type : 'Planet';
      const targetEq = dso ? dso.eq : planet!.eq;
      
      // Calculate Alt/Az hourly path for the next 24 hours to find visibility window
      const path = [];
      let riseTime = null;
      let setTime = null;
      let bestStart = null;
      let bestEnd = null;
      
      for (let hourOffset = 0; hourOffset < 24; hourOffset++) {
        const checkTime = new Date();
        checkTime.setHours(checkTime.getHours() + hourOffset);
        const loopAstroTime = MakeTime(checkTime);
        
        let ra = 0;
        let dec = 0;
        if (dso) {
          ra = dso.ra;
          dec = dso.dec;
        } else {
          const planetEqu = Equator(planet!.body, checkTime, observer, true, true);
          ra = planetEqu.ra;
          dec = planetEqu.dec;
        }
        
        const hor = Horizon(loopAstroTime, observer, ra, dec, 'normal');
        
        // Calculate sun position to determine if it is dark
        const sunEqu = Equator(Body.Sun, checkTime, observer, true, true);
        const sunHor = Horizon(loopAstroTime, observer, sunEqu.ra, sunEqu.dec, 'normal');
        const isDark = sunHor.altitude < -12; // Nautical twilight or better
        const isVisible = hor.altitude > 15; // Above horizon
        
        path.push({
          time: checkTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          altitude: Math.round(hor.altitude),
          azimuth: Math.round(hor.azimuth),
          isVisible: isVisible && isDark
        });
        
        // Log rise and set thresholds
        if (isVisible && isDark) {
          if (!bestStart) bestStart = checkTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          bestEnd = checkTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
      }
      
      // Rise and set events from library
      if (planet) {
        const nextRise = SearchRiseSet(planet.body, observer, 1, date, 1);
        const nextSet = SearchRiseSet(planet.body, observer, -1, date, 1);
        riseTime = nextRise ? nextRise.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--';
        setTime = nextSet ? nextSet.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--';
      }
      
      // Calculate distances to dark sky spots and sort
      const recommendedLocations = darkSkySpots
        .map(spot => {
          const dist = calculateDistance(lat, lon, spot.lat, spot.lon);
          return {
            ...spot,
            distance: Math.round(dist)
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3); // Get 3 closest
        
      return NextResponse.json({
        target: {
          name: targetName,
          type: targetType,
          equipment: targetEq,
          rise: riseTime,
          set: setTime,
          bestWindow: bestStart && bestEnd ? `${bestStart} - ${bestEnd}` : 'Not visible tonight',
          path,
          recommendedLocations
        }
      });
    }

    // MODE A: "Best Right Now" Recommendations (Feature A)
    // Gather all DSOs and Planets, compute Alt/Az, sort by Altitude
    const recommendations = [];
    
    // Process deep sky objects
    for (const dso of deepSkyObjects) {
      const hor = Horizon(time, observer, dso.ra, dso.dec, 'normal');
      const sunEqu = Equator(Body.Sun, date, observer, true, true);
      const sunHor = Horizon(time, observer, sunEqu.ra, sunEqu.dec, 'normal');
      const isDark = sunHor.altitude < -6; // Sun is below horizon
      
      // Calculate a rating (0-100) based on altitude and moon phase
      const moonIllum = Illumination(Body.Moon, date);
      const moonFactor = dso.type === 'Galaxy' || dso.type === 'Nebula' ? (1 - moonIllum.phase_fraction) : 1; // Planets/Clusters are less moon-affected
      const altitudeScore = Math.max(0, Math.min(100, (hor.altitude / 90) * 100));
      const rating = Math.round(altitudeScore * moonFactor);
      
      recommendations.push({
        id: dso.id,
        name: dso.name,
        catalog: dso.catalog,
        type: dso.type,
        altitude: Math.round(hor.altitude),
        azimuth: Math.round(hor.azimuth),
        rating,
        equipment: dso.eq,
        img: dso.img,
        isVisible: hor.altitude > 15 && isDark
      });
    }
    
    // Process planets
    for (const planet of planetaryObjects) {
      const pEqu = Equator(planet.body, date, observer, true, true);
      const hor = Horizon(time, observer, pEqu.ra, pEqu.dec, 'normal');
      const sunEqu = Equator(Body.Sun, date, observer, true, true);
      const sunHor = Horizon(time, observer, sunEqu.ra, sunEqu.dec, 'normal');
      const isDark = sunHor.altitude < -6;
      
      const altitudeScore = Math.max(0, Math.min(100, (hor.altitude / 90) * 100));
      const rating = Math.round(altitudeScore); // Moon doesn't affect planet viewing much
      
      // Get rise time
      const nextRise = SearchRiseSet(planet.body, observer, 1, date, 1);
      const riseStr = nextRise ? nextRise.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--';
      
      recommendations.push({
        id: planet.id,
        name: planet.name,
        catalog: planet.type,
        type: planet.type,
        altitude: Math.round(hor.altitude),
        azimuth: Math.round(hor.azimuth),
        rating,
        equipment: planet.eq,
        img: planet.img,
        rise: riseStr,
        isVisible: hor.altitude > 15 && isDark
      });
    }
    
    // Sort recommendations (visible and highest altitude first)
    const sortedRecommendations = recommendations
      .sort((a, b) => {
        if (a.isVisible !== b.isVisible) {
          return a.isVisible ? -1 : 1;
        }
        return b.rating - a.rating;
      });
      
    // Basic single-day response
    const moonIllum = Illumination(Body.Moon, date);
    const moonPhaseAngle = MoonPhase(date);
    const moonAge = (moonPhaseAngle / 360) * 29.53;
    
    const nextSunrise = SearchRiseSet(Body.Sun, observer, 1, date, 1);
    const nextSunset = SearchRiseSet(Body.Sun, observer, -1, date, 1);
    
    const nextMoonrise = SearchRiseSet(Body.Moon, observer, 1, date, 1);
    const nextMoonset = SearchRiseSet(Body.Moon, observer, -1, date, 1);
    
    const nextJupiterRise = SearchRiseSet(Body.Jupiter, observer, 1, date, 1);
    
    const formatHour = (d: Date | null) => {
      if (!d) return '--:--';
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };
    
    return NextResponse.json({
      moon: {
        illumination: Math.round(moonIllum.phase_fraction * 100),
        age: moonAge.toFixed(1),
        rise: formatHour(nextMoonrise ? nextMoonrise.date : null),
        set: formatHour(nextMoonset ? nextMoonset.date : null)
      },
      jupiter: {
        rise: formatHour(nextJupiterRise ? nextJupiterRise.date : null)
      },
      sun: {
        sunrise: formatHour(nextSunrise ? nextSunrise.date : null),
        sunset: formatHour(nextSunset ? nextSunset.date : null)
      },
      recommendations: sortedRecommendations.slice(0, 4) // Return top 4
    });
  } catch (error: any) {
    console.error('Astronomy calculation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
