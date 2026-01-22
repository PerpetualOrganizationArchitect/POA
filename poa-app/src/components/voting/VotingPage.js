/**
 * VotingPage
 * Main voting page component for proposal management and voting
 */

import React, { useState, useCallback } from "react";
import {
  Container,
  Center,
  Spinner,
  TabPanel,
} from "@chakra-ui/react";
import { usePOContext } from "@/context/POContext";
import { useVotingContext } from "@/context/VotingContext";
import { useWeb3 } from "@/hooks";
import { VotingType } from "@/services/web3/domain/VotingService";

import Navbar from "@/templateComponents/studentOrgDAO/NavBar";
import VotingEducationHeader from "./VotingEducationHeader";
import PollModal from "@/templateComponents/studentOrgDAO/voting/pollModal";
import CompletedPollModal from "@/templateComponents/studentOrgDAO/voting/CompletedPollModal";

import VotingTabs from "./VotingTabs";
import VotingPanel from "./VotingPanel";
import CreateVoteModal from "./CreateVoteModal";

// Custom hooks for logic extraction
import { usePollNavigation } from "../../hooks/usePollNavigation";
import { useVotingPagination } from "../../hooks/useVotingPagination";
import { useProposalForm } from "../../hooks/useProposalForm";
import { useWinnerStatus } from "../../hooks/useWinnerStatus";

const VotingPage = () => {
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  // Web3 services hook
  const { voting, executeWithNotification, isReady } = useWeb3();

  const {
    directDemocracyVotingContractAddress,
    votingContractAddress,
    taskManagerContractAddress,
    executorContractAddress,
    poContextLoading,
    roleNames,
  } = usePOContext();

  const {
    hybridVotingOngoing,
    hybridVotingCompleted,
    democracyVotingOngoing,
    democracyVotingCompleted,
    votingType: PTVoteType,
  } = useVotingContext();

  // Poll navigation and selection
  const {
    selectedPoll,
    selectedOption,
    setSelectedOption,
    selectedTab,
    votingTypeSelected,
    handleTabChange,
    handlePollClick,
    getContractAddressForVotingType,
    isPollModalOpen,
    onPollModalOpen,
    onPollModalClose,
    isCompletedModalOpen,
    onCompletedModalClose,
  } = usePollNavigation({
    democracyVotingOngoing,
    democracyVotingCompleted,
    hybridVotingOngoing,
    hybridVotingCompleted,
    PTVoteType,
  });

  // Get proposals for current tab
  const currentOngoing = selectedTab === 0 ? democracyVotingOngoing : hybridVotingOngoing;
  const currentCompleted = selectedTab === 0 ? democracyVotingCompleted : hybridVotingCompleted;

  // Pagination
  const {
    displayedOngoing,
    displayedCompleted,
    handlePreviousOngoing,
    handleNextOngoing,
    handlePreviousCompleted,
    handleNextCompleted,
    resetPagination,
  } = useVotingPagination({
    ongoingProposals: currentOngoing,
    completedProposals: currentCompleted,
  });

  // Winner status
  const {
    showDetermineWinner,
    calculateRemainingTime,
    getWinner,
  } = useWinnerStatus({
    proposals: currentOngoing,
  });

  // Proposal creation form
  const handleProposalSubmit = useCallback(async (proposalData) => {
    if (!voting) return;

    const proposalParams = {
      name: proposalData.name,
      description: proposalData.description,
      durationMinutes: proposalData.time,
      numOptions: proposalData.numOptions,
      batches: proposalData.batches || [],
      hatIds: proposalData.hatIds || [],
    };

    // Setter proposals use HybridVoting (main governance) which triggers Executor
    // Executor has onlyExecutor permission on all contracts, so it can call any setter
    const isSetterProposal = proposalData.type === 'setter';

    const result = await executeWithNotification(
      () => isSetterProposal
        ? voting.createHybridProposal(votingContractAddress, proposalParams)
        : voting.createDDProposal(directDemocracyVotingContractAddress, proposalParams),
      {
        pendingMessage: 'Creating proposal...',
        successMessage: 'Proposal created successfully!',
        refreshEvent: 'proposal:created',
      }
    );

    if (result.success) {
      setShowCreatePoll(false);
    }
  }, [voting, executeWithNotification, directDemocracyVotingContractAddress, votingContractAddress]);

  const {
    proposal,
    loadingSubmit,
    handleInputChange,
    handleOptionsChange,
    handleProposalTypeChange,
    handleTransferAddressChange,
    handleTransferAmountChange,
    handleElectionRoleChange,
    addCandidate,
    removeCandidate,
    handleRestrictedToggle,
    toggleRestrictedRole,
    handleSetterChange,
    handleSubmit,
  } = useProposalForm({
    onSubmit: handleProposalSubmit,
  });

  // Contract addresses object for setter proposals
  const contractAddresses = {
    votingContractAddress,
    directDemocracyVotingContractAddress,
    taskManagerContractAddress,
    executorContractAddress,
  };

  // Wrapper for handleSubmit that passes eligibilityModule and contract addresses
  const handlePollCreated = useCallback(() => {
    // Use executor as eligibility module for setter proposals (or pass actual eligibility module)
    return handleSubmit(executorContractAddress, contractAddresses);
  }, [handleSubmit, executorContractAddress, contractAddresses]);

  // Handle tab changes with pagination reset
  const handleTabsChange = useCallback((index) => {
    handleTabChange(index);
    resetPagination();
  }, [handleTabChange, resetPagination]);

  // Toggle create poll modal
  const handleCreatePollClick = useCallback(() => {
    setShowCreatePoll(prev => !prev);
  }, []);

  // Get winner handler
  const handleGetWinner = useCallback(async (contractAddress, proposalId, isHybrid = false) => {
    if (!voting) return;

    const type = isHybrid ? VotingType.HYBRID : VotingType.DIRECT_DEMOCRACY;
    await executeWithNotification(
      () => voting.announceWinner(type, contractAddress, proposalId),
      {
        pendingMessage: 'Announcing winner...',
        successMessage: 'Winner announced successfully!',
        refreshEvent: 'proposal:completed',
      }
    );
  }, [voting, executeWithNotification]);

  // Vote handlers for PollModal
  const handleDDVote = useCallback(async (contractAddress, proposalId, optionIndices, weights) => {
    if (!voting) return;

    await executeWithNotification(
      () => voting.castDDVote(contractAddress, proposalId, optionIndices, weights),
      {
        pendingMessage: 'Casting vote...',
        successMessage: 'Vote cast successfully!',
        refreshEvent: 'proposal:voted',
      }
    );
  }, [voting, executeWithNotification]);

  const handleHybridVote = useCallback(async (contractAddress, proposalId, optionIndices, weights) => {
    if (!voting) return;

    await executeWithNotification(
      () => voting.castHybridVote(contractAddress, proposalId, optionIndices, weights),
      {
        pendingMessage: 'Casting vote...',
        successMessage: 'Vote cast successfully!',
        refreshEvent: 'proposal:voted',
      }
    );
  }, [voting, executeWithNotification]);

  return (
    <>
      <Navbar />
      {poContextLoading ? (
        <Center height="90vh">
          <Spinner size="xl" />
        </Center>
      ) : (
        <Container maxW="container.2xl" py={{ base: 20, md: 4 }} px={{ base: "1%", md: "3%" }}>
          <VotingEducationHeader selectedTab={selectedTab} PTVoteType={PTVoteType} />

          <VotingTabs
            selectedTab={selectedTab}
            handleTabsChange={handleTabsChange}
            PTVoteType={PTVoteType}
          >
            <TabPanel>
              <VotingPanel
                displayedOngoingProposals={displayedOngoing}
                displayedCompletedProposals={displayedCompleted}
                showDetermineWinner={showDetermineWinner}
                getWinner={handleGetWinner}
                calculateRemainingTime={calculateRemainingTime}
                contractAddress={directDemocracyVotingContractAddress}
                onPollClick={handlePollClick}
                onPreviousOngoingClick={handlePreviousOngoing}
                onNextOngoingClick={handleNextOngoing}
                onPreviousCompletedClick={handlePreviousCompleted}
                onNextCompletedClick={handleNextCompleted}
                onCreateClick={handleCreatePollClick}
                showCreatePoll={showCreatePoll}
              />
            </TabPanel>
            <TabPanel>
              <VotingPanel
                displayedOngoingProposals={displayedOngoing}
                displayedCompletedProposals={displayedCompleted}
                showDetermineWinner={showDetermineWinner}
                getWinner={handleGetWinner}
                calculateRemainingTime={calculateRemainingTime}
                contractAddress={votingContractAddress}
                onPollClick={handlePollClick}
                onPreviousOngoingClick={handlePreviousOngoing}
                onNextOngoingClick={handleNextOngoing}
                onPreviousCompletedClick={handlePreviousCompleted}
                onNextCompletedClick={handleNextCompleted}
                onCreateClick={handleCreatePollClick}
                showCreatePoll={showCreatePoll}
              />
            </TabPanel>
          </VotingTabs>

          <CreateVoteModal
            isOpen={showCreatePoll}
            onClose={handleCreatePollClick}
            proposal={proposal}
            handleInputChange={handleInputChange}
            handleOptionsChange={handleOptionsChange}
            handleProposalTypeChange={handleProposalTypeChange}
            handleTransferAddressChange={handleTransferAddressChange}
            handleTransferAmountChange={handleTransferAmountChange}
            handleElectionRoleChange={handleElectionRoleChange}
            addCandidate={addCandidate}
            removeCandidate={removeCandidate}
            handleRestrictedToggle={handleRestrictedToggle}
            toggleRestrictedRole={toggleRestrictedRole}
            handleSetterChange={handleSetterChange}
            handlePollCreated={handlePollCreated}
            loadingSubmit={loadingSubmit}
            roleNames={roleNames}
          />

          <PollModal
            isOpen={isPollModalOpen}
            onClose={onPollModalClose}
            handleVote={votingTypeSelected === "Direct Democracy" ? handleDDVote : handleHybridVote}
            contractAddress={getContractAddressForVotingType(
              directDemocracyVotingContractAddress,
              votingContractAddress
            )}
            selectedPoll={selectedPoll}
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
            onOpen={onPollModalOpen}
          />

          <CompletedPollModal
            isOpen={isCompletedModalOpen}
            onClose={onCompletedModalClose}
            selectedPoll={selectedPoll}
            voteType={votingTypeSelected}
          />
        </Container>
      )}
    </>
  );
};

export default VotingPage;
