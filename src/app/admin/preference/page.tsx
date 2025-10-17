'use client';

import { useState } from 'react';

interface Preferences {
  logo: File | null;
  name: string;
  description: string;
  backgroundColor: string;
}

export default function AdminPreferencePage() {
  const [preferences, setPreferences] = useState<Preferences>({
    logo: null,
    name: '',
    description: '',
    backgroundColor: '#ffffff',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreferences(prev => ({ ...prev, logo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // TODO: Implement save logic, e.g., API call to backend
    // For now, simulate a save
    setTimeout(() => {
      setMessage('Preferences saved successfully!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Organization Preferences</h1>
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
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Selected: {preferences.logo.name}</p>
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
        <div>
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
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>

        {message && (
          <p className="mt-4 text-green-600 dark:text-green-400">{message}</p>
        )}
      </form>
    </div>
  );
}
