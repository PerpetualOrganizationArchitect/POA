/**
 * DeployerWizard - Main wizard component that orchestrates all deployment steps
 *
 * Uses a unified flow for both Simple and Advanced modes:
 * Template → Identity → Team → Governance → Launch
 *
 * Advanced mode controls what's shown WITHIN each step (e.g., RoleCardAdvanced
 * instead of RoleCardSimple, granular permissions in GovernanceStep)
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Icon,
  useColorModeValue,
  useToast,
  Flex,
  keyframes,
} from '@chakra-ui/react';
import { PiCheck, PiWarningCircle } from 'react-icons/pi';
import { useQuery } from '@apollo/client';
import { useDeployer, STEPS, STEP_NAMES } from '../context/DeployerContext';
import { mapStateToDeploymentParams, createDeploymentConfig } from '../utils/deploymentMapper';
import { getRichTemplateById } from '../templates';
import { FETCH_INFRASTRUCTURE_ADDRESSES } from '../../../util/queries';

// New step components
import TemplateStep from '../steps/TemplateStep';
import IdentityStep from '../steps/IdentityStep';
import TeamStep from '../steps/TeamStep';
import GovernanceStep from '../steps/GovernanceStep';

// Review step (used by all modes)
import ReviewStep from '../steps/ReviewStep';

// Layout components
import { ModeToggle } from './layout';

// Subtle pulse animation for active step
const pulseAnimation = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

// Minimal Progress Indicator Component
function StepProgressIndicator({ steps, currentStep, onStepClick, selectors }) {
  const activeBg = useColorModeValue('coral.500', 'coral.400');
  const completedValidBg = useColorModeValue('green.500', 'green.400');
  const completedInvalidBg = useColorModeValue('orange.500', 'orange.400');
  const inactiveBg = useColorModeValue('warmGray.200', 'warmGray.600');
  const lineColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const activeLineColor = useColorModeValue('coral.300', 'coral.600');
  const labelColor = useColorModeValue('warmGray.600', 'warmGray.400');
  const activeLabelColor = useColorModeValue('warmGray.900', 'white');

  return (
    <Box position="relative" w="100%" py={2}>
      {/* Connection line (background) */}
      <Box
        position="absolute"
        top="50%"
        left="18px"
        right="18px"
        h="2px"
        bg={lineColor}
        transform="translateY(-50%)"
        zIndex={0}
      />
      {/* Active connection line (progress) */}
      <Box
        position="absolute"
        top="50%"
        left="18px"
        w={`calc(${(currentStep / (steps.length - 1)) * 100}% - 18px)`}
        h="2px"
        bg={activeLineColor}
        transform="translateY(-50%)"
        zIndex={1}
        transition="width 0.3s ease"
      />

      {/* Step indicators */}
      <HStack justify="space-between" position="relative" zIndex={2}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isFuture = index > currentStep;

          // Check validation status for visited steps
          const validation = selectors?.getStepValidationStatus(index) || { isValid: true };
          const isVisitedButIncomplete = isCompleted && !validation.isValid;

          // Allow clicking any step except the current one
          const isClickable = !isActive;

          const handleClick = () => {
            if (isClickable && onStepClick) {
              onStepClick(index);
            }
          };

          // Determine background color based on state
          const getBgColor = () => {
            if (isActive) return activeBg;
            if (isCompleted) {
              return isVisitedButIncomplete ? completedInvalidBg : completedValidBg;
            }
            return 'white';
          };

          // Determine hover glow color based on state
          const getHoverGlow = () => {
            if (isVisitedButIncomplete) {
              return '0 0 0 3px rgba(237, 137, 54, 0.25)'; // orange glow for incomplete
            }
            if (isCompleted) {
              return '0 0 0 3px rgba(72, 187, 120, 0.25)'; // green glow for valid completed
            }
            return '0 0 0 3px rgba(160, 160, 160, 0.25)'; // gray glow for future steps
          };

          return (
            <VStack key={step.key} spacing={1} flex={1} maxW="120px">
              {/* Step dot */}
              <Box
                w={isActive ? "28px" : "22px"}
                h={isActive ? "28px" : "22px"}
                borderRadius="full"
                bg={getBgColor()}
                border="2px solid"
                borderColor={isCompleted || isActive ? 'transparent' : inactiveBg}
                display="flex"
                alignItems="center"
                justifyContent="center"
                transition="all 0.2s ease"
                animation={isActive ? `${pulseAnimation} 2s ease-in-out infinite` : undefined}
                boxShadow={isActive ? '0 0 0 3px rgba(240, 101, 67, 0.15)' : undefined}
                cursor={isClickable ? 'pointer' : 'default'}
                onClick={handleClick}
                _hover={isClickable ? {
                  transform: 'scale(1.1)',
                  boxShadow: getHoverGlow()
                } : undefined}
              >
                {isCompleted ? (
                  isVisitedButIncomplete ? (
                    <Icon as={PiWarningCircle} color="white" boxSize={3} />
                  ) : (
                    <Icon as={PiCheck} color="white" boxSize={3} />
                  )
                ) : (
                  <Text
                    fontSize="2xs"
                    fontWeight="600"
                    color={isActive ? 'white' : 'warmGray.400'}
                  >
                    {index + 1}
                  </Text>
                )}
              </Box>

              {/* Step label */}
              <Text
                fontSize="xs"
                fontWeight={isActive ? '600' : '500'}
                color={isActive ? activeLabelColor : labelColor}
                textAlign="center"
                transition="all 0.2s ease"
                cursor={isClickable ? 'pointer' : 'default'}
                onClick={handleClick}
                _hover={isClickable ? { color: activeLabelColor } : undefined}
              >
                {step.title}
              </Text>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
}

// Unified step configuration (used for both Simple and Advanced modes)
// Advanced mode only changes what's shown WITHIN each step, not the steps themselves
const STEP_CONFIG = [
  {
    key: STEPS.TEMPLATE,
    title: 'Template',
    description: 'Choose type',
    component: TemplateStep,
  },
  {
    key: STEPS.IDENTITY,
    title: 'Identity',
    description: 'Name & info',
    component: IdentityStep,
  },
  {
    key: STEPS.TEAM,
    title: 'Team',
    description: 'Roles',
    component: TeamStep,
  },
  {
    key: STEPS.GOVERNANCE,
    title: 'Governance',
    description: 'How you decide',
    component: GovernanceStep,
  },
  {
    key: STEPS.LAUNCH,
    title: 'Launch',
    description: 'Deploy',
    component: ReviewStep,
  },
];

export function DeployerWizard({
  onDeployStart,
  onDeploySuccess,
  onDeployError,
  deployerAddress,
}) {
  const { state, actions, selectors } = useDeployer();
  // Deployment status: 'idle' | 'deploying' | 'success' | 'error'
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [deploymentResult, setDeploymentResult] = useState(null);
  const toast = useToast();

  // Backwards compatibility - isDeploying derived from status
  const isDeploying = deploymentStatus === 'deploying';

  // Use the new warm color palette
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(51, 48, 44, 0.8)');
  const headingColor = useColorModeValue('warmGray.900', 'white');
  const subtitleColor = useColorModeValue('warmGray.600', 'warmGray.400');

  // Fetch infrastructure addresses from subgraph
  const { data: infraData } = useQuery(FETCH_INFRASTRUCTURE_ADDRESSES, {
    fetchPolicy: 'network-only',
  });

  // Extract infrastructure addresses from subgraph data
  const infrastructureAddresses = useMemo(() => {
    const poaManager = infraData?.poaManagerContracts?.[0];

    // Infrastructure PROXY addresses (from PoaManager - these are what you actually call)
    const orgDeployerAddress = poaManager?.orgDeployerProxy || null;
    const orgRegistryProxy = poaManager?.orgRegistryProxy || null;
    const paymasterHubProxy = poaManager?.paymasterHubProxy || null;
    const globalAccountRegistryProxy = poaManager?.globalAccountRegistryProxy || null;

    // Use globalAccountRegistryProxy as registryAddress (this is the UniversalAccountRegistry)
    const registryAddress = globalAccountRegistryProxy;
    const poaManagerAddress = poaManager?.id || null;
    const orgRegistryAddress = orgRegistryProxy;

    // Helper to find beacon by type name (beacons are for org-level contract implementations)
    const findBeacon = (typeName) => {
      const beacon = infraData?.beacons?.find(b => b.typeName === typeName);
      return beacon?.beaconAddress || null;
    };

    // Extract beacon addresses (for reference - not typically called directly)
    const taskManagerBeacon = findBeacon('TaskManager');
    const hybridVotingBeacon = findBeacon('HybridVoting');
    const directDemocracyVotingBeacon = findBeacon('DirectDemocracyVoting');
    const educationHubBeacon = findBeacon('EducationHub');
    const participationTokenBeacon = findBeacon('ParticipationToken');
    const quickJoinBeacon = findBeacon('QuickJoin');
    const executorBeacon = findBeacon('Executor');
    const paymentManagerBeacon = findBeacon('PaymentManager');
    const eligibilityModuleBeacon = findBeacon('EligibilityModule');
    const toggleModuleBeacon = findBeacon('ToggleModule');

    return {
      // Core contracts
      registryAddress,
      poaManagerAddress,
      orgRegistryAddress,
      // Infrastructure proxies (the actual contracts to interact with)
      orgDeployerAddress,
      orgRegistryProxy,
      paymasterHubProxy,
      globalAccountRegistryProxy,
      // Beacons (for reference)
      taskManagerBeacon,
      hybridVotingBeacon,
      directDemocracyVotingBeacon,
      educationHubBeacon,
      participationTokenBeacon,
      quickJoinBeacon,
      executorBeacon,
      paymentManagerBeacon,
      eligibilityModuleBeacon,
      toggleModuleBeacon,
    };
  }, [infraData]);

  // Current step component (always uses unified STEP_CONFIG)
  const CurrentStepComponent = useMemo(() => {
    return STEP_CONFIG[state.currentStep]?.component || TemplateStep;
  }, [state.currentStep]);

  // Handle deployment
  const handleDeploy = async (deployConfig = {}) => {
    if (!deployerAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to deploy',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setDeploymentStatus('deploying');

    try {
      // Create deployment config with fetched infrastructure addresses
      const config = createDeploymentConfig(state, deployerAddress, infrastructureAddresses);

      // Merge in any config passed from ReviewStep (e.g., deployerUsername)
      const finalConfig = {
        ...config,
        ...deployConfig,
      };

      // Log for debugging
      console.log('Deployment Config:', finalConfig);

      // Call parent component's deploy handler and await result
      if (onDeployStart) {
        const result = await onDeployStart(finalConfig);

        // If deployment succeeded, transition to success state
        if (result && result.success) {
          setDeploymentResult(result);
          setDeploymentStatus('success');
          return;
        }
      }

      // If no onDeployStart or no result, just show info
      toast({
        title: 'Deployment initiated',
        description: 'Check your wallet to confirm the transaction',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentStatus('error');
      toast({
        title: 'Deployment failed',
        description: error.message || 'An error occurred during deployment',
        status: 'error',
        duration: 10000,
        isClosable: true,
      });

      if (onDeployError) {
        onDeployError(error);
      }
    }
  };

  // Handle successful deployment (called by parent)
  const handleDeploySuccess = (result) => {
    setDeploymentResult(result);
    setDeploymentStatus('success');
    // Toast is now handled by the celebration overlay
  };

  // Handle continuing after celebration (called when user clicks "Go to Your Organization")
  const handleCelebrationContinue = () => {
    setDeploymentStatus('idle');
    if (onDeploySuccess && deploymentResult) {
      onDeploySuccess(deploymentResult);
    }
  };

  // Get rich template for display (with icon, tagline, etc.)
  const selectedTemplateId = state.ui.selectedTemplate;
  const selectedTemplate = selectedTemplateId ? getRichTemplateById(selectedTemplateId) : null;

  return (
    <Box minH="100vh" py={{ base: 8, md: 16 }}>
      <Container maxW="container.lg" px={{ base: 4, md: 8 }}>
        <VStack spacing={{ base: 8, md: 12 }} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" mb={2} color={headingColor}>
                {state.currentStep === STEPS.TEMPLATE
                  ? 'Create Your Organization'
                  : selectedTemplate
                  ? `${selectedTemplate.icon} ${selectedTemplate.name}`
                  : 'Create Your Organization'}
              </Heading>
              <Text color={subtitleColor} fontSize="md">
                {state.currentStep === STEPS.TEMPLATE
                  ? 'Choose a template to get started'
                  : selectedTemplate?.tagline || 'Build something together'}
              </Text>
            </Box>
            {state.currentStep > STEPS.TEMPLATE && <ModeToggle />}
          </Flex>

          {/* Minimal Step Progress Indicator */}
          <Box
            bg={cardBg}
            backdropFilter="blur(12px)"
            borderRadius="xl"
            p={{ base: 3, md: 4 }}
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.18)"
            boxShadow="0 4px 30px rgba(0, 0, 0, 0.05)"
          >
            <StepProgressIndicator
              steps={STEP_CONFIG}
              currentStep={state.currentStep}
              onStepClick={(stepIndex) => actions.goToStep(stepIndex)}
              selectors={selectors}
            />
          </Box>

          {/* Current Step Content */}
          <Box
            bg={cardBg}
            backdropFilter="blur(12px)"
            borderRadius="2xl"
            p={{ base: 6, md: 8 }}
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.18)"
            boxShadow="0 4px 30px rgba(0, 0, 0, 0.05)"
            minH="400px"
          >
            {state.currentStep === STEPS.LAUNCH || state.currentStep === STEPS.REVIEW ? (
              <ReviewStep
                onDeploy={handleDeploy}
                isDeploying={isDeploying}
                isWalletConnected={!!deployerAddress}
                deploymentStatus={deploymentStatus}
                onDeploySuccess={handleCelebrationContinue}
              />
            ) : (
              <CurrentStepComponent />
            )}
          </Box>

          {/* Debug info (dev only) - hidden by default, toggle with keyboard */}
          {process.env.NODE_ENV === 'development' && (
            <Box
              bg="warmGray.100"
              p={4}
              borderRadius="lg"
              fontSize="xs"
              fontFamily="mono"
              opacity={0.7}
            >
              <Text fontWeight="bold" mb={2} color="warmGray.700">
                Debug: Current State
              </Text>
              <Text color="warmGray.600">Step: {STEP_CONFIG[state.currentStep]?.title || 'Unknown'}</Text>
              <Text color="warmGray.600">Mode: {state.ui.mode}</Text>
              <Text color="warmGray.600">Template: {state.ui.selectedTemplate || 'None'}</Text>
              <Text color="warmGray.600">Roles: {state.roles.length}</Text>
              <Text color="warmGray.600">Voting Classes: {state.voting.classes.length}</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

export default DeployerWizard;
