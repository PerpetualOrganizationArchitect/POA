/**
 * useVotingPagination
 * Hook for managing pagination of proposal lists
 */

import { useState, useCallback, useMemo } from 'react';

const DEFAULT_PAGE_SIZE = 3;

export function useVotingPagination({
  ongoingProposals = [],
  completedProposals = [],
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const [ongoingStartIndex, setOngoingStartIndex] = useState(0);
  const [completedStartIndex, setCompletedStartIndex] = useState(0);

  // Ensure arrays are safe
  const safeOngoing = Array.isArray(ongoingProposals) ? ongoingProposals : [];
  const safeCompleted = Array.isArray(completedProposals) ? completedProposals : [];

  // Calculate displayed items
  const displayedOngoing = useMemo(() =>
    safeOngoing.slice(ongoingStartIndex, ongoingStartIndex + pageSize),
    [safeOngoing, ongoingStartIndex, pageSize]
  );

  const displayedCompleted = useMemo(() =>
    [...safeCompleted].reverse().slice(completedStartIndex, completedStartIndex + pageSize),
    [safeCompleted, completedStartIndex, pageSize]
  );

  // Navigation handlers
  const handlePreviousOngoing = useCallback(() => {
    setOngoingStartIndex(prev => Math.max(0, prev - pageSize));
  }, [pageSize]);

  const handleNextOngoing = useCallback(() => {
    if (ongoingStartIndex + pageSize < safeOngoing.length) {
      setOngoingStartIndex(prev => prev + pageSize);
    }
  }, [ongoingStartIndex, pageSize, safeOngoing.length]);

  const handlePreviousCompleted = useCallback(() => {
    setCompletedStartIndex(prev => Math.max(0, prev - pageSize));
  }, [pageSize]);

  const handleNextCompleted = useCallback(() => {
    if (completedStartIndex + pageSize < safeCompleted.length) {
      setCompletedStartIndex(prev => prev + pageSize);
    }
  }, [completedStartIndex, pageSize, safeCompleted.length]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setOngoingStartIndex(0);
    setCompletedStartIndex(0);
  }, []);

  // Pagination state
  const canGoBackOngoing = ongoingStartIndex > 0;
  const canGoForwardOngoing = ongoingStartIndex + pageSize < safeOngoing.length;
  const canGoBackCompleted = completedStartIndex > 0;
  const canGoForwardCompleted = completedStartIndex + pageSize < safeCompleted.length;

  return {
    displayedOngoing,
    displayedCompleted,
    ongoingStartIndex,
    completedStartIndex,
    handlePreviousOngoing,
    handleNextOngoing,
    handlePreviousCompleted,
    handleNextCompleted,
    resetPagination,
    canGoBackOngoing,
    canGoForwardOngoing,
    canGoBackCompleted,
    canGoForwardCompleted,
  };
}

export default useVotingPagination;
