/**
 * GranularPermissionsModal - Modal for fine-tuning all permissions for a specific role
 *
 * Accessed from RoleCardAdvanced in advanced mode
 */

import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Icon,
  Switch,
  Box,
  Button,
  Divider,
} from '@chakra-ui/react';
import {
  PiUserPlus,
  PiCoins,
  PiClipboardText,
  PiGraduationCap,
  PiChatDots,
  PiShieldCheck,
} from 'react-icons/pi';

// Permission definitions grouped by category
const PERMISSION_GROUPS = [
  {
    name: 'Joining & Tokens',
    icon: PiUserPlus,
    color: 'coral',
    permissions: [
      { key: 'quickJoinRoles', label: 'Quick Join', desc: 'Role given when joining without vouching' },
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

function PermissionRow({ permission, isEnabled, onToggle, color }) {
  return (
    <HStack
      justify="space-between"
      py={3}
      px={2}
      borderRadius="md"
      _hover={{ bg: 'warmGray.50' }}
      transition="background 0.15s"
    >
      <Box flex="1">
        <Text fontSize="sm" fontWeight="500" color="warmGray.800">
          {permission.label}
        </Text>
        <Text fontSize="xs" color="warmGray.500">
          {permission.desc}
        </Text>
      </Box>
      <Switch
        isChecked={isEnabled}
        onChange={onToggle}
        colorScheme={color}
        size="md"
      />
    </HStack>
  );
}

export function GranularPermissionsModal({
  isOpen,
  onClose,
  role,
  roleIndex,
  permissions,
  onTogglePermission,
}) {
  const hasPermission = (permKey) => {
    return (permissions[permKey] || []).includes(roleIndex);
  };

  const handleToggle = (permKey) => {
    onTogglePermission(permKey, roleIndex);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="2xl"
        boxShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
        mx={4}
      >
        <ModalHeader pb={2}>
          <HStack spacing={3}>
            <Box
              w="40px"
              h="40px"
              borderRadius="lg"
              bg="coral.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={PiShieldCheck} color="coral.600" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="600" color="warmGray.900">
                Permissions for {role.name}
              </Text>
              <Text fontSize="sm" color="warmGray.500" fontWeight="normal">
                Fine-tune what this role can do
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} />

        <ModalBody pt={0} pb={4}>
          <VStack spacing={4} align="stretch">
            {PERMISSION_GROUPS.map((group, groupIdx) => (
              <Box key={group.name}>
                {groupIdx > 0 && <Divider mb={4} borderColor="warmGray.100" />}

                {/* Group header */}
                <HStack spacing={2} mb={2}>
                  <Box
                    w="24px"
                    h="24px"
                    borderRadius="md"
                    bg={`${group.color}.50`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={group.icon} color={`${group.color}.500`} boxSize={3.5} />
                  </Box>
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color="warmGray.500"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    {group.name}
                  </Text>
                </HStack>

                {/* Permission rows */}
                <VStack spacing={0} align="stretch">
                  {group.permissions.map((perm) => (
                    <PermissionRow
                      key={perm.key}
                      permission={perm}
                      isEnabled={hasPermission(perm.key)}
                      onToggle={() => handleToggle(perm.key)}
                      color={group.color}
                    />
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="warmGray.100" pt={4}>
          <Button
            bg="coral.500"
            color="white"
            _hover={{ bg: 'coral.600' }}
            onClick={onClose}
            borderRadius="lg"
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default GranularPermissionsModal;
