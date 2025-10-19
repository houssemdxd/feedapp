import { Schema, model, models, type Model, type Types } from "mongoose";
import { Preferences } from "@/lib/preferences";

export interface IPreferences extends Omit<Preferences, 'createdAt' | 'updatedAt'> {
  _id?: Types.ObjectId;
  userId: Types.ObjectId; // Required: link to specific user
  createdAt?: Date;
  updatedAt?: Date;
}

const PreferencesSchema = new Schema<IPreferences>(
  {
    // Basic organization info
    logo: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // Background styling
    backgroundColor: { type: String, default: '#f3f4f6' },
    backgroundImage: { type: String, default: null },

    // App bar styling
    appBarBackgroundColor: { type: String, default: '#f9fafb' },
    organizationNameColor: { type: String, default: '#1f2937' },

    // Content styling
    descriptionColor: { type: String, default: '#374151' },
    formTitleColor: { type: String, default: '#1f2937' },

    // Form styling
    formItemBackgroundColor: { type: String, default: '#ffffff' },
    formItemTextColor: { type: String, default: '#1f2937' },

    // Effects
    liquidGlassEffect: { type: Boolean, default: false },

    // Template selection
    selectedTemplate: { type: Number, default: 0 },

    // User association (required for user-specific preferences)
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Create compound index to ensure one preferences document per user
PreferencesSchema.index({ userId: 1 }, { unique: true });

const PreferencesModel: Model<IPreferences> = models.Preferences || model<IPreferences>("Preferences", PreferencesSchema);
export default PreferencesModel;
