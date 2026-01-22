import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  VStack,
  Textarea,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  FormHelperText,
} from '@chakra-ui/react';
import { useWeb3 } from '@/hooks/useWeb3Services';
import { usePOContext } from '@/context/POContext';
import { useIPFScontext } from '@/context/ipfsContext';
import { RefreshEvent } from '@/context/RefreshContext';

const TokenRequestModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { tokenRequest, executeWithNotification } = useWeb3();
  const { participationTokenAddress } = usePOContext();
  const { addToIpfs } = useIPFScontext();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const resetForm = () => {
    setAmount('');
    setReason('');
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid token amount greater than 0',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for your token request',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!participationTokenAddress) {
      toast({
        title: 'Error',
        description: 'Participation token not found for this organization',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const metadata = {
        reason: reason.trim(),
        submittedAt: Math.floor(Date.now() / 1000),
      };

      const result = await executeWithNotification(
        () => tokenRequest.requestTokens(
          participationTokenAddress,
          amount,
          metadata,
          { ipfsService: { addToIpfs } }
        ),
        {
          pendingMessage: 'Submitting token request...',
          successMessage: 'Token request submitted successfully!',
          refreshEvent: RefreshEvent.TOKEN_REQUEST_CREATED,
          refreshData: { amount },
        }
      );

      if (result.success) {
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error submitting token request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit token request',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Request Participation Tokens</ModalHeader>
        <ModalCloseButton isDisabled={loading} />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Request tokens for contributions that aren&apos;t covered by tasks or education modules.
              Your request will be reviewed by an approver.
            </Text>

            <FormControl isRequired>
              <FormLabel>Token Amount</FormLabel>
              <NumberInput
                value={amount}
                onChange={(value) => setAmount(value)}
                min={0}
                precision={0}
              >
                <NumberInputField placeholder="e.g., 100" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormHelperText>
                Number of participation tokens to request
              </FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Reason / Justification</FormLabel>
              <Textarea
                placeholder="Describe your contribution and why you're requesting these tokens..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={2000}
              />
              <FormHelperText>
                {reason.length}/2000 characters
              </FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Submitting..."
          >
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TokenRequestModal;
