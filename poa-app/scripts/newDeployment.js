import OrgDeployer from "../abi/OrgDeployerNew.json";
import { ethers } from "ethers";
import bs58 from "bs58";

/**
 * Convert IPFS CIDv0 to bytes32 sha256 digest
 * CIDv0 = base58( 0x1220 + sha256_digest )
 * We decode and strip the 0x1220 prefix to get the 32-byte digest
 */
function cidToBytes32(cid) {
  console.log("[CID->BYTES32] Input CID:", cid);
  console.log("[CID->BYTES32] CID type:", typeof cid);
  console.log("[CID->BYTES32] CID length:", cid?.length);

  if (!cid || cid.length === 0) {
    console.log("[CID->BYTES32] Empty CID, returning zero hash");
    return ethers.constants.HashZero;
  }

  try {
    // Decode base58 CID to bytes
    console.log("[CID->BYTES32] Decoding base58...");
    const decoded = bs58.decode(cid);
    console.log("[CID->BYTES32] Decoded bytes length:", decoded.length);
    console.log("[CID->BYTES32] First 4 bytes:", Array.from(decoded.slice(0, 4)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));

    // CIDv0 should be 34 bytes: 2-byte prefix (0x1220) + 32-byte sha256
    if (decoded.length !== 34) {
      console.warn(`[CID->BYTES32] CID has unexpected length: ${decoded.length}, expected 34`);
      return ethers.constants.HashZero;
    }

    // Verify multihash prefix (0x12 = sha256, 0x20 = 32 bytes)
    if (decoded[0] !== 0x12 || decoded[1] !== 0x20) {
      console.warn(`[CID->BYTES32] CID has unexpected prefix: 0x${decoded[0].toString(16)}${decoded[1].toString(16)}`);
      return ethers.constants.HashZero;
    }

    // Extract the 32-byte sha256 digest (skip 2-byte prefix)
    const sha256Digest = decoded.slice(2);
    const bytes32Hex = "0x" + Buffer.from(sha256Digest).toString("hex");

    console.log("[CID->BYTES32] Conversion successful!");
    console.log("[CID->BYTES32] SHA256 digest (bytes32):", bytes32Hex);
    console.log("[CID->BYTES32] This bytes32 should be stored in contract");

    // Convert to hex string with 0x prefix
    return bytes32Hex;
  } catch (error) {
    console.error("[CID->BYTES32] Failed to decode CID:", error);
    return ethers.constants.HashZero;
  }
}

/**
 * Deploy a new organization
 * @param {Array<string>} memberTypeNames - Names of member types/roles
 * @param {Array<string>} executivePermissionNames - Names of executive roles
 * @param {string} POname - Organization name
 * @param {boolean} quadraticVotingEnabled - Enable quadratic voting
 * @param {number} democracyVoteWeight - Direct democracy weight percentage
 * @param {number} participationVoteWeight - Participation token weight percentage
 * @param {boolean} hybridVotingEnabled - Enable hybrid voting
 * @param {boolean} participationVotingEnabled - Enable participation voting
 * @param {boolean} electionEnabled - Enable elections
 * @param {boolean} educationHubEnabled - Enable education hub
 * @param {string} logoURL - Logo URL (IPFS)
 * @param {string} infoIPFSHash - IPFS hash for org metadata
 * @param {string} votingControlType - Voting control type
 * @param {number} quorumPercentageDD - Direct democracy quorum percentage
 * @param {number} quorumPercentagePV - Participation voting quorum percentage
 * @param {string} username - Deployer username
 * @param {Object} wallet - Ethers signer/wallet
 * @param {Array|null} customRoles - Optional pre-configured roles
 * @param {Object} infrastructureAddresses - Addresses fetched from subgraph (required)
 * @param {string} infrastructureAddresses.orgDeployerAddress - OrgDeployer contract address
 * @param {string} infrastructureAddresses.registryAddress - Universal Registry address
 */
export async function main(
    memberTypeNames,
    executivePermissionNames,
    POname,
    quadraticVotingEnabled,
    democracyVoteWeight,
    participationVoteWeight,
    hybridVotingEnabled,
    participationVotingEnabled,
    electionEnabled,
    educationHubEnabled,
    logoURL,
    infoIPFSHash,
    votingControlType,
    quorumPercentageDD,
    quorumPercentagePV,
    username,
    wallet,
    customRoles = null,
    infrastructureAddresses = {}
  ) {
    // Validate infrastructure addresses - these must be fetched from subgraph
    const orgDeployerAddress = infrastructureAddresses.orgDeployerAddress;
    const registryAddress = infrastructureAddresses.registryAddress;

    if (!orgDeployerAddress) {
      throw new Error("OrgDeployer address not found. Please ensure the subgraph is synced and returning infrastructure addresses.");
    }
    if (!registryAddress) {
      throw new Error("Registry address not found. Please ensure the subgraph is synced and returning infrastructure addresses.");
    }

    console.log("Creating new DAO with OrgDeployer...");

    // Validate wallet/signer
    if (!wallet) {
      throw new Error("Wallet/signer is required. Please connect your wallet first.");
    }

    // Get deployer address - ethers signers may need getAddress()
    let deployerAddress;
    try {
      deployerAddress = wallet.address || (await wallet.getAddress());
      if (!deployerAddress) {
        throw new Error("Could not get wallet address");
      }
    } catch (err) {
      throw new Error(`Failed to get deployer address from wallet: ${err.message}`);
    }

    console.log("Deployer address:", deployerAddress);
    console.log("Input parameters:", {
      memberTypeNames,
      executivePermissionNames,
      POname,
      quadraticVotingEnabled,
      democracyVoteWeight,
      participationVoteWeight,
      hybridVotingEnabled,
      participationVotingEnabled,
      electionEnabled,
      educationHubEnabled,
      logoURL,
      infoIPFSHash,
      votingControlType,
      quorumPercentageDD,
      quorumPercentagePV,
      username,
    });

    // Generate orgId from name
    const orgId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(POname.toLowerCase().replace(/\s+/g, '-'))
    );
    console.log("Generated orgId:", orgId);

    // Build hybrid voting classes
    const hybridClasses = buildHybridClasses(
      hybridVotingEnabled,
      quadraticVotingEnabled,
      democracyVoteWeight,
      participationVoteWeight
    );

    // Build roles - use customRoles if provided, otherwise generate from member types
    const roles = customRoles || buildRoles(memberTypeNames, executivePermissionNames);

    // Build role assignments
    const roleAssignments = buildRoleAssignments(memberTypeNames, executivePermissionNames);

    // Construct DeploymentParams
    // Convert IPFS CID to bytes32 sha256 digest for the contract
    // If no CID provided, uses zero hash (valid per contract)
    const metadataHash = cidToBytes32(infoIPFSHash);
    console.log("Metadata hash from CID:", { cid: infoIPFSHash, metadataHash });

    const deploymentParams = {
      orgId: orgId,
      orgName: POname,
      metadataHash: metadataHash,
      registryAddr: registryAddress,
      deployerAddress: deployerAddress,
      deployerUsername: username || "",
      autoUpgrade: true,
      hybridQuorumPct: quorumPercentagePV || 50,
      ddQuorumPct: quorumPercentageDD || 50,
      hybridClasses: hybridClasses,
      ddInitialTargets: [],
      roles: roles,
      roleAssignments: roleAssignments,
      // Passkey support (boolean - matches deployed contract v1.0.1)
      passkeyEnabled: false,
      // Education hub configuration
      educationHubConfig: {
        enabled: educationHubEnabled || false,
      },
    };

    console.log("Deploying new DAO with the following parameters:", deploymentParams);
    console.log("OrgDeployer address:", orgDeployerAddress);
    console.log("OrgDeployer ABI loaded:", Array.isArray(OrgDeployer) ? `${OrgDeployer.length} entries` : typeof OrgDeployer);

    // Debug: Log detailed role structure
    console.log("=== ROLES DETAIL ===");
    console.log("Using customRoles:", customRoles !== null);
    deploymentParams.roles.forEach((role, idx) => {
      console.log(`Role [${idx}]:`, JSON.stringify(role, (key, value) => {
        // Handle BigNumber serialization
        if (value && value._isBigNumber) {
          return `BigNumber(${value.toString()})`;
        }
        return value;
      }, 2));
    });

    const orgDeployer = new ethers.Contract(orgDeployerAddress, OrgDeployer, wallet);
    console.log("OrgDeployer contract instance created");

    try {
      // Verify the contract is deployed and accessible
      console.log("=== CONTRACT VERIFICATION ===");
      try {
        const version = await orgDeployer.VERSION();
        console.log("OrgDeployer VERSION:", version);
      } catch (versionErr) {
        console.error("Failed to get VERSION - contract may not be deployed correctly:", versionErr.message);
      }

      try {
        const hatsAddr = await orgDeployer.hats();
        console.log("Hats contract address:", hatsAddr);
      } catch (hatsErr) {
        console.error("Failed to get hats address:", hatsErr.message);
      }

      // First, try a static call to get the revert reason if it would fail
      console.log("Testing deployment with staticCall...");
      try {
        await orgDeployer.callStatic.deployFullOrg(deploymentParams, {
          gasLimit: 25000000,
        });
        console.log("staticCall succeeded - proceeding with actual transaction");
      } catch (staticError) {
        console.error("staticCall failed - transaction would revert:", staticError);
        // Try to extract the revert reason
        if (staticError.reason) {
          console.error("Revert reason:", staticError.reason);
        }
        if (staticError.errorName) {
          console.error("Error name:", staticError.errorName);
        }
        if (staticError.errorArgs) {
          console.error("Error args:", staticError.errorArgs);
        }
        // Log the full error object for debugging
        console.error("Full error details:", JSON.stringify(staticError, Object.getOwnPropertyNames(staticError), 2));
        throw staticError;
      }

      // Check wallet balance before attempting transaction
      const balance = await wallet.getBalance();
      const gasPrice = await wallet.getGasPrice();
      const estimatedCost = gasPrice.mul(25000000);
      console.log("Wallet balance:", ethers.utils.formatEther(balance), "ETH");
      console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
      console.log("Estimated max cost:", ethers.utils.formatEther(estimatedCost), "ETH");

      if (balance.lt(estimatedCost)) {
        console.error("WARNING: Wallet balance may be insufficient for transaction!");
      }

      // Estimate gas first to get actual requirement
      console.log("Estimating gas...");
      let estimatedGas;
      try {
        estimatedGas = await orgDeployer.estimateGas.deployFullOrg(deploymentParams);
        console.log("Estimated gas:", estimatedGas.toString());
      } catch (estimateError) {
        console.error("Gas estimation failed:", estimateError);
        // Fallback to high limit
        estimatedGas = ethers.BigNumber.from(25000000);
      }

      // Add 20% buffer to estimated gas
      const gasLimitWithBuffer = estimatedGas.mul(120).div(100);
      console.log("Gas limit with buffer:", gasLimitWithBuffer.toString());

      console.log("Sending transaction...");
      let tx;
      try {
        tx = await orgDeployer.deployFullOrg(deploymentParams, {
          gasLimit: gasLimitWithBuffer,
        });
      } catch (txError) {
        console.error("Transaction send failed:", txError);
        console.error("Error code:", txError.code);
        console.error("Error message:", txError.message);
        if (txError.error) {
          console.error("Inner error:", txError.error);
        }
        if (txError.transaction) {
          console.error("Transaction data length:", txError.transaction.data?.length);
        }
        throw txError;
      }

      console.log("Transaction sent:", tx.hash);
      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();

      console.log("Deployment transaction was successful!");
      console.log("Transaction hash:", receipt.transactionHash);

      // Parse OrgDeployed event to get contract addresses
      const orgDeployedEvent = receipt.events?.find(e => e.event === 'OrgDeployed');
      if (orgDeployedEvent) {
        console.log("Deployed contracts:", {
          orgId: orgDeployedEvent.args.orgId,
          executor: orgDeployedEvent.args.executor,
          hybridVoting: orgDeployedEvent.args.hybridVoting,
          directDemocracyVoting: orgDeployedEvent.args.directDemocracyVoting,
          quickJoin: orgDeployedEvent.args.quickJoin,
          participationToken: orgDeployedEvent.args.participationToken,
          taskManager: orgDeployedEvent.args.taskManager,
          educationHub: orgDeployedEvent.args.educationHub,
          paymentManager: orgDeployedEvent.args.paymentManager,
          eligibilityModule: orgDeployedEvent.args.eligibilityModule,
          toggleModule: orgDeployedEvent.args.toggleModule,
          topHatId: orgDeployedEvent.args.topHatId?.toString(),
          roleHatIds: orgDeployedEvent.args.roleHatIds?.map(id => id.toString()),
        });
      }

      return {
        receipt,
        orgId,
        contracts: orgDeployedEvent?.args || {},
      };
    } catch (error) {
      console.error("An error occurred during deployment:", error);
      throw error;
    }
  }

// Helper: Build hybrid voting classes
function buildHybridClasses(hybridEnabled, quadratic, ddWeight, ptWeight) {
  if (!hybridEnabled) {
    // Pure direct democracy - single DIRECT class
    return [{
      strategy: 0, // DIRECT (1-person-1-vote based on hat)
      slicePct: 100,
      quadratic: false,
      minBalance: 0,
      asset: ethers.constants.AddressZero,
      hatIds: [],
    }];
  }

  // Hybrid: DIRECT + ERC20_BAL
  return [
    {
      strategy: 0, // DIRECT
      slicePct: ddWeight || 50,
      quadratic: false,
      minBalance: 0,
      asset: ethers.constants.AddressZero,
      hatIds: [],
    },
    {
      strategy: 1, // ERC20_BAL (ParticipationToken)
      slicePct: ptWeight || 50,
      quadratic: quadratic || false,
      minBalance: ethers.utils.parseEther("1"),
      asset: ethers.constants.AddressZero, // Will use org's ParticipationToken
      hatIds: [],
    },
  ];
}

// Helper: Build roles from member types
function buildRoles(memberTypes, executiveRoles) {
  // Find the top-level admin role index (first executive, or first role if no executives)
  const topLevelRoleIndex = executiveRoles.length > 0
    ? Math.max(0, memberTypes.indexOf(executiveRoles[0]))
    : 0;

  return memberTypes.map((name, idx) => {
    // Determine adminRoleIndex:
    // - Top-level role uses type(uint256).max (ethers.constants.MaxUint256)
    // - All other roles point to the top-level role
    // NOTE: Self-referential admin (adminRoleIndex == idx) is NOT allowed by the contract
    const isTopLevelRole = idx === topLevelRoleIndex;

    return {
      name: name,
      image: "",
      metadataCID: ethers.constants.HashZero, // No metadata for auto-generated roles
      canVote: true,
      vouching: {
        enabled: false,
        quorum: 0,
        voucherRoleIndex: 0,
        combineWithHierarchy: false,
      },
      defaults: {
        eligible: true,
        standing: true,
      },
      hierarchy: {
        // type(uint256).max means "use ELIGIBILITY_ADMIN hat as parent" (top-level role)
        // Other roles point to the top-level admin role index
        adminRoleIndex: isTopLevelRole
          ? ethers.constants.MaxUint256  // Top-level role
          : topLevelRoleIndex,           // Child roles point to admin
      },
      distribution: {
        mintToDeployer: idx === 0, // Mint first role to deployer
        mintToExecutor: false,
        additionalWearers: [],
      },
      hatConfig: {
        maxSupply: 1000,
        mutableHat: true,
      },
    };
  });
}

// Helper: Build role assignment bitmaps
function buildRoleAssignments(memberTypes, executiveRoles) {
  // Use regular numbers instead of BigInt - safe for small role counts (< 32 roles)
  // BigInt literals (1n, 0n) cannot be JSON-serialized for RPC calls
  const allRolesBitmap = (1 << memberTypes.length) - 1;

  // Find executive role indexes
  let executiveBitmap = 0;
  executiveRoles.forEach(execRole => {
    const idx = memberTypes.indexOf(execRole);
    if (idx !== -1) {
      executiveBitmap |= (1 << idx);
    }
  });

  // If no executives specified, use first role
  if (executiveBitmap === 0) {
    executiveBitmap = 1;
  }

  return {
    quickJoinRolesBitmap: 1, // Only first role (MEMBER) can quick join
    tokenMemberRolesBitmap: allRolesBitmap, // All roles can hold tokens
    tokenApproverRolesBitmap: executiveBitmap, // Executives can approve token requests
    taskCreatorRolesBitmap: allRolesBitmap, // All roles can create tasks
    educationCreatorRolesBitmap: executiveBitmap, // Executives can create education
    educationMemberRolesBitmap: allRolesBitmap, // All roles can access education
    hybridProposalCreatorRolesBitmap: allRolesBitmap, // All roles can create proposals
    ddVotingRolesBitmap: allRolesBitmap, // All roles can vote in DD
    ddCreatorRolesBitmap: allRolesBitmap, // All roles can create DD polls
  };
}
