/**
 * SetterParamInputs
 * Dynamic form input component for setter function parameters
 * Renders appropriate input types based on parameter definitions
 */

import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Select,
  Switch,
  Checkbox,
  CheckboxGroup,
  Stack,
  Box,
  Text,
  HStack,
  Badge,
} from '@chakra-ui/react';

const inputStyles = {
  bg: 'whiteAlpha.100',
  border: '1px solid rgba(148, 115, 220, 0.3)',
  color: 'white',
  _hover: { borderColor: 'purple.400' },
  _focus: { borderColor: 'purple.500', boxShadow: '0 0 0 1px rgba(148, 115, 220, 0.6)' },
};

/**
 * Render a single parameter input based on its type
 */
const ParameterInput = ({ param, value, onChange, allRoles, allProjects }) => {
  const handleChange = (newValue) => {
    onChange(param.name, newValue);
  };

  switch (param.type) {
    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={param.placeholder || `Enter ${param.label}`}
          min={param.min}
          max={param.max}
          {...inputStyles}
        />
      );

    case 'roleSelect':
      return (
        <Select
          placeholder="Select role"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          {...inputStyles}
        >
          {allRoles?.map((role) => (
            <option key={role.hatId} value={role.hatId} style={{ background: '#1a1a2e' }}>
              {role.name}
            </option>
          ))}
        </Select>
      );

    case 'projectSelect':
      return (
        <Select
          placeholder="Select project"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          {...inputStyles}
        >
          {allProjects?.map((project) => (
            <option key={project.id} value={project.id} style={{ background: '#1a1a2e' }}>
              {project.name}
            </option>
          ))}
        </Select>
      );

    case 'toggle':
      return (
        <HStack spacing={4}>
          {param.options?.map((option) => (
            <Box
              key={option}
              px={4}
              py={2}
              borderRadius="md"
              cursor="pointer"
              bg={value === option ? 'purple.600' : 'whiteAlpha.100'}
              border="1px solid"
              borderColor={value === option ? 'purple.400' : 'rgba(148, 115, 220, 0.3)'}
              color="white"
              onClick={() => handleChange(option)}
              _hover={{ borderColor: 'purple.400' }}
              transition="all 0.2s"
            >
              <Text fontSize="sm" fontWeight={value === option ? 'bold' : 'normal'}>
                {option}
              </Text>
            </Box>
          ))}
        </HStack>
      );

    case 'select':
      return (
        <Select
          placeholder="Select option"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          {...inputStyles}
        >
          {param.options?.map((option) => (
            <option key={option.value} value={option.value} style={{ background: '#1a1a2e' }}>
              {option.label}
            </option>
          ))}
        </Select>
      );

    case 'permissionMask':
      return (
        <CheckboxGroup
          value={value || []}
          onChange={(newValue) => handleChange(newValue)}
        >
          <Stack spacing={2}>
            {param.options?.map((option) => (
              <Checkbox
                key={option.value}
                value={String(option.value)}
                colorScheme="purple"
              >
                <Text fontSize="sm" color="white">{option.label}</Text>
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      );

    case 'bool':
      return (
        <HStack>
          <Switch
            isChecked={value === true || value === 'true'}
            onChange={(e) => handleChange(e.target.checked)}
            colorScheme="purple"
          />
          <Text fontSize="sm" color="gray.300">
            {value ? 'Yes' : 'No'}
          </Text>
        </HStack>
      );

    case 'address':
      return (
        <Input
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0x..."
          {...inputStyles}
        />
      );

    case 'bytes':
    case 'bytes32':
      return (
        <Input
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0x..."
          fontFamily="mono"
          {...inputStyles}
        />
      );

    case 'uint8':
    case 'uint256':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${param.label || param.name}`}
          min={0}
          {...inputStyles}
        />
      );

    default:
      return (
        <Input
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${param.label || param.name}`}
          {...inputStyles}
        />
      );
  }
};

/**
 * Main component that renders all parameter inputs for a setter function
 */
const SetterParamInputs = ({
  inputs,
  values = {},
  onChange,
  allRoles = [],
  allProjects = [],
}) => {
  if (!inputs || inputs.length === 0) {
    return (
      <Box
        p={4}
        bg="rgba(148, 115, 220, 0.1)"
        borderRadius="md"
        border="1px solid rgba(148, 115, 220, 0.2)"
      >
        <Text fontSize="sm" color="gray.400">
          This action requires no additional configuration.
        </Text>
      </Box>
    );
  }

  const handleParamChange = (name, value) => {
    onChange({ ...values, [name]: value });
  };

  return (
    <VStack spacing={4} align="stretch">
      {inputs.map((param) => (
        <FormControl key={param.name}>
          <FormLabel color="white" fontWeight="medium" fontSize="sm">
            {param.label || param.name}
            {param.type === 'permissionMask' && (
              <Badge ml={2} colorScheme="purple" fontSize="xs">
                Multi-select
              </Badge>
            )}
          </FormLabel>
          <ParameterInput
            param={param}
            value={values[param.name]}
            onChange={handleParamChange}
            allRoles={allRoles}
            allProjects={allProjects}
          />
          {param.helpText && (
            <FormHelperText color="gray.400" fontSize="xs">
              {param.helpText}
            </FormHelperText>
          )}
        </FormControl>
      ))}
    </VStack>
  );
};

export default SetterParamInputs;
