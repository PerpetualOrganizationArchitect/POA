/**
 * TokenRequestService
 * Handles ParticipationToken request/approval operations
 */

import { ethers } from 'ethers';
import ParticipationTokenABI from '../../../../abi/ParticipationToken.json';
import { ipfsCidToBytes32 } from '../utils/encoding';
import { requireAddress, requirePositiveNumber } from '../utils/validation';

/**
 * TokenRequestService - Token request and approval management
 */
export class TokenRequestService {
  /**
   * @param {ContractFactory} contractFactory - Contract factory instance
   * @param {TransactionManager} transactionManager - Transaction manager instance
   * @param {Object} ipfsService - IPFS service for metadata storage
   */
  constructor(contractFactory, transactionManager, ipfsService = null) {
    this.factory = contractFactory;
    this.txManager = transactionManager;
    this.ipfs = ipfsService;
  }

  // ============================================
  // Request Functions
  // ============================================

  /**
   * Request participation tokens with IPFS-stored justification
   * @param {string} contractAddress - ParticipationToken contract address
   * @param {number|string} amount - Amount of tokens to request (in token units, not wei)
   * @param {Object} metadata - Request metadata to store in IPFS
   * @param {string} metadata.reason - Reason/justification for the request
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async requestTokens(contractAddress, amount, metadata, options = {}) {
    requireAddress(contractAddress, 'ParticipationToken contract address');
    requirePositiveNumber(amount, 'Token amount');

    if (!metadata?.reason || metadata.reason.trim() === '') {
      throw new Error('Request reason is required');
    }

    // Upload metadata to IPFS
    // Use ipfsService from options if constructor didn't receive one
    const ipfsService = this.ipfs || options.ipfsService;
    if (!ipfsService) {
      throw new Error('IPFS service required for token requests');
    }

    let ipfsHash = '';
    const ipfsData = {
      reason: metadata.reason,
      submittedAt: Math.floor(Date.now() / 1000),
    };
    const ipfsResult = await ipfsService.addToIpfs(JSON.stringify(ipfsData));
    ipfsHash = ipfsResult.path;

    console.log('=== requestTokens DEBUG ===');
    console.log('IPFS data:', ipfsData);
    console.log('IPFS hash:', ipfsHash);

    const contract = this.factory.createWritable(contractAddress, ParticipationTokenABI);

    // Convert amount to wei (18 decimals for participation token)
    // The contract stores amount as uint96 which is the wei amount
    const amountWei = ethers.utils.parseUnits(amount.toString(), 18);

    // Validate that the amount fits in uint96 (max ~79 billion tokens)
    const MAX_UINT96 = ethers.BigNumber.from('79228162514264337593543950335');
    if (amountWei.gt(MAX_UINT96)) {
      throw new Error('Amount exceeds maximum allowed (uint96 overflow)');
    }

    console.log('Contract address:', contractAddress);
    console.log('Amount (human readable):', amount);
    console.log('Amount (wei):', amountWei.toString());
    console.log('IPFS hash string:', ipfsHash);
    console.log('=== END requestTokens DEBUG ===');

    return this.txManager.execute(
      contract,
      'requestTokens',
      [amountWei, ipfsHash],
      options
    );
  }

  // ============================================
  // Approval Functions
  // ============================================

  /**
   * Approve a token request (mints tokens to requester)
   * @param {string} contractAddress - ParticipationToken contract address
   * @param {number|string} requestId - Request ID to approve
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async approveRequest(contractAddress, requestId, options = {}) {
    requireAddress(contractAddress, 'ParticipationToken contract address');

    const contract = this.factory.createWritable(contractAddress, ParticipationTokenABI);
    const id = ethers.BigNumber.from(requestId);

    console.log('=== approveRequest DEBUG ===');
    console.log('Contract address:', contractAddress);
    console.log('Request ID:', id.toString());
    console.log('=== END approveRequest DEBUG ===');

    return this.txManager.execute(
      contract,
      'approveRequest',
      [id],
      options
    );
  }

  // ============================================
  // Cancel Functions
  // ============================================

  /**
   * Cancel a pending token request
   * Can be called by requester or approver
   * @param {string} contractAddress - ParticipationToken contract address
   * @param {number|string} requestId - Request ID to cancel
   * @param {Object} [options={}] - Transaction options
   * @returns {Promise<TransactionResult>}
   */
  async cancelRequest(contractAddress, requestId, options = {}) {
    requireAddress(contractAddress, 'ParticipationToken contract address');

    const contract = this.factory.createWritable(contractAddress, ParticipationTokenABI);
    const id = ethers.BigNumber.from(requestId);

    console.log('=== cancelRequest DEBUG ===');
    console.log('Contract address:', contractAddress);
    console.log('Request ID:', id.toString());
    console.log('=== END cancelRequest DEBUG ===');

    return this.txManager.execute(
      contract,
      'cancelRequest',
      [id],
      options
    );
  }

  // ============================================
  // View Functions
  // ============================================

  /**
   * Get details of a specific request
   * @param {string} contractAddress - ParticipationToken contract address
   * @param {number|string} requestId - Request ID to query
   * @returns {Promise<Object>} Request details { requester, amount, approved, ipfsHash }
   */
  async getRequest(contractAddress, requestId) {
    requireAddress(contractAddress, 'ParticipationToken contract address');

    const contract = this.factory.createReadOnly(contractAddress, ParticipationTokenABI);
    const id = ethers.BigNumber.from(requestId);

    const result = await contract.requests(id);

    return {
      requester: result.requester,
      amount: result.amount.toString(),
      approved: result.approved,
      ipfsHash: result.ipfsHash,
    };
  }

  /**
   * Get current request counter (next request ID)
   * @param {string} contractAddress - ParticipationToken contract address
   * @returns {Promise<string>} Current request counter
   */
  async getRequestCounter(contractAddress) {
    requireAddress(contractAddress, 'ParticipationToken contract address');

    const contract = this.factory.createReadOnly(contractAddress, ParticipationTokenABI);
    const counter = await contract.requestCounter();

    return counter.toString();
  }

  /**
   * Get list of member hat IDs
   * @param {string} contractAddress - ParticipationToken contract address
   * @returns {Promise<string[]>} Array of hat IDs
   */
  async getMemberHatIds(contractAddress) {
    requireAddress(contractAddress, 'ParticipationToken contract address');

    const contract = this.factory.createReadOnly(contractAddress, ParticipationTokenABI);
    const hatIds = await contract.memberHatIds();

    return hatIds.map(id => id.toString());
  }

  /**
   * Get list of approver hat IDs
   * @param {string} contractAddress - ParticipationToken contract address
   * @returns {Promise<string[]>} Array of hat IDs
   */
  async getApproverHatIds(contractAddress) {
    requireAddress(contractAddress, 'ParticipationToken contract address');

    const contract = this.factory.createReadOnly(contractAddress, ParticipationTokenABI);
    const hatIds = await contract.approverHatIds();

    return hatIds.map(id => id.toString());
  }
}

/**
 * Create a TokenRequestService instance
 * @param {ContractFactory} factory - Contract factory
 * @param {TransactionManager} txManager - Transaction manager
 * @param {Object} [ipfsService] - IPFS service
 * @returns {TokenRequestService}
 */
export function createTokenRequestService(factory, txManager, ipfsService = null) {
  return new TokenRequestService(factory, txManager, ipfsService);
}
