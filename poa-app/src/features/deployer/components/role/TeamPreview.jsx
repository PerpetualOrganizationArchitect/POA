/**
 * TeamPreview - Sticky sidebar showing team structure with hierarchy tree
 * Displays roles, their relationships, and which are assigned to the deployer
 */

import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { PiUser, PiUsers, PiCrown } from 'react-icons/pi';

/**
 * Individual node in the hierarchy tree
 */
function PreviewNode({ role, roleIndex, depth, isLast, parentLines = [], isYou }) {
  const isTopLevel = depth === 0;
  const lineColor = 'warmGray.200';

  return (
    <HStack align="start" spacing={0} mb={1}>
      {/* Tree connector lines */}
      <Box display="flex" alignItems="stretch" minH="32px">
        {parentLines.map((showLine, idx) => (
          <Box
            key={idx}
            w="20px"
            borderLeftWidth={showLine ? '1px' : '0'}
            borderColor={lineColor}
          />
        ))}
        {!isTopLevel && (
          <Box position="relative" w="20px">
            {/* Vertical line */}
            <Box
              position="absolute"
              left="0"
              top="0"
              bottom={isLast ? '50%' : '0'}
              borderLeftWidth="1px"
              borderColor={lineColor}
            />
            {/* Horizontal connector */}
            <Box
              position="absolute"
              left="0"
              top="50%"
              w="16px"
              borderTopWidth="1px"
              borderColor={lineColor}
            />
          </Box>
        )}
      </Box>

      {/* Node content */}
      <HStack
        flex={1}
        py={1.5}
        px={2}
        ml={isTopLevel ? 0 : 1}
        bg={isYou ? 'green.50' : 'warmGray.50'}
        borderRadius="md"
        border="1px solid"
        borderColor={isYou ? 'green.200' : 'warmGray.100'}
        spacing={2}
      >
        <Icon
          as={isTopLevel ? PiCrown : PiUser}
          boxSize={3}
          color={isTopLevel ? 'coral.500' : 'warmGray.400'}
        />
        <Text fontSize="sm" fontWeight={isTopLevel ? '600' : '500'} color="warmGray.700" noOfLines={1}>
          {role.name}
        </Text>
        {isYou && (
          <Badge
            fontSize="9px"
            bg="green.100"
            color="green.700"
            px={1.5}
            borderRadius="full"
          >
            You
          </Badge>
        )}
        {isTopLevel && !isYou && (
          <Badge
            fontSize="9px"
            bg="coral.50"
            color="coral.600"
            px={1.5}
            borderRadius="full"
          >
            Leader
          </Badge>
        )}
      </HStack>
    </HStack>
  );
}

export function TeamPreview({ roles = [] }) {
  const showPreview = useBreakpointValue({ base: false, lg: true });

  // Build hierarchy tree structure
  const { childrenByParent, renderOrder } = useMemo(() => {
    const childrenMap = new Map();

    // Group roles by parent
    roles.forEach((role, idx) => {
      const parentIdx = role.hierarchy?.adminRoleIndex;
      const key = parentIdx === null || parentIdx === undefined ? 'root' : parentIdx;
      if (!childrenMap.has(key)) {
        childrenMap.set(key, []);
      }
      childrenMap.get(key).push(idx);
    });

    return { childrenByParent: childrenMap, renderOrder: childrenMap.get('root') || [] };
  }, [roles]);

  // Count roles assigned to deployer
  const assignedCount = useMemo(() => {
    return roles.filter(role => role.distribution?.mintToDeployer).length;
  }, [roles]);

  // Recursive render function
  const renderNode = (roleIndex, depth, parentLines) => {
    const role = roles[roleIndex];
    if (!role) return null;

    const children = childrenByParent.get(roleIndex) || [];
    const parentIdx = role.hierarchy?.adminRoleIndex;
    const siblings = childrenByParent.get(
      parentIdx === null || parentIdx === undefined ? 'root' : parentIdx
    ) || [];
    const isLast = siblings[siblings.length - 1] === roleIndex;
    const isYou = role.distribution?.mintToDeployer === true;

    return (
      <Box key={roleIndex}>
        <PreviewNode
          role={role}
          roleIndex={roleIndex}
          depth={depth}
          isLast={isLast}
          parentLines={parentLines}
          isYou={isYou}
        />
        {children.length > 0 && (
          <Box>
            {children.map((childIdx) =>
              renderNode(childIdx, depth + 1, [...parentLines, !isLast])
            )}
          </Box>
        )}
      </Box>
    );
  };

  if (!showPreview) {
    return null;
  }

  return (
    <Box
      position="sticky"
      top="100px"
      bg="white"
      borderRadius="2xl"
      p={6}
      boxShadow="0 2px 12px rgba(0, 0, 0, 0.04)"
      border="1px solid"
      borderColor="warmGray.100"
    >
      {/* Header */}
      <Text
        fontSize="xs"
        color="coral.500"
        textTransform="uppercase"
        fontWeight="600"
        letterSpacing="wider"
        mb={4}
      >
        Team Structure
      </Text>

      {/* Tree visualization or empty state */}
      {roles.length === 0 ? (
        <VStack py={6} spacing={3}>
          <Icon as={PiUsers} boxSize={8} color="warmGray.300" />
          <Text fontSize="sm" color="warmGray.400" textAlign="center">
            Add roles to see your team structure
          </Text>
        </VStack>
      ) : (
        <VStack align="stretch" spacing={0}>
          {renderOrder.map((roleIndex) => renderNode(roleIndex, 0, []))}
        </VStack>
      )}

      {/* Summary badges */}
      {roles.length > 0 && (
        <HStack
          mt={4}
          pt={4}
          borderTop="1px solid"
          borderColor="warmGray.100"
          spacing={2}
          flexWrap="wrap"
        >
          <Badge
            bg="coral.50"
            color="coral.600"
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="500"
          >
            {roles.length} {roles.length === 1 ? 'role' : 'roles'}
          </Badge>
          {assignedCount > 0 && (
            <Badge
              bg="green.50"
              color="green.600"
              px={2}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="500"
            >
              {assignedCount} assigned to you
            </Badge>
          )}
        </HStack>
      )}
    </Box>
  );
}

export default TeamPreview;
