'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [tableHtml, setTableHtml] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'TABLE_HTML_READY') {
        // Once we have the HTML, we can generate an image from it
        generateImageFromIframe();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setImageUrl(null);
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

      // Get the HTML content
      const html = await response.text();
      setTableHtml(html);
    } catch (error) {
      console.error('Error testing API:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  };

  const generateImageFromIframe = async () => {
    try {
      if (iframeRef.current && iframeRef.current.contentDocument?.body) {
        const tableElement = iframeRef.current.contentDocument.querySelector('.table-container');
        if (tableElement) {
          const dataUrl = await toPng(tableElement as HTMLElement, { 
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: 'white'
          });
          setImageUrl(dataUrl);
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
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

      {tableHtml && (
        <div className="mt-4 hidden">
          <iframe 
            ref={iframeRef}
            srcDoc={tableHtml}
            width="100%"
            height="400"
            style={{ border: 'none' }}
            title="Table Preview"
          />
        </div>
      )}
      
      {imageUrl && (
        <div className="mt-4">
          <p className="mb-2 font-semibold">Generated Image:</p>
          <div className="border p-2 bg-white">
            <img 
              src={imageUrl} 
              alt="Generated table" 
              className="w-full" 
            />
          </div>
          <div className="mt-4">
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.download = 'table-image.png';
                link.href = imageUrl;
                link.click();
              }}
            >
              Download PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
