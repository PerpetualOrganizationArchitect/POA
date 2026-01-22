/**
 * PhilosophySlider - Visual governance philosophy chooser
 *
 * A unified slider where the track shows the voting split.
 * The thumb position represents the split point.
 *
 * Slider value = democracyWeight (equal voice %)
 * - Left (value 0) = 100% contribution-weighted
 * - Right (value 100) = 100% equal voice
 */

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Flex,
  Slider,
  SliderTrack,
  SliderThumb,
  Icon,
  SimpleGrid,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { PiInfo, PiUsers, PiChartBar, PiCheckCircle, PiXCircle } from 'react-icons/pi';
import { sliderToVotingConfig } from '../../utils/philosophyMapper';

// Zone definitions with dynamic implications
const ZONE_INFO = {
  contribution: {
    label: 'Contribution-Weighted',
    color: 'coral',
    implication:
      'Active contributors drive decisions. Great for teams where those doing the work should guide direction. New or less active members still have a voice, but experienced contributors lead.',
  },
  balanced: {
    label: 'Balanced',
    color: 'blue',
    implication:
      'A middle ground where both activity and membership matter. Prevents any single group from dominating—active contributors and the broader membership must generally agree.',
  },
  equal: {
    label: 'Equal Voice',
    color: 'green',
    implication:
      'Pure democracy where every member has equal say. Best for communities prioritizing fairness over meritocracy. Ensures decisions reflect the will of the majority.',
  },
};

/**
 * Get the zone type from a slider value
 */
export function getZone(value) {
  if (value <= 30) return 'contribution';
  if (value >= 71) return 'equal';
  return 'balanced';
}

/**
 * Get zone info for a slider value
 */
export function getZoneInfo(value) {
  const zone = getZone(value);
  return ZONE_INFO[zone];
}

/**
 * VotingExampleCard - Shows voting power breakdown AND a concrete vote scenario
 */
function VotingExampleCard({ contributionWeight, democracyWeight }) {
  const aliceTokens = 100;
  const bobTokens = 50;
  const carolTokens = 25;
  const totalTokens = aliceTokens + bobTokens + carolTokens;

  // Calculate voting power for each person
  const aliceContrib = (aliceTokens / totalTokens) * contributionWeight;
  const bobContrib = (bobTokens / totalTokens) * contributionWeight;
  const carolContrib = (carolTokens / totalTokens) * contributionWeight;

  const equalShare = democracyWeight / 3;

  const alicePower = aliceContrib + equalShare;
  const bobPower = bobContrib + equalShare;
  const carolPower = carolContrib + equalShare;

  // Simulate a vote: Alice votes YES, Bob and Carol vote NO
  // This creates a meaningful scenario where the outcome changes based on slider position
  const yesVotes = alicePower;
  const noVotes = bobPower + carolPower;
  const passes = yesVotes > 50;

  const cardBg = useColorModeValue('warmGray.50', 'warmGray.800');
  const textColor = useColorModeValue('warmGray.700', 'warmGray.200');
  const mutedColor = useColorModeValue('warmGray.500', 'warmGray.400');

  return (
    <Box mt={6}>
      <Text fontSize="md" fontWeight="600" color={textColor} mb={4}>
        Example with 3 members
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
        {/* Left side: Voting Power Breakdown */}
        <Box p={5} bg={cardBg} borderRadius="lg">
          <Text fontSize="sm" fontWeight="600" color={mutedColor} mb={4} textTransform="uppercase">
            Voting Power
          </Text>
          <VStack spacing={3} align="stretch">
            {[
              { name: 'Alice', tokens: aliceTokens, power: alicePower },
              { name: 'Bob', tokens: bobTokens, power: bobPower },
              { name: 'Carol', tokens: carolTokens, power: carolPower },
            ].map((person) => (
              <HStack key={person.name} justify="space-between" fontSize="md">
                <HStack spacing={2}>
                  <Text color={textColor} fontWeight="500">
                    {person.name}
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    ({person.tokens} tokens)
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Box
                    w={`${Math.max(person.power * 1.5, 8)}px`}
                    h="10px"
                    bg="blue.400"
                    borderRadius="full"
                    transition="width 0.2s ease"
                  />
                  <Text color={textColor} fontWeight="600" minW="45px" textAlign="right">
                    {person.power.toFixed(0)}%
                  </Text>
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Right side: Concrete Vote Scenario */}
        <Box p={5} bg={cardBg} borderRadius="lg">
          <Text fontSize="sm" fontWeight="600" color={mutedColor} mb={4} textTransform="uppercase">
            Sample Vote
          </Text>
          <VStack spacing={3} align="stretch" mb={4}>
            <HStack justify="space-between" fontSize="md">
              <Text color={textColor}>Alice votes</Text>
              <Badge colorScheme="green" fontSize="sm">YES</Badge>
            </HStack>
            <HStack justify="space-between" fontSize="md">
              <Text color={textColor}>Bob votes</Text>
              <Badge colorScheme="red" fontSize="sm">NO</Badge>
            </HStack>
            <HStack justify="space-between" fontSize="md">
              <Text color={textColor}>Carol votes</Text>
              <Badge colorScheme="red" fontSize="sm">NO</Badge>
            </HStack>
          </VStack>

          <Box pt={4} borderTop="1px solid" borderColor="warmGray.200">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color={mutedColor}>
                YES: {yesVotes.toFixed(0)}%
              </Text>
              <Text fontSize="sm" color={mutedColor}>
                NO: {noVotes.toFixed(0)}%
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon
                as={passes ? PiCheckCircle : PiXCircle}
                color={passes ? 'green.500' : 'red.500'}
                boxSize={6}
              />
              <Text fontWeight="600" fontSize="md" color={passes ? 'green.600' : 'red.600'}>
                {passes ? 'Proposal passes' : 'Proposal fails'}
              </Text>
            </HStack>
          </Box>
        </Box>
      </SimpleGrid>

      <Text fontSize="sm" color={mutedColor} mt={4} fontStyle="italic">
        {passes
          ? "Alice's contribution power overrides the 2-1 majority. Active contributors can push decisions."
          : "The 2-1 majority wins despite Alice having more tokens. Equal voice gives everyone a fair say."}
      </Text>
    </Box>
  );
}

/**
 * GovernanceInfoSection - Explains how the voting system works (in its own gray box)
 */
function GovernanceInfoSection({ contributionWeight, democracyWeight }) {
  const infoBg = useColorModeValue('warmGray.50', 'warmGray.800');
  const infoBorder = useColorModeValue('warmGray.200', 'warmGray.600');
  const headingColor = useColorModeValue('warmGray.700', 'warmGray.200');
  const textColor = useColorModeValue('warmGray.600', 'warmGray.400');

  return (
    <Box mt={8} p={6} bg={infoBg} borderRadius="xl" border="1px solid" borderColor={infoBorder}>
      <HStack spacing={3} mb={4}>
        <Icon as={PiInfo} color="blue.500" boxSize={6} />
        <Text fontWeight="600" fontSize="lg" color={headingColor}>
          How Voting Works
        </Text>
      </HStack>

      <Text fontSize="md" color={textColor} mb={6}>
        Each member's voting power combines two factors. Members earn contribution tokens by
        completing tasks and contributing to the organization.
      </Text>

      <VStack align="stretch" spacing={5}>
        <HStack align="start" spacing={4}>
          <Box
            p={4}
            bg="coral.100"
            borderRadius="lg"
            color="coral.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={PiChartBar} boxSize={7} />
          </Box>
          <Box flex={1}>
            <Text fontWeight="600" fontSize="lg" color="coral.700" mb={1}>
              Contribution Weight ({contributionWeight}%)
            </Text>
            <Text fontSize="md" color={textColor}>
              Voting power based on tokens earned. Members who do more work have more say in this
              portion of the vote.
            </Text>
          </Box>
        </HStack>

        <HStack align="start" spacing={4}>
          <Box
            p={4}
            bg="green.100"
            borderRadius="lg"
            color="green.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={PiUsers} boxSize={7} />
          </Box>
          <Box flex={1}>
            <Text fontWeight="600" fontSize="lg" color="green.700" mb={1}>
              Equal Voice ({democracyWeight}%)
            </Text>
            <Text fontSize="md" color={textColor}>
              One person, one vote. Every member has equal say in this portion, regardless of tokens
              held.
            </Text>
          </Box>
        </HStack>
      </VStack>

      <VotingExampleCard contributionWeight={contributionWeight} democracyWeight={democracyWeight} />
    </Box>
  );
}

export function PhilosophySlider({ value, onChange, isDisabled = false }) {
  const zone = getZone(value);
  const info = ZONE_INFO[zone];

  // Get actual voting weights from slider value
  const votingConfig = sliderToVotingConfig(value);
  const contributionWeight = votingConfig.participationWeight;
  const democracyWeight = votingConfig.democracyWeight;

  const labelColor = useColorModeValue('warmGray.600', 'warmGray.400');
  const activeLabelColor = useColorModeValue('warmGray.800', 'warmGray.100');

  // Slider value = democracyWeight = position from left
  const thumbPosition = value;

  return (
    <Box w="100%">
      {/* Main Heading */}
      <Text fontSize="xl" fontWeight="600" color={useColorModeValue('warmGray.800', 'warmGray.100')} mb={4}>
        Customize Voting System
      </Text>

      {/* Dynamic "What This Means" Card - Above slider */}
      <Box
        p={4}
        mb={6}
        bg={useColorModeValue('white', 'warmGray.800')}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={useColorModeValue(`${info.color}.200`, `${info.color}.700`)}
        borderLeftWidth="4px"
        borderLeftColor={`${info.color}.400`}
      >
        <Text fontSize="lg" fontWeight="600" color={`${info.color}.600`} mb={2}>
          {info.label}
        </Text>
        <Text fontSize="sm" color={labelColor}>
          {info.implication}
        </Text>
      </Box>

      {/* Unified Split Slider */}
      <Box mb={6}>
        {/* Percentage labels */}
        <Flex justify="space-between" mb={2}>
          <HStack spacing={2}>
            <Box w="12px" h="12px" borderRadius="full" bg="green.400" />
            <Text fontSize="sm" fontWeight="600" color="green.600">
              {democracyWeight}% Equal Voice
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="600" color="coral.600">
              {contributionWeight}% Contribution
            </Text>
            <Box w="12px" h="12px" borderRadius="full" bg="coral.400" />
          </HStack>
        </Flex>

        {/* Slider with split track visualization */}
        <Box position="relative" h="40px">
          {/* Background track showing the split */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="100%"
            borderRadius="full"
            overflow="hidden"
            pointerEvents="none"
          >
            {/* Green (Equal Voice) - fills from LEFT to thumb */}
            <Box
              position="absolute"
              left={0}
              top={0}
              h="100%"
              w={`${thumbPosition}%`}
              bg="green.400"
              transition="width 0.1s ease-out"
              display="flex"
              alignItems="center"
              pl={3}
            >
              {thumbPosition >= 25 && (
                <Icon as={PiUsers} color="white" boxSize={4} opacity={0.9} />
              )}
            </Box>

            {/* Coral (Contribution) - fills from thumb to RIGHT */}
            <Box
              position="absolute"
              right={0}
              top={0}
              h="100%"
              w={`${100 - thumbPosition}%`}
              bg="coral.400"
              transition="width 0.1s ease-out"
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              pr={3}
            >
              {100 - thumbPosition >= 25 && (
                <Icon as={PiChartBar} color="white" boxSize={4} opacity={0.9} />
              )}
            </Box>
          </Box>

          {/* Chakra Slider for interaction */}
          <Slider
            value={value}
            onChange={onChange}
            min={0}
            max={100}
            step={5}
            isDisabled={isDisabled}
            focusThumbOnChange={false}
            h="100%"
          >
            <SliderTrack h="40px" bg="transparent" borderRadius="full" />

            <SliderThumb
              boxSize={7}
              bg="white"
              borderWidth="3px"
              borderColor="warmGray.400"
              boxShadow="0 2px 10px rgba(0,0,0,0.3)"
              _focus={{
                boxShadow: '0 2px 10px rgba(0,0,0,0.3), 0 0 0 3px rgba(66, 153, 225, 0.4)',
              }}
              _active={{ transform: 'scale(1.15)', borderColor: 'warmGray.500' }}
              top="50%"
              transform="translateY(-50%)"
            />
          </Slider>
        </Box>

        {/* Zone labels below slider */}
        <Flex justify="space-between" mt={3} px={1}>
          <Text
            fontSize="xs"
            color={zone === 'contribution' ? activeLabelColor : labelColor}
            fontWeight={zone === 'contribution' ? '600' : '400'}
          >
            Meritocratic
          </Text>
          <Text
            fontSize="xs"
            color={zone === 'balanced' ? activeLabelColor : labelColor}
            fontWeight={zone === 'balanced' ? '600' : '400'}
          >
            Balanced
          </Text>
          <Text
            fontSize="xs"
            color={zone === 'equal' ? activeLabelColor : labelColor}
            fontWeight={zone === 'equal' ? '600' : '400'}
          >
            Democratic
          </Text>
        </Flex>
      </Box>

      {/* How Voting Works Section */}
      <GovernanceInfoSection
        contributionWeight={contributionWeight}
        democracyWeight={democracyWeight}
      />
    </Box>
  );
}

export default PhilosophySlider;
