import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFile } from 'fs/promises';
import { join } from 'path';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { logoPath } = await request.json();

    if (!logoPath) {
      return NextResponse.json({ error: 'Logo path is required' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Read the logo file
    const fullPath = join(process.cwd(), 'public', logoPath);
    const imageBuffer = await readFile(fullPath);

    // Convert to base64 for Gemini API
    const base64Image = imageBuffer.toString('base64');
    const mimeType = logoPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Try multiple model names as fallbacks
    let model;
    let selectedModelName = '';
    const modelNames = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        selectedModelName = modelName;
        console.log(`Successfully loaded model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`Model ${modelName} not available, trying next...`);
        continue;
      }
    }
    
    if (!model) {
      console.log('No Gemini models available, using fallback color generation');
      // Return a mock response for testing
      return NextResponse.json({
        success: true,
        analysis: {
          primaryColors: ['#3B82F6', '#10B981', '#F59E0B'],
          secondaryColors: ['#6B7280', '#9CA3AF', '#D1D5DB'],
          accentColors: ['#EF4444', '#8B5CF6'],
          neutralColors: ['#F9FAFB', '#F3F4F6', '#E5E7EB'],
          fontSuggestions: {
            heading: ['Inter', 'Roboto', 'Poppins'],
            body: ['Open Sans', 'Lato', 'Source Sans Pro'],
            accent: ['Playfair Display', 'Montserrat', 'Raleway']
          },
          colorScheme: 'vibrant',
          brandPersonality: 'modern'
        },
        fallback: true
      });
    }

    console.log(`Using Gemini model: ${selectedModelName}`);

    const prompt = `
      Analyze this logo image and extract a comprehensive color palette and suggest appropriate fonts.

      Please provide a JSON response with the following structure:
      {
        "primaryColors": ["#hex1", "#hex2", "#hex3"],
        "secondaryColors": ["#hex4", "#hex5", "#hex6"],
        "accentColors": ["#hex7", "#hex8"],
        "neutralColors": ["#hex9", "#hex10", "#hex11"],
        "fontSuggestions": {
          "heading": ["FontName1", "FontName2", "FontName3"],
          "body": ["FontName4", "FontName5", "FontName6"],
          "accent": ["FontName7", "FontName8", "FontName9"]
        },
        "colorScheme": "warm" | "cool" | "neutral" | "vibrant" | "monochrome",
        "brandPersonality": "professional" | "friendly" | "modern" | "classic" | "playful" | "elegant"
      }

      Focus on:
      1. Extracting the actual colors used in the logo
      2. Suggesting harmonious color combinations
      3. Recommending fonts that match the brand personality
      4. Providing web-safe hex codes only

      Return only valid JSON, no additional text.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });

  } catch (error) {
    console.error('Logo analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
