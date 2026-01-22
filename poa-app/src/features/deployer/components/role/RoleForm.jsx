/**
 * RoleForm - Complete form for creating/editing a role
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Textarea,
  Switch,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Divider,
  Text,
  Heading,
  Collapse,
  useDisclosure,
  Alert,
  AlertIcon,
  Checkbox,
  Tooltip,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { InfoIcon, ChevronDownIcon, ChevronUpIcon, AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useDeployer } from '../../context/DeployerContext';
import { wouldCreateCycle, getValidParentOptions } from '../../utils/hierarchyUtils';

export function RoleForm({
  role,
  roleIndex,
  onSave,
  onCancel,
  isNew = false,
}) {
  const { state } = useDeployer();
  const [formData, setFormData] = useState({ ...role });
  const [errors, setErrors] = useState({});

  // Collapsible sections
  const vouchingDisclosure = useDisclosure({ defaultIsOpen: role?.vouching?.enabled });
  const advancedDisclosure = useDisclosure();

  // Get valid parent options (excludes self and descendants)
  const validParents = getValidParentOptions(roleIndex, state.roles);
  const parentOptions = validParents.map(idx => ({
    value: idx,
    label: state.roles[idx]?.name || `Role ${idx}`,
  }));

  // Get roles that can vouch (for vouching config)
  const voucherRoleOptions = state.roles.map((r, idx) => ({
    value: idx,
    label: r.name || `Role ${idx}`,
  }));

  // Update form field
  const updateField = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[path];
      return newErrors;
    });
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Role name is required';
    }

    // Check for duplicate names
    const duplicateName = state.roles.some((r, idx) =>
      idx !== roleIndex && r.name.toLowerCase() === formData.name?.toLowerCase()
    );
    if (duplicateName) {
      newErrors.name = 'Role name must be unique';
    }

    // Check hierarchy for cycles
    if (formData.hierarchy.adminRoleIndex !== null) {
      if (wouldCreateCycle(roleIndex, formData.hierarchy.adminRoleIndex, state.roles)) {
        newErrors['hierarchy.adminRoleIndex'] = 'This would create a circular dependency';
      }
    }

    // Validate vouching
    if (formData.vouching.enabled) {
      if (formData.vouching.quorum <= 0) {
        newErrors['vouching.quorum'] = 'Quorum must be at least 1';
      }
      if (formData.vouching.voucherRoleIndex < 0 || formData.vouching.voucherRoleIndex >= state.roles.length) {
        newErrors['vouching.voucherRoleIndex'] = 'Select a valid voucher role';
      }
    }

    // Validate hat config
    if (formData.hatConfig.maxSupply <= 0) {
      newErrors['hatConfig.maxSupply'] = 'Max supply must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Box>
      <VStack spacing={5} align="stretch">
        {/* Basic Info */}
        <Box>
          <Heading size="sm" mb={3}>Basic Information</Heading>

          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Role Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Member, Executive, Manager"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the responsibilities and purpose of this role..."
                rows={3}
              />
              <FormHelperText>A brief description of this role's purpose and responsibilities</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Role Image URL</FormLabel>
              <Input
                value={formData.image}
                onChange={(e) => updateField('image', e.target.value)}
                placeholder="https://..."
              />
              <FormHelperText>Optional image URL for the role</FormHelperText>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0}>Can Vote</FormLabel>
              <Switch
                isChecked={formData.canVote}
                onChange={(e) => updateField('canVote', e.target.checked)}
                colorScheme="green"
              />
              <Tooltip label="Members with this role can participate in governance votes">
                <Icon as={InfoIcon} ml={2} color="gray.400" />
              </Tooltip>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Hierarchy */}
        <Box>
          <Heading size="sm" mb={3}>Hierarchy</Heading>

          <FormControl isInvalid={!!errors['hierarchy.adminRoleIndex']}>
            <FormLabel>Parent Role (Admin)</FormLabel>
            <Select
              value={formData.hierarchy.adminRoleIndex ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField('hierarchy.adminRoleIndex', val === '' ? null : parseInt(val, 10));
              }}
            >
              <option value="">None (Top-Level Role)</option>
              {parentOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <FormHelperText>
              The parent role can manage members of this role
            </FormHelperText>
            <FormErrorMessage>{errors['hierarchy.adminRoleIndex']}</FormErrorMessage>
          </FormControl>
        </Box>

        <Divider />

        {/* Vouching Section */}
        <Box>
          <HStack justify="space-between" mb={3} cursor="pointer" onClick={vouchingDisclosure.onToggle}>
            <HStack>
              <Heading size="sm">Vouching</Heading>
              {formData.vouching.enabled && (
                <Text fontSize="sm" color="orange.500">(Enabled)</Text>
              )}
            </HStack>
            <Icon as={vouchingDisclosure.isOpen ? ChevronUpIcon : ChevronDownIcon} />
          </HStack>

          <Collapse in={vouchingDisclosure.isOpen}>
            <VStack spacing={4} align="stretch" pl={4} borderLeft="2px solid" borderColor="gray.200">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0}>Enable Vouching</FormLabel>
                <Switch
                  isChecked={formData.vouching.enabled}
                  onChange={(e) => updateField('vouching.enabled', e.target.checked)}
                  colorScheme="orange"
                />
              </FormControl>

              {formData.vouching.enabled && (
                <>
                  <FormControl isInvalid={!!errors['vouching.voucherRoleIndex']}>
                    <FormLabel>Voucher Role</FormLabel>
                    <Select
                      value={formData.vouching.voucherRoleIndex}
                      onChange={(e) => updateField('vouching.voucherRoleIndex', parseInt(e.target.value, 10))}
                    >
                      {voucherRoleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      Members of this role can vouch for new members
                    </FormHelperText>
                    <FormErrorMessage>{errors['vouching.voucherRoleIndex']}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!errors['vouching.quorum']}>
                    <FormLabel>Required Vouches</FormLabel>
                    <NumberInput
                      value={formData.vouching.quorum}
                      onChange={(_, val) => updateField('vouching.quorum', val)}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Number of vouches required for membership
                    </FormHelperText>
                    <FormErrorMessage>{errors['vouching.quorum']}</FormErrorMessage>
                  </FormControl>

                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb={0}>Combine with Hierarchy</FormLabel>
                    <Switch
                      isChecked={formData.vouching.combineWithHierarchy}
                      onChange={(e) => updateField('vouching.combineWithHierarchy', e.target.checked)}
                    />
                    <Tooltip label="If enabled, parent admins can also vouch">
                      <Icon as={InfoIcon} ml={2} color="gray.400" />
                    </Tooltip>
                  </FormControl>
                </>
              )}
            </VStack>
          </Collapse>
        </Box>

        <Divider />

        {/* Advanced Settings */}
        <Box>
          <HStack justify="space-between" mb={3} cursor="pointer" onClick={advancedDisclosure.onToggle}>
            <Heading size="sm">Advanced Settings</Heading>
            <Icon as={advancedDisclosure.isOpen ? ChevronUpIcon : ChevronDownIcon} />
          </HStack>

          <Collapse in={advancedDisclosure.isOpen}>
            <VStack spacing={4} align="stretch" pl={4} borderLeft="2px solid" borderColor="gray.200">
              {/* Defaults */}
              <Heading size="xs" color="gray.600">Member Defaults</Heading>

              <HStack spacing={8}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} fontSize="sm">Eligible by Default</FormLabel>
                  <Switch
                    isChecked={formData.defaults.eligible}
                    onChange={(e) => updateField('defaults.eligible', e.target.checked)}
                    size="sm"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} fontSize="sm">Good Standing by Default</FormLabel>
                  <Switch
                    isChecked={formData.defaults.standing}
                    onChange={(e) => updateField('defaults.standing', e.target.checked)}
                    size="sm"
                  />
                </FormControl>
              </HStack>

              {/* Hat Config */}
              <Heading size="xs" color="gray.600" mt={2}>Hat Configuration</Heading>

              <FormControl isInvalid={!!errors['hatConfig.maxSupply']}>
                <FormLabel fontSize="sm">Max Supply</FormLabel>
                <NumberInput
                  value={formData.hatConfig.maxSupply}
                  onChange={(_, val) => updateField('hatConfig.maxSupply', val)}
                  min={1}
                  max={10000}
                  size="sm"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText fontSize="xs">
                  Maximum number of members who can hold this role
                </FormHelperText>
                <FormErrorMessage>{errors['hatConfig.maxSupply']}</FormErrorMessage>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb={0} fontSize="sm">Mutable Hat</FormLabel>
                <Switch
                  isChecked={formData.hatConfig.mutableHat}
                  onChange={(e) => updateField('hatConfig.mutableHat', e.target.checked)}
                  size="sm"
                />
                <Tooltip label="If enabled, role settings can be modified after creation">
                  <Icon as={InfoIcon} ml={2} color="gray.400" />
                </Tooltip>
              </FormControl>

              {/* Distribution */}
              <Heading size="xs" color="gray.600" mt={2}>Initial Distribution</Heading>

              <HStack spacing={8}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} fontSize="sm">Assign to Me</FormLabel>
                  <Switch
                    isChecked={formData.distribution.mintToDeployer}
                    onChange={(e) => updateField('distribution.mintToDeployer', e.target.checked)}
                    size="sm"
                    colorScheme="green"
                  />
                  <Tooltip label="You will receive this role when the org is deployed">
                    <Icon as={InfoIcon} ml={2} color="gray.400" boxSize={3} />
                  </Tooltip>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb={0} fontSize="sm">Mint to Executor</FormLabel>
                  <Switch
                    isChecked={formData.distribution.mintToExecutor}
                    onChange={(e) => updateField('distribution.mintToExecutor', e.target.checked)}
                    size="sm"
                  />
                </FormControl>
              </HStack>

              {/* Additional Members by Username */}
              <FormControl mt={4}>
                <FormLabel fontSize="sm">
                  Additional Members
                  <Tooltip label="Enter usernames of people who should receive this role when the org is deployed. Usernames must be registered in the system.">
                    <Icon as={InfoIcon} ml={2} color="gray.400" boxSize={3} />
                  </Tooltip>
                </FormLabel>
                <VStack align="stretch" spacing={2}>
                  {(formData.distribution.additionalWearerUsernames || []).map((username, idx) => (
                    <HStack key={idx}>
                      <Input
                        size="sm"
                        value={username}
                        onChange={(e) => {
                          const current = [...(formData.distribution.additionalWearerUsernames || [])];
                          current[idx] = e.target.value;
                          updateField('distribution.additionalWearerUsernames', current);
                        }}
                        placeholder="Enter username"
                      />
                      <IconButton
                        size="sm"
                        icon={<CloseIcon boxSize={2} />}
                        onClick={() => {
                          const current = formData.distribution.additionalWearerUsernames || [];
                          updateField('distribution.additionalWearerUsernames',
                            current.filter((_, i) => i !== idx));
                        }}
                        aria-label="Remove member"
                        variant="ghost"
                        colorScheme="red"
                      />
                    </HStack>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<AddIcon boxSize={2} />}
                    onClick={() => {
                      const current = formData.distribution.additionalWearerUsernames || [];
                      updateField('distribution.additionalWearerUsernames', [...current, '']);
                    }}
                    alignSelf="flex-start"
                  >
                    Add Member
                  </Button>
                </VStack>
                <FormHelperText fontSize="xs">
                  These users will receive this role when the org is deployed
                </FormHelperText>
              </FormControl>
            </VStack>
          </Collapse>
        </Box>

        {/* Action Buttons */}
        <HStack justify="flex-end" spacing={3} pt={4}>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            {isNew ? 'Add Role' : 'Save Changes'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default RoleForm;
