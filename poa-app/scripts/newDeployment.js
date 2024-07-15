const MasterDeployfactory = require("../abi/MasterFactory.json");

const { ethers } = require("ethers");

// sepoila const masterDeployFactoryAddress = "0xDBdf5B0532827917eFFd55439c05B4dB0e471205";
const masterDeployFactoryAddress = "0x2002EdBe40A9c3650B6b037159872C69a3E56324";

export async function main(
    memberTypeNames,
    executivePermissionNames,
    POname,
    quadraticVotingEnabled,
    democracyVoteWeight,
    participationVoteWeight,
    hybridVotingEnabled,
    participationVotingEnabled,
    logoURL,
    infoIPFSHash,
    votingControlType,
    quorumPercentageDD,
    quorumPercentagePV,
    username,
    wallet
  ){

    console.log("Creating new DAO...");
    console.log("these variables", memberTypeNames, executivePermissionNames, POname, quadraticVotingEnabled, democracyVoteWeight, participationVoteWeight, hybridVotingEnabled, participationVotingEnabled, logoURL, infoIPFSHash, votingControlType, quorumPercentageDD, quorumPercentagePV, wallet)

    let contractNames = [];
    if (hybridVotingEnabled) {
        contractNames = [
          "NFTMembership",
          "DirectDemocracyToken",
          "ParticipationToken",
          "Treasury",
          "DirectDemocracyVoting",
          "HybridVoting",
          "TaskManager",
          "QuickJoin",
        ];
      } else if (participationVotingEnabled) {
        contractNames = [
          "NFTMembership",
          "DirectDemocracyToken",
          "ParticipationToken",
          "Treasury",
          "DirectDemocracyVoting",
          "ParticipationVoting",
          "TaskManager",
          "QuickJoin",
        ]
        } else {
          contractNames = [
            "NFTMembership",
            "DirectDemocracyToken",
            "ParticipationToken",
            "Treasury",
            "DirectDemocracyVoting",
            "NoVoting",
            "TaskManager",
            "QuickJoin",
          ];
      }

    const params = {
        memberTypeNames,
        executivePermissionNames,
        POname,
        quadraticVotingEnabled,
        democracyVoteWeight: ethers.BigNumber.from(democracyVoteWeight),
        participationVoteWeight: ethers.BigNumber.from(participationVoteWeight),
        hybridVotingEnabled,
        participationVotingEnabled,
        logoURL,
        infoIPFSHash,
        votingControlType,
        contractNames,
        quorumPercentageDD: ethers.BigNumber.from(quorumPercentageDD),
        quorumPercentagePV: ethers.BigNumber.from(quorumPercentagePV),
        username
    };

    console.log("Deploying new DAO with the following parameters:");
    console.log(params);


    const masterDeployer = new ethers.Contract(masterDeployFactoryAddress, MasterDeployfactory.abi, wallet);
    const gasLimit = ethers.utils.hexlify(14700000); 

    const options = {
        gasLimit: gasLimit,
    };

    try {
        const tx = await masterDeployer.deployAll(params, options);
        const receipt = await tx.wait();

        console.log("Deployment transaction was successful!");
        console.log("Transaction hash:", receipt.transactionHash);
    } catch (error) {
        console.error("An error occurred during deployment:", error);
    }
}