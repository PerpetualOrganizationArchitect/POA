/**
 * QuadraticVotingExplainer - Educational component explaining quadratic voting
 *
 * Shows a side-by-side comparison of linear vs quadratic voting power,
 * with concrete examples and visualization of the benefits.
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Icon,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { PiLightning, PiInfo, PiUsers, PiChartBar } from 'react-icons/pi';

/**
 * Example data showing voting power differences
 */
const EXAMPLE_USERS = [
  { name: 'Alice', tokens: 100, emoji: '👩‍💼' },
  { name: 'Bob', tokens: 25, emoji: '👨‍💻' },
  { name: 'Carol', tokens: 4, emoji: '👩‍🎨' },
];

/**
 * Calculate square root (for quadratic voting)
 */
function sqrt(n) {
  return Math.sqrt(n);
}

export function QuadraticVotingExplainer({ isEnabled = false }) {
  const cardBg = useColorModeValue('warmGray.50', 'warmGray.800');
  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const headingColor = useColorModeValue('warmGray.700', 'warmGray.200');
  const textColor = useColorModeValue('warmGray.600', 'warmGray.400');
  const highlightBg = useColorModeValue('orange.50', 'orange.900');
  const highlightBorder = useColorModeValue('orange.200', 'orange.700');

  // Calculate total tokens
  const totalTokens = EXAMPLE_USERS.reduce((sum, user) => sum + user.tokens, 0);
  const totalSqrt = EXAMPLE_USERS.reduce((sum, user) => sum + sqrt(user.tokens), 0);

  return (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={isEnabled ? highlightBorder : borderColor}
    >
      {/* Header */}
      <HStack spacing={3} mb={4}>
        <Icon as={PiLightning} color="orange.500" boxSize={6} />
        <Text fontWeight="600" fontSize="lg" color={headingColor}>
          Understanding Quadratic Voting
        </Text>
        {isEnabled && (
          <Badge colorScheme="orange" variant="solid">
            Enabled
          </Badge>
        )}
      </HStack>

      {/* Description */}
      <Text fontSize="md" color={textColor} mb={6}>
        Quadratic voting reduces the influence of large token holders by taking the
        <Text as="span" fontWeight="bold" color="orange.600"> square root </Text>
        of their token balance as voting power. This prevents whales from dominating governance.
      </Text>

      {/* Side-by-side comparison */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
        {/* WITHOUT Quadratic */}
        <Box
          p={4}
          bg={useColorModeValue('white', 'warmGray.700')}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack mb={3}>
            <Icon as={PiChartBar} color="gray.500" />
            <Text fontWeight="600" color="gray.600">
              Without Quadratic
            </Text>
          </HStack>

          <VStack align="stretch" spacing={2}>
            {EXAMPLE_USERS.map((user) => {
              const power = user.tokens;
              const pct = ((power / totalTokens) * 100).toFixed(0);
              return (
                <HStack key={user.name} justify="space-between" fontSize="sm">
                  <HStack>
                    <Text>{user.emoji}</Text>
                    <Text color={textColor}>{user.name}</Text>
                    <Text color="gray.400">({user.tokens} tokens)</Text>
                  </HStack>
                  <HStack>
                    <Box
                      w={`${Math.max(power / 2, 8)}px`}
                      h="8px"
                      bg="gray.400"
                      borderRadius="full"
                    />
                    <Text fontWeight="bold" color="gray.600" minW="60px" textAlign="right">
                      {power} votes ({pct}%)
                    </Text>
                  </HStack>
                </HStack>
              );
            })}
          </VStack>

          <Box mt={4} pt={3} borderTopWidth="1px" borderColor={borderColor}>
            <Text fontSize="xs" color="gray.500">
              Alice has <Text as="span" fontWeight="bold">4x</Text> Bob's power and{' '}
              <Text as="span" fontWeight="bold">25x</Text> Carol's power
            </Text>
          </Box>
        </Box>

        {/* WITH Quadratic */}
        <Box
          p={4}
          bg={isEnabled ? highlightBg : useColorModeValue('white', 'warmGray.700')}
          borderRadius="lg"
          border="2px solid"
          borderColor={isEnabled ? 'orange.400' : borderColor}
        >
          <HStack mb={3}>
            <Icon as={PiLightning} color="orange.500" />
            <Text fontWeight="600" color="orange.600">
              With Quadratic
            </Text>
            {isEnabled && (
              <Badge colorScheme="orange" size="sm">
                Active
              </Badge>
            )}
          </HStack>

          <VStack align="stretch" spacing={2}>
            {EXAMPLE_USERS.map((user) => {
              const power = Math.round(sqrt(user.tokens));
              const pct = ((sqrt(user.tokens) / totalSqrt) * 100).toFixed(0);
              return (
                <HStack key={user.name} justify="space-between" fontSize="sm">
                  <HStack>
                    <Text>{user.emoji}</Text>
                    <Text color={textColor}>{user.name}</Text>
                    <Text color="gray.400">({user.tokens} tokens)</Text>
                  </HStack>
                  <HStack>
                    <Box
                      w={`${Math.max(power * 4, 8)}px`}
                      h="8px"
                      bg="orange.400"
                      borderRadius="full"
                    />
                    <Text fontWeight="bold" color="orange.600" minW="60px" textAlign="right">
                      {power} votes ({pct}%)
                    </Text>
                  </HStack>
                </HStack>
              );
            })}
          </VStack>

          <Box mt={4} pt={3} borderTopWidth="1px" borderColor={borderColor}>
            <Text fontSize="xs" color="orange.600">
              Alice has <Text as="span" fontWeight="bold">2x</Text> Bob's power and{' '}
              <Text as="span" fontWeight="bold">5x</Text> Carol's power
            </Text>
          </Box>
        </Box>
      </SimpleGrid>

      {/* Key insight */}
      <Box
        p={4}
        bg={useColorModeValue('blue.50', 'blue.900')}
        borderRadius="lg"
        borderLeftWidth="4px"
        borderLeftColor="blue.400"
      >
        <HStack align="start" spacing={3}>
          <Icon as={PiInfo} color="blue.500" boxSize={5} mt={0.5} />
          <Box>
            <Text fontWeight="600" color="blue.700" mb={1}>
              When to use quadratic voting
            </Text>
            <Text fontSize="sm" color="blue.600">
              Best for communities that want token-weighted governance but need to prevent a
              small number of large holders from controlling all decisions. It's a balance
              between pure democracy and pure plutocracy.
            </Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}

/**
 * Compact version for inline display
 */
export function QuadraticVotingExplainerCompact() {
  return (
    <Box
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
            Quadratic Voting
          </Text>
          <Text fontSize="xs" color="orange.600">
            Uses √(tokens) as voting power. 100 tokens = 10 votes, 10,000 tokens = 100 votes.
            Reduces whale influence while still rewarding token holders.
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}

export default QuadraticVotingExplainer;
