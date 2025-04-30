'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sample CSV data
      const csvData = `Issue Title,Severity,Problem Description,Affected Area
Fragmented Tools,Moderate,Description here,Operational`;

      // Call the API endpoint
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      // Get the image data
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (error) {
      console.error('Error testing API:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <p className="mb-4">Click the button below to test the API endpoint.</p>
      
      <Button 
        onClick={testApi} 
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Test API'}
      </Button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {imageUrl && (
        <div className="mt-4">
          <p className="mb-2 font-semibold">Generated Image:</p>
          <div className="border p-2 bg-white">
            <div className="relative w-full">
              <Image 
                src={imageUrl} 
                alt="Generated table" 
                width={800} 
                height={200} 
                style={{ width: '100%', height: 'auto' }} 
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
