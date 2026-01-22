/**
 * MultiClassWeightBar - Visual weight distribution bar for N voting classes
 *
 * Shows a horizontal stacked bar where each segment represents a voting class.
 * Color coding:
 * - blue.400 for DIRECT classes (role-based)
 * - amethyst.500 for ERC20_BAL classes (token-based)
 * - coral.400 for ERC20_BAL + Quadratic enabled
 */

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Icon,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { PiUsers, PiChartBar, PiSquareHalfFill, PiLock } from 'react-icons/pi';
import { VOTING_STRATEGY } from '../../context/DeployerContext';

/**
 * Get the color for a voting class based on its strategy and quadratic setting
 */
function getClassColor(votingClass) {
  if (votingClass.strategy === VOTING_STRATEGY.DIRECT) {
    return 'blue';
  }
  // ERC20_BAL with quadratic gets coral, otherwise amethyst
  return votingClass.quadratic ? 'coral' : 'amethyst';
}

/**
 * Get the icon for a voting class strategy
 */
function getClassIcon(votingClass) {
  if (votingClass.strategy === VOTING_STRATEGY.DIRECT) {
    return PiUsers;
  }
  return votingClass.quadratic ? PiSquareHalfFill : PiChartBar;
}

/**
 * Get a label for the voting class
 */
function getClassLabel(votingClass, index, roles = []) {
  if (votingClass.strategy === VOTING_STRATEGY.DIRECT) {
    // Show role names if available
    if (votingClass.hatIds?.length > 0 && roles.length > 0) {
      const roleNames = votingClass.hatIds
        .map((idx) => roles[idx]?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(', ');
      if (roleNames) {
        return roleNames + (votingClass.hatIds.length > 2 ? '...' : '');
      }
    }
    return `Direct ${index + 1}`;
  }
  return votingClass.quadratic ? 'Token (Quadratic)' : 'Token';
}

export function MultiClassWeightBar({ classes, roles = [], showLabels = true }) {
  const bgColor = useColorModeValue('warmGray.100', 'warmGray.700');
  const borderColor = useColorModeValue('warmGray.200', 'warmGray.600');

  if (!classes || classes.length === 0) {
    return null;
  }

  return (
    <Box w="100%">
      {/* Labels above bar - using absolute positioning to match segments */}
      {showLabels && (
        <Box position="relative" h="20px" mb={2}>
          {classes.map((cls, idx) => {
            const color = getClassColor(cls);
            const leftOffset = classes.slice(0, idx).reduce((sum, c) => sum + c.slicePct, 0);
            // Center the label in the middle of the segment
            const centerPosition = leftOffset + cls.slicePct / 2;

            return (
              <Box
                key={cls.id || idx}
                position="absolute"
                left={`${centerPosition}%`}
                transform="translateX(-50%)"
                whiteSpace="nowrap"
              >
                <HStack spacing={1} justify="center">
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={`${color}.400`}
                  />
                  <Text
                    fontSize="xs"
                    fontWeight="600"
                    color={`${color}.600`}
                    noOfLines={1}
                  >
                    {cls.slicePct}%
                  </Text>
                </HStack>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Stacked bar */}
      <Box
        position="relative"
        h="48px"
        borderRadius="full"
        overflow="hidden"
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
      >
        {classes.map((cls, idx) => {
          const color = getClassColor(cls);
          const ClassIcon = getClassIcon(cls);
          const label = getClassLabel(cls, idx, roles);
          const leftOffset = classes.slice(0, idx).reduce((sum, c) => sum + c.slicePct, 0);

          return (
            <Tooltip
              key={cls.id || idx}
              label={`${label}: ${cls.slicePct}%${cls.quadratic ? ' (Quadratic)' : ''}${cls.locked ? ' - Locked' : ''}`}
              hasArrow
              placement="top"
            >
              <Box
                position="absolute"
                left={`${leftOffset}%`}
                w={`${cls.slicePct}%`}
                h="100%"
                bg={`${color}.400`}
                transition="all 0.2s ease"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{
                  bg: `${color}.500`,
                }}
                cursor="default"
              >
                {/* Show icon and label if segment is wide enough */}
                {cls.slicePct >= 20 && (
                  <HStack spacing={2} color="white" px={2}>
                    <Icon as={ClassIcon} boxSize={5} opacity={0.9} />
                    {cls.slicePct >= 35 && (
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        noOfLines={1}
                        opacity={0.95}
                      >
                        {label}
                      </Text>
                    )}
                    {cls.locked && (
                      <Icon as={PiLock} boxSize={4} opacity={0.8} />
                    )}
                  </HStack>
                )}
                {/* Just show percentage if too narrow for label */}
                {cls.slicePct < 20 && cls.slicePct >= 10 && (
                  <HStack spacing={1}>
                    <Text fontSize="xs" fontWeight="bold" color="white" opacity={0.9}>
                      {cls.slicePct}
                    </Text>
                    {cls.locked && (
                      <Icon as={PiLock} boxSize={3} color="white" opacity={0.8} />
                    )}
                  </HStack>
                )}
                {/* Lock icon for very small segments */}
                {cls.slicePct < 10 && cls.locked && (
                  <Icon as={PiLock} boxSize={3} color="white" opacity={0.8} />
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Class name labels below bar - using absolute positioning */}
      {showLabels && (
        <Box position="relative" h="20px" mt={2}>
          {classes.map((cls, idx) => {
            const color = getClassColor(cls);
            const label = getClassLabel(cls, idx, roles);
            const leftOffset = classes.slice(0, idx).reduce((sum, c) => sum + c.slicePct, 0);
            const centerPosition = leftOffset + cls.slicePct / 2;

            // Only show label if segment is wide enough
            if (cls.slicePct < 15) return null;

            return (
              <Box
                key={cls.id || idx}
                position="absolute"
                left={`${centerPosition}%`}
                transform="translateX(-50%)"
                whiteSpace="nowrap"
                maxW={`${Math.max(cls.slicePct, 20)}%`}
              >
                <HStack spacing={1} justify="center">
                  <Text
                    fontSize="xs"
                    color={useColorModeValue(`${color}.700`, `${color}.300`)}
                    fontWeight="500"
                    noOfLines={1}
                  >
                    {label}
                  </Text>
                  {cls.locked && (
                    <Icon
                      as={PiLock}
                      boxSize={3}
                      color={useColorModeValue(`${color}.500`, `${color}.400`)}
                    />
                  )}
                </HStack>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/**
 * Compact version without labels - just the bar
 */
export function MultiClassWeightBarCompact({ classes }) {
  return <MultiClassWeightBar classes={classes} showLabels={false} />;
}

export default MultiClassWeightBar;
