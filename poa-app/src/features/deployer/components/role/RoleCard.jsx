/**
 * RoleCard - Displays a single role with edit/delete actions
 */

import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Avatar,
  Tooltip,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DragHandleIcon,
} from '@chakra-ui/icons';
import { useDeployer } from '../../context/DeployerContext';

export function RoleCard({
  role,
  index,
  onEdit,
  onDelete,
  depth = 0,
  isDraggable = false,
  showDetails = false,
}) {
  const { state } = useDeployer();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: showDetails });

  const isTopLevel = role.hierarchy.adminRoleIndex === null;
  const parentRole = !isTopLevel && state.roles[role.hierarchy.adminRoleIndex];

  // Determine role type badges
  const badges = [];
  if (isTopLevel) {
    badges.push({ label: 'Top Level', colorScheme: 'purple' });
  }
  if (role.canVote) {
    badges.push({ label: 'Can Vote', colorScheme: 'green' });
  }
  if (role.vouching?.enabled) {
    badges.push({ label: 'Vouching', colorScheme: 'orange' });
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={3}
      bg="white"
      boxShadow="sm"
      ml={depth * 8}
      _hover={{ boxShadow: 'md' }}
      transition="box-shadow 0.2s"
    >
      {/* Hierarchy connector line */}
      {depth > 0 && (
        <Box
          position="absolute"
          left={`${depth * 8 - 12}px`}
          top="50%"
          w="10px"
          borderBottom="2px solid"
          borderLeft="2px solid"
          borderColor="gray.300"
          h="20px"
          transform="translateY(-100%)"
        />
      )}

      <HStack justify="space-between" align="start">
        {/* Left side: drag handle and role info */}
        <HStack spacing={3} flex={1}>
          {isDraggable && (
            <Box cursor="grab" color="gray.400" _hover={{ color: 'gray.600' }}>
              <DragHandleIcon />
            </Box>
          )}

          <Avatar
            size="sm"
            name={role.name}
            src={role.image}
            bg="blue.500"
          />

          <VStack align="start" spacing={0} flex={1}>
            <HStack>
              <Text fontWeight="semibold" fontSize="md">
                {role.name}
              </Text>
              {badges.map((badge, idx) => (
                <Badge key={idx} colorScheme={badge.colorScheme} fontSize="xs">
                  {badge.label}
                </Badge>
              ))}
            </HStack>

            {parentRole && (
              <Text fontSize="xs" color="gray.500">
                Reports to: {parentRole.name}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Right side: actions */}
        <HStack spacing={1}>
          <Tooltip label="Edit role">
            <IconButton
              aria-label="Edit role"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(index)}
            />
          </Tooltip>
          <Tooltip label="Delete role">
            <IconButton
              aria-label="Delete role"
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => onDelete(index)}
              isDisabled={state.roles.length <= 1}
            />
          </Tooltip>
          <IconButton
            aria-label="Toggle details"
            icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="sm"
            variant="ghost"
            onClick={onToggle}
          />
        </HStack>
      </HStack>

      {/* Expanded details */}
      <Collapse in={isOpen}>
        <Box mt={3} pt={3} borderTopWidth="1px" borderColor="gray.100">
          <VStack align="start" spacing={2} fontSize="sm" color="gray.600">
            {/* Hierarchy info */}
            <HStack>
              <Text fontWeight="medium">Parent:</Text>
              <Text>{isTopLevel ? 'None (Top Level)' : parentRole?.name}</Text>
            </HStack>

            {/* Voting */}
            <HStack>
              <Text fontWeight="medium">Voting:</Text>
              <Text>{role.canVote ? 'Enabled' : 'Disabled'}</Text>
            </HStack>

            {/* Vouching */}
            {role.vouching?.enabled && (
              <HStack>
                <Text fontWeight="medium">Vouching:</Text>
                <Text>
                  {role.vouching.quorum} vouch(es) required from{' '}
                  {state.roles[role.vouching.voucherRoleIndex]?.name || 'Unknown'}
                </Text>
              </HStack>
            )}

            {/* Distribution */}
            <HStack>
              <Text fontWeight="medium">Mint to Deployer:</Text>
              <Text>{role.distribution?.mintToDeployer ? 'Yes' : 'No'}</Text>
            </HStack>

            {/* Hat Config */}
            <HStack>
              <Text fontWeight="medium">Max Supply:</Text>
              <Text>{role.hatConfig?.maxSupply || 'Unlimited'}</Text>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default RoleCard;
