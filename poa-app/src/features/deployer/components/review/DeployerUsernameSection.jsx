/**
 * DeployerUsernameSection
 * Displays username status in ReviewStep:
 * - If user has existing username: shows read-only display
 * - If user needs username: shows required input with validation
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Badge,
  Icon,
  Spinner,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  PiUser,
  PiCheckCircle,
  PiWarningCircle,
  PiArrowClockwise,
} from 'react-icons/pi';
import { useDeployerUsername } from '../../hooks/useDeployerUsername';

/**
 * DeployerUsernameSection Component
 * @param {Object} props
 * @param {Function} props.onUsernameReady - Callback when username status changes (username, isReady)
 */
export function DeployerUsernameSection({ onUsernameReady }) {
  const {
    existingUsername,
    isLoading,
    existingError,
    inputUsername,
    setInputUsername,
    validationState,
    isReady,
    finalUsername,
    retry,
  } = useDeployerUsername();

  // Notify parent of username state changes
  React.useEffect(() => {
    if (onUsernameReady) {
      onUsernameReady(finalUsername, isReady);
    }
  }, [finalUsername, isReady, onUsernameReady]);

  // Theme colors
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(51, 48, 44, 0.7)');
  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const inputBg = useColorModeValue('white', 'warmGray.700');
  const labelColor = useColorModeValue('warmGray.700', 'warmGray.300');
  const helperColor = useColorModeValue('warmGray.500', 'warmGray.400');

  // Loading state
  if (isLoading) {
    return (
      <Box
        bg={cardBg}
        backdropFilter="blur(8px)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        p={5}
        w="100%"
        maxW="400px"
      >
        <HStack spacing={3} justify="center">
          <Spinner size="sm" color="coral.500" />
          <Text fontSize="sm" color={helperColor}>Checking your username...</Text>
        </HStack>
      </Box>
    );
  }

  // Error state (couldn't check existing username)
  if (existingError) {
    return (
      <Box
        bg={cardBg}
        backdropFilter="blur(8px)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="red.200"
        p={5}
        w="100%"
        maxW="400px"
      >
        <VStack spacing={3}>
          <HStack spacing={2}>
            <Icon as={PiWarningCircle} color="red.500" boxSize={5} />
            <Text fontSize="sm" color="red.600">{existingError}</Text>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={<Icon as={PiArrowClockwise} />}
            onClick={retry}
          >
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  // User has existing username - read-only display
  if (existingUsername) {
    return (
      <Box
        bg={cardBg}
        backdropFilter="blur(8px)"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="green.200"
        overflow="hidden"
        w="100%"
        maxW="400px"
      >
        {/* Success bar */}
        <Box h="3px" bg="green.400" />

        <Box p={5}>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Box p={2} borderRadius="lg" bg="green.50">
                  <Icon as={PiUser} color="green.500" boxSize={5} />
                </Box>
                <Text fontWeight="600" color={labelColor}>Your Username</Text>
              </HStack>
              <Badge colorScheme="green" borderRadius="full" px={2}>
                <HStack spacing={1}>
                  <Icon as={PiCheckCircle} boxSize={3} />
                  <Text>Verified</Text>
                </HStack>
              </Badge>
            </HStack>

            <Box
              bg="green.50"
              borderRadius="lg"
              p={3}
              border="1px solid"
              borderColor="green.200"
            >
              <Text fontSize="lg" fontWeight="600" color="green.700">
                @{existingUsername}
              </Text>
            </Box>

            <Text fontSize="xs" color={helperColor}>
              This username is registered to your wallet and will be linked to your organization.
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // User needs to enter a username
  const hasError = validationState.error && inputUsername.length > 0;
  const isValid = validationState.isValid && !validationState.isChecking;
  const statusColor = hasError ? 'coral' : isValid ? 'green' : 'warmGray';

  return (
    <Box
      bg={cardBg}
      backdropFilter="blur(8px)"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={hasError ? 'coral.200' : isValid ? 'green.200' : borderColor}
      overflow="hidden"
      w="100%"
      maxW="400px"
    >
      {/* Status bar */}
      <Box
        h="3px"
        bg={hasError ? 'coral.400' : isValid ? 'green.400' : 'warmGray.300'}
      />

      <Box p={5}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Box
                p={2}
                borderRadius="lg"
                bg={hasError ? 'coral.50' : isValid ? 'green.50' : 'warmGray.100'}
              >
                <Icon
                  as={PiUser}
                  color={hasError ? 'coral.500' : isValid ? 'green.500' : 'warmGray.500'}
                  boxSize={5}
                />
              </Box>
              <Text fontWeight="600" color={labelColor}>Your Username</Text>
            </HStack>
            <Badge
              colorScheme={hasError ? 'orange' : isValid ? 'green' : 'gray'}
              borderRadius="full"
              px={2}
            >
              {hasError ? 'Required' : isValid ? 'Ready' : 'Required'}
            </Badge>
          </HStack>

          <InputGroup size="lg">
            <InputLeftElement>
              <Text color={helperColor} fontWeight="500">@</Text>
            </InputLeftElement>
            <Input
              placeholder="yourname"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              bg={inputBg}
              borderColor={hasError ? 'coral.300' : isValid ? 'green.300' : 'warmGray.200'}
              _hover={{
                borderColor: hasError ? 'coral.400' : isValid ? 'green.400' : 'warmGray.300',
              }}
              _focus={{
                borderColor: hasError ? 'coral.400' : 'coral.400',
                boxShadow: `0 0 0 2px rgba(240, 101, 67, 0.15)`,
              }}
            />
            <InputRightElement>
              {validationState.isChecking && (
                <Spinner size="sm" color="coral.500" />
              )}
              {isValid && !validationState.isChecking && (
                <Icon as={PiCheckCircle} color="green.500" boxSize={5} />
              )}
              {hasError && !validationState.isChecking && (
                <Icon as={PiWarningCircle} color="coral.500" boxSize={5} />
              )}
            </InputRightElement>
          </InputGroup>

          {/* Error message */}
          {hasError && (
            <Text fontSize="sm" color="coral.600">
              {validationState.error}
            </Text>
          )}

          {/* Helper text */}
          {!hasError && (
            <Text fontSize="xs" color={helperColor}>
              {isValid
                ? 'This username will be registered when you deploy.'
                : 'Username is required to deploy. 3-32 characters, letters, numbers, and underscores only.'}
            </Text>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

export default DeployerUsernameSection;
