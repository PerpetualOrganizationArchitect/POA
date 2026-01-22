/**
 * GrowthPathVisualizer - Shows how governance evolves over time
 *
 * Displays growth stages, milestones, and evolution principles from
 * the template. Helps users understand that governance is a journey,
 * not a destination.
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  List,
  ListItem,
  ListIcon,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Collapse,
  Button,
  Divider,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ArrowForwardIcon,
  InfoIcon,
  WarningIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@chakra-ui/icons';

/**
 * Single growth stage card
 */
function GrowthStageCard({ stage, index, isActive, totalStages }) {
  const [isExpanded, setIsExpanded] = useState(isActive);

  const cardBg = useColorModeValue('white', 'gray.800');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const activeBorderColor = useColorModeValue('blue.500', 'blue.400');
  const helperColor = useColorModeValue('gray.600', 'gray.400');
  const milestoneBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Card
      bg={isActive ? activeBg : cardBg}
      borderWidth="2px"
      borderColor={isActive ? activeBorderColor : borderColor}
      mb={4}
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="flex-start">
            <Box>
              <HStack spacing={2} mb={1}>
                <Badge
                  colorScheme={isActive ? 'blue' : 'gray'}
                  fontSize="xs"
                >
                  Stage {index + 1}
                </Badge>
                <Text fontWeight="bold" fontSize="lg">
                  {stage.name}
                </Text>
              </HStack>
              <Text color={helperColor} fontSize="sm">
                {stage.timeframe}
              </Text>
            </Box>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </HStack>

          {/* Description */}
          <Text color={helperColor}>
            {stage.description}
          </Text>

          {/* Recommended Settings */}
          {stage.recommendedSettings && (
            <HStack spacing={3} flexWrap="wrap">
              {stage.recommendedSettings.democracyWeight !== undefined && (
                <Badge colorScheme="blue" fontSize="xs" px={2} py={1}>
                  {stage.recommendedSettings.democracyWeight}% Democracy
                </Badge>
              )}
              {stage.recommendedSettings.participationWeight !== undefined && (
                <Badge colorScheme="orange" fontSize="xs" px={2} py={1}>
                  {stage.recommendedSettings.participationWeight}% Participation
                </Badge>
              )}
            </HStack>
          )}

          {/* Expanded Content */}
          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={4} align="stretch" pt={2}>
              {/* Milestones */}
              {stage.milestones && stage.milestones.length > 0 && (
                <Box bg={milestoneBg} p={4} borderRadius="md">
                  <Text fontWeight="medium" mb={2}>
                    Milestones to Achieve
                  </Text>
                  <List spacing={2}>
                    {stage.milestones.map((milestone, i) => (
                      <ListItem key={i} display="flex" alignItems="flex-start">
                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                        <Text fontSize="sm">{milestone}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Next Stage Signals */}
              {stage.nextStageSignals && stage.nextStageSignals.length > 0 && (
                <Box>
                  <Text fontWeight="medium" mb={2} color={helperColor}>
                    Signs You're Ready to Evolve
                  </Text>
                  <List spacing={2}>
                    {stage.nextStageSignals.map((signal, i) => (
                      <ListItem key={i} display="flex" alignItems="flex-start">
                        <ListIcon as={ArrowForwardIcon} color="blue.500" mt={1} />
                        <Text fontSize="sm">{signal}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
}

/**
 * Evolution principles section
 */
function EvolutionPrinciples({ principles }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const helperColor = useColorModeValue('gray.600', 'gray.400');

  if (!principles || principles.length === 0) return null;

  return (
    <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="sm">Evolution Principles</Heading>
          <Text fontSize="sm" color={helperColor}>
            These principles guide how your governance should evolve over time.
          </Text>
          <VStack spacing={4} align="stretch">
            {principles.map((principle, i) => (
              <Box key={i}>
                <HStack spacing={2} mb={1}>
                  <InfoIcon color="blue.500" />
                  <Text fontWeight="medium">{principle.principle}</Text>
                </HStack>
                <Text fontSize="sm" color={helperColor} pl={6}>
                  {principle.explanation}
                </Text>
              </Box>
            ))}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

/**
 * Pitfall warning card
 */
function PitfallCard({ pitfall }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityColors = {
    high: 'red',
    medium: 'orange',
    low: 'yellow',
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const helperColor = useColorModeValue('gray.600', 'gray.400');
  const warningBg = useColorModeValue(`${severityColors[pitfall.severity]}.50`, `${severityColors[pitfall.severity]}.900`);

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderLeftWidth="4px"
      borderLeftColor={`${severityColors[pitfall.severity]}.500`}
    >
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={2}>
              <WarningIcon color={`${severityColors[pitfall.severity]}.500`} />
              <Text fontWeight="bold">{pitfall.name}</Text>
              <Badge colorScheme={severityColors[pitfall.severity]} size="sm">
                {pitfall.severity}
              </Badge>
            </HStack>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </HStack>

          <Text fontSize="sm" color={helperColor}>
            {pitfall.description}
          </Text>

          <Collapse in={isExpanded} animateOpacity>
            <VStack spacing={4} align="stretch" pt={2}>
              {/* Symptoms */}
              {pitfall.symptoms && pitfall.symptoms.length > 0 && (
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb={2}>
                    Warning Signs
                  </Text>
                  <List spacing={1}>
                    {pitfall.symptoms.map((symptom, i) => (
                      <ListItem key={i} fontSize="sm" color={helperColor}>
                        • {symptom}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* Prevention */}
              {pitfall.prevention && (
                <Box bg={warningBg} p={3} borderRadius="md">
                  <Text fontWeight="medium" fontSize="sm" mb={1}>
                    Prevention
                  </Text>
                  <Text fontSize="sm">{pitfall.prevention}</Text>
                </Box>
              )}

              {/* Recovery */}
              {pitfall.recovery && (
                <Box>
                  <Text fontWeight="medium" fontSize="sm" mb={1}>
                    Recovery
                  </Text>
                  <Text fontSize="sm" color={helperColor}>
                    {pitfall.recovery}
                  </Text>
                </Box>
              )}
            </VStack>
          </Collapse>
        </VStack>
      </CardBody>
    </Card>
  );
}

/**
 * Main GrowthPathVisualizer component
 */
export function GrowthPathVisualizer({ template }) {
  const helperColor = useColorModeValue('gray.600', 'gray.400');

  const growthPath = template?.growthPath;
  const pitfalls = template?.pitfalls;

  if (!growthPath?.stages) {
    return (
      <Box textAlign="center" py={6}>
        <Text color={helperColor}>
          No growth path available for this template.
        </Text>
      </Box>
    );
  }

  const stages = growthPath.stages;

  return (
    <Tabs variant="soft-rounded" colorScheme="blue">
      <TabList mb={4}>
        <Tab>Growth Path</Tab>
        {pitfalls && pitfalls.length > 0 && (
          <Tab>Common Pitfalls ({pitfalls.length})</Tab>
        )}
        {growthPath.evolutionPrinciples && (
          <Tab>Principles</Tab>
        )}
      </TabList>

      <TabPanels>
        {/* Growth Stages */}
        <TabPanel px={0}>
          <VStack spacing={4} align="stretch">
            <Text color={helperColor}>
              Governance is a journey. Here's how your organization should evolve over time.
            </Text>

            {/* Timeline Stepper */}
            <Stepper
              index={0}
              orientation="vertical"
              gap="0"
              colorScheme="blue"
            >
              {stages.map((stage, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>

                  <Box flexShrink="0" w="100%" ml={4} mb={4}>
                    <GrowthStageCard
                      stage={stage}
                      index={index}
                      isActive={index === 0}
                      totalStages={stages.length}
                    />
                  </Box>

                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </VStack>
        </TabPanel>

        {/* Pitfalls */}
        {pitfalls && pitfalls.length > 0 && (
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              <Text color={helperColor}>
                These are common challenges that organizations like yours face.
                Being aware of them helps you avoid or recover from them.
              </Text>
              {pitfalls.map((pitfall, index) => (
                <PitfallCard key={index} pitfall={pitfall} />
              ))}
            </VStack>
          </TabPanel>
        )}

        {/* Principles */}
        {growthPath.evolutionPrinciples && (
          <TabPanel px={0}>
            <EvolutionPrinciples principles={growthPath.evolutionPrinciples} />
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
}

export default GrowthPathVisualizer;
