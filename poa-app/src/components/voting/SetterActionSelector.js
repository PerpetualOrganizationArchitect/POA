/**
 * SetterActionSelector
 * Main component for selecting and configuring setter function calls
 * Supports both template mode (user-friendly) and advanced mode (raw functions)
 */

import React, { useState, useMemo } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  ButtonGroup,
  Select,
  SimpleGrid,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  Icon,
} from '@chakra-ui/react';
import {
  FiCheckSquare,
  FiUsers,
  FiAlertTriangle,
  FiClipboard,
  FiChevronRight,
  FiArrowLeft,
} from 'react-icons/fi';
import SetterParamInputs from './SetterParamInputs';
import {
  SETTER_CATEGORIES,
  SETTER_TEMPLATES,
  CONTRACT_MAP,
  RAW_FUNCTIONS,
  getTemplatesByCategory,
  getTemplateById,
} from '@/config/setterDefinitions';

const categoryIcons = {
  voting: FiCheckSquare,
  permissions: FiUsers,
  emergency: FiAlertTriangle,
  tasks: FiClipboard,
};

const inputStyles = {
  bg: 'whiteAlpha.100',
  border: '1px solid rgba(148, 115, 220, 0.3)',
  color: 'white',
  _hover: { borderColor: 'purple.400' },
  _focus: { borderColor: 'purple.500', boxShadow: '0 0 0 1px rgba(148, 115, 220, 0.6)' },
};

/**
 * Category card for template selection
 */
const CategoryCard = ({ category, categoryKey, isSelected, onClick }) => {
  const IconComponent = categoryIcons[categoryKey] || FiCheckSquare;

  return (
    <Box
      p={4}
      borderRadius="md"
      cursor="pointer"
      bg={isSelected ? `${category.color}.900` : 'whiteAlpha.50'}
      border="1px solid"
      borderColor={isSelected ? `${category.color}.500` : 'rgba(148, 115, 220, 0.2)'}
      onClick={onClick}
      _hover={{
        borderColor: `${category.color}.400`,
        bg: isSelected ? `${category.color}.900` : 'whiteAlpha.100',
      }}
      transition="all 0.2s"
    >
      <HStack spacing={3}>
        <Icon as={IconComponent} boxSize={5} color={`${category.color}.400`} />
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" fontWeight="bold" color="white">
            {category.name}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {category.description}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

/**
 * Template card for action selection
 */
const TemplateCard = ({ template, isSelected, onClick }) => {
  return (
    <Box
      p={4}
      borderRadius="md"
      cursor="pointer"
      bg={isSelected ? 'purple.900' : 'whiteAlpha.50'}
      border="1px solid"
      borderColor={isSelected ? 'purple.500' : 'rgba(148, 115, 220, 0.2)'}
      onClick={onClick}
      _hover={{
        borderColor: 'purple.400',
        bg: isSelected ? 'purple.900' : 'whiteAlpha.100',
      }}
      transition="all 0.2s"
    >
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <HStack>
            <Text fontSize="sm" fontWeight="bold" color="white">
              {template.name}
            </Text>
            {template.dangerLevel === 'critical' && (
              <Badge colorScheme="red" fontSize="xs">
                Critical
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="gray.400">
            {template.description}
          </Text>
        </VStack>
        <Icon as={FiChevronRight} color="gray.400" />
      </HStack>
    </Box>
  );
};

/**
 * Preview of what the setter action will do
 */
const SetterPreview = ({ template, values, roleNames, projectNames }) => {
  if (!template) return null;

  const previewText = template.preview
    ? template.preview(values, roleNames, projectNames)
    : `Execute ${template.name}`;

  return (
    <Alert
      status="info"
      borderRadius="md"
      bg="rgba(66, 153, 225, 0.15)"
      border="1px solid rgba(66, 153, 225, 0.3)"
    >
      <AlertIcon color="blue.300" />
      <VStack align="start" spacing={1}>
        <Text fontSize="sm" fontWeight="medium" color="white">
          If this vote passes:
        </Text>
        <Text fontSize="sm" color="gray.300">
          {previewText}
        </Text>
      </VStack>
    </Alert>
  );
};

/**
 * Main SetterActionSelector component
 */
const SetterActionSelector = ({
  proposal,
  onChange,
  allRoles = [],
  allProjects = [],
  roleNames = {},
  projectNames = {},
}) => {
  const [mode, setMode] = useState('template');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get the selected template if in template mode
  const selectedTemplate = useMemo(() => {
    if (mode === 'template' && proposal.setterTemplate) {
      return getTemplateById(proposal.setterTemplate);
    }
    return null;
  }, [mode, proposal.setterTemplate]);

  // Get templates for the selected category
  const categoryTemplates = useMemo(() => {
    if (selectedCategory) {
      return getTemplatesByCategory(selectedCategory);
    }
    return [];
  }, [selectedCategory]);

  // Get raw function for advanced mode
  const selectedRawFunction = useMemo(() => {
    if (mode === 'advanced' && proposal.setterContract && proposal.setterFunction) {
      return RAW_FUNCTIONS[proposal.setterContract]?.find(
        f => f.name === proposal.setterFunction
      );
    }
    return null;
  }, [mode, proposal.setterContract, proposal.setterFunction]);

  // Handle template selection
  const handleTemplateSelect = (templateId) => {
    const template = getTemplateById(templateId);
    onChange({
      setterMode: 'template',
      setterTemplate: templateId,
      setterContract: template?.contract || '',
      setterFunction: template?.functionName || '',
      setterValues: template?.inputs?.reduce((acc, input) => {
        acc[input.name] = input.default || '';
        return acc;
      }, {}) || {},
      setterParams: [],
    });
  };

  // Handle back navigation
  const handleBack = () => {
    if (selectedTemplate) {
      onChange({
        setterTemplate: '',
        setterValues: {},
      });
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  // Handle mode switch
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setSelectedCategory(null);
    onChange({
      setterMode: newMode,
      setterTemplate: '',
      setterContract: '',
      setterFunction: '',
      setterValues: {},
      setterParams: [],
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      {/* Mode toggle */}
      <ButtonGroup size="sm" isAttached variant="outline" w="100%">
        <Button
          flex={1}
          onClick={() => handleModeSwitch('template')}
          bg={mode === 'template' ? 'purple.600' : 'transparent'}
          borderColor="purple.500"
          color="white"
          _hover={{ bg: mode === 'template' ? 'purple.700' : 'whiteAlpha.200' }}
        >
          Templates
        </Button>
        <Button
          flex={1}
          onClick={() => handleModeSwitch('advanced')}
          bg={mode === 'advanced' ? 'purple.600' : 'transparent'}
          borderColor="purple.500"
          color="white"
          _hover={{ bg: mode === 'advanced' ? 'purple.700' : 'whiteAlpha.200' }}
        >
          Advanced
        </Button>
      </ButtonGroup>

      {mode === 'template' ? (
        <>
          {/* Template Mode */}
          {!selectedCategory && !proposal.setterTemplate && (
            <>
              <Text fontSize="sm" color="gray.300" fontWeight="medium">
                Select a category:
              </Text>
              <SimpleGrid columns={2} spacing={3}>
                {Object.entries(SETTER_CATEGORIES).map(([key, category]) => (
                  <CategoryCard
                    key={key}
                    categoryKey={key}
                    category={category}
                    isSelected={selectedCategory === key}
                    onClick={() => setSelectedCategory(key)}
                  />
                ))}
              </SimpleGrid>
            </>
          )}

          {selectedCategory && !proposal.setterTemplate && (
            <>
              <HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FiArrowLeft />}
                  onClick={handleBack}
                  color="gray.400"
                  _hover={{ color: 'white' }}
                >
                  Back
                </Button>
                <Text fontSize="sm" color="gray.300" fontWeight="medium">
                  {SETTER_CATEGORIES[selectedCategory]?.name}
                </Text>
              </HStack>
              <VStack spacing={2} align="stretch">
                {categoryTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={proposal.setterTemplate === template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                  />
                ))}
                {categoryTemplates.length === 0 && (
                  <Text fontSize="sm" color="gray.500">
                    No actions available in this category.
                  </Text>
                )}
              </VStack>
            </>
          )}

          {selectedTemplate && (
            <>
              <HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<FiArrowLeft />}
                  onClick={handleBack}
                  color="gray.400"
                  _hover={{ color: 'white' }}
                >
                  Back
                </Button>
                <Text fontSize="sm" color="white" fontWeight="bold">
                  {selectedTemplate.name}
                </Text>
                {selectedTemplate.dangerLevel === 'critical' && (
                  <Badge colorScheme="red">Critical Action</Badge>
                )}
              </HStack>

              {selectedTemplate.warning && (
                <Alert status="warning" borderRadius="md" bg="rgba(236, 201, 75, 0.15)">
                  <AlertIcon color="yellow.300" />
                  <Text fontSize="sm" color="yellow.200">
                    {selectedTemplate.warning}
                  </Text>
                </Alert>
              )}

              <SetterParamInputs
                inputs={selectedTemplate.inputs}
                values={proposal.setterValues || {}}
                onChange={(values) => onChange({ setterValues: values })}
                allRoles={allRoles}
                allProjects={allProjects}
              />

              <SetterPreview
                template={selectedTemplate}
                values={proposal.setterValues || {}}
                roleNames={roleNames}
                projectNames={projectNames}
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* Advanced Mode */}
          <Text fontSize="xs" color="gray.400">
            Advanced mode allows you to call any setter function directly. Use with caution.
          </Text>

          <Select
            placeholder="Select contract"
            value={proposal.setterContract || ''}
            onChange={(e) => onChange({
              setterContract: e.target.value,
              setterFunction: '',
              setterParams: [],
            })}
            {...inputStyles}
          >
            {Object.entries(CONTRACT_MAP).map(([key, contract]) => (
              <option key={key} value={key} style={{ background: '#1a1a2e' }}>
                {contract.displayName}
              </option>
            ))}
          </Select>

          {proposal.setterContract && (
            <Select
              placeholder="Select function"
              value={proposal.setterFunction || ''}
              onChange={(e) => onChange({
                setterFunction: e.target.value,
                setterParams: [],
              })}
              {...inputStyles}
            >
              {RAW_FUNCTIONS[proposal.setterContract]?.map((fn) => (
                <option key={fn.name} value={fn.name} style={{ background: '#1a1a2e' }}>
                  {fn.name} - {fn.description}
                </option>
              ))}
            </Select>
          )}

          {selectedRawFunction && (
            <>
              <Divider borderColor="rgba(148, 115, 220, 0.2)" />
              <Text fontSize="xs" color="gray.500" fontFamily="mono">
                {selectedRawFunction.signature}
              </Text>
              <SetterParamInputs
                inputs={selectedRawFunction.params}
                values={proposal.setterParams?.reduce((acc, val, idx) => {
                  const param = selectedRawFunction.params[idx];
                  if (param) acc[param.name] = val;
                  return acc;
                }, {}) || {}}
                onChange={(values) => {
                  const params = selectedRawFunction.params.map(p => values[p.name] || '');
                  onChange({ setterParams: params });
                }}
                allRoles={allRoles}
                allProjects={allProjects}
              />
            </>
          )}
        </>
      )}

      <Divider borderColor="rgba(148, 115, 220, 0.2)" />

      <Alert status="info" borderRadius="md" bg="rgba(66, 153, 225, 0.15)">
        <AlertIcon color="blue.300" />
        <Text fontSize="sm" color="gray.300">
          This creates a Yes/No vote. If "Yes" wins, the settings will be updated automatically.
        </Text>
      </Alert>
    </VStack>
  );
};

export default SetterActionSelector;
