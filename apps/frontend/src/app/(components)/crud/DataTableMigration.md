# DataTable CRUD Migration Guide

This document explains how to migrate existing CRUD implementations to use the new DataTable-based approach.

## Overview

The CRUD module has been updated to use the DataTable component for a more consistent and feature-rich UI experience. This approach provides:

- Better alignment with UNA-GC design patterns
- Built-in pagination 
- Search functionality
- Responsive column layouts
- Improved action handling

## Key Changes

1. The `renderItem` function is now optional (for backward compatibility)
2. A new `renderColumns` function is introduced to define table columns
3. The `ColumnUtilities` type provides utilities for handling row actions

## Migration Steps

### 1. Update imports

Make sure to import the required types and components:

```tsx
import { ColumnDef } from '@tanstack/react-table'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2,
  // other icons as needed
} from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  // other UI components as needed
} from '@una-gc/ui/components'
```

### 2. Implement `renderColumns`

Replace your `renderItem` implementation with `renderColumns`:

```tsx
const renderColumns = (utils: ColumnUtilities<MyEntityType>): ColumnDef<MyEntityType>[] => [
  {
    accessorKey: 'name',
    header: 'Nombre',
    size: 200,
  },
  {
    accessorKey: 'description',
    header: 'Descripción',
    size: 300,
    cell: ({ row }) => (
      <div className="truncate max-w-md">
        {row.original.description || 'Sin descripción'}
      </div>
    )
  },
  {
    id: 'actions',
    header: () => <div className="text-right">Acciones</div>,
    size: 80,
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                utils.onEdit(row.original.id)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                utils.onDelete(row.original.id)
              }}
              className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
              disabled={utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id}
            >
              {utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }
]
```

### 3. Add the optional search placeholder

```tsx
const crudConfig = {
  // ...existing config
  searchPlaceholder: 'Buscar por nombre, descripción...',
  renderColumns,
  // Keep renderItem for backward compatibility if needed
  renderItem: /* your existing renderItem implementation */
}
```

## Example

For a complete example, see the implementation in:
`/modules/academic-management/academic-load/components/academic-load-page.datatable.tsx`

## Tips

1. Use the `cell` property to customize cell rendering
2. Group related columns visually with icons or styling
3. Set appropriate column widths with `size` property
4. Use `truncate` and other Tailwind classes for text overflow
5. Take advantage of dropdown menus for actions
6. Consider using badges for status indicators

## Advanced Features

The DataTable component supports:
- Click handling on rows (`onRowClick`)
- Custom column sizing and alignment
- Empty state handling
- Loading state indicators

For more information on customizing the DataTable, refer to the component documentation.
