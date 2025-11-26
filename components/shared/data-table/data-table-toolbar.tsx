"use client";

import { Table } from "@tanstack/react-table";
import { DataTableSelectFilter } from "./data-table-select-filter";

interface FilterConfig {
  columnId: string; // o "columnId" que você quer filtrar (ex: "professional.name" ou "status")
  label?: string;
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: FilterConfig[];
  data: TData[];
}

/** getValueByPath - pega valores aninhados com path "a.b.c" com segurança */
function getValueByPath(obj: any, path: string) {
  if (!obj || !path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

/** tenta resolver a coluna por id / accessorKey / columnDef.id */
function findColumnByIdOrAccessor<TData>(
  table: Table<TData>,
  columnId: string
) {
  // 1) busca por id exato
  const byId = table.getAllColumns().find((c) => c.id === columnId);
  if (byId) return byId;

  // 2) busca por columnDef.accessorKey (quando a coluna foi criada com accessorKey: 'professional.name')
  const byAccessorKey = table
    .getAllColumns()
    .find((c) => (c.columnDef as any).accessorKey === columnId);
  if (byAccessorKey) return byAccessorKey;

  // 3) busca por columnDef.id (caso o id tenha sido definido manualmente na columnDef)
  const byColumnDefId = table
    .getAllColumns()
    .find((c) => (c.columnDef as any).id === columnId);
  if (byColumnDefId) return byColumnDefId;

  // 4) fallback: tenta encontrar coluna cuja accessorKey termine com o columnId (opcional)
  const byAccessorEndsWith = table.getAllColumns().find((c) => {
    const accessor = (c.columnDef as any).accessorKey;
    return typeof accessor === "string" && accessor.endsWith(columnId);
  });
  if (byAccessorEndsWith) return byAccessorEndsWith;

  // não encontrou
  return undefined;
}

export function DataTableToolbar<TData>({
  table,
  filters = [],
  data,
}: DataTableToolbarProps<TData>) {
  if (!filters?.length) return null;

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {filters.map((filter) => {
        const column = findColumnByIdOrAccessor(
          table,
          filter.columnId as string
        );
        if (!column) {
          // Se a coluna não existir, apenas ignora o filtro (evita crash).
          // Também é útil para debug em dev.
          // console.warn(`Coluna de filtro não encontrada: ${filter.columnId}`);
          return null;
        }

        // Extrai valores únicos do "data" usando getValueByPath
        const uniqueValues = Array.from(
          new Set(
            data
              .map((row: any) => getValueByPath(row, filter.columnId))
              .filter((v) => v !== undefined && v !== null)
              .map((v) => String(v))
          )
        );

        return (
          <DataTableSelectFilter
            key={filter.columnId}
            column={column}
            label={filter.label}
            options={uniqueValues}
          />
        );
      })}
    </div>
  );
}
