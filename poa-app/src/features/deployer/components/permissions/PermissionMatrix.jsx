/**
 * PermissionMatrix - Grid for assigning permissions to roles
 */

import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Text,
  Tooltip,
  Icon,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { InfoIcon, CheckIcon } from '@chakra-ui/icons';
import { useDeployer, PERMISSION_KEYS, PERMISSION_DESCRIPTIONS } from '../../context/DeployerContext';

export function PermissionMatrix() {
  const { state, actions } = useDeployer();
  const { roles, permissions } = state;

  const headerBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  // Check if a role has a permission
  const hasPermission = (permissionKey, roleIndex) => {
    return permissions[permissionKey]?.includes(roleIndex) ?? false;
  };

  // Toggle a permission for a role
  const togglePermission = (permissionKey, roleIndex) => {
    const currentRoles = permissions[permissionKey] || [];
    let newRoles;

    if (currentRoles.includes(roleIndex)) {
      newRoles = currentRoles.filter((idx) => idx !== roleIndex);
    } else {
      newRoles = [...currentRoles, roleIndex];
    }

    actions.setPermission(permissionKey, newRoles);
  };

  // Toggle all roles for a permission
  const toggleAllForPermission = (permissionKey) => {
    const currentRoles = permissions[permissionKey] || [];
    let newRoles;

    if (currentRoles.length === roles.length) {
      // All selected, deselect all
      newRoles = [];
    } else {
      // Select all
      newRoles = roles.map((_, idx) => idx);
    }

    actions.setPermission(permissionKey, newRoles);
  };

  // Toggle all permissions for a role
  const toggleAllForRole = (roleIndex) => {
    const allPermissionsSet = PERMISSION_KEYS.every((key) =>
      (permissions[key] || []).includes(roleIndex)
    );

    PERMISSION_KEYS.forEach((key) => {
      const currentRoles = permissions[key] || [];
      let newRoles;

      if (allPermissionsSet) {
        // Remove from all
        newRoles = currentRoles.filter((idx) => idx !== roleIndex);
      } else {
        // Add to all
        if (!currentRoles.includes(roleIndex)) {
          newRoles = [...currentRoles, roleIndex];
        } else {
          newRoles = currentRoles;
        }
      }

      actions.setPermission(key, newRoles);
    });
  };

  if (roles.length === 0) {
    return (
      <Box
        p={8}
        textAlign="center"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor="gray.200"
        borderRadius="lg"
      >
        <Text color="gray.500">
          No roles defined. Go back to create roles first.
        </Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto">
      <Table size="sm" variant="simple">
        <Thead>
          <Tr bg={headerBg}>
            <Th position="sticky" left={0} bg={headerBg} zIndex={1}>
              Permission
            </Th>
            {roles.map((role, idx) => (
              <Th key={idx} textAlign="center" minW="100px">
                <VStack spacing={1}>
                  <Text fontSize="xs" fontWeight="bold" noOfLines={1}>
                    {role.name}
                  </Text>
                  <Tooltip label="Toggle all permissions for this role">
                    <Checkbox
                      size="sm"
                      isChecked={PERMISSION_KEYS.every((key) =>
                        (permissions[key] || []).includes(idx)
                      )}
                      isIndeterminate={
                        PERMISSION_KEYS.some((key) =>
                          (permissions[key] || []).includes(idx)
                        ) &&
                        !PERMISSION_KEYS.every((key) =>
                          (permissions[key] || []).includes(idx)
                        )
                      }
                      onChange={() => toggleAllForRole(idx)}
                    />
                  </Tooltip>
                </VStack>
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {PERMISSION_KEYS.map((permKey) => {
            const desc = PERMISSION_DESCRIPTIONS[permKey];
            const selectedCount = (permissions[permKey] || []).length;

            return (
              <Tr key={permKey} _hover={{ bg: hoverBg }}>
                <Td position="sticky" left={0} bg="white" zIndex={1}>
                  <HStack spacing={2}>
                    <Box>
                      <HStack spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {desc.label}
                        </Text>
                        <Tooltip label={desc.description}>
                          <Icon as={InfoIcon} color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        {selectedCount === 0
                          ? 'No roles'
                          : selectedCount === roles.length
                          ? 'All roles'
                          : `${selectedCount} role${selectedCount !== 1 ? 's' : ''}`}
                      </Text>
                    </Box>
                  </HStack>
                </Td>
                {roles.map((role, roleIdx) => (
                  <Td key={roleIdx} textAlign="center">
                    <Checkbox
                      isChecked={hasPermission(permKey, roleIdx)}
                      onChange={() => togglePermission(permKey, roleIdx)}
                      colorScheme="blue"
                    />
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {/* Summary */}
      <Box mt={4} p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" fontWeight="medium" mb={2}>
          Summary
        </Text>
        <HStack spacing={4} flexWrap="wrap">
          {roles.map((role, idx) => {
            const permCount = PERMISSION_KEYS.filter((key) =>
              (permissions[key] || []).includes(idx)
            ).length;

            return (
              <Badge
                key={idx}
                colorScheme={permCount === 0 ? 'gray' : permCount === PERMISSION_KEYS.length ? 'green' : 'blue'}
                px={2}
                py={1}
              >
                {role.name}: {permCount}/{PERMISSION_KEYS.length}
              </Badge>
            );
          })}
        </HStack>
      </Box>
    </Box>
  );
}

export default PermissionMatrix;
