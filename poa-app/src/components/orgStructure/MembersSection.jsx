/**
 * MembersSection - Expandable accordion sections showing members per role
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Collapse,
  Spinner,
  Skeleton,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  FiChevronDown,
  FiChevronRight,
  FiUsers,
  FiUser,
  FiActivity,
  FiCalendar,
  FiCheckSquare,
  FiThumbsUp,
} from 'react-icons/fi';

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
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Truncate address for display
 */
function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Single member card
 */
function MemberCard({ member }) {
  const {
    username,
    address,
    participationTokenBalance,
    totalTasksCompleted,
    totalVotes,
    firstSeenAt,
    membershipStatus,
  } = member;

  const displayName = username || truncateAddress(address);
  const isActive = membershipStatus === 'Active';

  return (
    <Box
      position="relative"
      borderRadius="lg"
      p={4}
      overflow="hidden"
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        '& > div:first-of-type': {
          borderColor: 'rgba(148, 115, 220, 0.4)',
        },
      }}
    >
      <Box
        position="absolute"
        inset={0}
        borderRadius="inherit"
        bg="rgba(40, 40, 50, 0.5)"
        border="1px solid rgba(148, 115, 220, 0.15)"
        transition="border-color 0.2s"
        zIndex={-1}
      />

      <VStack align="stretch" spacing={3}>
        {/* Name and status */}
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Icon as={FiUser} color="purple.300" />
            <Text fontWeight="medium" color="white">
              {displayName}
            </Text>
          </HStack>
          <Badge
            colorScheme={isActive ? 'green' : 'gray'}
            size="sm"
            borderRadius="full"
            px={2}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </HStack>

        {/* Stats grid */}
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem>
            <HStack spacing={1} color="gray.400" fontSize="xs">
              <Icon as={FiActivity} />
              <Text>{participationTokenBalance} tokens</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <HStack spacing={1} color="gray.400" fontSize="xs">
              <Icon as={FiCheckSquare} />
              <Text>{totalTasksCompleted} tasks</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <HStack spacing={1} color="gray.400" fontSize="xs">
              <Icon as={FiThumbsUp} />
              <Text>{totalVotes} votes</Text>
            </HStack>
          </GridItem>
          <GridItem>
            <HStack spacing={1} color="gray.400" fontSize="xs">
              <Icon as={FiCalendar} />
              <Text>Joined {formatDate(firstSeenAt)}</Text>
            </HStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
}

/**
 * Expandable role accordion item
 */
function RoleAccordionItem({ role, members = [], defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = useCallback(() => {
    if (!isExpanded && members.length > 0) {
      // Simulate loading for lazy-load effect
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded, members.length]);

  return (
    <Box
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      mb={3}
    >
      <Box
        position="absolute"
        inset={0}
        borderRadius="inherit"
        bg="rgba(30, 30, 40, 0.6)"
        border="1px solid rgba(148, 115, 220, 0.15)"
        zIndex={-1}
      />

      {/* Header - clickable */}
      <Box
        as="button"
        width="100%"
        onClick={handleToggle}
        p={4}
        textAlign="left"
        _hover={{
          bg: 'rgba(148, 115, 220, 0.05)',
        }}
        transition="background-color 0.2s"
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon
              as={isExpanded ? FiChevronDown : FiChevronRight}
              color="purple.300"
              transition="transform 0.2s"
            />
            <Text fontWeight="semibold" color="white">
              {role.name}
            </Text>
            <Badge
              colorScheme="purple"
              borderRadius="full"
              px={2}
              display="flex"
              alignItems="center"
              gap={1}
            >
              <Icon as={FiUsers} boxSize={3} />
              {members.length}
            </Badge>
          </HStack>
        </HStack>
      </Box>

      {/* Expandable content */}
      <Collapse in={isExpanded} animateOpacity>
        <Box px={4} pb={4}>
          {isLoading ? (
            <HStack justify="center" py={4}>
              <Spinner size="sm" color="purple.300" />
              <Text color="gray.400" fontSize="sm">Loading members...</Text>
            </HStack>
          ) : members.length === 0 ? (
            <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
              No members with this role
            </Text>
          ) : (
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
              }}
              gap={3}
            >
              {members.map((member) => (
                <MemberCard key={member.id || member.address} member={member} />
              ))}
            </Grid>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export function MembersSection({
  roles = [],
  membersByRole = {},
  loading = false,
}) {
  if (loading) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
      >
        <Box style={glassLayerStyle} />
        <VStack spacing={3} align="stretch">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="60px" borderRadius="xl" />
          ))}
        </VStack>
      </Box>
    );
  }

  if (roles.length === 0) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        overflow="hidden"
        textAlign="center"
      >
        <Box style={glassLayerStyle} />
        <Text color="gray.400">No roles defined</Text>
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

      <VStack spacing={0} align="stretch">
        {roles.map((role, index) => (
          <RoleAccordionItem
            key={role.id || role.hatId}
            role={role}
            members={membersByRole[role.hatId] || []}
            defaultExpanded={index === 0}
          />
        ))}
      </VStack>
    </Box>
  );
}

export default MembersSection;
