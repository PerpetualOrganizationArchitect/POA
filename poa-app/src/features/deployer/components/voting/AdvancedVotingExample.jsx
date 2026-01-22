/**
 * AdvancedVotingExample - Dynamic voting scenario for multi-class configurations
 *
 * Shows how votes work across multiple voting classes with:
 * - Left: Voting power breakdown by class
 * - Right: Sample vote scenario with outcome
 * - Generates example voters that MATCH the actual configuration
 * - Handles DIRECT (role-based) and ERC20_BAL (token-based) strategies
 */

import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Badge,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { PiCheckCircle, PiXCircle, PiUsers, PiChartBar, PiLightning, PiWarning } from 'react-icons/pi';
import { VOTING_STRATEGY } from '../../context/DeployerContext';

/**
 * Generate example voters that match the actual voting class configuration
 */
function generateExampleVoters(votingClasses, roles) {
  // Collect all role indices used in Direct classes
  const usedRoleIndices = new Set();
  votingClasses.forEach((vc) => {
    if (vc.strategy === VOTING_STRATEGY.DIRECT && vc.hatIds?.length > 0) {
      vc.hatIds.forEach((idx) => usedRoleIndices.add(idx));
    }
  });

  const allRoleIndices = [...usedRoleIndices];
  const hasTokenClass = votingClasses.some((vc) => vc.strategy === VOTING_STRATEGY.ERC20_BAL);
  const hasDirectClass = votingClasses.some((vc) => vc.strategy === VOTING_STRATEGY.DIRECT);

  // Generate meaningful voters based on configuration
  const voters = [];

  if (hasDirectClass && allRoleIndices.length > 0) {
    // Voter 1: Has all eligible roles + high tokens
    const firstRoleName = roles[allRoleIndices[0]]?.name || 'Member';
    voters.push({
      name: firstRoleName,
      emoji: '👩‍💼',
      tokens: 100,
      hasRole: [...allRoleIndices], // Has all roles
      vote: 'yes',
    });

    // Voter 2: Has some roles + medium tokens
    if (allRoleIndices.length > 1) {
      const secondRoleName = roles[allRoleIndices[1]]?.name || 'Contributor';
      voters.push({
        name: secondRoleName,
        emoji: '👨‍💻',
        tokens: 36,
        hasRole: allRoleIndices.slice(1), // Has second role only
        vote: 'no',
      });
    } else {
      voters.push({
        name: 'Contributor',
        emoji: '👨‍💻',
        tokens: 36,
        hasRole: [...allRoleIndices], // Same role
        vote: 'no',
      });
    }
  } else if (hasTokenClass) {
    // No Direct classes with roles - create token-focused voters
    voters.push({
      name: 'Major Holder',
      emoji: '👩‍💼',
      tokens: 100,
      hasRole: [],
      vote: 'yes',
    });

    voters.push({
      name: 'Regular Holder',
      emoji: '👨‍💻',
      tokens: 36,
      hasRole: [],
      vote: 'no',
    });
  }

  // Voter 3: Token holder only (if there's a token class)
  if (hasTokenClass) {
    voters.push({
      name: 'Token Holder',
      emoji: '👩‍🎨',
      tokens: 16,
      hasRole: [],
      vote: 'no',
    });
  } else if (voters.length < 3 && hasDirectClass) {
    // Add a third voter with roles for Direct-only setups
    voters.push({
      name: 'New Member',
      emoji: '👩‍🎨',
      tokens: 0,
      hasRole: allRoleIndices.length > 0 ? [allRoleIndices[0]] : [],
      vote: 'no',
    });
  }

  return voters;
}

/**
 * Calculate voting power for a voter in a specific class
 */
function calculateClassPower(voter, votingClass) {
  if (votingClass.strategy === VOTING_STRATEGY.DIRECT) {
    // Direct voting: 1 vote if voter has one of the eligible roles
    const hasEligibleRole = votingClass.hatIds?.some((roleIdx) =>
      voter.hasRole.includes(roleIdx)
    );
    return hasEligibleRole ? 1 : 0;
  }

  // ERC20_BAL: token-based voting
  if (voter.tokens < (votingClass.minBalance || 0)) {
    return 0;
  }

  return votingClass.quadratic ? Math.sqrt(voter.tokens) : voter.tokens;
}

/**
 * Get class label using actual role names
 */
function getClassLabel(votingClass, roles, index) {
  if (votingClass.strategy === VOTING_STRATEGY.DIRECT) {
    if (votingClass.hatIds?.length > 0) {
      const roleNames = votingClass.hatIds
        .map((idx) => roles[idx]?.name)
        .filter(Boolean);
      if (roleNames.length > 0) {
        return roleNames.length <= 2 ? roleNames.join(' + ') : `${roleNames[0]} +${roleNames.length - 1}`;
      }
    }
    return `Role-based ${index + 1}`;
  }
  return votingClass.quadratic ? 'Tokens (Quadratic)' : 'Tokens (Linear)';
}

/**
 * Generate insight based on actual outcome
 */
function generateInsight(votingClasses, yesTotal, noTotal, passes) {
  const directWeight = votingClasses
    .filter((vc) => vc.strategy === VOTING_STRATEGY.DIRECT)
    .reduce((sum, vc) => sum + vc.slicePct, 0);
  const tokenWeight = 100 - directWeight;
  const hasQuadratic = votingClasses.some((vc) => vc.quadratic);

  if (passes) {
    if (directWeight > 60) {
      return 'The proposal passes. Role-based voting gives active members significant influence in this configuration.';
    } else if (hasQuadratic && tokenWeight > 50) {
      return 'The proposal passes. Quadratic voting helped balance influence between large and small token holders.';
    } else if (tokenWeight > 60) {
      return 'The proposal passes. Token holdings give the supporter enough weighted power to win despite being outnumbered.';
    } else {
      return 'The proposal passes with combined support from role-based and token-weighted voting.';
    }
  } else {
    if (directWeight > 60) {
      return 'The proposal fails. Role-based voting allowed active members to block it despite token holdings.';
    } else if (hasQuadratic) {
      return 'The proposal fails. Quadratic voting reduced the large holder\'s advantage, allowing smaller holders to block it.';
    } else {
      return 'The proposal fails. Combined opposition outweighed the supporter\'s voting power.';
    }
  }
}

export function AdvancedVotingExample({ votingClasses = [], roles = [] }) {
  const cardBg = useColorModeValue('warmGray.50', 'warmGray.800');
  const textColor = useColorModeValue('warmGray.700', 'warmGray.200');
  const mutedColor = useColorModeValue('warmGray.500', 'warmGray.400');
  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');
  const voterCardBg = useColorModeValue('white', 'warmGray.700');
  const classBoxBg = useColorModeValue('gray.50', 'gray.700');

  // Skip if no voting classes
  if (!votingClasses || votingClasses.length === 0) {
    return null;
  }

  // Generate voters that match the configuration
  const voters = useMemo(
    () => generateExampleVoters(votingClasses, roles),
    [votingClasses, roles]
  );

  // Calculate per-class voting powers for each voter
  const voterPowers = useMemo(() => {
    return voters.map((voter) => {
      const powers = votingClasses.map((vc) => calculateClassPower(voter, vc));
      return { ...voter, powers };
    });
  }, [voters, votingClasses]);

  // Calculate class totals
  const classTotals = useMemo(() => {
    return votingClasses.map((_, classIdx) =>
      voterPowers.reduce((sum, v) => sum + v.powers[classIdx], 0)
    );
  }, [voterPowers, votingClasses]);

  // Calculate final weighted vote tallies
  const { yesTotal, noTotal } = useMemo(() => {
    let yes = 0;
    let no = 0;

    voterPowers.forEach((voter) => {
      votingClasses.forEach((vc, classIdx) => {
        const classTotal = classTotals[classIdx];
        if (classTotal === 0) return;

        const voterShare = (voter.powers[classIdx] / classTotal) * vc.slicePct;

        if (voter.vote === 'yes') {
          yes += voterShare;
        } else {
          no += voterShare;
        }
      });
    });

    return { yesTotal: yes, noTotal: no };
  }, [voterPowers, votingClasses, classTotals]);

  const passes = yesTotal > noTotal;
  const insight = generateInsight(votingClasses, yesTotal, noTotal, passes);

  // Check if any class has no eligible voters
  const hasEmptyClass = classTotals.some((total) => total === 0);

  return (
    <Box p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
      <Text fontSize="md" fontWeight="600" color={textColor} mb={4}>
        Example with {voters.length} Voters
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
        {/* Left: Voting Power Breakdown */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color={mutedColor} mb={3} textTransform="uppercase">
            Voting Power by Class
          </Text>

          {/* Class headers */}
          <HStack spacing={2} mb={3} flexWrap="wrap">
            {votingClasses.map((vc, idx) => {
              const isEmpty = classTotals[idx] === 0;
              return (
                <Badge
                  key={idx}
                  colorScheme={isEmpty ? 'orange' : vc.strategy === VOTING_STRATEGY.DIRECT ? 'blue' : 'purple'}
                  variant="subtle"
                  fontSize="xs"
                  opacity={isEmpty ? 0.7 : 1}
                >
                  <HStack spacing={1}>
                    <Icon
                      as={isEmpty ? PiWarning : vc.strategy === VOTING_STRATEGY.DIRECT ? PiUsers : PiChartBar}
                      boxSize={3}
                    />
                    <Text>{getClassLabel(vc, roles, idx)}</Text>
                    <Text>({vc.slicePct}%)</Text>
                    {vc.quadratic && <Icon as={PiLightning} boxSize={3} color="orange.500" />}
                  </HStack>
                </Badge>
              );
            })}
          </HStack>

          {/* Warning for empty classes */}
          {hasEmptyClass && (
            <Box mb={3} p={2} bg="orange.50" borderRadius="md" borderLeftWidth="3px" borderLeftColor="orange.400">
              <HStack spacing={2}>
                <Icon as={PiWarning} color="orange.500" boxSize={4} />
                <Text fontSize="xs" color="orange.700">
                  Some classes have no eligible voters. Edit class settings to select roles.
                </Text>
              </HStack>
            </Box>
          )}

          <VStack spacing={3} align="stretch">
            {voterPowers.map((voter, voterIdx) => (
              <Box key={voterIdx} p={3} bg={voterCardBg} borderRadius="md">
                <HStack justify="space-between" mb={2}>
                  <HStack spacing={2}>
                    <Text fontSize="lg">{voter.emoji}</Text>
                    <Text fontWeight="500" color={textColor}>
                      {voter.name}
                    </Text>
                    {voter.tokens > 0 && (
                      <Text fontSize="xs" color={mutedColor}>
                        ({voter.tokens} tokens)
                      </Text>
                    )}
                  </HStack>
                  <Badge colorScheme={voter.vote === 'yes' ? 'green' : 'red'} fontSize="xs">
                    {voter.vote.toUpperCase()}
                  </Badge>
                </HStack>

                {/* Power per class - with clear labels */}
                <HStack spacing={4} flexWrap="wrap">
                  {votingClasses.map((vc, classIdx) => {
                    const power = voter.powers[classIdx];
                    const classTotal = classTotals[classIdx];
                    const pct = classTotal > 0 ? ((power / classTotal) * 100).toFixed(0) : 0;
                    const isQuadratic = vc.quadratic;
                    const color = vc.strategy === VOTING_STRATEGY.DIRECT
                      ? 'blue'
                      : isQuadratic ? 'orange' : 'purple';

                    return (
                      <HStack key={classIdx} spacing={1} fontSize="xs">
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg={classTotal === 0 ? 'gray.300' : `${color}.400`}
                        />
                        <Text color={classTotal === 0 ? 'gray.400' : mutedColor} fontWeight="500">
                          {classTotal === 0 ? (
                            '—'
                          ) : power > 0 ? (
                            <>
                              {Number.isInteger(power) ? power : power.toFixed(1)}
                              <Text as="span" color={mutedColor} fontWeight="normal"> ({pct}%)</Text>
                            </>
                          ) : (
                            '0'
                          )}
                        </Text>
                      </HStack>
                    );
                  })}
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Right: Vote Outcome */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color={mutedColor} mb={1} textTransform="uppercase">
            Vote Totals by Class
          </Text>
          <Text fontSize="xs" color={mutedColor} mb={3}>
            How votes split within each voting class
          </Text>

          <Box p={4} bg={voterCardBg} borderRadius="md">
            {/* Vote breakdown by class */}
            <VStack spacing={4} align="stretch" mb={4}>
              {votingClasses.map((vc, classIdx) => {
                const classTotal = classTotals[classIdx];
                let classYes = 0;
                let classNo = 0;

                voterPowers.forEach((v) => {
                  if (classTotal > 0) {
                    const share = v.powers[classIdx] / classTotal;
                    if (v.vote === 'yes') classYes += share;
                    else classNo += share;
                  }
                });

                const yesPct = (classYes * 100).toFixed(0);
                const noPct = (classNo * 100).toFixed(0);
                const label = getClassLabel(vc, roles, classIdx);
                const classColor = vc.strategy === VOTING_STRATEGY.DIRECT ? 'blue' : 'purple';

                return (
                  <Box key={classIdx} p={3} bg={classBoxBg} borderRadius="md" borderLeftWidth="3px" borderLeftColor={`${classColor}.400`}>
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={2}>
                        <Badge colorScheme={classColor} variant="subtle" fontSize="xs">
                          Class {classIdx + 1}
                        </Badge>
                        <Text fontSize="sm" color={textColor} fontWeight="500">
                          {label}
                        </Text>
                      </HStack>
                      <Badge variant="outline" fontSize="xs" colorScheme="gray">
                        {vc.slicePct}% of final vote
                      </Badge>
                    </HStack>
                    {classTotal > 0 ? (
                      <>
                        <HStack spacing={0} h="10px" borderRadius="full" overflow="hidden">
                          <Box bg="green.400" w={`${yesPct}%`} h="100%" />
                          <Box bg="red.400" w={`${noPct}%`} h="100%" />
                        </HStack>
                        <HStack justify="space-between" mt={1}>
                          <Text fontSize="xs" color="green.600" fontWeight="500">
                            YES {yesPct}%
                          </Text>
                          <Text fontSize="xs" color="red.600" fontWeight="500">
                            NO {noPct}%
                          </Text>
                        </HStack>
                      </>
                    ) : (
                      <Text fontSize="xs" color="orange.500" fontStyle="italic">
                        No eligible voters - select roles in class settings
                      </Text>
                    )}
                  </Box>
                );
              })}
            </VStack>

            <Divider my={3} />

            {/* Final result */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <VStack align="start" spacing={0}>
                  <Text fontSize="xs" color={mutedColor}>
                    Weighted Total
                  </Text>
                  <HStack spacing={4}>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      YES {yesTotal.toFixed(0)}%
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      NO {noTotal.toFixed(0)}%
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              <HStack
                spacing={2}
                p={3}
                bg={passes ? 'green.50' : 'red.50'}
                borderRadius="md"
                justify="center"
              >
                <Icon
                  as={passes ? PiCheckCircle : PiXCircle}
                  color={passes ? 'green.500' : 'red.500'}
                  boxSize={6}
                />
                <Text fontWeight="600" fontSize="md" color={passes ? 'green.600' : 'red.600'}>
                  {passes ? 'Proposal Passes' : 'Proposal Fails'}
                </Text>
              </HStack>
            </Box>
          </Box>

          {/* Dynamic insight text */}
          <Text fontSize="sm" color={mutedColor} mt={4} fontStyle="italic">
            {insight}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Quadratic voting note if any class has it */}
      {votingClasses.some((vc) => vc.quadratic) && (
        <Box
          mt={4}
          p={3}
          bg="orange.50"
          borderRadius="md"
          borderLeftWidth="3px"
          borderLeftColor="orange.400"
        >
          <HStack spacing={2}>
            <Icon as={PiLightning} color="orange.500" boxSize={4} />
            <Text fontSize="sm" color="orange.700">
              <Text as="span" fontWeight="600">
                Quadratic voting active:
              </Text>{' '}
              100 tokens = 10 votes, 36 tokens = 6 votes, 16 tokens = 4 votes. This reduces the gap between large and small holders.
            </Text>
          </HStack>
        </Box>
      )}
    </Box>
  );
}

export default AdvancedVotingExample;
