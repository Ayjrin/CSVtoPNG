"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [tableHtml, setTableHtml] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tableWidth, setTableWidth] = useState<number>(800);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartXRef = useRef<number>(0);
  const initialWidthRef = useRef<number>(800);

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'iframe-loaded') {
        // The iframe has loaded, now we can capture it
        captureIframe();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Resize handlers for the table width
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    resizeStartXRef.current = e.clientX;
    initialWidthRef.current = tableWidth;
    
    const handleResizeMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartXRef.current;
      const newWidth = Math.max(400, initialWidthRef.current + deltaX); // Minimum width of 400px
      setTableWidth(newWidth);
    };
    
    const handleResizeEnd = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const csvData = formData.get('csvData') as string;
    
    setLoading(true);
    setError(null);

    try {
      // Call the API to get the HTML
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData, tableWidth }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Get the HTML content
      const html = await response.text();
      
      // Set the HTML content in the iframe
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
          setTableHtml(html);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const captureIframe = async () => {
    if (iframeRef.current) {
      try {
        // Use html-to-image to capture the iframe content
        const dataUrl = await toPng(iframeRef.current.contentDocument?.body as HTMLElement, {
          quality: 0.95,
          pixelRatio: 2,
        });
        
        setImageUrl(dataUrl);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
  };

  const downloadImage = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.download = 'table-image.png';
      link.href = imageUrl;
      link.click();
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">API Test Page</h1>
      
      {loading && <div className="mb-4 p-4 bg-blue-100 rounded">Loading...</div>}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Table Width Settings</h2>
        <div className="border p-4 rounded bg-white mb-4">
          <div className="flex items-center mb-4">
            <div className="mr-4">Current width: {tableWidth}px</div>
            <div 
              className="relative flex-1 h-8 bg-gray-100 rounded cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = clickX / rect.width;
                const newWidth = Math.max(400, Math.min(2000, Math.round(percentage * 2000)));
                setTableWidth(newWidth);
              }}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-blue-200 rounded"
                style={{ width: `${(tableWidth / 2000) * 100}%` }}
              ></div>
              <div 
                className="absolute top-0 h-full w-4 cursor-ew-resize"
                style={{ left: `calc(${(tableWidth / 2000) * 100}% - 8px)` }}
                onMouseDown={handleResizeStart}
              >
                <div className="absolute top-0 left-1.5 h-full w-1 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">Drag the slider to adjust table width (400px - 2000px)</div>
        </div>
      </div>

      {tableHtml && !loading && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Generated Table</h2>
          <div className="border p-4 bg-white mb-4">
            <div 
              ref={containerRef} 
              className="relative" 
              style={{ width: `${tableWidth}px`, margin: '0 auto' }}
            >
              <iframe 
                ref={iframeRef} 
                className="w-full h-[500px] border-0" 
                title="Table Preview"
              />
            </div>
          </div>
          
          {imageUrl && (
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Generated Image</h2>
              <div className="border p-4 bg-white mb-4">
                <div style={{ width: `${tableWidth}px`, margin: '0 auto' }}>
                  <img 
                    src={imageUrl} 
                    alt="Generated table" 
                    className="max-w-full h-auto" 
                  />
                </div>
              </div>
              <div className="text-center">
                <Button onClick={downloadImage} className="mr-2">Download PNG</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test the API</h2>
        <form onSubmit={handleSubmit} className="border p-4 rounded">
          <div className="mb-4">
            <label htmlFor="csvData" className="block font-medium mb-1">CSV Data:</label>
            <textarea 
              id="csvData" 
              name="csvData" 
              rows={10} 
              className="w-full p-2 border rounded" 
              placeholder="Paste CSV data here..."
              defaultValue="Name,Age,City\nJohn,30,New York\nJane,25,Los Angeles\nBob,40,Chicago"
            />
          </div>
          <Button type="submit">Generate Table</Button>
        </form>
      </div>
    </div>
  );
}
