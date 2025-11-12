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
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GOOGLE_GEMINI_API_KEY in your .env file. Get your API key from https://makersuite.google.com/app/apikey'
      }, { status: 500 });
    }

    // Verify API key format (starts with AIza)
    if (!process.env.GOOGLE_GEMINI_API_KEY.startsWith('AIza')) {
      console.warn('API key format might be incorrect. Gemini API keys typically start with "AIza"');
    }

    // Read the logo file
    const fullPath = join(process.cwd(), 'public', logoPath);
    const imageBuffer = await readFile(fullPath);

    // Convert to base64 for Gemini API
    const base64Image = imageBuffer.toString('base64');
    const mimeType = logoPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    // Try to list available models first (if API supports it)
    let availableModels: string[] = [];
    try {
      // Note: The SDK might not expose listModels directly, so we'll try models in order
      console.log('Attempting to use Gemini models...');
    } catch (error) {
      console.log('Could not list models, will try direct model access');
    }

    // Try multiple model names as fallbacks (vision-capable models)
    // Updated to include latest model names and variations
    let model;
    let selectedModelName = '';
    // Try different model name formats - prioritize newer models first
    const modelNames = [
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking-exp-001',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-pro-vision',
      'gemini-pro'
    ];

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

    // Try each model until one works
    let lastError: any = null;
    for (const modelName of modelNames) {
      try {
        model = genAI.getGenerativeModel({ model: modelName });
        selectedModelName = modelName;
        console.log(`Trying Gemini model: ${modelName}`);
        
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Try to parse the JSON response
        let analysisResult;
        try {
          analysisResult = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse Gemini response:', text);
          // If parsing fails, extract JSON from the response text
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON found in response');
          }
        }

        console.log(`Successfully analyzed logo with ${modelName}`);
        return NextResponse.json({
          success: true,
          analysis: analysisResult,
        });
      } catch (error: any) {
        console.log(`Model ${modelName} failed:`, error.message);
        lastError = error;
        // Continue to next model
        continue;
      }
    }
    
    // If all models failed, use fallback with helpful error message
    console.log('All Gemini models failed, using fallback color generation');
    console.log('Last error:', lastError?.message);
    
    const errorMessage = lastError?.message || 'All models failed';
    const is404Error = errorMessage.includes('404') || errorMessage.includes('not found');
    
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
      fallback: true,
      error: errorMessage,
      troubleshooting: is404Error ? {
        message: 'Gemini API models not found. This usually means:',
        steps: [
          '1. Verify your API key is valid and has access to Gemini API',
          '2. Enable the Gemini API in Google Cloud Console',
          '3. Check that your API key has the necessary permissions',
          '4. Visit https://ai.google.dev/gemini-api/docs/models to see available models',
          '5. You may need to create a new API key or enable billing for some models'
        ]
      } : undefined
    });

  } catch (error) {
    console.error('Logo analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
