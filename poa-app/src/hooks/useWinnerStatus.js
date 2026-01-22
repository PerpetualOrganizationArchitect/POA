/**
 * useWinnerStatus
 * Hook for managing proposal winner determination status
 */

import { useState, useEffect, useCallback } from 'react';

export function useWinnerStatus({ proposals = [] }) {
  const [showDetermineWinner, setShowDetermineWinner] = useState({});

  const calculateRemainingTime = useCallback((expirationTimestamp) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const duration = expirationTimestamp - currentTimestamp;
    return Math.max(0, duration);
  }, []);

  const updateWinnerStatus = useCallback((expirationTimestamp, proposalId) => {
    const duration = calculateRemainingTime(expirationTimestamp);
    if (duration <= 0) {
      setShowDetermineWinner(prevState => ({
        ...prevState,
        [proposalId]: true
      }));
    }
  }, [calculateRemainingTime]);

  // Check for expired proposals
  useEffect(() => {
    if (!Array.isArray(proposals)) return;

    proposals.forEach(proposal => {
      if (proposal?.endTimestamp && proposal?.id) {
        updateWinnerStatus(proposal.endTimestamp, proposal.id);
      }
    });
  }, [proposals, updateWinnerStatus]);

  const getWinner = useCallback(async (contractAddress, proposalId, getWinnerFn) => {
    // In POP subgraph, id format is "contractAddress-proposalId"
    // Extract the actual proposalId (second part after split)
    const newID = proposalId.split("-")[1] || proposalId;
    await getWinnerFn(contractAddress, newID);
  }, []);

  return {
    showDetermineWinner,
    calculateRemainingTime,
    getWinner,
  };
}

export default useWinnerStatus;
