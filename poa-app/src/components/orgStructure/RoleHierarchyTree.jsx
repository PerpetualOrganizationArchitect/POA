/**
 * RoleHierarchyTree - Visual tree display of Hats Protocol roles
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Tooltip,
  Skeleton,
} from '@chakra-ui/react';
import { FiUsers, FiShield, FiCheckCircle } from 'react-icons/fi';
import { ClaimRoleButton } from './ClaimRoleButton';

const glassLayerStyle = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  zIndex: -1,
  borderRadius: 'inherit',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  boxShadow: 'inset 0 0 15px rgba(148, 115, 220, 0.15)',
  border: '1px solid rgba(148, 115, 220, 0.2)',
};

/**
 * Normalize hat ID for comparison
 */
function normalizeHatId(id) {
  if (id === null || id === undefined) return '';
  const str = String(id).trim();
  if (str.startsWith('0x') || str.startsWith('0X')) {
    return str.toLowerCase();
  }
  return str;
}

/**
 * Single role node in the tree
 */
function RoleNode({
  role,
  isLast = false,
  userHasRole = false,
  isClaiming = false,
  onClaim,
  isConnected = true,
  showClaimButton = true,
}) {
  const { name, memberCount, level, vouchingEnabled, vouchingQuorum } = role;

  return (
    <Box position="relative" pl={level > 0 ? 8 : 0} py={2}>
      {/* Connector line for child roles */}
      {level > 0 && (
        <>
          {/* Horizontal line */}
          <Box
            position="absolute"
            left="16px"
            top="50%"
            width="16px"
            height="2px"
            bg="purple.500"
            opacity={0.5}
          />
          {/* Vertical line */}
          <Box
            position="absolute"
            left="16px"
            top={0}
            bottom={isLast ? '50%' : 0}
            width="2px"
            bg="purple.500"
            opacity={0.5}
          />
        </>
      )}

      {/* Role card */}
      <Box
        position="relative"
        borderRadius="xl"
        p={4}
        overflow="hidden"
        transition="all 0.2s"
        _hover={{
          transform: 'translateX(4px)',
          '& > div:first-of-type': {
            borderColor: 'rgba(148, 115, 220, 0.5)',
          },
        }}
      >
        <Box
          position="absolute"
          inset={0}
          borderRadius="inherit"
          backdropFilter="blur(10px)"
          backgroundColor="rgba(30, 30, 40, 0.6)"
          border="1px solid rgba(148, 115, 220, 0.2)"
          transition="border-color 0.2s"
          zIndex={-1}
        />

        <HStack justify="space-between" spacing={4}>
          {/* Role info */}
          <HStack spacing={3}>
            <Box
              p={2}
              borderRadius="lg"
              bg="rgba(148, 115, 220, 0.2)"
            >
              <Icon as={FiShield} color="purple.300" boxSize={5} />
            </Box>

            <VStack align="flex-start" spacing={0}>
              <Text fontWeight="bold" color="white" fontSize="md">
                {name}
              </Text>
              {vouchingEnabled && (
                <Tooltip
                  label={`Requires ${vouchingQuorum} vouches to join`}
                  placement="top"
                >
                  <HStack spacing={1}>
                    <Icon as={FiCheckCircle} color="green.400" boxSize={3} />
                    <Text fontSize="xs" color="gray.400">
                      Vouching enabled
                    </Text>
                  </HStack>
                </Tooltip>
              )}
            </VStack>
          </HStack>

          {/* Member count badge and claim button */}
          <HStack spacing={3}>
            <Badge
              colorScheme="purple"
              px={3}
              py={1}
              borderRadius="full"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Icon as={FiUsers} boxSize={3} />
              {memberCount}
            </Badge>

            {showClaimButton && (
              <ClaimRoleButton
                role={role}
                userHasRole={userHasRole}
                isClaiming={isClaiming}
                onClaim={onClaim}
                isConnected={isConnected}
              />
            )}
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
}

export function RoleHierarchyTree({
  roles = [],
  loading = false,
  userHatIds = [],
  onClaimRole,
  isClaimingHat,
  isConnected = true,
  showClaimButtons = true,
}) {
  // Normalize user hat IDs for comparison
  const normalizedUserHatIds = userHatIds.map(id => normalizeHatId(id));

  // Check if user has a specific role
  const userHasHat = (hatId) => {
    const normalizedHatId = normalizeHatId(hatId);
    return normalizedUserHatIds.includes(normalizedHatId);
  };

  if (loading) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
      >
        <Box style={glassLayerStyle} />
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="60px" borderRadius="xl" />
          ))}
        </VStack>
      </Box>
    );
  }

  if (roles.length === 0) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
        textAlign="center"
      >
        <Box style={glassLayerStyle} />
        <Text color="gray.400">No roles defined for this organization</Text>
      </Box>
    );
  }

  // Group roles by level for tree structure
  const sortedRoles = [...roles].sort((a, b) => a.level - b.level);

  return (
    <Box
      position="relative"
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      overflow="hidden"
    >
      <Box style={glassLayerStyle} />

      <VStack spacing={2} align="stretch">
        {sortedRoles.map((role, index) => (
          <RoleNode
            key={role.id || role.hatId}
            role={role}
            isLast={index === sortedRoles.length - 1 ||
                    (sortedRoles[index + 1]?.level <= role.level)}
            userHasRole={userHasHat(role.hatId)}
            isClaiming={isClaimingHat?.(role.hatId) || false}
            onClaim={onClaimRole}
            isConnected={isConnected}
            showClaimButton={showClaimButtons}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default RoleHierarchyTree;
