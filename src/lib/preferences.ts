export interface Preferences {
  // Basic organization info
  logo: string | null;
  name: string;
  description: string;

  // Background styling
  backgroundColor: string;
  backgroundImage?: string | null;

  // App bar styling
  appBarBackgroundColor: string;
  organizationNameColor: string;

  // Content styling
  descriptionColor: string;
  formTitleColor: string;

  // Form styling
  formItemBackgroundColor: string;
  formItemTextColor: string;

  // Effects
  liquidGlassEffect: boolean;

  // Template selection
  selectedTemplate?: number;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}
