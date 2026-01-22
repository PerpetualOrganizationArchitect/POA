/**
 * GovernanceConfigSection - Displays voting system configuration
 */

import React from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  Badge,
  Skeleton,
  Progress,
} from '@chakra-ui/react';
import { FiUsers, FiLayers, FiPercent } from 'react-icons/fi';

const glassLayerStyle = {
  position: 'absolute',
  height: '100%',
  width: '100%',
  zIndex: -1,
  borderRadius: 'inherit',
  backdropFilter: 'blur(20px)',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  boxShadow: 'inset 0 0 15px rgba(148, 115, 220, 0.15)',
  border: '1px solid rgba(148, 115, 220, 0.2)',
};

/**
 * Card for a single voting system
 */
function VotingCard({ title, description, quorum, icon, colorScheme = 'purple', classWeights, isQuadratic }) {
  return (
    <Box
      position="relative"
      borderRadius="xl"
      p={5}
      overflow="hidden"
      height="100%"
    >
      <Box
        position="absolute"
        inset={0}
        borderRadius="inherit"
        bg="rgba(30, 30, 40, 0.6)"
        border="1px solid rgba(148, 115, 220, 0.2)"
        zIndex={-1}
      />

      <VStack align="stretch" spacing={4} height="100%">
        {/* Header */}
        <HStack spacing={3}>
          <Box
            p={2}
            borderRadius="lg"
            bg={`${colorScheme}.900`}
            opacity={0.8}
          >
            <Icon as={icon} color={`${colorScheme}.300`} boxSize={5} />
          </Box>
          <Heading size="sm" color="white">
            {title}
          </Heading>
          {isQuadratic && (
            <Badge colorScheme="blue" variant="subtle" fontSize="2xs">
              Quadratic
            </Badge>
          )}
        </HStack>

        {/* Class Weights for Hybrid Voting */}
        {classWeights && (
          <Box
            p={3}
            bg="rgba(255, 255, 255, 0.05)"
            borderRadius="lg"
            border="1px solid rgba(255, 255, 255, 0.1)"
          >
            <Text fontSize="xs" color="gray.500" mb={2}>
              Voting Power Split
            </Text>
            <HStack spacing={4} justify="center">
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="purple.300">
                  {classWeights.democracy}%
                </Text>
                <Text fontSize="xs" color="gray.400">Democracy</Text>
              </VStack>
              <Text color="gray.600">/</Text>
              <VStack spacing={0}>
                <Text fontSize="xl" fontWeight="bold" color="blue.300">
                  {classWeights.contribution}%
                </Text>
                <Text fontSize="xs" color="gray.400">Work</Text>
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Description */}
        <Text color="gray.400" fontSize="sm" flex={1}>
          {description}
        </Text>

        {/* Quorum */}
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="xs" color="gray.500">
              Quorum Required
            </Text>
            <Badge colorScheme={colorScheme} borderRadius="full" px={2}>
              <HStack spacing={1}>
                <Icon as={FiPercent} boxSize={3} />
                <Text>{quorum}%</Text>
              </HStack>
            </Badge>
          </HStack>
          <Progress
            value={quorum}
            size="sm"
            colorScheme={colorScheme}
            borderRadius="full"
            bg="rgba(255, 255, 255, 0.1)"
          />
        </Box>
      </VStack>
    </Box>
  );
}

export function GovernanceConfigSection({
  governance = {},
  tokenInfo = null,
  votingClasses = [],
  loading = false,
}) {
  const { hybridVoting, directDemocracyVoting } = governance;

  // Read class weights directly from subgraph data
  let classWeights = null;
  let isQuadratic = false;

  if (votingClasses && votingClasses.length > 0) {
    let democracyWeight = 0;
    let contributionWeight = 0;

    votingClasses.forEach(cls => {
      if (cls.strategy === 'DIRECT') {
        democracyWeight = Number(cls.slicePct);
      } else if (cls.strategy === 'ERC20_BAL') {
        contributionWeight = Number(cls.slicePct);
        isQuadratic = cls.quadratic;
      }
    });

    classWeights = {
      democracy: democracyWeight,
      contribution: contributionWeight,
    };
  }

  if (loading) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
      >
        <Box style={glassLayerStyle} />
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Skeleton height="180px" borderRadius="xl" />
          <Skeleton height="180px" borderRadius="xl" />
        </SimpleGrid>
      </Box>
    );
  }

  const hasVotingSystems = hybridVoting || directDemocracyVoting;

  if (!hasVotingSystems) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
        textAlign="center"
      >
        <Box style={glassLayerStyle} />
        <Text color="gray.400">No voting systems configured</Text>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      overflow="hidden"
    >
      <Box style={glassLayerStyle} />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {/* Hybrid Voting */}
        {hybridVoting && (
          <VotingCard
            title="Hybrid Voting"
            description="Combines participation-weighted voting with direct democracy. Workers and community members share governance power based on configured class weights."
            quorum={hybridVoting.quorum}
            icon={FiLayers}
            colorScheme="purple"
            classWeights={classWeights}
            isQuadratic={isQuadratic}
          />
        )}

        {/* Direct Democracy */}
        {directDemocracyVoting && (
          <VotingCard
            title="Direct Democracy"
            description="One member, one vote. Every member has equal voting power regardless of participation level. Used for community polls and decisions."
            quorum={directDemocracyVoting.quorumPercentage}
            icon={FiUsers}
            colorScheme="blue"
          />
        )}
      </SimpleGrid>

      {/* Token Info */}
      {tokenInfo && (
        <Box mt={4}>
          <Box
            position="relative"
            borderRadius="xl"
            p={4}
            overflow="hidden"
          >
            <Box
              position="absolute"
              inset={0}
              borderRadius="inherit"
              bg="rgba(30, 30, 40, 0.4)"
              border="1px solid rgba(148, 115, 220, 0.1)"
              zIndex={-1}
            />

            <HStack justify="space-between" flexWrap="wrap" gap={4}>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="xs" color="gray.500">
                  Participation Token
                </Text>
                <HStack>
                  <Text fontWeight="semibold" color="white">
                    {tokenInfo.name}
                  </Text>
                  <Badge colorScheme="purple" variant="subtle">
                    {tokenInfo.symbol}
                  </Badge>
                </HStack>
              </VStack>

              <VStack align="flex-end" spacing={0}>
                <Text fontSize="xs" color="gray.500">
                  Total Supply
                </Text>
                <Text fontWeight="semibold" color="white">
                  {tokenInfo.totalSupply} {tokenInfo.symbol}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default GovernanceConfigSection;
