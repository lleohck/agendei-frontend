"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableVirtualizedProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  rowHeight?: number;
  height?: number;
  onEndReached?: () => void; // ← dispara quando chega ao final
}

export function DataTableVirtualized<TData>({
  columns,
  data,
  rowHeight = 52,
  height = 600,
  onEndReached,
}: DataTableVirtualizedProps<TData>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  // FIRE load more when scrolled to bottom
  if (onEndReached) {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
    if (lastItem && lastItem.index >= data.length - 5) {
      onEndReached();
    }
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length
    ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
    : 0;

  return (
    <div ref={parentRef} className="relative overflow-auto" style={{ height }}>
      <Table className="table-fixed w-full">
        <TableHeader className="sticky top-0 bg-white z-20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="whitespace-nowrap">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {paddingTop > 0 && (
            <TableRow>
              <TableCell style={{ height: `${paddingTop}px` }} />
            </TableRow>
          )}

          {virtualRows.map((virtualRow) => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <TableRow key={row.id} style={{ height: rowHeight }}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}

          {paddingBottom > 0 && (
            <TableRow>
              <TableCell style={{ height: `${paddingBottom}px` }} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
