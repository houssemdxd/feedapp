import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import PreferencesModel from '@/models/Preferences';
import User from '@/models/User';

// Helper function to get current user
async function getCurrentUser() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  const payload = await verifyAccessToken<{ userId: string }>(token);
  if (!payload?.userId) return null;

  return payload.userId;
}

// GET - Load user-specific preferences (create default if none exist)
export async function GET() {
  try {
    await connectDB();

    // Get current user
    const userId = await getCurrentUser();
    console.log('GET /api/preferences - userId:', userId);

    if (!userId) {
      console.error('No valid user session found in GET');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid userId format: ${userId}`);
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    console.log(`Loading preferences for user: ${userId}`);

    // Try to find user's preferences
    let preferences = await PreferencesModel.findOne({ userId });

    if (!preferences) {
      console.log(`No preferences found for user ${userId}, creating default preferences`);

      // Create default preferences for the user
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
        userId,
      });

      console.log(`Created default preferences for user ${userId} with ID: ${preferences._id}`);
    } else {
      console.log(`Found existing preferences for user ${userId} with ID: ${preferences._id}`);
    }

    console.log('Returning preferences:', preferences);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error loading preferences:', error);
    return NextResponse.json(
      { error: 'Failed to load preferences' },
      { status: 500 }
    );
  }
}

// POST - Save user-specific preferences
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get current user
    const userId = await getCurrentUser();
    if (!userId) {
      console.error('No valid user session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.error(`Invalid userId format: ${userId}`);
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log(`Saving preferences for user: ${userId}`, body);

    // Check if user already has an access code
    const existingUser = await User.findById(userId).select('generatedCode');

    // Generate a 6-digit access code only if user doesn't have one
    let accessCode = null;
    if (!existingUser?.generatedCode) {
      const generateAccessCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      // Generate unique 6-digit code
      accessCode = generateAccessCode();
      let codeExists = true;
      let attempts = 0;

      while (codeExists && attempts < 10) {
        const existingCodeUser = await User.findOne({ generatedCode: accessCode });
        if (!existingCodeUser) {
          codeExists = false;
        } else {
          accessCode = generateAccessCode();
          attempts++;
        }
      }

      if (codeExists) {
        console.error('Could not generate unique access code after 10 attempts');
        return NextResponse.json(
          { error: 'Failed to generate unique access code' },
          { status: 500 }
        );
      }

      // Update user with the generated code
      await User.findByIdAndUpdate(userId, {
        generatedCode: accessCode
      });

      console.log(`Generated access code ${accessCode} for user ${userId}`);
    }

    // Check if preferences already exist
    const existingPreferences = await PreferencesModel.findOne({ userId });
    console.log(`Existing preferences found: ${existingPreferences ? 'YES' : 'NO'}`);

    // Update or create user-specific preferences
    const preferences = await PreferencesModel.findOneAndUpdate(
      { userId }, // Find preferences for this specific user
      {
        ...body,
        userId, // Ensure userId is always set
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    console.log(`Preferences ${existingPreferences ? 'updated' : 'created'} for user ${userId} with ID: ${preferences._id}`);

    return NextResponse.json({
      success: true,
      preferences,
      action: existingPreferences ? 'updated' : 'created',
      accessCode, // Return the generated code (null if already existed)
    });
  } catch (error) {
    console.error('Error saving preferences:', error);

    // Handle duplicate key error (shouldn't happen due to unique index, but just in case)
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      console.error('Duplicate key error - preferences already exist for this user');
      return NextResponse.json(
        { error: 'Preferences already exist for this user' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}
