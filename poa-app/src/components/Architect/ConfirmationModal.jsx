import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  VStack,
  Text,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit"; // Import ConnectButton
import { useGraphContext } from "@/context/graphContext";

const ConfirmationModal = ({
  isOpen,
  orgDetails,
  onClose,
  onStartOver,
  onSave,
  wallet,
}) => {
  console.log("wallet", wallet);
  const connected = wallet ? true : false;
  console.log("connected", connected);
  const [display, setDisplay] = useState(connected);
  console.log("display", display);

  useEffect(() => {
    if(wallet) {
      setDisplay(true);
    }
  }, [wallet]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Your Selections</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={4}>
            <Text>
              <strong>Name:</strong> {orgDetails.POname}
            </Text>
            <Text>
              <strong>Description:</strong> {orgDetails.description}
            </Text>
            <Text>
              <strong>Membership Types:</strong>{" "}
              {orgDetails.membershipTypeNames.join(", ")}
            </Text>
            <Text>
              <strong>Voting Control Type:</strong>{" "}
              {orgDetails.votingControlType}
            </Text>
            <Text>
              <strong>Quadratic Voting Enabled:</strong>{" "}
              {orgDetails.quadraticVotingEnabled ? "Yes" : "No"}
            </Text>
            <Text>
              <strong>Democracy Vote Weight:</strong>{" "}
              {orgDetails.democracyVoteWeight}
            </Text>
            <Text>
              <strong>Participation Vote Weight:</strong>{" "}
              {orgDetails.participationVoteWeight}
            </Text>
            <Text>
              <strong>Hybrid Voting Enabled:</strong>{" "}
              {orgDetails.hybridVotingEnabled ? "Yes" : "No"}
            </Text>
            <Text>
              <strong>Participation Voting Enabled:</strong>{" "}
              {orgDetails.participationVotingEnabled ? "Yes" : "No"}
            </Text>
            <Text>
              <strong>Logo URL:</strong>{" "}
              {orgDetails.logoURL || "No logo uploaded"}
            </Text>
            <Text>
              <strong>Direct Democracy Quorum:</strong>{" "}
              {orgDetails.directDemocracyQuorum}%
            </Text>
            {orgDetails.hybridVotingEnabled && (
              <Text>
                <strong>Hybrid Voting Quorum:</strong>{" "}
                {orgDetails.hybridVoteQuorum}%
              </Text>
            )}
            {orgDetails.participationVotingEnabled && (
              <Text>
                <strong>Participation Voting Quorum:</strong>{" "}
                {orgDetails.participationVoteQuorum}%
              </Text>
            )}
            <Text>
              <strong>Info IPFS Hash:</strong> {orgDetails.infoIPFSHash}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onStartOver}>
            Start Over
          </Button>

          {/* If wallet is connected, show confirm button */}
          {display ? (
            <Button colorScheme="blue" onClick={onSave}>
              Confirm
            </Button>
          ) : (
            /* If wallet is not connected, show connect button */
            <ConnectButton />
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
