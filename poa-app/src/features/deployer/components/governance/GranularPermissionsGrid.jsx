/**
 * GranularPermissionsGrid - Zen-styled permission matrix for advanced mode
 *
 * Features:
 * - Grouped permissions by category
 * - Visual toggle boxes for each role
 * - Tooltips with role names
 * - Clean, readable layout
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import {
  PiCheck,
  PiUserPlus,
  PiCoins,
  PiClipboardText,
  PiGraduationCap,
  PiChatDots,
} from 'react-icons/pi';

// Permission groups with human-readable labels
const PERMISSION_GROUPS = [
  {
    name: 'Joining & Tokens',
    icon: PiUserPlus,
    color: 'coral',
    permissions: [
      { key: 'quickJoinRoles', label: 'Quick Join', desc: 'Role is given when joining without vouching' },
      { key: 'tokenMemberRoles', label: 'Hold Tokens', desc: 'Can receive and hold participation tokens' },
      { key: 'tokenApproverRoles', label: 'Approve Tokens', desc: 'Can approve token transfer requests' },
    ],
  },
  {
    name: 'Tasks',
    icon: PiClipboardText,
    color: 'green',
    permissions: [
      { key: 'taskCreatorRoles', label: 'Create Tasks', desc: 'Can create and assign tasks to members' },
    ],
  },
  {
    name: 'Education',
    icon: PiGraduationCap,
    color: 'purple',
    permissions: [
      { key: 'educationCreatorRoles', label: 'Create Content', desc: 'Can build learning modules and courses' },
      { key: 'educationMemberRoles', label: 'Access Content', desc: 'Can take courses and earn certifications' },
    ],
  },
  {
    name: 'Governance',
    icon: PiChatDots,
    color: 'blue',
    permissions: [
      { key: 'hybridProposalCreatorRoles', label: 'Create Proposals', desc: 'Can create hybrid voting proposals' },
      { key: 'ddVotingRoles', label: 'Vote in Polls', desc: 'Can vote in direct democracy polls' },
      { key: 'ddCreatorRoles', label: 'Create Polls', desc: 'Can create direct democracy polls' },
    ],
  },
];

function PermissionToggle({ isActive, onClick, roleIndex, roleName }) {
  return (
    <Tooltip label={roleName} placement="top" hasArrow>
      <Box
        as="button"
        w="32px"
        h="32px"
        borderRadius="md"
        bg={isActive ? 'coral.100' : 'warmGray.100'}
        border="2px solid"
        borderColor={isActive ? 'coral.400' : 'warmGray.200'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={onClick}
        cursor="pointer"
        transition="all 0.15s ease"
        _hover={{
          borderColor: isActive ? 'coral.500' : 'coral.300',
          bg: isActive ? 'coral.200' : 'coral.50',
          transform: 'scale(1.05)',
        }}
        _active={{
          transform: 'scale(0.95)',
        }}
      >
        {isActive && <Icon as={PiCheck} color="coral.600" boxSize={4} />}
      </Box>
    </Tooltip>
  );
}

function RoleHeader({ roles }) {
  return (
    <HStack spacing={2} justify="flex-end" mb={2} pr={1}>
      {roles.map((role, idx) => (
        <Tooltip key={idx} label={role.name} placement="top" hasArrow>
          <Box
            w="32px"
            h="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize="xs"
              fontWeight="600"
              color="warmGray.500"
              noOfLines={1}
              textAlign="center"
            >
              {role.name.substring(0, 3)}
            </Text>
          </Box>
        </Tooltip>
      ))}
    </HStack>
  );
}

export function GranularPermissionsGrid({ roles, permissions, onToggle }) {
  const hasPermission = (permKey, roleIndex) => {
    return (permissions[permKey] || []).includes(roleIndex);
  };

  const handleToggle = (permKey, roleIndex) => {
    onToggle(permKey, roleIndex);
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Role header showing abbreviations */}
      <Box pl={{ base: 0, md: '180px' }}>
        <RoleHeader roles={roles} />
      </Box>

      {PERMISSION_GROUPS.map((group) => (
        <Box
          key={group.name}
          bg="white"
          p={{ base: 4, md: 5 }}
          borderRadius="xl"
          border="1px solid"
          borderColor="warmGray.100"
          boxShadow="0 1px 3px rgba(0, 0, 0, 0.04)"
        >
          {/* Group header */}
          <HStack spacing={2} mb={4}>
            <Box
              w="28px"
              h="28px"
              borderRadius="md"
              bg={`${group.color}.50`}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={group.icon} color={`${group.color}.500`} boxSize={4} />
            </Box>
            <Text
              fontSize="sm"
              fontWeight="600"
              color="warmGray.700"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              {group.name}
            </Text>
          </HStack>

          {/* Permission rows */}
          <VStack spacing={3} align="stretch">
            {group.permissions.map((perm) => (
              <Flex
                key={perm.key}
                justify="space-between"
                align="center"
                py={2}
                borderBottom="1px solid"
                borderColor="warmGray.50"
                _last={{ borderBottom: 'none' }}
              >
                {/* Permission info */}
                <Box flex="1" minW="0" pr={4}>
                  <Text fontSize="sm" fontWeight="500" color="warmGray.800">
                    {perm.label}
                  </Text>
                  <Text fontSize="xs" color="warmGray.500" noOfLines={2}>
                    {perm.desc}
                  </Text>
                </Box>

                {/* Role toggles */}
                <HStack spacing={2} flexShrink={0}>
                  {roles.map((role, idx) => (
                    <PermissionToggle
                      key={idx}
                      isActive={hasPermission(perm.key, idx)}
                      onClick={() => handleToggle(perm.key, idx)}
                      roleIndex={idx}
                      roleName={role.name}
                    />
                  ))}
                </HStack>
              </Flex>
            ))}
          </VStack>
        </Box>
      ))}

      {/* Legend */}
      <Box
        bg="warmGray.50"
        p={3}
        borderRadius="lg"
        border="1px dashed"
        borderColor="warmGray.200"
      >
        <HStack spacing={4} flexWrap="wrap">
          <HStack spacing={2}>
            <Box
              w="20px"
              h="20px"
              borderRadius="sm"
              bg="coral.100"
              border="2px solid"
              borderColor="coral.400"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={PiCheck} color="coral.600" boxSize={3} />
            </Box>
            <Text fontSize="xs" color="warmGray.600">
              Permission granted
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Box
              w="20px"
              h="20px"
              borderRadius="sm"
              bg="warmGray.100"
              border="2px solid"
              borderColor="warmGray.200"
            />
            <Text fontSize="xs" color="warmGray.600">
              Click to grant
            </Text>
          </HStack>
        </HStack>
      </Box>
    </VStack>
  );
}

export default GranularPermissionsGrid;
