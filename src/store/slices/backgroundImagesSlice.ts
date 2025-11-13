import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface BackgroundImage {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  uploadedAt: string;
}

interface BackgroundImagesState {
  images: BackgroundImage[];
  loading: boolean;
  error: string | null;
}

const initialState: BackgroundImagesState = {
  images: [],
  loading: false,
  error: null,
};

// Async thunk to fetch background images
export const fetchBackgroundImages = createAsyncThunk(
  'backgroundImages/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/background-images');
      if (!response.ok) {
        if (response.status === 401) {
          return rejectWithValue('Unauthorized');
        }
        return rejectWithValue('Failed to fetch background images');
      }
      const data = await response.json();
      return data.backgroundImages || [];
    } catch (error) {
      return rejectWithValue('Error fetching background images');
    }
  }
);

// Async thunk to add background image
export const addBackgroundImage = createAsyncThunk(
  'backgroundImages/add',
  async (image: BackgroundImage, { rejectWithValue }) => {
    try {
      // The image is already uploaded via the API, just add it to state
      return image;
    } catch (error) {
      return rejectWithValue('Error adding background image');
    }
  }
);

// Delete by path (for use from components that have the path)
export const deleteBackgroundImageByPath = createAsyncThunk(
  'backgroundImages/deleteByPath',
  async (path: string, { rejectWithValue }) => {
    try {
      const deleteResponse = await fetch(
        `/api/background-images?path=${encodeURIComponent(path)}`,
        { method: 'DELETE' }
      );

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        return rejectWithValue(errorData.error || 'Failed to delete image');
      }

      return path;
    } catch (error) {
      return rejectWithValue('Error deleting background image');
    }
  }
);

const backgroundImagesSlice = createSlice({
  name: 'backgroundImages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch background images
    builder
      .addCase(fetchBackgroundImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBackgroundImages.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
        state.error = null;
      })
      .addCase(fetchBackgroundImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add background image
    builder
      .addCase(addBackgroundImage.fulfilled, (state, action) => {
        // Add the new image at the beginning of the array
        state.images.unshift(action.payload);
      })
      .addCase(addBackgroundImage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete background image by path
    builder
      .addCase(deleteBackgroundImageByPath.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBackgroundImageByPath.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter((img) => img.path !== action.payload);
        state.error = null;
      })
      .addCase(deleteBackgroundImageByPath.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = backgroundImagesSlice.actions;
export default backgroundImagesSlice.reducer;

