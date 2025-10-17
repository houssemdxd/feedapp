'use client';

import { useState, useEffect } from 'react';

interface Preferences {
  logo: string | null;
  name: string;
  description: string;
  backgroundColor: string;
}

export default function AdminPreviewPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    logo: '/images/user/owner.jpg',
    name: 'ESPRIT',
    description: 'Welcome to ESPRIT, Feel free to give your feedback. Your Opinion Matters!',
    backgroundColor: '#f3f4f6',
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [appBarBackgroundColor, setAppBarBackgroundColor] = useState('#f9fafb');
  const [organizationNameColor, setOrganizationNameColor] = useState('#1f2937');
  const [descriptionColor, setDescriptionColor] = useState('#374151');
  const [formItemBackgroundColor, setFormItemBackgroundColor] = useState('#ffffff');
  const [formItemTextColor, setFormItemTextColor] = useState('#1f2937');
  const [formTitleColor, setFormTitleColor] = useState('#1f2937');
  const [palettePosition, setPalettePosition] = useState({ top: 0, left: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  const [tempColor, setTempColor] = useState('');

  const handleElementClick = (element: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPalettePosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    setSelectedElement(element);
    setTempColor(
      element === 'appBar' ? appBarBackgroundColor :
      element === 'background' ? preferences.backgroundColor :
      element === 'formItem' ? formItemBackgroundColor :
      element === 'orgName' ? organizationNameColor :
      element === 'description' ? descriptionColor :
      element === 'formTitle' ? formTitleColor :
      formItemTextColor
    );
  };

  const handleTempColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColor(e.target.value);
  };

  const applyColorChange = () => {
    if (selectedElement && tempColor) {
      switch (selectedElement) {
        case 'appBar':
          setAppBarBackgroundColor(tempColor);
          break;
        case 'background':
          setPreferences(prev => ({ ...prev, backgroundColor: tempColor }));
          setSelectedTemplate(-1);
          break;
        case 'formItem':
          setFormItemBackgroundColor(tempColor);
          break;
        case 'orgName':
          setOrganizationNameColor(tempColor);
          break;
        case 'description':
          setDescriptionColor(tempColor);
          break;
        case 'formTitle':
          setFormTitleColor(tempColor);
          break;
        case 'formItemText':
          setFormItemTextColor(tempColor);
          break;
      }
    }
    setSelectedElement(null);
  };

  const templates = [
    { backgroundColor: '#f3f4f6', backgroundImage: '/images/preview-template/back01.jpg' },
    { backgroundColor: '#fef3c7', backgroundImage: '/images/preview-template/back02.jpg' },
    { backgroundColor: '#dbeafe', backgroundImage: '/images/preview-template/back03.jpg' },
    { backgroundColor: '#dbeafe', backgroundImage: '/images/preview-template/back04.jpg' },
    { backgroundColor: '#dbeafe', backgroundImage: '/images/preview-template/back05.jpg' },
    { backgroundColor: '#ffffff', backgroundImage: null },
  ];

  const applyTemplate = (index: number) => {
    setSelectedTemplate(index);
    setPreferences(prev => ({ ...prev, backgroundColor: templates[index].backgroundColor }));
    setBackgroundImage(templates[index].backgroundImage);
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setPreferences(prev => ({ ...prev, backgroundColor: color }));
    setSelectedTemplate(-1); // Deselect template when custom color is chosen
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBackgroundImage(url);
      setSelectedTemplate(-1); // Deselect template when custom image is chosen
    }
  };

  const handleAppBarBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAppBarBackgroundColor(e.target.value);
  };

  const handleOrganizationNameColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrganizationNameColor(e.target.value);
  };

  const handleDescriptionColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionColor(e.target.value);
  };

  const handleFormItemBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormItemBackgroundColor(e.target.value);
  };

  const handleFormTitleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormTitleColor(e.target.value);
  };

  const handleFormItemTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormItemTextColor(e.target.value);
  };

  const handleElementColorChange = (color: string) => {
    if (selectedElement) {
      switch (selectedElement) {
        case 'orgName':
          setOrganizationNameColor(color);
          break;
        case 'description':
          setDescriptionColor(color);
          break;
        case 'formTitle':
          setFormTitleColor(color);
          break;
        case 'formItemText':
          setFormItemTextColor(color);
          break;
      }
    }
    setSelectedElement(null);
  };

  // TODO: Fetch preferences from API or database
  useEffect(() => {
    // Example: Fetch from /api/preferences
    // const fetchPreferences = async () => {
    //   const res = await fetch('/api/preferences');
    //   const data = await res.json();
    //   setPreferences(data);
    // };
    // fetchPreferences();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6">
        {/* Preview */}
        <div className="w-full md:w-2/3 flex justify-center">
          {/* iPhone Frame */}
          <div className="relative bg-black rounded-[3rem] p-1 shadow-2xl" style={{ width: '280px', height: '580px' }}>
            {/* Dynamic Island with Camera */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full flex items-center justify-between px-2">
              {/* Camera Module */}
              <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
              </div>
              {/* Sensors */}
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            {/* Screen */}
            <div
              className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden cursor-pointer relative"
              style={{
                backgroundColor: backgroundImage ? 'transparent' : preferences.backgroundColor,
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              onClick={(e) => handleElementClick('background', e)}
            >
              {/* Content */}
              <div className="h-full flex flex-col">
                {/* App Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer" style={{ backgroundColor: appBarBackgroundColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('appBar', e); }}>
                  <h1 className="text-lg font-bold cursor-pointer" style={{ color: organizationNameColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('orgName', e); }}>
                    {preferences.name}
                  </h1>
                  {preferences.logo && (
                    <img src={preferences.logo} alt="Logo" className="w-8 h-8 ml-3" />
                  )}
                </div>
                {/* Description and Forms Container */}
                <div className="flex-grow flex flex-col p-4">
                  {/* Description */}
                  <p className="text-sm mb-4 cursor-pointer" style={{ color: descriptionColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('description', e); }}>
                    {preferences.description}
                  </p>
                  {/* List of Forms */}
                  <div>
                    <h2 className="text-md font-semibold mb-2 cursor-pointer" style={{ color: formTitleColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('formTitle', e); }}>Forms</h2>
                    <ul className="space-y-2">
                      <li className="p-3 rounded-lg shadow text-gray-900 dark:text-white cursor-pointer" style={{ backgroundColor: formItemBackgroundColor, color: formItemTextColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('formItem', e); }}>
                        <span onClick={(e) => { e.stopPropagation(); handleElementClick('formItemText', e); }}>Form 1</span>
                      </li>
                      <li className="p-3 rounded-lg shadow text-gray-900 dark:text-white cursor-pointer" style={{ backgroundColor: formItemBackgroundColor, color: formItemTextColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('formItem', e); }}>
                        <span onClick={(e) => { e.stopPropagation(); handleElementClick('formItemText', e); }}>Form 2</span>
                      </li>
                      <li className="p-3 rounded-lg shadow text-gray-900 dark:text-white cursor-pointer" style={{ backgroundColor: formItemBackgroundColor, color: formItemTextColor }} onClick={(e) => { e.stopPropagation(); handleElementClick('formItem', e); }}>
                        <span onClick={(e) => { e.stopPropagation(); handleElementClick('formItemText', e); }}>Form 3</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full"></div>
            {/* Side Buttons */}
            {/* Volume Up */}
            <div className="absolute -left-1 top-24 w-1 h-6 bg-gray-600 rounded-l"></div>
            {/* Volume Down */}
            <div className="absolute -left-1 top-32 w-1 h-6 bg-gray-600 rounded-l"></div>
            {/* Power Button */}
            <div className="absolute -right-1 top-28 w-1 h-8 bg-gray-600 rounded-r"></div>
          </div>
        </div>
        {/* Controls */}
        <div className="w-full md:w-1/3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Customize Preview</h2>
          {/* Background Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Background Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageChange}
              className="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700"
            />
            {backgroundImage && (
              <img src={backgroundImage} alt="Selected Background" className="mt-2 w-16 h-16 object-cover rounded" />
            )}
          </div>
          {/* Template Options */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Template Options</label>
            <div className="flex flex-wrap gap-2">
              {templates.map((template, index) => (
                <div
                  key={index}
                  onClick={() => applyTemplate(index)}
                  className={`w-20 h-28 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedTemplate === index ? 'border-blue-500 shadow-lg' : 'border-gray-300'}`}
                  style={{
                    backgroundColor: template.backgroundColor,
                    backgroundImage: template.backgroundImage ? `url(${template.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Small App Bar */}
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-t-xl flex items-center justify-between px-1">
                    <div className="w-8 h-2 bg-gray-300 rounded"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  </div>
                  {/* Small Content */}
                  <div className="h-18 p-1 flex flex-col justify-between">
                    <div className="h-2 bg-white dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-2 bg-white dark:bg-gray-700 rounded mb-1"></div>
                    <div className="h-2 bg-white dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Color Picker Tooltip */}
      {selectedElement && (
        <div className="absolute bg-white dark:bg-gray-800 border border-gray-300 rounded-lg shadow-lg p-4 z-50" style={{ top: palettePosition.top, left: palettePosition.left }}>
          <input
            type="color"
            value={tempColor}
            onChange={handleTempColorChange}
            className="w-full h-10 border border-gray-300 rounded"
            autoFocus
          />
          <div className="mt-2 flex space-x-2">
            <button
              onClick={applyColorChange}
              className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedElement(null)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-1 px-2 rounded text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
        This is a preview of how the preferences will appear on mobile devices.
      </p>
    </div>
  );
}