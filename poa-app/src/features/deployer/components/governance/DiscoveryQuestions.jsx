/**
 * DiscoveryQuestions - Step-by-step discovery flow for templates
 *
 * Shows discovery questions one at a time with explanations of why each
 * question matters and the impact of each choice. Calculates and displays
 * the best matching variation based on answers.
 */

import React, { useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  RadioGroup,
  Radio,
  Progress,
  Card,
  CardBody,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  useColorModeValue,
  Fade,
  ScaleFade,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@chakra-ui/icons';
import { useDeployer } from '../../context/DeployerContext';
import { findBestVariation } from '../../templates/variations/variationMatcher';

/**
 * Single question card with explanation and options
 */
function QuestionCard({ question, answer, onAnswer, isActive }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const helperColor = useColorModeValue('gray.600', 'gray.400');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.500', 'blue.400');

  if (!question) return null;

  return (
    <ScaleFade in={isActive} initialScale={0.95}>
      <Card
        bg={cardBg}
        borderWidth="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <CardBody>
          <VStack spacing={5} align="stretch">
            {/* Question */}
            <Box>
              <Heading size="md" mb={2}>
                {question.question}
              </Heading>
              <Text color={helperColor} fontSize="sm">
                {question.why}
              </Text>
            </Box>

            {/* Options */}
            <RadioGroup value={answer || ''} onChange={onAnswer}>
              <VStack spacing={3} align="stretch">
                {question.options.map((option) => (
                  <Box
                    key={option.value}
                    p={4}
                    borderWidth="2px"
                    borderRadius="lg"
                    borderColor={answer === option.value ? selectedBorder : borderColor}
                    bg={answer === option.value ? selectedBg : 'transparent'}
                    cursor="pointer"
                    onClick={() => onAnswer(option.value)}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: answer === option.value ? selectedBorder : 'gray.300',
                      bg: answer === option.value ? selectedBg : 'gray.50',
                    }}
                  >
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          {option.emoji && (
                            <Text fontSize="lg">{option.emoji}</Text>
                          )}
                          <Text fontWeight="medium">{option.label}</Text>
                        </HStack>
                        <Text fontSize="sm" color={helperColor}>
                          {option.impact}
                        </Text>
                      </VStack>
                      <Radio
                        value={option.value}
                        size="lg"
                        colorScheme="blue"
                        isChecked={answer === option.value}
                      />
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </RadioGroup>
          </VStack>
        </CardBody>
      </Card>
    </ScaleFade>
  );
}

/**
 * Variation result card showing the matched variation
 */
function VariationResultCard({ variation, variationKey, template, onConfirm, onCustomize }) {
  const cardBg = useColorModeValue('green.50', 'green.900');
  const borderColor = useColorModeValue('green.500', 'green.400');
  const helperColor = useColorModeValue('gray.600', 'gray.400');

  if (!variation) return null;

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <Card bg={cardBg} borderWidth="2px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack>
              <CheckIcon color="green.500" />
              <Heading size="md">
                Recommended: {variation.name || variationKey}
              </Heading>
            </HStack>

            <Text color={helperColor}>
              {variation.reasoning}
            </Text>

            {/* Settings Summary */}
            <HStack spacing={4} flexWrap="wrap">
              {variation.settings?.democracyWeight !== undefined && (
                <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                  {variation.settings.democracyWeight}% Democracy
                </Badge>
              )}
              {variation.settings?.participationWeight !== undefined && (
                <Badge colorScheme="orange" fontSize="sm" px={2} py={1}>
                  {variation.settings.participationWeight}% Participation
                </Badge>
              )}
              {variation.settings?.quorum !== undefined && (
                <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                  {variation.settings.quorum}% Quorum
                </Badge>
              )}
            </HStack>

            <HStack spacing={3} pt={2}>
              <Button colorScheme="green" onClick={onConfirm}>
                Use These Settings
              </Button>
              <Button variant="outline" onClick={onCustomize}>
                Customize Further
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </ScaleFade>
  );
}

/**
 * Self-assessment warning for custom template
 */
function SelfAssessmentWarning({ riskLevel, feedback }) {
  const severity = riskLevel === 'high' ? 'warning'
    : riskLevel === 'medium' ? 'info'
    : 'success';

  return (
    <Alert status={severity} borderRadius="md" mt={4}>
      <AlertIcon />
      <Box>
        <AlertTitle>
          {riskLevel === 'high' ? 'Consider Carefully' :
           riskLevel === 'medium' ? 'Good to Know' : 'Looking Good'}
        </AlertTitle>
        <AlertDescription>{feedback}</AlertDescription>
      </Box>
    </Alert>
  );
}

/**
 * Main DiscoveryQuestions component
 */
export function DiscoveryQuestions({ template, onComplete, onSkip }) {
  const { state, actions, selectors } = useDeployer();

  const cardBg = useColorModeValue('white', 'gray.800');
  const helperColor = useColorModeValue('gray.600', 'gray.400');

  const { discoveryAnswers, currentQuestionIndex, matchedVariation } = state.templateJourney;

  // Get questions based on template type
  const questions = useMemo(() => {
    // For custom template, show self-assessment first
    if (template?.id === 'custom' && template.selfAssessment) {
      const assessmentDone = template.selfAssessment.every(
        (q) => state.templateJourney.selfAssessmentAnswers[q.id]
      );
      if (!assessmentDone) {
        return template.selfAssessment;
      }
    }
    return template?.discoveryQuestions || [];
  }, [template, state.templateJourney.selfAssessmentAnswers]);

  const isCustomAssessment = template?.id === 'custom' &&
    template.selfAssessment &&
    !template.selfAssessment.every(
      (q) => state.templateJourney.selfAssessmentAnswers[q.id]
    );

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // Calculate current answer
  const currentAnswer = isCustomAssessment
    ? state.templateJourney.selfAssessmentAnswers[currentQuestion?.id]
    : discoveryAnswers[currentQuestion?.id];

  // Find best variation when answers change
  useEffect(() => {
    if (!isCustomAssessment && template?.variations) {
      const { variationKey, variation } = findBestVariation(template, discoveryAnswers);
      if (variationKey !== matchedVariation) {
        actions.setMatchedVariation(variationKey);
      }
    }
  }, [discoveryAnswers, template, isCustomAssessment, matchedVariation, actions]);

  // Handle answer selection
  const handleAnswer = (value) => {
    if (isCustomAssessment) {
      actions.setSelfAssessmentAnswer(currentQuestion.id, value);
    } else {
      actions.setDiscoveryAnswer(currentQuestion.id, value);
    }
  };

  // Handle next question
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      actions.nextDiscoveryQuestion();
    }
  };

  // Handle previous question
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      actions.prevDiscoveryQuestion();
    }
  };

  // Handle confirm variation
  const handleConfirm = () => {
    const variation = template?.variations?.[matchedVariation];
    if (variation) {
      actions.applyVariation(variation, template);
    }
    onComplete?.();
  };

  // Handle customize (skip to next step without applying variation)
  const handleCustomize = () => {
    onComplete?.();
  };

  // Get self-assessment feedback
  const getSelfAssessmentFeedback = () => {
    if (!isCustomAssessment || !currentQuestion || !currentAnswer) return null;
    const option = currentQuestion.options.find((o) => o.value === currentAnswer);
    return option ? { riskLevel: option.riskLevel, feedback: option.feedback } : null;
  };

  const assessmentFeedback = getSelfAssessmentFeedback();

  // Check if all questions answered
  const allAnswered = questions.every((q) =>
    isCustomAssessment
      ? state.templateJourney.selfAssessmentAnswers[q.id]
      : discoveryAnswers[q.id]
  );

  // Get matched variation details
  const matchedVariationData = template?.variations?.[matchedVariation];

  // If no questions, show message and skip button
  if (!questions || questions.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color={helperColor} mb={4}>
          No discovery questions for this template. Continue to customize your settings.
        </Text>
        <Button colorScheme="blue" onClick={onSkip}>
          Continue
        </Button>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Progress */}
      <Box>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="medium">
            {isCustomAssessment ? 'Self-Assessment' : 'Tell Us About Your Organization'}
          </Text>
          <Text fontSize="sm" color={helperColor}>
            {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </HStack>
        <Progress
          value={progress}
          size="sm"
          colorScheme="blue"
          borderRadius="full"
        />
      </Box>

      {/* Current Question */}
      <QuestionCard
        question={currentQuestion}
        answer={currentAnswer}
        onAnswer={handleAnswer}
        isActive={true}
      />

      {/* Self-Assessment Feedback */}
      {assessmentFeedback && (
        <SelfAssessmentWarning
          riskLevel={assessmentFeedback.riskLevel}
          feedback={assessmentFeedback.feedback}
        />
      )}

      {/* Navigation */}
      <HStack justify="space-between">
        <Button
          leftIcon={<ChevronLeftIcon />}
          onClick={handlePrev}
          isDisabled={currentQuestionIndex === 0}
          variant="ghost"
        >
          Previous
        </Button>

        <HStack>
          <Button variant="ghost" onClick={onSkip}>
            Skip Discovery
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              rightIcon={<ChevronRightIcon />}
              onClick={handleNext}
              colorScheme="blue"
              isDisabled={!currentAnswer}
            >
              Next
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              onClick={() => {
                // If custom assessment, reset to show discovery questions
                if (isCustomAssessment) {
                  actions.setCurrentQuestionIndex(0);
                }
              }}
              isDisabled={!currentAnswer}
            >
              {isCustomAssessment ? 'Continue to Discovery' : 'See Recommendation'}
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Variation Result (show after all questions answered for non-custom) */}
      {allAnswered && !isCustomAssessment && matchedVariationData && (
        <VariationResultCard
          variation={matchedVariationData}
          variationKey={matchedVariation}
          template={template}
          onConfirm={handleConfirm}
          onCustomize={handleCustomize}
        />
      )}
    </VStack>
  );
}

export default DiscoveryQuestions;
