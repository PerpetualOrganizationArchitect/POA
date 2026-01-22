import React, { useState, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Text,
  Box,
  Divider,
  Alert,
  AlertIcon,
  IconButton,
  Badge,
  Tooltip,
  Switch,
  Checkbox,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useRoleNames } from "@/hooks";
import SetterActionSelector from "./SetterActionSelector";

const glassLayerStyle = {
  position: "absolute",
  height: "100%",
  width: "100%",
  zIndex: -1,
  borderRadius: "inherit",
  backdropFilter: "blur(20px)",
  backgroundColor: "rgba(0, 0, 0, .9)",
  boxShadow: "inset 0 0 15px rgba(148, 115, 220, 0.15)",
  border: "1px solid rgba(148, 115, 220, 0.2)",
};

const CreateVoteModal = ({
  isOpen,
  onClose,
  proposal,
  handleInputChange,
  handleOptionsChange,
  handleProposalTypeChange,
  handleTransferAddressChange,
  handleTransferAmountChange,
  handleElectionRoleChange,
  addCandidate,
  removeCandidate,
  handleRestrictedToggle,
  toggleRestrictedRole,
  handleSetterChange,
  handlePollCreated,
  loadingSubmit,
  allProjects = [],
  roleNames = {},
  projectNames = {},
}) => {
  const { allRoles } = useRoleNames();
  const [candidateName, setCandidateName] = useState("");
  const [candidateAddress, setCandidateAddress] = useState("");

  const handleAddCandidate = useCallback(() => {
    if (candidateName.trim() && candidateAddress.trim()) {
      addCandidate(candidateName.trim(), candidateAddress.trim());
      setCandidateName("");
      setCandidateAddress("");
    }
  }, [candidateName, candidateAddress, addCandidate]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(10px)" />
      <ModalContent
        bg="transparent"
        borderRadius="xl"
        position="relative"
        boxShadow="dark-lg"
      >
        <Box 
          className="glass" 
          style={glassLayerStyle} 
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius="inherit"
          zIndex={-1}
        />
        
        <ModalHeader color="white" fontSize="2xl" fontWeight="bold">
          Create a Vote
        </ModalHeader>
        <ModalCloseButton color="white" />
        
        <Divider borderColor="rgba(148, 115, 220, 0.3)" />
        
        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel color="white" fontWeight="medium">Vote Title</FormLabel>
              <Input
                placeholder="Enter title"
                name="name"
                value={proposal.name}
                onChange={handleInputChange}
                bg="whiteAlpha.100"
                border="1px solid rgba(148, 115, 220, 0.3)"
                color="white"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="white" fontWeight="medium">Description</FormLabel>
              <Textarea
                placeholder="Enter description"
                name="description"
                value={proposal.description}
                onChange={handleInputChange}
                bg="whiteAlpha.100"
                border="1px solid rgba(148, 115, 220, 0.3)"
                color="white"
                h="120px"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="white" fontWeight="medium">Vote Duration (minutes)</FormLabel>
              <Input
                placeholder="Enter time in minutes"
                name="time"
                type="number"
                value={proposal.time}
                onChange={handleInputChange}
                bg="whiteAlpha.100"
                border="1px solid rgba(148, 115, 220, 0.3)"
                color="white"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="white" fontWeight="medium">Vote Type</FormLabel>
              <Select
                placeholder="Select vote type"
                name="type"
                value={proposal.type}
                onChange={handleProposalTypeChange}
                bg="whiteAlpha.100"
                border="1px solid rgba(148, 115, 220, 0.3)"
                color="white"
                _hover={{ borderColor: "purple.400" }}
                _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
              >
                <option value="normal">Normal Vote</option>
                <option value="election">Election (assign role to winner)</option>
                <option value="transferFunds">Transfer Funds</option>
                <option value="setter">Change Contract Settings</option>
              </Select>
            </FormControl>

            {proposal.type === "normal" && (
              <FormControl>
                <FormLabel color="white" fontWeight="medium">Options (comma separated)</FormLabel>
                <Input
                  placeholder="e.g. Yes, No, Abstain"
                  value={proposal.options.join(", ")}
                  onChange={handleOptionsChange}
                  bg="whiteAlpha.100"
                  border="1px solid rgba(148, 115, 220, 0.3)"
                  color="white"
                  _hover={{ borderColor: "purple.400" }}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
                />
              </FormControl>
            )}

            {proposal.type === "election" && (
              <>
                {/* Role Selection */}
                <FormControl>
                  <HStack>
                    <FormLabel color="white" fontWeight="medium" mb={0}>Role to Assign</FormLabel>
                    <Tooltip
                      label="The winning candidate will automatically receive this role"
                      placement="top"
                      hasArrow
                      bg="gray.700"
                    >
                      <InfoOutlineIcon boxSize={3} color="gray.400" cursor="help" />
                    </Tooltip>
                  </HStack>
                  <Select
                    placeholder="Select role"
                    value={proposal.electionRoleId}
                    onChange={(e) => handleElectionRoleChange(e.target.value)}
                    bg="whiteAlpha.100"
                    border="1px solid rgba(148, 115, 220, 0.3)"
                    color="white"
                    mt={2}
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
                  >
                    {allRoles?.map((role) => (
                      <option key={role.hatId} value={role.hatId}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Add Candidate Form */}
                <Box
                  p={4}
                  bg="rgba(148, 115, 220, 0.1)"
                  borderRadius="md"
                  border="1px solid rgba(148, 115, 220, 0.3)"
                >
                  <Text fontSize="sm" color="gray.300" fontWeight="medium" mb={3}>
                    Add Candidates
                  </Text>
                  <VStack spacing={3} align="stretch">
                    <HStack spacing={2}>
                      <Input
                        placeholder="Candidate name"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid rgba(148, 115, 220, 0.3)"
                        color="white"
                        size="sm"
                        flex="1"
                        _hover={{ borderColor: "purple.400" }}
                        _focus={{ borderColor: "purple.500" }}
                      />
                      <Input
                        placeholder="Wallet address (0x...)"
                        value={candidateAddress}
                        onChange={(e) => setCandidateAddress(e.target.value)}
                        bg="whiteAlpha.100"
                        border="1px solid rgba(148, 115, 220, 0.3)"
                        color="white"
                        size="sm"
                        flex="2"
                        _hover={{ borderColor: "purple.400" }}
                        _focus={{ borderColor: "purple.500" }}
                      />
                      <IconButton
                        icon={<AddIcon />}
                        colorScheme="purple"
                        size="sm"
                        onClick={handleAddCandidate}
                        isDisabled={!candidateName.trim() || !candidateAddress.trim()}
                        aria-label="Add candidate"
                      />
                    </HStack>
                  </VStack>
                </Box>

                {/* Candidate List */}
                {proposal.electionCandidates?.length > 0 && (
                  <Box
                    p={4}
                    bg="rgba(148, 115, 220, 0.05)"
                    borderRadius="md"
                    border="1px solid rgba(148, 115, 220, 0.2)"
                  >
                    <Text fontSize="sm" color="gray.300" fontWeight="medium" mb={3}>
                      Candidates ({proposal.electionCandidates.length})
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {proposal.electionCandidates.map((candidate, index) => (
                        <HStack
                          key={index}
                          justify="space-between"
                          p={2}
                          bg="whiteAlpha.50"
                          borderRadius="md"
                        >
                          <HStack spacing={2}>
                            <Badge colorScheme="purple" variant="subtle">
                              {index + 1}
                            </Badge>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="white" fontWeight="medium">
                                {candidate.name}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {candidate.address.slice(0, 6)}...{candidate.address.slice(-4)}
                              </Text>
                            </VStack>
                          </HStack>
                          <IconButton
                            icon={<DeleteIcon />}
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeCandidate(index)}
                            aria-label="Remove candidate"
                          />
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                <Alert status="info" borderRadius="md" bg="rgba(66, 153, 225, 0.15)">
                  <AlertIcon color="blue.300" />
                  <Text fontSize="sm" color="gray.300">
                    When voting ends, the winning candidate will automatically receive the selected role.
                  </Text>
                </Alert>
              </>
            )}

            {proposal.type === "transferFunds" && (
              <>
                <FormControl>
                  <FormLabel color="white" fontWeight="medium">Recipient Address</FormLabel>
                  <Input
                    placeholder="0x..."
                    value={proposal.transferAddress}
                    onChange={handleTransferAddressChange}
                    bg="whiteAlpha.100"
                    border="1px solid rgba(148, 115, 220, 0.3)"
                    color="white"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="white" fontWeight="medium">Amount (ETH)</FormLabel>
                  <Input
                    placeholder="Amount in ETH"
                    value={proposal.transferAmount}
                    onChange={handleTransferAmountChange}
                    type="number"
                    step="0.001"
                    min="0"
                    bg="whiteAlpha.100"
                    border="1px solid rgba(148, 115, 220, 0.3)"
                    color="white"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px rgba(148, 115, 220, 0.6)" }}
                  />
                </FormControl>

                <Box
                  bg="rgba(148, 115, 220, 0.1)"
                  borderRadius="md"
                  p={3}
                  border="1px solid rgba(148, 115, 220, 0.3)"
                >
                  <Text fontSize="sm" color="gray.300" fontWeight="medium" mb={2}>
                    Voting Options:
                  </Text>
                  <VStack align="start" spacing={1} pl={2}>
                    <Text fontSize="sm" color="green.300">✓ Yes - Execute transfer</Text>
                    <Text fontSize="sm" color="red.300">✗ No - Reject transfer</Text>
                  </VStack>
                </Box>

                <Alert status="info" borderRadius="md" bg="rgba(66, 153, 225, 0.15)">
                  <AlertIcon color="blue.300" />
                  <Text fontSize="sm" color="gray.300">
                    This creates a Yes/No vote. If "Yes" wins, the transfer executes automatically from the organization's treasury.
                  </Text>
                </Alert>
              </>
            )}

            {proposal.type === "setter" && (
              <SetterActionSelector
                proposal={proposal}
                onChange={handleSetterChange}
                allRoles={allRoles}
                allProjects={allProjects}
                roleNames={roleNames}
                projectNames={projectNames}
              />
            )}

            {/* Voting Restrictions - Available for all proposal types */}
            <Divider borderColor="rgba(148, 115, 220, 0.2)" />

            <FormControl display="flex" alignItems="center">
              <HStack flex="1">
                <FormLabel htmlFor="restricted-voting" mb="0" color="white" fontWeight="medium">
                  Restrict who can vote
                </FormLabel>
                <Tooltip
                  label="Limit voting to specific roles instead of all members"
                  placement="top"
                  hasArrow
                  bg="gray.700"
                >
                  <InfoOutlineIcon boxSize={3} color="gray.400" cursor="help" />
                </Tooltip>
              </HStack>
              <Switch
                id="restricted-voting"
                isChecked={proposal.isRestricted}
                onChange={(e) => handleRestrictedToggle(e.target.checked)}
                colorScheme="purple"
              />
            </FormControl>

            {proposal.isRestricted && (
              <Box
                p={4}
                bg="rgba(148, 115, 220, 0.1)"
                borderRadius="md"
                border="1px solid rgba(148, 115, 220, 0.3)"
              >
                <Text fontSize="sm" color="gray.300" fontWeight="medium" mb={3}>
                  Select which roles can vote:
                </Text>
                <Wrap spacing={2}>
                  {allRoles?.map((role) => (
                    <WrapItem key={role.hatId}>
                      <Checkbox
                        isChecked={proposal.restrictedHatIds?.includes(role.hatId)}
                        onChange={() => toggleRestrictedRole(role.hatId)}
                        colorScheme="purple"
                        size="md"
                      >
                        <Text fontSize="sm" color="white">{role.name}</Text>
                      </Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
                {proposal.restrictedHatIds?.length === 0 && (
                  <Text fontSize="xs" color="orange.300" mt={2}>
                    Please select at least one role
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>
        
        <Divider borderColor="rgba(148, 115, 220, 0.3)" />
        
        <ModalFooter>
          <Button 
            variant="outline" 
            mr={3} 
            onClick={onClose}
            color="white"
            borderColor="rgba(255, 255, 255, 0.3)"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Cancel
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={handlePollCreated} 
            isLoading={loadingSubmit}
            loadingText="Creating..."
          >
            Create Vote
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateVoteModal; 