/**
 * RoleCardSimple - Inline role editing card with all fields visible
 * Shows name, description, assign to me, join method, and powers in a zen layout
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Switch,
  Button,
  ButtonGroup,
  IconButton,
  Badge,
  Icon,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Collapse,
} from '@chakra-ui/react';
import {
  PiUser,
  PiTrash,
  PiTreeStructure,
  PiShieldCheck,
  PiUsers,
  PiPencilSimple,
  PiArrowBendUpLeft,
  PiCrown,
  PiInfo,
} from 'react-icons/pi';
import { roleHasBundle, POWER_BUNDLES } from '../../utils/powerBundles';

/**
 * AssignToMeToggle - Prominent self-assignment toggle
 */
function AssignToMeToggle({ isChecked, onChange, roleName }) {
  return (
    <Box
      p={3}
      borderRadius="lg"
      bg={isChecked ? 'green.50' : 'warmGray.50'}
      border="1px solid"
      borderColor={isChecked ? 'green.200' : 'warmGray.200'}
      transition="all 0.2s"
    >
      <HStack justify="space-between">
        <VStack align="start" spacing={0}>
          <HStack spacing={2}>
            <Icon
              as={PiUser}
              boxSize={4}
              color={isChecked ? 'green.600' : 'warmGray.500'}
            />
            <Text fontWeight="500" fontSize="sm" color={isChecked ? 'green.700' : 'warmGray.700'}>
              {isChecked ? "You'll have this role" : 'Assign to me'}
            </Text>
          </HStack>
          <Text fontSize="xs" color="warmGray.500" ml={6}>
            {isChecked
              ? `You'll be a ${roleName} when your organization launches`
              : 'Toggle on to receive this role at launch'}
          </Text>
        </VStack>
        <Switch
          isChecked={isChecked}
          onChange={onChange}
          colorScheme="green"
          size="md"
        />
      </HStack>
    </Box>
  );
}

/**
 * HierarchySelector - Choose which role manages this one
 * Prevents circular dependencies by tracking the chain
 */
function HierarchySelector({ role, roleIndex, roles, onChange }) {
  const currentParent = role.hierarchy?.adminRoleIndex;
  const isTopLevel = currentParent === null || currentParent === undefined;

  // Get roles that would create a circular dependency
  const getDescendants = (idx, visited = new Set()) => {
    if (visited.has(idx)) return visited;
    visited.add(idx);

    roles.forEach((r, i) => {
      if (r.hierarchy?.adminRoleIndex === idx) {
        getDescendants(i, visited);
      }
    });

    return visited;
  };

  // Roles that can't be parents (self + all descendants)
  const invalidParents = getDescendants(roleIndex);

  // Get valid parent options
  const validParents = roles
    .map((r, i) => ({ role: r, index: i }))
    .filter(({ index }) => !invalidParents.has(index));

  const parentRole = currentParent !== null && currentParent !== undefined
    ? roles[currentParent]
    : null;

  const handleChange = (e) => {
    const value = e.target.value;
    onChange({
      ...role,
      hierarchy: {
        ...role.hierarchy,
        adminRoleIndex: value === '' ? null : parseInt(value),
      },
    });
  };

  const hierarchyTooltip = `Defines the org structure. Parent roles can create sub-roles — but joining happens through Open (anyone) or Vouching (peer approval), not hierarchy.`;

  return (
    <Box>
      <HStack spacing={1} mb={2}>
        <Text fontSize="xs" color="warmGray.500" fontWeight="600">
          Reports to
        </Text>
        <Tooltip
          label={hierarchyTooltip}
          hasArrow
          placement="top"
          maxW="320px"
          fontSize="xs"
          bg="warmGray.800"
          color="white"
          p={3}
          borderRadius="md"
        >
          <Box as="span" cursor="help">
            <Icon as={PiInfo} boxSize={3.5} color="warmGray.400" />
          </Box>
        </Tooltip>
      </HStack>
      <HStack spacing={2}>
        <Icon
          as={isTopLevel ? PiCrown : PiArrowBendUpLeft}
          boxSize={4}
          color={isTopLevel ? 'coral.500' : 'warmGray.400'}
        />
        <Select
          value={currentParent ?? ''}
          onChange={handleChange}
          size="sm"
          flex={1}
          bg={isTopLevel ? 'coral.50' : 'warmGray.50'}
          borderColor={isTopLevel ? 'coral.200' : 'warmGray.200'}
          _focus={{
            borderColor: 'coral.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-coral-400)',
          }}
        >
          <option value="">No one — top of the structure</option>
          {validParents.map(({ role: r, index: i }) => (
            <option key={r.id || i} value={i}>
              {r.name}
            </option>
          ))}
        </Select>
      </HStack>
      {isTopLevel && (
        <Text fontSize="xs" color="coral.600" mt={1.5} ml={6}>
          Root of the org structure — can create and configure roles below
        </Text>
      )}
      {parentRole && (
        <Text fontSize="xs" color="warmGray.500" mt={1.5} ml={6}>
          Part of the structure under {parentRole.name}
        </Text>
      )}
    </Box>
  );
}

/**
 * JoinMethodSelector - Visual button group for open/vouching
 */
function JoinMethodSelector({ value, onChange, roles, role, roleIndex, onVouchingChange }) {
  const isVouching = value === 'vouching';

  return (
    <Box>
      <Text fontSize="xs" color="warmGray.500" fontWeight="600" mb={2}>
        How do new members join?
      </Text>
      <ButtonGroup size="sm" isAttached variant="outline" w="100%">
        <Button
          flex={1}
          bg={value === 'open' ? 'coral.500' : 'white'}
          color={value === 'open' ? 'white' : 'warmGray.600'}
          borderColor={value === 'open' ? 'coral.500' : 'warmGray.300'}
          _hover={{
            bg: value === 'open' ? 'coral.600' : 'warmGray.50',
          }}
          onClick={() => onChange('open')}
        >
          Anyone can join
        </Button>
        <Button
          flex={1}
          bg={value === 'vouching' ? 'coral.500' : 'white'}
          color={value === 'vouching' ? 'white' : 'warmGray.600'}
          borderColor={value === 'vouching' ? 'coral.500' : 'warmGray.300'}
          _hover={{
            bg: value === 'vouching' ? 'coral.600' : 'warmGray.50',
          }}
          onClick={() => onChange('vouching')}
        >
          Needs vouches
        </Button>
      </ButtonGroup>

      {/* Inline vouching config when selected */}
      <Collapse in={isVouching} animateOpacity>
        <HStack mt={3} spacing={2} flexWrap="wrap">
          <NumberInput
            size="sm"
            min={1}
            max={10}
            w="70px"
            value={role.vouching?.quorum || 1}
            onChange={(_, val) => onVouchingChange('quorum', val || 1)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" color="warmGray.600">
            vouch{(role.vouching?.quorum || 1) !== 1 ? 'es' : ''} from
          </Text>
          <Select
            size="sm"
            flex={1}
            minW="120px"
            value={role.vouching?.voucherRoleIndex ?? roleIndex}
            onChange={(e) => onVouchingChange('voucherRoleIndex', parseInt(e.target.value))}
          >
            {roles.map((r, i) => (
              <option key={r.id || i} value={i}>
                {r.name}
              </option>
            ))}
          </Select>
        </HStack>
      </Collapse>
    </Box>
  );
}

/**
 * PowerBadges - Toggleable power bundle badges
 */
function PowerBadges({ roleIndex, permissions, onToggle }) {
  const bundles = [
    {
      key: 'admin',
      label: 'Admin',
      icon: PiShieldCheck,
      color: 'purple',
      desc: 'Can approve rewards for work, create tasks and bounties, set up learning content, and run polls',
    },
    {
      key: 'member',
      label: 'Member',
      icon: PiUsers,
      color: 'blue',
      desc: 'Can join easily, earn and hold tokens, access learning materials, and vote in polls',
    },
    {
      key: 'creator',
      label: 'Creator',
      icon: PiPencilSimple,
      color: 'green',
      desc: 'Can propose new ideas for the community to vote on',
    },
  ];

  return (
    <Box>
      <Text fontSize="xs" color="warmGray.500" fontWeight="600" mb={2}>
        Powers
      </Text>
      <HStack spacing={2} flexWrap="wrap">
        {bundles.map((b) => {
          const isActive = roleHasBundle(permissions, roleIndex, b.key);
          return (
            <Tooltip key={b.key} label={b.desc} hasArrow placement="top">
              <Button
                size="sm"
                variant={isActive ? 'solid' : 'outline'}
                colorScheme={isActive ? b.color : 'gray'}
                leftIcon={<Icon as={b.icon} />}
                borderRadius="full"
                onClick={() => onToggle(b.key)}
                fontWeight="500"
              >
                {b.label}
              </Button>
            </Tooltip>
          );
        })}
      </HStack>
    </Box>
  );
}

/**
 * Main RoleCardSimple component
 */
export function RoleCardSimple({
  role,
  roleIndex,
  roles,
  permissions,
  onUpdate,
  onDelete,
  onTogglePower,
  canDelete = true,
}) {
  const isTopLevel = role.hierarchy?.adminRoleIndex === null;

  // Determine current join method
  const getJoinMethod = () => {
    if (role.vouching?.enabled) return 'vouching';
    return 'open';
  };

  const handleNameChange = (e) => {
    onUpdate(roleIndex, { ...role, name: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    onUpdate(roleIndex, { ...role, description: e.target.value });
  };

  const handleAssignToMeChange = () => {
    const newValue = !role.distribution?.mintToDeployer;
    onUpdate(roleIndex, {
      ...role,
      distribution: {
        ...role.distribution,
        mintToDeployer: newValue,
      },
    });
  };

  const handleJoinMethodChange = (method) => {
    onUpdate(roleIndex, {
      ...role,
      vouching: {
        ...role.vouching,
        enabled: method === 'vouching',
        quorum: method === 'vouching' ? (role.vouching?.quorum || 1) : 0,
      },
    });
  };

  const handleVouchingChange = (field, value) => {
    onUpdate(roleIndex, {
      ...role,
      vouching: {
        ...role.vouching,
        [field]: value,
      },
    });
  };

  const handleHierarchyChange = (updatedRole) => {
    onUpdate(roleIndex, updatedRole);
  };

  return (
    <Box
      bg="white"
      p={{ base: 5, md: 6 }}
      borderRadius="2xl"
      borderLeft="4px solid"
      borderLeftColor={isTopLevel ? 'coral.400' : 'warmGray.200'}
      boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
      transition="all 0.2s"
      _hover={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      <VStack spacing={5} align="stretch">
        {/* Header with name and delete */}
        <HStack justify="space-between" align="start">
          <HStack spacing={2} flex={1}>
            <Icon
              as={isTopLevel ? PiCrown : PiUser}
              boxSize={5}
              color={isTopLevel ? 'coral.500' : 'warmGray.400'}
            />
            <Input
              value={role.name}
              onChange={handleNameChange}
              variant="unstyled"
              fontWeight="600"
              fontSize="lg"
              placeholder="Role name"
              _placeholder={{ color: 'warmGray.400' }}
            />
          </HStack>

          {canDelete && (
            <IconButton
              icon={<Icon as={PiTrash} />}
              size="sm"
              variant="ghost"
              color="warmGray.400"
              _hover={{ color: 'red.500', bg: 'red.50' }}
              onClick={() => onDelete(roleIndex)}
              aria-label="Delete role"
            />
          )}
        </HStack>

        {/* Description */}
        <Box>
          <Text fontSize="xs" color="warmGray.500" fontWeight="600" mb={2}>
            What does this role do?
          </Text>
          <HStack align="flex-end">
            <Textarea
              value={role.description || ''}
              onChange={handleDescriptionChange}
              placeholder="Describe what people in this role will do..."
              size="sm"
              resize="none"
              rows={2}
              bg="warmGray.50"
              border="1px solid"
              borderColor="warmGray.200"
              _focus={{
                borderColor: 'coral.400',
                boxShadow: '0 0 0 1px var(--chakra-colors-coral-400)',
              }}
              _placeholder={{ color: 'warmGray.400' }}
            />
            <Text fontSize="xs" color="warmGray.400" minW="40px" textAlign="right">
              {(role.description || '').length}/200
            </Text>
          </HStack>
        </Box>

        {/* Hierarchy - who manages this role */}
        <HierarchySelector
          role={role}
          roleIndex={roleIndex}
          roles={roles}
          onChange={handleHierarchyChange}
        />

        {/* Assign to me */}
        <AssignToMeToggle
          isChecked={role.distribution?.mintToDeployer || false}
          onChange={handleAssignToMeChange}
          roleName={role.name}
        />

        {/* Join method */}
        <JoinMethodSelector
          value={getJoinMethod()}
          onChange={handleJoinMethodChange}
          roles={roles}
          role={role}
          roleIndex={roleIndex}
          onVouchingChange={handleVouchingChange}
        />

        {/* Powers */}
        <PowerBadges
          roleIndex={roleIndex}
          permissions={permissions}
          onToggle={(bundleKey) => onTogglePower(roleIndex, bundleKey)}
        />
      </VStack>
    </Box>
  );
}

export default RoleCardSimple;
