import { ColumnDef } from "@tanstack/react-table"

export type EnvironmentVariable = {
  name: string,
  value: string,
}

export const columns: ColumnDef<EnvironmentVariable>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
]
