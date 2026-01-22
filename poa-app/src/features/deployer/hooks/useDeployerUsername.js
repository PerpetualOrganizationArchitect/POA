/**
 * useDeployerUsername Hook
 * Manages username state for the deployer during org deployment
 * - Checks if connected wallet already has a username
 * - If not, requires input and validates format + availability
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import apolloClient from '@/util/apolloClient';
import { FETCH_USERNAME_NEW, GET_ACCOUNT_BY_USERNAME } from '@/util/queries';

// Username validation regex (alphanumeric + underscore, 3-32 chars)
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 32;

/**
 * Validate username format
 * @param {string} username
 * @returns {{ isValid: boolean, error: string | null }}
 */
function validateUsernameFormat(username) {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < MIN_LENGTH) {
    return { isValid: false, error: `Username must be at least ${MIN_LENGTH} characters` };
  }

  if (trimmed.length > MAX_LENGTH) {
    return { isValid: false, error: `Username must be at most ${MAX_LENGTH} characters` };
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true, error: null };
}

/**
 * Hook to manage deployer username state
 * @returns {Object} Username state and utilities
 */
export function useDeployerUsername() {
  const { address } = useAccount();

  // State for existing username check
  const [existingUsername, setExistingUsername] = useState(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [existingError, setExistingError] = useState(null);

  // State for new username input
  const [inputUsername, setInputUsername] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  // Format validation (runs synchronously)
  const formatValidation = useMemo(() => {
    if (existingUsername) {
      return { isValid: true, error: null };
    }
    return validateUsernameFormat(inputUsername);
  }, [existingUsername, inputUsername]);

  // Check if connected address already has a username
  useEffect(() => {
    async function checkExistingUsername() {
      if (!address) {
        setIsLoadingExisting(false);
        setExistingUsername(null);
        return;
      }

      setIsLoadingExisting(true);
      setExistingError(null);

      try {
        const { data } = await apolloClient.query({
          query: FETCH_USERNAME_NEW,
          variables: { id: address.toLowerCase() },
          fetchPolicy: 'network-only',
        });

        const username = data?.account?.username;
        if (username && username.trim().length > 0) {
          setExistingUsername(username);
        } else {
          setExistingUsername(null);
        }
      } catch (error) {
        console.error('Error checking existing username:', error);
        setExistingError('Unable to check username. Please try again.');
        setExistingUsername(null);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    checkExistingUsername();
  }, [address]);

  // Check username availability (debounced)
  useEffect(() => {
    // Skip availability check if user has existing username or format is invalid
    if (existingUsername || !formatValidation.isValid) {
      setAvailabilityError(null);
      setIsCheckingAvailability(false);
      return;
    }

    const trimmedUsername = inputUsername.trim().toLowerCase();
    if (!trimmedUsername) {
      return;
    }

    // Debounce the availability check
    const timeoutId = setTimeout(async () => {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const { data } = await apolloClient.query({
          query: GET_ACCOUNT_BY_USERNAME,
          variables: { username: trimmedUsername },
          fetchPolicy: 'network-only',
        });

        const existingAccount = data?.accounts?.[0];
        if (existingAccount) {
          // Check if it's the same address (shouldn't happen but handle it)
          if (existingAccount.user?.toLowerCase() === address?.toLowerCase()) {
            // This is the user's own username
            setAvailabilityError(null);
          } else {
            setAvailabilityError('This username is already taken');
          }
        } else {
          setAvailabilityError(null);
        }
      } catch (error) {
        console.error('Error checking username availability:', error);
        setAvailabilityError('Unable to check availability. Please try again.');
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputUsername, existingUsername, formatValidation.isValid, address]);

  // Combined validation state
  const validationState = useMemo(() => {
    if (existingUsername) {
      return { isValid: true, isChecking: false, error: null };
    }

    if (!formatValidation.isValid) {
      return { isValid: false, isChecking: false, error: formatValidation.error };
    }

    if (isCheckingAvailability) {
      return { isValid: false, isChecking: true, error: null };
    }

    if (availabilityError) {
      return { isValid: false, isChecking: false, error: availabilityError };
    }

    // All checks passed
    return { isValid: true, isChecking: false, error: null };
  }, [existingUsername, formatValidation, isCheckingAvailability, availabilityError]);

  // Determine if username is ready for deployment
  const isReady = useMemo(() => {
    if (isLoadingExisting) return false;
    if (existingError) return false;
    if (existingUsername) return true;
    return validationState.isValid && !validationState.isChecking;
  }, [isLoadingExisting, existingError, existingUsername, validationState]);

  // The final username to use for deployment
  const finalUsername = useMemo(() => {
    if (existingUsername) return existingUsername;
    if (validationState.isValid) return inputUsername.trim().toLowerCase();
    return '';
  }, [existingUsername, validationState.isValid, inputUsername]);

  // Retry function for error states
  const retry = useCallback(() => {
    setExistingError(null);
    setAvailabilityError(null);
    // Re-trigger the check
    if (address) {
      setIsLoadingExisting(true);
      apolloClient.query({
        query: FETCH_USERNAME_NEW,
        variables: { id: address.toLowerCase() },
        fetchPolicy: 'network-only',
      }).then(({ data }) => {
        const username = data?.account?.username;
        setExistingUsername(username && username.trim().length > 0 ? username : null);
      }).catch((error) => {
        console.error('Error retrying username check:', error);
        setExistingError('Unable to check username. Please try again.');
      }).finally(() => {
        setIsLoadingExisting(false);
      });
    }
  }, [address]);

  return {
    // Existing username state
    existingUsername,
    isLoading: isLoadingExisting,
    existingError,

    // Input state (only relevant when no existing username)
    inputUsername,
    setInputUsername,

    // Validation state
    validationState,

    // Ready state
    isReady,
    finalUsername,

    // Utilities
    retry,
  };
}

export default useDeployerUsername;
