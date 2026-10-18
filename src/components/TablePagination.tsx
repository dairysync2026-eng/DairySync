import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  totalItems,
  pageIndex,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const firstItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const lastItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-end">
      <label className="flex items-center gap-2">
        <span>Items per page:</span>
        <select
          aria-label="Items per page"
          value={pageSize}
          onChange={event => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 font-semibold text-slate-700"
        >
          {[10, 25, 50, 75, 100].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
      <span aria-live="polite" className="min-w-[92px] text-center tabular-nums">
        {firstItem}–{lastItem} of {totalItems}
      </span>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={pageIndex === 0}
          onClick={() => onPageChange(pageIndex - 1)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={pageCount === 0 || pageIndex >= pageCount - 1}
          onClick={() => onPageChange(pageIndex + 1)}
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
