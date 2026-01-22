import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { useAccount } from 'wagmi';
import { FETCH_USER_DATA_NEW, FETCH_TOKEN_APPROVER_HATS } from '../util/queries';
import { useRouter } from 'next/router';
import { usePOContext } from './POContext';
import { formatTokenAmount } from '../util/formatToken';
import { useRefresh } from './RefreshContext';

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const { address } = useAccount();
    const router = useRouter();
    const { userDAO } = router.query;
    const { orgId, roleHatIds, participationTokenAddress } = usePOContext();

    const [userData, setUserData] = useState({});
    const [graphUsername, setGraphUsername] = useState('');
    const [hasExecRole, setHasExecRole] = useState(false);
    const [hasMemberRole, setHasMemberRole] = useState(false);
    const [hasApproverRole, setHasApproverRole] = useState(false);
    const [claimedTasks, setClaimedTasks] = useState([]);
    const [userProposals, setUserProposals] = useState([]);
    const [completedModules, setCompletedModules] = useState([]);
    const [userDataLoading, setUserDataLoading] = useState(true);

    const [account, setAccount] = useState(null);

    useEffect(() => {
        if (address) {
            setAccount(address.toLowerCase());
        }
    }, [address]);

    // Construct the org-specific user ID
    const orgUserID = orgId && account ? `${orgId}-${account}` : null;

    const { data, error, loading, refetch } = useQuery(FETCH_USER_DATA_NEW, {
        variables: {
            orgUserID: orgUserID,
            userAddress: account,
        },
        skip: !orgUserID || !account,
        fetchPolicy: 'cache-first',
    });

    // Query approver hats for the participation token
    const { data: approverHatsData } = useQuery(FETCH_TOKEN_APPROVER_HATS, {
        variables: { tokenAddress: participationTokenAddress },
        skip: !participationTokenAddress,
        fetchPolicy: 'cache-first',
    });

    // Subscribe to role:claimed event to refetch user data
    const { subscribe } = useRefresh();

    const refetchUserData = useCallback(() => {
        if (orgUserID && account) {
            refetch();
        }
    }, [refetch, orgUserID, account]);

    useEffect(() => {
        const unsubscribe = subscribe('role:claimed', () => {
            // Wait for subgraph to index, then refetch user data
            setTimeout(() => {
                refetchUserData();
            }, 1000);
        });
        return unsubscribe;
    }, [subscribe, refetchUserData]);

    // Subscribe to username_changed event to refetch user data
    useEffect(() => {
        const unsubscribe = subscribe('user:username_changed', () => {
            // Wait for subgraph to index, then refetch user data
            setTimeout(() => {
                refetchUserData();
            }, 1000);
        });
        return unsubscribe;
    }, [subscribe, refetchUserData]);

    useEffect(() => {
        if (data) {
            const { user, account: accountData } = data;

            setGraphUsername(accountData?.username || '');
            // Check both that user exists AND has Active membership status
            const isActiveMember = user && user.membershipStatus === 'Active';
            setHasMemberRole(isActiveMember);

            if (user) {
                // Executive check: second role hat is typically executive
                const userHatIds = user.currentHatIds || [];
                const execHatId = roleHatIds?.[1];
                setHasExecRole(execHatId && userHatIds.includes(execHatId));

                // Approver check: user wears any hat with Approver permission on ParticipationToken
                const approverHatIds = (approverHatsData?.hatPermissions || []).map(p => p.hatId);
                const isApprover = approverHatIds.some(hatId => userHatIds.includes(hatId));
                setHasApproverRole(isApprover);

                setUserData({
                    id: user.id,
                    address: user.address,
                    participationTokenBalance: formatTokenAmount(user.participationTokenBalance || '0'),
                    hatIds: userHatIds,
                    tasksCompleted: user.totalTasksCompleted || 0,
                    totalVotes: user.totalVotes || 0,
                    firstSeenAt: user.firstSeenAt || null,
                    membershipStatus: user.membershipStatus,
                    completedTasks: (user.completedTasks || []).map(task => ({
                        id: task.id,
                        taskId: task.taskId,
                        title: task.title,
                        payout: formatTokenAmount(task.payout || '0'),
                        status: 'Completed',
                    })),
                });

                setClaimedTasks((user.assignedTasks || []).map(task => ({
                    id: task.id,
                    taskId: task.taskId,
                    title: task.title,
                    payout: formatTokenAmount(task.payout || '0'),
                    status: task.status,
                })));

                setCompletedModules((user.modulesCompleted || []).map(m => ({
                    moduleId: m.moduleId,
                    completedAt: m.completedAt,
                })));

                const proposals = user.hybridProposalsCreated || [];
                setUserProposals(proposals.map(p => ({
                    id: p.id,
                    proposalId: p.proposalId,
                    title: p.title,
                    type: 'Hybrid',
                    startTimestamp: p.startTimestamp,
                    endTimestamp: p.endTimestamp,
                    status: p.status,
                })).sort((a, b) => {
                    const aCompleted = a.status !== 'Active';
                    const bCompleted = b.status !== 'Active';
                    if (aCompleted && !bCompleted) return 1;
                    if (!aCompleted && bCompleted) return -1;
                    return parseInt(a.endTimestamp) - parseInt(b.endTimestamp);
                }));
            } else {
                setHasExecRole(false);
                setHasApproverRole(false);
                setUserData({});
                setClaimedTasks([]);
                setCompletedModules([]);
                setUserProposals([]);
            }

            setUserDataLoading(false);
        }
    }, [data, roleHatIds, approverHatsData]);

    useEffect(() => {
        if (!orgId && userDAO) {
            setUserDataLoading(true);
        }
    }, [orgId, userDAO]);

    useEffect(() => {
        if (!account && !loading) {
            setUserDataLoading(false);
        }
    }, [account, loading]);

    const contextValue = useMemo(() => ({
        userDataLoading,
        userProposals,
        userData,
        graphUsername,
        setGraphUsername,
        hasExecRole,
        hasMemberRole,
        hasApproverRole,
        claimedTasks,
        completedModules,
        error,
        refetchUserData,
    }), [
        userDataLoading,
        userProposals,
        userData,
        graphUsername,
        setGraphUsername,
        hasExecRole,
        hasMemberRole,
        hasApproverRole,
        claimedTasks,
        completedModules,
        error,
        refetchUserData,
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};
