import React from 'react';
import { ParsedCsvData } from '@/lib/csv-parser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableComponentProps {
  data: ParsedCsvData;
  tableRef: React.RefObject<HTMLDivElement | null>;
}

export const TableComponent: React.FC<TableComponentProps> = ({ data, tableRef }) => {
  const { columns, rows } = data;

  if (columns.length === 0 || rows.length === 0) {
    return (
      <div ref={tableRef} className="bg-white p-6 rounded-lg text-center text-muted-foreground flex items-center justify-center h-48">
        <p>No valid data to display. Upload a CSV file or paste CSV content to get started.</p>
      </div>
    );
  }

  return (
    <div ref={tableRef} className="bg-white border">
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead key={column.key} className="font-medium whitespace-nowrap">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                {columns.map((column) => (
                  <TableCell key={`${row.key}-${column.key}`} className="break-words">
                    {row[column.key] || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
