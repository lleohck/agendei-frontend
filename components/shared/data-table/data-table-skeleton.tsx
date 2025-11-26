"use client";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export function DataTableSkeleton({
  columns,
  rows,
}: {
  columns: number;
  rows: number;
}) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}
