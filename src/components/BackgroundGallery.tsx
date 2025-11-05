import { useState, useEffect } from 'react';

interface BackgroundImage {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  size: number;
  uploadedAt: string;
}

interface BackgroundGalleryProps {
  onSelectBackground: (path: string) => void;
  currentBackground?: string | null;
  onDeleteBackground?: (path: string) => void;
}

export default function BackgroundGallery({ onSelectBackground, currentBackground, onDeleteBackground }: BackgroundGalleryProps) {
  const [backgroundImages, setBackgroundImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        setLoading(true);
        console.log('Fetching background images for user...');
        const response = await fetch('/api/background-images');

        if (response.ok) {
          const data = await response.json();
          console.log('Background images loaded:', data.backgroundImages?.length || 0, 'images');
          setBackgroundImages(data.backgroundImages || []);
        } else if (response.status === 401) {
          setError('Please log in to view your uploaded background images');
        } else {
          setError('Failed to load background images');
        }
      } catch (error) {
        console.error('Error fetching background images:', error);
        setError('Error loading background images');
      } finally {
        setLoading(false);
      }
    };

    fetchBackgroundImages();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">My Background Images</h3>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading background images...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">My Background Images</h3>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">My Background Images</h3>

      {backgroundImages.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">No background images uploaded yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Upload some background images to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {backgroundImages.map((image) => (
            <div
              key={image.id}
              onClick={() => onSelectBackground(image.path)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                currentBackground === image.path
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="aspect-[9/16] bg-gray-100 dark:bg-gray-800">
                <img
                  src={image.path}
                  alt={image.originalName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', image.path);
                    const target = e.target as HTMLImageElement;
                    // Try to use a default placeholder or hide the broken image
                    target.style.display = 'none';
                    // Optionally set a background color instead
                    (target.parentElement as HTMLElement).style.backgroundColor = '#f3f4f6';
                  }}
                />
              </div>

              {/* Delete Button */}
              {onDeleteBackground && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBackground(image.path);
                  }}
                  className="absolute top-2 left-2 z-20 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  title="Delete background image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* Selected indicator */}
              {currentBackground === image.path && (
                <div className="absolute top-1 right-1">
                  <div className="bg-blue-500 rounded-full p-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Image info tooltip - smaller for mobile */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="truncate font-medium text-xs">{image.originalName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
