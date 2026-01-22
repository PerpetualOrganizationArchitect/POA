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
  Select,
  Textarea,
  useToast,
  InputGroup,
  InputRightAddon,
  Switch,
  Text,
  Box,
  Divider,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { BOUNTY_TOKEN_OPTIONS, BOUNTY_TOKENS } from '../../util/tokens';
import { useUserContext } from '../../context/UserContext';
import { ethers } from 'ethers';
import { resolveUsernames } from '@/features/deployer/utils/usernameResolver';


const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const { hasExecRole } = useUserContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [estHours, setEstHours] = useState(.5);
  const [hasBounty, setHasBounty] = useState(false);
  const [bountyToken, setBountyToken] = useState(BOUNTY_TOKENS.BREAD.address);
  const [bountyAmount, setBountyAmount] = useState('');
  const [requiresApplication, setRequiresApplication] = useState(false);
  const [assignTo, setAssignTo] = useState('');

  const [loading, setLoading] = useState(false)

  const toast = useToast();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Resolve assignTo if provided (supports both username and address)
      let resolvedAssignTo = null;
      if (assignTo.trim()) {
        const input = assignTo.trim();
        if (ethers.utils.isAddress(input)) {
          resolvedAssignTo = input;
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
            setLoading(false);
            return;
          }
          resolvedAssignTo = resolved.get(input.toLowerCase());
        }
      }

      // Prepare task data
      const taskData = {
        name,
        description,
        difficulty,
        estHours,
        bountyToken: hasBounty ? bountyToken : BOUNTY_TOKENS.NONE.address,
        bountyAmount: hasBounty ? bountyAmount : '0',
        requiresApplication,
        assignTo: resolvedAssignTo,
      };

      // Reset form immediately for better UX
      setDescription('');
      setName('');
      setHasBounty(false);
      setBountyAmount('');
      setRequiresApplication(false);
      setAssignTo('');
      setDifficulty('easy');
      setEstHours(.5);

      // Fire off the task creation - onAddTask handles closing the modal and running the transaction
      onAddTask(taskData);
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add task',
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl id="task-name">
              <FormLabel>Task Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
            <FormControl id="task-description">
              <FormLabel>Description</FormLabel>
              <Textarea
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
            <FormControl id="task-difficulty">
              <FormLabel>Difficulty</FormLabel>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="veryHard">Very Hard</option>
              </Select>
            </FormControl>
            <FormControl id="task-estimated-hours">
              <FormLabel>Estimated Hours</FormLabel>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={estHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val)) {
                    setEstHours(0.5);
                  } else {
                    setEstHours(val);
                  }
                }}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val <= 0.5) {
                    setEstHours(0.5);
                  } else {
                    setEstHours(Math.round(val * 2) / 2);
                  }
                }}
              />
            </FormControl>

            <FormControl id="task-bounty">
              <HStack justify="space-between">
                <FormLabel mb={0}>Add Token Bounty</FormLabel>
                <Switch
                  isChecked={hasBounty}
                  onChange={(e) => setHasBounty(e.target.checked)}
                  colorScheme="teal"
                />
              </HStack>
            </FormControl>

            {hasBounty && (
              <Box w="100%" p={3} bg="gray.50" borderRadius="md">
                <VStack spacing={3}>
                  <FormControl id="bounty-token">
                    <FormLabel fontSize="sm">Token</FormLabel>
                    <Select
                      value={bountyToken}
                      onChange={(e) => setBountyToken(e.target.value)}
                      size="sm"
                    >
                      {BOUNTY_TOKEN_OPTIONS.filter(t => !t.isDefault).map((token) => (
                        <option key={token.symbol} value={token.address}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl id="bounty-amount">
                    <FormLabel fontSize="sm">Amount</FormLabel>
                    <InputGroup size="sm">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={bountyAmount}
                        onChange={(e) => setBountyAmount(e.target.value)}
                      />
                      <InputRightAddon>
                        {BOUNTY_TOKEN_OPTIONS.find(t => t.address === bountyToken)?.symbol || 'TOKEN'}
                      </InputRightAddon>
                    </InputGroup>
                  </FormControl>
                  <Text fontSize="xs" color="gray.500">
                    This bounty will be paid in addition to participation tokens
                  </Text>
                </VStack>
              </Box>
            )}

            <Divider />

            <FormControl id="task-requires-application">
              <HStack justify="space-between">
                <HStack spacing={1}>
                  <FormLabel mb={0}>Require Application</FormLabel>
                  <Tooltip label="Members must apply and be approved before claiming this task" placement="top">
                    <InfoIcon color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <Switch
                  isChecked={requiresApplication}
                  onChange={(e) => setRequiresApplication(e.target.checked)}
                  colorScheme="purple"
                />
              </HStack>
            </FormControl>

            {hasExecRole && (
              <FormControl id="task-assign-to">
                <HStack spacing={1}>
                  <FormLabel>Assign To (Optional)</FormLabel>
                  <Tooltip label="Directly assign this task to a specific user" placement="top">
                    <InfoIcon color="gray.400" boxSize={3} />
                  </Tooltip>
                </HStack>
                <Input
                  placeholder="Username or 0x... address"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Leave empty for open claiming, or enter a username/address to assign immediately
                </Text>
              </FormControl>
            )}

          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}
          isLoading={loading}
          loadingText="Adding Task">
            Add Task
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTaskModal;

