/**
 * GovernanceStep - Voting configuration
 *
 * This step configures how decisions are made:
 * - Simple mode: Philosophy slider for voting weight distribution
 * - Advanced mode: Multiple voting classes, quadratic voting, granular control
 *
 * Note: Role powers are configured on the Team step, not here.
 * Note: Optional features (Education Hub, Election Hub) are configured on the next step.
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Alert,
  AlertIcon,
  Divider,
  Progress,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, InfoIcon } from '@chakra-ui/icons';
import { useDeployer, UI_MODES, createDefaultVotingClass, VOTING_STRATEGY } from '../context/DeployerContext';
import { NavigationButtons } from '../components/common';
import { PhilosophySlider, getZoneInfo } from '../components/governance';
import { sliderToVotingConfig } from '../utils/philosophyMapper';
import { validateVotingStep } from '../validation/schemas';
import { PiChatDots, PiMegaphoneSimple } from 'react-icons/pi';

// Advanced mode components
import VotingClassCard from '../components/voting/VotingClassCard';
import VotingClassForm from '../components/voting/VotingClassForm';
import MultiClassWeightBar from '../components/voting/MultiClassWeightBar';
import QuadraticVotingExplainer from '../components/voting/QuadraticVotingExplainer';
import AdvancedVotingExample from '../components/voting/AdvancedVotingExample';
import WeightPresets from '../components/voting/WeightPresets';

/**
 * Simple Mode Governance UI
 */
function SimpleGovernanceUI({ state, actions }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const helperColor = useColorModeValue('gray.600', 'gray.400');

  const { philosophy, roles, permissions } = state;

  // Handle philosophy slider change
  const handleSliderChange = (value) => {
    actions.setPhilosophySlider(value);
  };

  // Handle voting permission toggle
  const handleToggleVotingPermission = (permissionKey, roleIndex) => {
    actions.togglePermission(permissionKey, roleIndex);
  };

  return (
    <>
      {/* Philosophy Slider - renders its own explanation sections */}
      <PhilosophySlider
        value={philosophy.slider}
        onChange={handleSliderChange}
      />

      {/* Voting Permissions */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={4} align="stretch">
          <Heading size="sm">Who Participates in Governance?</Heading>
          <Text fontSize="sm" color={helperColor}>
            Click a role to toggle its voting permissions.
          </Text>

          {/* Who can vote */}
          <Box
            p={4}
            bg="warmGray.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="warmGray.100"
          >
            <HStack spacing={3} mb={3}>
              <Icon as={PiChatDots} color="coral.500" boxSize={5} />
              <Text fontWeight="600" fontSize="sm">
                Who can vote in polls?
              </Text>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              {roles.map((role, idx) => {
                const canVote = (permissions.ddVotingRoles || []).includes(idx);
                return (
                  <Badge
                    key={idx}
                    px={3}
                    py={1}
                    borderRadius="full"
                    cursor="pointer"
                    bg={canVote ? 'coral.100' : 'warmGray.100'}
                    color={canVote ? 'coral.700' : 'warmGray.500'}
                    border="1px solid"
                    borderColor={canVote ? 'coral.300' : 'warmGray.200'}
                    onClick={() =>
                      handleToggleVotingPermission('ddVotingRoles', idx)
                    }
                    _hover={{
                      borderColor: canVote ? 'coral.400' : 'coral.300',
                      bg: canVote ? 'coral.200' : 'coral.50',
                    }}
                    transition="all 0.15s ease"
                  >
                    {role.name}
                  </Badge>
                );
              })}
            </HStack>
          </Box>

          {/* Who can create proposals */}
          <Box
            p={4}
            bg="warmGray.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="warmGray.100"
          >
            <HStack spacing={3} mb={3}>
              <Icon as={PiMegaphoneSimple} color="amethyst.500" boxSize={5} />
              <Text fontWeight="600" fontSize="sm">
                Who can create proposals?
              </Text>
            </HStack>
            <HStack spacing={2} flexWrap="wrap">
              {roles.map((role, idx) => {
                const canCreate = (
                  permissions.hybridProposalCreatorRoles || []
                ).includes(idx);
                return (
                  <Badge
                    key={idx}
                    px={3}
                    py={1}
                    borderRadius="full"
                    cursor="pointer"
                    bg={canCreate ? 'amethyst.100' : 'warmGray.100'}
                    color={canCreate ? 'amethyst.700' : 'warmGray.500'}
                    border="1px solid"
                    borderColor={canCreate ? 'amethyst.300' : 'warmGray.200'}
                    onClick={() =>
                      handleToggleVotingPermission(
                        'hybridProposalCreatorRoles',
                        idx
                      )
                    }
                    _hover={{
                      borderColor: canCreate ? 'amethyst.400' : 'amethyst.300',
                      bg: canCreate ? 'amethyst.200' : 'amethyst.50',
                    }}
                    transition="all 0.15s ease"
                  >
                    {role.name}
                  </Badge>
                );
              })}
            </HStack>
          </Box>
        </VStack>
      </Box>
    </>
  );
}

/**
 * Advanced Mode Governance UI
 */
function AdvancedGovernanceUI({ state, actions }) {
  const { voting, roles } = state;

  // Modal for adding/editing voting classes
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  // Delete confirmation dialog
  const [deleteIndex, setDeleteIndex] = useState(null);
  const deleteDialogRef = React.useRef();
  const isDeleteOpen = deleteIndex !== null;

  // Validate the current step
  const validationResult = validateVotingStep(voting);

  // Calculate total slice percentage
  const totalSlice = voting.classes.reduce((sum, c) => sum + c.slicePct, 0);
  const isSliceValid = totalSlice === 100;

  // Check if any ERC20_BAL class has quadratic enabled
  const hasQuadraticEnabled = voting.classes.some(
    (c) => c.strategy === VOTING_STRATEGY.ERC20_BAL && c.quadratic
  );

  // Get other classes' total for editing (exclude current class if editing)
  const getOtherClassesTotal = (excludeIndex) => {
    return voting.classes.reduce((sum, c, idx) => {
      if (idx === excludeIndex) return sum;
      return sum + c.slicePct;
    }, 0);
  };

  // Open modal for new class - auto-steal from largest unlocked class
  const handleAddClass = () => {
    // Find largest unlocked class to steal from
    const unlockedClasses = voting.classes
      .map((cls, idx) => ({ cls, idx }))
      .filter(({ cls }) => !cls.locked);

    if (unlockedClasses.length === 0 && voting.classes.length > 0) {
      // All classes are locked - can't add a new one
      return;
    }

    // Calculate how much to steal
    let stealAmount = 25; // Default for new org
    let largestUnlockedIdx = -1;

    if (unlockedClasses.length > 0) {
      // Sort by slicePct descending
      unlockedClasses.sort((a, b) => b.cls.slicePct - a.cls.slicePct);
      const largest = unlockedClasses[0];
      largestUnlockedIdx = largest.idx;

      // Steal half (min 10%) from largest
      stealAmount = Math.max(10, Math.floor(largest.cls.slicePct / 2));

      // Update the largest class to reduce its weight
      actions.updateVotingClass(largestUnlockedIdx, {
        slicePct: largest.cls.slicePct - stealAmount,
      });
    }

    const newClass = {
      ...createDefaultVotingClass(),
      slicePct: stealAmount,
    };
    setEditingIndex(null);
    setEditingClass(newClass);
    onOpen();
  };

  // Open modal for editing
  const handleEditClass = (index) => {
    setEditingIndex(index);
    setEditingClass({ ...voting.classes[index] });
    onOpen();
  };

  // Save class
  const handleSaveClass = (classData) => {
    if (editingIndex === null) {
      actions.addVotingClass(classData);
    } else {
      actions.updateVotingClass(editingIndex, classData);
    }
    onClose();
    setEditingClass(null);
    setEditingIndex(null);
  };

  // Delete handling
  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      actions.removeVotingClass(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteIndex(null);
  };

  /**
   * Handle weight change with proportional redistribution.
   * Respects locked classes - only redistributes among unlocked ones.
   */
  const handleWeightChange = (changedIndex, newWeight) => {
    const classes = voting.classes;

    if (classes.length === 1) {
      actions.updateVotingClass(0, { slicePct: 100 });
      return;
    }

    // Don't allow changes to locked classes
    if (classes[changedIndex].locked) {
      return;
    }

    const oldWeight = classes[changedIndex].slicePct;
    const delta = newWeight - oldWeight;

    if (delta === 0) return;

    // Only redistribute among UNLOCKED classes (excluding the changed one)
    const unlockedOthers = classes
      .map((cls, idx) => ({ cls, idx }))
      .filter(({ cls, idx }) => idx !== changedIndex && !cls.locked);

    // Calculate total of locked classes (excluding changed one)
    const lockedTotal = classes.reduce((sum, cls, idx) => {
      if (idx === changedIndex || !cls.locked) return sum;
      return sum + cls.slicePct;
    }, 0);

    // Check if there are any unlocked classes to redistribute to
    if (unlockedOthers.length === 0) {
      // All other classes are locked - can't redistribute
      // Cap the new weight to available space
      const maxAllowed = 100 - lockedTotal;
      if (newWeight > maxAllowed) {
        actions.updateVotingClass(changedIndex, { slicePct: maxAllowed });
      } else {
        actions.updateVotingClass(changedIndex, { slicePct: newWeight });
      }
      return;
    }

    const unlockedOthersTotal = unlockedOthers.reduce((sum, { cls }) => sum + cls.slicePct, 0);

    // Calculate remaining weight after locked classes and new weight
    const remaining = 100 - newWeight - lockedTotal;

    if (remaining < unlockedOthers.length) {
      // Not enough space - each unlocked class needs at least 1%
      return;
    }

    if (unlockedOthersTotal === 0) {
      // All other unlocked classes are at 0, distribute evenly
      const perClass = Math.floor(remaining / unlockedOthers.length);
      let leftover = remaining - (perClass * unlockedOthers.length);

      actions.updateVotingClass(changedIndex, { slicePct: newWeight });
      unlockedOthers.forEach(({ idx }) => {
        const extra = leftover > 0 ? 1 : 0;
        leftover -= extra;
        actions.updateVotingClass(idx, { slicePct: perClass + extra });
      });
      return;
    }

    // Proportionally redistribute among unlocked classes
    const scaleFactor = remaining / unlockedOthersTotal;

    const newWeights = classes.map((cls, idx) => {
      if (idx === changedIndex) {
        return newWeight;
      }
      if (cls.locked) {
        return cls.slicePct; // Keep locked classes unchanged
      }
      const scaled = Math.round(cls.slicePct * scaleFactor);
      return Math.max(1, scaled);
    });

    // Verify sum and adjust if needed
    let sum = newWeights.reduce((a, b) => a + b, 0);
    let diff = 100 - sum;

    if (diff !== 0) {
      // Find largest unlocked class (excluding changed one) to adjust
      let maxIdx = -1;
      let maxVal = 0;
      newWeights.forEach((w, idx) => {
        if (idx !== changedIndex && !classes[idx].locked && w > maxVal) {
          maxVal = w;
          maxIdx = idx;
        }
      });
      if (maxIdx >= 0) {
        newWeights[maxIdx] = Math.max(1, newWeights[maxIdx] + diff);
      }
    }

    // Apply all changes
    newWeights.forEach((weight, idx) => {
      if (classes[idx].slicePct !== weight) {
        actions.updateVotingClass(idx, { slicePct: weight });
      }
    });
  };

  // Handle lock toggle
  const handleToggleLock = (index) => {
    actions.toggleClassLock(index);
  };

  // Handle weight preset
  const handleApplyPreset = (preset) => {
    actions.applyWeightPreset(preset);
  };

  return (
    <>
      {/* Quorum Settings */}
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Heading size="sm" mb={4}>
          <HStack>
            <Text>Quorum Requirements</Text>
            <Tooltip label="Minimum percentage of votes required for a proposal to pass">
              <Icon as={InfoIcon} color="gray.400" />
            </Tooltip>
          </HStack>
        </Heading>

        <VStack spacing={4} align="stretch">
          {/* Hybrid Quorum */}
          <FormControl>
            <FormLabel fontSize="sm">Hybrid Proposal Quorum</FormLabel>
            <HStack spacing={4}>
              <Slider
                value={voting.hybridQuorum}
                onChange={(val) => actions.updateVoting({ hybridQuorum: val })}
                min={1}
                max={100}
                flex={1}
                focusThumbOnChange={false}
              >
                <SliderTrack>
                  <SliderFilledTrack bg="blue.400" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Text fontSize="xs" fontWeight="bold">
                    {voting.hybridQuorum}
                  </Text>
                </SliderThumb>
              </Slider>
              <NumberInput
                value={voting.hybridQuorum}
                onChange={(_, val) => {
                  if (!isNaN(val)) actions.updateVoting({ hybridQuorum: val });
                }}
                min={1}
                max={100}
                w="80px"
                size="sm"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm">%</Text>
            </HStack>
            <FormHelperText>For proposals using voting classes</FormHelperText>
          </FormControl>

          {/* DD Quorum */}
          <FormControl>
            <FormLabel fontSize="sm">Direct Democracy Quorum</FormLabel>
            <HStack spacing={4}>
              <Slider
                value={voting.ddQuorum}
                onChange={(val) => actions.updateVoting({ ddQuorum: val })}
                min={1}
                max={100}
                flex={1}
                focusThumbOnChange={false}
              >
                <SliderTrack>
                  <SliderFilledTrack bg="purple.400" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Text fontSize="xs" fontWeight="bold">
                    {voting.ddQuorum}
                  </Text>
                </SliderThumb>
              </Slider>
              <NumberInput
                value={voting.ddQuorum}
                onChange={(_, val) => {
                  if (!isNaN(val)) actions.updateVoting({ ddQuorum: val });
                }}
                min={1}
                max={100}
                w="80px"
                size="sm"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="sm">%</Text>
            </HStack>
            <FormHelperText>For direct democracy proposals</FormHelperText>
          </FormControl>
        </VStack>
      </Box>

      <Divider />

      {/* Voting Classes */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={0}>
            <Heading size="md">Voting Classes ({voting.classes.length})</Heading>
            <Text fontSize="sm" color="gray.500">
              Define how votes are counted and weighted
            </Text>
          </VStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddClass}
            isDisabled={voting.classes.length >= 8}
          >
            Add Class
          </Button>
        </HStack>

        {/* Visual weight distribution bar */}
        {voting.classes.length > 0 && (
          <Box mb={4}>
            <MultiClassWeightBar classes={voting.classes} roles={roles} showLabels={true} />
          </Box>
        )}

        {/* Weight presets */}
        {voting.classes.length >= 2 && (
          <Box mb={4}>
            <WeightPresets
              onApplyPreset={handleApplyPreset}
              classCount={voting.classes.length}
            />
          </Box>
        )}

        {/* Total weight indicator */}
        <Box mb={4} p={3} bg={isSliceValid ? 'green.50' : 'orange.50'} borderRadius="md">
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Total Voting Weight
            </Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={isSliceValid ? 'green.600' : 'orange.600'}
            >
              {totalSlice}% / 100%
            </Text>
          </HStack>
          <Progress
            value={totalSlice}
            colorScheme={isSliceValid ? 'green' : 'orange'}
            size="sm"
            borderRadius="full"
          />
          {!isSliceValid && (
            <Text fontSize="xs" color="orange.600" mt={2}>
              Weights must sum to exactly 100%
            </Text>
          )}
        </Box>

        {/* Class list */}
        {voting.classes.length === 0 ? (
          <Box
            p={8}
            textAlign="center"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor="gray.200"
            borderRadius="lg"
          >
            <Text color="gray.500" mb={4}>
              No voting classes defined. Add your first voting class.
            </Text>
            <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddClass}>
              Add First Class
            </Button>
          </Box>
        ) : (
          <VStack spacing={3} align="stretch">
            {voting.classes.map((cls, index) => (
              <VotingClassCard
                key={index}
                votingClass={cls}
                index={index}
                onEdit={handleEditClass}
                onDelete={handleDeleteClick}
                onWeightChange={handleWeightChange}
                onToggleLock={handleToggleLock}
                totalClasses={voting.classes.length}
              />
            ))}
          </VStack>
        )}
      </Box>

      {/* Tips */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">Voting Class Tips</Text>
          <Text fontSize="sm">
            • Drag sliders to adjust weights - other classes redistribute automatically
            <br />
            • Use multiple Direct classes to give different roles separate voting weights
            <br />
            • Participation Token: Voting power based on participation token balance
            <br />
            • Enable Quadratic on token classes to reduce whale influence
          </Text>
        </Box>
      </Alert>

      {/* Quadratic Voting Explainer - shown when quadratic is enabled */}
      {hasQuadraticEnabled && (
        <QuadraticVotingExplainer isEnabled={true} />
      )}

      {/* Advanced Voting Example - shows how votes work across classes */}
      {voting.classes.length > 0 && (
        <AdvancedVotingExample votingClasses={voting.classes} roles={roles} />
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingIndex === null ? 'Add Voting Class' : `Edit Voting Class ${editingIndex + 1}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {editingClass && (
              <VotingClassForm
                votingClass={editingClass}
                classIndex={editingIndex ?? voting.classes.length}
                onSave={handleSaveClass}
                onCancel={onClose}
                isNew={editingIndex === null}
                otherClassesTotal={getOtherClassesTotal(editingIndex)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={deleteDialogRef}
        onClose={handleCancelDelete}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Voting Class
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this voting class? The remaining classes will need to be adjusted to total 100%.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={deleteDialogRef} onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export function GovernanceStep() {
  const { state, actions } = useDeployer();

  const sectionBg = useColorModeValue('gray.50', 'gray.900');
  const helperColor = useColorModeValue('gray.600', 'gray.400');

  const { philosophy, roles, permissions, ui, voting } = state;
  const isAdvancedMode = ui.mode === UI_MODES.ADVANCED;

  // Get zone info for summary (simple mode)
  const zoneInfo = getZoneInfo(philosophy.slider);

  // Helper to get role names that can vote
  const getVoterRoleNames = () => {
    return roles
      .filter((_, idx) => (permissions.ddVotingRoles || []).includes(idx))
      .map((r) => r.name);
  };

  // Apply philosophy when advancing (simple mode)
  const handleNext = () => {
    if (!isAdvancedMode) {
      // Convert philosophy slider to voting config
      const votingConfig = sliderToVotingConfig(philosophy.slider);
      // Apply voting config
      actions.applyPhilosophy(votingConfig, state.permissions);
    }
    // Move to next step
    actions.nextStep();
  };

  const handleBack = () => {
    actions.prevStep();
  };

  // Validate for advanced mode
  const validationResult = isAdvancedMode ? validateVotingStep(voting) : { isValid: true };

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Render either Simple or Advanced UI based on mode */}
        {isAdvancedMode ? (
          <AdvancedGovernanceUI state={state} actions={actions} />
        ) : (
          <SimpleGovernanceUI state={state} actions={actions} />
        )}

        {/* Current Configuration Summary (Simple mode only) */}
        {!isAdvancedMode && (
          <Box bg={sectionBg} p={4} borderRadius="lg">
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <HStack spacing={2}>
                <Text fontSize="sm" color={helperColor}>
                  Voting approach:
                </Text>
                <Badge colorScheme={zoneInfo.color}>{zoneInfo.label}</Badge>
              </HStack>

              <HStack spacing={2}>
                <Text fontSize="sm" color={helperColor}>
                  Can vote:
                </Text>
                <Text fontSize="sm" fontWeight="500">
                  {getVoterRoleNames().join(', ') || 'None selected'}
                </Text>
              </HStack>
            </HStack>
          </Box>
        )}

        {/* Navigation */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          nextLabel="Review & Launch"
        />
      </VStack>
    </>
  );
}

export default GovernanceStep;
