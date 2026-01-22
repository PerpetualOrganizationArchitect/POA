/**
 * DeveloperInfoSection - Hidden expandable section showing contract addresses
 */

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  IconButton,
  Collapse,
  useClipboard,
  Tooltip,
  Link,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  FiChevronDown,
  FiChevronRight,
  FiCode,
  FiCopy,
  FiCheck,
  FiExternalLink,
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
 * Block explorer URL for Hoodi testnet
 */
const BLOCK_EXPLORER_URL = 'https://hoodi.cloud.blockscout.com/address';

/**
 * Contract labels for display
 */
const CONTRACT_LABELS = {
  executor: 'Executor Contract',
  hybridVoting: 'Hybrid Voting',
  directDemocracyVoting: 'Direct Democracy Voting',
  taskManager: 'Task Manager',
  educationHub: 'Education Hub',
  quickJoin: 'Quick Join',
  participationToken: 'Participation Token',
};

/**
 * Single contract address row
 */
function ContractRow({ label, address }) {
  const { hasCopied, onCopy } = useClipboard(address || '');

  if (!address) return null;

  return (
    <Box
      p={3}
      borderRadius="lg"
      bg="rgba(30, 30, 40, 0.5)"
      border="1px solid rgba(148, 115, 220, 0.1)"
      transition="all 0.2s"
      _hover={{
        borderColor: 'rgba(148, 115, 220, 0.3)',
      }}
    >
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <VStack align="flex-start" spacing={0} flex={1} minW="150px">
          <Text fontSize="xs" color="gray.500">
            {label}
          </Text>
          <Text
            fontFamily="mono"
            fontSize="sm"
            color="white"
            wordBreak="break-all"
          >
            {address}
          </Text>
        </VStack>

        <HStack spacing={1}>
          <Tooltip label={hasCopied ? 'Copied!' : 'Copy address'}>
            <IconButton
              icon={hasCopied ? <FiCheck /> : <FiCopy />}
              size="sm"
              variant="ghost"
              colorScheme={hasCopied ? 'green' : 'gray'}
              onClick={onCopy}
              aria-label="Copy address"
            />
          </Tooltip>
          <Tooltip label="View on block explorer">
            <IconButton
              as={Link}
              href={`${BLOCK_EXPLORER_URL}/${address}`}
              isExternal
              icon={<FiExternalLink />}
              size="sm"
              variant="ghost"
              colorScheme="gray"
              aria-label="View on explorer"
            />
          </Tooltip>
        </HStack>
      </HStack>
    </Box>
  );
}

export function DeveloperInfoSection({ contracts = {} }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasContracts = Object.values(contracts).some(Boolean);

  if (!hasContracts) {
    return null;
  }

  return (
    <Box mt={4}>
      {/* Toggle button */}
      <Box
        as="button"
        width="100%"
        onClick={() => setIsExpanded(!isExpanded)}
        p={4}
        borderRadius="xl"
        bg="rgba(30, 30, 40, 0.3)"
        border="1px solid rgba(148, 115, 220, 0.1)"
        textAlign="left"
        transition="all 0.2s"
        _hover={{
          bg: 'rgba(30, 30, 40, 0.5)',
          borderColor: 'rgba(148, 115, 220, 0.2)',
        }}
      >
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon as={FiCode} color="gray.500" />
            <Text color="gray.400" fontWeight="medium">
              Developer Info
            </Text>
          </HStack>
          <Icon
            as={isExpanded ? FiChevronDown : FiChevronRight}
            color="gray.500"
            transition="transform 0.2s"
          />
        </HStack>
      </Box>

      {/* Expandable content */}
      <Collapse in={isExpanded} animateOpacity>
        <Box
          position="relative"
          borderRadius="2xl"
          p={{ base: 4, md: 6 }}
          mt={2}
          overflow="hidden"
        >
          <Box style={glassLayerStyle} />

          <VStack align="stretch" spacing={4}>
            <HStack spacing={2}>
              <Icon as={FiCode} color="purple.300" />
              <Text fontWeight="semibold" color="white">
                Smart Contract Addresses
              </Text>
            </HStack>

            <Text fontSize="sm" color="gray.400">
              These are the deployed smart contracts for this organization.
              You can verify them on the block explorer.
            </Text>

            <Grid
              templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
              gap={3}
            >
              {Object.entries(CONTRACT_LABELS).map(([key, label]) => {
                const address = contracts[key];
                if (!address) return null;
                return (
                  <GridItem key={key}>
                    <ContractRow label={label} address={address} />
                  </GridItem>
                );
              })}
            </Grid>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default DeveloperInfoSection;
