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
  const tableRef = useRef<HTMLDivElement | null>(null);

  const handleDataParsed = (csvText: string, data: ParsedCsvData) => {
    setCsvData(csvText);
    setParsedData(data);
    setImageUrl(null); // Reset image when new data is loaded
  };

  const generateImage = async () => {
    if (tableRef.current && parsedData.columns.length > 0) {
      try {
        const dataUrl = await toPng(tableRef.current, { 
          quality: 0.95,
          pixelRatio: 2, // Higher resolution
          style: {
            // Ensure the table is fully visible
            maxWidth: 'none',
            width: 'auto',
            height: 'auto'
          },
          // Add a slight crop to remove rounded corners
          canvasWidth: tableRef.current.offsetWidth - 2,
          canvasHeight: tableRef.current.offsetHeight - 2,
          backgroundColor: 'white'
        });
        setImageUrl(dataUrl);
      } catch (error) {
        console.error('Error generating image:', error);
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
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">CSV to Table Image Generator</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - File upload */}
          <div className="w-full md:w-1/3">
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
          <div className="w-full md:w-2/3">
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
                {parsedData.columns.length > 0 && (
                  <div className="flex space-x-2">
                    {!imageUrl && (
                      <Button
                        onClick={generateImage}
                        variant="default"
                      >
                        Generate Image
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
                )}
              </CardHeader>
              <CardContent className="overflow-visible p-4">
                {imageUrl ? (
                  <div className="border p-2 bg-white">
                    <div className="relative w-full">
                      <Image 
                        src={imageUrl} 
                        alt="Generated table" 
                        width={800} 
                        height={600} 
                        style={{ width: '100%', height: 'auto' }} 
                        unoptimized // Important for data URLs
                      />
                    </div>
                  </div>
                ) : (
                  <div className="overflow-visible">
                    <TableComponent data={parsedData} tableRef={tableRef} />
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
