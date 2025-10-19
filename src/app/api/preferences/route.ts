import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PreferencesModel from '@/models/Preferences';

// GET - Load preferences (create default if none exist)
export async function GET() {
  try {
    await connectDB();

    // For now, get the first preferences document or create a default one
    let preferences = await PreferencesModel.findOne();

    if (!preferences) {
      // Create default preferences
      preferences = await PreferencesModel.create({
        name: 'Organization Name',
        description: 'Welcome to Our Organization, Feel free to give your feedback. Your Opinion Matters!',
        backgroundColor: '#f3f4f6',
        appBarBackgroundColor: '#f9fafb',
        organizationNameColor: '#1f2937',
        descriptionColor: '#374151',
        formItemBackgroundColor: '#ffffff',
        formItemTextColor: '#1f2937',
        formTitleColor: '#1f2937',
        liquidGlassEffect: false,
        selectedTemplate: 0,
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

// POST - Save preferences
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Update or create preferences
    const preferences = await PreferencesModel.findOneAndUpdate(
      {}, // Find first document
      {
        ...body,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
