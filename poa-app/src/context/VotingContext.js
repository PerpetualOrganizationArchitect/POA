import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_VOTING_DATA_NEW } from '../util/queries';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { usePOContext } from './POContext';
import { useRefreshSubscription, RefreshEvent } from './RefreshContext';

const VotingContext = createContext();

export const useVotingContext = () => useContext(VotingContext);

function transformProposal(proposal, votingTypeId, type, quorum = 0) {
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = parseInt(proposal.endTimestamp) || 0;
    const isOngoing = proposal.status === 'Active' && endTime > currentTime;

    // Aggregate votes per option - different logic for Hybrid vs DD
    const optionVotes = {};
    let totalVotes = 0;

    if (type === 'Hybrid') {
        // For Hybrid voting, use classRawPowers to calculate weighted voting power
        (proposal.votes || []).forEach(vote => {
            // Sum all class powers for this voter (BigInt handling)
            const classRawPowers = vote.classRawPowers || [];
            const votePower = classRawPowers.reduce((sum, p) => {
                const powerValue = typeof p === 'string' ? BigInt(p) : BigInt(p || 0);
                return sum + powerValue;
            }, BigInt(0));

            // Apply vote weights to each selected option
            (vote.optionIndexes || []).forEach((optionIndex, i) => {
                const weight = vote.optionWeights?.[i] ?? 100;
                // Calculate power contribution: (votePower * weight) / 100
                const optionPower = (votePower * BigInt(weight)) / BigInt(100);
                const current = optionVotes[optionIndex] || BigInt(0);
                optionVotes[optionIndex] = current + optionPower;
            });

            totalVotes += Number(votePower);
        });

        // Convert BigInt to Number for display
        Object.keys(optionVotes).forEach(k => {
            optionVotes[k] = Number(optionVotes[k]);
        });
    } else {
        // For Direct Democracy, simple 1-person-1-vote with weight distribution
        (proposal.votes || []).forEach(vote => {
            (vote.optionIndexes || []).forEach((optionIndex, i) => {
                const weight = vote.optionWeights?.[i] ?? 100;
                optionVotes[optionIndex] = (optionVotes[optionIndex] || 0) + weight;
            });
            totalVotes += 100; // Each voter contributes 100 points total
        });
    }

    // Create options array
    const options = [];
    const totalOptionVotes = Object.values(optionVotes).reduce((sum, v) => sum + v, 0);
    for (let i = 0; i < (proposal.numOptions || 2); i++) {
        const votes = optionVotes[i] || 0;
        options.push({
            id: `${proposal.id}-option-${i}`,
            name: `Option ${i + 1}`,
            votes: votes,
            percentage: totalOptionVotes > 0 ? (votes / totalOptionVotes) * 100 : 0,
            currentPercentage: totalOptionVotes > 0 ? Math.round((votes / totalOptionVotes) * 100) : 0,
        });
    }

    // Parse winningOption as number (comes as BigInt string from subgraph)
    const winningOptionNum = proposal.winningOption !== null && proposal.winningOption !== undefined
        ? parseInt(proposal.winningOption, 10)
        : null;

    return {
        id: proposal.id,
        proposalId: proposal.proposalId,
        title: proposal.title || 'Indexing...',
        descriptionHash: proposal.descriptionHash,
        startTimestamp: proposal.startTimestamp,
        endTimestamp: proposal.endTimestamp,
        winningOption: winningOptionNum,
        isValid: proposal.isValid,
        wasExecuted: proposal.wasExecuted,
        status: proposal.status,
        isOngoing,
        options,
        totalVotes,
        votes: proposal.votes || [],
        votingTypeId,
        type,
        quorum,
        isHatRestricted: proposal.isHatRestricted,
        restrictedHatIds: proposal.restrictedHatIds || [],
    };
}

export const VotingProvider = ({ children }) => {
    const [hybridVotingOngoing, setHybridVotingOngoing] = useState([]);
    const [hybridVotingCompleted, setHybridVotingCompleted] = useState([]);
    const [democracyVotingOngoing, setDemocracyVotingOngoing] = useState([]);
    const [democracyVotingCompleted, setDemocracyVotingCompleted] = useState([]);
    const [ongoingPolls, setOngoingPolls] = useState([]);
    const [votingType, setVotingType] = useState('Hybrid');
    const [votingClasses, setVotingClasses] = useState([]);

    const { address } = useAccount();
    const router = useRouter();
    const { orgId } = usePOContext();

    const { data, loading, error, refetch } = useQuery(FETCH_VOTING_DATA_NEW, {
        variables: { orgId: orgId },
        skip: !orgId,
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
    });

    // Memoize refetch handler for stable reference
    const handleRefresh = useCallback(() => {
        if (orgId) {
            console.log('VotingContext: Refreshing voting data');
            refetch();
        }
    }, [orgId, refetch]);

    // Subscribe to refresh events from Web3Context
    useRefreshSubscription(
        [RefreshEvent.ALL, RefreshEvent.PROPOSAL_CREATED, RefreshEvent.PROPOSAL_VOTED, RefreshEvent.PROPOSAL_COMPLETED],
        handleRefresh,
        [handleRefresh]
    );

    useEffect(() => {
        if (data?.organization) {
            const org = data.organization;

            if (org.hybridVoting) {
                setVotingType('Hybrid');
            } else if (org.directDemocracyVoting) {
                setVotingType('Direct Democracy');
            }

            // Process Hybrid Voting proposals and classes
            if (org.hybridVoting) {
                const hybridQuorum = org.hybridVoting.quorum || 0;
                const hybridProposals = (org.hybridVoting.proposals || []).map(p =>
                    transformProposal(p, org.hybridVoting.id, 'Hybrid', hybridQuorum)
                );
                setHybridVotingOngoing(hybridProposals.filter(p => p.isOngoing));
                setHybridVotingCompleted(hybridProposals.filter(p => !p.isOngoing));

                // Process voting classes - convert to usable format
                console.log('[VotingContext] Raw voting classes from subgraph:', org.hybridVoting.votingClasses);
                const classes = (org.hybridVoting.votingClasses || []).map(c => ({
                    classIndex: c.classIndex,
                    strategy: c.strategy,
                    slicePct: c.slicePct,
                    quadratic: c.quadratic,
                    minBalance: c.minBalance?.toString() || '0',
                    asset: c.asset,
                    hatIds: (c.hatIds || []).map(h => h.toString()),
                }));
                console.log('[VotingContext] Processed voting classes:', classes);
                setVotingClasses(classes);
            } else {
                setHybridVotingOngoing([]);
                setHybridVotingCompleted([]);
                setVotingClasses([]);
            }

            // Process Direct Democracy Voting proposals
            if (org.directDemocracyVoting) {
                const ddQuorum = org.directDemocracyVoting.quorumPercentage || 0;
                const ddProposals = (org.directDemocracyVoting.ddvProposals || []).map(p =>
                    transformProposal(p, org.directDemocracyVoting.id, 'Direct Democracy', ddQuorum)
                );
                setDemocracyVotingOngoing(ddProposals.filter(p => p.isOngoing));
                setDemocracyVotingCompleted(ddProposals.filter(p => !p.isOngoing));
            } else {
                setDemocracyVotingOngoing([]);
                setDemocracyVotingCompleted([]);
            }

            // Combine all ongoing polls
            const allOngoing = [
                ...(org.hybridVoting?.proposals || []).map(p =>
                    transformProposal(p, org.hybridVoting?.id, 'Hybrid', org.hybridVoting?.quorum || 0)
                ).filter(p => p.isOngoing),
                ...(org.directDemocracyVoting?.ddvProposals || []).map(p =>
                    transformProposal(p, org.directDemocracyVoting?.id, 'Direct Democracy', org.directDemocracyVoting?.quorumPercentage || 0)
                ).filter(p => p.isOngoing),
            ];
            setOngoingPolls(allOngoing);
        }
    }, [data]);

    const contextValue = useMemo(() => ({
        hybridVotingOngoing,
        hybridVotingCompleted,
        democracyVotingOngoing,
        democracyVotingCompleted,
        loading,
        error,
        ongoingPolls,
        votingType,
        votingClasses,
        refetch,
    }), [
        hybridVotingOngoing,
        hybridVotingCompleted,
        democracyVotingOngoing,
        democracyVotingCompleted,
        loading,
        error,
        ongoingPolls,
        votingType,
        votingClasses,
        refetch,
    ]);

    return (
        <VotingContext.Provider value={contextValue}>
            {children}
        </VotingContext.Provider>
    );
};
