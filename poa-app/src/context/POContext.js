import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_ORG_BY_NAME, FETCH_ORG_FULL_DATA } from '../util/queries';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { formatTokenAmount } from '../util/formatToken';
import { useRefreshSubscription, RefreshEvent } from './RefreshContext';

const POContext = createContext();

export const usePOContext = () => useContext(POContext);

// Zero address constant - educationHub.id will be this when edu hub is disabled
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Transform users array to leaderboard format
function transformLeaderboardData(users, roleHatIds) {
    if (!users || !Array.isArray(users)) {
        console.log('transformLeaderboardData: No users or not an array', users);
        return [];
    }
    console.log('transformLeaderboardData: Processing', users.length, 'users');
    // Debug: Log first user's participationTokenBalance
    if (users.length > 0) {
        console.log('transformLeaderboardData: First user raw balance:', users[0].participationTokenBalance, 'type:', typeof users[0].participationTokenBalance);
    }
    return users.map(user => {
        const rawBalance = user.participationTokenBalance;
        const formattedBalance = formatTokenAmount(rawBalance || '0');
        return {
            id: user.id,
            address: user.address,
            name: user.username || user.address?.slice(0, 8) + '...',
            hasUsername: !!user.username,
            token: formattedBalance,
            // Derive role from hat IDs - first hat is typically the primary role
            hatIds: user.currentHatIds || [],
            totalTasksCompleted: parseInt(user.totalTasksCompleted, 10) || 0,
            totalVotes: parseInt(user.totalVotes, 10) || 0,
        };
    });
}

// Transform education modules from new schema
function transformEducationModules(modules) {
    if (!modules || !Array.isArray(modules)) {
        return [];
    }
    return modules.map(module => ({
        id: module.id,
        moduleId: module.moduleId,
        name: module.title || 'Indexing...',
        ipfsHash: module.contentHash,
        payout: formatTokenAmount(module.payout || '0'),
        status: module.status,
        // Content from IPFS needs to be fetched separately
        isIndexing: !module.contentHash,
        description: 'Module content loading from IPFS...',
        link: '',
        question: '',
        answers: [],
        completions: module.completions || [],
        // For backward compatibility
        completetions: module.completions || [],
    }));
}

export const POProvider = ({ children }) => {
    const { address } = useAccount();
    const router = useRouter();
    const poName = router.query.userDAO || '';

    // Organization data state
    const [orgId, setOrgId] = useState(null);
    const [poDescription, setPODescription] = useState('No description provided or IPFS content still being indexed');
    const [poLinks, setPOLinks] = useState({});
    const [logoHash, setLogoHash] = useState('');
    const [poMembers, setPoMembers] = useState(0);
    const [activeTaskAmount, setActiveTaskAmount] = useState(0);
    const [completedTaskAmount, setCompletedTaskAmount] = useState(0);
    const [ptTokenBalance, setPtTokenBalance] = useState(0);

    // Contract addresses
    const [quickJoinContractAddress, setQuickJoinContractAddress] = useState('');
    const [treasuryContractAddress, setTreasuryContractAddress] = useState('');
    const [taskManagerContractAddress, setTaskManagerContractAddress] = useState('');
    const [hybridVotingContractAddress, setHybridVotingContractAddress] = useState('');
    const [participationVotingContractAddress, setParticipationVotingContractAddress] = useState('');
    const [directDemocracyVotingContractAddress, setDirectDemocracyVotingContractAddress] = useState('');
    const [ddTokenContractAddress, setDDTokenContractAddress] = useState('');
    const [nftMembershipContractAddress, setNFTMembershipContractAddress] = useState('');
    const [votingContractAddress, setVotingContractAddress] = useState('');
    const [educationHubAddress, setEducationHubAddress] = useState('');
    const [executorContractAddress, setExecutorContractAddress] = useState('');
    const [participationTokenAddress, setParticipationTokenAddress] = useState('');

    // Derived data
    const [leaderboardData, setLeaderboardData] = useState([]);

    // Filtered leaderboard for display (only users with registered usernames)
    const leaderboardDisplayData = useMemo(() => {
        return leaderboardData.filter(user => user.hasUsername);
    }, [leaderboardData]);

    const [poContextLoading, setPoContextLoading] = useState(true);
    const [rules, setRules] = useState(null);
    const [educationModules, setEducationModules] = useState([]);
    const [roleHatIds, setRoleHatIds] = useState([]);
    const [topHatId, setTopHatId] = useState(null);
    const [creatorHatIds, setCreatorHatIds] = useState([]);
    const [educationHubEnabled, setEducationHubEnabled] = useState(false);
    const [roleNames, setRoleNames] = useState({});

    const [account, setAccount] = useState('0x00');

    useEffect(() => {
        if (address) {
            setAccount(address);
        }
    }, [address]);

    // Step 1: Look up org by name to get bytes ID
    const { data: orgLookupData, loading: orgLookupLoading, error: orgLookupError } = useQuery(GET_ORG_BY_NAME, {
        variables: { name: poName },
        skip: !poName,
        fetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data?.organizations?.[0]) {
                console.log('Found org ID:', data.organizations[0].id);
                setOrgId(data.organizations[0].id);
            }
        },
    });

    // Step 2: Fetch full org data using bytes ID
    const { data: orgData, loading: orgDataLoading, error: orgDataError, refetch: refetchOrgData } = useQuery(FETCH_ORG_FULL_DATA, {
        variables: { orgId: orgId },
        skip: !orgId,
        fetchPolicy: 'cache-and-network',
        onCompleted: () => {
            console.log('Org data query completed successfully');
        },
    });

    // Handle refresh events from Web3 transactions
    const handleRefresh = useCallback(() => {
        console.log('[POContext] Refresh triggered, refetching org data...');
        if (orgId && refetchOrgData) {
            // Small delay to allow subgraph to index the new data
            setTimeout(() => {
                refetchOrgData();
            }, 2000);
        }
    }, [orgId, refetchOrgData]);

    // Subscribe to relevant events
    useRefreshSubscription(
        [
            RefreshEvent.MEMBER_JOINED,
            RefreshEvent.MODULE_CREATED,
            RefreshEvent.MODULE_COMPLETED,
            RefreshEvent.TASK_COMPLETED, // Updates user stats
        ],
        handleRefresh,
        [handleRefresh]
    );

    // Process org data when available
    useEffect(() => {
        if (orgData?.organization) {
            const org = orgData.organization;

            // Basic org info
            setLogoHash(org.metadataHash || '');
            setPoMembers(org.users?.length || 0);
            setPtTokenBalance(formatTokenAmount(org.participationToken?.totalSupply || '0'));
            setTopHatId(org.topHatId);
            setRoleHatIds(org.roleHatIds || []);
            setCreatorHatIds(org.taskManager?.creatorHatIds || []);

            // Build role names map from roles data
            if (org.roles && Array.isArray(org.roles)) {
                const names = {};
                org.roles.forEach((role, index) => {
                    const hatId = role.hatId;
                    // Priority: role.name (from RolesCreated event) > role.hat.name (from IPFS) > fallback
                    const name = role.name || role.hat?.name || `Role ${index + 1}`;
                    names[hatId] = name;
                    // Also store with normalized string key for comparison
                    names[String(hatId)] = name;
                });
                setRoleNames(names);
            }

            // Contract addresses
            setQuickJoinContractAddress(org.quickJoin?.id || '');
            setTaskManagerContractAddress(org.taskManager?.id || '');
            setHybridVotingContractAddress(org.hybridVoting?.id || '');
            setDirectDemocracyVotingContractAddress(org.directDemocracyVoting?.id || '');
            const eduHubId = org.educationHub?.id || '';
            setEducationHubAddress(eduHubId);
            // Education hub is enabled if address exists and is not zero address
            setEducationHubEnabled(eduHubId && eduHubId !== ZERO_ADDRESS);
            setExecutorContractAddress(org.executorContract?.id || '');
            setParticipationTokenAddress(org.participationToken?.id || '');

            // For backward compatibility, map hybrid voting to participation voting
            setParticipationVotingContractAddress(org.hybridVoting?.id || '');
            setVotingContractAddress(org.hybridVoting?.id || '');

            // Deprecated in POP - set to empty
            setTreasuryContractAddress(org.executorContract?.id || ''); // Executor replaces Treasury
            setDDTokenContractAddress(''); // No separate DD token in POP
            setNFTMembershipContractAddress(''); // Replaced by Hats Protocol

            // Calculate task counts from taskManager projects
            let activeTasks = 0;
            let completedTasks = 0;

            if (org.taskManager?.projects) {
                org.taskManager.projects.forEach(project => {
                    project.tasks?.forEach(task => {
                        if (task.status === 'Completed') {
                            completedTasks++;
                        } else if (task.status !== 'Cancelled') {
                            // Open, Assigned, Submitted are all "active"
                            activeTasks++;
                        }
                    });
                });
            }

            setActiveTaskAmount(activeTasks);
            setCompletedTaskAmount(completedTasks);

            // Process education modules
            const modules = org.educationHub?.modules || [];
            setEducationModules(transformEducationModules(modules));

            // Transform leaderboard data
            setLeaderboardData(transformLeaderboardData(org.users, org.roleHatIds));

            // Rules configuration (for backward compatibility)
            setRules({
                HybridVoting: org.hybridVoting ? {
                    id: org.hybridVoting.id,
                    quorum: org.hybridVoting.quorum,
                } : null,
                DirectDemocracyVoting: org.directDemocracyVoting ? {
                    id: org.directDemocracyVoting.id,
                    quorum: org.directDemocracyVoting.quorumPercentage,
                } : null,
                ParticipationVoting: org.hybridVoting ? {
                    id: org.hybridVoting.id,
                    quorum: org.hybridVoting.quorum,
                } : null,
                NFTMembership: null, // Deprecated
                Treasury: org.executorContract ? {
                    id: org.executorContract.id,
                } : null,
            });

            // Use metadata from subgraph (indexed from IPFS)
            if (org.metadata) {
                setPODescription(org.metadata.description || 'No description provided');
                // Transform links array to object format for compatibility
                if (org.metadata.links && org.metadata.links.length > 0) {
                    const linksObj = {};
                    org.metadata.links.forEach(link => {
                        linksObj[link.name] = link.url;
                    });
                    setPOLinks(linksObj);
                }
            } else if (org.metadataHash) {
                // Metadata not yet indexed, show loading state
                setPODescription('Organization description loading from IPFS...');
            }

            setPoContextLoading(false);
        }
    }, [orgData]);

    // Combined loading and error states
    const loading = orgLookupLoading || orgDataLoading;
    const error = orgLookupError || orgDataError;

    // Handle case where org not found
    useEffect(() => {
        if (orgLookupData && !orgLookupData.organizations?.[0] && !orgLookupLoading) {
            console.warn(`Organization "${poName}" not found in subgraph`);
            setPoContextLoading(false);
        }
    }, [orgLookupData, orgLookupLoading, poName]);

    const contextValue = useMemo(() => ({
        // Organization info
        orgId,
        poDescription,
        poLinks,
        logoHash,
        poMembers,
        activeTaskAmount,
        completedTaskAmount,
        ptTokenBalance,

        // Contract addresses
        quickJoinContractAddress,
        treasuryContractAddress,
        taskManagerContractAddress,
        hybridVotingContractAddress,
        participationVotingContractAddress,
        directDemocracyVotingContractAddress,
        ddTokenContractAddress,
        nftMembershipContractAddress,
        votingContractAddress,
        educationHubAddress,
        executorContractAddress,
        participationTokenAddress,

        // Derived data
        loading,
        error,
        leaderboardData,
        leaderboardDisplayData,
        poContextLoading,
        rules,
        educationModules,

        // New POP-specific data
        roleHatIds,
        topHatId,
        creatorHatIds,
        educationHubEnabled,
        roleNames,
    }), [
        orgId,
        poDescription,
        poLinks,
        logoHash,
        poMembers,
        activeTaskAmount,
        completedTaskAmount,
        ptTokenBalance,
        quickJoinContractAddress,
        treasuryContractAddress,
        taskManagerContractAddress,
        hybridVotingContractAddress,
        participationVotingContractAddress,
        directDemocracyVotingContractAddress,
        ddTokenContractAddress,
        nftMembershipContractAddress,
        votingContractAddress,
        educationHubAddress,
        executorContractAddress,
        participationTokenAddress,
        loading,
        error,
        leaderboardData,
        leaderboardDisplayData,
        poContextLoading,
        rules,
        educationModules,
        roleHatIds,
        topHatId,
        creatorHatIds,
        educationHubEnabled,
        roleNames,
    ]);

    return (
        <POContext.Provider value={contextValue}>
            {error && <div>Error: {error.message}</div>}
            {children}
        </POContext.Provider>
    );
};
