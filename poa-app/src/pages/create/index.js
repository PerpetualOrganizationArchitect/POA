import React, { useState, useMemo } from "react";
import {
  Box,
  useToast,
  Button,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useBreakpointValue,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useQuery } from "@apollo/client";
import LogoDropzoneModal from "@/components/Architect/LogoDropzoneModal";
import LinksModal from "@/components/Architect/LinksModal";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/components/ProviderConverter";
import { useIPFScontext } from "@/context/ipfsContext";
import { main } from "../../../scripts/newDeployment";
import { useRouter } from "next/router";
import { FETCH_INFRASTRUCTURE_ADDRESSES } from "@/util/queries";
import { ipfsCidToBytes32 } from "@/services/web3/utils/encoding";

// New deployer imports
import {
  DeployerProvider,
  useDeployer,
  DeployerWizard,
  mapStateToDeploymentParams,
} from "@/features/deployer";
import { resolveRoleUsernames } from "@/features/deployer/utils/usernameResolver";

/**
 * Inner component that has access to DeployerContext
 */
function DeployerPageContent() {
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { addToIpfs } = useIPFScontext();
  const toast = useToast();
  const router = useRouter();
  const { state, actions } = useDeployer();

  // Fetch infrastructure addresses from subgraph
  const { data: infraData, loading: infraLoading, error: infraError } = useQuery(FETCH_INFRASTRUCTURE_ADDRESSES, {
    fetchPolicy: 'network-only',
  });

  // Debug logging for infrastructure addresses
  console.log('Infrastructure query:', { loading: infraLoading, error: infraError, data: infraData });

  // Extract addresses from subgraph data
  const infrastructureAddresses = useMemo(() => {
    const poaManager = infraData?.poaManagerContracts?.[0];

    // Infrastructure PROXY addresses (from PoaManager - these are what you actually call)
    const orgDeployerAddress = poaManager?.orgDeployerProxy || null;
    const orgRegistryProxy = poaManager?.orgRegistryProxy || null;
    const paymasterHubProxy = poaManager?.paymasterHubProxy || null;
    const globalAccountRegistryProxy = poaManager?.globalAccountRegistryProxy || null;

    // Use globalAccountRegistryProxy as registryAddress (this is the UniversalAccountRegistry)
    const registryAddress = globalAccountRegistryProxy;
    const poaManagerAddress = poaManager?.id || null;
    const orgRegistryAddress = orgRegistryProxy;

    // Helper to find beacon by type name (beacons are for org-level contract implementations)
    const findBeacon = (typeName) => {
      const beacon = infraData?.beacons?.find(b => b.typeName === typeName);
      return beacon?.beaconAddress || null;
    };

    // Extract beacon addresses (for reference - not typically called directly)
    const taskManagerBeacon = findBeacon('TaskManager');
    const hybridVotingBeacon = findBeacon('HybridVoting');
    const directDemocracyVotingBeacon = findBeacon('DirectDemocracyVoting');
    const educationHubBeacon = findBeacon('EducationHub');
    const participationTokenBeacon = findBeacon('ParticipationToken');
    const quickJoinBeacon = findBeacon('QuickJoin');
    const executorBeacon = findBeacon('Executor');
    const paymentManagerBeacon = findBeacon('PaymentManager');
    const eligibilityModuleBeacon = findBeacon('EligibilityModule');
    const toggleModuleBeacon = findBeacon('ToggleModule');

    return {
      // Core contracts
      registryAddress,
      poaManagerAddress,
      orgRegistryAddress,
      // Infrastructure proxies (the actual contracts to interact with)
      orgDeployerAddress,
      orgRegistryProxy,
      paymasterHubProxy,
      globalAccountRegistryProxy,
      // Beacons (for reference)
      taskManagerBeacon,
      hybridVotingBeacon,
      directDemocracyVotingBeacon,
      educationHubBeacon,
      participationTokenBeacon,
      quickJoinBeacon,
      executorBeacon,
      paymentManagerBeacon,
      eligibilityModuleBeacon,
      toggleModuleBeacon,
    };
  }, [infraData]);

  // Modal states
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Responsive values
  const exitButtonTop = useBreakpointValue({ base: "8px", lg: "8px", xl: "12px" });
  const exitButtonRight = useBreakpointValue({ base: "10px", lg: "16px", xl: "25px" });
  const exitButtonSize = useBreakpointValue({ base: "md", lg: "md", xl: "lg" });

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleExitConfirm = () => {
    setIsExitModalOpen(false);
    router.push("/landing");
  };

  const handleExitCancel = () => {
    setIsExitModalOpen(false);
  };

  // Handle deployment from DeployerWizard
  const handleDeployStart = async (config) => {
    setIsDeploying(true);

    // Extract deployer username from config (validated by ReviewStep)
    const deployerUsername = config?.deployerUsername || state.organization.username || '';
    console.log('[DEPLOY] Using deployer username:', deployerUsername);

    try {
      // Resolve all usernames to addresses before deployment
      const rolesWithResolvedAddresses = await resolveRoleUsernames(state.roles);

      // Upload description and links to IPFS first
      const links = state.organization.links || [];
      const jsonData = {
        description: state.organization.description || '',
        links: links.map((link) => ({
          name: link.name,
          url: link.url,
        })),
        template: state.organization.template || 'default',
      };

      console.log('[DEPLOY] Preparing IPFS metadata:', jsonData);

      let infoIPFSHash = state.organization.infoIPFSHash;
      if (!infoIPFSHash) {
        console.log('[DEPLOY] No existing IPFS hash, uploading new metadata...');
        const result = await addToIpfs(JSON.stringify(jsonData));
        infoIPFSHash = result.path;
        console.log('[DEPLOY] IPFS upload complete. CID:', infoIPFSHash);
        console.log('[DEPLOY] Verify content at: https://api.thegraph.com/ipfs/api/v0/cat?arg=' + infoIPFSHash);
        actions.setIPFSHash(infoIPFSHash);
      } else {
        console.log('[DEPLOY] Using existing IPFS hash:', infoIPFSHash);
      }

      console.log('[DEPLOY] Final infoIPFSHash for deployment:', infoIPFSHash);

      // Upload role metadata to IPFS for roles with descriptions
      // Note: Role names are stored on-chain and indexed directly, not via IPFS
      console.log('[DEPLOY] Uploading role metadata to IPFS...');
      const rolesWithMetadata = await Promise.all(
        rolesWithResolvedAddresses.map(async (role) => {
          // Only upload metadata if role has a description
          if (role.description && role.description.trim()) {
            const roleMetadata = {
              description: role.description,
              image: role.image || '',
            };
            console.log(`[DEPLOY] Uploading metadata for role "${role.name}":`, roleMetadata);

            try {
              const result = await addToIpfs(JSON.stringify(roleMetadata));
              const metadataCID = result.path;
              console.log(`[DEPLOY] Role "${role.name}" metadata CID:`, metadataCID);

              // Convert IPFS CID to bytes32 for the smart contract
              const metadataCIDBytes32 = ipfsCidToBytes32(metadataCID);
              console.log(`[DEPLOY] Role "${role.name}" metadataCID (bytes32):`, metadataCIDBytes32);

              return {
                ...role,
                metadataCID: metadataCIDBytes32,
              };
            } catch (error) {
              console.error(`[DEPLOY] Failed to upload metadata for role "${role.name}":`, error);
              // Continue without metadata if upload fails
              return role;
            }
          }
          return role;
        })
      );

      // Get deployment params with resolved addresses and metadata
      const stateWithResolvedRoles = {
        ...state,
        roles: rolesWithMetadata,
      };

      console.log('=== DEPLOYMENT DEBUG ===');
      console.log('Infrastructure addresses:', infrastructureAddresses);

      const deployParams = mapStateToDeploymentParams(stateWithResolvedRoles, address, infrastructureAddresses);

      console.log('Deployment params:', deployParams);
      console.log('Deploying with params:', deployParams);

      // Check if any role has additionalWearers
      const hasAdditionalWearers = deployParams.roles.some(
        role => role.distribution.additionalWearers && role.distribution.additionalWearers.length > 0
      );
      console.log('Has additional wearers:', hasAdditionalWearers);

      console.log('Roles structure:');
      deployParams.roles.forEach((role, idx) => {
        console.log(`  Role [${idx}] ${role.name}:`, {
          canVote: role.canVote,
          vouching: role.vouching,
          defaults: role.defaults,
          hierarchy: {
            adminRoleIndex: role.hierarchy.adminRoleIndex?.toString?.() || role.hierarchy.adminRoleIndex
          },
          distribution: {
            mintToDeployer: role.distribution.mintToDeployer,
            mintToExecutor: role.distribution.mintToExecutor,
            additionalWearers: role.distribution.additionalWearers,
          },
          hatConfig: role.hatConfig,
        });
      });

      // Call the deployment function
      // Note: The existing `main` function signature may need to be updated
      // to accept the new params format. For now, mapping to existing format:
      const membershipTypeNames = state.roles.map(r => r.name);
      const executiveRoleNames = state.roles
        .filter(r => r.hierarchy.adminRoleIndex === null)
        .map(r => r.name);

      const hasQuadratic = state.voting.classes.some(c => c.quadratic);
      const hybridVotingEnabled = state.voting.classes.length > 1;

      // Only pass customRoles if there are additionalWearers to assign
      // This preserves original behavior when no usernames are added
      const customRoles = hasAdditionalWearers ? deployParams.roles : null;
      console.log('Passing customRoles:', customRoles !== null);

      await main(
        membershipTypeNames,
        executiveRoleNames,
        state.organization.name,
        hasQuadratic,
        50, // democracyVoteWeight - will be replaced by voting classes
        50, // participationVoteWeight
        hybridVotingEnabled,
        !hybridVotingEnabled, // participationVotingEnabled
        state.features.electionHubEnabled,
        state.features.educationHubEnabled,
        state.organization.logoURL,
        infoIPFSHash,
        'DirectDemocracy', // votingControlType
        state.voting.ddQuorum,
        state.voting.hybridQuorum,
        deployerUsername,
        signer,
        customRoles,  // Only pass custom roles if there are additionalWearers
        infrastructureAddresses  // Addresses fetched from subgraph
      );

      // Return success - let DeployerWizard handle the celebration
      return { success: true, orgName: state.organization.name };

    } catch (error) {
      console.error("Error deploying organization:", error);
      toast({
        title: "Deployment failed",
        description: error.message || "There was an error during deployment.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      throw error; // Re-throw so DeployerWizard knows it failed
    } finally {
      setIsDeploying(false);
    }
  };

  // Handle navigation after deployment celebration
  const handleDeploySuccess = () => {
    // Delay redirect to allow subgraph indexing
    setTimeout(() => {
      router.push(`/profileHub?userDAO=${encodeURIComponent(state.organization.name)}`);
    }, 2000);
  };

  // Handlers for modals that OrganizationStep needs
  const handleSaveLogo = (ipfsUrl) => {
    actions.setLogoURL(ipfsUrl);
    setIsLogoModalOpen(false);
  };

  const handleSaveLinks = (links) => {
    actions.updateOrganization({ links });
    setIsLinksModalOpen(false);
  };

  return (
    <Box height="100vh" overflow="hidden" position="relative">
      {/* Beta Badge */}
      <Box
        position="absolute"
        top="14px"
        left="14px"
        display={["none", "none", "block"]}
        bg="coral.500"
        color="white"
        fontSize="12px"
        w="120px"
        px={3}
        py={2}
        borderRadius="md"
        fontWeight="500"
        zIndex={2}
        textAlign="center"
      >
        Beta on Hoodi
      </Box>

      {/* Exit Button */}
      <Box position="absolute" top={exitButtonTop} right={exitButtonRight} zIndex={10}>
        <IconButton
          onClick={handleExitClick}
          bg="warmGray.100"
          _hover={{ bg: "warmGray.200" }}
          aria-label="Exit"
          icon={<CloseIcon color="warmGray.600" />}
          size={exitButtonSize}
          isRound
        />
      </Box>

      {/* Full Width Deployer Wizard */}
      <Box
        width="100%"
        height="100%"
        overflowY="auto"
      >
        <DeployerWizard
          onDeployStart={handleDeployStart}
          onDeploySuccess={handleDeploySuccess}
          deployerAddress={address}
        />
      </Box>

      {/* Modals */}
      <LogoDropzoneModal
        isOpen={isLogoModalOpen}
        onSave={handleSaveLogo}
        onClose={() => setIsLogoModalOpen(false)}
      />
      <LinksModal
        isOpen={isLinksModalOpen}
        onSave={handleSaveLinks}
        onClose={() => setIsLinksModalOpen(false)}
      />

      {/* Exit Confirmation Modal */}
      <Modal isOpen={isExitModalOpen} onClose={handleExitCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Are you sure?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            All progress will be lost. Do you really want to stop creating your organization?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleExitConfirm}>
              Yes, Exit
            </Button>
            <Button variant="ghost" onClick={handleExitCancel}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Deployment overlay is now handled by ReviewStep for a better UX */}
    </Box>
  );
}

/**
 * Main page component that wraps content with DeployerProvider
 */
const ArchitectPage = () => {
  return (
    <DeployerProvider>
      <DeployerPageContent />
    </DeployerProvider>
  );
};

export default ArchitectPage;
