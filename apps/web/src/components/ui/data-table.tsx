// DataTable Component - Reusable table with pagination, search, and sorting

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface Column<T> {
    key: string;
    header: string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    searchPlaceholder?: string;
    searchKey?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    onPageChange?: (page: number) => void;
    onSearch?: (search: string) => void;
    emptyMessage?: string;
    actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
    columns,
    data,
    loading = false,
    searchPlaceholder = 'ค้นหา...',
    pagination,
    onPageChange,
    onSearch,
    emptyMessage = 'ไม่พบข้อมูล',
    actions,
}: DataTableProps<T>) {
    const [searchValue, setSearchValue] = useState('');

    const handleSearch = (value: string) => {
        setSearchValue(value);
        onSearch?.(value);
    };

    const allColumns = useMemo(() => {
        if (actions) {
            return [
                ...columns,
                {
                    key: 'actions',
                    header: '',
                    cell: (item: T) => actions(item),
                    className: 'w-[100px] text-right',
                },
            ];
        }
        return columns;
    }, [columns, actions]);

    return (
        <div className="w-full">
            {/* Search */}
            {onSearch && (
                <div className="mb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                {allColumns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={cn(
                                            'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                                            column.className
                                        )}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={allColumns.length} className="px-4 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                                        <p className="mt-2 text-sm text-gray-500">กำลังโหลด...</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={allColumns.length} className="px-4 py-12 text-center text-gray-500">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        {allColumns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={cn(
                                                    'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                                                    column.className
                                                )}
                                            >
                                                {column.cell
                                                    ? column.cell(item)
                                                    : (item as any)[column.key] ?? '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            แสดง {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onPageChange?.(1)}
                                disabled={pagination.page === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onPageChange?.(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="px-3 text-sm text-gray-700 dark:text-gray-300">
                                หน้า {pagination.page} / {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onPageChange?.(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => onPageChange?.(pagination.totalPages)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DataTable;
