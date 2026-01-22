import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  Text,
  useToast
} from '@chakra-ui/react';

import { usePOContext } from '@/context/POContext';

const ExecutiveMenuModal = ({ isOpen, onClose }) => {
  const [addressToMint, setAddressToMint] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { roleHatIds } = usePOContext();

  const handleMintNFT = async () => {
    // In POP, executive role is granted via Hats Protocol
    // This requires a governance proposal to mint hats to users
    toast({
      title: "Not Implemented",
      description: "Granting executive role requires a governance proposal to mint hats via Hats Protocol",
      status: "info",
      duration: 5000,
      isClosable: true,
    });
    return;
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Executive Menu</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {/* Input for address */}
            <Text fontSize="sm" color="gray.600">
              In POP, executive roles are managed via Hats Protocol.
              To grant executive access, create a governance proposal.
            </Text>
            <Input
              placeholder="Enter Address for Executive Role"
              value={addressToMint}
              onChange={(e) => setAddressToMint(e.target.value)}
              isDisabled={loading}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleMintNFT}
            isLoading={loading}
          >
            Grant Executive Role
          </Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExecutiveMenuModal;