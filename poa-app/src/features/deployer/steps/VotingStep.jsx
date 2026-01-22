/**
 * VotingStep - Step 4: Configure voting classes and quorum
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
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
  Icon,
} from '@chakra-ui/react';
import { AddIcon, InfoIcon } from '@chakra-ui/icons';
import { useDeployer, createDefaultVotingClass, VOTING_STRATEGY } from '../context/DeployerContext';
import { validateVotingStep } from '../validation/schemas';
import StepHeader from '../components/common/StepHeader';
import NavigationButtons from '../components/common/NavigationButtons';
import ValidationSummary from '../components/common/ValidationSummary';
import VotingClassCard from '../components/voting/VotingClassCard';
import VotingClassForm from '../components/voting/VotingClassForm';
import MultiClassWeightBar from '../components/voting/MultiClassWeightBar';
import QuadraticVotingExplainer from '../components/voting/QuadraticVotingExplainer';
import AdvancedVotingExample from '../components/voting/AdvancedVotingExample';

export function VotingStep() {
  const { state, actions } = useDeployer();
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

  // Open modal for new class
  const handleAddClass = () => {
    // Calculate remaining percentage
    const remaining = 100 - totalSlice;
    const newClass = {
      ...createDefaultVotingClass(),
      slicePct: remaining > 0 ? remaining : 0,
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
   * When one class's weight changes, other classes are adjusted proportionally
   * to maintain 100% total.
   */
  const handleWeightChange = (changedIndex, newWeight) => {
    const classes = voting.classes;

    // If only one class, just set it to 100%
    if (classes.length === 1) {
      actions.updateVotingClass(0, { slicePct: 100 });
      return;
    }

    const oldWeight = classes[changedIndex].slicePct;
    const delta = newWeight - oldWeight;

    if (delta === 0) return;

    // Calculate the total weight of other classes
    const otherClassesTotal = classes.reduce((sum, cls, idx) => {
      return idx === changedIndex ? sum : sum + cls.slicePct;
    }, 0);

    // If other classes have 0 total, we can't redistribute proportionally
    // In this edge case, distribute evenly among other classes
    if (otherClassesTotal === 0) {
      const otherCount = classes.length - 1;
      const remaining = 100 - newWeight;
      const perClass = Math.floor(remaining / otherCount);
      let leftover = remaining - (perClass * otherCount);

      classes.forEach((cls, idx) => {
        if (idx === changedIndex) {
          actions.updateVotingClass(idx, { slicePct: newWeight });
        } else {
          const extra = leftover > 0 ? 1 : 0;
          leftover -= extra;
          actions.updateVotingClass(idx, { slicePct: perClass + extra });
        }
      });
      return;
    }

    // Proportionally redistribute the delta among other classes
    const remaining = 100 - newWeight;
    const scaleFactor = remaining / otherClassesTotal;

    // Build new weights, ensuring minimum of 1% per class and integers
    const newWeights = classes.map((cls, idx) => {
      if (idx === changedIndex) {
        return newWeight;
      }
      // Scale proportionally
      const scaled = Math.round(cls.slicePct * scaleFactor);
      return Math.max(1, scaled);
    });

    // Adjust for rounding errors to ensure sum is exactly 100
    let sum = newWeights.reduce((a, b) => a + b, 0);
    let diff = 100 - sum;

    // Apply diff to the largest class (excluding the one being changed)
    if (diff !== 0) {
      let maxIdx = -1;
      let maxVal = 0;
      newWeights.forEach((w, idx) => {
        if (idx !== changedIndex && w > maxVal) {
          maxVal = w;
          maxIdx = idx;
        }
      });
      if (maxIdx >= 0) {
        newWeights[maxIdx] += diff;
      }
    }

    // Apply all updates
    newWeights.forEach((weight, idx) => {
      if (classes[idx].slicePct !== weight) {
        actions.updateVotingClass(idx, { slicePct: weight });
      }
    });
  };

  const handleNext = () => {
    if (validationResult.isValid) {
      actions.nextStep();
    }
  };

  const handleBack = () => {
    actions.prevStep();
  };

  return (
    <Box>
      <StepHeader
        title="Configure Voting"
        description="Set up voting classes and quorum requirements for governance decisions."
      />

      <VStack spacing={6} align="stretch">
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

        {/* Validation errors */}
        {!validationResult.isValid && (
          <ValidationSummary errors={validationResult.errors} />
        )}

        <Divider />

        {/* Navigation */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          isNextDisabled={!validationResult.isValid}
          nextLabel="Review & Deploy"
        />
      </VStack>

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
    </Box>
  );
}

export default VotingStep;
