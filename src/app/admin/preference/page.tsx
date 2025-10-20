'use client';

import { useState, useEffect } from 'react';
import { Preferences } from '@/lib/preferences';
//ajbouni
//use serer 

export default function AdminPreferencePage() {
  const [preferences, setPreferences] = useState<Preferences>({
    logo: null,
    name: '',
    description: '',
    backgroundColor: '#ffffff',
    backgroundImage: null,
    appBarBackgroundColor: '#f9fafb',
    organizationNameColor: '#1f2937',
    descriptionColor: '#374151',
    formItemBackgroundColor: '#ffffff',
    formItemTextColor: '#1f2937',
    formTitleColor: '#1f2937',
    liquidGlassEffect: false,
    selectedTemplate: 0,
  });
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load existing preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          console.log('User not authenticated');
          setIsAuthenticated(false);
        } else {
          console.error('Failed to load preferences:', response.statusText);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setIsAuthenticated(false);
      }
    };

    const fetchAccessCode = async () => {
      try {
        const userResponse = await fetch('/api/user/access-code');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.generatedCode) {
            console.log('Found existing access code:', userData.generatedCode);
            setAccessCode(userData.generatedCode);
          }
        }
      } catch (error) {
        console.error('Error fetching access code:', error);
      }
    };

    // Fetch both preferences and access code
    Promise.all([fetchPreferences(), fetchAccessCode()]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      try {
        // Upload the file
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload/logo', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResponse.ok && uploadResult.success) {
          // Update the logo field with the returned path
          setPreferences(prev => ({ ...prev, logo: uploadResult.path }));
          setMessage(`Logo uploaded successfully!`);
        } else {
          setMessage(`Failed to upload logo: ${uploadResult.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setMessage('Error uploading logo');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setMessage('You must be logged in to save preferences');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Logo is already handled as a string in the preferences state
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const result = await response.json();

      if (response.ok) {
        const action = result.action || 'saved';

        // If an access code was generated, display it
        if (result.accessCode) {
          setAccessCode(result.accessCode);
          setMessage(`Preferences ${action} successfully!\n\n🔑 Your Access Code: ${result.accessCode}\n\nKeep this code safe - you'll need it to access your organization!`);
        } else {
          setMessage(`Preferences ${action} successfully!`);
        }
      } else {
        setMessage(`Failed to save preferences: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Error saving preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Preferences</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo Upload */}
        <div>
          <label htmlFor="logo" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Logo
          </label>
          <input
            type="file"
            id="logo"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700"
          />
          {preferences.logo && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Current logo:
              </p>
              <img
                src={preferences.logo}
                alt="Logo preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Organization Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={preferences.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            placeholder="Enter organization name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={preferences.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            placeholder="Enter description"
          />
        </div>

        {/* Background Color */}
        {/* <div>
          <label htmlFor="backgroundColor" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
            Background Color
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id="backgroundColor"
              name="backgroundColor"
              value={preferences.backgroundColor}
              onChange={handleInputChange}
              className="h-10 w-16 border border-gray-300 rounded"
            />
            <input
              type="text"
              value={preferences.backgroundColor}
              onChange={handleInputChange}
              name="backgroundColor"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="#ffffff"
            />
          </div>
        </div> */}

        {/* Access Code Display */}
        {accessCode && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">🔑 Access Code</h3>
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100 tracking-wider">
                  {accessCode}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Use this code to access your organization
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(accessCode);
                  setMessage('Access code copied to clipboard!');
                }}
                className="flex-shrink-0 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isAuthenticated}
          className={`w-full py-2 px-4 rounded-lg ${
            isAuthenticated
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>

        {message && (
          <p className={`mt-4 ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
