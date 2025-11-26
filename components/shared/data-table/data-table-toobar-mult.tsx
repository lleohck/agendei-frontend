"use client";

import { Table } from "@tanstack/react-table";
import { DataTableMultiSelectFilter } from "./data-table-multiselect-filter";

interface FilterConfig {
  columnId: string; // "professional.name", "status", etc.
  label?: string;
}

interface Props<TData> {
  table: Table<TData>;
  filters?: FilterConfig[];
  data: TData[];
}

// caminho aninhado
function getValueByPath(obj: any, path: string) {
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function findColumn(table: Table<any>, columnId: string) {
  return (
    table.getAllColumns().find((c) => c.id === columnId) ||
    table
      .getAllColumns()
      .find((c) => (c.columnDef as any).accessorKey === columnId)
  );
}

export function DataTableToolbar<TData>({
  table,
  filters = [],
  data,
}: Props<TData>) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {filters.map((filter) => {
        const column = findColumn(table, filter.columnId);
        if (!column) return null;

        const options = Array.from(
          new Set(
            data
              .map((row) => getValueByPath(row, filter.columnId))
              .filter(Boolean)
              .map(String)
          )
        );

        return (
          <DataTableMultiSelectFilter
            key={filter.columnId}
            column={column}
            options={options}
            label={filter.label}
          />
        );
      })}
    </div>
  );
}
