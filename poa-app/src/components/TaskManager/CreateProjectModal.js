import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  VStack,
  HStack,
  Textarea,
  Text,
  Box,
  Divider,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, InfoIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { resolveUsernames } from '@/features/deployer/utils/usernameResolver';

const CreateProjectModal = ({ isOpen, onClose, onCreateProject, availableHats = [] }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Basic fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Token cap (0 = unlimited)
  const [hasCap, setHasCap] = useState(false);
  const [cap, setCap] = useState('');

  // Additional managers - stores { address, displayName } objects
  const [managers, setManagers] = useState([]);
  const [newManager, setNewManager] = useState('');
  const [isAddingManager, setIsAddingManager] = useState(false);

  // Hat permissions
  const [createHats, setCreateHats] = useState([]);
  const [claimHats, setClaimHats] = useState([]);
  const [reviewHats, setReviewHats] = useState([]);
  const [assignHats, setAssignHats] = useState([]);

  // Hat input fields
  const [newCreateHat, setNewCreateHat] = useState('');
  const [newClaimHat, setNewClaimHat] = useState('');
  const [newReviewHat, setNewReviewHat] = useState('');
  const [newAssignHat, setNewAssignHat] = useState('');

  // Supports both usernames and addresses
  const handleAddManager = async () => {
    const input = newManager.trim();
    if (!input) return;

    setIsAddingManager(true);

    try {
      let address, displayName;

      // Check if input is already a valid address
      if (ethers.utils.isAddress(input)) {
        address = input;
        displayName = `${input.slice(0, 6)}...${input.slice(-4)}`;
      } else {
        // Try to resolve as username
        const { resolved, notFound } = await resolveUsernames([input]);

        if (notFound.length > 0 || !resolved.has(input.toLowerCase())) {
          toast({
            title: 'User Not Found',
            description: `No user found with username "${input}". Please check the spelling or use a wallet address.`,
            status: 'error',
            duration: 4000,
          });
          setIsAddingManager(false);
          return;
        }

        address = resolved.get(input.toLowerCase());
        displayName = input; // Keep username as display name
      }

      // Check for duplicates
      if (managers.some(m => m.address.toLowerCase() === address.toLowerCase())) {
        toast({
          title: 'Duplicate',
          description: 'This user is already added as a manager',
          status: 'warning',
          duration: 3000,
        });
        setIsAddingManager(false);
        return;
      }

      setManagers([...managers, { address, displayName }]);
      setNewManager('');
    } catch (error) {
      console.error('Error adding manager:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add manager',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAddingManager(false);
    }
  };

  const handleRemoveManager = (address) => {
    setManagers(managers.filter(m => m.address !== address));
  };

  const handleAddHat = (hatId, setter, currentList, inputSetter) => {
    const id = hatId.trim();
    if (!id) return;

    // Validate it's a number
    if (!/^\d+$/.test(id)) {
      toast({
        title: 'Invalid Hat ID',
        description: 'Hat ID must be a number',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (currentList.includes(id)) {
      toast({
        title: 'Duplicate',
        description: 'This hat ID is already added',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setter([...currentList, id]);
    inputSetter('');
  };

  const handleRemoveHat = (hatId, setter, currentList) => {
    setter(currentList.filter(h => h !== hatId));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setHasCap(false);
    setCap('');
    setManagers([]);
    setNewManager('');
    setCreateHats([]);
    setClaimHats([]);
    setReviewHats([]);
    setAssignHats([]);
    setNewCreateHat('');
    setNewClaimHat('');
    setNewReviewHat('');
    setNewAssignHat('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a project name',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Convert cap to wei if set
      let capWei = 0;
      if (hasCap && cap) {
        capWei = ethers.utils.parseUnits(cap.toString(), 18);
      }

      await onCreateProject({
        name: name.trim(),
        description: description.trim(),
        cap: capWei,
        managers: managers.map(m => m.address), // Extract just the addresses
        createHats: createHats.map(h => parseInt(h, 10)),
        claimHats: claimHats.map(h => parseInt(h, 10)),
        reviewHats: reviewHats.map(h => parseInt(h, 10)),
        assignHats: assignHats.map(h => parseInt(h, 10)),
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Project</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Basic Info */}
            <FormControl isRequired>
              <FormLabel>Project Name</FormLabel>
              <Input
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description (Optional)</FormLabel>
              <Textarea
                placeholder="Describe the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </FormControl>

            <Divider />

            {/* Token Cap */}
            <FormControl>
              <HStack justify="space-between">
                <HStack spacing={1}>
                  <FormLabel mb={0}>Token Budget Cap</FormLabel>
                  <Tooltip label="Set a maximum amount of participation tokens this project can allocate to tasks. Leave unchecked for unlimited." placement="top">
                    <InfoIcon color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={hasCap}
                  onChange={(e) => setHasCap(e.target.checked)}
                  colorScheme="purple"
                />
              </HStack>
            </FormControl>

            {hasCap && (
              <Box w="100%" p={3} bg="gray.50" borderRadius="md">
                <FormControl>
                  <FormLabel fontSize="sm">Maximum Token Budget</FormLabel>
                  <NumberInput
                    value={cap}
                    onChange={(value) => setCap(value)}
                    min={0}
                  >
                    <NumberInputField placeholder="e.g., 10000" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Total participation tokens that can be allocated to tasks in this project
                  </Text>
                </FormControl>
              </Box>
            )}

            <Divider />

            {/* Advanced Settings */}
            <Accordion allowToggle>
              <AccordionItem border="none">
                <AccordionButton px={0}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    Advanced Settings
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} px={0}>
                  <VStack spacing={4} align="stretch">
                    {/* Additional Managers */}
                    <FormControl>
                      <HStack spacing={1} mb={2}>
                        <FormLabel mb={0}>Additional Managers</FormLabel>
                        <Tooltip label="Add other users that can manage this project. Enter a username or wallet address." placement="top">
                          <InfoIcon color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>
                      <HStack>
                        <Input
                          placeholder="Username or 0x... address"
                          value={newManager}
                          onChange={(e) => setNewManager(e.target.value)}
                          size="sm"
                          onKeyPress={(e) => e.key === 'Enter' && !isAddingManager && handleAddManager()}
                        />
                        <IconButton
                          aria-label="Add manager"
                          icon={<AddIcon />}
                          size="sm"
                          colorScheme="purple"
                          onClick={handleAddManager}
                          isLoading={isAddingManager}
                        />
                      </HStack>
                      {managers.length > 0 && (
                        <Wrap mt={2}>
                          {managers.map((manager) => (
                            <WrapItem key={manager.address}>
                              <Tooltip label={manager.address} placement="top">
                                <Tag size="sm" colorScheme="purple" borderRadius="full">
                                  <TagLabel>{manager.displayName}</TagLabel>
                                  <TagCloseButton onClick={() => handleRemoveManager(manager.address)} />
                                </Tag>
                              </Tooltip>
                            </WrapItem>
                          ))}
                        </Wrap>
                      )}
                    </FormControl>

                    <Divider />

                    {/* Hat Permissions */}
                    <Box>
                      <HStack spacing={1} mb={3}>
                        <Text fontWeight="medium">Hat Permissions</Text>
                        <Tooltip label="Assign permissions to specific hats for fine-grained access control" placement="top">
                          <InfoIcon color="gray.400" boxSize={3} />
                        </Tooltip>
                      </HStack>

                      {/* Create Hats */}
                      <FormControl mb={3}>
                        <FormLabel fontSize="sm">Hats that can CREATE tasks</FormLabel>
                        <HStack>
                          <Input
                            placeholder="Hat ID"
                            value={newCreateHat}
                            onChange={(e) => setNewCreateHat(e.target.value)}
                            size="sm"
                          />
                          <IconButton
                            aria-label="Add hat"
                            icon={<AddIcon />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleAddHat(newCreateHat, setCreateHats, createHats, setNewCreateHat)}
                          />
                        </HStack>
                        {createHats.length > 0 && (
                          <Wrap mt={2}>
                            {createHats.map((hatId) => (
                              <WrapItem key={hatId}>
                                <Tag size="sm" colorScheme="green" borderRadius="full">
                                  <TagLabel>Hat #{hatId}</TagLabel>
                                  <TagCloseButton onClick={() => handleRemoveHat(hatId, setCreateHats, createHats)} />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </FormControl>

                      {/* Claim Hats */}
                      <FormControl mb={3}>
                        <FormLabel fontSize="sm">Hats that can CLAIM tasks</FormLabel>
                        <HStack>
                          <Input
                            placeholder="Hat ID"
                            value={newClaimHat}
                            onChange={(e) => setNewClaimHat(e.target.value)}
                            size="sm"
                          />
                          <IconButton
                            aria-label="Add hat"
                            icon={<AddIcon />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleAddHat(newClaimHat, setClaimHats, claimHats, setNewClaimHat)}
                          />
                        </HStack>
                        {claimHats.length > 0 && (
                          <Wrap mt={2}>
                            {claimHats.map((hatId) => (
                              <WrapItem key={hatId}>
                                <Tag size="sm" colorScheme="blue" borderRadius="full">
                                  <TagLabel>Hat #{hatId}</TagLabel>
                                  <TagCloseButton onClick={() => handleRemoveHat(hatId, setClaimHats, claimHats)} />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </FormControl>

                      {/* Review Hats */}
                      <FormControl mb={3}>
                        <FormLabel fontSize="sm">Hats that can REVIEW/COMPLETE tasks</FormLabel>
                        <HStack>
                          <Input
                            placeholder="Hat ID"
                            value={newReviewHat}
                            onChange={(e) => setNewReviewHat(e.target.value)}
                            size="sm"
                          />
                          <IconButton
                            aria-label="Add hat"
                            icon={<AddIcon />}
                            size="sm"
                            colorScheme="orange"
                            onClick={() => handleAddHat(newReviewHat, setReviewHats, reviewHats, setNewReviewHat)}
                          />
                        </HStack>
                        {reviewHats.length > 0 && (
                          <Wrap mt={2}>
                            {reviewHats.map((hatId) => (
                              <WrapItem key={hatId}>
                                <Tag size="sm" colorScheme="orange" borderRadius="full">
                                  <TagLabel>Hat #{hatId}</TagLabel>
                                  <TagCloseButton onClick={() => handleRemoveHat(hatId, setReviewHats, reviewHats)} />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </FormControl>

                      {/* Assign Hats */}
                      <FormControl>
                        <FormLabel fontSize="sm">Hats that can ASSIGN tasks</FormLabel>
                        <HStack>
                          <Input
                            placeholder="Hat ID"
                            value={newAssignHat}
                            onChange={(e) => setNewAssignHat(e.target.value)}
                            size="sm"
                          />
                          <IconButton
                            aria-label="Add hat"
                            icon={<AddIcon />}
                            size="sm"
                            colorScheme="purple"
                            onClick={() => handleAddHat(newAssignHat, setAssignHats, assignHats, setNewAssignHat)}
                          />
                        </HStack>
                        {assignHats.length > 0 && (
                          <Wrap mt={2}>
                            {assignHats.map((hatId) => (
                              <WrapItem key={hatId}>
                                <Tag size="sm" colorScheme="purple" borderRadius="full">
                                  <TagLabel>Hat #{hatId}</TagLabel>
                                  <TagCloseButton onClick={() => handleRemoveHat(hatId, setAssignHats, assignHats)} />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        )}
                      </FormControl>
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Creating..."
          >
            Create Project
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;
