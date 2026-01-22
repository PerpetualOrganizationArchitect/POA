/**
 * PowerBundleCard - Simplified permission assignment
 *
 * Displays a power bundle (Admin, Member, Creator) and allows users
 * to assign it to roles via checkboxes.
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Checkbox,
  CheckboxGroup,
  Badge,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { POWER_BUNDLES } from '../../utils/powerBundles';

// Icons for bundles
const BUNDLE_ICONS = {
  admin: '🛡️',
  member: '👥',
  creator: '✏️',
};

// Colors for bundles
const BUNDLE_COLORS = {
  admin: 'purple',
  member: 'blue',
  creator: 'green',
};

export function PowerBundleCard({
  bundleKey,
  roles,
  selectedRoleIndices,
  onToggleRole,
  isDisabled = false,
}) {
  const bundle = POWER_BUNDLES[bundleKey];
  if (!bundle) return null;

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const descriptionColor = useColorModeValue('gray.600', 'gray.400');

  const icon = BUNDLE_ICONS[bundleKey] || '📋';
  const colorScheme = BUNDLE_COLORS[bundleKey] || 'gray';

  const handleChange = (roleIndex) => {
    if (onToggleRole) {
      onToggleRole(bundleKey, roleIndex);
    }
  };

  return (
    <Box
      bg={cardBg}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      opacity={isDisabled ? 0.6 : 1}
    >
      <VStack align="stretch" spacing={3}>
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Text fontSize="xl">{icon}</Text>
            <Text fontWeight="bold">{bundle.name}</Text>
          </HStack>
          <Tooltip label={bundle.permissions.join(', ')} placement="top">
            <InfoOutlineIcon color="gray.400" boxSize={4} cursor="help" />
          </Tooltip>
        </HStack>

        {/* Description */}
        <Text fontSize="sm" color={descriptionColor}>
          {bundle.description}
        </Text>

        {/* Role Checkboxes */}
        <Box pt={2}>
          <Text fontSize="xs" color="gray.500" mb={2}>
            Which roles have this power?
          </Text>
          <VStack align="stretch" spacing={2}>
            {roles.map((role, index) => (
              <Checkbox
                key={role.id || index}
                isChecked={selectedRoleIndices.includes(index)}
                onChange={() => handleChange(index)}
                isDisabled={isDisabled}
                colorScheme={colorScheme}
                size="sm"
              >
                <HStack spacing={2}>
                  <Text>{role.name}</Text>
                  {role.hierarchy.adminRoleIndex === null && (
                    <Badge size="xs" colorScheme="gray">
                      Leader
                    </Badge>
                  )}
                </HStack>
              </Checkbox>
            ))}
          </VStack>
        </Box>

        {/* Summary Badge */}
        <HStack justify="flex-end" pt={1}>
          <Badge colorScheme={colorScheme} fontSize="xs">
            {selectedRoleIndices.length} of {roles.length} roles
          </Badge>
        </HStack>
      </VStack>
    </Box>
  );
}

export default PowerBundleCard;
