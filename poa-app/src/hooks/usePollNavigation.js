/**
 * usePollNavigation
 * Hook for managing poll selection, URL handling, and modal state
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDisclosure } from '@chakra-ui/react';

export function usePollNavigation({
  democracyVotingOngoing = [],
  democracyVotingCompleted = [],
  hybridVotingOngoing = [],
  hybridVotingCompleted = [],
  PTVoteType = 'Hybrid',
}) {
  const router = useRouter();
  const { userDAO } = router.query;

  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [isPollCompleted, setIsPollCompleted] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [votingTypeSelected, setVotingTypeSelected] = useState("Direct Democracy");

  const {
    isOpen: isPollModalOpen,
    onOpen: onPollModalOpen,
    onClose: onPollModalClose,
  } = useDisclosure();

  const {
    isOpen: isCompletedModalOpen,
    onOpen: onCompletedModalOpen,
    onClose: onCompletedModalClose,
  } = useDisclosure();

  // Handle tab changes
  const handleTabChange = useCallback((index) => {
    setSelectedTab(index);
    const voteType = index === 0 ? "Direct Democracy" : PTVoteType;
    setVotingTypeSelected(voteType);
  }, [PTVoteType]);

  // Handle poll click
  const handlePollClick = useCallback((poll, isCompleted = false) => {
    setSelectedPoll(poll);
    setIsPollCompleted(isCompleted);
    router.push(`/voting?poll=${poll.id}&userDAO=${userDAO}`);

    if (isCompleted) {
      onCompletedModalOpen();
    } else {
      onPollModalOpen();
    }
  }, [router, userDAO, onCompletedModalOpen, onPollModalOpen]);

  // Find poll by ID or title in proposals array
  const findPollInProposals = useCallback((proposals, pollId) => {
    if (!Array.isArray(proposals) || proposals.length === 0) return null;
    return proposals.find((p) => p.id === pollId || p.title === pollId);
  }, []);

  // Handle URL-based poll selection
  useEffect(() => {
    if (!router.query.poll) return;

    const pollId = router.query.poll;
    let pollFound = null;
    let pollType = "";
    let isCompleted = false;

    // Check ongoing proposals
    pollFound = findPollInProposals(democracyVotingOngoing, pollId);
    if (pollFound) pollType = "Direct Democracy";

    if (!pollFound) {
      pollFound = findPollInProposals(hybridVotingOngoing, pollId);
      if (pollFound) pollType = "Hybrid";
    }

    // Check completed proposals
    if (!pollFound) {
      pollFound = findPollInProposals(democracyVotingCompleted, pollId);
      if (pollFound) {
        pollType = "Direct Democracy";
        isCompleted = true;
      }
    }

    if (!pollFound) {
      pollFound = findPollInProposals(hybridVotingCompleted, pollId);
      if (pollFound) {
        pollType = "Hybrid";
        isCompleted = true;
      }
    }

    if (pollFound) {
      setSelectedPoll(pollFound);
      setVotingTypeSelected(pollType);
      setSelectedTab(pollType === "Direct Democracy" ? 0 : 1);
      setIsPollCompleted(isCompleted);

      if (isCompleted) {
        onCompletedModalOpen();
      } else {
        onPollModalOpen();
      }
    }
  }, [
    router.query.poll,
    democracyVotingOngoing,
    democracyVotingCompleted,
    hybridVotingOngoing,
    hybridVotingCompleted,
    findPollInProposals,
    onPollModalOpen,
    onCompletedModalOpen,
  ]);

  // Get the correct contract address based on voting type
  const getContractAddressForVotingType = useCallback((ddAddress, hybridAddress) => {
    return votingTypeSelected === "Direct Democracy" ? ddAddress : hybridAddress;
  }, [votingTypeSelected]);

  return {
    selectedPoll,
    setSelectedPoll,
    selectedOption,
    setSelectedOption,
    isPollCompleted,
    selectedTab,
    votingTypeSelected,
    handleTabChange,
    handlePollClick,
    getContractAddressForVotingType,
    // Poll modal
    isPollModalOpen,
    onPollModalOpen,
    onPollModalClose,
    // Completed modal
    isCompletedModalOpen,
    onCompletedModalOpen,
    onCompletedModalClose,
  };
}

export default usePollNavigation;
