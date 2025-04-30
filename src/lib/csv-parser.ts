import Papa from 'papaparse';

export interface ParsedCsvData {
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
}

export function parseCSV(csvData: string): ParsedCsvData {
  try {
    // Parse CSV data
    const result = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    // Check for errors
    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors);
      // Continue with what we have, unless it's catastrophic
      if (result.errors.some(e => e.type === 'Delimiter' || e.type === 'FieldMismatch')) {
        throw new Error('CSV format error: ' + result.errors[0].message);
      }
    }

    // Clean and validate data
    const data = result.data as Record<string, string>[];
    if (!data || data.length === 0) {
      throw new Error('No valid data found in CSV');
    }

    // Extract column headers
    const headers = Object.keys(data[0]);
    if (headers.length === 0) {
      throw new Error('No columns found in CSV');
    }

    // Format data for the table component
    const columns = headers.map((header) => ({
      key: header,
      label: header,
    }));

    // Add a unique key to each row
    const rows = data.map((row, index) => ({
      ...row,
      key: `row-${index}`,
    }));

    return { columns, rows };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return { columns: [], rows: [] };
  }
}
