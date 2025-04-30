import React, { useState, useRef, useCallback } from 'react';
import { parseCSV } from '@/lib/csv-parser';
import { Textarea } from '@/components/ui/textarea';
// Button component is not used in this file but kept for future use
// import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import Link from 'next/link';

interface FileUploadProps {
  onDataParsed: (csvData: string, parsedData: import('@/lib/csv-parser').ParsedCsvData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [csvText, setCsvText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define processCSV first to avoid 'used before declaration' errors
  const processCSV = useCallback((text: string) => {
    try {
      const parsedData = parseCSV(text);
      onDataParsed(text, parsedData);
    } catch (error) {
      console.error('Error processing CSV:', error);
    }
  }, [onDataParsed]);

  // Wrap readFile in useCallback to avoid dependency issues
  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      processCSV(text);
    };
    reader.readAsText(file);
  }, [setCsvText, processCSV]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  }, [readFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      readFile(file);
    }
  }, [readFile]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
  };

  const handleTextBlur = () => {
    if (csvText.trim()) {
      processCSV(csvText);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center h-32 flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'border-primary/50 bg-primary/5' : 'border-gray-200'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <Upload className="h-8 w-8 text-gray-400 mb-2" />
        <div className="text-sm text-gray-500">
          Drag & drop a CSV file here, or click to select
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
      <div className="space-y-2">
        <Textarea
          className="w-full h-24 text-sm"
          placeholder="Or paste CSV content here..."
          value={csvText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
        />
        <div className="flex justify-end">
          <Link 
            href="/sample.csv" 
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            target="_blank"
          >
            <FileText className="h-3 w-3" />
            Try with sample CSV
          </Link>
        </div>
      </div>
    </div>
  );
};
