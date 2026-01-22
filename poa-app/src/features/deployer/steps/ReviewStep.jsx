/**
 * ReviewStep - Step 5: Review configuration and deploy
 *
 * Redesigned to provide:
 * - Visual consistency with other deployer steps
 * - Educational context for configuration choices
 * - Celebratory deployment experience
 * - Smart configuration warnings
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Icon,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Avatar,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tooltip,
  keyframes,
  Flex,
  Image,
  Portal,
} from '@chakra-ui/react';
import {
  EditIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import {
  PiRocketLaunch,
  PiCheckCircle,
  PiWarningCircle,
  PiBuildings,
  PiUsersThree,
  PiShieldCheck,
  PiScales,
  PiGear,
  PiGraduationCap,
  PiHandshake,
  PiImage,
  PiSparkle,
  PiInfo,
} from 'react-icons/pi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDeployer, PERMISSION_KEYS, PERMISSION_DESCRIPTIONS, VOTING_STRATEGY, STEPS } from '../context/DeployerContext';
import { validateDeployerState } from '../validation/schemas';
import { validateDeploymentConfig } from '../utils/deploymentMapper';
import NavigationButtons from '../components/common/NavigationButtons';
import { roleHasBundle } from '../utils/powerBundles';
import { DeployerUsernameSection } from '../components/review/DeployerUsernameSection';

// Animations
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(240, 101, 67, 0.3); }
  50% { box-shadow: 0 0 0 15px rgba(240, 101, 67, 0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const subtlePulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Cooperative/community facts for deployment overlay
const COOP_FACTS = [
  "There are over 3 million cooperative businesses worldwide, employing more people than all multinational corporations combined.",
  "The cooperative model has existed for over 175 years, starting with the Rochdale Pioneers in 1844.",
  "Worker-owned businesses have 29% lower turnover rates than traditional companies.",
  "Community-owned infrastructure often outlasts venture-backed alternatives by decades.",
  "Mondragon, the world's largest cooperative, has over 80,000 worker-owners.",
  "Democratic organizations tend to be more resilient during economic downturns.",
  "You're joining a global movement of people building alternatives to extractive models.",
  "Studies show worker cooperatives are more productive and have higher job satisfaction.",
];

/**
 * ReviewSectionCard - Glassmorphism card for each configuration section
 */
function ReviewSectionCard({
  title,
  stepIndex,
  children,
  status = 'valid',
  icon,
  description,
  goToStep
}) {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(51, 48, 44, 0.7)');
  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const contentBg = useColorModeValue('warmGray.50', 'warmGray.800');

  return (
    <Box
      bg={cardBg}
      backdropFilter="blur(8px)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      transition="all 0.2s ease"
      _hover={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}
    >
      {/* Status indicator bar at top */}
      <Box h="3px" bg={status === 'valid' ? 'green.400' : 'coral.400'} />

      {/* Header */}
      <HStack p={4} justify="space-between" borderBottom="1px" borderColor="warmGray.100">
        <HStack spacing={3}>
          {icon && (
            <Box
              p={2}
              borderRadius="lg"
              bg={status === 'valid' ? 'green.50' : 'coral.50'}
            >
              <Icon
                as={icon}
                color={status === 'valid' ? 'green.500' : 'coral.500'}
                boxSize={5}
              />
            </Box>
          )}
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Heading size="sm" color="warmGray.800">{title}</Heading>
              <Badge
                colorScheme={status === 'valid' ? 'green' : 'orange'}
                borderRadius="full"
                px={2}
                fontSize="xs"
              >
                {status === 'valid' ? 'Ready' : 'Review'}
              </Badge>
            </HStack>
            {description && (
              <Text fontSize="xs" color="warmGray.500">{description}</Text>
            )}
          </VStack>
        </HStack>
        <Button
          size="sm"
          leftIcon={<EditIcon />}
          variant="ghost"
          color="coral.600"
          _hover={{ bg: 'coral.50', transform: 'translateY(-1px)' }}
          transition="all 0.15s ease"
          onClick={() => goToStep(stepIndex)}
        >
          Edit
        </Button>
      </HStack>

      {/* Content */}
      <Box p={5} bg={contentBg}>{children}</Box>
    </Box>
  );
}

/**
 * ReadinessChecklist - Visual dashboard of deployment readiness
 */
function ReadinessChecklist({ items, goToStep }) {
  const completedCount = items.filter(i => i.isComplete).length;
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(51, 48, 44, 0.8)');

  return (
    <Box
      p={5}
      bg={cardBg}
      backdropFilter="blur(12px)"
      borderRadius="xl"
      mb={6}
    >
      <HStack mb={4} justify="space-between">
        <HStack spacing={2}>
          <Icon as={PiCheckCircle} color="green.500" boxSize={5} />
          <Heading size="sm" color="warmGray.800">Launch Checklist</Heading>
        </HStack>
        <Badge
          colorScheme={completedCount === items.length ? 'green' : 'orange'}
          borderRadius="full"
          px={3}
        >
          {completedCount}/{items.length} Ready
        </Badge>
      </HStack>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
        {items.map((item) => (
          <Box
            key={item.key}
            p={3}
            borderRadius="lg"
            bg={item.isComplete ? 'green.50' : 'orange.50'}
            border="1px solid"
            borderColor={item.isComplete ? 'green.200' : 'orange.200'}
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'sm' }}
            onClick={() => goToStep(item.stepIndex)}
          >
            <HStack spacing={2}>
              <Icon
                as={item.isComplete ? PiCheckCircle : PiWarningCircle}
                color={item.isComplete ? 'green.500' : 'orange.500'}
                boxSize={4}
              />
              <Text fontSize="sm" fontWeight="500" color="warmGray.700">
                {item.label}
              </Text>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

/**
 * OrganizationHero - Prominent display of org identity
 */
function OrganizationHero({ organization, templateName, goToStep }) {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(51, 48, 44, 0.8)');

  return (
    <Box
      bg={cardBg}
      backdropFilter="blur(12px)"
      borderRadius="2xl"
      p={6}
      borderLeft="4px solid"
      borderLeftColor="coral.400"
      boxShadow="0 4px 24px rgba(0, 0, 0, 0.06)"
      mb={6}
    >
      <HStack spacing={5} align="start" flexWrap="wrap">
        {/* Logo */}
        <Box
          w="72px"
          h="72px"
          borderRadius="xl"
          bg="coral.50"
          border="2px solid"
          borderColor="coral.200"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {organization.logoURL ? (
            <Image
              src={`https://ipfs.io/ipfs/${organization.logoURL}`}
              alt="Organization logo"
              w="100%"
              h="100%"
              objectFit="cover"
            />
          ) : (
            <Icon as={PiImage} boxSize={8} color="coral.300" />
          )}
        </Box>

        <VStack align="start" spacing={2} flex={1} minW="200px">
          <Heading size="lg" color="warmGray.800">
            {organization.name || 'Your Organization'}
          </Heading>
          <Text color="warmGray.600" fontSize="sm" noOfLines={2}>
            {organization.description || 'No description set'}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {templateName && (
              <Badge bg="coral.100" color="coral.700" borderRadius="full" px={3} py={1}>
                {templateName}
              </Badge>
            )}
            <Badge
              bg={organization.autoUpgrade ? 'green.100' : 'warmGray.100'}
              color={organization.autoUpgrade ? 'green.700' : 'warmGray.500'}
              borderRadius="full"
              px={3}
              py={1}
            >
              Auto Upgrade: {organization.autoUpgrade ? 'On' : 'Off'}
            </Badge>
          </HStack>
        </VStack>

        <Button
          size="sm"
          leftIcon={<EditIcon />}
          variant="outline"
          borderColor="coral.300"
          color="coral.600"
          _hover={{ bg: 'coral.50' }}
          onClick={() => goToStep(STEPS.IDENTITY)}
        >
          Edit
        </Button>
      </HStack>
    </Box>
  );
}

/**
 * RoleCard - Visual card for a single role
 */
function RoleCard({ role, index, roles }) {
  const parentRole = role.hierarchy.adminRoleIndex !== null
    ? roles[role.hierarchy.adminRoleIndex]
    : null;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      border="1px solid"
      borderColor="warmGray.200"
      transition="all 0.15s ease"
      _hover={{ borderColor: 'coral.300', boxShadow: 'sm' }}
    >
      <HStack justify="space-between" mb={3}>
        <HStack spacing={3}>
          <Avatar size="sm" name={role.name} bg="coral.500" color="white" />
          <Text fontWeight="600" color="warmGray.800">{role.name}</Text>
        </HStack>
        {parentRole === null && (
          <Badge bg="amethyst.100" color="amethyst.700" borderRadius="full" fontSize="xs">
            Top Level
          </Badge>
        )}
      </HStack>

      <HStack spacing={2} flexWrap="wrap">
        {role.canVote && (
          <Badge bg="green.100" color="green.700" borderRadius="full" fontSize="xs" px={2}>
            Can Vote
          </Badge>
        )}
        {role.vouching.enabled && (
          <Badge bg="coral.100" color="coral.700" borderRadius="full" fontSize="xs" px={2}>
            {role.vouching.quorum} vouches
          </Badge>
        )}
        {parentRole && (
          <Text fontSize="xs" color="warmGray.500">
            Reports to: {parentRole.name}
          </Text>
        )}
      </HStack>
    </Box>
  );
}

/**
 * VotingClassCard - Visual card for a voting class
 */
function VotingClassCard({ votingClass, index }) {
  const isDirect = votingClass.strategy === VOTING_STRATEGY.DIRECT;

  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={4}
      border="1px solid"
      borderColor={isDirect ? 'blue.200' : 'amethyst.200'}
      position="relative"
      overflow="hidden"
    >
      {/* Colored top bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={isDirect ? 'blue.400' : 'amethyst.400'}
      />

      <HStack justify="space-between" mb={3}>
        <Text fontWeight="600" color="warmGray.700">Class {index + 1}</Text>
        <Badge
          bg={isDirect ? 'blue.100' : 'amethyst.100'}
          color={isDirect ? 'blue.700' : 'amethyst.700'}
          borderRadius="full"
          fontSize="xs"
        >
          {isDirect ? 'Direct Democracy' : 'Token Weighted'}
        </Badge>
      </HStack>

      {/* Weight visualization bar */}
      <Box mb={3}>
        <HStack justify="space-between" fontSize="xs" color="warmGray.500" mb={1}>
          <Text>Voting Weight</Text>
          <Text fontWeight="600">{votingClass.slicePct}%</Text>
        </HStack>
        <Box h="8px" bg="warmGray.100" borderRadius="full" overflow="hidden">
          <Box
            h="100%"
            w={`${votingClass.slicePct}%`}
            bg={isDirect ? 'blue.400' : 'amethyst.400'}
            borderRadius="full"
            transition="width 0.3s ease"
          />
        </Box>
      </Box>

      {votingClass.quadratic && (
        <Badge bg="green.100" color="green.700" borderRadius="full" fontSize="xs">
          Quadratic Voting
        </Badge>
      )}
    </Box>
  );
}

/**
 * FeatureCard - Visual card for optional features
 */
function FeatureCard({ name, description, icon, isEnabled }) {
  return (
    <Box
      bg={isEnabled ? 'green.50' : 'warmGray.50'}
      borderRadius="lg"
      p={4}
      border="1px solid"
      borderColor={isEnabled ? 'green.200' : 'warmGray.200'}
      transition="all 0.15s ease"
      flex={1}
      minW="180px"
    >
      <HStack spacing={3}>
        <Icon
          as={icon}
          color={isEnabled ? 'green.500' : 'warmGray.400'}
          boxSize={5}
        />
        <VStack align="start" spacing={0}>
          <Text fontWeight="600" fontSize="sm" color="warmGray.700">{name}</Text>
          <Text fontSize="xs" color={isEnabled ? 'green.600' : 'warmGray.500'}>
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </VStack>
      </HStack>
      {description && (
        <Text fontSize="xs" color="warmGray.500" mt={2}>
          {description}
        </Text>
      )}
    </Box>
  );
}

/**
 * SmartWarning - Configuration warning with context
 */
function SmartWarning({ message }) {
  return (
    <Box
      bg="orange.50"
      borderRadius="lg"
      p={3}
      border="1px solid"
      borderColor="orange.200"
      mt={3}
    >
      <HStack spacing={2} align="start">
        <Icon as={PiInfo} color="orange.500" boxSize={4} mt={0.5} />
        <Text fontSize="sm" color="orange.700">
          {message}
        </Text>
      </HStack>
    </Box>
  );
}

// Status messages that rotate during deployment
const DEPLOYMENT_STATUSES = [
  "Confirming transaction...",
  "Building your organization on-chain...",
  "Setting up governance structures...",
  "Configuring permissions...",
  "Almost there...",
];

/**
 * DeploymentOverlay - Full-screen overlay during deployment
 */
function DeploymentOverlay({ orgName, isVisible }) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      // Reset indices when hidden
      setCurrentFactIndex(0);
      setCurrentStatusIndex(0);
      return;
    }

    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % COOP_FACTS.length);
    }, 5000);

    // Rotate status messages more frequently
    const statusInterval = setInterval(() => {
      setCurrentStatusIndex((prev) =>
        prev < DEPLOYMENT_STATUSES.length - 1 ? prev + 1 : prev
      );
    }, 4000);

    return () => {
      clearInterval(factInterval);
      clearInterval(statusInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(0, 0, 0, 0.75)"
        backdropFilter="blur(8px)"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation={`${fadeIn} 0.3s ease`}
      >
        <Box
          bg="white"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
          maxW="480px"
          w="90%"
          mx={4}
          textAlign="center"
          animation={`${scaleIn} 0.3s ease`}
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        >
          {/* Animated icon */}
          <Box
            w={{ base: "80px", md: "100px" }}
            h={{ base: "80px", md: "100px" }}
            mx="auto"
            mb={5}
            borderRadius="full"
            bg="coral.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
            animation={`${pulseGlow} 2s ease-in-out infinite`}
          >
            <Icon as={PiRocketLaunch} boxSize={{ base: 10, md: 12 }} color="coral.500" />
          </Box>

          <Heading size={{ base: "md", md: "lg" }} mb={2} color="warmGray.800">
            Bringing {orgName} to life...
          </Heading>
          <Text color="warmGray.600" mb={5} fontSize={{ base: "sm", md: "md" }}>
            Deploying your organization to the blockchain
          </Text>

          {/* Rotating fact */}
          <Box
            bg="warmGray.50"
            borderRadius="lg"
            p={4}
            mb={5}
            minH="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              fontSize="sm"
              color="warmGray.600"
              fontStyle="italic"
              key={currentFactIndex}
              animation={`${fadeIn} 0.5s ease`}
            >
              "{COOP_FACTS[currentFactIndex]}"
            </Text>
          </Box>

          {/* Progress indicator */}
          <Box h="4px" bg="warmGray.100" borderRadius="full" overflow="hidden" mb={4}>
            <Box
              h="100%"
              bg="coral.500"
              borderRadius="full"
              animation={`${subtlePulse} 1.5s ease-in-out infinite`}
              w={`${Math.min(20 + (currentStatusIndex * 20), 90)}%`}
              transition="width 0.5s ease"
            />
          </Box>

          <Text
            fontSize="sm"
            color="warmGray.500"
            key={currentStatusIndex}
            animation={`${fadeIn} 0.3s ease`}
          >
            {DEPLOYMENT_STATUSES[currentStatusIndex]}
          </Text>
        </Box>
      </Box>
    </Portal>
  );
}

/**
 * SuccessCelebration - Celebration overlay after successful deployment
 */
function SuccessCelebration({ orgName, onContinue, isVisible }) {
  if (!isVisible) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="rgba(255, 255, 255, 0.98)"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
        animation={`${fadeIn} 0.3s ease`}
      >
        <VStack spacing={{ base: 6, md: 8 }} textAlign="center" px={4} maxW="500px">
          {/* Success icon */}
          <Box animation={`${scaleIn} 0.5s ease`}>
            <Box
              w={{ base: "100px", md: "120px" }}
              h={{ base: "100px", md: "120px" }}
              borderRadius="full"
              bg="green.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={PiCheckCircle} boxSize={{ base: 14, md: 16 }} color="green.500" />
            </Box>
          </Box>

          <VStack spacing={3}>
            <HStack spacing={2} flexWrap="wrap" justify="center">
              <Icon as={PiSparkle} color="coral.500" boxSize={{ base: 5, md: 6 }} />
              <Heading size={{ base: "lg", md: "xl" }} color="warmGray.800">
                {orgName} is Live
              </Heading>
              <Icon as={PiSparkle} color="coral.500" boxSize={{ base: 5, md: 6 }} />
            </HStack>
            <Text color="warmGray.600" fontSize={{ base: "md", md: "lg" }} maxW="400px">
              You've just created a piece of community-owned infrastructure
            </Text>
          </VStack>

          <Box
            bg="warmGray.50"
            borderRadius="lg"
            p={4}
            w="100%"
          >
            <Text fontSize="sm" color="warmGray.600">
              Your organization joins a global network of cooperatives and community-owned
              projects building more equitable, resilient alternatives.
            </Text>
          </Box>

          <Button
            size="lg"
            bg="green.500"
            color="white"
            _hover={{ bg: 'green.600', transform: 'translateY(-2px)' }}
            px={8}
            onClick={onContinue}
          >
            Go to Your Organization
          </Button>
        </VStack>
      </Box>
    </Portal>
  );
}

/**
 * Main ReviewStep Component
 */
export function ReviewStep({
  onDeploy,
  isDeploying = false,
  isWalletConnected = false,
  deploymentStatus = 'idle', // 'idle' | 'deploying' | 'success' | 'error'
  onDeploySuccess,
}) {
  const { state, actions, selectors } = useDeployer();
  const toast = useToast();

  // Username state - managed by DeployerUsernameSection component
  const [deployerUsername, setDeployerUsername] = useState('');
  const [isUsernameReady, setIsUsernameReady] = useState(false);

  // Callback for username section
  const handleUsernameReady = useCallback((username, ready) => {
    setDeployerUsername(username);
    setIsUsernameReady(ready);
  }, []);

  // Theme colors
  const validationSuccessBg = useColorModeValue('rgba(72, 187, 120, 0.08)', 'rgba(72, 187, 120, 0.15)');
  const validationWarningBg = useColorModeValue('rgba(255, 165, 0, 0.08)', 'rgba(255, 165, 0, 0.15)');

  // Validate entire state
  const zodValidation = validateDeployerState(state);
  const configValidation = validateDeploymentConfig(state);
  const isValid = zodValidation.isValid && configValidation.isValid && isUsernameReady;

  // All validation errors combined
  const zodErrorMessages = zodValidation.isValid
    ? []
    : Object.values(zodValidation.errors).flat();
  const allErrors = [...zodErrorMessages, ...configValidation.errors];

  // Get template name
  const selectedTemplate = selectors?.getSelectedTemplate ? selectors.getSelectedTemplate() : null;
  const templateName = selectedTemplate?.name || null;

  // Navigation helper
  const goToStep = (stepIndex) => {
    actions.setStep(stepIndex);
  };

  // Handle deploy
  const handleDeploy = () => {
    if (!isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please fix all errors before deploying',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (onDeploy) {
      onDeploy({ deployerUsername });
    }
  };

  // Readiness checklist items
  const checklistItems = useMemo(() => [
    {
      key: 'identity',
      label: 'Identity',
      stepIndex: STEPS.IDENTITY,
      isComplete: !!(state.organization.name && state.organization.description),
    },
    {
      key: 'team',
      label: 'Team',
      stepIndex: STEPS.TEAM,
      isComplete: state.roles.length > 0,
    },
    {
      key: 'governance',
      label: 'Governance',
      stepIndex: STEPS.GOVERNANCE,
      isComplete: state.voting.classes.length > 0,
    },
    {
      key: 'permissions',
      label: 'Permissions',
      stepIndex: STEPS.GOVERNANCE,
      isComplete: Object.values(state.permissions).some(arr => arr.length > 0),
    },
    {
      key: 'username',
      label: 'Your Username',
      stepIndex: STEPS.LAUNCH,
      isComplete: isUsernameReady,
    },
  ], [state.organization, state.roles, state.voting, state.permissions, isUsernameReady]);

  // Smart warnings
  const warnings = useMemo(() => {
    const result = [];

    // High democracy + low quorum warning
    const directClass = state.voting.classes.find(c => c.strategy === VOTING_STRATEGY.DIRECT);
    if (directClass && directClass.slicePct >= 90 && state.voting.hybridQuorum <= 40) {
      result.push({
        key: 'high-democracy-low-quorum',
        message: 'With high democracy weight and low quorum, a small group could pass decisions. Consider increasing quorum for important votes.',
      });
    }

    // No vouching warning
    const hasVouching = state.roles.some(r => r.vouching.enabled);
    if (!hasVouching && state.roles.length > 0) {
      result.push({
        key: 'no-vouching',
        message: 'Anyone can join any role without approval. Consider enabling vouching if you want existing members to vet newcomers.',
      });
    }

    // Single role note
    if (state.roles.length === 1) {
      result.push({
        key: 'single-role',
        message: 'Your organization has one role. You can always add more roles later as you grow.',
      });
    }

    return result;
  }, [state.voting, state.roles]);

  // Summary stats
  const summaryStats = useMemo(() => ({
    roles: state.roles.length,
    votingClasses: state.voting.classes.length,
    permissionsSet: Object.values(state.permissions).filter(arr => arr.length > 0).length,
  }), [state.roles, state.voting, state.permissions]);

  return (
    <Box>
      {/* Deployment Overlay */}
      <DeploymentOverlay
        orgName={state.organization.name || 'Your Organization'}
        isVisible={isDeploying || deploymentStatus === 'deploying'}
      />

      {/* Success Celebration */}
      <SuccessCelebration
        orgName={state.organization.name || 'Your Organization'}
        isVisible={deploymentStatus === 'success'}
        onContinue={onDeploySuccess}
      />

      {/* Header */}
      <VStack spacing={2} mb={8} textAlign="center">
        <HStack spacing={2}>
          <Icon as={PiRocketLaunch} color="coral.500" boxSize={6} />
          <Heading size="lg" color="warmGray.800">Ready to Launch</Heading>
        </HStack>
        <Text color="warmGray.500" maxW="500px">
          Review your organization's configuration below, then bring it to life on the blockchain.
        </Text>
      </VStack>

      {/* Organization Identity Hero */}
      <OrganizationHero
        organization={state.organization}
        templateName={templateName}
        goToStep={goToStep}
      />

      {/* Readiness Checklist */}
      <ReadinessChecklist items={checklistItems} goToStep={goToStep} />

      {/* Validation Status */}
      {!isValid ? (
        <Box
          bg={validationWarningBg}
          backdropFilter="blur(8px)"
          borderRadius="xl"
          p={5}
          border="1px solid"
          borderColor="orange.200"
          borderLeft="4px solid"
          borderLeftColor="orange.400"
          mb={6}
        >
          <HStack spacing={3} mb={3}>
            <Icon as={PiWarningCircle} color="orange.500" boxSize={5} />
            <Text fontWeight="600" color="warmGray.800">A few things need your attention</Text>
          </HStack>
          <VStack align="start" spacing={1} pl={8}>
            {allErrors.map((error, idx) => (
              <Text key={idx} fontSize="sm" color="warmGray.600">
                • {error}
              </Text>
            ))}
          </VStack>
        </Box>
      ) : (
        <Box
          bg={validationSuccessBg}
          backdropFilter="blur(8px)"
          borderRadius="xl"
          p={5}
          border="1px solid"
          borderColor="green.200"
          borderLeft="4px solid"
          borderLeftColor="green.400"
          mb={6}
        >
          <HStack spacing={3}>
            <Icon as={PiCheckCircle} color="green.500" boxSize={5} />
            <Text fontWeight="600" color="warmGray.800">Everything looks good. You're ready to launch!</Text>
          </HStack>
        </Box>
      )}

      <VStack spacing={5} align="stretch">
        {/* Roles Section */}
        <ReviewSectionCard
          title={`Team Roles (${state.roles.length})`}
          stepIndex={STEPS.TEAM}
          icon={PiUsersThree}
          status={state.roles.length > 0 ? 'valid' : 'warning'}
          description="Your team structure defines who can do what in your organization."
          goToStep={goToStep}
        >
          {state.roles.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {state.roles.map((role, idx) => (
                <RoleCard key={idx} role={role} index={idx} roles={state.roles} />
              ))}
            </SimpleGrid>
          ) : (
            <Text color="warmGray.500" fontStyle="italic">No roles configured yet.</Text>
          )}

          {/* Smart warning for roles */}
          {warnings.find(w => w.key === 'single-role') && (
            <SmartWarning message={warnings.find(w => w.key === 'single-role').message} />
          )}
          {warnings.find(w => w.key === 'no-vouching') && (
            <SmartWarning message={warnings.find(w => w.key === 'no-vouching').message} />
          )}
        </ReviewSectionCard>

        {/* Voting Section */}
        <ReviewSectionCard
          title="Voting Configuration"
          stepIndex={STEPS.GOVERNANCE}
          icon={PiScales}
          status="valid"
          description={`Decisions require ${state.voting.hybridQuorum}% participation to pass.`}
          goToStep={goToStep}
        >
          {/* Quorum display */}
          <HStack spacing={6} mb={4} flexWrap="wrap">
            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="warmGray.200">
              <Text fontSize="xs" color="warmGray.500">Proposal Quorum</Text>
              <Text fontWeight="bold" fontSize="xl" color="warmGray.800">{state.voting.hybridQuorum}%</Text>
            </Box>
            <Box bg="white" p={3} borderRadius="lg" border="1px solid" borderColor="warmGray.200">
              <Text fontSize="xs" color="warmGray.500">Poll Quorum</Text>
              <Text fontWeight="bold" fontSize="xl" color="warmGray.800">{state.voting.ddQuorum}%</Text>
            </Box>
            <Tooltip
              label="Quorum ensures enough people participate for decisions to be legitimate"
              placement="top"
              hasArrow
            >
              <Box cursor="help">
                <Icon as={InfoIcon} color="warmGray.400" boxSize={4} />
              </Box>
            </Tooltip>
          </HStack>

          {/* Voting Classes */}
          <Text fontWeight="500" fontSize="sm" color="warmGray.700" mb={3}>
            Voting Classes ({state.voting.classes.length})
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {state.voting.classes.map((cls, idx) => (
              <VotingClassCard key={idx} votingClass={cls} index={idx} />
            ))}
          </SimpleGrid>

          {/* Smart warning for voting */}
          {warnings.find(w => w.key === 'high-democracy-low-quorum') && (
            <SmartWarning message={warnings.find(w => w.key === 'high-democracy-low-quorum').message} />
          )}
        </ReviewSectionCard>

        {/* Permissions Section */}
        <ReviewSectionCard
          title="Permissions"
          stepIndex={STEPS.TEAM}
          icon={PiShieldCheck}
          status="valid"
          description="These settings control which roles can perform different actions."
          goToStep={goToStep}
        >
          {selectors.isAdvancedMode() ? (
            /* Advanced Mode: Granular permissions accordion */
            <Accordion allowToggle>
              {PERMISSION_KEYS.map((key) => {
                const desc = PERMISSION_DESCRIPTIONS[key];
                const assignedRoles = state.permissions[key] || [];

                return (
                  <AccordionItem
                    key={key}
                    border="none"
                    mb={2}
                    bg="white"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                  >
                    <AccordionButton
                      py={3}
                      px={4}
                      _hover={{ bg: 'warmGray.50' }}
                      _expanded={{ bg: 'warmGray.50', borderBottom: '1px solid', borderColor: 'warmGray.100' }}
                    >
                      <HStack flex="1" textAlign="left" spacing={3}>
                        <Text fontSize="sm" fontWeight="600" color="warmGray.700">
                          {desc.label}
                        </Text>
                        <Badge
                          bg={assignedRoles.length > 0 ? 'amethyst.100' : 'warmGray.100'}
                          color={assignedRoles.length > 0 ? 'amethyst.700' : 'warmGray.500'}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {assignedRoles.length} role{assignedRoles.length !== 1 ? 's' : ''}
                        </Badge>
                      </HStack>
                      <AccordionIcon color="warmGray.400" />
                    </AccordionButton>
                    <AccordionPanel pb={3} bg="warmGray.50">
                      <HStack spacing={2} flexWrap="wrap">
                        {assignedRoles.length > 0 ? (
                          assignedRoles.map((idx) => (
                            <Badge
                              key={idx}
                              bg="white"
                              color="warmGray.700"
                              border="1px solid"
                              borderColor="warmGray.200"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                            >
                              {state.roles[idx]?.name || `Role ${idx}`}
                            </Badge>
                          ))
                        ) : (
                          <Text fontSize="sm" color="warmGray.400" fontStyle="italic">
                            No roles assigned
                          </Text>
                        )}
                      </HStack>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            /* Simple Mode: Power bundles per role */
            <VStack spacing={4} align="stretch">
              {state.roles.map((role, roleIdx) => {
                const hasAdmin = roleHasBundle(state.permissions, roleIdx, 'admin');
                const hasMember = roleHasBundle(state.permissions, roleIdx, 'member');
                const hasCreator = roleHasBundle(state.permissions, roleIdx, 'creator');

                const bundles = [
                  {
                    key: 'admin',
                    label: 'Admin',
                    has: hasAdmin,
                    color: 'coral',
                    desc: 'Can approve rewards, create tasks and bounties, set up learning content, and run polls',
                  },
                  {
                    key: 'member',
                    label: 'Member',
                    has: hasMember,
                    color: 'blue',
                    desc: 'Can join easily, earn and hold tokens, access learning materials, and vote in polls',
                  },
                  {
                    key: 'creator',
                    label: 'Creator',
                    has: hasCreator,
                    color: 'amethyst',
                    desc: 'Can propose new ideas for the community to vote on',
                  },
                ];

                const activeBundles = bundles.filter((b) => b.has);

                return (
                  <Box
                    key={roleIdx}
                    bg="white"
                    borderRadius="lg"
                    p={4}
                    border="1px solid"
                    borderColor="warmGray.200"
                  >
                    <HStack justify="space-between" mb={3}>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={role.name} bg="coral.500" color="white" />
                        <Text fontWeight="600" color="warmGray.800">{role.name}</Text>
                      </HStack>
                    </HStack>

                    {activeBundles.length > 0 ? (
                      <VStack spacing={2} align="stretch">
                        {activeBundles.map((bundle) => (
                          <Box
                            key={bundle.key}
                            bg={`${bundle.color}.50`}
                            borderRadius="md"
                            p={3}
                            border="1px solid"
                            borderColor={`${bundle.color}.200`}
                          >
                            <HStack spacing={2} mb={1}>
                              <Badge
                                bg={`${bundle.color}.100`}
                                color={`${bundle.color}.700`}
                                borderRadius="full"
                                fontSize="xs"
                                px={2}
                              >
                                {bundle.label}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="warmGray.600">
                              {bundle.desc}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="warmGray.400" fontStyle="italic">
                        No special permissions assigned
                      </Text>
                    )}
                  </Box>
                );
              })}

              {state.roles.length === 0 && (
                <Text color="warmGray.500" fontStyle="italic">No roles configured yet.</Text>
              )}
            </VStack>
          )}
        </ReviewSectionCard>

        {/* Features Section */}
        <ReviewSectionCard
          title="Optional Features"
          stepIndex={STEPS.TEMPLATE}
          icon={PiGear}
          status="valid"
          goToStep={goToStep}
        >
          <Flex gap={4} flexWrap="wrap">
            <FeatureCard
              name="Education Hub"
              description="Create learning resources for your community"
              icon={PiGraduationCap}
              isEnabled={state.features.educationHubEnabled}
            />
            <FeatureCard
              name="Election Hub"
              description="Run elections for leadership positions"
              icon={PiHandshake}
              isEnabled={state.features.electionHubEnabled}
            />
          </Flex>
        </ReviewSectionCard>

        {/* Deploy Section */}
        <Box
          bg="rgba(255, 255, 255, 0.8)"
          backdropFilter="blur(12px)"
          borderRadius="2xl"
          p={8}
          boxShadow="0 -4px 24px rgba(0, 0, 0, 0.04)"
          border="1px solid"
          borderColor="warmGray.100"
          mt={4}
        >
          <VStack spacing={6}>
            {/* Summary stats */}
            <HStack spacing={8} flexWrap="wrap" justify="center">
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="700" color="coral.500">{summaryStats.roles}</Text>
                <Text fontSize="xs" color="warmGray.500">Roles</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="700" color="amethyst.500">{summaryStats.votingClasses}</Text>
                <Text fontSize="xs" color="warmGray.500">Voting Classes</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize="2xl" fontWeight="700" color="blue.500">{summaryStats.permissionsSet}</Text>
                <Text fontSize="xs" color="warmGray.500">Permissions Set</Text>
              </VStack>
            </HStack>

            {/* Navigation */}
            <NavigationButtons
              onBack={() => actions.prevStep()}
              showNext={false}
            />

            {/* Deploy button area */}
            {!isWalletConnected ? (
              <VStack spacing={4} w="100%">
                <Box
                  bg="warmGray.50"
                  borderRadius="lg"
                  p={4}
                  w="100%"
                  maxW="400px"
                  textAlign="center"
                >
                  <Text color="warmGray.600" mb={3}>Connect your wallet to deploy</Text>
                  <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
                </Box>
              </VStack>
            ) : (
              <VStack spacing={4} w="100%" align="center">
                {/* Username Section - Required before deployment */}
                <DeployerUsernameSection onUsernameReady={handleUsernameReady} />

                {/* Deploy Button */}
                <Button
                  bg="coral.500"
                  color="white"
                  _hover={{
                    bg: 'coral.600',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(240, 101, 67, 0.35)',
                  }}
                  _active={{ bg: 'coral.700', transform: 'translateY(0)' }}
                  size="lg"
                  w="100%"
                  maxW="400px"
                  h="56px"
                  fontSize="lg"
                  fontWeight="600"
                  onClick={handleDeploy}
                  isDisabled={!isValid || isDeploying}
                  leftIcon={<Icon as={PiRocketLaunch} boxSize={5} />}
                  transition="all 0.2s ease"
                >
                  Launch {state.organization.name || 'Your Organization'}
                </Button>
              </VStack>
            )}

            <Text fontSize="xs" color="warmGray.400" textAlign="center" maxW="350px">
              This will deploy your organization to the blockchain.
              Make sure you've reviewed all settings above.
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default ReviewStep;
