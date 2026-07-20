const { createClient } = require('@supabase/supabase-js');
const Astronomy = require('astronomy-engine');

console.log("=== RUNNING LOCAL TESTS ===");

try {
  // Test 1: Astronomy calculations
  const lat = 40.7128;
  const lon = -74.0060;
  const observer = new Astronomy.Observer(lat, lon, 0);
  const time = Astronomy.MakeTime(new Date());
  
  const jupEqu = Astronomy.Equator(Astronomy.Body.Jupiter, new Date(), observer, true, true);
  const jupHor = Astronomy.Horizon(time, observer, jupEqu.ra, jupEqu.dec, 'normal');
  
  if (jupHor.altitude !== undefined) {
    console.log("Test 1 (Astronomy Calculations): PASSED. Jupiter altitude is:", jupHor.altitude.toFixed(2));
  } else {
    console.error("Test 1 (Astronomy Calculations): FAILED.");
    process.exit(1);
  }
} catch (e) {
  console.error("Test 1 Failed with error:", e);
  process.exit(1);
}

console.log("All local diagnostic tests passed successfully!");
