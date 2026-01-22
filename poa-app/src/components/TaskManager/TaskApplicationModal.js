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
  useToast,
} from '@chakra-ui/react';

const TaskApplicationModal = ({ isOpen, onClose, onApply, taskName }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const [notes, setNotes] = useState('');
  const [experience, setExperience] = useState('');

  const resetForm = () => {
    setNotes('');
    setExperience('');
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast({
        title: 'Application Notes Required',
        description: 'Please explain why you want to work on this task',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const applicationData = {
        notes: notes.trim(),
        experience: experience.trim(),
        appliedAt: new Date().toISOString(),
      };

      await onApply(applicationData);
      resetForm();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Apply for: {taskName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              This task requires an application. Fill out the form below to apply.
              A manager will review your application and approve if selected.
            </Text>

            <FormControl isRequired>
              <FormLabel>Why do you want to work on this task?</FormLabel>
              <Textarea
                placeholder="Explain your interest and approach..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Relevant Experience (Optional)</FormLabel>
              <Textarea
                placeholder="Describe any relevant experience or skills..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={3}
              />
            </FormControl>
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
            loadingText="Submitting..."
          >
            Submit Application
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskApplicationModal;
