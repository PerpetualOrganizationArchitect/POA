/**
 * useWeb3Services - Hook to access Web3 service layer
 * Provides a unified interface to all Web3 services with proper initialization
 */

import { useMemo, useCallback } from 'react';
import { useEthersSigner } from '@/components/ProviderConverter';
import { useNotification } from '../context/NotificationContext';
import { useRefreshEmit } from '../context/RefreshContext';
import { INFRASTRUCTURE_CONTRACTS, getInfrastructureAddress } from '../config/contracts';
import { DEFAULT_NETWORK } from '../config/networks';

// Core services
import { ContractFactory, createContractFactory } from '../services/web3/core/ContractFactory';
import { TransactionManager, createTransactionManager } from '../services/web3/core/TransactionManager';

// Domain services
import { UserService, createUserService } from '../services/web3/domain/UserService';
import { OrganizationService, createOrganizationService } from '../services/web3/domain/OrganizationService';
import { VotingService, VotingType, createVotingService } from '../services/web3/domain/VotingService';
import { TaskService, createTaskService } from '../services/web3/domain/TaskService';
import { EducationService, createEducationService } from '../services/web3/domain/EducationService';
import { EligibilityService, createEligibilityService } from '../services/web3/domain/EligibilityService';
import { TokenRequestService, createTokenRequestService } from '../services/web3/domain/TokenRequestService';

/**
 * Hook to access all Web3 services
 * @param {Object} [options={}] - Configuration options
 * @param {Object} [options.ipfsService] - IPFS service instance for content storage
 * @param {string} [options.network] - Network name (defaults to DEFAULT_NETWORK)
 * @returns {Object} Object containing all services and utilities
 */
export function useWeb3Services(options = {}) {
  const { ipfsService = null, network = DEFAULT_NETWORK } = options;
  const signer = useEthersSigner();

  // Create core services
  const factory = useMemo(() => {
    if (!signer) return null;
    return createContractFactory(signer);
  }, [signer]);

  const txManager = useMemo(() => {
    if (!signer) return null;
    return createTransactionManager(signer);
  }, [signer]);

  // Create domain services
  const services = useMemo(() => {
    if (!factory || !txManager) {
      return {
        user: null,
        organization: null,
        voting: null,
        task: null,
        education: null,
        eligibility: null,
        tokenRequest: null,
      };
    }

    return {
      user: createUserService(factory, txManager),
      organization: createOrganizationService(factory, txManager),
      voting: createVotingService(factory, txManager),
      task: createTaskService(factory, txManager, ipfsService),
      education: createEducationService(factory, txManager, ipfsService),
      eligibility: createEligibilityService(factory, txManager),
      tokenRequest: createTokenRequestService(factory, txManager, ipfsService),
    };
  }, [factory, txManager, ipfsService]);

  // Contract addresses helper
  const getContractAddress = useCallback((contractName) => {
    return getInfrastructureAddress(contractName);
  }, []);

  // Check if services are ready
  const isReady = Boolean(signer && factory && txManager);

  return {
    // Core
    factory,
    txManager,

    // Domain services
    ...services,

    // Utilities
    getContractAddress,
    isReady,
    signer,

    // Constants
    VotingType,
  };
}

/**
 * Hook for transaction execution with integrated notifications
 * Wraps service calls with loading states and automatic notifications
 */
export function useTransactionWithNotification() {
  const { addNotification, updateNotification } = useNotification();
  const { emit } = useRefreshEmit();

  /**
   * Execute a transaction with notification handling
   * @param {Function} transactionFn - Async function that returns a TransactionResult
   * @param {Object} options - Options for the transaction
   * @param {string} options.pendingMessage - Message to show while pending
   * @param {string} options.successMessage - Message to show on success
   * @param {string} [options.errorMessage] - Custom error message (uses parsed error if not provided)
   * @param {string} [options.refreshEvent] - Event to emit on success
   * @param {Object} [options.refreshData] - Data to include with refresh event
   * @returns {Promise<TransactionResult>}
   */
  const executeWithNotification = useCallback(async (
    transactionFn,
    {
      pendingMessage,
      successMessage,
      errorMessage,
      refreshEvent,
      refreshData = {},
    }
  ) => {
    // Show pending notification with loading status (blue spinner)
    const pendingId = addNotification(pendingMessage, 'loading');

    try {
      const result = await transactionFn();

      if (result.success) {
        // Update pending notification to success
        updateNotification(pendingId, successMessage, 'success');

        // Emit refresh event if specified
        if (refreshEvent) {
          emit(refreshEvent, {
            ...refreshData,
            transactionHash: result.transactionHash,
          });
        }
      } else {
        // Update to error
        const message = errorMessage || result.error?.userMessage || 'Transaction failed';
        updateNotification(pendingId, message, 'error');
      }

      return result;
    } catch (error) {
      // Handle unexpected errors - update to error
      const message = errorMessage || error.message || 'An unexpected error occurred';
      updateNotification(pendingId, message, 'error');

      return {
        success: false,
        error,
      };
    }
  }, [addNotification, updateNotification, emit]);

  /**
   * Create a transaction handler for common operations
   * Returns a wrapped function that handles notifications automatically
   */
  const createHandler = useCallback((
    serviceFn,
    {
      pendingMessage,
      successMessage,
      errorMessage,
      refreshEvent,
    }
  ) => {
    return async (...args) => {
      return executeWithNotification(
        () => serviceFn(...args),
        {
          pendingMessage,
          successMessage,
          errorMessage,
          refreshEvent,
          refreshData: { args },
        }
      );
    };
  }, [executeWithNotification]);

  return {
    executeWithNotification,
    createHandler,
  };
}

/**
 * Combined hook for services + transaction notifications
 * Most convenient for component usage
 */
export function useWeb3(options = {}) {
  const services = useWeb3Services(options);
  const txNotification = useTransactionWithNotification();

  return {
    ...services,
    ...txNotification,
  };
}

export default useWeb3Services;
