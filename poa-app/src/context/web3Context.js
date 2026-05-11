// Web3Context.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { useIPFScontext } from './ipfsContext';

import DirectDemocracyVoting from "../../abi/DirectDemocracyVoting.json";
import ParticipationVoting from "../../abi/ParticipationVoting.json";
import HybridVoting from "../../abi/HybridVoting.json";

import TaskManager from "../../abi/TaskManager.json";
import NFTMembership from "../../abi/NFTMembership.json";
import Treasury from "../../abi/Treasury.json";
import DirectDemocracyToken from '../../abi/DirectDemocracyToken.json';
import AccountManager from '../../abi/AccountManager.json';
import QuickJoin from '../../abi/QuickJoin.json';
import EducationHub from '../../abi/EducationHub.json';

import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from '@/components/ProviderConverter';

// Import the notification context
import { useNotificationContext } from './NotificationContext';
import { useVotingContext } from './VotingContext';

import { getContractAddress, isSupportedChain } from '../util/networks';

const Web3Context = createContext();

export const useWeb3Context = () => {
    return useContext(Web3Context);
}

export const Web3Provider = ({ children }) => {
    const [isNetworkModalOpen, setNetworkModalOpen] = useState(false);
    const [account, setAccount] = useState("0x00");

    const { address, chainId } = useAccount();
    const provider = useEthersProvider();
    const signer = useEthersSigner();

    const {refetch} = useVotingContext();

    // Define a uniform gas price of 43 Gwei
    const GAS_PRICE = ethers.utils.parseUnits('43', 'gwei');

    useEffect(() => {
        console.log("provider: ", provider);
        console.log("address1: ", address);

        setAccount(address);
    }, [address]);

    const { addToIpfs, fetchFromIpfs } = useIPFScontext();

    const AccountManagerAddress = getContractAddress('AccountManager', chainId);

    const getContractInstance = (contractAddress, contractABI) => {
        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    const checkNetwork = () => {
        if (!isSupportedChain(chainId)) {
            setNetworkModalOpen(true);
            return false;
        }
        return true;
    };

    const closeNetworkModal = () => {
        setNetworkModalOpen(false);
    };

    // Import the notification context functions
    const { addNotification, updateNotification } = useNotificationContext();

    // Helper function to estimate gas and return gas options
    const getGasOptions = async (contractMethod, args = []) => {
        try {
            const gasEstimate = await contractMethod(...args).then(tx => tx.estimateGas());
            const gasLimit = gasEstimate.mul(127).div(100); // Add 27% buffer
            return {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };
        } catch (error) {
            console.error("Gas estimation failed:", error);
            // Set a default gas limit if estimation fails
            return {
                gasLimit: ethers.utils.hexlify(800000), // Default gas limit
                gasPrice: GAS_PRICE,
            };
        }
    };

    // Example of updating all web3 functions with notifications

    // Create New User
    async function createNewUser(username) {
        if (!checkNetwork()) {
            return;
        }
        const address = AccountManagerAddress;
        const contract = getContractInstance(address, AccountManager.abi);
        const notificationId = addNotification('Creating new user...', 'loading');

        try {
          

            // Estimate gas
            const gasEstimate = await contract.estimateGas.registerAccount(username);
            const gasLimit = gasEstimate.mul(127).div(100); // Add 27% buffer
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.registerAccount(username, gasOptions);
            await tx.wait();
            console.log("User registered");
            updateNotification(notificationId,'User registered successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error creating new user:", error);
            updateNotification(notificationId,'Error creating new user.', 'error');
        }
    }

    // Change Username
    async function changeUsername(username) {
        if (!checkNetwork()) {
            return;
        }
        const address = AccountManagerAddress;
        const contract = getContractInstance(address, AccountManager.abi);

        const notificationId = addNotification('Changing username...', 'loading');

        try {
          

            // Estimate gas
            const gasEstimate = await contract.estimateGas.changeUsername(username);
            const gasLimit = gasEstimate.mul(127).div(100); // Add 27% buffer
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.changeUsername(username, gasOptions);
            await tx.wait();
            console.log("Username changed");
            updateNotification(notificationId,'Username changed successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error changing username:", error);
            updateNotification(notificationId,'Error changing username.', 'error');
        }
    }

    // Create Proposal Participation Voting
    async function createProposalParticipationVoting(contractAddress, proposalName, proposalDescription, proposalDuration, options, receiverAddress, triggerSpendIndex, amount, canSend) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, HybridVoting.abi);
        let tokenAddress = "0x0000000000000000000000000000000000001010";

        const notificationId = addNotification('Creating participation proposal...', 'loading');

        try {
          

            // Estimate gas
            const gasEstimate = await contract.estimateGas.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,
                options,
                receiverAddress,
                triggerSpendIndex,
                amount,
                canSend,
                tokenAddress
            );
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,
                options,
                receiverAddress,
                triggerSpendIndex,
                amount,
                canSend,
                tokenAddress,
                gasOptions
            );
            await tx.wait();
            console.log("Hybrid proposal created");
            updateNotification(notificationId,'Participation proposal created successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error creating hybrid proposal:", error);
            updateNotification(notificationId,'Error creating participation proposal.', 'error');
        }
    }

    // Hybrid Vote
    async function hybridVote(contractAddress, proposalID, voterAddress, optionIndex) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, HybridVoting.abi);

        const notificationId = addNotification('Casting hybrid vote...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.vote(proposalID, voterAddress, optionIndex);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.vote(proposalID, voterAddress, optionIndex, gasOptions);
            await tx.wait();
            console.log("Voted in hybrid voting");
            updateNotification(notificationId,'Hybrid vote cast successfully!', 'success');
        } catch (error) {
            console.error("Error voting in hybrid voting:", error);
            updateNotification(notificationId,'Error casting hybrid vote.', 'error');
        }
    }

    // Create Proposal for Election
    async function createProposalElection(
        contractAddress,proposalName,proposalDescription,proposalDuration,options,candidateAddresses,candidateNames,triggerSpendIndex = 0,receiverAddress = "0x0000000000000000000000000000000000000000",amount = "0",
        canSend = false,
        electionEnabled = true
    ) {
        if (!checkNetwork()) {
            return;
        }

        console.log("Creating proposal for election");

        //log all params 
        console.log("contractAddress",contractAddress);
        console.log("proposalName",proposalName);
        console.log("proposalDescription",proposalDescription);
        console.log("proposalDuration",proposalDuration);
        console.log("options",options);
        console.log("triggerSpendIndex",triggerSpendIndex);
        console.log("receiverAddress",receiverAddress);
        console.log("amount",amount);
        console.log("canSend",canSend);
        console.log("electionEnabled",electionEnabled);
        console.log("candidateAddresses",candidateAddresses);
        console.log("candidateNames",candidateNames);
        

        let tokenAddress = "0x0000000000000000000000000000000000001010";
        let amountConverted = ethers.utils.parseUnits(amount, 18);
        const contract = getContractInstance(contractAddress, DirectDemocracyVoting.abi);

        const notificationId = addNotification("Creating Election proposal...", "loading");

        try {
            // Estimate gas for the election proposal creation
            const gasEstimate = await contract.estimateGas.createProposal(
                proposalName,proposalDescription,proposalDuration,options,
                triggerSpendIndex,
                receiverAddress,
                amountConverted,
                canSend,
                tokenAddress,
                electionEnabled,
                candidateAddresses,
                candidateNames
            );

            const gasLimit = gasEstimate.mul(127).div(100); // Add a buffer for gas
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            // Send transaction to create the election proposal
            const tx = await contract.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,options,triggerSpendIndex,receiverAddress,
                amountConverted,
                canSend,
                tokenAddress,
                electionEnabled,
                candidateAddresses,
                candidateNames,
                gasOptions
            );

            // Wait for the transaction to complete
            await tx.wait();

            // Refetch the proposals to update UI
            refetch();
            console.log("Election proposal created");
            updateNotification(notificationId, "Election proposal created successfully!", "success");
        } catch (error) {
            console.error("Error creating election proposal:", error);
            updateNotification(notificationId, "Error creating Election proposal.", "error");
        }
    }


    // Create Proposal Direct Democracy Voting
    async function createProposalDDVoting(contractAddress, proposalName, proposalDescription, proposalDuration, options, triggerSpendIndex, receiverAddress, amount, canSend, electionEnabled = false,
        candidateAddresses = [],
        candidateNames = []) {
        if (!checkNetwork()) {
            return;
        }


        let tokenAddress = "0x0000000000000000000000000000000000001010";
        let amountConverted = ethers.utils.parseUnits(amount, 18);
        const contract = getContractInstance(contractAddress, DirectDemocracyVoting.abi);

        const notificationId = addNotification('Creating Direct Democracy proposal...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,
                options,
                triggerSpendIndex,
                receiverAddress,
                amountConverted,
                canSend,
                tokenAddress,
                electionEnabled,
                candidateAddresses,
                candidateNames
            );
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,
                options,
                triggerSpendIndex,
                receiverAddress,
                amountConverted,
                canSend,
                tokenAddress,
                electionEnabled,
                candidateAddresses,
                candidateNames,
                gasOptions
            );
            await tx.wait();

            refetch();
            console.log("DD proposal created");
            updateNotification(notificationId,'Direct Democracy proposal created successfully!', 'success');
        } catch (error) {
            console.error("Error creating DD proposal:", error);
            updateNotification(notificationId,'Error creating Direct Democracy proposal.', 'error');
        }
    }

    // DD Vote
    async function ddVote(contractAddress, proposalID, optionIndices, weights) {
        if (!checkNetwork()) {
            return;
        }

        const voterAddress = account;
        const contract = getContractInstance(contractAddress, DirectDemocracyVoting.abi);

        const notificationId = addNotification('Casting Direct Democracy vote...', 'loading');

        try {
           

            // Ensure the total weight is 100
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            if (totalWeight !== 100) {
                throw new Error("Total weight must sum to 100");
            }

            // Estimate gas
            const gasEstimate = await contract.estimateGas.vote(proposalID, voterAddress, optionIndices, weights);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            // Send vote transaction
            const tx = await contract.vote(proposalID, voterAddress, optionIndices, weights, gasOptions);
            await tx.wait();
            console.log("Voted in DD voting");
            updateNotification(notificationId,'Direct Democracy vote cast successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error voting in DD voting:", error);
            updateNotification(notificationId,'Error casting Direct Democracy vote.', 'error');
        }
    }

    // Get Winner DD Voting
    async function getWinnerDDVoting(contractAddress, proposalID) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, DirectDemocracyVoting.abi);

        const notificationId = addNotification('Announcing winner...', 'loading');

        try {
          

            const gasEstimate = await contract.estimateGas.announceWinner(proposalID);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.announceWinner(proposalID, gasOptions);
            await tx.wait();
            console.log("Winner announced");
            updateNotification(notificationId,'Winner announced successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error announcing winner:", error);
            updateNotification(notificationId,'Error announcing winner.', 'error');
        }
    }

    // Participation Voting - Create Proposal
    async function createProposalPtVoting(contractAddress, proposalName, proposalDescription, proposalDuration, options, triggerSpend, receiverAddress, amount, canSend) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, ParticipationVoting.abi);

        const notificationId = addNotification('Creating participation proposal...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,
                options,
                triggerSpend,
                receiverAddress,
                amount,
                canSend
            );
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.createProposal(
                proposalName,
                proposalDescription,
                proposalDuration,
                options,
                triggerSpend,
                receiverAddress,
                amount,
                canSend,
                gasOptions
            );
            await tx.wait();
            console.log("Participation proposal created");
            updateNotification(notificationId,'Participation proposal created successfully!', 'success');
        } catch (error) {
            console.error("Error creating participation proposal:", error);
            updateNotification(notificationId,'Error creating participation proposal.', 'error');
        }
    }

    // Participation Vote
    async function PtVote(contractAddress, proposalID, voterAddress, optionIndex) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, ParticipationVoting.abi);

        const notificationId = addNotification('Casting participation vote...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.vote(proposalID, voterAddress, optionIndex);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.vote(proposalID, voterAddress, optionIndex, gasOptions);
            await tx.wait();
            console.log("Voted in participation voting");
            updateNotification(notificationId,'Participation vote cast successfully!', 'success');
        } catch (error) {
            console.error("Error voting in participation voting:", error);
            updateNotification(notificationId,'Error casting participation vote.', 'error');
        }
    }

    // Task Manager - Create Project
    async function createProject(contractAddress, projectName) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, TaskManager.abi);

        const notificationId = addNotification('Creating project...', 'loading');

        try {
          

            const gasEstimate = await contract.estimateGas.createProject(projectName);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.createProject(projectName, gasOptions);
            await tx.wait();
            console.log("Project created");
            updateNotification(notificationId,'Project created successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error creating project:", error);
            updateNotification(notificationId,'Error creating project.', 'error');
        }
    }

    // Task Manager - Create Task
    async function createTask(contractAddress, payout, taskDescription, projectName, estHours, difficulty, taskLocation, taskName) {
        if (!checkNetwork()) {
            return;
        }
        let ipfsHash = await ipfsAddTask(taskName, taskDescription, taskLocation, difficulty, estHours, "");
        let ipfsHashString = ipfsHash.path;
        const contract = getContractInstance(contractAddress, TaskManager.abi);

        const notificationId = addNotification('Creating task...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.createTask(payout, ipfsHashString, projectName);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.createTask(payout, ipfsHashString, projectName, gasOptions);
            await tx.wait();
            console.log("Task created");
            console.log("tx", tx);
            updateNotification(notificationId,'Task created successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error creating task:", error);
            updateNotification(notificationId,'Error creating task.', 'error');
            throw error;
        }
    }

    // Task Manager - Claim Task
    async function claimTask(contractAddress, taskID) {
        if (!checkNetwork()) {
            return;
        }

        console.log("Claiming task with ID:", taskID);
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        const newTaskID = taskID.split("-")[0];
        const notificationId = addNotification('Claiming task...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.claimTask(newTaskID);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.claimTask(newTaskID, gasOptions);
            await tx.wait();
            console.log("Task claimed");
            updateNotification(notificationId,'Task claimed successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error claiming task:", error);
            updateNotification(notificationId,'Error claiming task.', 'error');
            throw error;
        }
    }

    // Task Manager - Complete Task
    async function completeTask(contractAddress, taskID) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        const newTaskID = taskID.split("-")[0];

        const notificationId = addNotification('Completing task...', 'loading');

        try {
          

            const gasEstimate = await contract.estimateGas.completeTask(newTaskID);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.completeTask(newTaskID, gasOptions);
            await tx.wait();
            console.log("Task completed");
            updateNotification(notificationId,'Task completed successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error completing task:", error);
            updateNotification(notificationId,'Error completing task.', 'error');
            throw error;
        }
    }

    // Task Manager - Update Task
    async function updateTask(contractAddress, taskID, payout, ipfsHash) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        const newTaskID = taskID.split("-")[0];

        const notificationId = addNotification('Updating task...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.updateTask(newTaskID, payout, ipfsHash);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.updateTask(newTaskID, payout, ipfsHash, gasOptions);
            await tx.wait();
            console.log("Task updated");
            updateNotification(notificationId,'Task updated successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error updating task:", error);
            updateNotification(notificationId,'Error updating task.', 'error');
            throw error;
        }
    }

    // Task Manager - Submit Task
    async function submitTask(contractAddress, taskID, ipfsHash) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        const newTaskID = taskID.split("-")[0];

        const notificationId = addNotification('Submitting task...', 'loading');

        try {
          

            const gasEstimate = await contract.estimateGas.submitTask(newTaskID, ipfsHash);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.submitTask(newTaskID, ipfsHash, gasOptions);
            await tx.wait();
            console.log("Task submitted");
            updateNotification(notificationId,'Task submitted successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error submitting task:", error);
            updateNotification(notificationId,'Error submitting task.', 'error');
            throw error;
        }
    }

    // Task Manager - Edit Task
    async function editTaskWeb3(contractAddress, payout, taskDescription, projectName, estHours, difficulty, taskLocation, taskName, taskID) {
        if (!checkNetwork()) {
            return;
        }
        let ipfsHash = await ipfsAddTask(taskName, taskDescription, taskLocation, difficulty, estHours, "");
        let ipfsHashString = ipfsHash.path;
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        let newTaskID = taskID.split("-")[0];

        const notificationId = addNotification('Editing task...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.updateTask(newTaskID, payout, ipfsHashString);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.updateTask(newTaskID, payout, ipfsHashString, gasOptions);
            await tx.wait();
            console.log("Task edited");
            updateNotification(notificationId,'Task edited successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error editing task:", error);
            updateNotification(notificationId,'Error editing task.', 'error');
            throw error;
        }
    }

    // Task Manager - Delete Project
    async function deleteProject(contractAddress, projectName) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        const notificationId = addNotification('Deleting project...', 'loading');
        try {
            const gasEstimate = await contract.estimateGas.deleteProject(projectName);
            const gasLimit = gasEstimate.mul(133).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };
            const tx = await contract.deleteProject(projectName, gasOptions);
            await tx.wait();
            console.log("Project deleted");
            updateNotification(notificationId,'Project deleted successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error deleting project:", error);
            updateNotification(notificationId,'Error deleting project.', 'error');
        }
    }

    // Task Manager - Delete Task
    async function deleteTaskWeb3(contractAddress, taskID) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, TaskManager.abi);
        const newTaskID = taskID.split("-")[0];
        const notificationId = addNotification('Deleting task...', 'loading');
        try {
            const gasEstimate = await contract.estimateGas.updateTask(newTaskID, 0,"x");
            const gasLimit = gasEstimate.mul(133).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };
            const tx = await contract.updateTask(newTaskID, 0, "x", gasOptions);
            await tx.wait();
            console.log("Task deleted");
            updateNotification(notificationId,'Task deleted successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error deleting task:", error);
            updateNotification(notificationId,'Error deleting task.', 'error');
            throw error;
        }
    }

    // NFT Membership - Check Executive
    async function checkIsExecutive(contractAddress, userAddress) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, NFTMembership.abi);

        
        try {

            const isExec = await contract.checkIsExecutive(userAddress);
            console.log(`Is ${userAddress} an executive?`, isExec);
           
            return isExec;
        } catch (error) {
            console.error("Error checking executive status:", error);
            
            return false;
        }
    }

    // NFT Membership - Mint NFT
    async function mintNFT(contractAddress, membershipType) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, NFTMembership.abi);
        const notificationId = addNotification('Minting NFT...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.mintNFT(account, membershipType);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.mintNFT(account, membershipType, gasOptions);
            await tx.wait();
            console.log("NFT minted");
            updateNotification(notificationId,'NFT minted successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error minting NFT:", error);
            updateNotification(notificationId,'Error minting NFT.', 'error');
        }
    }

    // NFT Membership - Mint Default NFT
    async function mintDefaultNFT(contractAddress) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, NFTMembership.abi);

        const notificationId = addNotification('Minting default NFT...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.mintDefaultNFT();
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.mintDefaultNFT(gasOptions);
            await tx.wait();
            console.log("Default NFT minted");
            updateNotification(notificationId,'Default NFT minted successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error minting default NFT:", error);
            updateNotification(notificationId,'Error minting default NFT.', 'error');
        }
    }

    // NFT Membership - Update NFT
    async function updateNFT(contractAddress, userAddress, membershipType) {
        const contract = getContractInstance(contractAddress, NFTMembership.abi);

        const notificationId = addNotification('Updating NFT...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.changeMembershipType(userAddress, membershipType);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.changeMembershipType(userAddress, membershipType, gasOptions);
            await tx.wait();
            console.log("NFT updated");
            updateNotification(notificationId,'NFT updated successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error updating NFT:", error);
            updateNotification(notificationId,'Error updating NFT.', 'error');
        }
    }

    // NFT Membership - Set Image URL
    async function setImageURL(contractAddress, memberTypeName, imageURL) {
        const contract = getContractInstance(contractAddress, NFTMembership.abi);

        const notificationId = addNotification('Setting image URL...', 'loading');

        try {
           

            const gasEstimate = await contract.estimateGas.setMemberTypeImage(memberTypeName, imageURL);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.setMemberTypeImage(memberTypeName, imageURL, gasOptions);
            await tx.wait();
            console.log("Image URL updated");
            updateNotification(notificationId,'Image URL updated successfully!', 'success');
        } catch (error) {
            console.error("Error setting image URL:", error);
            updateNotification(notificationId,'Error setting image URL.', 'error');
        }
    }

    // Treasury - Transfer Funds
    async function transferFunds(contractAddress, tokenAddress, amount) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, Treasury.abi);

        const notificationId = addNotification('Transferring funds...', 'loading');


        try {
           

            const gasEstimate = await contract.estimateGas.receiveTokens(tokenAddress, amount);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.receiveTokens(tokenAddress, amount, gasOptions);
            await tx.wait();
            console.log("Funds transferred");
            updateNotification(notificationId,'Funds transferred successfully!', 'success');
        } catch (error) {
            console.error("Error transferring funds:", error);
            updateNotification(notificationId,'Error transferring funds.', 'error');
        }
    }

    // Treasury - Send to Treasury
    async function sendToTreasury(contractAddress, tokenAddress, amount) {
        const notificationId = addNotification('Sending tokens to treasury...', 'loading');
        try {
            const contract = getContractInstance(contractAddress, Treasury.abi);
          

            const gasEstimate = await contract.estimateGas.receiveTokens(tokenAddress, account, amount);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: ethers.utils.hexlify(20000000), // Adjust the gas limit as needed
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.receiveTokens(tokenAddress, account, amount, gasOptions);
            await tx.wait();
            console.log("Tokens sent to treasury");
            updateNotification(notificationId,'Tokens sent to treasury successfully!', 'success');
        } catch (error) {
            console.error("Error sending tokens to treasury:", error);
            updateNotification(notificationId,'Error sending tokens to treasury.', 'error');
        }
    }

    // Direct Democracy Token - Mint Tokens
    async function mintDDtokens(contractAddress) {
        if (!checkNetwork()) {
            return;
        }
        const contract = getContractInstance(contractAddress, DirectDemocracyToken.abi);

        const notificationId = addNotification('Minting tokens...', 'loading');

        try {
            const gasEstimate = await contract.estimateGas.mint();
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.mint(gasOptions);
            await tx.wait();
            console.log("Tokens minted");
            updateNotification(notificationId,'Tokens minted successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error minting tokens:", error);
            updateNotification(notificationId,'Error minting tokens.', 'error');
        }
    }

    // Quick Join - No User
    async function quickJoinNoUser(contractAddress, username) {
        console.log("Username being passed:", username);
        console.log("Contract address:", contractAddress);

        if (!checkNetwork()) {
            return;
        }

        const notificationId = addNotification('Joining without user...', 'loading');

        try {
            const contract = getContractInstance(contractAddress, QuickJoin.abi);

          

            const gasEstimate = await contract.estimateGas.quickJoinNoUser(username);
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.quickJoinNoUser(username, gasOptions);

            console.log("Transaction sent:", tx.hash);

            const receipt = await tx.wait();

            console.log("Transaction mined:", receipt.transactionHash);
            console.log("User joined successfully with username:", username);
            updateNotification(notificationId,'User joined successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error during quickJoinNoUser:", error);
            updateNotification(notificationId,'Error joining user.', 'error');

            if (error.reason) {
                console.error("Revert reason:", error.reason);
            } else if (error.error && error.error.reason) {
                console.error("Revert reason:", error.error.reason);
            } else if (error.data) {
                const iface = new ethers.utils.Interface(QuickJoin.abi);
                try {
                    const decodedError = iface.parseError(error.data);
                    console.error("Decoded error:", decodedError);
                } catch (parseError) {
                    console.error("Error parsing revert reason:", parseError);
                }
            } else {
                console.error("Error message:", error.message);
            }
        }
    }

    // Quick Join - With User
    async function quickJoinWithUser(contractAddress) {
        if (!checkNetwork()) {
            return;
        }

        const notificationId = addNotification('Joining with existing user...', 'loading');

        try {
            const contract = getContractInstance(contractAddress, QuickJoin.abi);

          

            const gasEstimate = await contract.estimateGas.quickJoinWithUser();
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.quickJoinWithUser(gasOptions);
            await tx.wait();
            console.log("User joined with existing username");
            updateNotification(notificationId,'User joined successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error joining with existing username:", error);
            updateNotification(notificationId,'Error joining user.', 'error');
        }
    }

    // Education Hub - Create Education Module
    async function createEduModule(contractAddress, moduleTitle, moduleDescription, moduleLink, moduleQuestion, payout, answers, correctAnswer) {
        if (!checkNetwork()) {
            return;
        }

        const contract = getContractInstance(contractAddress, EducationHub.abi);

        const data = {
            title: moduleTitle,
            description: moduleDescription,
            link: moduleLink,
            question: moduleQuestion,
            answers: answers,
        };

        const ipfsHash = await addToIpfs(JSON.stringify(data));

        let correctAnswerIndex = answers.indexOf(correctAnswer);

        const notificationId = addNotification('Creating education module...', 'loading');

        try {
          

            const gasEstimate = await contract.estimateGas.createModule(
                moduleTitle,
                ipfsHash.path,
                payout,
                correctAnswerIndex
            );
            const gasLimit = gasEstimate.mul(127).div(100);
            const gasOptions = {
                gasLimit: gasLimit,
                gasPrice: GAS_PRICE,
            };

            const tx = await contract.createModule(
                moduleTitle,
                ipfsHash.path,
                payout,
                correctAnswerIndex,
                gasOptions
            );
            await tx.wait();
            console.log("Module created");
            updateNotification(notificationId,'Education module created successfully!', 'success');
            refetch();
        } catch (error) {
            console.error("Error creating education module:", error);
            updateNotification(notificationId,'Error creating education module.', 'error');
        }
    }

    // Education Hub - Complete Module
    async function completeModule(contractAddress, moduleId, answer) {
        const contract = getContractInstance(contractAddress, EducationHub.abi);

        const [actualModuleId, address] = moduleId.split('-');

        if (!actualModuleId) {
            console.error(`Invalid moduleId: ${moduleId}`);
            updateNotification(notificationId,'Invalid module ID.', 'error');
            return false;
        }

        const notificationId = addNotification('Completing module...', 'loading');

        try {
          

            console.log(`Completing module ${actualModuleId} with answer ${answer}`);
            const gasEstimate = await contract.estimateGas.completeModule(actualModuleId, answer);
            const gasLimit = gasEstimate.mul(127).div(100); // Add a buffer for gas limit

            const tx = await contract.completeModule(actualModuleId, answer, {
                gasLimit,
                gasPrice: GAS_PRICE,
            });
            await tx.wait();
            console.log(`Module ${actualModuleId} completed by user.`);
            updateNotification(notificationId,'Module completed successfully!', 'success');
            refetch();
            return true;
        } catch (error) {
            console.error(`Error completing module ${moduleId}:`, error);
            updateNotification(notificationId,'Error completing module.', 'error');
            return false;
        }
    }

    // Treasury - Transfer Funds (Already Included Above)

    // Direct Democracy Token - Mint Tokens (Already Included Above)

    // IPFS Add Task
    async function ipfsAddTask(taskName, taskDescription, taskLocation, difficulty, estHours, submission) {
        const data = {
            name: taskName,
            description: taskDescription,
            location: taskLocation,
            difficulty: difficulty,
            estHours: estHours,
            submission: submission,
        };
        const json = JSON.stringify(data);
        const ipfsHash = await addToIpfs(json);

        return ipfsHash;
    }

    return (
        <Web3Context.Provider value={{
            address,
            chainId,
            quickJoinNoUser,
            quickJoinWithUser,
            sendToTreasury,
            changeUsername,
            submitTask,
            editTaskWeb3,
            signer,
            isNetworkModalOpen,
            closeNetworkModal,
            mintDDtokens,
            mintDefaultNFT,
            mintNFT,
            setAccount,
            ddVote,
            getWinnerDDVoting,
            completeTask,
            ipfsAddTask,
            createTask,
            createProject,
            claimTask,
            updateTask,
            createProposalDDVoting,
            createNewUser,
            createEduModule,
            checkIsExecutive,
            updateNFT,
            createProposalParticipationVoting,
            completeModule,
            transferFunds,
            setImageURL,
            checkIsExecutive,
            mintDefaultNFT,
            mintDDtokens,
            mintNFT,
            sendToTreasury,
            createProposalElection,
            deleteProject,
            deleteTaskWeb3
        }}>
            {children}
        </Web3Context.Provider>
    );
};
