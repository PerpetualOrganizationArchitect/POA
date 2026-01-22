/**
 * ClaimRoleButton - Button to claim a role (hat) for the current user
 * Shows different states based on eligibility and claiming status
 */

import React from 'react';
import {
  Button,
  Tooltip,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import { FiCheckCircle, FiUserPlus, FiLock } from 'react-icons/fi';

/**
 * ClaimRoleButton component
 * @param {Object} props
 * @param {Object} props.role - Role data including hatId, defaultEligible, vouchingEnabled
 * @param {boolean} props.userHasRole - Whether the current user already has this role
 * @param {boolean} props.isClaiming - Whether this role is currently being claimed
 * @param {Function} props.onClaim - Callback when claim button is clicked
 * @param {boolean} props.disabled - Whether the button should be disabled
 * @param {boolean} props.isConnected - Whether wallet is connected
 */
export function ClaimRoleButton({
  role,
  userHasRole = false,
  isClaiming = false,
  onClaim,
  disabled = false,
  isConnected = true,
}) {
  const { hatId, defaultEligible, vouchingEnabled, vouchingQuorum } = role;

  // User already has this role
  if (userHasRole) {
    return (
      <Tooltip label="You have this role" placement="top">
        <Button
          size="sm"
          variant="ghost"
          colorScheme="green"
          leftIcon={<Icon as={FiCheckCircle} />}
          isDisabled
          _disabled={{
            opacity: 0.8,
            cursor: 'default',
          }}
        >
          Claimed
        </Button>
      </Tooltip>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <Tooltip label="Connect wallet to claim roles" placement="top">
        <Button
          size="sm"
          variant="outline"
          colorScheme="purple"
          leftIcon={<Icon as={FiLock} />}
          isDisabled
        >
          Claim
        </Button>
      </Tooltip>
    );
  }

  // Requires vouching (not directly claimable)
  if (vouchingEnabled && !defaultEligible) {
    return (
      <Tooltip
        label={`Requires ${vouchingQuorum || 'N'} vouches from existing members`}
        placement="top"
      >
        <Button
          size="sm"
          variant="outline"
          colorScheme="yellow"
          leftIcon={<Icon as={FiUserPlus} />}
          isDisabled
        >
          Vouching Required
        </Button>
      </Tooltip>
    );
  }

  // Directly claimable (defaultEligible = true)
  if (defaultEligible) {
    return (
      <Tooltip label="Claim this role" placement="top">
        <Button
          size="sm"
          variant="solid"
          colorScheme="purple"
          leftIcon={isClaiming ? <Spinner size="xs" /> : <Icon as={FiUserPlus} />}
          isLoading={isClaiming}
          loadingText="Claiming..."
          isDisabled={disabled || isClaiming}
          onClick={() => onClaim?.(hatId)}
          _hover={{
            transform: 'scale(1.02)',
            boxShadow: '0 0 20px rgba(148, 115, 220, 0.4)',
          }}
          transition="all 0.2s"
        >
          Claim Role
        </Button>
      </Tooltip>
    );
  }

  // Default: not claimable (shouldn't reach here typically)
  return (
    <Tooltip label="This role cannot be claimed directly" placement="top">
      <Button
        size="sm"
        variant="ghost"
        colorScheme="gray"
        leftIcon={<Icon as={FiLock} />}
        isDisabled
      >
        Restricted
      </Button>
    </Tooltip>
  );
}

export default ClaimRoleButton;
