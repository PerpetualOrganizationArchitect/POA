/**
 * Task utility functions for the POA Task Manager
 * Shared across web3Context, TaskBoardContext, and TaskColumn components
 */

/**
 * Parse a task ID from the POP subgraph format.
 * Subgraph format: "taskManagerAddress-taskId"
 * @param {string|number} taskId - The task ID from the subgraph or direct input
 * @returns {string} - The numeric task ID portion for contract calls
 */
export function parseTaskId(taskId) {
    const taskIdStr = taskId.toString();
    return taskIdStr.includes("-") ? taskIdStr.split("-")[1] : taskIdStr;
}

/**
 * Parse a module ID from the POP subgraph format.
 * @param {string|number} moduleId - The module ID from the subgraph
 * @returns {string} - The numeric module ID for contract calls
 */
export function parseModuleId(moduleId) {
    const moduleIdStr = moduleId.toString();
    return moduleIdStr.includes('-') ? moduleIdStr.split('-')[1] : moduleIdStr;
}

/**
 * Difficulty configuration for payout calculation
 * Base payout + (multiplier * estimated hours) = total payout
 */
export const DIFFICULTY_CONFIG = {
    easy: { base: 1, multiplier: 16.5 },
    medium: { base: 4, multiplier: 24 },
    hard: { base: 10, multiplier: 30 },
    veryHard: { base: 25, multiplier: 37.5 },
};

/**
 * Calculate task payout based on difficulty and estimated hours
 * @param {string} difficulty - The difficulty level (easy, medium, hard, veryHard)
 * @param {number} estimatedHours - The estimated hours to complete the task
 * @returns {number} - The calculated payout amount
 */
export function calculatePayout(difficulty, estimatedHours) {
    const config = DIFFICULTY_CONFIG[difficulty];
    if (!config) {
        console.warn(`Unknown difficulty: ${difficulty}, defaulting to medium`);
        return calculatePayout('medium', estimatedHours);
    }
    return Math.round(config.base + config.multiplier * estimatedHours);
}

/**
 * Map subgraph task status to frontend column ID
 */
export const STATUS_TO_COLUMN = {
    'Open': 'open',
    'Assigned': 'inProgress',
    'Submitted': 'inReview',
    'Completed': 'completed',
    'Cancelled': null, // Filtered out
};

/**
 * Map frontend column ID to display title
 */
export const COLUMN_TITLES = {
    'open': 'Open',
    'inProgress': 'In Progress',
    'inReview': 'In Review',
    'completed': 'Completed',
};
