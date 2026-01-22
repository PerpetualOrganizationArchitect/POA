/**
 * RolesStep - Step 2: Define organization roles
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Alert,
  AlertIcon,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useDeployer } from '../context/DeployerContext';
import { validateRolesStep } from '../validation/schemas';
import { validateAllUsernames } from '../utils/usernameResolver';
import StepHeader from '../components/common/StepHeader';
import NavigationButtons from '../components/common/NavigationButtons';
import ValidationSummary from '../components/common/ValidationSummary';
import RoleList from '../components/role/RoleList';
import RoleHierarchyTree from '../components/role/RoleHierarchyTree';

export function RolesStep() {
  const { state, actions } = useDeployer();
  const [tabIndex, setTabIndex] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [usernameErrors, setUsernameErrors] = useState({});

  // Validate the current step (sync validation)
  const validationResult = validateRolesStep(state.roles);

  // Check for top-level role requirement
  const hasTopLevelRole = state.roles.some(
    (r) => r.hierarchy.adminRoleIndex === null
  );

  // Check for at least one voting role
  const hasVotingRole = state.roles.some((r) => r.canVote);

  // Check if any roles have additional members specified
  const hasAdditionalMembers = state.roles.some(
    (r) => (r.distribution?.additionalWearerUsernames || []).filter(u => u?.trim()).length > 0
  );

  const handleNext = async () => {
    // First, check sync validation
    if (!validationResult.isValid) {
      return;
    }

    // Clear previous username errors
    setUsernameErrors({});

    // If there are additional members to validate, do async validation
    if (hasAdditionalMembers) {
      setIsValidating(true);
      try {
        const usernameResult = await validateAllUsernames(state.roles);
        if (!usernameResult.isValid) {
          setUsernameErrors(usernameResult.errors);
          return;
        }
      } catch (error) {
        setUsernameErrors({ usernames: `Validation failed: ${error.message}` });
        return;
      } finally {
        setIsValidating(false);
      }
    }

    actions.nextStep();
  };

  const handleBack = () => {
    actions.prevStep();
  };

  return (
    <Box>
      <StepHeader
        title="Define Roles"
        description="Create the roles that will form your organization's structure. Each role can have different permissions, voting rights, and membership requirements."
      />

      <VStack spacing={6} align="stretch">
        {/* Quick status indicators */}
        <HStack spacing={4} flexWrap="wrap">
          <Box
            px={3}
            py={1}
            bg={state.roles.length > 0 ? 'green.50' : 'gray.50'}
            borderRadius="md"
            borderWidth="1px"
            borderColor={state.roles.length > 0 ? 'green.200' : 'gray.200'}
          >
            <Text fontSize="sm" color={state.roles.length > 0 ? 'green.700' : 'gray.500'}>
              {state.roles.length} role{state.roles.length !== 1 ? 's' : ''} defined
            </Text>
          </Box>
          <Box
            px={3}
            py={1}
            bg={hasTopLevelRole ? 'green.50' : 'orange.50'}
            borderRadius="md"
            borderWidth="1px"
            borderColor={hasTopLevelRole ? 'green.200' : 'orange.200'}
          >
            <Text fontSize="sm" color={hasTopLevelRole ? 'green.700' : 'orange.700'}>
              {hasTopLevelRole ? '✓ Has top-level admin' : '⚠ No top-level admin'}
            </Text>
          </Box>
          <Box
            px={3}
            py={1}
            bg={hasVotingRole ? 'green.50' : 'blue.50'}
            borderRadius="md"
            borderWidth="1px"
            borderColor={hasVotingRole ? 'green.200' : 'blue.200'}
          >
            <Text fontSize="sm" color={hasVotingRole ? 'green.700' : 'blue.700'}>
              {hasVotingRole
                ? `✓ ${state.roles.filter((r) => r.canVote).length} voting role(s)`
                : 'No voting roles yet'}
            </Text>
          </Box>
        </HStack>

        {/* Tabbed view for list vs hierarchy */}
        <Tabs index={tabIndex} onChange={setTabIndex} variant="enclosed">
          <TabList>
            <Tab>Role List</Tab>
            <Tab>Hierarchy View</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <RoleList />
            </TabPanel>
            <TabPanel px={0}>
              <RoleHierarchyTree />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Warnings and tips */}
        {!hasTopLevelRole && state.roles.length > 0 && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">No top-level admin role</Text>
              <Text fontSize="sm">
                At least one role must have no parent (be a top-level admin) to manage
                the organization.
              </Text>
            </Box>
          </Alert>
        )}

        {!hasVotingRole && state.roles.length > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">No voting roles configured</Text>
              <Text fontSize="sm">
                Enable "Can Vote" on at least one role for members to participate in
                governance. You can configure voting weights in the Voting step.
              </Text>
            </Box>
          </Alert>
        )}

        {/* Validation errors */}
        {!validationResult.isValid && (
          <ValidationSummary errors={validationResult.errors} />
        )}

        {/* Username validation errors */}
        {Object.keys(usernameErrors).length > 0 && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="medium">Username Validation Failed</Text>
              <Text fontSize="sm">{usernameErrors.usernames}</Text>
            </Box>
          </Alert>
        )}

        {/* Validating indicator */}
        {isValidating && (
          <HStack spacing={2} color="blue.600">
            <Spinner size="sm" />
            <Text fontSize="sm">Validating usernames...</Text>
          </HStack>
        )}

        <Divider />

        {/* Navigation */}
        <NavigationButtons
          onBack={handleBack}
          onNext={handleNext}
          nextDisabled={!validationResult.isValid || isValidating}
          isLoading={isValidating}
          nextLabel={isValidating ? 'Validating...' : 'Continue to Permissions'}
        />
      </VStack>
    </Box>
  );
}

export default RolesStep;
