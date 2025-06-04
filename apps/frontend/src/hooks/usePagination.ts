import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialItemsPerPage?: number;
}

export function usePagination({
  initialPage = 1,
  initialItemsPerPage = 10,
}: UsePaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const handlePageChange = useCallback((newPage: number) => {
    // Basic validation, totalPages validation will be implicitly handled by API response
    // and UI disabling next button.
    if (newPage > 0) {
      setCurrentPage(newPage);
    }
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Values to be used in API query
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
  }), [currentPage, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage: handlePageChange,
    itemsPerPage,
    setItemsPerPage, // Expose if you want to allow changing items per page
    queryParams,
    resetPagination,
  };
}
