/**
 * VotingClassCard - Displays a single voting class with inline weight slider
 *
 * Features:
 * - Strategy badges (DIRECT = blue, PARTICIPATION TOKEN = amethyst)
 * - Quadratic badge (coral) when enabled for ERC20_BAL classes
 * - Role pills for DIRECT classes showing selected roles
 * - Colored slider track matching class type
 * - Inline quadratic voting explanation when enabled
 * - Proportional redistribution when weight changes
 */

import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';
import { PiUsers, PiChartBar, PiLightning, PiLock, PiLockOpen } from 'react-icons/pi';
import { useDeployer, VOTING_STRATEGY } from '../../context/DeployerContext';

/**
 * Get color scheme based on strategy and quadratic setting
 */
function getClassColors(votingClass) {
  if (votingClass.strategy === VOTING_STRATEGY.DIRECT) {
    return {
      badge: 'blue',
      slider: 'blue',
      border: 'blue.200',
      borderHover: 'blue.300',
    };
  }
  // ERC20_BAL: coral if quadratic, otherwise amethyst
  if (votingClass.quadratic) {
    return {
      badge: 'purple',
      slider: 'orange',
      border: 'coral.200',
      borderHover: 'coral.300',
    };
  }
  return {
    badge: 'purple',
    slider: 'purple',
    border: 'amethyst.200',
    borderHover: 'amethyst.300',
  };
}

export function VotingClassCard({
  votingClass,
  index,
  onEdit,
  onDelete,
  onWeightChange,
  onToggleLock,
  totalClasses,
}) {
  const { state } = useDeployer();
  const { isOpen, onToggle } = useDisclosure();

  const isDirectVoting = votingClass.strategy === VOTING_STRATEGY.DIRECT;
  const strategyLabel = isDirectVoting ? 'Direct (Role-Based)' : 'Participation Token';
  const colors = getClassColors(votingClass);
  const StrategyIcon = isDirectVoting ? PiUsers : PiChartBar;

  // Get role names for DIRECT classes
  const selectedRoles = isDirectVoting && votingClass.hatIds?.length > 0
    ? votingClass.hatIds.map((idx) => state.roles[idx]?.name).filter(Boolean)
    : [];

  const cardBg = useColorModeValue('white', 'warmGray.800');
  const borderColor = useColorModeValue(colors.border, 'warmGray.600');
  const hoverBorderColor = useColorModeValue(colors.borderHover, 'warmGray.500');

  const handleWeightChange = (newWeight) => {
    // Clamp between 1 and 99 (can't have 0% or 100% when multiple classes)
    const clampedWeight = Math.max(1, Math.min(99, newWeight));
    if (onWeightChange) {
      onWeightChange(index, clampedWeight);
    }
  };

  return (
    <Box
      borderWidth="2px"
      borderRadius="lg"
      borderColor={borderColor}
      borderLeftWidth="4px"
      borderLeftColor={`${colors.badge}.400`}
      p={4}
      bg={cardBg}
      boxShadow="sm"
      _hover={{ boxShadow: 'md', borderColor: hoverBorderColor }}
      transition="all 0.2s"
    >
      {/* Header row */}
      <HStack justify="space-between" align="start" mb={3}>
        <VStack align="start" spacing={2}>
          <HStack spacing={2}>
            <Icon as={StrategyIcon} color={`${colors.badge}.500`} boxSize={5} />
            <Text fontWeight="semibold" fontSize="md">
              Class {index + 1}
            </Text>
            <Badge colorScheme={colors.badge} variant="subtle" fontSize="xs">
              {strategyLabel}
            </Badge>
            {votingClass.quadratic && (
              <Tooltip label="Quadratic voting reduces whale influence by using square root of token balance">
                <Badge colorScheme="orange" variant="solid" fontSize="xs">
                  <HStack spacing={1}>
                    <Icon as={PiLightning} boxSize={3} />
                    <Text>Quadratic</Text>
                  </HStack>
                </Badge>
              </Tooltip>
            )}
          </HStack>

          {/* Role pills for DIRECT classes */}
          {isDirectVoting && selectedRoles.length > 0 && (
            <Wrap spacing={1}>
              {selectedRoles.map((roleName, i) => (
                <WrapItem key={i}>
                  <Tag size="sm" colorScheme={colors.badge} variant="outline">
                    <TagLabel>{roleName}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}

          {/* Min balance for ERC20_BAL classes */}
          {!isDirectVoting && votingClass.minBalance > 0 && (
            <Text fontSize="xs" color="gray.500">
              Min: {votingClass.minBalance} tokens required
            </Text>
          )}
        </VStack>

        {/* Actions */}
        <HStack spacing={1}>
          <Tooltip label={votingClass.locked ? 'Unlock weight (allow redistribution)' : 'Lock weight (prevent redistribution)'}>
            <IconButton
              aria-label={votingClass.locked ? 'Unlock weight' : 'Lock weight'}
              icon={<Icon as={votingClass.locked ? PiLock : PiLockOpen} />}
              size="sm"
              variant={votingClass.locked ? 'solid' : 'ghost'}
              colorScheme={votingClass.locked ? 'orange' : 'gray'}
              onClick={() => onToggleLock && onToggleLock(index)}
            />
          </Tooltip>
          <Tooltip label="Edit class settings">
            <IconButton
              aria-label="Edit voting class"
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              onClick={() => onEdit(index)}
            />
          </Tooltip>
          <Tooltip label="Delete voting class">
            <IconButton
              aria-label="Delete voting class"
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => onDelete(index)}
              isDisabled={totalClasses <= 1}
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

      {/* Weight slider - always visible */}
      <Box opacity={votingClass.locked ? 0.6 : 1} transition="opacity 0.2s">
        <HStack justify="space-between" fontSize="sm" color="gray.600" mb={2}>
          <HStack>
            <Text fontWeight="medium">Voting Weight</Text>
            {votingClass.locked && (
              <Badge colorScheme="orange" size="sm" variant="subtle">
                <HStack spacing={1}>
                  <Icon as={PiLock} boxSize={3} />
                  <Text>Locked</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
          <Text fontWeight="bold" color={`${colors.badge}.600`}>
            {votingClass.slicePct}%
          </Text>
        </HStack>
        <HStack spacing={4}>
          <Slider
            value={votingClass.slicePct}
            onChange={handleWeightChange}
            min={1}
            max={totalClasses > 1 ? 99 : 100}
            flex={1}
            focusThumbOnChange={false}
            colorScheme={colors.slider}
            isDisabled={votingClass.locked}
          >
            <SliderTrack h="8px" borderRadius="full">
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={5} />
          </Slider>
          <NumberInput
            value={votingClass.slicePct}
            onChange={(_, val) => {
              if (!isNaN(val)) handleWeightChange(val);
            }}
            min={1}
            max={totalClasses > 1 ? 99 : 100}
            w="75px"
            size="sm"
            isDisabled={votingClass.locked}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" fontWeight="bold" color="gray.500">%</Text>
        </HStack>
      </Box>

      {/* Inline Quadratic Voting Info */}
      {votingClass.quadratic && !isDirectVoting && (
        <Box
          mt={3}
          p={3}
          bg="orange.50"
          borderRadius="md"
          borderLeftWidth="3px"
          borderLeftColor="orange.400"
        >
          <HStack spacing={2} align="start">
            <Icon as={PiLightning} color="orange.500" boxSize={4} mt={0.5} />
            <Box>
              <Text fontSize="sm" fontWeight="600" color="orange.700">
                Quadratic Voting Enabled
              </Text>
              <Text fontSize="xs" color="orange.600">
                Large token holders have reduced influence. Example: 100 tokens = 10 votes, 400 tokens = 20 votes.
              </Text>
            </Box>
          </HStack>
        </Box>
      )}

      {/* Expanded details */}
      <Collapse in={isOpen}>
        <Box mt={4} pt={3} borderTopWidth="1px" borderColor="gray.100">
          <VStack align="start" spacing={3} fontSize="sm" color="gray.600">
            <HStack>
              <Text fontWeight="medium" minW="100px">Strategy:</Text>
              <Badge colorScheme={colors.badge} variant="outline">
                {strategyLabel}
              </Badge>
            </HStack>

            {!isDirectVoting && (
              <>
                <HStack>
                  <Text fontWeight="medium" minW="100px">Quadratic:</Text>
                  <Badge colorScheme={votingClass.quadratic ? 'orange' : 'gray'}>
                    {votingClass.quadratic ? 'Enabled' : 'Disabled'}
                  </Badge>
                </HStack>
                <HStack>
                  <Text fontWeight="medium" minW="100px">Min Balance:</Text>
                  <Text>
                    {votingClass.minBalance > 0
                      ? `${votingClass.minBalance} tokens`
                      : 'No minimum'}
                  </Text>
                </HStack>
              </>
            )}

            {isDirectVoting && (
              <HStack align="start">
                <Text fontWeight="medium" minW="100px">Eligible Roles:</Text>
                {selectedRoles.length > 0 ? (
                  <Wrap spacing={1}>
                    {selectedRoles.map((name, i) => (
                      <WrapItem key={i}>
                        <Tag size="sm" colorScheme={colors.badge}>
                          <TagLabel>{name}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text color="orange.500">No roles selected</Text>
                )}
              </HStack>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default VotingClassCard;
