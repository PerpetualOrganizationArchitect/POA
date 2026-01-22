import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Alert,
  AlertIcon,
  Tooltip,
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { useAccount } from 'wagmi';
import { FETCH_USER_TOKEN_REQUESTS } from '@/util/queries';
import { useWeb3 } from '@/hooks/useWeb3Services';
import { usePOContext } from '@/context/POContext';
import { useRefreshSubscription, RefreshEvent } from '@/context/RefreshContext';
import { formatTokenAmount } from '@/util/formatToken';

const StatusBadge = ({ status }) => {
  const colorScheme = {
    Pending: 'yellow',
    Approved: 'green',
    Cancelled: 'red',
  }[status] || 'gray';

  return (
    <Badge colorScheme={colorScheme} variant="subtle">
      {status}
    </Badge>
  );
};

const UserRequestHistory = () => {
  const toast = useToast();
  const { address } = useAccount();
  const { tokenRequest, executeWithNotification } = useWeb3();
  const { participationTokenAddress } = usePOContext();

  const [cancellingId, setCancellingId] = useState(null);

  // Query user's requests
  const { data, loading, error, refetch } = useQuery(FETCH_USER_TOKEN_REQUESTS, {
    variables: {
      tokenAddress: participationTokenAddress,
      userAddress: address?.toLowerCase(),
    },
    skip: !participationTokenAddress || !address,
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

  const userRequests = data?.tokenRequests || [];

  const handleCancel = async (requestId) => {
    if (!participationTokenAddress) return;

    setCancellingId(requestId);
    try {
      const result = await executeWithNotification(
        () => tokenRequest.cancelRequest(participationTokenAddress, requestId),
        {
          pendingMessage: 'Cancelling token request...',
          successMessage: 'Token request cancelled',
          errorMessage: 'Failed to cancel request',
          refreshEvent: RefreshEvent.TOKEN_REQUEST_CANCELLED,
          refreshData: { requestId },
        }
      );

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel request',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const formatAddress = (addr) => {
    if (!addr) return '-';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading && !data) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="md" />
        <Text mt={2} color="gray.500">Loading your requests...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load your requests
      </Alert>
    );
  }

  if (userRequests.length === 0) {
    return (
      <Box p={4} textAlign="center" color="gray.500">
        <Text>You haven&apos;t made any token requests yet</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontWeight="semibold" mb={3}>
        Your Request History ({userRequests.length})
      </Text>

      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Submitted</Th>
              <Th>Resolved</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {userRequests.map((request) => {
              const isPending = request.status === 'Pending';
              const resolvedDate = request.approvedAt || request.cancelledAt;

              return (
                <Tr key={request.id}>
                  <Td>
                    <Text fontWeight="medium">
                      {formatTokenAmount(request.amount)}
                    </Text>
                  </Td>
                  <Td>
                    <StatusBadge status={request.status} />
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(request.createdAt)}
                    </Text>
                  </Td>
                  <Td>
                    {resolvedDate ? (
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          {formatDate(resolvedDate)}
                        </Text>
                        {request.approver && (
                          <Tooltip label={request.approver}>
                            <Text fontSize="xs" color="gray.400">
                              by {formatAddress(request.approver)}
                            </Text>
                          </Tooltip>
                        )}
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">-</Text>
                    )}
                  </Td>
                  <Td>
                    {isPending && (
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleCancel(request.requestId)}
                        isLoading={cancellingId === request.requestId}
                        isDisabled={cancellingId !== null}
                      >
                        Cancel
                      </Button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default UserRequestHistory;
