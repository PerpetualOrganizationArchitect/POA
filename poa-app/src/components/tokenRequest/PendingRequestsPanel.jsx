import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useToast,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { FETCH_PENDING_TOKEN_REQUESTS } from '@/util/queries';
import { useWeb3 } from '@/hooks/useWeb3Services';
import { usePOContext } from '@/context/POContext';
import { useIPFScontext } from '@/context/ipfsContext';
import { useRefreshSubscription, RefreshEvent } from '@/context/RefreshContext';
import { formatTokenAmount } from '@/util/formatToken';
import { useAccount } from 'wagmi';

const PendingRequestsPanel = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { tokenRequest, executeWithNotification } = useWeb3();
  const { participationTokenAddress } = usePOContext();
  const { ipfs } = useIPFScontext();

  const [loadingRequestId, setLoadingRequestId] = useState(null);
  const [metadataCache, setMetadataCache] = useState({});

  // Query pending requests
  const { data, loading, error, refetch } = useQuery(FETCH_PENDING_TOKEN_REQUESTS, {
    variables: { tokenAddress: participationTokenAddress },
    skip: !participationTokenAddress,
    fetchPolicy: 'cache-and-network',
  });

  // Subscribe to refresh events
  const handleRefresh = () => {
    setTimeout(() => refetch(), 2000);
  };

  useRefreshSubscription(
    [
      RefreshEvent.TOKEN_REQUEST_CREATED,
      RefreshEvent.TOKEN_REQUEST_APPROVED,
      RefreshEvent.TOKEN_REQUEST_CANCELLED,
    ],
    handleRefresh,
    [refetch]
  );

  const pendingRequests = data?.tokenRequests || [];

  // Fetch IPFS metadata for requests
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!ipfs || !pendingRequests.length) return;

      for (const request of pendingRequests) {
        if (request.ipfsHash && !metadataCache[request.ipfsHash]) {
          try {
            const metadata = await ipfs.fetchFromIpfs(request.ipfsHash);
            setMetadataCache(prev => ({
              ...prev,
              [request.ipfsHash]: metadata,
            }));
          } catch (err) {
            console.error('Error fetching IPFS metadata:', err);
          }
        }
      }
    };

    fetchMetadata();
  }, [pendingRequests, ipfs, metadataCache]);

  const handleApprove = async (requestId) => {
    if (!participationTokenAddress) return;

    setLoadingRequestId(requestId);
    try {
      const result = await executeWithNotification(
        () => tokenRequest.approveRequest(participationTokenAddress, requestId),
        {
          pendingMessage: 'Approving token request...',
          successMessage: 'Token request approved!',
          errorMessage: 'Failed to approve request',
          refreshEvent: RefreshEvent.TOKEN_REQUEST_APPROVED,
          refreshData: { requestId },
        }
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve request',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!participationTokenAddress) return;

    setLoadingRequestId(requestId);
    try {
      const result = await executeWithNotification(
        () => tokenRequest.cancelRequest(participationTokenAddress, requestId),
        {
          pendingMessage: 'Rejecting token request...',
          successMessage: 'Token request rejected',
          errorMessage: 'Failed to reject request',
          refreshEvent: RefreshEvent.TOKEN_REQUEST_CANCELLED,
          refreshData: { requestId },
        }
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject request',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoadingRequestId(null);
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Unknown';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  if (loading && !data) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="md" />
        <Text mt={2} color="gray.500">Loading pending requests...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load pending requests
      </Alert>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        <Text>No pending token requests to review</Text>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="semibold">
          Pending Requests ({pendingRequests.length})
        </Text>
        <Badge colorScheme="orange">{pendingRequests.length} to review</Badge>
      </HStack>

      <Accordion allowMultiple>
        {pendingRequests.map((request) => {
          const metadata = metadataCache[request.ipfsHash];
          const isOwnRequest = address && request.requester?.toLowerCase() === address.toLowerCase();
          const isLoading = loadingRequestId === request.requestId;

          return (
            <AccordionItem key={request.id} border="1px" borderColor="gray.200" borderRadius="md" mb={2}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <HStack spacing={3}>
                    <Text fontWeight="medium">
                      {formatTokenAmount(request.amount)} tokens
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      from {formatAddress(request.requester)}
                    </Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    {formatDate(request.createdAt)}
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600">
                      Reason:
                    </Text>
                    <Text fontSize="sm">
                      {metadata?.reason || 'Loading...'}
                    </Text>
                  </Box>

                  <Divider />

                  <HStack justify="flex-end" spacing={2}>
                    {isOwnRequest ? (
                      <Text fontSize="sm" color="gray.500" fontStyle="italic">
                        You cannot approve your own request
                      </Text>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleReject(request.requestId)}
                          isLoading={isLoading}
                          isDisabled={loadingRequestId !== null}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleApprove(request.requestId)}
                          isLoading={isLoading}
                          isDisabled={loadingRequestId !== null}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </Box>
  );
};

export default PendingRequestsPanel;
