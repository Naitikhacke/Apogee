import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing or invalid in environment variables.' }, { status: 500 });
    }

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: 'Missing image data.' }, { status: 400 });
    }

    // Parse base64 data URL
    // Format: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the Flash model or custom recognize model from env for reliable multimodal execution
    const modelName = process.env.GEMINI_RECOGNIZE_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `Identify and classify all sky objects in this astronomical photo. 
List any constellations, bright stars, planets, nebulae, galaxies, or celestial events visible in the photo. 
Return the result strictly as a valid JSON array of objects with the following fields:
- name: string (e.g., "Orion Constellation", "Andromeda Galaxy", "Jupiter")
- type: string (must be one of: "constellation", "star", "planet", "nebula", "galaxy", "event", "other")
- confidence: number (a float between 0.0 and 1.0 indicating identification confidence)
- description: string (a short 1-2 sentence description detailing where it is in the photo or its stargazing visibility)

Format the response strictly as a JSON block, starting with [ and ending with ]. Do not include any markdown backticks, explanations, or leading/trailing text outside the JSON block.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    
    // Clean up response text in case the model ignored formatting rules and returned markdown block
    let cleanJsonStr = responseText.trim();
    if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    try {
      const parsedData = JSON.parse(cleanJsonStr);
      return NextResponse.json({ objects: parsedData });
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON. Raw text:", responseText);
      return NextResponse.json({ 
        error: 'Model did not return valid JSON output.', 
        rawText: responseText 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Image recognition error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during image recognition.' }, { status: 500 });
  }
}
