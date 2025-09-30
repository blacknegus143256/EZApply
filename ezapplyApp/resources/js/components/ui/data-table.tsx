import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent, CardHeader } from './card'
import { Skeleton } from './skeleton'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  title: string
  dataIndex: string
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  emptyMessage?: string
  className?: string
  rowKey?: string
  onRowClick?: (record: T, index: number) => void
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (selectedRows: T[]) => void
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  emptyMessage = "No data available",
  className,
  rowKey = "id",
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('')
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleRowSelection = (record: T, checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange([...selectedRows, record])
    } else {
      onSelectionChange(selectedRows.filter(item => item[rowKey] !== record[rowKey]))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    onSelectionChange(checked ? data : [])
  }

  const isAllSelected = data.length > 0 && selectedRows.length === data.length
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {searchable && (
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-2">No data available</div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  {selectable && (
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-input"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "p-4 text-left font-medium text-muted-foreground",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right",
                        column.width && `w-[${column.width}]`
                      )}
                    >
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.dataIndex)}
                          className="flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {column.title}
                          {sortField === column.dataIndex ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          )}
                        </button>
                      ) : (
                        column.title
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((record, index) => (
                  <tr
                    key={record[rowKey]}
                    className={cn(
                      "border-b hover:bg-muted/50 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(record, index)}
                  >
                    {selectable && (
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.some(item => item[rowKey] === record[rowKey])}
                          onChange={(e) => handleRowSelection(record, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-input"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "p-4",
                          column.align === 'center' && "text-center",
                          column.align === 'right' && "text-right"
                        )}
                      >
                        {column.render
                          ? column.render(record[column.dataIndex], record, index)
                          : record[column.dataIndex] || '—'
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
