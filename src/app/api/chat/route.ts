import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import dns from 'dns';

// Fix for Node.js IPv6 DNS resolution issues on Windows that cause "fetch failed"
dns.setDefaultResultOrder('ipv4first');


const systemInstruction = `You are APOGEE AI, the intelligent astrophotography assistant built into the APOGEE mobile app. 

### About the APOGEE App:
APOGEE is a premium, state-of-the-art astrophotography planning and tracking application. It features:
1. **Home/Dashboard**: Displays real-time sky conditions (e.g., % clear skies), Bortle class, SQM darkness, moon phases, astro twilight times, and AI recommendations tailored to the user's gear and local sky.
2. **Sky Map**: An interactive map with AR View, Telescope, and Compass modes to locate stars, planets, constellations, and Deep Sky Objects (DSOs).
3. **Photography Planner**: A calendar view tracking weather, moon phases, and upcoming astronomical events (e.g., Milky Way Core Peaks, ISS Flyovers, Meteor Showers).
4. **User Profile**: Tracks user stats (captures, sessions, hours observed), equipment/gear checklists, and achievements (e.g., Moon Master, Galaxy Hunter, Deep Sky Seeker).

### Your Role:
- You help users plan their night sky photography sessions based on current conditions and app data.
- Recommend ideal camera settings (ISO, Aperture, Shutter Speed, Focal length, Focus mode) for specific targets like the Andromeda Galaxy (M31), Milky Way, or planets.
- Advise on visibility, weather, moon phases, and light pollution (Bortle scale).
- Act as an encouraging, expert astrophotography guide. 
- Keep your answers concise, structured, visually appealing, and helpful. 
- Use formatting like bullet points and emojis to make data easy to read. 
- Acknowledge that you are part of the APOGEE app ecosystem.`;

export async function POST(req: Request) {
  // IMPORTANT CONFIGURATION NOTE:
  // To use this API, you must set the GEMINI_API_KEY environment variable.
  // 1. Create a `.env.local` file in the root of the Apoggee project (if it doesn't exist).
  // 2. Add the following line: GEMINI_API_KEY=your_actual_api_key_here
  // 3. Restart the Next.js development server.
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json({ error: 'GEMINI_API_KEY is missing or invalid in environment variables.' }, { status: 500 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const { messages } = await req.json();
    
    // The model configuration - FIXED: updated to the correct model name
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] }
    });

    // Format previous messages for the Gemini API
    const history = messages.slice(0, -1).map((msg: { role: string, content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const latestMessage = messages[messages.length - 1].content;

    // Start a chat session with history
    const chat = model.startChat({
      history,
    });

    const latestMessageObj = messages[messages.length - 1];
    let msgParts: any[] = [{ text: latestMessageObj.content }];

    if (latestMessageObj.image) {
      const base64Data = latestMessageObj.image.split(',')[1];
      const mimeType = latestMessageObj.image.split(';')[0].split(':')[1];
      msgParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    const result = await chat.sendMessage(msgParts);
    const responseText = result.response.text();

    return NextResponse.json({ message: responseText });
    
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    // Return the actual error message so it's easier to debug
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate AI response.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
