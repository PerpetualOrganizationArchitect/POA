/**
 * WeightPresets - Quick preset buttons for weight distribution
 *
 * Provides two preset options:
 * - Equal Split: Divides 100% evenly among all classes
 * - Dominant: First class gets 60%, rest split the 40% equally
 */

import React from 'react';
import {
  HStack,
  Button,
  Tooltip,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { PiEquals, PiChartPieSlice } from 'react-icons/pi';

export function WeightPresets({ onApplyPreset, classCount, isDisabled = false }) {
  const buttonBg = useColorModeValue('gray.100', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.200', 'gray.600');

  if (classCount < 2) {
    return null; // No presets needed for single class
  }

  return (
    <HStack spacing={2}>
      <Text fontSize="xs" color="gray.500" fontWeight="medium">
        Quick presets:
      </Text>
      <Tooltip
        label={`Divide equally: ${Math.floor(100 / classCount)}% each (remaining distributed to first classes)`}
        placement="top"
      >
        <Button
          size="xs"
          leftIcon={<Icon as={PiEquals} />}
          variant="outline"
          bg={buttonBg}
          _hover={{ bg: buttonHoverBg }}
          onClick={() => onApplyPreset('equal')}
          isDisabled={isDisabled}
        >
          Equal Split
        </Button>
      </Tooltip>
      <Tooltip
        label={`First class gets 60%, remaining ${classCount - 1} classes split 40% equally (${Math.floor(40 / (classCount - 1))}% each)`}
        placement="top"
      >
        <Button
          size="xs"
          leftIcon={<Icon as={PiChartPieSlice} />}
          variant="outline"
          bg={buttonBg}
          _hover={{ bg: buttonHoverBg }}
          onClick={() => onApplyPreset('dominant')}
          isDisabled={isDisabled}
        >
          Dominant (60/rest)
        </Button>
      </Tooltip>
    </HStack>
  );
}

export default WeightPresets;
