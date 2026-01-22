/**
 * useClaimRole - Hook for claiming roles (hats) via EligibilityModule
 * Provides functions for claiming, vouching, and revoking vouches
 */

import { useState, useCallback } from 'react';
import { useWeb3Services, useTransactionWithNotification } from './useWeb3Services';
import { useAccount } from 'wagmi';

/**
 * Hook for claiming roles and managing vouches
 * @param {string} eligibilityModuleAddress - Address of the EligibilityModule contract
 * @returns {Object} Claim functions and state
 */
export function useClaimRole(eligibilityModuleAddress) {
  const { eligibility, isReady } = useWeb3Services();
  const { executeWithNotification } = useTransactionWithNotification();
  const { address: userAddress } = useAccount();

  const [claimingHatId, setClaimingHatId] = useState(null);
  const [vouchingFor, setVouchingFor] = useState(null);

  /**
   * Claim a hat that the user is eligible for
   * @param {string} hatId - The hat ID to claim
   * @returns {Promise<{success: boolean, error?: Error}>}
   */
  const claimRole = useCallback(async (hatId) => {
    if (!eligibility || !eligibilityModuleAddress) {
      console.error('[useClaimRole] Service not ready or no eligibility module');
      return { success: false, error: new Error('Service not ready') };
    }

    setClaimingHatId(hatId);

    try {
      const result = await executeWithNotification(
        () => eligibility.claimVouchedHat(eligibilityModuleAddress, hatId),
        {
          pendingMessage: 'Claiming role...',
          successMessage: 'Role claimed successfully!',
          errorMessage: 'Failed to claim role',
          refreshEvent: 'role:claimed',
          refreshData: { hatId },
        }
      );

      return result;
    } finally {
      setClaimingHatId(null);
    }
  }, [eligibility, eligibilityModuleAddress, executeWithNotification]);

  /**
   * Vouch for another user to help them claim a hat
   * @param {string} wearerAddress - Address of the user to vouch for
   * @param {string} hatId - The hat ID to vouch for
   * @returns {Promise<{success: boolean, error?: Error}>}
   */
  const vouchFor = useCallback(async (wearerAddress, hatId) => {
    if (!eligibility || !eligibilityModuleAddress) {
      console.error('[useClaimRole] Service not ready or no eligibility module');
      return { success: false, error: new Error('Service not ready') };
    }

    setVouchingFor({ address: wearerAddress, hatId });

    try {
      const result = await executeWithNotification(
        () => eligibility.vouchFor(eligibilityModuleAddress, wearerAddress, hatId),
        {
          pendingMessage: 'Submitting vouch...',
          successMessage: 'Vouch submitted successfully!',
          errorMessage: 'Failed to submit vouch',
          refreshEvent: 'role:vouched',
          refreshData: { wearerAddress, hatId },
        }
      );

      return result;
    } finally {
      setVouchingFor(null);
    }
  }, [eligibility, eligibilityModuleAddress, executeWithNotification]);

  /**
   * Revoke a previous vouch for a user
   * @param {string} wearerAddress - Address of the user whose vouch to revoke
   * @param {string} hatId - The hat ID for which to revoke the vouch
   * @returns {Promise<{success: boolean, error?: Error}>}
   */
  const revokeVouch = useCallback(async (wearerAddress, hatId) => {
    if (!eligibility || !eligibilityModuleAddress) {
      console.error('[useClaimRole] Service not ready or no eligibility module');
      return { success: false, error: new Error('Service not ready') };
    }

    try {
      const result = await executeWithNotification(
        () => eligibility.revokeVouch(eligibilityModuleAddress, wearerAddress, hatId),
        {
          pendingMessage: 'Revoking vouch...',
          successMessage: 'Vouch revoked successfully!',
          errorMessage: 'Failed to revoke vouch',
          refreshEvent: 'role:vouch-revoked',
          refreshData: { wearerAddress, hatId },
        }
      );

      return result;
    } finally {
      // No specific state to clear
    }
  }, [eligibility, eligibilityModuleAddress, executeWithNotification]);

  /**
   * Check if a specific hat is currently being claimed
   * @param {string} hatId - Hat ID to check
   * @returns {boolean}
   */
  const isClaimingHat = useCallback((hatId) => {
    return claimingHatId === hatId;
  }, [claimingHatId]);

  /**
   * Check if currently vouching for a specific user/hat combo
   * @param {string} wearerAddress - Address to check
   * @param {string} hatId - Hat ID to check
   * @returns {boolean}
   */
  const isVouchingFor = useCallback((wearerAddress, hatId) => {
    return vouchingFor?.address === wearerAddress && vouchingFor?.hatId === hatId;
  }, [vouchingFor]);

  return {
    // Actions
    claimRole,
    vouchFor,
    revokeVouch,

    // State checks
    isClaimingHat,
    isVouchingFor,
    isClaiming: claimingHatId !== null,
    isVouching: vouchingFor !== null,

    // Readiness
    isReady: isReady && Boolean(eligibilityModuleAddress),
    hasEligibilityModule: Boolean(eligibilityModuleAddress),

    // User info
    userAddress,
  };
}

export default useClaimRole;
