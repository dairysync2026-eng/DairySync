import { useEffect, useMemo, useState } from 'react';

export const usePagination = <T,>(items: T[], initialPageSize = 50) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const pageCount = Math.ceil(items.length / pageSize);
  const currentPageIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const pageItems = useMemo(
    () => items.slice(currentPageIndex * pageSize, (currentPageIndex + 1) * pageSize),
    [items, currentPageIndex, pageSize],
  );

  useEffect(() => {
    setPageIndex(0);
  }, [items]);

  const changePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPageIndex(0);
  };

  return {
    pageItems,
    pageIndex: currentPageIndex,
    pageSize,
    pageCount,
    setPageIndex,
    setPageSize: changePageSize,
  };
};
