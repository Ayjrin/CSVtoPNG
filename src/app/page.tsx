'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FileUpload } from '@/components/FileUpload';
import { TableComponent } from '@/components/TableComponent';
import { ParsedCsvData } from '@/lib/csv-parser';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  // We need to keep track of the CSV data for API calls
  const [, setCsvData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedCsvData>({ columns: [], rows: [] });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tableWidth, setTableWidth] = useState<number>(800); // Default width
  const [error, setError] = useState<string | null>(null); // Add error state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Add loading state
  const tableRef = useRef<HTMLDivElement | null>(null);
  const resizeStartXRef = useRef<number>(0);
  const initialWidthRef = useRef<number>(800);

  const handleDataParsed = (csvText: string, data: ParsedCsvData) => {
    setCsvData(csvText);
    setParsedData(data);
    setImageUrl(null); // Reset image when new data is loaded
  };

  const generateImage = async () => {
    if (tableRef.current && parsedData.columns.length > 0) {
      setIsLoading(true);
      setError(null);
      
      console.log('Generating image...');
      console.log('Table ref exists:', !!tableRef.current);
      console.log('Table dimensions:', {
        offsetWidth: tableRef.current.offsetWidth,
        offsetHeight: tableRef.current.offsetHeight,
        clientWidth: tableRef.current.clientWidth,
        clientHeight: tableRef.current.clientHeight,
        scrollWidth: tableRef.current.scrollWidth,
        scrollHeight: tableRef.current.scrollHeight
      });
      console.log('Current table width setting:', tableWidth);
      
      try {
        // First, set the width of the table element
        if (tableRef.current) {
          console.log('Setting table width to:', `${tableWidth}px`);
          tableRef.current.style.width = `${tableWidth}px`;
          console.log('Table width after setting:', tableRef.current.style.width);
        }
        
        // Then generate the image
        console.log('Calling toPng with options:', {
          quality: 0.95,
          pixelRatio: 2,
          canvasWidth: tableWidth,
          canvasHeight: tableRef.current.offsetHeight
        });
        
        const dataUrl = await toPng(tableRef.current, { 
          quality: 0.95,
          pixelRatio: 2, // Higher resolution
          style: {
            // Ensure the table is fully visible
            maxWidth: 'none',
            width: `${tableWidth}px`, // Use the current table width
            height: 'auto'
          },
          canvasWidth: tableWidth,
          canvasHeight: tableRef.current.offsetHeight,
          backgroundColor: 'white'
        });
        
        console.log('Image generated successfully, data URL length:', dataUrl.length);
        setImageUrl(dataUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating image:', error);
        setError(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    } else {
      console.warn('Cannot generate image: table reference or data is missing', {
        tableRefExists: !!tableRef.current,
        columnsLength: parsedData.columns.length
      });
      setError('Cannot generate image: table reference or data is missing');
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

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">CSV to Table Image Generator</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - File upload (pinned) */}
          <div className="w-full md:w-72 md:sticky md:top-8 md:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV</CardTitle>
                <CardDescription>Upload a CSV file or paste CSV content</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onDataParsed={handleDataParsed} />
              </CardContent>
            </Card>
          </div>
          
          {/* Right side - Table preview and image generation */}
          <div className="w-full flex-1">
            <Card className="overflow-visible">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Table Preview</CardTitle>
                  <CardDescription>
                    {parsedData.columns.length > 0 
                      ? `${parsedData.rows.length} rows, ${parsedData.columns.length} columns` 
                      : 'No data loaded yet'}
                  </CardDescription>
                </div>
                <div className="flex space-x-2 items-center">
                  {parsedData.columns.length > 0 && !imageUrl && (
                    <Button
                      onClick={generateImage}
                      variant="default"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Generating...' : 'Generate Image'}
                    </Button>
                  )}
                  {imageUrl && (
                    <Button
                      onClick={downloadImage}
                      variant="secondary"
                    >
                      Download PNG
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              {/* Error message display */}
              {error && (
                <div className="px-6 py-2 mb-2 bg-red-50 border border-red-200 text-red-700 rounded">
                  <p className="text-sm font-medium">Error: {error}</p>
                </div>
              )}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="px-6 py-2 mb-2 bg-blue-50 border border-blue-200 text-blue-700 rounded flex items-center">
                  <div className="mr-2 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <p className="text-sm font-medium">Generating image...</p>
                </div>
              )}
              <CardContent className="overflow-visible p-4">
                {imageUrl ? (
                  <div className="border p-2 bg-white">
                    <div className="relative w-full">
                      <Image 
                        src={imageUrl} 
                        alt="Generated table" 
                        width={tableWidth} 
                        height={600} 
                        style={{ width: '100%', height: 'auto' }} 
                        unoptimized // Important for data URLs
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Resizable table container */}
                    <div className="relative" style={{ width: `${tableWidth}px` }}>
                      <div className="overflow-visible">
                        <TableComponent data={parsedData} tableRef={tableRef} />
                      </div>
                      
                      {/* Resize handle */}
                      {parsedData.columns.length > 0 && (
                        <div 
                          className="absolute top-0 right-0 h-full w-4 cursor-ew-resize bg-transparent hover:bg-blue-200 hover:bg-opacity-50 transition-colors"
                          onMouseDown={handleResizeStart}
                          title="Drag to resize table width"
                        >
                          <div className="absolute top-1/2 right-1.5 transform -translate-y-1/2 h-8 w-1 bg-gray-300 rounded"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Width indicator */}
                    {parsedData.columns.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500 text-right">
                        Table width: {tableWidth}px (drag right edge to resize)
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
