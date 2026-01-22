import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Box,
  VStack,
  Flex,
  Spacer,
  useToast,
  Textarea,
  useDisclosure,
  Text,
  Badge,
  HStack,
  Divider,
  IconButton,
  Tooltip,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { CheckIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { hasBounty as checkHasBounty, getTokenByAddress } from '../../util/tokens';
import EditTaskModal from './EditTaskModal';
import TaskApplicationModal from './TaskApplicationModal';
import { useTaskBoard } from '../../context/TaskBoardContext';
import { useDataBaseContext } from '@/context/dataBaseContext';
import { useUserContext } from '@/context/UserContext';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { resolveUsernames } from '@/features/deployer/utils/usernameResolver';


const glassLayerStyle = {
  position: "absolute",
  height: "100%",
  width: "100%",
  zIndex: -1,
  borderRadius: "inherit",
  backdropFilter: "blur(9px)",
  backgroundColor: "rgba(33, 33, 33, 0.97)",
};

const TaskCardModal = ({ task, columnId, onEditTask }) => {
  console.log("task", task);
  const [submission, setSubmission] = useState('');
  const [assignAddress, setAssignAddress] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { moveTask, deleteTask, applyForTask, approveApplication, assignTask } = useTaskBoard();
  const { hasExecRole, hasMemberRole, address: account, fetchUserDetails } = useUserContext();
  const { getUsernameByAddress, setSelectedProject, projects } = useDataBaseContext();
  const router = useRouter();
  const { userDAO } = router.query;
  const toast = useToast();
  const { isOpen, onOpen, onClose} = useDisclosure();
  const { isOpen: isApplicationModalOpen, onOpen: onOpenApplicationModal, onClose: onCloseApplicationModal } = useDisclosure();
  const [showAssignSection, setShowAssignSection] = useState(false);

  // Ref to prevent re-opening modal during intentional close
  const isClosingRef = useRef(false);

  useEffect(() => {
    // Don't re-open if we're intentionally closing
    if (isClosingRef.current) return;

    const taskId = router.query.task;

    if (taskId === task.id) {
      onOpen();
    }
  }, [router.query.task, task.id, onOpen]);

  const handleCloseModal = async () => {
    // Set flag to prevent useEffect from re-opening
    isClosingRef.current = true;
    onClose();

    const { projectId, userDAO } = router.query;
    const safeProjectId = projectId ? encodeURIComponent(decodeURIComponent(projectId)) : '';

    // Wait for URL to update before returning - this prevents new modal instances from opening
    await router.push(
      { pathname: `/tasks/`, query: { projectId: safeProjectId, userDAO } },
      undefined,
      { shallow: true }
    );

    // Reset flag after URL update completes
    isClosingRef.current = false;
  };

  // Handle applying for a task (for tasks that require application)
  const handleApply = async (applicationData) => {
    if (!hasMemberRole) {
      toast({
        title: 'Membership Required',
        description: 'You must be a member to apply for this task.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      await applyForTask(task.id, applicationData);
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted for review.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onCloseApplicationModal();
    } catch (error) {
      console.error('Error applying for task:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    }
  };

  // Handle approving an application (for executives)
  const handleApproveApplication = async (applicantAddress) => {
    if (!hasExecRole) {
      toast({
        title: 'Permission Required',
        description: 'You must be an executive to approve applications.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      await approveApplication(task.id, applicantAddress);
      toast({
        title: 'Application Approved',
        description: 'The applicant has been assigned to this task.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve application.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    }
  };

  // Handle assigning a task directly (for executives)
  // Supports both wallet addresses and usernames
  const handleAssignTask = async () => {
    if (!hasExecRole) {
      toast({
        title: 'Permission Required',
        description: 'You must be an executive to assign tasks.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    const input = assignAddress.trim();
    if (!input) {
      toast({
        title: 'Input Required',
        description: 'Please enter a username or wallet address.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAssigning(true);

    try {
      let resolvedAddress = input;

      // Check if input is already a valid address
      if (!ethers.utils.isAddress(input)) {
        // Not an address, try to resolve as username
        toast({
          title: 'Resolving Username',
          description: `Looking up "${input}"...`,
          status: 'info',
          duration: 2000,
          isClosable: true,
        });

        const { resolved, notFound } = await resolveUsernames([input]);

        if (notFound.length > 0 || !resolved.has(input.toLowerCase())) {
          toast({
            title: 'User Not Found',
            description: `No user found with username "${input}". Please check the spelling or use a wallet address.`,
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
          setIsAssigning(false);
          return;
        }

        resolvedAddress = resolved.get(input.toLowerCase());
      }

      await assignTask(task.id, resolvedAddress);
      toast({
        title: 'Task Assigned',
        description: `The task has been assigned to ${input !== resolvedAddress ? input : `${resolvedAddress.slice(0, 6)}...${resolvedAddress.slice(-4)}`}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setAssignAddress('');
      setShowAssignSection(false);
      handleCloseModal();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign task.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleButtonClick = async () => {
    // For tasks requiring application, open the application modal instead
    if (columnId === 'open' && task.requiresApplication && !hasExecRole) {
      if (hasMemberRole) {
        onOpenApplicationModal();
      } else {
        toast({
          title: 'Membership Required',
          description: 'You must be a member to apply for this task.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
      }
      return;
    }

    // Validate permissions and inputs BEFORE closing modal
    if (columnId === 'open') {
      if (!hasMemberRole) {
        toast({
          title: 'Membership Required',
          description: 'You must be a member to claim this task. Go to user page to join.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    }

    if (columnId === 'inProgress') {
      if (submission === "") {
        toast({
          title: "Invalid Submission",
          description: "Please Enter a submission",
          status: "error",
          duration: 3500,
          isClosable: true
        });
        return;
      }
      if (!hasMemberRole) {
        toast({
          title: 'Membership Required',
          description: 'You must be a member to submit. Go to user page to join.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    }

    if (columnId === 'inReview') {
      if (!hasExecRole) {
        toast({
          title: 'Permission Required',
          description: 'You must be an executive to complete the review.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    }

    if (columnId === 'completed') {
      if (!hasExecRole) {
        toast({
          title: 'Permission Required',
          description: 'You must be an executive to delete a task.',
          status: 'warning',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    }

    // All validations passed - close modal and wait for URL update
    // This ensures new TaskCardModal instances (from optimistic update) won't see the task in URL
    await handleCloseModal();

    // Now execute the transaction (runs in background, optimistic UI already shown)
    if (columnId === 'open') {
      // Claim task - moveTask handles optimistic UI and notifications
      moveTask(task, columnId, 'inProgress', 0, " ", account).catch(error => {
        console.error("Error claiming task:", error);
      });
    }

    if (columnId === 'inProgress') {
      // Submit task - moveTask handles optimistic UI and notifications
      moveTask(task, columnId, 'inReview', 0, submission).catch(error => {
        console.error("Error submitting task:", error);
      });
    }

    if (columnId === 'inReview') {
      // Complete review - moveTask handles optimistic UI and notifications
      moveTask(task, columnId, 'completed', 0).catch(error => {
        console.error("Error completing review:", error);
      });
    }

    if (columnId === 'completed') {
      // Delete task
      deleteTask(task.id, columnId).catch(error => {
        console.error("Error deleting task:", error);
      });
    }
  };


  const buttonText = () => {
    switch (columnId) {
      case 'open':
        // Show "Apply" for tasks requiring application (unless exec who can bypass)
        if (task.requiresApplication && !hasExecRole) {
          return 'Apply';
        }
        return 'Claim';
      case 'inProgress':
        return 'Submit';
      case 'inReview':
        return 'Complete Review';
      case 'completed':
        return <CheckIcon />;
      default:
        return '';
    }
  };

  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

  const handleOpenEditTaskModal = () => {
    
    if (hasExecRole) {
      setIsEditTaskModalOpen(true);
    } else {
      toast({
        title: 'Permission Required',
        description: 'You must be an executive to edit a task.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
    
  };

  const handleCloseEditTaskModal = () => {
    setIsEditTaskModalOpen(false);
    router.push({ pathname: `/tasks/`, query: { userDAO: userDAO } }, undefined, { shallow: true });
  };

  const copyLinkToClipboard = () => {
    const encodedProjectId = encodeURIComponent(task.projectId);
    const link = `${window.location.origin}/tasks/?task=${task.id}&projectId=${encodedProjectId}&userDAO=${userDAO}`;

    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copied",
        description: "Task link copied to clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true
      });
    }).catch(err => {
      toast({
        title: "Failed to copy",
        description: "There was an issue copying the link.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
      console.error('Failed to copy link: ', err);
    });
  };

  const difficultyColorScheme = {
    easy: 'green',
    medium: 'yellow',
    hard: 'orange',
    veryhard: 'red'
  };

  return task ? (
    <>
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="3xl">
        <ModalOverlay />
        <ModalContent bg="transparent" textColor="white">
          <div className="glass" style={glassLayerStyle} />
          <ModalCloseButton />
          <Box pt={4} borderTopRadius="2xl" bg="transparent" boxShadow="lg" position="relative" zIndex={-1}>
            <div className="glass" style={glassLayerStyle} />
            <Text ml="6" fontSize="2xl" fontWeight="bold">{task.isIndexing ? 'Indexing Task Data...' : task.name}</Text>
          </Box>
          <ModalBody>
            <VStack spacing={4} align="start">
              {task.isIndexing ? (
                <Box w="100%" p={4} bg="purple.100" borderRadius="md">
                  <Text color="purple.800" fontWeight="bold">
                    Task information is being indexed from IPFS
                  </Text>
                  <Text color="purple.700" fontSize="sm" mt={2}>
                    This task was recently created and its data is still being indexed from IPFS to the subgraph.
                    Please check back in a few moments when indexing is complete.
                  </Text>
                </Box>
              ) : (
                <>
                  <Box>
                    <Text mb="4" mt="4" lineHeight="6" fontSize="md" fontWeight="bold" style={{ whiteSpace: 'pre-wrap' }}>{task.description}</Text>
                  </Box>
                  <HStack width="100%">
                    <Badge colorScheme={difficultyColorScheme[task.difficulty?.toLowerCase()?.replace(" ", "") || 'easy']}>
                      {task.difficulty || 'Unknown'}
                    </Badge>
                    <Badge colorScheme="blue">{task.estHours || '0'} hrs</Badge>
                    <Spacer />
                    {task.claimedBy && (
                      <Text fontSize="sm" mr={4}>
                        Claimed By: {task.claimerUsername}
                      </Text>
                    )}
                  </HStack>
                  {columnId === 'inProgress' && (
                    <FormControl>
                      <FormLabel fontWeight="bold" fontSize="lg">
                        Submission:
                      </FormLabel>
                      <Textarea
                        height="200px"
                        placeholder="Type your submission here"
                        value={submission}
                        onChange={(e) => setSubmission(e.target.value)}
                      />
                    </FormControl>
                  )}
                  {(columnId === 'inReview' || columnId === 'completed') && (
                    <Box>
                      <Text color="gray" fontWeight="bold" fontSize="lg">
                        Submission:
                      </Text>
                      <Text>{task.submission}</Text>
                    </Box>
                  )}

                  {/* Show requiresApplication badge */}
                  {columnId === 'open' && task.requiresApplication && (
                    <Badge colorScheme="purple" fontSize="sm">
                      Application Required
                    </Badge>
                  )}

                  {/* Applicants section for executives on tasks requiring application */}
                  {columnId === 'open' && task.requiresApplication && hasExecRole && task.applicants && task.applicants.length > 0 && (
                    <Box w="100%" p={4} bg="whiteAlpha.100" borderRadius="md">
                      <Text fontWeight="bold" fontSize="md" mb={3}>
                        Applicants ({task.applicants.length})
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {task.applicants.map((applicant, index) => (
                          <Flex key={index} justify="space-between" align="center" p={2} bg="whiteAlpha.100" borderRadius="md">
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {applicant.username || `${applicant.address?.slice(0, 6)}...${applicant.address?.slice(-4)}`}
                              </Text>
                              {applicant.notes && (
                                <Text fontSize="xs" color="gray.400">{applicant.notes}</Text>
                              )}
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleApproveApplication(applicant.address)}
                            >
                              Approve
                            </Button>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Assign section for executives */}
                  {columnId === 'open' && hasExecRole && showAssignSection && (
                    <Box w="100%" p={4} bg="whiteAlpha.100" borderRadius="md">
                      <Text fontWeight="bold" fontSize="md" mb={2}>
                        Assign Task
                      </Text>
                      <HStack>
                        <Input
                          placeholder="Username or wallet address (0x...)"
                          value={assignAddress}
                          onChange={(e) => setAssignAddress(e.target.value)}
                          size="sm"
                          bg="whiteAlpha.100"
                        />
                        <Button
                          size="sm"
                          colorScheme="purple"
                          onClick={handleAssignTask}
                          isLoading={isAssigning}
                          loadingText="Resolving..."
                        >
                          Assign
                        </Button>
                      </HStack>
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        Enter a username or full wallet address
                      </Text>
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1.5px solid" borderColor="gray.200" py={2}>
            <Box flexGrow={1}>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="m">
                  Reward: {task.Payout} PT
                </Text>
                {checkHasBounty(task.bountyToken, task.bountyPayout) && (
                  <Text fontWeight="bold" fontSize="sm" color="green.400">
                    + {task.bountyPayout} {getTokenByAddress(task.bountyToken).symbol} Bounty
                  </Text>
                )}
              </VStack>
            </Box>
            <Box>
              <Button textColor={"white"} variant="outline" onClick={copyLinkToClipboard} mr={2}>
                Share
              </Button>
              {!task.isIndexing && columnId === 'open' && hasExecRole && (
                <Button
                  textColor={"white"}
                  variant="outline"
                  onClick={() => setShowAssignSection(!showAssignSection)}
                  mr={2}
                  colorScheme={showAssignSection ? "purple" : undefined}
                >
                  {showAssignSection ? 'Cancel Assign' : 'Assign'}
                </Button>
              )}
              {!task.isIndexing && columnId === 'open' && (
                <Button textColor={"white"} variant="outline" onClick={handleOpenEditTaskModal} mr={2}>
                  Edit
                </Button>
              )}
              <Button onClick={handleButtonClick} colorScheme="teal" isDisabled={task.isIndexing}>
                {buttonText()}
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {columnId === 'open' && !task.isIndexing && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={handleCloseEditTaskModal}
          onEditTask={onEditTask}
          task={task}
          onDeleteTask={(taskId) => deleteTask(taskId, columnId)}
        />
      )}

      {/* Task Application Modal */}
      <TaskApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={onCloseApplicationModal}
        onApply={handleApply}
        taskName={task.name}
      />
    </>
  ) : null;
};

export default TaskCardModal;
