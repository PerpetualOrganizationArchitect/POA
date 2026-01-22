import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { FETCH_PROJECTS_DATA_NEW } from '../util/queries';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { usePOContext } from './POContext';
import { formatTokenAmount } from '../util/formatToken';
import { useRefreshSubscription, RefreshEvent } from './RefreshContext';

const ProjectContext = createContext();

export const useProjectContext = () => useContext(ProjectContext);

const STATUS_TO_COLUMN = {
    'Open': 'Open',
    'Assigned': 'In Progress',
    'Submitted': 'In Review',
    'Completed': 'Completed',
    'Cancelled': null,
};

export const ProjectProvider = ({ children }) => {
    const [projectsData, setProjectsData] = useState([]);
    const [taskCount, setTaskCount] = useState(0);
    const [recommendedTasks, setRecommendedTasks] = useState([]);
    const { address } = useAccount();
    const { orgId } = usePOContext();

    const router = useRouter();

    const { data, loading, error, refetch } = useQuery(FETCH_PROJECTS_DATA_NEW, {
        variables: { orgId: orgId },
        skip: !orgId,
        fetchPolicy: 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });

    // Handle refresh events from Web3 transactions
    const handleRefresh = useCallback(() => {
        console.log('[ProjectContext] Refresh triggered, refetching projects data...');
        if (orgId && refetch) {
            // Small delay to allow subgraph to index the new data
            setTimeout(() => {
                refetch();
            }, 2000);
        }
    }, [orgId, refetch]);

    // Subscribe to project and task events
    useRefreshSubscription(
        [
            RefreshEvent.PROJECT_CREATED,
            RefreshEvent.PROJECT_DELETED,
            RefreshEvent.TASK_CREATED,
            RefreshEvent.TASK_CLAIMED,
            RefreshEvent.TASK_SUBMITTED,
            RefreshEvent.TASK_COMPLETED,
            RefreshEvent.TASK_UPDATED,
            RefreshEvent.TASK_CANCELLED,
        ],
        handleRefresh,
        [handleRefresh]
    );

    useEffect(() => {
        if (data?.organization?.taskManager) {
            const projects = data.organization.taskManager.projects || [];

            let totalTasks = 0;
            projects.forEach(project => {
                project.tasks?.forEach(task => {
                    if (task.status !== 'Cancelled') totalTasks++;
                });
            });
            setTaskCount(totalTasks);

            // Get recommended tasks (open tasks, randomly sorted)
            const openTasks = projects
                .flatMap(project =>
                    (project.tasks || [])
                        .filter(task => task.status === 'Open')
                        .map(task => {
                            const taskPayout = formatTokenAmount(task.payout || '0');
                            return {
                                ...task,
                                title: task.title || 'Indexing...',
                                name: task.title || 'Indexing...', // Alias for TaskManager components
                                description: '', // In IPFS
                                difficulty: 'medium', // Default
                                estHours: 1, // Default
                                payout: taskPayout,
                                Payout: taskPayout,
                                kubixPayout: taskPayout,
                                projectId: project.id,
                                projectTitle: project.title,
                                isIndexing: !task.title,
                            };
                        })
                )
                .sort(() => Math.random() - 0.5);
            setRecommendedTasks(openTasks);

            // Transform projects for kanban board
            const transformedProjects = projects.map(project => {
                const projectTitle = project.title || 'Indexing...';
                const transformedProject = {
                    id: project.id,
                    title: projectTitle,
                    name: projectTitle, // Alias for TaskManager components
                    metadataHash: project.metadataHash,
                    cap: project.cap,
                    rolePermissions: project.rolePermissions || [],
                    columns: [
                        { id: 'open', title: 'Open', tasks: [] },
                        { id: 'inProgress', title: 'In Progress', tasks: [] },
                        { id: 'inReview', title: 'In Review', tasks: [] },
                        { id: 'completed', title: 'Completed', tasks: [] },
                    ],
                };

                (project.tasks || []).forEach(task => {
                    if (task.status === 'Cancelled') return;

                    const taskTitle = task.title || 'Indexing...';
                    const taskPayout = formatTokenAmount(task.payout || '0');
                    const transformedTask = {
                        id: task.id,
                        taskId: task.taskId,
                        title: taskTitle,
                        name: taskTitle, // Alias for TaskManager components
                        // Description, difficulty, estHours are in IPFS - provide placeholders
                        description: '', // Fetched from IPFS via metadataHash
                        difficulty: 'medium', // Default - could be fetched from IPFS
                        estHours: 1, // Default - could be fetched from IPFS
                        metadataHash: task.metadataHash,
                        claimedBy: task.assignee || '',
                        payout: taskPayout,
                        Payout: taskPayout, // Alias with capital P for TaskCard
                        kubixPayout: taskPayout, // Alias for TaskColumn
                        bountyToken: task.bountyToken,
                        bountyPayout: formatTokenAmount(task.bountyPayout || '0'),
                        projectId: project.id,
                        status: task.status,
                        claimerUsername: task.assigneeUsername || '',
                        completerUsername: task.completerUsername || '',
                        requiresApplication: task.requiresApplication,
                        applications: task.applications || [],
                        isIndexing: !task.title,
                        createdAt: task.createdAt,
                        assignedAt: task.assignedAt,
                        submittedAt: task.submittedAt,
                        completedAt: task.completedAt,
                    };

                    const columnTitle = STATUS_TO_COLUMN[task.status] || 'Open';
                    const column = transformedProject.columns.find(c => c.title === columnTitle);
                    if (column) {
                        column.tasks.push(transformedTask);
                    }
                });

                return transformedProject;
            });

            setProjectsData(transformedProjects);
        }
    }, [data]);

    const contextValue = useMemo(() => ({
        projectsData,
        taskCount,
        recommendedTasks,
        loading,
        error,
    }), [projectsData, taskCount, recommendedTasks, loading, error]);

    return (
        <ProjectContext.Provider value={contextValue}>
            {children}
        </ProjectContext.Provider>
    );
};
