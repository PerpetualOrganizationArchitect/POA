/**
 * NavigationButtons - Back/Next buttons for wizard navigation
 * Styled with warm coral color scheme
 */

import React from 'react';
import {
  Flex,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useDeployer } from '../../context/DeployerContext';

export function NavigationButtons({
  onNext,
  onBack,
  nextLabel = 'Next',
  backLabel = 'Back',
  nextDisabled = false,
  backDisabled = false,
  showBack = true,
  showNext = true,
  isLoading = false,
  isNextDisabled = false, // Alias for nextDisabled
}) {
  const { state, actions, STEPS } = useDeployer();
  const buttonSize = useBreakpointValue({ base: 'md', lg: 'lg', xl: 'lg' });

  const isFirstStep = state.currentStep === STEPS.ORGANIZATION;
  const isLastStep = state.currentStep === STEPS.REVIEW;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      actions.prevStep();
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      actions.nextStep();
    }
  };

  // Support both prop names for backwards compatibility
  const isDisabled = nextDisabled || isNextDisabled;

  return (
    <Flex
      justifyContent="space-between"
      mt={6}
      pt={4}
      borderTop="1px solid"
      borderColor="warmGray.100"
      direction={{ base: 'column', md: 'row' }}
    >
      {showBack && (
        <Button
          size={buttonSize}
          variant="outline"
          borderColor="warmGray.300"
          color="warmGray.600"
          _hover={{
            bg: 'warmGray.100',
            borderColor: 'warmGray.400',
          }}
          onClick={handleBack}
          isDisabled={backDisabled || isFirstStep}
          mb={{ base: 2, md: 0 }}
        >
          {backLabel}
        </Button>
      )}
      {!showBack && <div />}

      {showNext && (
        <Button
          size={buttonSize}
          bg="coral.500"
          color="white"
          _hover={{
            bg: 'coral.600',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          }}
          _active={{ bg: 'coral.700' }}
          _disabled={{
            bg: 'warmGray.300',
            cursor: 'not-allowed',
            _hover: { bg: 'warmGray.300', transform: 'none', boxShadow: 'none' },
          }}
          onClick={handleNext}
          isDisabled={isDisabled}
          isLoading={isLoading}
        >
          {isLastStep ? 'Deploy' : nextLabel}
        </Button>
      )}
    </Flex>
  );
}

export default NavigationButtons;
