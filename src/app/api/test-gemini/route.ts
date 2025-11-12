import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Gemini API key not configured',
        message: 'Please set GOOGLE_GEMINI_API_KEY in your .env file'
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    
    // Test models that should work
    const testModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-2.0-flash-exp'
    ];

    const results: any[] = [];
    
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        // Try a simple text generation to test if the model works
        const result = await model.generateContent('Say "test" in one word');
        const response = await result.response;
        const text = response.text();
        results.push({
          model: modelName,
          status: 'success',
          response: text.trim()
        });
        // If one works, return early
        break;
      } catch (error: any) {
        results.push({
          model: modelName,
          status: 'failed',
          error: error.message
        });
      }
    }

    const workingModel = results.find(r => r.status === 'success');
    
    if (workingModel) {
      return NextResponse.json({
        success: true,
        workingModel: workingModel.model,
        message: 'API key is valid and working!',
        allResults: results
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'API key might be invalid or models are not accessible',
        allResults: results,
        troubleshooting: [
          '1. Verify your API key is correct in .env file',
          '2. Enable Gemini API in Google Cloud Console: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
          '3. Check API key permissions and restrictions',
          '4. Visit https://makersuite.google.com/app/apikey to create/verify your API key'
        ]
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to test Gemini API',
      message: error.message
    }, { status: 500 });
  }
}

