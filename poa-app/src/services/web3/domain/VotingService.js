/**
 * VotingService
 * Handles Hybrid Voting and Direct Democracy Voting operations
 */

import HybridVotingABI from '../../../../abi/HybridVotingNew.json';
import DirectDemocracyVotingABI from '../../../../abi/DirectDemocracyVotingNew.json';
import { stringToBytes, stringToBytes32 } from '../utils/encoding';
import {
  requireAddress,
  requireString,
  requirePositiveNumber,
  requireValidVoteWeights,
  requireValidDuration,
} from '../utils/validation';

/**
 * Voting types
 */
export const VotingType = {
  HYBRID: 'hybrid',
  DIRECT_DEMOCRACY: 'dd',
};

/**
 * VotingService - Proposal creation and voting operations
 */
export class VotingService {
  /**
   * @param {ContractFactory} contractFactory - Contract factory instance
   * @param {TransactionManager} transactionManager - Transaction manager instance
   */
  constructor(contractFactory, transactionManager) {
    this.factory = contractFactory;
    this.txManager = transactionManager;
  }

  // ============================================
  // Hybrid Voting Functions
  // ============================================

  /**
   * Create a Hybrid Voting proposal
   * @param {string} contractAddress - HybridVoting contract address
   * @param {Object} proposalData - Proposal data
   * @param {string} proposalData.name - Proposal title
   * @param {string} proposalData.description - Proposal description
   * @param {number} proposalData.durationMinutes - Duration in minutes
   * @param {number} proposalData.numOptions - Number of voting options
   * @param {Array} [proposalData.batches=[]] - Execution batches
   * @param {Array} [proposalData.hatIds=[]] - Hat IDs to restrict voting
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createHybridProposal(contractAddress, proposalData, options = {}) {
    requireAddress(contractAddress, 'HybridVoting contract address');
    requireString(proposalData.name, 'Proposal name');
    requireValidDuration(proposalData.durationMinutes);
    requirePositiveNumber(proposalData.numOptions, 'Number of options');

    const {
      name,
      description = '',
      durationMinutes,
      numOptions,
      batches = [],
      hatIds = [],
    } = proposalData;

    const contract = this.factory.createWritable(contractAddress, HybridVotingABI);

    const titleBytes = stringToBytes(name);
    const descriptionHash = stringToBytes32(description);
    const duration = Math.max(1, Math.floor(durationMinutes));

    return this.txManager.execute(
      contract,
      'createProposal',
      [titleBytes, descriptionHash, duration, numOptions, batches, hatIds],
      options
    );
  }

  /**
   * Cast a Hybrid Vote
   * @param {string} contractAddress - HybridVoting contract address
   * @param {number} proposalId - Proposal ID
   * @param {number[]} optionIndices - Indices of options to vote for
   * @param {number[]} weights - Weights for each option (must sum to 100)
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async castHybridVote(contractAddress, proposalId, optionIndices, weights, options = {}) {
    requireAddress(contractAddress, 'HybridVoting contract address');
    requireValidVoteWeights(weights);

    const contract = this.factory.createWritable(contractAddress, HybridVotingABI);

    return this.txManager.execute(
      contract,
      'vote',
      [proposalId, optionIndices, weights],
      options
    );
  }

  /**
   * Announce winner for Hybrid Voting proposal
   * @param {string} contractAddress - HybridVoting contract address
   * @param {number} proposalId - Proposal ID
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async announceHybridWinner(contractAddress, proposalId, options = {}) {
    requireAddress(contractAddress, 'HybridVoting contract address');

    const contract = this.factory.createWritable(contractAddress, HybridVotingABI);

    return this.txManager.execute(contract, 'announceWinner', [proposalId], options);
  }

  // ============================================
  // Direct Democracy Voting Functions
  // ============================================

  /**
   * Create a Direct Democracy proposal
   * @param {string} contractAddress - DirectDemocracyVoting contract address
   * @param {Object} proposalData - Proposal data (same as Hybrid)
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createDDProposal(contractAddress, proposalData, options = {}) {
    requireAddress(contractAddress, 'DirectDemocracyVoting contract address');
    requireString(proposalData.name, 'Proposal name');
    requireValidDuration(proposalData.durationMinutes);
    requirePositiveNumber(proposalData.numOptions, 'Number of options');

    const {
      name,
      description = '',
      durationMinutes,
      numOptions,
      batches = [],
      hatIds = [],
    } = proposalData;

    const contract = this.factory.createWritable(contractAddress, DirectDemocracyVotingABI);

    const titleBytes = stringToBytes(name);
    const descriptionHash = stringToBytes32(description);
    const duration = Math.max(1, Math.floor(durationMinutes));

    return this.txManager.execute(
      contract,
      'createProposal',
      [titleBytes, descriptionHash, duration, numOptions, batches, hatIds],
      options
    );
  }

  /**
   * Cast a Direct Democracy Vote
   * @param {string} contractAddress - DirectDemocracyVoting contract address
   * @param {number} proposalId - Proposal ID
   * @param {number[]} optionIndices - Indices of options to vote for
   * @param {number[]} weights - Weights for each option (must sum to 100)
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async castDDVote(contractAddress, proposalId, optionIndices, weights, options = {}) {
    requireAddress(contractAddress, 'DirectDemocracyVoting contract address');
    requireValidVoteWeights(weights);

    const contract = this.factory.createWritable(contractAddress, DirectDemocracyVotingABI);

    // Convert to numbers for contract
    const idxs = optionIndices.map(i => Number(i));
    const wts = weights.map(w => Number(w));

    return this.txManager.execute(contract, 'vote', [proposalId, idxs, wts], options);
  }

  /**
   * Announce winner for Direct Democracy proposal
   * @param {string} contractAddress - DirectDemocracyVoting contract address
   * @param {number} proposalId - Proposal ID
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async announceDDWinner(contractAddress, proposalId, options = {}) {
    requireAddress(contractAddress, 'DirectDemocracyVoting contract address');

    const contract = this.factory.createWritable(contractAddress, DirectDemocracyVotingABI);

    return this.txManager.execute(contract, 'announceWinner', [proposalId], options);
  }

  // ============================================
  // Read Methods
  // ============================================

  /**
   * Get voting class configuration for Hybrid Voting
   * @param {string} contractAddress - HybridVoting contract address
   * @returns {Promise<Array>} Array of ClassConfig structs
   */
  async getHybridClasses(contractAddress) {
    requireAddress(contractAddress, 'HybridVoting contract address');
    const contract = this.factory.createReadable(contractAddress, HybridVotingABI);
    return contract.getClasses();
  }

  /**
   * Get quorum percentage for Hybrid Voting
   * @param {string} contractAddress - HybridVoting contract address
   * @returns {Promise<number>} Quorum percentage (1-100)
   */
  async getHybridQuorum(contractAddress) {
    requireAddress(contractAddress, 'HybridVoting contract address');
    const contract = this.factory.createReadable(contractAddress, HybridVotingABI);
    return contract.quorumPct();
  }

  /**
   * Get quorum percentage for Direct Democracy Voting
   * @param {string} contractAddress - DirectDemocracyVoting contract address
   * @returns {Promise<number>} Quorum percentage (1-100)
   */
  async getDDQuorum(contractAddress) {
    requireAddress(contractAddress, 'DirectDemocracyVoting contract address');
    const contract = this.factory.createReadable(contractAddress, DirectDemocracyVotingABI);
    return contract.quorumPercentage();
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Create a proposal (auto-detect type from contract address context)
   * @param {string} type - 'hybrid' or 'dd'
   * @param {string} contractAddress - Contract address
   * @param {Object} proposalData - Proposal data
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async createProposal(type, contractAddress, proposalData, options = {}) {
    if (type === VotingType.HYBRID) {
      return this.createHybridProposal(contractAddress, proposalData, options);
    }
    return this.createDDProposal(contractAddress, proposalData, options);
  }

  /**
   * Cast a vote (auto-detect type)
   * @param {string} type - 'hybrid' or 'dd'
   * @param {string} contractAddress - Contract address
   * @param {number} proposalId - Proposal ID
   * @param {number[]} optionIndices - Option indices
   * @param {number[]} weights - Vote weights
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async castVote(type, contractAddress, proposalId, optionIndices, weights, options = {}) {
    if (type === VotingType.HYBRID) {
      return this.castHybridVote(contractAddress, proposalId, optionIndices, weights, options);
    }
    return this.castDDVote(contractAddress, proposalId, optionIndices, weights, options);
  }

  /**
   * Announce winner (auto-detect type)
   * @param {string} type - 'hybrid' or 'dd'
   * @param {string} contractAddress - Contract address
   * @param {number} proposalId - Proposal ID
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async announceWinner(type, contractAddress, proposalId, options = {}) {
    if (type === VotingType.HYBRID) {
      return this.announceHybridWinner(contractAddress, proposalId, options);
    }
    return this.announceDDWinner(contractAddress, proposalId, options);
  }
}

/**
 * Create a VotingService instance
 * @param {ContractFactory} factory - Contract factory
 * @param {TransactionManager} txManager - Transaction manager
 * @returns {VotingService}
 */
export function createVotingService(factory, txManager) {
  return new VotingService(factory, txManager);
}
