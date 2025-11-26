"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableSelectFilterProps<TData> {
  column: any;
  label?: string;
  options: string[];
}

export function DataTableSelectFilter<TData>({
  column,
  label,
  options,
}: DataTableSelectFilterProps<TData>) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm text-muted-foreground">{label}</span>}

      <Select
        value={(column.getFilterValue() as string) ?? ""}
        onValueChange={(value) =>
          column.setFilterValue(value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecionar..." />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>

          {options.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
