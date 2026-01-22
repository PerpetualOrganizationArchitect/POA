/**
 * useProposalForm
 * Hook for managing proposal form state and submission
 */

import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { utils } from 'ethers';
import {
  SETTER_TEMPLATES,
  RAW_FUNCTIONS,
  CONTRACT_MAP,
  getTemplateById,
} from '@/config/setterDefinitions';

const defaultProposal = {
  name: "",
  description: "",
  execution: "",
  time: 0,
  options: [],
  type: "normal",
  transferAddress: "",
  transferAmount: "",
  // Election fields
  electionCandidates: [], // Array of { name, address }
  electionRoleId: "",     // Hat ID for the role being elected
  // Voting restriction fields
  isRestricted: false,    // Whether to restrict who can vote
  restrictedHatIds: [],   // Hat IDs that can vote (if restricted)
  // Setter fields (for contract settings changes)
  setterMode: "template", // "template" or "advanced"
  setterTemplate: "",     // Template ID if using template mode
  setterContract: "",     // Contract key (e.g., "hybridVoting")
  setterFunction: "",     // Function name (e.g., "setConfig")
  setterValues: {},       // Template input values
  setterParams: [],       // Raw function parameters (for advanced mode)
  id: 0,
};

export function useProposalForm({ onSubmit }) {
  const toast = useToast();
  const [proposal, setProposal] = useState(defaultProposal);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setProposal(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleOptionsChange = useCallback((e) => {
    const options = e.target.value.split(", ");
    setProposal(prev => ({ ...prev, options }));
  }, []);

  const handleProposalTypeChange = useCallback((e) => {
    setProposal(prev => ({ ...prev, type: e.target.value }));
  }, []);

  const handleTransferAddressChange = useCallback((e) => {
    setProposal(prev => ({ ...prev, transferAddress: e.target.value }));
  }, []);

  const handleTransferAmountChange = useCallback((e) => {
    setProposal(prev => ({ ...prev, transferAmount: e.target.value }));
  }, []);

  const handleElectionRoleChange = useCallback((roleId) => {
    setProposal(prev => ({ ...prev, electionRoleId: roleId }));
  }, []);

  const handleCandidatesChange = useCallback((candidates) => {
    setProposal(prev => ({ ...prev, electionCandidates: candidates }));
  }, []);

  const addCandidate = useCallback((name, address) => {
    setProposal(prev => ({
      ...prev,
      electionCandidates: [...prev.electionCandidates, { name, address }]
    }));
  }, []);

  const removeCandidate = useCallback((index) => {
    setProposal(prev => ({
      ...prev,
      electionCandidates: prev.electionCandidates.filter((_, i) => i !== index)
    }));
  }, []);

  const handleRestrictedToggle = useCallback((isRestricted) => {
    setProposal(prev => ({
      ...prev,
      isRestricted,
      restrictedHatIds: isRestricted ? prev.restrictedHatIds : [],
    }));
  }, []);

  const handleRestrictedRolesChange = useCallback((hatIds) => {
    setProposal(prev => ({ ...prev, restrictedHatIds: hatIds }));
  }, []);

  const toggleRestrictedRole = useCallback((hatId) => {
    setProposal(prev => {
      const current = prev.restrictedHatIds || [];
      const isSelected = current.includes(hatId);
      return {
        ...prev,
        restrictedHatIds: isSelected
          ? current.filter(id => id !== hatId)
          : [...current, hatId],
      };
    });
  }, []);

  // Setter-related handlers
  const handleSetterChange = useCallback((updates) => {
    setProposal(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setProposal(defaultProposal);
  }, []);

  const validateTransferProposal = useCallback(() => {
    if (!proposal.transferAddress || !utils.isAddress(proposal.transferAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid recipient address.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    const amount = parseFloat(proposal.transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid transfer amount.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    return true;
  }, [proposal.transferAddress, proposal.transferAmount, toast]);

  const validateElectionProposal = useCallback(() => {
    if (!proposal.electionRoleId) {
      toast({
        title: "No Role Selected",
        description: "Please select a role for this election.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    if (proposal.electionCandidates.length < 2) {
      toast({
        title: "Not Enough Candidates",
        description: "An election needs at least 2 candidates.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Validate all candidate addresses
    for (const candidate of proposal.electionCandidates) {
      if (!candidate.address || !utils.isAddress(candidate.address)) {
        toast({
          title: "Invalid Candidate Address",
          description: `"${candidate.name || 'Unnamed'}" has an invalid address.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
      if (!candidate.name || candidate.name.trim() === '') {
        toast({
          title: "Missing Candidate Name",
          description: "All candidates must have a name.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }
    }

    return true;
  }, [proposal.electionRoleId, proposal.electionCandidates, toast]);

  const validateSetterProposal = useCallback(() => {
    if (proposal.setterMode === 'template') {
      if (!proposal.setterTemplate) {
        toast({
          title: "No Action Selected",
          description: "Please select an action from the templates.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }

      const template = getTemplateById(proposal.setterTemplate);
      if (!template) {
        toast({
          title: "Invalid Template",
          description: "The selected template is not valid.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }

      // Validate required inputs have values
      for (const input of template.inputs || []) {
        const value = proposal.setterValues?.[input.name];
        if (value === undefined || value === '' || value === null) {
          toast({
            title: "Missing Value",
            description: `Please provide a value for "${input.label || input.name}".`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return false;
        }

        // Validate number ranges
        if (input.type === 'number') {
          const numValue = Number(value);
          if (input.min !== undefined && numValue < input.min) {
            toast({
              title: "Invalid Value",
              description: `${input.label} must be at least ${input.min}.`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            return false;
          }
          if (input.max !== undefined && numValue > input.max) {
            toast({
              title: "Invalid Value",
              description: `${input.label} must be at most ${input.max}.`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            return false;
          }
        }
      }
    } else {
      // Advanced mode validation
      if (!proposal.setterContract) {
        toast({
          title: "No Contract Selected",
          description: "Please select a target contract.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }

      if (!proposal.setterFunction) {
        toast({
          title: "No Function Selected",
          description: "Please select a function to call.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }

      const funcDef = RAW_FUNCTIONS[proposal.setterContract]?.find(
        f => f.name === proposal.setterFunction
      );
      if (!funcDef) {
        toast({
          title: "Invalid Function",
          description: "The selected function is not recognized.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return false;
      }

      // Check all parameters have values
      for (let i = 0; i < funcDef.params.length; i++) {
        const param = funcDef.params[i];
        const value = proposal.setterParams?.[i];
        if (value === undefined || value === '' || value === null) {
          toast({
            title: "Missing Parameter",
            description: `Please provide a value for "${param.label || param.name}".`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return false;
        }
      }
    }

    return true;
  }, [proposal.setterMode, proposal.setterTemplate, proposal.setterContract, proposal.setterFunction, proposal.setterValues, proposal.setterParams, toast]);

  const buildProposalData = useCallback((eligibilityModuleAddress, contractAddresses) => {
    let numOptions;
    let batches = [];
    let optionNames = [];

    if (proposal.type === "transferFunds") {
      const transferCall = {
        target: proposal.transferAddress,
        value: utils.parseEther(proposal.transferAmount).toString(),
        data: "0x",
      };

      batches = [
        [transferCall], // Yes wins: execute transfer
        [],             // No wins: do nothing
      ];
      numOptions = 2;
      optionNames = ["Yes", "No"];
    } else if (proposal.type === "election") {
      // Election proposal - each candidate is an option
      // When they win, the execution batch mints the role to them
      numOptions = proposal.electionCandidates.length;
      optionNames = proposal.electionCandidates.map(c => c.name);

      // Build execution batch for each candidate winning
      // Uses mintHatToAddress(uint256 hatId, address wearer) on EligibilityModule
      const iface = new utils.Interface([
        "function mintHatToAddress(uint256 hatId, address wearer)"
      ]);

      batches = proposal.electionCandidates.map(candidate => {
        const mintCall = {
          target: eligibilityModuleAddress,
          value: "0",
          data: iface.encodeFunctionData("mintHatToAddress", [
            proposal.electionRoleId,
            candidate.address
          ]),
        };
        return [mintCall];
      });
    } else if (proposal.type === "setter") {
      // Setter proposal - call a contract setter function
      let setterCall;

      if (proposal.setterMode === 'template' && proposal.setterTemplate) {
        // Template mode: use template's encode function
        const template = getTemplateById(proposal.setterTemplate);
        if (template) {
          const contractKey = template.contract;
          const contextKey = CONTRACT_MAP[contractKey]?.contextKey;
          const contractAddress = contractAddresses?.[contextKey];

          if (contractAddress) {
            const funcDef = RAW_FUNCTIONS[contractKey]?.find(f => f.name === template.functionName);
            if (funcDef) {
              const iface = new utils.Interface([funcDef.signature]);
              const encodedArgs = template.encode(proposal.setterValues);

              setterCall = {
                target: contractAddress,
                value: "0",
                data: iface.encodeFunctionData(template.functionName, encodedArgs),
              };
            }
          }
        }
      } else {
        // Advanced mode: raw function call
        const funcDef = RAW_FUNCTIONS[proposal.setterContract]?.find(
          f => f.name === proposal.setterFunction
        );
        const contextKey = CONTRACT_MAP[proposal.setterContract]?.contextKey;
        const contractAddress = contractAddresses?.[contextKey];

        if (funcDef && contractAddress) {
          const iface = new utils.Interface([funcDef.signature]);

          setterCall = {
            target: contractAddress,
            value: "0",
            data: iface.encodeFunctionData(proposal.setterFunction, proposal.setterParams),
          };
        }
      }

      if (setterCall) {
        batches = [
          [setterCall], // Yes wins: execute setter
          [],           // No wins: do nothing
        ];
      } else {
        batches = [[], []];
      }

      numOptions = 2;
      optionNames = ["Apply Changes", "Reject"];
    } else {
      numOptions = proposal.options?.length || 2;
      optionNames = proposal.options || [];
      batches = [];
    }

    return { numOptions, batches, optionNames };
  }, [proposal]);

  const validateBasicFields = useCallback(() => {
    if (!proposal.name || proposal.name.trim() === '') {
      toast({
        title: "Missing Title",
        description: "Please enter a title for your proposal.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    const duration = Number(proposal.time);
    if (isNaN(duration) || duration <= 0) {
      toast({
        title: "Invalid Duration",
        description: "Please enter a valid duration in minutes (must be greater than 0).",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    return true;
  }, [proposal.name, proposal.time, toast]);

  const handleSubmit = useCallback(async (eligibilityModuleAddress, contractAddresses = {}) => {
    setLoadingSubmit(true);

    try {
      // Basic field validation
      if (!validateBasicFields()) {
        setLoadingSubmit(false);
        return;
      }

      if (proposal.type === "transferFunds" && !validateTransferProposal()) {
        setLoadingSubmit(false);
        return;
      }

      if (proposal.type === "election" && !validateElectionProposal()) {
        setLoadingSubmit(false);
        return;
      }

      if (proposal.type === "setter" && !validateSetterProposal()) {
        setLoadingSubmit(false);
        return;
      }

      const { numOptions, batches, optionNames } = buildProposalData(eligibilityModuleAddress, contractAddresses);

      // Ensure duration is a number for the contract call
      const durationMinutes = Number(proposal.time);

      await onSubmit({
        name: proposal.name.trim(),
        description: proposal.description || '',
        time: durationMinutes,
        numOptions,
        batches,
        optionNames,
        type: proposal.type,
        transferAddress: proposal.transferAddress,
        transferAmount: proposal.transferAmount,
        electionRoleId: proposal.electionRoleId,
        electionCandidates: proposal.electionCandidates,
        // Setter proposal fields
        setterContract: proposal.setterContract,
        setterTemplate: proposal.setterTemplate,
        // Voting restrictions
        hatIds: proposal.isRestricted ? proposal.restrictedHatIds : [],
      });

      setLoadingSubmit(false);
      resetForm();

      let successDescription;
      if (proposal.type === "transferFunds") {
        successDescription = `Transfer proposal created. If "Yes" wins, ${proposal.transferAmount} ETH will be sent to ${proposal.transferAddress.slice(0, 6)}...${proposal.transferAddress.slice(-4)}`;
      } else if (proposal.type === "election") {
        successDescription = `Election created with ${proposal.electionCandidates.length} candidates. The winner will receive the role automatically.`;
      } else if (proposal.type === "setter") {
        const template = getTemplateById(proposal.setterTemplate);
        const actionName = template?.name || proposal.setterFunction || 'settings change';
        successDescription = `Settings change proposal created. If approved, "${actionName}" will be executed automatically.`;
      } else {
        successDescription = "Your proposal has been created successfully.";
      }

      toast({
        title: "Proposal Created",
        description: successDescription,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      return true;
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create proposal.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoadingSubmit(false);
      return false;
    }
  }, [proposal, validateBasicFields, validateTransferProposal, validateElectionProposal, validateSetterProposal, buildProposalData, onSubmit, resetForm, toast]);

  return {
    proposal,
    loadingSubmit,
    handleInputChange,
    handleOptionsChange,
    handleProposalTypeChange,
    handleTransferAddressChange,
    handleTransferAmountChange,
    handleElectionRoleChange,
    handleCandidatesChange,
    addCandidate,
    removeCandidate,
    handleRestrictedToggle,
    handleRestrictedRolesChange,
    toggleRestrictedRole,
    handleSetterChange,
    handleSubmit,
    resetForm,
  };
}

export default useProposalForm;
