import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useWeb3 } from '@/hooks';
import { useUserContext } from '@/context/UserContext';


const AccountSettingsModal = ({ isOpen, onClose }) => {
    const { graphUsername, setGraphUsername } = useUserContext();
    const { user: userService, executeWithNotification } = useWeb3();
    const toast = useToast();


    const [username, setUsername] = useState('');
    // const [email, setEmail] = useState('');
  
    useEffect(() => {
      if (graphUsername) {
       
        setUsername(graphUsername);
      }
    }, [graphUsername]);

  // Handle input changes
  
  const handleUsernameChange = (event) => setUsername(event.target.value);
  

  const handleSave = useCallback(async () => {
    if (!userService) return;

    if (graphUsername !== username) {
      const result = await executeWithNotification(
        () => userService.changeUsername(username),
        {
          pendingMessage: 'Updating username...',
          successMessage: 'Username updated successfully!',
          refreshEvent: 'user:username_changed',
        }
      );

      if (result.success) {
        setGraphUsername(username);
      }
    } else {
      toast({
        title: 'Username Unchanged',
        description: 'New username is the same as the old one. No changes made.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
    onClose();
  }, [userService, executeWithNotification, username, graphUsername, setGraphUsername, toast, onClose]);


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader> Update Account Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
           
            <FormLabel>Username</FormLabel>
            <Input value={username} onChange={handleUsernameChange} />
        
         
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export default AccountSettingsModal;

