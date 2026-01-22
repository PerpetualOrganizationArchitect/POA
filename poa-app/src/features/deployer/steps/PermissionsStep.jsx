/**
 * PermissionsStep - Step 3: Configure role permissions
 */

import React from 'react';
import {
  Box,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { useDeployer, PERMISSION_KEYS, PERMISSION_DESCRIPTIONS } from '../context/DeployerContext';
import { validatePermissionsStep } from '../validation/schemas';
import StepHeader from '../components/common/StepHeader';
import NavigationButtons from '../components/common/NavigationButtons';
import ValidationSummary from '../components/common/ValidationSummary';
import PermissionMatrix from '../components/permissions/PermissionMatrix';

export function PermissionsStep() {
  const { state, actions } = useDeployer();

  // Validate the current step
  const validationResult = validatePermissionsStep(state.permissions, state.roles.length);

  // Count permissions assigned
  const totalAssignments = PERMISSION_KEYS.reduce(
    (sum, key) => sum + (state.permissions[key]?.length || 0),
    0
  );

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
        title="Configure Permissions"
        description="Assign permissions to roles. Each permission controls what actions members of a role can perform."
      />

      <VStack spacing={6} align="stretch">
        {/* Quick stats */}
        <HStack spacing={4}>
          <Box px={3} py={1} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              {totalAssignments} permission{totalAssignments !== 1 ? 's' : ''} assigned
            </Text>
          </Box>
          <Box px={3} py={1} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              {state.roles.length} role{state.roles.length !== 1 ? 's' : ''} ×{' '}
              {PERMISSION_KEYS.length} permissions
            </Text>
          </Box>
        </HStack>

        {/* Permission matrix */}
        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          bg="white"
        >
          <PermissionMatrix />
        </Box>

        {/* Permission descriptions accordion */}
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <HStack flex="1" textAlign="left">
                  <Icon as={InfoIcon} color="blue.500" />
                  <Text fontWeight="medium">Permission Descriptions</Text>
                </HStack>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack align="stretch" spacing={3}>
                {PERMISSION_KEYS.map((key) => {
                  const desc = PERMISSION_DESCRIPTIONS[key];
                  return (
                    <Box key={key} p={3} bg="gray.50" borderRadius="md">
                      <Text fontWeight="medium" fontSize="sm">
                        {desc.label}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {desc.description}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {/* Tips */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="medium">Tips</Text>
            <Text fontSize="sm">
              • Quick Join allows members to join without approval
              <br />
              • Task and Education permissions control content creation
              <br />
              • Voting permissions determine who can participate in governance
            </Text>
          </Box>
        </Alert>

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
          nextLabel="Continue to Voting"
        />
      </VStack>
    </Box>
  );
}

export default PermissionsStep;
