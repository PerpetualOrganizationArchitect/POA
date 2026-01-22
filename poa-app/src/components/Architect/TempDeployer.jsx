import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Spinner,
  useToast,
  Text,
} from "@chakra-ui/react";

import { main } from "../../../scripts/newDeployment";

function Deployer({ isOpen, onClose, deploymentDetails, signer }) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [deployError, setDeployError] = useState(null);
  const [deployResult, setDeployResult] = useState(null);
  const deployingRef = React.useRef(false); // Prevent double-execution in React Strict Mode
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const deploy = async () => {
      if (!deploymentDetails || !signer) {
        console.error("Missing deployment details or signer");
        return;
      }

      // Prevent double-execution (React Strict Mode runs effects twice)
      if (deployingRef.current) {
        console.log("Deployment already in progress, skipping...");
        return;
      }
      deployingRef.current = true;

      console.log("Deploying...");
      console.log("Deployment details:", deploymentDetails);

      setIsDeploying(true);
      setDeployError(null);

      try {
        const result = await main(
          deploymentDetails.membershipTypeNames,
          deploymentDetails.executiveRoleNames || deploymentDetails.membershipTypeNames,
          deploymentDetails.POname,
          deploymentDetails.quadraticVotingEnabled,
          deploymentDetails.democracyVoteWeight,
          deploymentDetails.participationVoteWeight,
          deploymentDetails.hybridVotingEnabled,
          deploymentDetails.participationVotingEnabled,
          deploymentDetails.electionHubEnabled || false,
          deploymentDetails.educationHubEnabled || false,
          deploymentDetails.logoURL,
          deploymentDetails.infoIPFSHash,
          deploymentDetails.votingControlType,
          deploymentDetails.directDemocracyQuorum || 50,
          deploymentDetails.hybridVoteQuorum || deploymentDetails.participationVoteQuorum || 50,
          deploymentDetails.username || "",
          signer
        );

        console.log("Deployment result:", result);
        setDeployResult(result);
        setIsDeployed(true);

        toast({
          title: "Deployment successful!",
          description: "Your organization has been created on the Hoodi network.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Deployment error:", error);
        setDeployError(error.message || "Unknown error occurred");

        toast({
          title: "Deployment failed.",
          description: error.message || "There was an error during the deployment process.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setIsDeploying(false);
      }
    };

    if (isOpen && !isDeploying && !isDeployed) {
      deploy();
    }
  }, [isOpen, deploymentDetails, signer, isDeploying, isDeployed, toast]);

  const handleAccessOrganization = () => {
    const formattedOrgName = encodeURIComponent(
      deploymentDetails.POname.trim().replace(/\s+/g, "-")
    );
    router.push(`/home/?userDAO=${formattedOrgName}`);
  };

  const handleClose = () => {
    // Reset state when closing
    setIsDeployed(false);
    setIsDeploying(false);
    setDeployError(null);
    setDeployResult(null);
    deployingRef.current = false; // Reset ref for next deployment
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Deploying Your Organization</ModalHeader>
        <ModalBody>
          {isDeploying ? (
            <>
              <Spinner size="xl" />
              <Text mt={4}>
                Deploying your organization to Hoodi testnet...
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                This may take a few minutes. Please do not close this window.
              </Text>
            </>
          ) : isDeployed ? (
            <>
              <Text color="green.500" fontWeight="bold">
                Deployment successful!
              </Text>
              <Text mt={2}>
                Your organization "{deploymentDetails.POname}" has been created.
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                You can now access your organization and start managing it.
              </Text>
            </>
          ) : deployError ? (
            <>
              <Text color="red.500" fontWeight="bold">
                Deployment failed
              </Text>
              <Text mt={2}>{deployError}</Text>
            </>
          ) : (
            <Text>Preparing deployment...</Text>
          )}
        </ModalBody>
        <ModalFooter>
          {isDeployed && (
            <Button colorScheme="blue" onClick={handleAccessOrganization}>
              Access Organization
            </Button>
          )}
          <Button colorScheme="gray" ml={3} onClick={handleClose} isDisabled={isDeploying}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default Deployer;
