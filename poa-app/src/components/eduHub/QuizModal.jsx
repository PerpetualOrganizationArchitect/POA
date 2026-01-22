import React, { useState, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Text,
  useToast,
  useDisclosure
} from '@chakra-ui/react';

import { usePOContext } from '@/context/POContext';
import { useWeb3 } from '@/hooks';

const QuizModal = ({ module }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { educationHubAddress } = usePOContext();
  const { education, executeWithNotification } = useWeb3();
  const toast = useToast();

  const handleSubmit = useCallback(async () => {
    if (selectedAnswerIndex === '' || !education) return;
    setIsSubmitting(true);

    const result = await executeWithNotification(
      () => education.completeModule(
        educationHubAddress,
        module.id,
        [parseInt(selectedAnswerIndex)]
      ),
      {
        pendingMessage: 'Submitting quiz answer...',
        successMessage: 'Quiz completed successfully!',
        refreshEvent: 'module:completed',
      }
    );

    if (!result.success) {
      // Check if it's an incorrect answer vs other error
      const errorMessage = result.error?.message || '';
      if (errorMessage.includes('incorrect') || errorMessage.includes('wrong')) {
        toast({
          title: "Incorrect Answer",
          description: "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setIsSubmitting(false);
    onClose();
  }, [selectedAnswerIndex, education, executeWithNotification, educationHubAddress, module.id, toast, onClose]);

  return (
    <>
      <Button size="sm" onClick={onOpen}>Take Quiz</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{module.name} Quiz</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>{module.question}</Text>
            <RadioGroup onChange={setSelectedAnswerIndex} value={selectedAnswerIndex}>
              <Stack direction="column">
                {module.answers?.map((answerObj) => (
                  <Radio key={answerObj.index} value={`${answerObj.index}`}>
                    {answerObj.answer}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={selectedAnswerIndex === ''}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default QuizModal;
