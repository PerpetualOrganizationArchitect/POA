/**
 * StepHeader - Clean, minimal step title and description
 * Progress is shown in the main wizard indicator, so we don't duplicate it here.
 */

import React from 'react';
import {
  Box,
  Heading,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useDeployer } from '../../context/DeployerContext';

export function StepHeader({ title, description }) {
  const { state, STEP_NAMES } = useDeployer();

  const headerFontSize = useBreakpointValue({ base: 'xl', lg: '2xl' });

  const stepTitle = title || STEP_NAMES[state.currentStep];

  return (
    <Box mb={6}>
      <Heading
        fontSize={headerFontSize}
        fontWeight="600"
        mb={2}
        color="warmGray.800"
        lineHeight="tight"
      >
        {stepTitle}
      </Heading>
      {description && (
        <Text
          fontSize={{ base: 'sm', lg: 'md' }}
          color="warmGray.500"
          lineHeight="tall"
          maxW="600px"
        >
          {description}
        </Text>
      )}
    </Box>
  );
}

export default StepHeader;
