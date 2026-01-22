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
  ModalFooter,
  ModalOverlay,
  Select,
  HStack,
  VStack,
  Switch,
  Box,
  Text,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { BOUNTY_TOKEN_OPTIONS, BOUNTY_TOKENS, hasBounty as checkHasBounty } from '../../util/tokens';

const EditTaskModal = ({ isOpen, onClose, onEditTask, onDeleteTask, task }) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [difficulty, setDifficulty] = useState(task.difficulty);
  const [estHours, setEstimatedHours] = useState(task.estHours);

  // Bounty state - initialize from task if bounty exists
  const taskHasBounty = checkHasBounty(task.bountyToken, task.bountyPayout);
  const [hasBounty, setHasBounty] = useState(taskHasBounty);
  const [bountyToken, setBountyToken] = useState(
    taskHasBounty ? task.bountyToken : BOUNTY_TOKENS.BREAD.address
  );
  const [bountyAmount, setBountyAmount] = useState(
    taskHasBounty ? task.bountyPayout : ''
  );

  const handleEditTask = () => {
    onEditTask({
      ...task,
      name,
      description,
      difficulty,
      estHours,
      bountyToken: hasBounty ? bountyToken : BOUNTY_TOKENS.NONE.address,
      bountyAmount: hasBounty ? bountyAmount : '0',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Task</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
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
          <FormControl mt={4}>
            <FormLabel>Estimated Hours</FormLabel>
            <Input
                type="number"
                min="0.5"
                step="0.5"
                value={estHours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (isNaN(val)) {
                    setEstimatedHours(0.5);
                  } else {
                    setEstimatedHours(val);
                  }
                }}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val <= 0.5) {
                    setEstimatedHours(0.5);
                  } else {
                    setEstimatedHours(Math.round(val * 2) / 2);
                  }
                }}
              />
          </FormControl>

          <FormControl mt={4}>
            <HStack justify="space-between">
              <FormLabel mb={0}>Token Bounty</FormLabel>
              <Switch
                isChecked={hasBounty}
                onChange={(e) => setHasBounty(e.target.checked)}
                colorScheme="teal"
              />
            </HStack>
          </FormControl>

          {hasBounty && (
            <Box w="100%" mt={3} p={3} bg="gray.50" borderRadius="md">
              <VStack spacing={3}>
                <FormControl>
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
                <FormControl>
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
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr ="auto" onClick={() => onDeleteTask(task.id)}>
            Delete
          </Button>
          <Button colorScheme="teal" onClick={handleEditTask}>
            Save Changes
          </Button>

        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;
